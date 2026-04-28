import { expect, test, describe, mock } from "bun:test";
import { signUpUser } from "./user_service";

mock.module("../repositories/user_repository", () => ({
    userRepository: mock(async () => ({
        signUp: mock(async (data: any) => ({ 
            id: 1, 
            first_name: data.first_name, 
            last_name: data.last_name,
            email: data.email 
        }))
    }))
}));

describe("User Service - signUpUser", () => {
    
    test("Debería registrar un usuario exitosamente con todos los datos", async () => {
        const payload = {
            first_name: "Alan",
            last_name: "Dev",
            email: "alan@equipo.com",
            password: "passwordSegura123"
        };

        const result = await signUpUser(payload);
        expect(result).toBeDefined();
        expect(result.first_name).toBe("Alan");
        expect(result.email).toBe("alan@equipo.com");
    });

    test("Debería lanzar un error si faltan campos obligatorios", async () => {
        const payloadIncompleto = {
            first_name: "Daxo",
        };

        expect(signUpUser(payloadIncompleto as any)).rejects.toThrow("Missing required fields.");
    });
});