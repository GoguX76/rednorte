# ms-waitlist

Microservicio encargado de la gestión de la lista de espera hospitalaria de la plataforma del Servicio Público de Salud RedNorte. Permite agregar pacientes a la cola, consultar los pacientes en espera, actualizar su estado y consultar los turnos del usuario autenticado. Es consumido a través del API Gateway (KrakenD).

## Ficha técnica

| Categoría | Detalle |
|---|---|
| **Lenguaje** | TypeScript 5 |
| **Runtime** | Bun 1.3 |
| **Framework** | Hono 4 |
| **Base de datos** | PostgreSQL 16 |
| **Driver BD** | [`postgres`](https://github.com/porsager/postgres) (cliente SQL nativo) |
| **Autenticación** | `@hono/jwt` (middleware JWT HS256) |
| **Mensajería** | `amqplib` (RabbitMQ, estado cambiado → notificación) |
| **Patrones de diseño** | Repository Pattern, Service Layer, Controller, Centralized Error Handler, JWT Middleware |

## Estructura del proyecto

```
backend/ms-waitlist/
├── src/
│   ├── index.ts                      # Punto de entrada, define el servidor en el puerto 3000
│   ├── models/
│   │   └── waitlist.ts               # Interfaz WaitlistEntry y tipo WaitlistStatus
│   ├── routes/
│   │   └── waitlist_routes.ts        # Definición de rutas HTTP
│   ├── controllers/
│   │   └── waitlist_controller.ts    # Manejo de request/response HTTP
│   ├── services/
│   │   └── waitlist_service.ts       # Lógica de negocio y validaciones
│   ├── repositories/
│   │   └── waitlist_repository.ts    # Queries SQL a PostgreSQL
│   └── db/
│       ├── connection.ts             # Pool de conexión a la base de datos
│       └── migrate.ts                # Ejecutor de migraciones SQL
└── migrations/
    └── 0001_initial_waitlist_schema.sql  # Schema inicial: tabla waitlist_entries
```

## Variables de entorno

| Variable | Descripción | Valor en Docker |
|---|---|---|
| `DATABASE_URL` | Cadena de conexión a PostgreSQL | `postgres://root:rootpassword@db-waitlist:5432/waitlist_db` |
| `PORT` | Puerto en que corre el servicio | `3000` |

## Base de datos

- **Contenedor**: `postgres-waitlist`
- **Imagen**: `postgres:16-alpine`
- **Puerto expuesto**: `5433` (mapeado al `5432` interno del contenedor)
- **Nombre de la DB**: `waitlist_db`
- **Usuario**: `root`
- **Volumen**: `pgdata_waitlist`

### Tabla principal

**`waitlist_entries`** — cada fila representa un paciente en la lista de espera:

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `SERIAL` | Identificador autoincremental |
| `user_id` | `VARCHAR` | UUID del usuario vinculado (de ms-users) |
| `priority` | `INTEGER` | Nivel de prioridad del 1 (menor) al 4 (mayor) |
| `status` | `VARCHAR` | Estado actual del paciente en la lista |
| `reason` | `TEXT` | Motivo de la consulta (mínimo 5 caracteres) |
| `created_at` | `TIMESTAMP` | Fecha de ingreso a la lista |

### Estados válidos (`WaitlistStatus`)

| Estado | Descripción |
|---|---|
| `waiting` | Paciente en espera |
| `attending` | Paciente siendo atendido |
| `finished` | Atención finalizada |
| `cancelled` | Entrada cancelada |

## Endpoints

Base URL (interna, accesible a través de KrakenD): `http://ms-waitlist:3000`

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| `POST` | `/waitlist` | Agregar paciente a la lista | JWT |
| `GET` | `/waitlist` | Obtener pacientes con estado `waiting` | JWT |
| `GET` | `/waitlist/mine` | Obtener los turnos del usuario autenticado | JWT |
| `PATCH` | `/waitlist/:id` | Actualizar estado de un paciente | JWT |
| `GET` | `/health` | Health check del servicio | No |

> La autenticación JWT se valida mediante middleware `hono/jwt` directamente en el microservicio.

### Ejemplos de request/response

**POST `/waitlist`** — Agregar paciente
```json
// Request
{
  "userId": "eb44c160-247c-48a4-abf7-22342f6222dd",
  "priority": 3,
  "reason": "Dolor crónico en rodilla derecha"
}

// Response 201
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": "eb44c160-247c-48a4-abf7-22342f6222dd",
    "priority": 3,
    "status": "waiting",
    "reason": "Dolor crónico en rodilla derecha",
    "created_at": "2026-05-19T10:00:00.000Z"
  }
}
```

**GET `/waitlist`** — Consultar lista
```json
// Response 200
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": "eb44c160-...",
      "priority": 3,
      "status": "waiting",
      "reason": "Dolor crónico en rodilla derecha",
      "created_at": "2026-05-19T10:00:00.000Z"
    }
  ]
}
```

**PATCH `/waitlist/:id`** — Actualizar estado
```json
// Request
{
  "newStatus": "attending"
}

// Response 200
{
  "success": true,
  "data": {
    "id": 1,
    "status": "attending",
    ...
  }
}
```

### Validaciones del servicio

- `priority` debe ser un número entre 1 y 4 (inclusive)
- `reason` no puede estar vacío ni tener menos de 5 caracteres
- `userId` es obligatorio
- `newStatus` en PATCH debe ser uno de los 4 estados válidos

## Ejecución con Docker

```bash
docker-compose up --build ms-waitlist
```

Para levantarlo junto a su base de datos únicamente:

```bash
docker-compose up --build db-waitlist ms-waitlist
```

## Ejecución local (sin Docker)

```bash
cd backend/ms-waitlist
bun install
bun run --watch src/index.ts
```

> Requiere una instancia de PostgreSQL accesible y la variable `DATABASE_URL` configurada.

## Tests

```bash
bun test                     # Ejecutar tests
bun run test:coverage        # Tests con cobertura
```

Cobertura actual: **94.67% líneas**, **87.04% funciones**.