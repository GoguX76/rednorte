import type { Context } from "hono";
import { UserService } from "../services/user_service";

const service = new UserService();

export const registerUserHandler = async (c: Context) => {
  const body = await c.req.json();
  const newUser = await service.registerUser(body);
  return c.json({ success: true, data: newUser }, 201);
}

export const findUsersHandler = async (c: Context) => {
  const users = await service.findUsers();
  return c.json({ success: true, data: users }, 200);
}

export const findUserByIdHandler = async (c: Context) => {
  const id = c.req.param("id");
  if (!id) {
    return c.json({ success: false, message: "La ID en la URL es obligatoria" }, 400);
  }
  const user = await service.findUserById(id);
  return c.json({ success: true, data: user }, 200);
}

export const loginUserHandler = async (c: Context) => {
  const body = await c.req.json();
  const userData = await service.loginUser(body);
  return c.json({ success: true, data: userData }, 200);
}
