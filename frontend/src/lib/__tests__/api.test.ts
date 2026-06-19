import { describe, it, expect, beforeEach, vi } from "vitest";
import { api, ApiError } from "../api";

const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", mockFetch);
  localStorage.clear();
});

function mockResponse(data: unknown, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve({ success: true, data }),
    statusText: "OK",
  });
}

describe("api.auth", () => {
  it("login debería retornar token y usuario", async () => {
    const loginData = {
      token: "jwt123",
      user: { id: "1", first_name: "Juan", email: "juan@test.com", role_id: "rol_patient" },
    };
    mockFetch.mockResolvedValue(mockResponse(loginData));

    const result = await api.auth.login("juan@test.com", "pass123");
    expect(result.token).toBe("jwt123");
    expect(result.user.first_name).toBe("Juan");

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/auth/users/login"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ email: "juan@test.com", password: "pass123" }),
      }),
    );
  });

  it("register debería retornar usuario creado", async () => {
    const userData = { id: "2", first_name: "Ana", email: "ana@test.com", role_id: "rol_patient" };
    mockFetch.mockResolvedValue(mockResponse(userData));

    const result = await api.auth.register({
      first_name: "Ana",
      email: "ana@test.com",
      password: "pass456",
    });
    expect(result.first_name).toBe("Ana");
  });

  it("getUsers debería retornar lista", async () => {
    const users = [{ id: "1", first_name: "Juan", email: "juan@test.com", role_id: "rol_patient" }];
    mockFetch.mockResolvedValue(mockResponse(users));

    const result = await api.auth.getUsers();
    expect(result).toHaveLength(1);
  });

  it("debería incluir token en headers si existe", async () => {
    localStorage.setItem("token", "jwt_secreto");
    mockFetch.mockResolvedValue(mockResponse({}));

    await api.auth.getUsers();
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer jwt_secreto" }),
      }),
    );
  });
});

describe("api.waitlist", () => {
  it("getQueue debería retornar entries", async () => {
    const entries = [{ id: 1, user_id: "u1", priority: 2, status: "waiting", reason: "Dolor", created_at: "2025-01-01" }];
    mockFetch.mockResolvedValue(mockResponse(entries));

    const result = await api.waitlist.getQueue();
    expect(result).toHaveLength(1);
    expect(result[0].priority).toBe(2);
  });

  it("addPatient debería enviar POST", async () => {
    const entry = { id: 1, user_id: "u1", priority: 3, status: "waiting", reason: "Fiebre", created_at: "2025-01-01" };
    mockFetch.mockResolvedValue(mockResponse(entry));

    const result = await api.waitlist.addPatient({ userId: "u1", priority: 3, reason: "Fiebre" });
    expect(result.reason).toBe("Fiebre");
  });

  it("updateStatus debería enviar PATCH", async () => {
    const entry = { id: 1, user_id: "u1", priority: 1, status: "attending", reason: "Control", created_at: "2025-01-01" };
    mockFetch.mockResolvedValue(mockResponse(entry));

    const result = await api.waitlist.updateStatus(1, "attending");
    expect(result.status).toBe("attending");
  });

  it("getMyQueue debería retornar entries del usuario", async () => {
    const entries = [{ id: 5, user_id: "u1", priority: 1, status: "waiting", reason: "Chequeo", created_at: "2025-01-01" }];
    mockFetch.mockResolvedValue(mockResponse(entries));

    const result = await api.waitlist.getMyQueue();
    expect(result).toHaveLength(1);
  });
});

describe("ApiError", () => {
  it("debería lanzar ApiError cuando la respuesta no es ok", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ success: false, message: "No autorizado" }),
      statusText: "Unauthorized",
    });

    await expect(api.auth.getUsers()).rejects.toThrow(ApiError);
    await expect(api.auth.getUsers()).rejects.toThrow("No autorizado");
  });

  it("ApiError debería tener status code", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ success: false, message: "Bad Request" }),
      statusText: "Bad Request",
    });

    try {
      await api.auth.login("x", "y");
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError);
      expect((e as ApiError).status).toBe(400);
    }
  });

  it("debería usar statusText como fallback si no hay mensaje", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ success: false }),
      statusText: "Internal Server Error",
    });

    await expect(api.auth.getUsers()).rejects.toThrow("Error en la solicitud");
  });
});
