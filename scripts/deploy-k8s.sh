#!/usr/bin/env bash
set -euo pipefail

echo -e "\033[36m=== Construyendo imagenes Docker ===\033[0m"

docker build -t rednorte/ms-users:latest        ./backend/ms-users

docker build -t rednorte/ms-waitlist:latest     ./backend/ms-waitlist

docker build -t rednorte/ms-notifications:latest ./backend/ms-notifications

docker build \
  --build-arg PUBLIC_API_URL=http://localhost:8083/api \
  --build-arg PUBLIC_WS_URL=ws://localhost:3002/ws \
  -t rednorte/frontend:latest ./frontend

echo -e "\n\033[36m=== Desplegando en Kubernetes ===\033[0m"
kubectl apply -k k8s/

echo -e "\n\033[36m=== Reiniciando frontend para que tome la nueva imagen ===\033[0m"
kubectl rollout restart deployment/frontend -n rednorte

echo -e "\n\033[36m=== Esperando que todos los pods esten listos ===\033[0m"
kubectl wait --for=condition=ready pods \
  -l 'app in (frontend, krakend, ms-users, ms-waitlist, ms-notifications)' \
  -n rednorte --timeout=180s
kubectl wait --for=condition=ready pods \
  -l 'app in (postgres-users, postgres-waitlist, notifications-postgres, rabbitmq)' \
  -n rednorte --timeout=120s

echo -e "\n\033[36m=== Estado final ===\033[0m"
kubectl get pods -n rednorte

echo -e "\n\033[36m=== Cerrando port-forwards anteriores ===\033[0m"
pkill -f "kubectl port-forward.*rednorte" 2>/dev/null || true

echo -e "\n\033[36m=== Abriendo port-forwards ===\033[0m"
kubectl port-forward -n rednorte service/frontend 4321:80 &
kubectl port-forward -n rednorte service/krakend 8083:8080 &
kubectl port-forward -n rednorte service/ms-notifications 3002:3002 &

echo -e "\n\033[32mAccede a la aplicacion en: http://localhost:4321\033[0m"
echo -e "\033[33mEjecuta 'pkill -f \"kubectl port-forward.*rednorte\"' para detener los port-forwards.\033[0m"

wait
