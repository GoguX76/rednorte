import { Hono } from "hono";
import userRouter from "./routes/user_routes";

const app = new Hono(); // Variable que permitará manejar los métodos CRUD y HTTP

app.route("/users", userRouter); // Definición prefijo que maneja a los usuarios
app.get("/", (c) => c.text("Microservicio de Usuarios - Operacional")); // Ruta raiz para verificar que el contenedor este levantado

export default {
  port: Bun.env.PORT || 3001,
  fetch: app.fetch
}