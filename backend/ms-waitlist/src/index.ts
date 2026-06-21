import { Hono } from "hono";
import waitlistRouter from "./routes/waitlist_routes";
import { errorHandler, notFoundHandler } from "./lib/error-handler";

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
