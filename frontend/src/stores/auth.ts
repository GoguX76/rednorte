import { atom } from 'nanostores';

/**
 * Representación pública de un usuario autenticado.
 *
 * Solo contiene los datos seguros que se almacenan en el token JWT
 * y se exponen en el frontend (sin password ni datos sensibles).
 */
export type User = {
  /** UUID único del usuario */
  id: string;
  /** Correo electrónico del usuario */
  email: string;
  /** UUID del rol asignado al usuario */
  role_id: string;
};

/** Store atómico que almacena el token JWT de la sesión actual. */
export const $token = atom<string | null>(null);

/** Store atómico que almacena los datos del usuario autenticado. */
export const $user = atom<User | null>(null);

/**
 * Establece la sesión de un usuario autenticado.
 *
 * Actualiza ambos stores (token y datos del usuario) y persiste
 * la sesión en `localStorage` para que sobreviva recargas de página.
 *
 * @param token - Token JWT generado por el backend
 * @param user - Datos públicos del usuario (id, email, role_id)
 */
export function login(token: string, user: User): void {
  $token.set(token);
  $user.set(user);
}

/**
 * Cierra la sesión del usuario actual.
 *
 * Limpia ambos stores y elimina los datos de `localStorage`.
 */
export function logout(): void {
  $token.set(null);
  $user.set(null);
}

/**
 * Inicializa el estado de autenticación desde `localStorage`.
 *
 * Se ejecuta al cargar la aplicación para recuperar la sesión
 * previamente guardada. Si no hay datos válidos, los stores
 * permanecen en `null` (usuario no autenticado).
 */
export function initAuth(): void {
  if (typeof localStorage === 'undefined') return;
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  if (token && user) {
    $token.set(token);
    $user.set(JSON.parse(user));
  }
}
