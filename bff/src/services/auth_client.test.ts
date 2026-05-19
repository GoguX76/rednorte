import { describe, expect, it, spyOn } from "bun:test";
import { AuthClient } from "../services/auth_client";

// Reporte de pruebas AuthClient con describe
describe("AuthClient Service (BFF)", () => {
  it("Si las credenciales son inválidas, lanzará error 401", async () => {
    // Secuestramos el fetch y simulamos un error de autorización
    const mockFetch = spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 401, statusText: "No autorizado" }),
    );

    // Llamamos a la función, ingresamos claves inválidas y esperamos el error que está en el Service
    await expect(
      AuthClient.login("user_malo@gmail.com", "contra_mala"),
    ).rejects.toThrow("Credenciales inválidas o error en el servidor");

    // Se limpia el mock para poder realizar el test siguiente
    mockFetch.mockRestore();
  });

  it("De ser un login exitoso, debe devolver un JSON con los datos del usuario", async () => {
    // Simulamos que el microservicios de usuario responde correctamente
    const falseResponse = { token: "jwt-12346", id_usuario: 1 };
    // Volvemos a secuestrar el fetch pero para dar un resultado éxitoso
    const mockFetch = spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(falseResponse), {
        status: 200, // Devuelve status 200 (éxitoso)
        headers: { "Content-Type": "application/json" }, // Indica que el contenido es un JSON
      }),
    );

    // Variable que contiene los datos del usuario para su testeo
    const resultado = await AuthClient.login(
      "medico@rednorte.com",
      "medico12345",
    );
    expect(resultado).toEqual(falseResponse); // Verifica que el service devolvió el JSON

    // Aquí verifica que los datos si se estén enviando al microservicio correcto
    expect(mockFetch).toHaveBeenCalledWith("http://ms-users:3001/users/login", {
      method: "POST", // Verifica que el método haya sido POST y no otro
      headers: { "Content-Type": "application/json" }, // Indica que el contenido es un JSON
      body: JSON.stringify({
        email: "medico@rednorte.com",
        password: "medico12345",
      }), // Toma los datos y los convierte en JSON con stringify
    });
    mockFetch.mockRestore();
  });
});
