import { expect, test, describe, mock } from "bun:test";
import { UserService } from "./user_service";

// Simulamos el Objeto del Repositorio para aislar la base de datos
mock.module("../repositories/user_repository", () => {
  return {
    userRepository: {
      // Simula la búsqueda de correos existentes
      findByEmail: mock(async (email: string) => {
        if (email === "duplicado@rednorte.com") {
          return { id: "1", email };
        }
        return null;
      }),
      // Simula la obtención de la ID del rol
      findRoleIdByKey: mock(async (key: string) => {
        if (key === "patient") return "rol_patient";
        return null;
      }),
      // Simula la creación del usuario en la tabla
      createUser: mock(async (id: string, data: any, roleId: string) => {
        return { id, first_name: data.first_name, email: data.email };
      }),
      // Simula la extracción de credenciales para el Login
      getUserCredentials: mock(async (email: string) => {
        if (email === "existe@rednorte.com") {
          // Devolvemos una contraseña hasheada real con Bun que equivalga a "123456"
          const hashedPassword = await Bun.password.hash("123456");
          return { id: "uuid-123", email, password: hashedPassword, role_id: "rol_patient" };
        }
        return null;
      })
    }
  };
});

describe("User Service - Pruebas de Lógica de Negocio", () => {
  const service = new UserService();

  test("Debería registrar un usuario exitosamente si pasa todos los filtros", async () => {
    const payload = { first_name: "Daxo", email: "nuevo@rednorte.com", password: "passwordSegura123", last_name: "Dev" };
    
    const result = await service.registerUser(payload);
    
    expect(result).toBeDefined();
    expect(result.email).toBe("nuevo@rednorte.com");
    expect(result.id).toBeDefined();
  });

  test("Debería lanzar un error si el correo ya está registrado en la base de datos", async () => {
    const payload = { first_name: "Clon", email: "duplicado@rednorte.com", password: "123", last_name: "Test" };

    expect(service.registerUser(payload)).rejects.toThrow("El correo ya existe");
  });

  test("Debería iniciar sesión correctamente si el correo existe y la clave coincide", async () => {
    const payload = { email: "existe@rednorte.com", password: "123456" };

    const result = await service.loginUser(payload);

    expect(result).toBeDefined();
    expect(result.id).toBe("uuid-123");
    expect(result.email).toBe("existe@rednorte.com");
  });

  test("Debería rechazar el inicio de sesión si el correo no existe en el sistema", async () => {
    const payload = { email: "no_existe@rednorte.com", password: "123" };

    expect(service.loginUser(payload)).rejects.toThrow("Credenciales inválidas");
  });

  test("Debería rechazar el inicio de sesión si la contraseña es incorrecta", async () => {
    const payload = { email: "existe@rednorte.com", password: "clave_incorrecta" };

    expect(service.loginUser(payload)).rejects.toThrow("Credenciales inválidas");
  });
});