import { expect, test, describe, spyOn, afterAll } from "bun:test";
import { waitlistRepository } from "../repositories/waitlist_repository";
import { WaitlistService } from "./waitlist_service";

// Aislamiento completo del repositorio plano mediante espías
const spyAddToWaitlist = spyOn(waitlistRepository, "addToWaitlist").mockImplementation(async (entry) => {
  return {
    id: 123,
    userId: entry.userId,
    priority: entry.priority,
    status: entry.status,
    reason: entry.reason,
    createdAt: new Date()
  };
});

const spyGetPendingPatients = spyOn(waitlistRepository, "getPendingPatients").mockImplementation(async () => {
  return [
    {
      id: 123,
      userId: "uuid-paciente-1",
      priority: 3,
      status: "waiting",
      reason: "Dolor abdominal agudo",
      createdAt: new Date()
    }
  ] as any; // <-- Forzamos a TypeScript a aceptar el array simulado
});

const spyFindByUserId = spyOn(waitlistRepository, "findByUserId").mockImplementation(async (userId) => {
  return [
    {
      id: 456,
      user_id: userId,
      priority: 2,
      status: "waiting",
      reason: "Consulta general",
      created_at: new Date()
    }
  ] as any;
});

const spyUpdateStatus = spyOn(waitlistRepository, "updateStatus").mockImplementation(async (id, newStatus) => {
  if (id === 999) {
    return null;
  }
  return {
    id,
    userId: "uuid-paciente-1",
    priority: 3,
    status: newStatus,
    reason: "Dolor abdominal agudo",
    createdAt: new Date()
  } as any; // <-- Forzamos a TypeScript a aceptar el objeto simulado
});

// Limpieza absoluta de los mocks para no contaminar el contenedor
afterAll(() => {
  spyAddToWaitlist.mockRestore();
  spyGetPendingPatients.mockRestore();
  spyFindByUserId.mockRestore();
  spyUpdateStatus.mockRestore();
});

describe("Waitlist Service - Pruebas de Lógica de Negocio", () => {
  const service = new WaitlistService();

  test("Debería registrar un paciente exitosamente si pasa todos los filtros", async () => {
    const payload = { userId: "uuid-paciente-1", priority: 2, reason: "Dolor abdominal agudo" };
    
    const result = await service.addPatientToWaitlist(payload) as any;
    
    expect(result).toBeDefined();
    expect(result.id).toBe(123);
    expect(result.userId).toBe("uuid-paciente-1");
    expect(result.status).toBe("waiting");
  });

  test("Debería lanzar un error si la prioridad es menor a 1 o mayor a 4", async () => {
    const payloadInvalido = { userId: "uuid-paciente-1", priority: 5, reason: "Consulta general" };

    expect(service.addPatientToWaitlist(payloadInvalido)).rejects.toThrow("Nivel de prioridad inexistente");
  });

  test("Debería lanzar un error si el motivo de consulta tiene menos de 5 caracteres", async () => {
    const payloadMotivoCorto = { userId: "uuid-paciente-1", priority: 2, reason: "Sad" };

    expect(service.addPatientToWaitlist(payloadMotivoCorto)).rejects.toThrow(
      "El campo de motivo no puede estar vacio | contiene menos de 5 carácteres"
    );
  });

  test("Debería lanzar un error en updateStatus si la base de datos devuelve nulo (Registro inexistente)", async () => {
    expect(service.updateStatus(999, "attending")).rejects.toThrow(
      "Registro no encontrado en la lista de espera"
    );
  });

  test("Debería actualizar el estado correctamente si el ID existe en el sistema", async () => {
    const result = await service.updateStatus(123, "attending");
    
    expect(result).toBeDefined();
    expect(result.id).toBe(123);
    expect(result.status).toBe("attending");
  });

  test("Debería retornar las entradas de la waitlist para un usuario específico", async () => {
    const result = await service.getMyQueue("uuid-paciente-1") as any;

    expect(result).toBeArray();
    expect(result.length).toBe(1);
    expect(result[0].user_id).toBe("uuid-paciente-1");
    expect(result[0].priority).toBe(2);
  });
});