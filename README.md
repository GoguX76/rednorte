# RedNorte — Servicio Público de Salud

Plataforma inteligente para la gestión de listas de espera hospitalarias, basada en microservicios.

## Requisitos previos

- Docker y Docker Compose
- [Bun](https://bun.sh) 1.3+
- Node.js 20+ (solo para frontend)

## Estructura del proyecto

```
rednorte/
├── backend/
│   ├── bff/              # API Gateway KrakenD
│   ├── ms-users/         # Autenticación y usuarios
│   ├── ms-waitlist/      # Gestión de lista de espera
│   └── ms-notifications/ # Notificaciones WebSocket
├── frontend/             # Astro + Preact + Tailwind
├── docs/                 # Documentación y diagramas
└── docker-compose.yml
```

## Servicios

| Servicio | Puerto | Descripción |
|---|---|---|
| frontend | 4321 | Web (Astro + Preact) |
| bff | 8080 | API Gateway (KrakenD) |
| ms-users | 3001 | Usuarios y autenticación |
| ms-waitlist | 3000 | Gestión de lista de espera |
| ms-notifications | 3002 | Notificaciones vía WebSocket |

## Cómo ejecutar

```bash
# 1. Clonar
git clone https://github.com/GoguX76/rednorte
cd rednorte

# 2. Copiar variables de entorno
cp .env.example .env

# 3. Levantar todo (backend + gateway + rabbitmq)
docker compose up --build

# 4. Frontend (por separado, fuera de Docker)
cd frontend && bun install && bun run dev
```

### Servicios individuales

```bash
docker compose up --build db-users ms-users                  # Solo ms-users + su BD
docker compose up --build db-waitlist ms-waitlist            # Solo ms-waitlist + su BD
docker compose up --build notifications-db rabbitmq ms-notifications  # Solo notificaciones
docker compose up --build krakend                             # Solo API Gateway
```

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| POST | /api/auth/users/login | Login |
| POST | /api/auth/users | Registro |
| GET | /api/auth/users | Lista usuarios |
| GET | /api/auth/users/{id} | Obtener usuario por ID |
| POST | /api/waitlist | Agregar a lista |
| GET | /api/waitlist | Lista de espera |
| GET | /api/waitlist/mine | Mis turnos |
| PATCH | /api/waitlist/:id | Cambiar estado |

Las rutas de `/api/waitlist` requieren header `Authorization: Bearer <token>`.

## Tests

```bash
cd backend/ms-waitlist && bun test
cd backend/ms-users && bun test
cd backend/ms-notifications && bun test
cd frontend && bun run test
```

## Cobertura

```bash
cd backend/ms-waitlist && bun run test:coverage
cd backend/ms-users && bun run test:coverage
cd backend/ms-notifications && bun run test:coverage
cd frontend && bun run coverage
```

Los reportes HTML se abren en el navegador desde:

- `docs/coverage-ms-users/index.html`
- `docs/coverage-ms-waitlist/index.html`
- `docs/coverage-ms-notifications/index.html`
- `frontend/coverage/index.html`
