import { Hono } from "hono";
import userRouter from "./routes/user_routes";
import { errorHandler, notFoundHandler } from "./lib/error-handler";

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
