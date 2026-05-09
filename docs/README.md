# RedNorte - Servicio Público de Salud

Sistema orientado a microservicios diseñado para la gestión y administración de servicios de salud. 

## 📖 Sobre el Proyecto

RedNorte está estructurado bajo un enfoque de monorepo, separando de manera estricta la interfaz de usuario (Frontend) de la lógica de negocio modularizada (Backend). Esta arquitectura garantiza una alta escalabilidad, independencia de fallos y facilita el trabajo concurrente del equipo de desarrollo.

## 🛠️ Tecnologías Principales

* **Entorno de Ejecución & Gestor de Paquetes:** [Bun](https://bun.sh/)
* **Lenguaje:** TypeScript
* **Frontend:** Astro (con Preact y Nanostores para reactividad)
* **Base de Datos:** SQLite (gestionado mediante `@libsql/client`)

## 📂 Estructura del Repositorio

El proyecto se divide actualmente en dos ecosistemas principales:

* `frontend/`: Contiene la interfaz de usuario.
* `ms-users/`: Microservicio dedicado a la gestión de usuarios (registro, autenticación y roles) y conexión con la base de datos local. Implementa una arquitectura en capas para una separación de responsabilidades limpia:
  * `controllers/`: Manejo de peticiones HTTP, rutas y validación de entrada.
  * `services/`: Lógica de negocio y reglas de la aplicación.
  * `repositories/`: Interacción directa y persistencia con la base de datos.

## 🚀 Cómo Empezar (Entorno de Desarrollo)

### Requisitos Previos
Es estrictamente necesario tener instalado **Bun** en tu sistema para ejecutar este proyecto.
Debes levantar ambos servidores en terminales separadas para que la plataforma funcione correctamente.

### 1. Levantar el Microservicio de Usuarios (`ms-users`)
Abre tu terminal en la raíz del proyecto y ejecuta los siguientes comandos:

## Ingresar al directorio del microservicio
```bash
cd ms-users
```
## Instalar las dependencias
```bash
bun install
```
## Inicializar la base de datos (Genera local.db y el esquema de tablas)
```bash
bun run db_setup.ts
```
## (Opcional) Ejecutar las pruebas unitarias y de integración
```bash
bun test
```
## Iniciar el servidor en modo desarrollo (Puerto 3000)
```bash
bun run dev
```
### 2. Levantar el Frontend (Puerto 4321)
Abre una **nueva** terminal en la raíz del proyecto y ejecuta:
```bash
# Ingresar al directorio del frontend
cd frontend
```
## Instalar las dependencias
```bash
bun install
```
## Iniciar el servidor en modo desarrollo
```bash
bun run dev
```
## 🔑 Credenciales de Acceso (Desarrollo)
Una vez que ambos servidores estén corriendo, ingresa a `http://localhost:4321` en tu navegador.

Para acceder al portal de pacientes durante esta fase de pruebas del MVP, utiliza:
- **Usuario:** admin
- **Contraseña:** 1234