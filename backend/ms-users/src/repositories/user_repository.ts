import { sql } from "../db/connection";
import type { UserEntry } from "../models/user";

/**
 * Repositorio de acceso a datos para la tabla `users` y `roles`.
 *
 * Utiliza la conexión a PostgreSQL con tagged templates de postgres.js.
 * Cada método ejecuta una query específica y retorna los resultados
 * en el formato esperado por los servicios.
 */
export const userRepository = {
  /**
   * Busca un usuario por su email.
   *
   * @param email - Correo electrónico a buscar
   * @returns El usuario encontrado o `null` si no existe
   */
  async findByEmail(email: string) {
    const result = await sql`SELECT * FROM users WHERE email = ${email}`;

    return result.length > 0 ? result[0] : null;
  },

  /**
   * Obtiene el UUID de un rol buscando por su key.
   *
   * @param roleKey - Key del rol (ej: `patient`, `admin`, `waitlist`, `attend`)
   * @returns El UUID del rol o `null` si no existe
   */
  async findRoleIdByKey(roleKey: string) {
    const result = await sql`SELECT id FROM roles WHERE key = ${roleKey}`

    return result.length > 0 ? result[0].id : null;
  },

  /**
   * Inserta un nuevo usuario en la base de datos.
   *
   * @param id - UUID v4 generado por el servicio
   * @param userData - Datos del usuario (first_name, last_name, email, password hasheada)
   * @param roleId - UUID del rol a asignar
   * @returns Objeto con el id, first_name y email del usuario creado
   */
  async createUser(id: string, userData: UserEntry, roleId: string) {
    await sql`
      INSERT INTO users (id, first_name, last_name, email, password, role_id)
      VALUES (${id}, ${userData.first_name}, ${userData.last_name || null}, ${userData.email}, ${userData.password}, ${roleId})
    `;

    return { id, first_name: userData.first_name, email: userData.email };
  },

  /**
   * Obtiene todos los usuarios registrados.
   *
   * @returns Arreglo de usuarios con id, first_name, last_name, email y role_id
   */
  async findAllUsers() {
    const result = await sql`SELECT id, first_name, last_name, email, role_id FROM users`

    return result;
  },

  /**
   * Busca un usuario por su UUID.
   *
   * @param id - UUID del usuario a buscar
   * @returns El usuario encontrado o `null` si no existe
   */
  async findUserById(id: string) {
    const result = await sql`SELECT id, first_name, last_name, email, role_id FROM users WHERE id = ${id}`

    return result.length > 0 ? result[0] : null;
  },

  /**
   * Obtiene las credenciales de un usuario para autenticación.
   *
   * Retorna id, email, password hasheada y role_id necesarios
   * para verificar credenciales y generar el token JWT.
   *
   * @param email - Correo electrónico del usuario
   * @returns Credenciales del usuario o `null` si no existe
   */
  async getUserCredentials(email: string) {
    const result = await sql`
      SELECT id, email, password, role_id 
      FROM users 
      WHERE email = ${email}
    `;
    return result.length > 0 ? result[0] : null;
  }
}