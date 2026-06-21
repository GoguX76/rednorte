import { expect, test, describe, spyOn, afterAll } from "bun:test";
import { WaitlistService } from "../services/waitlist_service";
import { AppError } from "../lib/app-error";
import jwt from "jsonwebtoken";

const JWT_SECRET = Bun.env.JWT_SECRET || "clave_secreta_desarrollo";

const testUser = { id: "usuario-test-1", email: "test@test.com", role_id: "rol_patient" };
const token = jwt.sign(testUser, JWT_SECRET, { expiresIn: "1h" });

const spyAddPatient = spyOn(WaitlistService.prototype, "addPatientToWaitlist").mockImplementation(async (data: any) => {
  if (!data.userId || !data.reason) {
    throw new AppError("El usuario debe estar asociado a un ID");
  }
  return { id: 123, userId: data.userId, priority: data.priority || 1, status: "waiting", reason: data.reason };
});

const spyGetQueue = spyOn(WaitlistService.prototype, "getQueue").mockImplementation(async () => {
  return [
    { id: 123, userId: "uuid-paciente-1", priority: 3, status: "waiting", reason: "Dolor abdominal agudo" }
  ] as any;
});

const spyGetMyQueue = spyOn(WaitlistService.prototype, "getMyQueue").mockImplementation(async (userId) => {
  if (!userId) {
    throw new AppError("Usuario no autenticado");
  }
  return [
    { id: 456, user_id: userId, priority: 2, status: "waiting", reason: "Consulta general" }
  ] as any;
});

const spyUpdateStatus = spyOn(WaitlistService.prototype, "updateStatus").mockImplementation(async (id: number, newStatus: any) => {
  if (id === 999) {
    throw new AppError("Registro no encontrado en la lista de espera", 404);
  }
  return { id, userId: "uuid-paciente-1", priority: 3, status: newStatus, reason: "Dolor abdominal agudo" };
});

afterAll(() => {
  spyAddPatient.mockRestore();
  spyGetQueue.mockRestore();
  spyGetMyQueue.mockRestore();
  spyUpdateStatus.mockRestore();
});

function fetchApp(method: string, path: string, body?: any) {
  const { default: app } = require("../index");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  if (body) headers["Content-Type"] = "application/json";
  return app.fetch(
    new Request(`http://localhost${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    }),
  );
}

describe("Waitlist Controller - Pruebas de Handlers HTTP", () => {
  test("Debería devolver HTTP 201 y éxito si el payload de registro es válido", async () => {
    const res = await fetchApp("POST", "/waitlist", {
      userId: "uuid-paciente-1", priority: 2, reason: "Dolor abdominal agudo",
    });
    const body = await res.json();
    expect(res.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data.id).toBe(123);
    expect(body.data.userId).toBe("uuid-paciente-1");
  });

  test("Debería devolver HTTP 400 si el servicio rechaza el registro por falta de datos", async () => {
    const res = await fetchApp("POST", "/waitlist", { priority: 2 });
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.message).toBe("El usuario debe estar asociado a un ID");
  });

  test("Debería devolver HTTP 200 y la lista de pacientes en espera", async () => {
    const res = await fetchApp("GET", "/waitlist");
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toBeArray();
    expect(body.data[0].id).toBe(123);
  });

  test("Debería devolver HTTP 400 si el ID enviado al actualizar no es un número (NaN)", async () => {
    const res = await fetchApp("PATCH", "/waitlist/letras_en_lugar_de_numeros", { newStatus: "attending" });
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.message).toBe("ID inválido");
  });

  test("Debería devolver HTTP 404 si el servicio lanza un error de registro no encontrado", async () => {
    const res = await fetchApp("PATCH", "/waitlist/999", { newStatus: "attending" });
    const body = await res.json();
    expect(res.status).toBe(404);
    expect(body.success).toBe(false);
    expect(body.message).toBe("Registro no encontrado en la lista de espera");
  });

  test("Debería devolver HTTP 200 si la actualización de estado es exitosa", async () => {
    const res = await fetchApp("PATCH", "/waitlist/123", { newStatus: "finished" });
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.status).toBe("finished");
  });

  test("Debería devolver HTTP 200 y las entradas del usuario autenticado en getMyQueueHandler", async () => {
    const res = await fetchApp("GET", "/waitlist/mine");
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toBeArray();
    expect(body.data[0].user_id).toBe("usuario-test-1");
  });
});
