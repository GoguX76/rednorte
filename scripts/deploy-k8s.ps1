Write-Host "=== Construyendo imagenes Docker ===" -ForegroundColor Cyan

docker build -t rednorte/ms-users:latest        ./backend/ms-users
if ($LASTEXITCODE -ne 0) { exit 1 }

docker build -t rednorte/ms-waitlist:latest     ./backend/ms-waitlist
if ($LASTEXITCODE -ne 0) { exit 1 }

docker build -t rednorte/ms-notifications:latest ./backend/ms-notifications
if ($LASTEXITCODE -ne 0) { exit 1 }

docker build --build-arg PUBLIC_API_URL=http://localhost:8083/api --build-arg PUBLIC_WS_URL=ws://localhost:3002/ws -t rednorte/frontend:latest ./frontend
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "`n=== Desplegando en Kubernetes ===" -ForegroundColor Cyan
kubectl apply -k k8s/
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "`n=== Reiniciando frontend para que tome la nueva imagen ===" -ForegroundColor Cyan
kubectl rollout restart deployment/frontend -n rednorte
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "`n=== Esperando que todos los pods esten listos ===" -ForegroundColor Cyan
kubectl wait --for=condition=ready pods -l 'app in (frontend, krakend, ms-users, ms-waitlist, ms-notifications)' -n rednorte --timeout=180s
kubectl wait --for=condition=ready pods -l 'app in (postgres-users, postgres-waitlist, notifications-postgres, rabbitmq)' -n rednorte --timeout=120s

Write-Host "`n=== Estado final ===" -ForegroundColor Cyan
kubectl get pods -n rednorte

Write-Host "`n=== Cerrando port-forwards anteriores ===" -ForegroundColor Cyan
Get-Process -Name powershell -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -match "port-forward" } | Stop-Process -Force 2>$null

Write-Host "`n=== Abriendo port-forwards ===" -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit","kubectl port-forward -n rednorte service/frontend 4321:80"
Start-Process powershell -ArgumentList "-NoExit","kubectl port-forward -n rednorte service/krakend 8083:8080"
Start-Process powershell -ArgumentList "-NoExit","kubectl port-forward -n rednorte service/ms-notifications 3002:3002"
Write-Host "Accede a la aplicación en: http://localhost:4321" -ForegroundColor Green
Write-Host "Cierra las ventanas de PowerShell que se abrieron para detener los port-forwards." -ForegroundColor Yellow
