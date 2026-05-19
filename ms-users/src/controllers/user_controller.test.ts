import { expect, test, describe, spyOn, afterAll } from "bun:test";
import { UserService } from "../services/user_service";
import { registerUserHandler, loginUserHandler } from "./user_controller";

// Guardamos los espías en constantes para poder destruirlos al final
const spyRegister = spyOn(
  UserService.prototype,
  "registerUser",
).mockImplementation(async (data: any) => {
  if (!data.first_name || !data.email || !data.password) {
    throw new Error("Los campos obligatorios se encuentran vacíos");
  }
  return {
    id: "uuid-falso-123",
    first_name: data.first_name,
    email: data.email,
  };
});

const spyLogin = spyOn(UserService.prototype, "loginUser").mockImplementation(
  async (data: any) => {
    if (!data.email || !data.password) {
      throw new Error("Faltan credenciales");
    }
    if (data.email === "invalido@rednorte.com") {
      throw new Error("Credenciales inválidas");
    }
    return {
      token: "jwt-falso",
      user: { id: "uuid-falso-123", email: data.email, role_id: "rol_patient" },
    };
  },
);

// Destruimos los mocks para que no contaminen a los otros archivos de prueba
afterAll(() => {
  spyRegister.mockRestore();
  spyLogin.mockRestore();
});

describe("User Controller - Pruebas de Handlers HTTP", () => {
  test("Debería devolver HTTP 201 y éxito si el registro es válido", async () => {
    const mockContext = {
      req: {
        json: async () => ({
          first_name: "Alan",
          email: "alan@rednorte.com",
          password: "123",
        }),
      },
      json: (data: any, status: number) => ({ body: data, status: status }),
    } as any;

    const response = (await registerUserHandler(mockContext)) as any;

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.first_name).toBe("Alan");
  });

  test("Debería devolver HTTP 400 si el registro viene incompleto", async () => {
    const mockContext = {
      req: {
        json: async () => ({ email: "alan@rednorte.com" }),
      },
      json: (data: any, status: number) => ({ body: data, status: status }),
    } as any;

    const response = (await registerUserHandler(mockContext)) as any;

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(
      "Los campos obligatorios se encuentran vacíos",
    );
  });

  test("Debería devolver HTTP 200 y el token si las credenciales de login son válidas", async () => {
    const mockContext = {
      req: {
        json: async () => ({ email: "alan@rednorte.com", password: "123" }),
      },
      json: (data: any, status: number) => ({ body: data, status: status }),
    } as any;

    const response = (await loginUserHandler(mockContext)) as any;

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user.email).toBe("alan@rednorte.com");
    expect(response.body.data.token).toBe("jwt-falso");
  });

  test("Debería devolver HTTP 401 si el login es rechazado por el servicio", async () => {
    const mockContext = {
      req: {
        json: async () => ({ email: "invalido@rednorte.com", password: "123" }),
      },
      json: (data: any, status: number) => ({ body: data, status: status }),
    } as any;

    const response = (await loginUserHandler(mockContext)) as any;

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Credenciales inválidas");
  });
});
