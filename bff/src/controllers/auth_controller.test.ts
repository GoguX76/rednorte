import { describe, it, expect, spyOn } from "bun:test";
import { AuthClient } from "../services/auth_client";
import { loginHandler } from "./auth_controller";

// Reporte de Pruebas con Describe
describe("Controlador de Autenticación (BFF)", () => {
  it("Si AuthClient devuelve un JSON con los datos, el resultado será éxitoso (status 200)", async () => {
    // Ejecutamos el resultado definido dentro de la función, evitando llamar a la función real
    const mockLogin = spyOn(AuthClient, "login").mockResolvedValue({
      token: "token-falso",
      id_usuario: 1,
    });

    // Falsificamos el contexto para darle estas credenciales al controlador
    const falseContext = {
      req: {
        json: async () => ({
          email: "medico@rednorte.com",
          password: "medico12345",
        }), // Credenciales válidas para resultado éxitoso
      },
      json: (data: any, status: number) => {
        return { body: data, status: status };
      },
    } as any;

    // Ejecutamos el loginHandler dándole como parámetro el contexto falso
    const response = await loginHandler(falseContext);
    // Verificamos que el código de status sea éxitoso (200)
    expect((response as any).status).toBe(200);
    // Verificamos que el controlador haya llamado al servicio con los datos correctos
    expect(mockLogin).toHaveBeenCalledWith(
      "medico@rednorte.com",
      "medico12345",
    );
    // Limpiamos el mock
    mockLogin.mockRestore();
  });

  it("Si AuthClient devuelve error, el resultado dará error (status 401)", async () => {
    // Ejecutamos el resultado definido en la función para lanzar error, evitando llamar a la función real
    const mockLogin = spyOn(AuthClient, "login").mockRejectedValue(
      new Error("Credenciales inválidas o error en el servidor"),
    );

    // Falsificamos el contexto para darle crendenciales inválidas al controlador
    const falseContext = {
      req: {
        json: async () => ({
          email: "invalido@rednorte.com",
          password: "pass_invalida",
        }),
      },
      json: (data: any, status: number) => {
        return { body: data, status: status };
      },
    } as any;

    // Ejecutamos el loginHandler dándole el contexto falso de las credenciales inválidas
    const response = await loginHandler(falseContext);
    // Verificamos que el código de status de error (status 401)
    expect((response as any).status).toBe(401);
    // Verificamos que el controlador haya llamado al servicio con los datos erroneos
    expect(mockLogin).toHaveBeenCalledWith(
      "invalido@rednorte.com",
      "pass_invalida",
    );
    // Limpiamos el Mock
    mockLogin.mockRestore();
  });
});
