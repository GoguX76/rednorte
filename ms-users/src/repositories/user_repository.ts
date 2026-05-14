import { sql } from "../db/connection";
import type { UserEntry } from "../models/user";
import { v4 as uuidv4 } from "uuid";

export async function userRepository() {
    return {
        async signUp({ first_name, last_name, email, password }: SignUpData) {
            
            // Consulta: Verificamos si el correo ya existe
            const existingUser = await client.execute(
                `SELECT id FROM users WHERE email = ?`, 
                [email]
            );
            
            if (existingUser.rows.length > 0) {
                throw new Error("Email already in use");
            }

            // Consulta: Buscamos el ID dinámico del rol 'patient'
            const roleResult = await client.execute(
                `SELECT id FROM roles WHERE key = 'patient'`
            );
            
            if (roleResult.rows.length === 0) {
                throw new Error("Role 'patient' does not exist in the database.");
            }
            
            const patientRoleId = roleResult.rows[0].id;

            // Inserción: Guardamos al usuario
            const newUserId = uuidv4();
            await client.execute(
                `INSERT INTO users (id, first_name, last_name, email, password, role_id) VALUES (?, ?, ?, ?, ?, ?)`,
                [newUserId, first_name, last_name || null, email, password, patientRoleId]
            );

            // Retorno puro: Devolvemos un objeto con los datos esenciales, sin mensajes HTTP
            return { id: newUserId, first_name, email };
        }
    };
}