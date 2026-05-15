import { expect, test, describe, mock } from "bun:test";
import { registerUserHandler, loginUserHandler, findUsersHandler } from "./user_controller";

// Simulamos el Service: Le decimos cómo reaccionar sin ejecutar su lógica real
mock.module("../services/user_service", () => {
  return {
    UserService: class {
      // Simulamos la lógica de negocio del registro
      async registerUser(data: any) {
        if (!data.first_name || !data.email || !data.password) {
          throw new Error("Los campos obligatorios se encuentran vacíos");
        }
        return { id: "uuid-falso-123", first_name: data.first_name, email: data.email };
      }

      // Simulamos la lógica de negocio del inicio de sesión
      async loginUser(data: any) {
        if (!data.email || !data.password) {
          throw new Error("Faltan credenciales");
        }
        if (data.email === "invalido@rednorte.com") {
          throw new Error("Credenciales inválidas");
        }
        return { id: "uuid-falso-123", email: data.email, role_id: "rol_patient" };
      }

      // Simulamos la entrega de todos los usuarios
      async findUsers() {
        return [{ id: "1", first_name: "Alan", email: "alan@rednorte.com" }];
      }
    }
  };
});

describe("User Controller - Pruebas de Handlers HTTP", () => {
  
  test("Debería devolver HTTP 201 y éxito si el registro es válido", async () => {
    // Simulamos el Context de Hono con datos correctos
    const mockContext = {
      req: { 
        json: async () => ({ first_name: "Alan", email: "alan@rednorte.com", password: "123" }) 
      },
      json: (data: any, status: number) => ({ body: data, status: status })
    } as any;

    const response = await registerUserHandler(mockContext) as any;

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.first_name).toBe("Alan");
  });

  test("Debería devolver HTTP 400 si el registro viene incompleto", async () => {
    // Simulamos el Context de Hono con datos faltantes
    const mockContext = {
      req: { 
        json: async () => ({ email: "alan@rednorte.com" }) 
      },
      json: (data: any, status: number) => ({ body: data, status: status })
    } as any;

    const response = await registerUserHandler(mockContext) as any;

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Los campos obligatorios se encuentran vacíos");
  });

  test("Debería devolver HTTP 200 y el token si las credenciales de login son válidas", async () => {
    // Simulamos el Context de Hono con credenciales correctas
    const mockContext = {
      req: {
        json: async () => ({ email: "alan@rednorte.com", password: "123" })
      },
      json: (data: any, status: number) => ({ body: data, status: status })
    } as any;

    const response = await loginUserHandler(mockContext) as any;

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBe("alan@rednorte.com");
  });

  test("Debería devolver HTTP 401 si el login es rechazado por el servicio", async () => {
    // Simulamos el Context de Hono con un correo que sabemos que fallará
    const mockContext = {
      req: {
        json: async () => ({ email: "invalido@rednorte.com", password: "123" })
      },
      json: (data: any, status: number) => ({ body: data, status: status })
    } as any;

    const response = await loginUserHandler(mockContext) as any;

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Credenciales inválidas");
  });
});