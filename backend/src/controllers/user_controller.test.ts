// user_controller.test.ts
import { expect, test, describe, mock } from "bun:test";
import { signUpHandler } from "./user_controller";

// 1. Simulamos el Service: Le decimos cómo reaccionar sin ejecutar su lógica real
mock.module("../services/user_service", () => ({
    signUpUser: mock(async (data: any) => {
        // Simulamos la regla de negocio: si falta algo, explota
        if (!data.first_name || !data.email || !data.password) {
            throw new Error("Missing required fields.");
        }
        // Si todo está bien, simulamos la respuesta exitosa
        return { id: 1, first_name: data.first_name, email: data.email };
    })
}));

describe("User Controller - signUpHandler", () => {
    
    test("Debería devolver HTTP 201 y éxito si el JSON es válido", async () => {
        // 2. Simulamos el Cajero: Creamos un falso Context de Hono
        const mockContext = {
            req: { 
                json: async () => ({ 
                    first_name: "Alan", 
                    last_name: "Front", 
                    email: "alan@rednorte.com", 
                    password: "123" 
                }) 
            },
            // Capturamos lo que el controlador intenta devolver
            json: (data: any, status: number) => ({ body: data, status: status })
        } as any;

        // Ejecutamos el Handler
        const response = await signUpHandler(mockContext);

        // Validamos que respondió correctamente
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.first_name).toBe("Alan");
    });

    test("Debería devolver HTTP 400 si el Service rechaza los datos", async () => {
        // Simulamos un JSON incompleto
        const mockContext = {
            req: { 
                json: async () => ({ email: "alan@rednorte.com" }) // Falta el resto
            },
            json: (data: any, status: number) => ({ body: data, status: status })
        } as any;

        const response = await signUpHandler(mockContext);

        // Validamos que el controlador tradujo el error del Service a un 400
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Missing required fields.");
    });
});