import { Hono } from "hono";
import { cors } from "hono/cors";
import userRouter from "./routes/user_routes";

const app = new Hono();

// Mantenemos el CORS estricto para que el frontend pueda conectarse
app.use(
  "/*",
  cors({
    origin: "http://localhost:4321",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);

app.route("/api/auth/users", userRouter);

console.log("🚀 Microservicio RedNorte corriendo en puerto 3000");

export default {
  port: 3000,
  fetch: app.fetch,
};
