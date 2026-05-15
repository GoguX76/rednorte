import { Hono, Context } from "hono";
import { UserService } from "../services/user_service";

const service = new UserService(); // Variable que importa las funciones del Service

export const registerUserHandler = async (c: Context) => {
  try {
    const body = await c.req.json(); // Recibe los datos que envia el usuario

    const newUser = await service.registerUser(body);

    return c.json({success: true, data: newUser}, 201);
  } catch (error: any) {
    return c.json({success: false, message: error.message }, 400)
  }
}