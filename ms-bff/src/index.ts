import { Hono } from "hono";
import { cors } from "hono/cors";
import authRouter from "./routes/auth_routes";

const app = new Hono();

// Aplicamos CORS para que el frontend pueda realizar peticiones al BFF
app.use("/*", cors({
    origin: 'http://localhost:4321',
    credentials: true
}));

// Definimos el prefijo y lo conectamos a la ruta que maneja la autenticación de credenciales
app.route("/api/auth", authRouter);

// Exportamos la app en el puerto 8080
export default {
    port: 8080,
    fetch: app.fetch
};