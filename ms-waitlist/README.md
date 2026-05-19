# ms-waitlist

Microservicio encargado de la gestión de la lista de espera médica del sistema RedNorte. Permite agregar pacientes a la cola, consultar los pacientes en espera y actualizar su estado. Es consumido exclusivamente por el BFF.

## Tecnologías

| Tecnología | Uso |
|---|---|
| [Bun](https://bun.sh/) | Runtime y gestor de paquetes |
| [Hono](https://hono.dev/) | Framework HTTP |
| TypeScript | Lenguaje principal |
| PostgreSQL 16 | Base de datos relacional |
| [`postgres`](https://github.com/porsager/postgres) | Driver nativo de PostgreSQL para Bun |

## Estructura del proyecto

```
ms-waitlist/
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

Base URL (interna, solo accesible desde el BFF): `http://ms-waitlist:3000`

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| `POST` | `/waitlist` | Agregar paciente a la lista | No |
| `GET` | `/waitlist` | Obtener pacientes con estado `waiting` | No |
| `PATCH` | `/waitlist/:id` | Actualizar estado de un paciente | No |
| `GET` | `/health` | Health check del servicio | No |

> Este servicio no tiene autenticación propia. La protección JWT la aplica el BFF antes de reenviar las peticiones.

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
cd ms-waitlist
bun install
bun run --watch src/index.ts
```

> Requiere una instancia de PostgreSQL accesible y la variable `DATABASE_URL` configurada.