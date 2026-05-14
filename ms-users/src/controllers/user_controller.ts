import { Hono, Context } from "hono";
import { signUpUser } from "../services/user_service";

// --- Handler de Registro (Tu código original) ---
export const signUpHandler = async (c: Context) => {
  try {
    let body;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ success: false, message: "Invalid JSON format." }, 400);
    }

    const data = await signUpUser(body);
    return c.json({ success: true, data: data }, 201);
  } catch (error: any) {
    if (error.message === "Missing required fields.") {
      return c.json({ success: false, message: error.message }, 400);
    }
    return c.json(
      { success: false, message: "Error interno", err: error.message },
      500,
    );
  }
};

// --- NUEVO: Handler de Inicio de Sesión ---
export const loginHandler = async (c: Context) => {
  try {
    const body = await c.req.json();
    const { username, password } = body;

    // Validación directa con el usuario por defecto
    // (Más adelante puedes conectarlo a tu SQLite / user_service)
    if (username === "admin" && password === "1234") {
      return c.json({ success: true, username: "admin" }, 200);
    } else {
      return c.json({ success: false, message: "Credenciales inválidas" }, 401);
    }
  } catch (error) {
    return c.json(
      { success: false, message: "Error interno en el servidor" },
      500,
    );
  }
};
