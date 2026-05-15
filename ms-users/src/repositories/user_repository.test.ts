import { expect, test, describe } from "bun:test";
import { userRepository } from "./user_repository";

describe("User Repository - Pruebas de Integración con Base de Datos", () => {
    
  test("Debería insertar un usuario real usando el objeto plano del repositorio", async () => {
    const correoDinamico = `repo_test_${Date.now()}@rednorte.com`;
    
    const payload = {
      first_name: "Scor",
      last_name: "Repository",
      email: correoDinamico,
      password: "passwordContenedor123"
    };

    const result = await userRepository.createUser("id-de-prueba-uuid", payload, "rol_patient");

    expect(result).toBeDefined();
    expect(result.first_name).toBe("Scor");
    expect(result.email).toBe(correoDinamico);
  });

  test("Debería extraer las credenciales completas de un usuario por su email", async () => {
    const correoDinamico = `login_test_${Date.now()}@rednorte.com`;
    const passwordDePrueba = "hash_falso_123";

    await userRepository.createUser("id-login-123", {
      first_name: "Test",
      last_name: "Login",
      email: correoDinamico,
      password: passwordDePrueba
    }, "rol_patient");

    const credentials = await userRepository.getUserCredentials(correoDinamico);

    expect(credentials).not.toBeNull();
    expect(credentials?.email).toBe(correoDinamico);
    expect(credentials?.password).toBe(passwordDePrueba);
    expect(credentials?.role_id).toBe("rol_patient");
  });
});