# RedNorte - Servicio Público de Salud

Sistema orientado a microservicios diseñado para la gestión y administración de servicios de salud. 

## 📖 Sobre el Proyecto

RedNorte está estructurado bajo un enfoque de monorepo, separando de manera estricta la interfaz de usuario (Frontend) de la lógica de negocio modularizada (Backend). Esta arquitectura garantiza una alta escalabilidad, independencia de fallos y facilita el trabajo concurrente del equipo de desarrollo.

## 🛠️ Tecnologías Principales

* **Entorno de Ejecución & Gestor de Paquetes:** [Bun](https://bun.sh/)
* **Lenguaje:** TypeScript
* **Frontend:** Astro
* **Base de Datos:** SQLite (gestionado mediante `@libsql/client`)

## 📂 Estructura del Repositorio

El proyecto se divide actualmente en dos ecosistemas principales:

* `frontend/`: Contiene la interfaz de usuario construida con Astro.
* `ms-users/`: Microservicio dedicado a la gestión de usuarios (registro, autenticación y roles). Implementa una arquitectura en capas para una separación de responsabilidades limpia:
  * `controllers/`: Manejo de peticiones HTTP, rutas y validación de entrada.
  * `services/`: Lógica de negocio y reglas de la aplicación.
  * `repositories/`: Interacción directa y persistencia con la base de datos local.

## 🚀 Cómo Empezar (Entorno de Desarrollo)

### Requisitos Previos
Es estrictamente necesario tener instalado **Bun** en tu sistema para ejecutar este proyecto.

### 1. Levantar el Microservicio de Usuarios (`ms-users`)
Abre tu terminal y ejecuta los siguientes comandos para configurar el backend:
```bash
# Ingresar al directorio del microservicio
cd ms-users

# Instalar las dependencias
bun install

# Inicializar la base de datos (Genera local.db y el esquema de tablas)
bun run db_setup.ts

# Ejecutar las pruebas unitarias y de integración
bun test

# Iniciar el servidor
bun run index.ts