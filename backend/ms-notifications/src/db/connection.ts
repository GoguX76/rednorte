import postgres from "postgres";

// Conexión a la base de datos de waitlist dentro del contenedor
const connectionString =
  process.env.DATABASE_URL ||
  "postgres://root:rootpassword@localhost:5434/notifications_db";

// Configuración del Pool
export const sql = postgres(connectionString, {
  max: 10, // Define cuantas peticiones máximas puede abrir el microservicio
  idle_timeout: 20, // Define un tiempo de inactividad de 20 segundos que, al pasar, se destruye automáticamente
  connect_timeout: 10, // Define el tiempo que puede tardar en conectarse a la base de datos. De pasar el tiempo, la petición muere
});

console.log("Conexión a base de datos inicializada");
