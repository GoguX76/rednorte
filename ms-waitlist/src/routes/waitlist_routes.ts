import { Hono } from "hono";
import {
  addPatientHandler,
  getQueueHandler,
  updateStatusHandler,
} from "../controllers/waitlist_controller";

const waitlistRouter = new Hono();

// Estas son las rutas INTERNAS que el microservicio expone al BFF
waitlistRouter.post("/", addPatientHandler);
waitlistRouter.get("/", getQueueHandler);
waitlistRouter.patch("/:id", updateStatusHandler);

export default waitlistRouter;
