import { expect, test, describe, spyOn, afterAll } from "bun:test";
import * as db from "../db/connection";
import { waitlistRepository } from "./waitlist_repository";
import type { WaitlistEntry } from "../models/waitlist";

// Interceptamos la exportación 'sql' del módulo de conexión
const spySql = spyOn(db as any, "sql").mockImplementation(async (strings: string[], ...values: any[]) => {
  // Unimos el string de la consulta para saber qué operación se está intentando hacer
  const query = strings.join(" ").toUpperCase();

  // Simulamos el retorno de postgres para un INSERT
  if (query.includes("INSERT")) {
    return [{
      id: 101,
      user_id: values[0],
      priority: values[1],
      status: values[2],
      reason: values[3],
      created_at: new Date()
    }] as any;
  }

  // Simulamos el retorno de postgres para un SELECT
  if (query.includes("SELECT")) {
    return [
      { id: 101, user_id: "uuid-1", priority: 1, status: "waiting", reason: "Dolor agudo", created_at: new Date() },
      { id: 102, user_id: "uuid-2", priority: 3, status: "waiting", reason: "Consulta general", created_at: new Date() }
    ] as any;
  }

  // Simulamos el retorno de postgres para un UPDATE
  if (query.includes("UPDATE")) {
    // En tu query: SET status = ${newStatus} WHERE id = ${id}
    // values[0] es newStatus y values[1] es id
    return [{
      id: values[1],
      user_id: "uuid-1",
      priority: 1,
      status: values[0],
      reason: "Dolor agudo",
      created_at: new Date()
    }] as any;
  }

  return [] as any;
});

// Limpieza del espía
afterAll(() => {
  spySql.mockRestore();
});

describe("Waitlist Repository - Pruebas de Base de Datos Aislada", () => {
  
  test("Debería ejecutar INSERT y retornar el nuevo registro", async () => {
    const newEntry: WaitlistEntry = {
      userId: "uuid-test",
      priority: 2,
      status: "waiting",
      reason: "Fiebre alta"
    };

    const result = await waitlistRepository.addToWaitlist(newEntry) as any;

    expect(result).toBeDefined();
    expect(result.id).toBe(101);
    expect(result.user_id).toBe("uuid-test");
    expect(result.status).toBe("waiting");
  });

  test("Debería ejecutar SELECT y retornar los pacientes en estado 'waiting'", async () => {
    const result = await waitlistRepository.getPendingPatients() as any;

    expect(result).toBeArray();
    expect(result.length).toBe(2);
    expect(result[0].status).toBe("waiting");
  });

  test("Debería ejecutar UPDATE y retornar el registro modificado", async () => {
    const result = await waitlistRepository.updateStatus(101, "attending") as any;

    expect(result).toBeDefined();
    expect(result.id).toBe(101);
    expect(result.status).toBe("attending");
  });

  test("Debería ejecutar SELECT por user_id y retornar las entradas del usuario", async () => {
    const result = await waitlistRepository.findByUserId("uuid-1") as any;

    expect(result).toBeArray();
    expect(result.length).toBe(2);
    expect(result[0].user_id).toBe("uuid-1");
  });
});