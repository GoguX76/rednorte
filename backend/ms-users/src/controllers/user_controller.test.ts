import { expect, test, describe, spyOn, afterAll } from "bun:test";
import { UserService } from "../services/user_service";
import { AppError } from "../lib/app-error";

const spyFindUsers = spyOn(
  UserService.prototype,
  "findUsers",
).mockImplementation(async () => {
  return [
    { id: "uuid-123", first_name: "Juan", email: "juan@mail.com" },
    { id: "uuid-456", first_name: "Ana", email: "ana@mail.com" },
  ] as any;
});

const spyFindUserById = spyOn(
  UserService.prototype,
  "findUserById",
).mockImplementation(async (id: string) => {
  if (id === "uuid-123") {
    return { id: "uuid-123", first_name: "Juan", email: "juan@mail.com" };
  }
  throw new AppError("Usuario no encontrado", 404);
});

const spyRegister = spyOn(
  UserService.prototype,
  "registerUser",
).mockImplementation(async (data: any) => {
  if (!data.first_name || !data.email || !data.password) {
    throw new AppError("Los campos obligatorios se encuentran vacíos");
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
      throw new AppError("Faltan credenciales");
    }
    if (data.email === "invalido@rednorte.com") {
      throw new AppError("Credenciales inválidas", 401);
    }
    return {
      token: "jwt-falso",
      user: { id: "uuid-falso-123", email: data.email, role_id: "rol_patient" },
    };
  },
);

afterAll(() => {
  spyRegister.mockRestore();
  spyLogin.mockRestore();
  spyFindUsers.mockRestore();
  spyFindUserById.mockRestore();
});

function fetchApp(method: string, path: string, body?: any) {
  const { default: app } = require("../index");
  return app.fetch(
    new Request(`http://localhost${path}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    }),
  );
}

describe("User Controller - Pruebas de Handlers HTTP", () => {
  test("Debería devolver HTTP 201 y éxito si el registro es válido", async () => {
    const res = await fetchApp("POST", "/users", {
      first_name: "Alan", email: "alan@rednorte.com", password: "123",
    });
    const body = await res.json();
    expect(res.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data.first_name).toBe("Alan");
  });

  test("Debería devolver HTTP 400 si el registro viene incompleto", async () => {
    const res = await fetchApp("POST", "/users", { email: "alan@rednorte.com" });
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.message).toBe("Los campos obligatorios se encuentran vacíos");
  });

  test("Debería devolver HTTP 200 y el token si las credenciales de login son válidas", async () => {
    const res = await fetchApp("POST", "/users/login", {
      email: "alan@rednorte.com", password: "123",
    });
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.user.email).toBe("alan@rednorte.com");
    expect(body.data.token).toBe("jwt-falso");
  });

  test("Debería devolver HTTP 401 si el login es rechazado por el servicio", async () => {
    const res = await fetchApp("POST", "/users/login", {
      email: "invalido@rednorte.com", password: "123",
    });
    const body = await res.json();
    expect(res.status).toBe(401);
    expect(body.success).toBe(false);
    expect(body.message).toBe("Credenciales inválidas");
  });

  test("Debería devolver HTTP 200 y la lista de usuarios", async () => {
    const res = await fetchApp("GET", "/users");
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toBeArray();
    expect(body.data.length).toBe(2);
  });

  test("Debería devolver HTTP 200 y el usuario si el ID existe", async () => {
    const res = await fetchApp("GET", "/users/uuid-123");
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.first_name).toBe("Juan");
  });

  test("Debería devolver HTTP 404 si el usuario por ID no existe", async () => {
    const res = await fetchApp("GET", "/users/uuid-999");
    const body = await res.json();
    expect(res.status).toBe(404);
    expect(body.success).toBe(false);
  });
});
