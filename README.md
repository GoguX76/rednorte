# RedNorte — Servicio Público de Salud

Plataforma inteligente para la gestión de listas de espera hospitalarias, basada en microservicios.

## Requisitos previos

- Docker y Docker Compose
- [Bun](https://bun.sh) 1.3+
- Node.js 20+ (solo para frontend)
- `kubectl` y un clúster Kubernetes (kind, minikube o remoto)

## Estructura del proyecto

```
rednorte/
├── backend/
│   ├── bff/              # API Gateway KrakenD
│   ├── ms-users/         # Autenticación y usuarios
│   ├── ms-waitlist/      # Gestión de lista de espera
│   └── ms-notifications/ # Notificaciones WebSocket
├── frontend/             # Astro + Preact + Tailwind
├── k8s/                  # Manifiestos Kubernetes (Kustomize)
├── scripts/              # Scripts de despliegue
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

## Despliegue con Kubernetes

```bash
# 1. Construir imágenes
docker build -t rednorte/ms-users:latest        ./backend/ms-users
docker build -t rednorte/ms-waitlist:latest     ./backend/ms-waitlist
docker build -t rednorte/ms-notifications:latest ./backend/ms-notifications
docker build \
  --build-arg PUBLIC_API_URL=http://localhost:8083/api \
  --build-arg PUBLIC_WS_URL=ws://localhost:3002/ws \
  -t rednorte/frontend:latest ./frontend

# 2. Desplegar todo
kubectl apply -k k8s/

# 3. Reiniciar frontend para que tome la nueva imagen
kubectl rollout restart deployment/frontend -n rednorte

# 4. Esperar que los pods estén listos
kubectl wait --for=condition=ready pods \
  -l 'app in (frontend, krakend, ms-users, ms-waitlist, ms-notifications)' \
  -n rednorte --timeout=180s
kubectl wait --for=condition=ready pods \
  -l 'app in (postgres-users, postgres-waitlist, notifications-postgres, rabbitmq)' \
  -n rednorte --timeout=120s

# 5. Port-forwards (en terminales separadas)
kubectl port-forward -n rednorte service/frontend 4321:80
kubectl port-forward -n rednorte service/krakend 8083:8080
kubectl port-forward -n rednorte service/ms-notifications 3002:3002
```

También puedes usar los scripts automatizados:
```bash
./scripts/deploy-k8s.sh    # Linux / Mac
./scripts/deploy-k8s.ps1   # Windows
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
