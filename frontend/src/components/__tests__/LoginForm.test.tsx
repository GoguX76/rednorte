import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent, screen } from "@testing-library/preact";
import LoginForm from "../LoginForm";

vi.mock("../../lib/api", () => ({
  api: {
    auth: {
      login: vi.fn(() => Promise.resolve({ token: "abc", user: {} })),
    },
  },
  ApiError: class extends Error {
    status: number;
    constructor(m: string, s: number) {
      super(m);
      this.status = s;
    }
  },
}));

import { api } from "../../lib/api";

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe("LoginForm", () => {
  it("debería renderizar el formulario", () => {
    render(<LoginForm />);
    expect(screen.getByText("Iniciar Sesión")).toBeDefined();
    expect(screen.getByPlaceholderText("correo@ejemplo.com")).toBeDefined();
  });

  it("debería mostrar error si el login falla", async () => {
    const mockLogin = api.auth.login as ReturnType<typeof vi.fn>;
    mockLogin.mockRejectedValue(new Error("Credenciales inválidas"));

    render(<LoginForm />);
    const form = screen.getByRole("button", { name: "Ingresar" }).closest("form")!;

    await fireEvent.input(screen.getByPlaceholderText("correo@ejemplo.com"), { target: { value: "bad@test.com" } });
    await fireEvent.input(screen.getByPlaceholderText("••••••••"), { target: { value: "wrong" } });
    await fireEvent.submit(form);

    expect(await screen.findByText("Credenciales inválidas")).toBeDefined();
  });

  it("debería redirigir si el login es exitoso", async () => {
    const mockLogin = api.auth.login as ReturnType<typeof vi.fn>;
    const userData = { id: "1", email: "test@test.com", role_id: "rol_patient" };
    mockLogin.mockResolvedValue({ token: "jwt123", user: userData });

    delete (window as any).location;
    (window as any).location = { href: "" };

    render(<LoginForm />);
    const form = screen.getByRole("button", { name: "Ingresar" }).closest("form")!;

    await fireEvent.input(screen.getByPlaceholderText("correo@ejemplo.com"), { target: { value: "test@test.com" } });
    await fireEvent.input(screen.getByPlaceholderText("••••••••"), { target: { value: "pass123" } });
    await fireEvent.submit(form);

    expect(mockLogin).toHaveBeenCalledWith("test@test.com", "pass123");
    expect(localStorage.getItem("token")).toBe("jwt123");
    expect(window.location.href).toBe("/waitlist");
  });
});
