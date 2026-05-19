# bff (Backend for Frontend)

Capa intermedia del sistema RedNorte que actúa como punto de entrada único para el frontend. Se encarga de proteger las rutas con autenticación JWT, simplificar la comunicación con los microservicios internos y centralizar la lógica de acceso a la API.

## Tecnologías

| Tecnología | Uso |
|---|---|
| [Bun](https://bun.sh/) | Runtime y gestor de paquetes |
| [Hono](https://hono.dev/) | Framework HTTP |
| TypeScript | Lenguaje principal |
| `hono/jwt` | Middleware de validación de JWT en rutas protegidas |
| `hono/cors` | Middleware CORS para permitir peticiones desde el frontend |

## Estructura del proyecto

```
bff/
└── src/
    ├── index.ts                      # Punto de entrada, registra routers y middlewares
    ├── routes/
    │   ├── auth_routes.ts            # Rutas públicas de autenticación
    │   └── waitlist_routes.ts        # Rutas protegidas de lista de espera (JWT)
    ├── controllers/
    │   ├── auth_controller.ts        # Handlers HTTP para autenticación
    │   └── waitlist_controller.ts    # Handlers HTTP para lista de espera
    └── services/
        ├── auth_client.ts            # Cliente HTTP hacia ms-users
        └── waitlist_client.ts        # Cliente HTTP hacia ms-waitlist
```

## Variables de entorno

| Variable | Descripción | Valor en Docker |
|---|---|---|
| `JWT_SECRET` | Clave para verificar tokens JWT | `clave_secreta_desarrollo` |

> ⚠️ Esta clave debe ser **idéntica** a la usada en `ms-users` para firmar los tokens. En producción usa una clave segura en ambos servicios.

## CORS

El BFF solo acepta peticiones desde el frontend en desarrollo:

```
Origin permitido: http://localhost:4321
Credentials: true
```

Si cambias el puerto del frontend, actualiza esta configuración en `src/index.ts`.

## Endpoints

Base URL (pública, accesible desde el frontend): `http://localhost:8080`

### Autenticación — `/api/auth` (sin JWT)

| Método | Ruta completa | Descripción | Reenvía a |
|---|---|---|---|
| `POST` | `/api/auth/users/login` | Iniciar sesión | `ms-users POST /users/login` |
| `POST` | `/api/auth/users` | Registrar usuario | `ms-users POST /users` |
| `GET` | `/api/auth/users` | Listar usuarios | `ms-users GET /users` |
| `GET` | `/api/auth/users/:id` | Obtener usuario por ID | `ms-users GET /users/:id` |

### Lista de espera — `/api/waitlist` (requiere JWT)

| Método | Ruta completa | Descripción | Reenvía a |
|---|---|---|---|
| `POST` | `/api/waitlist` | Agregar paciente | `ms-waitlist POST /waitlist` |
| `GET` | `/api/waitlist` | Consultar lista | `ms-waitlist GET /waitlist` |
| `PATCH` | `/api/waitlist/:id` | Actualizar estado | `ms-waitlist PATCH /waitlist/:id` |

### Cómo usar el JWT

1. Hacer login en `POST /api/auth/users/login` y guardar el `token` de la respuesta.
2. En cada petición a `/api/waitlist`, incluir el header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Si el token es inválido, expiró o no se envía, el BFF responde automáticamente con `401 Unauthorized`.

## Comunicación interna

El BFF se comunica con los microservicios usando sus nombres de contenedor Docker como hostname:

| Servicio | URL interna |
|---|---|
| ms-users | `http://ms-users:3001` |
| ms-waitlist | `http://ms-waitlist:3000` |

Estas URLs están definidas en `src/services/auth_client.ts` y `src/services/waitlist_client.ts`.

## Dependencias Docker

El BFF declara `depends_on` sobre `ms-users` y `ms-waitlist`, por lo que Docker Compose espera que ambos contenedores estén activos antes de iniciar el BFF.

## Ejecución con Docker

```bash
docker-compose up --build bff
```

Para levantar el sistema completo (recomendado):

```bash
docker-compose up --build
```

## Ejecución local (sin Docker)

```bash
cd bff
bun install
bun run dev
```

> Requiere que `ms-users` y `ms-waitlist` estén corriendo y accesibles. Ajusta las URLs en los archivos de `services/` si no usas Docker.