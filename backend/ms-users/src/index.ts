import { Hono } from "hono";
import userRouter from "./routes/user_routes";
import { errorHandler, notFoundHandler } from "./lib/error-handler";

/**
 * Punto de entrada del microservicio de Usuarios (ms-users).
 *
 * Configura el framework Hono con:
 * - Handler centralizado de errores
 * - Handler para rutas no encontradas (404)
 * - Rutas de usuarios bajo `/users`
 * - Endpoint de verificación de salud en `/health`
 *
 * Escucha en el puerto definido por `PORT` o 3001 por defecto.
 */
const app = new Hono();

app.onError(errorHandler);
app.notFound(notFoundHandler);

app.route("/users", userRouter);
app.get("/", (c) => c.text("Microservicio de Usuarios - Operacional"));
app.get("/health", (c) => c.json({ status: "ok", service: "ms-users" }));

export default {
  port: Bun.env.PORT || 3001,
  fetch: app.fetch
}
