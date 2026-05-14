// Importacion de Hono para manejar peticiones HTTP y de las funciones del controlador de waitlist
import { Hono } from "hono";
import {
  addPatientHandler,
  getQueueHandler,
  updateStatusHandler,
} from "../controllers/waitlist_controller";

const waitlistRouter = new Hono();

// Definimos las rutas para las diferentes funciones
waitlistRouter.post("/", addPatientHandler);
waitlistRouter.patch("/:id", updateStatusHandler);
waitlistRouter.get("/", getQueueHandler);

export default waitlistRouter;
