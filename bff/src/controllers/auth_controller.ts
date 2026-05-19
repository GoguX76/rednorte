// Importación de Hono para manejar peticiones HTTP y de AuthClient para manejar reglas de negocio
import type { Context } from "hono";
import { AuthClient } from "../services/auth_client";

// Función en el BFF que recibe credenciales del frontend y maneja el inicio de sesión
export const loginHandler = async (c: Context) => {
  try {
    // Captura la información que envía el usuario desde el Frontend en la variable "body"
    const body = await c.req.json();

    // Validación de los campos email y password
    if (!body.email || !body.password) {
      return c.json(
        { error: "Faltan credenciales (username y password son requeridos)" },
        400,
      );
    }

    // Toma los datos enviados del auth_client y los envía con código 200
    const userData = await AuthClient.login(body.email, body.password);
    return c.json(userData, 200);
  } catch (error) {
    // Si la petición falla o las credenciales son inválidas se maneja el error aquí
    return c.json(
      {
        error:
          error instanceof Error ? error.message : "Error interno desconocido",
      },
      401,
    );
  }
};

export const registerHandler = async (c: Context) => {
  try {
    const body = await c.req.json();
    const newUser = await AuthClient.register(body);
    return c.json(newUser, 201);
  } catch (error) {
    return c.json({ error: "No se pudo registrar" }, 400);
  }
};

export const getAllUsersHandler = async (c: Context) => {
  try {
    const users = await AuthClient.findAllUsers();
    return c.json({ success: true, data: users }, 200);
  } catch (error: any) {
    return c.json(
      { success: false, message: "Error al obtener usuarios" },
      500,
    );
  }
};

export const getUserByIdHandler = async (c: Context) => {
  try {
    const id = c.req.param("id");
    if (!id) return c.json({ success: false, message: "ID obligatorio" }, 400);

    const user = await AuthClient.findUserById(id);
    return c.json({ success: true, data: user }, 200);
  } catch (error: any) {
    return c.json({ success: false, message: "Usuario no encontrado" }, 404);
  }
};
