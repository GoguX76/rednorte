import { Hono } from "hono";
import waitlistRouter from "./routes/waitlist_routes";
import { errorHandler, notFoundHandler } from "./lib/error-handler";

/**
 * Punto de entrada del microservicio de Lista de Espera (ms-waitlist).
 *
 * Configura el framework Hono con:
 * - Handler centralizado de errores
 * - Handler para rutas no encontradas (404)
 * - Rutas de waitlist bajo `/waitlist`
 * - Endpoint de verificación de salud en `/health`
 *
 * Escucha en el puerto definido por `PORT` o 3000 por defecto.
 */
const app = new Hono();

app.onError(errorHandler);
app.notFound(notFoundHandler);

app.route("/waitlist", waitlistRouter);

app.get("/health", (c) => {
  return c.json({ status: "ok", service: "ms-waitlist" });
});

console.log("Waitlist corriendo en el puerto 3000");

export default {
  port: Bun.env.PORT || 3000,
  fetch: app.fetch,
};
