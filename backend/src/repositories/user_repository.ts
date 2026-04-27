import { createClient } from "@libsql/client";
import { v4 as uuidv4 } from "uuid";

export async function userRepository() {
    try {
        const client = createClient({ url: process.env.DATABASE_URL });

        const pass_salt = 10
        const idRolePatient = uuidv4()

        await client.batch([
            `CREATE TABLE IF NOT EXISTS roles (
                id TEXT PRIMARY KEY,
                key TEXT UNIQUE NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            `,
            `CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                first_name TEXT NOT NULL,
                last_name TEXT,
                is_verified BOOLEAN DEFAULT FALSE,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role_id TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
            );`,
            `CREATE TABLE IF NOT EXISTS role_permissions (
                id TEXT PRIMARY KEY,
                role_id TEXT NOT NULL,
                permission TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );`,
            `CREATE TABLE IF NOT EXISTS sessions (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                refresh_token TEXT NOT NULL,
                signature TEXT NOT NULL,
                last_used DATETIME NOT NULL,
                expires_at DATETIME NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )`,
            `CREATE INDEX IF NOT EXISTS idx_role_key ON roles(key);`,
            `CREATE INDEX IF NOT EXISTS idx_role_id ON roles(id);`,
            `CREATE INDEX IF NOT EXISTS idx_role_permissions ON role_permissions(role_id);`,
            `CREATE INDEX IF NOT EXISTS idx_role_permissions_permission ON role_permissions(permission);`,
            `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`,
            `CREATE INDEX IF NOT EXISTS idx_users_id ON users(id);`,
            `CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);`,
            `CREATE INDEX IF NOT EXISTS idx_sessions_refresh_token ON sessions(refresh_token);`,
            `CREATE INDEX IF NOT EXISTS idx_sessions_signature ON sessions(signature);`,
            {
                sql: `INSERT OR IGNORE INTO roles (id, key, description) VALUES (?, ?, ?)`,
                args: [idRolePatient, "patient", "Paciente"],
            },
            {
                sql: `INSERT OR IGNORE INTO roles (id, key, description) VALUES (?, ?, ?)`,
                args: [uuidv4(), "doctor", "Médico"],
            },
            {
                sql: `INSERT OR IGNORE INTO roles (id, key, description) VALUES (?, ?, ?)`,
                args: [uuidv4(), "admin", "Administrador"],
            }
        ], "write")

        return {
            async signUp({ first_name, last_name, email, password }: { first_name: string, last_name?: string, email: string, password: string }) {
                try {
                    if (!first_name || !email || !password ) return { status: false, message: "Missing required fields" }

                    const existingUser = await client.execute(`SELECT id FROM users WHERE email = ?`, [email])

                    if (existingUser.rows.length > 0) return { status: false, message: "Email already in use" }

                    await client.execute(
                        `INSERT INTO users (id, first_name, last_name, email, password, role_id) VALUES (?, ?, ?, ?, ?, ?)`,
                        [uuidv4(), first_name, last_name || null, email, password, idRolePatient]
                    )
                    return { status: true, message: "User created successfully" }
                } catch (error) {
                    return { status: false, message: "Ocurrio un error en el servicio" }
                }
            }
        }
    } catch {
        return null
    }
}