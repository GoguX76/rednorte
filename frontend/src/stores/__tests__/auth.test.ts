import { describe, it, expect, beforeEach } from "vitest";
import { $token, $user, login, logout, initAuth } from "../auth";

describe("auth store", () => {
  beforeEach(() => {
    logout();
    localStorage.clear();
  });

  it("debería iniciar con valores nulos", () => {
    expect($token.get()).toBeNull();
    expect($user.get()).toBeNull();
  });

  it("login debería establecer token y usuario", () => {
    const user = { id: "1", email: "test@test.com", role_id: "rol_patient" };
    login("abc123", user);
    expect($token.get()).toBe("abc123");
    expect($user.get()).toEqual(user);
  });

  it("logout debería limpiar token y usuario", () => {
    login("abc123", { id: "1", email: "test@test.com", role_id: "rol_patient" });
    logout();
    expect($token.get()).toBeNull();
    expect($user.get()).toBeNull();
  });

  it("initAuth debería restaurar desde localStorage", () => {
    const user = { id: "2", email: "doc@test.com", role_id: "rol_doctor" };
    localStorage.setItem("token", "token456");
    localStorage.setItem("user", JSON.stringify(user));
    initAuth();
    expect($token.get()).toBe("token456");
    expect($user.get()).toEqual(user);
  });

  it("initAuth no debería fallar si localStorage está vacío", () => {
    initAuth();
    expect($token.get()).toBeNull();
    expect($user.get()).toBeNull();
  });
});
