import { expect, test, describe, spyOn, afterAll } from "bun:test";
import { WaitlistService } from "../services/waitlist_service";
import { addPatientHandler, getQueueHandler, updateStatusHandler } from "./waitlist_controller";

// 1. Aislamiento completo de la capa de servicio mediante espías en el prototipo [cite: 76]
const spyAddPatient = spyOn(WaitlistService.prototype, "addPatientToWaitlist").mockImplementation(async (data: any) => {
  if (!data.userId || !data.reason) {
    throw new Error("El usuario debe estar asociado a un ID");
  }
  return { id: 123, userId: data.userId, priority: data.priority || 1, status: "waiting", reason: data.reason };
});

const spyGetQueue = spyOn(WaitlistService.prototype, "getQueue").mockImplementation(async () => {
  return [
    { id: 123, userId: "uuid-paciente-1", priority: 3, status: "waiting", reason: "Dolor abdominal agudo" }
  ] as any;
});

const spyUpdateStatus = spyOn(WaitlistService.prototype, "updateStatus").mockImplementation(async (id: number, newStatus: any) => {
  if (id === 999) {
    throw new Error("Registro no encontrado en la lista de espera");
  }
  return { id, userId: "uuid-paciente-1", priority: 3, status: newStatus, reason: "Dolor abdominal agudo" };
});

// 2. Limpieza de los espías al finalizar el archivo para mantener el entorno limpio [cite: 80]
afterAll(() => {
  spyAddPatient.mockRestore();
  spyGetQueue.mockRestore();
  spyUpdateStatus.mockRestore();
});

describe("Waitlist Controller - Pruebas de Handlers HTTP", () => {

  test("Debería devolver HTTP 201 y éxito si el payload de registro es válido", async () => {
    const mockContext = {
      req: {
        json: async () => ({ userId: "uuid-paciente-1", priority: 2, reason: "Dolor abdominal agudo" })
      },
      json: (data: any, status: number) => ({ body: data, status })
    } as any;

    const response = await addPatientHandler(mockContext) as any;

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe(123);
    expect(response.body.data.userId).toBe("uuid-paciente-1");
  });

  test("Debería devolver HTTP 400 si el servicio rechaza el registro por falta de datos", async () => {
    const mockContext = {
      req: {
        json: async () => ({ priority: 2 }) // Simula payload incompleto sin userId ni reason
      },
      json: (data: any, status: number) => ({ body: data, status })
    } as any;

    const response = await addPatientHandler(mockContext) as any;

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("El usuario debe estar asociado a un ID");
  });

  test("Debería devolver HTTP 200 y la lista de pacientes en espera", async () => {
    const mockContext = {
      json: (data: any, status: number) => ({ body: data, status })
    } as any;

    const response = await getQueueHandler(mockContext) as any;

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeArray();
    expect(response.body.data[0].id).toBe(123);
  });

  test("Debería devolver HTTP 400 si el ID enviado al actualizar no es un número (NaN)", async () => {
    const mockContext = {
      req: {
        param: (name: string) => "letras_en_lugar_de_numeros" // Fuerza la falla de Number.isNaN en el controlador
      },
      json: (data: any, status: number) => ({ body: data, status })
    } as any;

    const response = await updateStatusHandler(mockContext) as any;

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("ID inválido");
  });

  test("Debería devolver HTTP 400 si el servicio lanza un error de registro no encontrado", async () => {
    const mockContext = {
      req: {
        param: (name: string) => "999", // ID configurado en el espía para disparar la excepción
        json: async () => ({ newStatus: "attending" })
      },
      json: (data: any, status: number) => ({ body: data, status })
    } as any;

    const response = await updateStatusHandler(mockContext) as any;

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Registro no encontrado en la lista de espera");
  });

  test("Debería devolver HTTP 200 si la actualización de estado es exitosa", async () => {
    const mockContext = {
      req: {
        param: (name: string) => "123",
        json: async () => ({ newStatus: "finished" })
      },
      json: (data: any, status: number) => ({ body: data, status })
    } as any;

    const response = await updateStatusHandler(mockContext) as any;

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe("finished");
  });
});