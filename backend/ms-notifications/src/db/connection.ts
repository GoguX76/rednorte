import postgres from "postgres";

/**
 * Conexión a la base de datos PostgreSQL para el microservicio de Notificaciones.
 *
 * Utiliza la librería `postgres` (postgres.js) con un pool de conexiones.
 * La URL de conexión se toma de `DATABASE_URL` o usa el valor por defecto
 * para conexión local al puerto 5434.
 *
 * Configuración del pool:
 * - `max: 10` — máximo 10 conexiones simultáneas
 * - `idle_timeout: 20` — conexiones inactivas se cierran a los 20 segundos
 * - `connect_timeout: 10` — timeout de conexión de 10 segundos
 */
const connectionString =
  process.env.DATABASE_URL ||
  "postgres://root:rootpassword@localhost:5434/notifications_db";

export const sql = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

console.log("Conexión a base de datos inicializada");
