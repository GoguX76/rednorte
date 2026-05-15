import { Hono } from "hono";
import { registerUserHandler, findUsersHandler, findUserByIdHandler, loginUserHandler } from "../controllers/user_controller";

const userRouter = new Hono();

// Estas son las rutas INTERNAS que el microservicio expone al BFF
userRouter.post("/", registerUserHandler); // Ruta para registrar a un nuevo usuario
userRouter.get("/", findUsersHandler); // Ruta para obtener a todos los usuarios
userRouter.get("/:id", findUserByIdHandler); // Ruta para obtener a un usuario por su ID
userRouter.post("/login", loginUserHandler); // Ruta para manejar el inicio de sesión

export default userRouter;