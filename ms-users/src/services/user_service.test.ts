import { expect, test, describe, spyOn, afterAll } from "bun:test";
import { userRepository } from "../repositories/user_repository";
import { UserService } from "./user_service";

// Espiamos y aislamos el repositorio
const spyFindByEmail = spyOn(userRepository, "findByEmail").mockImplementation(
  async (email: string) => {
    if (email === "duplicado@rednorte.com") {
      return {
        id: "1",
        first_name: "Clon",
        last_name: "Test",
        email,
        password: "123",
        role_id: "rol_patient",
      };
    }
    return null;
  },
);

const spyFindRoleIdByKey = spyOn(
  userRepository,
  "findRoleIdByKey",
).mockImplementation(async (key: string) => {
  if (key === "patient") return "rol_patient";
  return null;
});

const spyCreateUser = spyOn(userRepository, "createUser").mockImplementation(
  async (id: string, data: any, roleId: string) => {
    return { id, first_name: data.first_name, email: data.email };
  },
);

const spyGetCredentials = spyOn(
  userRepository,
  "getUserCredentials",
).mockImplementation(async (email: string) => {
  if (email === "existe@rednorte.com") {
    const hashedPassword = await Bun.password.hash("123456");
    return {
      id: "uuid-123",
      email,
      password: hashedPassword,
      role_id: "rol_patient",
    };
  }
  return null;
});

const spyFindAllUsers = spyOn(userRepository, "findAllUsers").mockImplementation(
  async () => {
    return [
      { id: "uuid-123", first_name: "Juan", email: "juan@mail.com" },
      { id: "uuid-456", first_name: "Ana", email: "ana@mail.com" },
    ] as any;
  },
);

const spyFindUserById = spyOn(userRepository, "findUserById").mockImplementation(
  async (id: string) => {
    if (id === "uuid-123") {
      return { id: "uuid-123", first_name: "Juan", email: "juan@mail.com" } as any;
    }
    return null;
  },
);

// Limpieza absoluta al terminar el archivo
afterAll(() => {
  spyFindByEmail.mockRestore();
  spyFindRoleIdByKey.mockRestore();
  spyCreateUser.mockRestore();
  spyGetCredentials.mockRestore();
  spyFindAllUsers.mockRestore();
  spyFindUserById.mockRestore();
});

describe("User Service - Pruebas de Lógica de Negocio", () => {
  const service = new UserService();

  test("Debería registrar un usuario exitosamente si pasa todos los filtros", async () => {
    const payload = {
      first_name: "Daxo",
      email: "nuevo@rednorte.com",
      password: "passwordSegura123",
      last_name: "Dev",
    };

    const result = await service.registerUser(payload);

    expect(result).toBeDefined();
    expect(result.email).toBe("nuevo@rednorte.com");
    expect(result.id).toBeDefined();
  });

  test("Debería lanzar un error si el correo ya está registrado en la base de datos", async () => {
    const payload = {
      first_name: "Clon",
      email: "duplicado@rednorte.com",
      password: "123",
      last_name: "Test",
    };

    expect(service.registerUser(payload)).rejects.toThrow(
      "El correo ya existe",
    );
  });

  test("Debería iniciar sesión correctamente si el correo existe y la clave coincide", async () => {
    const payload = { email: "existe@rednorte.com", password: "123456" };

    const result = await service.loginUser(payload);

    expect(result).toBeDefined();
    expect(result.token).toBeDefined();
    expect(result.user.id).toBe("uuid-123");
    expect(result.user.email).toBe("existe@rednorte.com");
  });

  test("Debería rechazar el inicio de sesión si el correo no existe en el sistema", async () => {
    const payload = { email: "no_existe@rednorte.com", password: "123" };

    expect(service.loginUser(payload)).rejects.toThrow(
      "Credenciales inválidas",
    );
  });

  test("Debería rechazar el inicio de sesión si la contraseña es incorrecta", async () => {
    const payload = {
      email: "existe@rednorte.com",
      password: "clave_incorrecta",
    };

    expect(service.loginUser(payload)).rejects.toThrow(
      "Credenciales inválidas",
    );
  });

  test("Debería lanzar error si faltan campos obligatorios al registrar", async () => {
    expect(service.registerUser({ email: "solo@mail.com" } as any)).rejects.toThrow(
      "Los campos obligatorios se encuentran vacíos",
    );
  });

  test("Debería retornar todos los usuarios registrados", async () => {
    const result = await service.findUsers();
    expect(result).toBeArray();
    expect(result.length).toBe(2);
  });

  test("Debería retornar un usuario por su ID si existe", async () => {
    const result = await service.findUserById("uuid-123");
    expect(result).toBeDefined();
    expect(result.first_name).toBe("Juan");
  });

  test("Debería lanzar error si el usuario por ID no existe", async () => {
    expect(service.findUserById("uuid-999")).rejects.toThrow(
      "Usuario no encontrado",
    );
  });
});
