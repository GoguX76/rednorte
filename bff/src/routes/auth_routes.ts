// Importación de Hono para el manejo de peticiones HTTP y loginHandler para la autenticación de credenciales
import { Hono } from "hono";
import {
  loginHandler,
  registerHandler,
  getAllUsersHandler,
  getUserByIdHandler,
} from "../controllers/auth_controller";

// Variable que manejara los métodos CRUD y rutas de autenticación
const authRouter = new Hono();

// Usa el método POST (con el prefijo definido en index.ts) con el subfijo /users, llamando a la función
// loginHandler para manejar la autenticación de las credenciales
authRouter.post("/users/login", loginHandler);
authRouter.post("/users", registerHandler);
authRouter.get("/users", getAllUsersHandler);
authRouter.get("/users/:id", getUserByIdHandler);

export default authRouter;
