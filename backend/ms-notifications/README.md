# ms-notifications

Microservicio de notificaciones en tiempo real. Escucha eventos de RabbitMQ y los entrega al usuario vía WebSocket.

## Ficha técnica

| Categoría | Detalle |
|---|---|
| **Lenguaje** | TypeScript 5 |
| **Runtime** | Bun 1.3 |
| **Framework** | Hono 4 (HTTP) + `Bun.serve` (WebSocket) |
| **Base de datos** | PostgreSQL 16 |
| **Driver BD** | [`postgres`](https://github.com/porsager/postgres) (cliente SQL nativo) |
| **Mensajería** | `amqplib` (RabbitMQ, consumidor de eventos) |
| **Tiempo real** | WebSocket nativo de Bun (sin librería externa) |
| **Patrones de diseño** | Repository Pattern, Service Layer, Observer (RabbitMQ → WebSocket), Connection Manager (Map userId → WS) |

## Estructura

```
backend/ms-notifications/
├── src/
│   ├── index.ts              # Servidor HTTP + WebSocket
│   ├── rabbitmq/
│   │   └── consumer.ts       # Consumidor de RabbitMQ
│   ├── websocket/
│   │   └── connectionManager.ts  # Map userId → WebSocket
│   ├── services/
│   │   └── notification_service.ts  # Lógica de negocio
│   ├── repository/
│   │   └── notification_repository.ts  # Queries SQL
│   └── db/
│       ├── connection.ts
│       └── migrate.ts
└── migrations/
    └── 0001_initial_notifications_schema.sql
```

## Variables de entorno

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Conexión a PostgreSQL |
| `PORT` | Puerto del servicio (3002) |
| `RABBITMQ_URL` | Conexión a RabbitMQ |

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/health` | Health check |
| WebSocket | `/ws?userId=<id>` | Conexión WebSocket para notificaciones |

## Flujo

```
ms-waitlist → RabbitMQ → ms-notifications (consumer)
                                   ↓
                              Guarda en DB
                                   ↓
                         WebSocket → Frontend
```

## Ejecución con Docker

```bash
docker-compose up --build ms-notifications
```

Para levantarlo junto a su base de datos y RabbitMQ:

```bash
docker-compose up --build notifications-db rabbitmq ms-notifications
```

## Ejecución local (sin Docker)

```bash
cd backend/ms-notifications
bun install
bun run --watch src/index.ts
```

> Requiere instancias de PostgreSQL y RabbitMQ accesibles, y las variables `DATABASE_URL` y `RABBITMQ_URL` configuradas.

## Tests

```bash
bun test                # Ejecutar tests
bun run test:coverage   # Tests con cobertura
```

Cobertura actual: **99.35% líneas**, **100% funciones**.
