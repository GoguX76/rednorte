import { userRepository } from "../repositories/user_repository";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import type { UserEntry } from "../models/user";
import { AppError } from "../lib/app-error";

/**
 * Servicio de gestión de usuarios.
 *
 * Contiene la lógica de negocio para registro, login y consulta
 * de usuarios. Coordina con {@link userRepository} para persistencia
 * y aplica validaciones antes de cada operación.
 */
export class UserService {
  /**
   * Registra un nuevo usuario en el sistema.
   *
   * Flujo:
   * 1. Valida que los campos obligatorios estén presentes
   * 2. Verifica que el email no exista previamente
   * 3. Busca el ID del rol `patient` en la base de datos
   * 4. Hashea la contraseña con Argon2
   * 5. Genera un UUID v4 y persiste el usuario
   *
   * @param userData - Datos del usuario (email, first_name, last_name, password)
   * @returns El usuario creado con su UUID generado
   * @throws {AppError} Si faltan campos obligatorios (400)
   * @throws {AppError} Si el email ya está registrado (400)
   * @throws {AppError} Si el rol `patient` no existe en la DB (500)
   */
  async registerUser(userData: UserEntry) {
    if (!userData.first_name || !userData.email || !userData.password) {
      throw new AppError("Los campos obligatorios se encuentran vacíos");
    }

    const existingEmail = await userRepository.findByEmail(userData.email);

    if (existingEmail) {
      throw new AppError("El correo ya existe");
    }

    const roleId = await userRepository.findRoleIdByKey("patient");

    if (!roleId) {
      throw new AppError("El rol paciente no existe en la base de datos");
    }

    const hashedPassword = await Bun.password.hash(userData.password);
    userData.password = hashedPassword;

    const newUserId = uuidv4();
    const newUser = await userRepository.createUser(
      newUserId,
      userData,
      roleId,
    );
    return newUser;
  }

  /**
   * Retorna la lista de todos los usuarios registrados.
   *
   * @returns Arreglo de usuarios con sus datos básicos
   */
  async findUsers() {
    return userRepository.findAllUsers();
  }

  /**
   * Busca un usuario por su UUID.
   *
   * @param id - UUID del usuario a buscar
   * @returns El usuario encontrado con sus datos completos
   * @throws {AppError} Si no existe un usuario con ese ID (404)
   */
  async findUserById(id: string) {
    const user = await userRepository.findUserById(id);

    if (!user) {
      throw new AppError("Usuario no encontrado", 404);
    }

    return user;
  }

  /**
   * Autentica un usuario y genera un token JWT.
   *
   * Flujo:
   * 1. Valida que email y password estén presentes
   * 2. Busca las credenciales del usuario por email
   * 3. Verifica la contraseña hasheada con Argon2
   * 4. Genera un JWT con los datos públicos del usuario (id, email, role_id)
   *
   * @param userData - Credenciales de login (email y password)
   * @returns Token JWT y datos del usuario autenticado
   * @throws {AppError} Si faltan credenciales (400)
   * @throws {AppError} Si el email no existe o la contraseña es incorrecta (401)
   */
  async loginUser(userData: Pick<UserEntry, "email" | "password">) {
    if (!userData.email || !userData.password) {
      throw new AppError("Faltan credenciales");
    }

    const credentials = await userRepository.getUserCredentials(userData.email);

    if (!credentials) {
      throw new AppError("Credenciales inválidas", 401);
    }

    const isPasswordValid = await Bun.password.verify(
      userData.password,
      credentials.password,
    );

    if (!isPasswordValid) {
      throw new AppError("Credenciales inválidas", 401);
    }

    const publicUserData = {
      id: credentials.id,
      email: credentials.email,
      role_id: credentials.role_id,
    };

    const token = jwt.sign(
      publicUserData,
      Bun.env.JWT_SECRET || "clave_secreta_desarrollo",
      { expiresIn: "2h" },
    );

    return {
      token: token,
      user: publicUserData,
    };
  }
}
