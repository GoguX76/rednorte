/**
 * URL base del API Gateway (KrakenD). Se configura mediante la variable
 * de entorno `PUBLIC_API_URL` o usa `localhost:8083/api` por defecto.
 */
const BASE_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:8083/api';

/**
 * Error personalizado para respuestas HTTP no exitosas del API.
 *
 * Se lanza desde {@link request} cuando el servidor responde con
 * un código de estado fuera del rango 2xx.
 */
export class ApiError extends Error {
  /** Código de estado HTTP de la respuesta (ej: 400, 401, 404, 500). */
  status: number;

  /**
   * @param message - Mensaje descriptivo del error retornado por el API
   * @param status - Código de estado HTTP de la respuesta
   */
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/** Opciones de configuración para las solicitudes HTTP. */
type RequestOptions = Omit<RequestInit, 'headers'> & {
  headers?: Record<string, string>;
};

/**
 * Estructura estándar de respuesta del API Gateway.
 *
 * @template T - Tipo del dato contenido en la respuesta
 */
type ApiResponse<T> = {
  /** Indica si la operación fue exitosa */
  success: boolean;
  /** Datos retornados por el endpoint */
  data: T;
};

/**
 * Función auxiliar que ejecuta solicitudes HTTP contra el API Gateway.
 *
 * Inyecta automáticamente el token JWT desde `localStorage` en el
 * header `Authorization` si existe. Parsea la respuesta JSON y extrae
 * el campo `data` del wrapper estándar `{ success, data }`.
 *
 * @template T - Tipo esperado del dato de respuesta
 * @param path - Ruta relativa del endpoint (ej: `/auth/users/login`)
 * @param options - Opciones de `fetch` (método, body, headers extra)
 * @returns La data del campo `data` de la respuesta JSON
 * @throws {ApiError} Si el servidor responde con un código HTTP fuera de rango 2xx
 */
async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const body = await res.json().catch(() => ({ success: false, message: res.statusText }));
  if (!res.ok) {
    throw new ApiError(body.message || 'Error en la solicitud', res.status);
  }
  return body.data as T;
}

/**
 * Representación de un usuario retornada por el API.
 *
 * Se usa tanto en respuestas de autenticación (login/registro)
 * como en el listado de usuarios para el panel de administración.
 */
export type UserResponse = {
  /** UUID único generado por PostgreSQL */
  id: string;
  /** Nombre del usuario */
  first_name: string;
  /** Apellido del usuario (opcional en registro) */
  last_name?: string;
  /** Correo electrónico del usuario (usado como identificador de login) */
  email: string;
  /** UUID del rol asignado al usuario (ej: `admin`, `waitlist`, `attend`) */
  role_id: string;
};

/**
 * Respuesta del endpoint de login.
 *
 * Contiene el token JWT para autenticación y los datos del usuario autenticado.
 */
export type LoginResponse = {
  /** Token JWT para autenticar requests subsiguientes */
  token: string;
  /** Datos del usuario que acaba de iniciar sesión */
  user: UserResponse;
};

/**
 * Entrada de la lista de espera retornada por el API.
 *
 * Representa a un paciente en la cola de espera con su prioridad,
 * estado actual y motivo de consulta.
 */
export type WaitlistEntry = {
  /** ID numérico autoincremental generado por PostgreSQL */
  id: number;
  /** UUID del usuario asociado a esta entrada */
  user_id: string;
  /** Nivel de prioridad: 1 = urgente, 2 = alto, 3 = medio, 4 = bajo */
  priority: number;
  /** Estado actual: `waiting` | `attending` | `finished` | `cancelled` */
  status: string;
  /** Motivo de la consulta médica */
  reason: string;
  /** Timestamp ISO 8601 de creación de la entrada */
  created_at: string;
};

/**
 * Objeto API con los métodos disponibles para interactuar con el backend.
 *
 * Contiene dos namespaces:
 * - `api.auth` para operaciones de autenticación y gestión de usuarios
 * - `api.waitlist` para operaciones sobre la lista de espera
 */
