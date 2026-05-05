import { Hono } from "hono";
import { cors } from "hono/cors";
import { loginHandler } from "./controllers/auth_controller";

const app = new Hono();

// Aplicamos CORS para realizar peticiones al Frontend
app.use("/*", cors({
    origin: 'http://localhost:4321',
    credentials: true
}));

// Envía las credenciales a la ruta con el método loginHandler del auth_controller
app.post("/api/auth/users", loginHandler)

// Exportamos la app en el puerto 8080
export default {
    port: 8080,
    fetch: app.fetch
};