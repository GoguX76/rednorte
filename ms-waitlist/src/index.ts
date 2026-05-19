import { Hono } from "hono";
import waitlistRouter from "./routes/waitlist_routes";

const app = new Hono(); // Variable que permitará manejar los métodos CRUD y HTTP

app.route("/waitlist", waitlistRouter); // Definición del prefijo que maneja la lista de espera

app.get("/health", (c) => {
  return c.json({ status: "ok", service: "ms-waitlist" });
});

console.log("Waitlist corriendo en el puerto 3000");

// Exportamos la app en el puerto 3000, Bun la levantará automáticamente
export default {
  port: Bun.env.PORT || 3000,
  fetch: app.fetch,
};
