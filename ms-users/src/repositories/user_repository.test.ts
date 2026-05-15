import { expect, test, describe } from "bun:test";
import { userRepository } from "./user_repository";

describe("User Repository - Pruebas de Integración con Base de Datos", () => {
    
  test("Debería insertar un usuario real usando el objeto plano del repositorio", async () => {
    // Generamos un correo dinámico para evitar errores de duplicidad en la DB local
    const correoDinamico = `repo_test_${Date.now()}@rednorte.com`;
    
    const payload = {
      first_name: "Scor",
      last_name: "Repository",
      email: correoDinamico,
      password: "passwordContenedor123"
    };

    // Ejecutamos la inserción apuntando directamente al objeto constante
    const result = await userRepository.createUser("id-de-prueba-uuid", payload, "rol_patient");

    // Validamos que los datos se guardaron y retornaron de forma correcta
    expect(result).toBeDefined();
    expect(result.first_name).toBe("Scor");
    expect(result.email).toBe(correoDinamico);
  });

  test("Debería extraer las credenciales completas de un usuario por su email", async () => {
    const correoDinamico = `login_test_${Date.now()}@rednorte.com`;
    const passwordDePrueba = "hash_falso_123";

    // Insertamos manualmente un usuario previo para garantizar que la búsqueda funcione
    await userRepository.createUser("id-login-123", {
      first_name: "Test",
      last_name: "Login",
      email: correoDinamico,
      password: passwordDePrueba
    }, "rol_patient");

    // Ejecutamos la función de credenciales del repositorio
    const credentials = await userRepository.getUserCredentials(correoDinamico);

    // Validamos que pudimos extraer la información crítica para el Login
    expect(credentials).not.toBeNull();
    expect(credentials?.email).toBe(correoDinamico);
    expect(credentials?.password).toBe(passwordDePrueba);
    expect(credentials?.role_id).toBe("rol_patient");
  });
});