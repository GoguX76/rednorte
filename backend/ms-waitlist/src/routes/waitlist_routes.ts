import { Hono } from "hono";
import { jwt } from "hono/jwt";
import {
  addPatientHandler,
  getQueueHandler,
  getMyQueueHandler,
  updateStatusHandler,
} from "../controllers/waitlist_controller";

const waitlistRouter = new Hono();
const JWT_SECRET = (Bun.env.JWT_SECRET || "clave_secreta_desarrollo") as string;

// JWT para proteger las rutas de Waitlist
waitlistRouter.use("/*", jwt({ secret: JWT_SECRET, alg: "HS256" }));

// Estas son las rutas INTERNAS que el microservicio expone a KrakenD
waitlistRouter.post("/", addPatientHandler);
waitlistRouter.get("/mine", getMyQueueHandler);
waitlistRouter.get("/", getQueueHandler);
waitlistRouter.patch("/:id", updateStatusHandler);

export default waitlistRouter;
