# KrakenD — API Gateway

Gateway que enruta las peticiones del frontend a los microservicios internos.

## Puerto

`8080`

## Endpoints configurados

| Método | Ruta | Backend |
|---|---|---|
| POST | /api/auth/users/login | ms-users:3001/users/login |
| POST | /api/auth/users | ms-users:3001/users |
| GET | /api/auth/users | ms-users:3001/users |
| GET | /api/auth/users/{id} | ms-users:3001/users/{id} |
| POST | /api/waitlist | ms-waitlist:3000/waitlist |
| GET | /api/waitlist | ms-waitlist:3000/waitlist |
| GET | /api/waitlist/mine | ms-waitlist:3000/waitlist/mine |
| PATCH | /api/waitlist/{id} | ms-waitlist:3000/waitlist/{id} |

## Configuración

Archivo `krakend.json`. Los headers `Authorization` se pasan a los backends de waitlist mediante `input_headers` y `headers_to_pass`.

CORS configurado para `http://localhost:4321` (frontend en Docker) y `http://rednorte.local` (frontend en Kubernetes).

En Kubernetes la configuración se inyecta mediante ConfigMap. Ver `k8s/krakend/` para los manifiestos.

## Levantar

### Docker Compose
```bash
docker-compose up --build krakend
```

### Kubernetes
```bash
kubectl apply -k k8s/
kubectl port-forward -n rednorte service/krakend 8083:8080
```
