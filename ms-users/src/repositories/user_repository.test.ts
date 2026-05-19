import { expect, test, describe, spyOn, afterAll } from "bun:test";
import * as db from "../db/connection";
import { userRepository } from "./user_repository";

// Interceptamos la exportación 'sql' adaptada exactamente a tus consultas reales
const spySql = spyOn(db as any, "sql").mockImplementation(async (strings: string[], ...values: any[]) => {
  const query = strings.join(" ").toUpperCase();

  // Mock para buscar rol por key
  if (query.includes("FROM ROLES WHERE KEY")) {
    if (values[0] === "patient") return [{ id: "rol_patient_123" }] as any;
    return [] as any;
  }

  // Mock para buscar credenciales o por email
  if (query.includes("WHERE EMAIL =")) {
    if (values[0] === "noexiste@mail.com") return [] as any;
    return [{
      id: "uuid-123",
      first_name: "Juan",
      last_name: "Perez",
      email: values[0],
      password: "hashed_password_aqui",
      role_id: "rol_patient_123"
    }] as any;
  }

  // Mock para buscar usuario por ID
  if (query.includes("FROM USERS WHERE ID =")) {
    if (values[0] === "uuid-123") return [{ id: "uuid-123", first_name: "Juan", email: "juan@mail.com" }] as any;
    return [] as any;
  }

  // Mock para obtener todos los usuarios (sin WHERE)
  if (query.includes("SELECT ID, FIRST_NAME, LAST_NAME, EMAIL, ROLE_ID FROM USERS") && !query.includes("WHERE")) {
    return [
      { id: "uuid-123", first_name: "Juan", email: "juan@mail.com" },
      { id: "uuid-456", first_name: "Ana", email: "ana@mail.com" }
    ] as any;
  }

  // Mock para INSERT (Tu código real no usa el retorno de la DB aquí, así que devolvemos array vacío)
  if (query.includes("INSERT INTO USERS")) {
    return [] as any;
  }

  return [] as any;
});

afterAll(() => {
  spySql.mockRestore();
});

describe("User Repository - Pruebas de Base de Datos Aislada", () => {
  
  test("Debería ejecutar INSERT y retornar el objeto armado manualmente por el repositorio", async () => {
    const newUser = {
      first_name: "Juan",
      last_name: "Perez",
      email: "juan@mail.com",
      password: "hashed_password_aqui"
    } as any;

    const result = await userRepository.createUser("uuid-falso-123", newUser, "rol_patient_123") as any;

    expect(result).toBeDefined();
    expect(result.id).toBe("uuid-falso-123"); // Aseguramos que retorne el ID que le inyectamos
    expect(result.email).toBe("juan@mail.com");
  });

  test("Debería ejecutar SELECT y extraer un usuario completo por su email", async () => {
    const result = await userRepository.findByEmail("juan@mail.com") as any;

    expect(result).toBeDefined();
    expect(result.id).toBe("uuid-123");
    expect(result.password).toBe("hashed_password_aqui");
  });

  test("Debería obtener el ID del rol buscando por su key", async () => {
    const result = await userRepository.findRoleIdByKey("patient") as any;
    expect(result).toBe("rol_patient_123");
  });

  test("Debería retornar un array con todos los usuarios registrados", async () => {
    const result = await userRepository.findAllUsers() as any;
    expect(result).toBeArray();
    expect(result.length).toBe(2);
  });

  test("Debería retornar un usuario específico por su ID", async () => {
    const result = await userRepository.findUserById("uuid-123") as any;
    expect(result).toBeDefined();
    expect(result.first_name).toBe("Juan");
  });

  test("Debería retornar null si se busca un email que no existe", async () => {
    const result = await userRepository.findByEmail("noexiste@mail.com") as any;
    expect(result).toBeNull();
  });
});