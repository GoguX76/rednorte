import { Hono } from "hono";
import { cors } from "hono/cors";
import authRouter from "./routes/auth_routes";
import waitlistRouter from "./routes/waitlist_routes";

const app = new Hono();

// Aplicamos CORS para que el frontend pueda realizar peticiones al BFF
app.use(
  "/*",
  cors({
    origin: "http://localhost:4321",
    credentials: true,
  }),
);

// Registramos las rutas del BFF
app.route("/api/auth", authRouter);
app.route("/api/waitlist", waitlistRouter);

// Exportamos la app en el puerto 8080
export default {
  port: 8080,
  hostname: "0.0.0.0",
  fetch: app.fetch,
};
