import { describe, it, expect, spyOn, afterAll } from "bun:test";
import { WaitlistClient } from "../services/waitlist_client";
import {
  addPatientHandler,
  getQueueHandler,
  updateStatusHandler,
} from "./waitlist_controller";

// Aislamos el servicio para no hacer llamadas de red reales
const spyAddPatient = spyOn(WaitlistClient, "addPatient").mockImplementation(
  async (userId, priority, reason) => {
    if (!userId || !priority || !reason)
      throw new Error("Faltan introducir datos del paciente");
    return { id: 1, userId, priority, reason };
  },
);

const spyGetQueue = spyOn(WaitlistClient, "getQueue").mockImplementation(
  async () => {
    return { success: true, data: [{ id: 1, userId: "u1" }] };
  },
);

const spyUpdateStatus = spyOn(
  WaitlistClient,
  "updateStatus",
).mockImplementation(async (id, newStatus) => {
  if (id === 0) throw new Error("ID inválido");
  return { id, status: newStatus };
});

afterAll(() => {
  spyAddPatient.mockRestore();
  spyGetQueue.mockRestore();
  spyUpdateStatus.mockRestore();
});

describe("Waitlist Controller (BFF)", () => {
  it("Debe retornar 201 al añadir un paciente con datos válidos", async () => {
    const mockContext = {
      req: {
        json: async () => ({ userId: "u1", priority: 1, reason: "Dolor" }),
      },
      json: (data: any, status: number) => ({ data, status }),
    } as any;

    const response = (await addPatientHandler(mockContext)) as any;
    expect(response.status).toBe(201);
    expect(response.data.userId).toBe("u1");
  });

  it("Debe retornar 400 si faltan datos en addPatient", async () => {
    const mockContext = {
      req: { json: async () => ({ userId: "u1" }) }, // Falta priority/reason
      json: (data: any, status: number) => ({ data, status }),
    } as any;

    const response = await addPatientHandler(mockContext);
    expect(response.status).toBe(400);
  });

  it("Debe retornar 200 al obtener la lista de espera", async () => {
    const mockContext = {
      json: (data: any, status: number) => ({ data, status }),
    } as any;

    const response = (await getQueueHandler(mockContext)) as any;
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
  });

  it("Debe retornar 200 al actualizar estado correctamente", async () => {
    const mockContext = {
      req: {
        param: () => "1",
        json: async () => ({ newStatus: "finished" }),
      },
      json: (data: any, status: number) => ({ data, status }),
    } as any;

    const response = (await updateStatusHandler(mockContext)) as any;
    expect(response.status).toBe(200);
    expect(response.data.status).toBe("finished");
  });
});
