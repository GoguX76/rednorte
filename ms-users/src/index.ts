import { Hono } from "hono";
import { cors } from "hono/cors";
// 1. Cambiamos la ruta de importación a tu carpeta controllers
import { userController } from "./controllers/user_controller"; 

const app = new Hono();

// 2. Mantenemos el CORS estricto para que el frontend pueda conectarse
app.use(
  "/*",
  cors({
    origin: "http://localhost:4321", 
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], 
    allowHeaders: ["Content-Type", "Authorization"], 
  })
);

// 3. Montamos las rutas usando tu controlador
app.route("/api/auth/users", userController);

console.log("🚀 Microservicio RedNorte corriendo en puerto 3000");

export default {
  port: 3000,
  fetch: app.fetch,
};