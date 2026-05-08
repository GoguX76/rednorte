// Importación de Hono para manejar peticiones HTTP y de AuthClient para manejar reglas de negocio
import type { Context } from "hono";
import { AuthClient } from "../services/auth_client";

// Función en el BFF que recibe credenciales del frontend y maneja el inicio de sesión
export const loginHandler = async (c: Context) => {
    try {
        // Captura la información que envía el usuario desde el Frontend en la variable "body"
        const body = await c.req.json();

        // Validación de los campos username y password
        if (!body.username || !body.password) {
            return c.json({error: "Faltan credenciales (username y password son requeridos)"}, 400)
        };

        // Toma los datos enviados del auth_client y los envía con código 200
        const userData = await AuthClient.login(body.username, body.password);
        return c.json(userData, 200)

    } catch (error) {
        // Si la petición falla o las credenciales son inválidas se maneja el error aquí
        return c.json({error: error instanceof Error ? error.message: "Error interno desconocido"}, 401)
    }
};