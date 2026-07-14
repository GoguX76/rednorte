import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent, screen } from "@testing-library/preact";
import RegisterForm from "../RegisterForm";

vi.mock("../../lib/api", () => ({
  api: {
    auth: {
      register: vi.fn(() => Promise.resolve({ token: "abc", user: {} })),
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
});

describe("RegisterForm", () => {
  it("debería renderizar el formulario con todos los campos", () => {
    render(<RegisterForm />);
    expect(screen.getByText("Registrar Usuario")).toBeDefined();
    expect(screen.getByPlaceholderText("Juan")).toBeDefined();
    expect(screen.getByPlaceholderText("Pérez")).toBeDefined();
    expect(screen.getByPlaceholderText("correo@ejemplo.com")).toBeDefined();
    expect(screen.getByPlaceholderText("••••••••")).toBeDefined();
  });

  it("debería mostrar error si el registro falla", async () => {
    const mockRegister = api.auth.register as ReturnType<typeof vi.fn>;
    mockRegister.mockRejectedValue(new Error("Email ya registrado"));

    render(<RegisterForm />);
    const form = screen.getByRole("button", { name: "Registrar" }).closest("form")!;

    await fireEvent.input(screen.getByPlaceholderText("Juan"), { target: { value: "Juan" } });
    await fireEvent.input(screen.getByPlaceholderText("correo@ejemplo.com"), { target: { value: "dup@test.com" } });
    await fireEvent.input(screen.getByPlaceholderText("••••••••"), { target: { value: "pass123" } });
    await fireEvent.submit(form);

    expect(await screen.findByText("Email ya registrado")).toBeDefined();
  });

  it("debería mostrar mensaje de éxito y limpiar campos al registrarse", async () => {
    const mockRegister = api.auth.register as ReturnType<typeof vi.fn>;
    mockRegister.mockResolvedValue({ token: "jwt123", user: {} });

    render(<RegisterForm />);
    const form = screen.getByRole("button", { name: "Registrar" }).closest("form")!;

    await fireEvent.input(screen.getByPlaceholderText("Juan"), { target: { value: "Carlos" } });
    await fireEvent.input(screen.getByPlaceholderText("Pérez"), { target: { value: "Soto" } });
    await fireEvent.input(screen.getByPlaceholderText("correo@ejemplo.com"), { target: { value: "carlos@test.com" } });
    await fireEvent.input(screen.getByPlaceholderText("••••••••"), { target: { value: "pass123" } });
    await fireEvent.submit(form);

    expect(await screen.findByText("Usuario registrado exitosamente")).toBeDefined();
    expect(mockRegister).toHaveBeenCalledWith({
      first_name: "Carlos",
      last_name: "Soto",
      email: "carlos@test.com",
      password: "pass123",
    });
  });
});
