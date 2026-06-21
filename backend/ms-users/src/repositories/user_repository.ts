import { sql } from "../db/connection";
import type { UserEntry } from "../models/user";

export const userRepository = {
    // Función que busca el email en la base de datos
    async findByEmail(email: string) {
        const result = await sql`SELECT * FROM users WHERE email = ${email}`;

        return result.length > 0 ? result[0] : null;
    },

    // Función que busca en la base de datos el rol por su key
    async findRoleIdByKey(roleKey: string) {
        const result = await sql`SELECT id FROM roles WHERE key = ${roleKey}`

        return result.length > 0 ? result[0].id : null;
    },

    // Función que inserta los datos del usuario a la base de datos
    async createUser(id: string, userData: UserEntry, roleId: string) {
        await sql`
            INSERT INTO users (id, first_name, last_name, email, password, role_id)
            VALUES (${id}, ${userData.first_name}, ${userData.last_name || null}, ${userData.email}, ${userData.password}, ${roleId})
        `;

        return { id, first_name: userData.first_name, email: userData.email };
    },

    // Función que entrega los dato de todos los usuarios registrados en la base de datos
    async findAllUsers() {
        const result = await sql`SELECT id, first_name, last_name, email, role_id FROM users`

        return result;
    },

    // Función que entrega los datos de un usuario mediante su ID en la base de datos
    async findUserById(id: string) {
        const result = await sql`SELECT id, first_name, last_name, email, role_id FROM users WHERE id = ${id}`

        return result.length > 0 ? result[0] : null;
    },

    // Función que obtiene las credenciales del usuario
    async getUserCredentials(email: string) {
        const result = await sql`
            SELECT id, email, password, role_id 
            FROM users 
            WHERE email = ${email}
        `;
        return result.length > 0 ? result[0] : null;
    }
}