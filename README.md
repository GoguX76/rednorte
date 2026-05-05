# RedNorte - Sistema de Gestión de Salud

Plataforma de microservicios para la gestión de pacientes y derivaciones médicas.

## Requisitos Previos
Para ejecutar este proyecto en tu entorno local, necesitas tener instalado:
- [Bun](https://bun.sh/) (Entorno de ejecución y gestor de paquetes).

## Instrucciones de Ejecución

Debes levantar ambos servidores (Backend y Frontend) en terminales separadas para que la aplicación funcione correctamente.

### 1. Levantar el Backend (Puerto 3000)
Abre una terminal en la raíz del proyecto y ejecuta:
\`\`\`bash
cd backend
bun install
bun run dev
\`\`\`
*Nota: El backend utiliza SQLite de forma local, por lo que no requieres configurar una base de datos externa.*

### 2. Levantar el Frontend (Puerto 4321)
Abre una **nueva** terminal en la raíz del proyecto y ejecuta:
\`\`\`bash
cd frontend
bun install
bun run dev
\`\`\`

## Credenciales de Acceso (Desarrollo)
Una vez que ambos servidores estén corriendo, ingresa a `http://localhost:4321` en tu navegador.
- **Usuario:** admin
- **Contraseña:** 1234