# RedNorte - Sistema de Gestión de Lista de Espera Médica

Sistema de microservicios para la gestión de pacientes y listas de espera en centros de salud. Implementa una arquitectura modular con servicios independientes comunicados a través de un BFF.

## Arquitectura

| Servicio | Descripción | Puerto |
|---|---|---|
| `ms-users` | Gestión de usuarios, registro y autenticación JWT | `3001` |
| `ms-waitlist` | Gestión de lista de espera: agregar, consultar y actualizar estado de pacientes | `3000` |
| `bff` | Backend for Frontend: capa intermedia que protege y agrega los microservicios | `8080` |
| `frontend` | Interfaz web para pacientes y administradores | `4321` |

## Tecnologías

### Backend (ms-users, ms-waitlist, bff)
- **Runtime**: [Bun](https://bun.sh/)
- **Framework HTTP**: [Hono](https://hono.dev/)
- **Lenguaje**: TypeScript
- **Autenticación**: JWT (`jsonwebtoken` en ms-users, middleware `hono/jwt` en el BFF)
- **Hash de contraseñas**: `Bun.password` (argon2)
- **Base de datos**: PostgreSQL (via `postgres` — driver nativo para Bun)
- **Migraciones**: SQL plano ejecutado con script `migrate.ts`

### Infraestructura
- **Orquestación**: Docker + Docker Compose
- **Base de datos ms-users**: PostgreSQL en contenedor `db-users` (puerto `5432`)
- **Base de datos ms-waitlist**: PostgreSQL en contenedor `db-waitlist` (puerto `5433`)

## Cómo ejecutar el proyecto

### Prerrequisitos
- [Docker](https://www.docker.com/get-started), [Docker Compose](https://docs.docker.com/compose/install/ y [Bun](https://bun.com/docs/installation#windows) instalados

### Backend
```bash
# Desde la raiz del proyecto levantar base de datos de ms-users
bun run ms-users/src/db/migrate.ts
# Luego, levantar la base de datos de ms-waitlist
bun run ms-waitlist/src/db/migrate.ts
```
```bash
# Desde la raíz del proyecto
docker-compose up --build
```

### Acceso
| Servicio | URL |
|---|---|
| BFF | http://localhost:8080 |
| ms-users | http://localhost:3001 |
| ms-waitlist | http://localhost:3000 |

## Endpoints principales (BFF)

### Autenticación
| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/auth/users/login` | Iniciar sesión, retorna JWT |
| `POST` | `/api/auth/users` | Registrar nuevo usuario |
| `GET` | `/api/auth/users` | Listar todos los usuarios |
| `GET` | `/api/auth/users/:id` | Obtener usuario por ID |

### Lista de espera (requiere JWT)
| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/waitlist` | Agregar paciente a la lista |
| `GET` | `/api/waitlist` | Consultar lista de espera |
| `PATCH` | `/api/waitlist/:id` | Actualizar estado de un paciente |

> Las rutas de `/api/waitlist` requieren el header `Authorization: Bearer <token>` obtenido en el login.
