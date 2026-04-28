import { Hono, Context } from 'hono';
import { signUpUser } from '../services/user_service';

export const userController = new Hono();

// Extraemos la lógica a una función exportable
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
        return c.json({ success: false, message: "Error interno", err: error.message }, 500);
    }
};

// El enrutador queda completamente limpio
userController.post('/signup', signUpHandler);