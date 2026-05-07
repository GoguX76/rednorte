import { describe, it, expect, spyOn } from "bun:test";
import { AuthClient } from "../services/auth_client";
import { loginHandler } from "./auth_controller"; 

// Reporte de Pruebas con Describe
describe("Controlador de Autenticación (BFF)", () => {
    it("Si AuthClient devuelve un JSON con los datos, el resultado será éxitoso", async () => {
        // Ejecutamos el resultado definido dentro de la función, evitando llamar a la función real
        const mockLogin = spyOn(AuthClient, "login").mockResolvedValue({
            "token": "token-falso",
            "id_usuario": 1
        });

        // Falsificamos el contexto para darle estas credenciales al controlador
        const falseContext = {
            req: {
                json: async () => ({username: "medico_rednorte", password: "medico12345"})
            },
            json: (data: any, status: number) => {
                return { body: data, status: status };
            }
        } as any;

        // Ejecutamos el loginHandler dándole como parámetro el contexto falso
        const response = await loginHandler(falseContext);

        // Verificamos que el código de status sea éxitoso (200)
        expect((response as any).status).toBe(200);
        // Verificamos que el controlador haya llamado al servicio con los datos correctos
        expect(mockLogin).toHaveBeenCalledWith("medico_rednorte", "medico12345");
        // Limpiamos el mock
        mockLogin.mockRestore();
    });
});