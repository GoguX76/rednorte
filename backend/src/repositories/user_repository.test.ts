// user_repository.test.ts
import { expect, test, describe } from "bun:test";
import { userRepository } from "./user_repository";

describe("User Repository - Pruebas de Integración Reales", () => {
    
    test("Debería insertar un usuario real en local.db", async () => {
        // Inicializamos el repositorio real
        const repo = await userRepository();
        
        // Generamos un correo único para que el test nunca falle por duplicidad
        const correoDinamico = `scor_${Date.now()}@rednorte.com`;

        const payload = {
            first_name: "Scor",
            last_name: "Test",
            email: correoDinamico,
            password: "passwordSegura123"
        };

        // Ejecutamos la inserción real
        const result = await repo.signUp(payload);

        // Validamos que la base de datos nos devolvió los datos correctamente
        expect(result).toBeDefined();
        expect(result.first_name).toBe("Scor");
        expect(result.email).toBe(correoDinamico);
        expect(result.id).toBeDefined(); // Validamos que el UUID se generó
    });

    test("Debería lanzar error si intentamos registrar un correo duplicado", async () => {
        const repo = await userRepository();
        const correoDuplicado = "duplicado@rednorte.com";

        // Insertamos el usuario por primera vez (esto debe funcionar)
        await repo.signUp({
            first_name: "Clon",
            email: correoDuplicado,
            password: "123"
        });

        // Intentamos insertarlo por segunda vez y esperamos que la BD lo rechace
        expect(repo.signUp({
            first_name: "Clon2",
            email: correoDuplicado,
            password: "123"
        })).rejects.toThrow("Email already in use");
    });
});