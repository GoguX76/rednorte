import { describe, expect, it, spyOn, afterAll } from "bun:test";
import { WaitlistClient } from "./waitlist_client";

describe("WaitlistClient Service (BFF)", () => {
  it("Debería enviar los datos correctamente al añadir un paciente", async () => {
    // Simulamos una respuesta exitosa del microservicio
    const mockResponse = { success: true, data: { id: 1 } };
    const mockFetch = spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockResponse), { status: 201 }),
    );

    // Ejecutamos la función de nuestro cliente
    const result = await WaitlistClient.addPatient(
      "uuid-123",
      3,
      "Dolor de cabeza",
    );

    // Verificamos que el resultado sea el esperado
    expect(result).toEqual(mockResponse);

    // Verificamos que el fetch se haya armado con la URL y body correctos
    expect(mockFetch).toHaveBeenCalledWith("http://ms-waitlist:3000/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "uuid-123",
        priority: 3,
        reason: "Dolor de cabeza",
      }),
    });

    mockFetch.mockRestore();
  });

  it("Debería obtener la lista de espera correctamente", async () => {
    const mockResponse = { success: true, data: [] };
    const mockFetch = spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockResponse), { status: 200 }),
    );

    const result = await WaitlistClient.getQueue();

    expect(result).toEqual(mockResponse);
    expect(mockFetch).toHaveBeenCalledWith("http://ms-waitlist:3000/waitlist");

    mockFetch.mockRestore();
  });

  it("Debería actualizar el estado correctamente", async () => {
    const mockResponse = {
      success: true,
      data: { id: 1, status: "attending" },
    };
    const mockFetch = spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockResponse), { status: 200 }),
    );

    const result = await WaitlistClient.updateStatus(1, "attending");

    expect(result).toEqual(mockResponse);
    expect(mockFetch).toHaveBeenCalledWith(
      "http://ms-waitlist:3000/waitlist/1",
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newStatus: "attending" }),
      },
    );

    mockFetch.mockRestore();
  });

  it("Debería lanzar un error si el servidor responde con fallo", async () => {
    const mockFetch = spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 500, statusText: "Internal Server Error" }),
    );

    await expect(WaitlistClient.getQueue()).rejects.toThrow(
      "No se pudo obtener la lista de espera",
    );

    mockFetch.mockRestore();
  });
});
