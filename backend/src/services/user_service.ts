import { Context } from "hono";
import { userRepository } from "../repositories/user_repository";

export async function signUp(c: Context) {
    try {
        let body;
        try {
            body = await c.req.json();
        } catch {
            return c.json({ success: false, message: "Invalid JSON format." }, 400);
        }

        const { first_name, last_name, email, password } = body;

        if (!first_name || !email || !password ) return c.json({ success: false, message: "Missing required fields." }, 400);

        const userRepo = await userRepository();

        const data = await userRepo?.signUp({ first_name, last_name, email, password });

        return c.json(data)
    } catch (error) {
        return c.json({ success: false, message: "ocurrio un error en el servicio", err: error }, 500);
    }
}