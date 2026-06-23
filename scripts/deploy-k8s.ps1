Write-Host "=== Construyendo imagenes Docker ===" -ForegroundColor Cyan

docker build -t rednorte/ms-users:latest        ./backend/ms-users
if ($LASTEXITCODE -ne 0) { exit 1 }

docker build -t rednorte/ms-waitlist:latest     ./backend/ms-waitlist
if ($LASTEXITCODE -ne 0) { exit 1 }

docker build -t rednorte/ms-notifications:latest ./backend/ms-notifications
if ($LASTEXITCODE -ne 0) { exit 1 }

docker build -t rednorte/frontend:latest        ./frontend
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "`n=== Desplegando en Kubernetes ===" -ForegroundColor Cyan
kubectl apply -k k8s/
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "`n=== Esperando que todos los pods esten listos ===" -ForegroundColor Cyan
kubectl wait --for=condition=ready pods --all -n rednorte --timeout=180s

Write-Host "`n=== Estado final ===" -ForegroundColor Cyan
kubectl get pods -n rednorte

Write-Host "`n=== Para acceder al frontend ===" -ForegroundColor Green
Write-Host "  kubectl port-forward -n rednorte service/frontend 4321:80"
Write-Host "`n=== Para acceder al API Gateway ===" -ForegroundColor Green
Write-Host "  kubectl port-forward -n rednorte service/krakend 8083:8080"
