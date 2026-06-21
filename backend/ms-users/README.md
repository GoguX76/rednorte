# ms-users

Microservicio encargado de la gestión de usuarios de la plataforma del Servicio Público de Salud RedNorte. Maneja el registro, autenticación y consulta de usuarios, exponiendo una API REST consumida a través del API Gateway (KrakenD).

## Ficha técnica

| Categoría | Detalle |
|---|---|
| **Lenguaje** | TypeScript 5 |
| **Runtime** | Bun 1.3 |
| **Framework** | Hono 4 |
| **Base de datos** | PostgreSQL 16 |
| **Driver BD** | [`postgres`](https://github.com/porsager/postgres) (cliente SQL nativo) |
| **Autenticación** | `jsonwebtoken` (JWT HS256) + `Bun.password` (Argon2) |
| **IDs** | `uuid` (v4) |
| **Patrones de diseño** | Repository Pattern, Service Layer, Controller, Centralized Error Handler |

## Estructura del proyecto

```
backend/ms-users/
├── src/
│   ├── index.ts                  # Punto de entrada, define el servidor en el puerto 3001
│   ├── models/
│   │   └── user.ts               # Interfaz TypeScript UserEntry
│   ├── routes/
│   │   └── user_routes.ts        # Definición de rutas HTTP
│   ├── controllers/
│   │   └── user_controller.ts    # Manejo de request/response HTTP
│   ├── services/
│   │   └── user_service.ts       # Lógica de negocio (validaciones, hash, JWT)
│   ├── repositories/
│   │   └── user_repository.ts    # Queries SQL a PostgreSQL
│   └── db/
│       ├── connection.ts         # Pool de conexión a la base de datos
│       └── migrate.ts            # Ejecutor de migraciones SQL
└── migrations/
    └── 0001_initial_schema.sql   # Schema inicial: tablas users y roles
```

## Variables de entorno

| Variable | Descripción | Valor en Docker |
|---|---|---|
| `DATABASE_URL` | Cadena de conexión a PostgreSQL | `postgres://root:rootpassword@db-users:5432/users_db` |
| `PORT` | Puerto en que corre el servicio | `3001` |
| `JWT_SECRET` | Clave para firmar tokens JWT | `clave_secreta_desarrollo` |

> ⚠️ En producción, reemplaza `JWT_SECRET` por una clave segura y nunca la subas al repositorio.

## Base de datos

- **Contenedor**: `postgres-users`
- **Imagen**: `postgres:16-alpine`
- **Puerto expuesto**: `5432`
- **Nombre de la DB**: `users_db`
- **Usuario**: `root`
- **Volumen**: `pgdata_users`

### Tablas principales

**`roles`** — define los roles del sistema (`patient`, `admin`, etc.)

**`users`** — almacena los datos de cada usuario registrado:

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `UUID` | Identificador único generado con `uuid` |
| `first_name` | `VARCHAR` | Nombre del usuario |
| `last_name` | `VARCHAR` | Apellido (opcional) |
| `email` | `VARCHAR` | Correo único |
| `password` | `VARCHAR` | Contraseña hasheada con Argon2 |
| `role_id` | `FK → roles` | Rol asignado al usuario |
| `is_verified` | `BOOLEAN` | Cuenta verificada |
| `created_at` | `TIMESTAMP` | Fecha de creación |

## Endpoints

Base URL (interna, accesible a través de KrakenD): `http://ms-users:3001`

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| `POST` | `/users` | Registrar nuevo usuario | No |
| `POST` | `/users/login` | Iniciar sesión, retorna JWT | No |
| `GET` | `/users` | Listar todos los usuarios | No |
| `GET` | `/users/:id` | Obtener usuario por ID | No |
| `GET` | `/` | Health check del servicio | No |

### Ejemplos de request/response

**POST `/users`** — Registro
```json
// Request
{
  "first_name": "Juan",
  "last_name": "Pérez",
  "email": "juan@rednorte.com",
  "password": "mipassword123"
}

// Response 201
{
  "success": true,
  "data": {
    "id": "eb44c160-247c-48a4-abf7-22342f6222dd",
    "first_name": "Juan",
    "email": "juan@rednorte.com"
  }
}
```

**POST `/users/login`** — Login
```json
// Request
{
  "email": "juan@rednorte.com",
  "password": "mipassword123"
}

// Response 200
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "eb44c160-247c-48a4-abf7-22342f6222dd",
      "email": "juan@rednorte.com",
      "role_id": "rol_patient"
    }
  }
}
```

## Ejecución con Docker

Este servicio se levanta junto al resto del sistema desde la raíz del proyecto:

```bash
docker-compose up --build ms-users
```

Para levantarlo junto a su base de datos únicamente:

```bash
docker-compose up --build db-users ms-users
```

## Ejecución local (sin Docker)

```bash
cd backend/ms-users
bun install
bun run --watch src/index.ts
```

> Requiere una instancia de PostgreSQL accesible y la variable `DATABASE_URL` configurada.

## Tests

```bash
bun test                     # Ejecutar tests
bun run test:coverage        # Tests con cobertura
```

Cobertura actual: **98.43% líneas**, **96.88% funciones**.