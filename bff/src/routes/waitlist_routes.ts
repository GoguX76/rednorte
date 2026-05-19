// Importacion de Hono para manejar peticiones HTTP, seguridad con JWT y usar las funciones del controlador de waitlist
import { Hono } from "hono";
import { jwt } from "hono/jwt";
import {
  addPatientHandler,
  getQueueHandler,
  updateStatusHandler,
} from "../controllers/waitlist_controller";

const waitlistRouter = new Hono();
// Extraemos la clave y le decimos a TypeScript que es un string
const secretKey = (Bun.env.JWT_SECRET || "clave_secreta_desarrollo") as string;

// Todo lo que pase por aquí debe tener un token válido
waitlistRouter.use("/*", jwt({ secret: secretKey } as any));

// Definimos las rutas para las diferentes funciones
waitlistRouter.post("/", addPatientHandler);
waitlistRouter.patch("/:id", updateStatusHandler);
waitlistRouter.get("/", getQueueHandler);

export default waitlistRouter;
