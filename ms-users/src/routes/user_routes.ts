import { Hono } from "hono";
import { loginHandler } from "../controllers/user_controller";

const userRouter = new Hono();

// Estas son las rutas INTERNAS que el microservicio expone al BFF
userRouter.post("/", loginHandler);

export default userRouter;