export const api = {
  /** Métodos de autenticación y gestión de usuarios */
  auth: {
    /**
     * Envía credenciales al endpoint de login y retorna un token JWT.
     *
     * @param email - Correo electrónico del usuario
     * @param password - Contraseña en texto plano (se hashea server-side con Argon2)
     * @returns Token JWT y datos del usuario autenticado
     * @throws {ApiError} 401 si las credenciales son incorrectas
     * @throws {ApiError} 400 si faltan campos obligatorios
     */
    login: (email: string, password: string) =>
      request<LoginResponse>('/auth/users/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),

    /**
     * Registra un nuevo usuario en el sistema.
     *
     * @param data - Datos del usuario a registrar
     * @param data.first_name - Nombre del usuario
     * @param data.last_name - Apellido del usuario (opcional)
     * @param data.email - Correo electrónico único
     * @param data.password - Contraseña en texto plano
     * @returns El usuario creado con su UUID generado
     * @throws {ApiError} 400 si el email ya está registrado o faltan campos
     */
    register: (data: { first_name: string; last_name?: string; email: string; password: string }) =>
      request<UserResponse>('/auth/users', { method: 'POST', body: JSON.stringify(data) }),

    /**
     * Obtiene la lista de todos los usuarios registrados.
     *
     * Solo accesible para usuarios con rol `admin` (requiere token JWT).
     *
     * @returns Arreglo de usuarios con sus datos básicos
     * @throws {ApiError} 403 si el usuario autenticado no es administrador
     */
    getUsers: () => request<UserResponse[]>('/auth/users'),

    /**
     * Obtiene los datos de un usuario por su UUID.
     *
     * @param id - UUID del usuario a buscar
     * @returns Datos del usuario encontrado
     * @throws {ApiError} 404 si no existe un usuario con ese ID
     */
    getUserById: (id: string) => request<UserResponse>(`/auth/users/${id}`),
  },

  /** Métodos de gestión de la lista de espera */
  waitlist: {
    /**
     * Obtiene todas las entradas de la lista de espera.
     *
     * Retorna las entradas ordenadas por prioridad (urgente primero)
     * y fecha de creación (más antigua primero).
     *
     * @returns Arreglo de entradas de la lista de espera
     */
    getQueue: () => request<WaitlistEntry[]>('/waitlist'),

    /**
     * Obtiene las entradas de lista de espera del usuario autenticado.
     *
     * Filtra por el `userId` extraído del token JWT.
     *
     * @returns Arreglo de entradas del usuario autenticado
     */
    getMyQueue: () => request<WaitlistEntry[]>('/waitlist/mine'),

    /**
     * Registra un nuevo paciente en la lista de espera.
     *
     * El backend valida que la prioridad esté entre 1 y 4,
     * y que el motivo tenga al menos 5 caracteres.
     *
     * @param data - Datos de la entrada a crear
     * @param data.userId - UUID del usuario a agregar
     * @param data.priority - Nivel de prioridad (1-4)
     * @param data.reason - Motivo de la consulta médica
     * @returns La entrada creada con su ID y estado inicial (`waiting`)
     * @throws {ApiError} 400 si la prioridad o el motivo no son válidos
     */
    addPatient: (data: { userId: string; priority: number; reason: string }) =>
      request<WaitlistEntry>('/waitlist', { method: 'POST', body: JSON.stringify(data) }),

    /**
     * Actualiza el estado de una entrada en la lista de espera.
     *
     * Permite cambiar el estado de un paciente (ej: de `waiting` a `attending`).
     *
     * @param id - ID numérico de la entrada a actualizar
     * @param status - Nuevo estado (`waiting` | `attending` | `finished` | `cancelled`)
     * @returns La entrada actualizada con su nuevo estado
     * @throws {ApiError} 404 si la entrada no existe
     * @throws {ApiError} 400 si el estado no es válido
     */
    updateStatus: (id: number, status: string) =>
      request<WaitlistEntry>(`/waitlist/${id}`, { method: 'PATCH', body: JSON.stringify({ newStatus: status }) }),
  },
};
