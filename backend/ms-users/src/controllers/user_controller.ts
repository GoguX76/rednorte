import type { Context } from "hono";
import { UserService } from "../services/user_service";

const service = new UserService();

/**
 * Handler para el registro de un nuevo usuario.
 *
 * Extrae el body del request, delega al servicio la validación
 * y persistencia, y retorna el usuario creado.
 *
 * @param c - Contexto de Hono con el body de la petición
 * @returns Respuesta JSON con `{ success: true, data: UserResponse }` (201)
 */
export const registerUserHandler = async (c: Context) => {
  const body = await c.req.json();
  const newUser = await service.registerUser(body);
  return c.json({ success: true, data: newUser }, 201);
}

/**
 * Handler para obtener todos los usuarios registrados.
 *
 * Retorna la lista completa de usuarios con sus datos básicos.
 * Solo accesible para administradores.
 *
 * @param c - Contexto de Hono
 * @returns Respuesta JSON con `{ success: true, data: UserResponse[] }` (200)
 */
export const findUsersHandler = async (c: Context) => {
  const users = await service.findUsers();
  return c.json({ success: true, data: users }, 200);
}

/**
 * Handler para obtener un usuario por su UUID.
 *
 * Extrae el parámetro `id` de la URL y busca el usuario
 * en la base de datos.
 *
 * @param c - Contexto de Hono con el parámetro `id` en la URL
 * @returns Respuesta JSON con el usuario encontrado (200) o error (400/404)
 */
export const findUserByIdHandler = async (c: Context) => {
  const id = c.req.param("id");
  if (!id) {
    return c.json({ success: false, message: "La ID en la URL es obligatoria" }, 400);
  }
  const user = await service.findUserById(id);
  return c.json({ success: true, data: user }, 200);
}

/**
 * Handler para el inicio de sesión de usuarios.
 *
 * Recibe credenciales (email y password), las valida contra la
 * base de datos y retorna un token JWT si son correctas.
 *
 * @param c - Contexto de Hono con el body conteniendo email y password
 * @returns Respuesta JSON con `{ success: true, data: { token, user } }` (200) o error (400/401)
 */
export const loginUserHandler = async (c: Context) => {
  const body = await c.req.json();
  const userData = await service.loginUser(body);
  return c.json({ success: true, data: userData }, 200);
}
