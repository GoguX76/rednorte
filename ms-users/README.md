# ms-users

Microservicio encargado de la gestión de usuarios del sistema RedNorte. Maneja el registro, autenticación y consulta de usuarios, exponiendo una API REST interna consumida exclusivamente por el BFF.

## Tecnologías

| Tecnología | Uso |
|---|---|
| [Bun](https://bun.sh/) | Runtime y gestor de paquetes |
| [Hono](https://hono.dev/) | Framework HTTP |
| TypeScript | Lenguaje principal |
| PostgreSQL 16 | Base de datos relacional |
| [`postgres`](https://github.com/porsager/postgres) | Driver nativo de PostgreSQL para Bun |
| `jsonwebtoken` | Generación de tokens JWT al hacer login |
| `Bun.password` | Hash y verificación de contraseñas (Argon2) |
| `uuid` | Generación de IDs únicos para usuarios |

## Estructura del proyecto

```
ms-users/
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
| `is_active` | `BOOLEAN` | Estado de la cuenta |
| `created_at` | `TIMESTAMP` | Fecha de creación |

## Endpoints

Base URL (interna, solo accesible desde el BFF): `http://ms-users:3001`

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
      "role_id": "patient"
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
cd ms-users
bun install
bun run --watch src/index.ts
```

> Requiere una instancia de PostgreSQL accesible y la variable `DATABASE_URL` configurada.