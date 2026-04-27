import { createClient } from "@libsql/client";

export async function userRepository() {
    try {
        const client = createClient({ url: process.env.DATABASE_URL });

        const pass_salt = 10

        await client.batch([
            `CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                first_name TEXT NOT NULL,
                last_name TEXT,
                is_verified BOOLEAN DEFAULT FALSE,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role_id TEXT NOT NULL,
                FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
            );`,
            `CREATE TABLE IF NOT EXISTS roles (
                id TEXT PRIMARY KEY,
                key TEXT UNIQUE NOT NULL,
                description TEXT
            );`,
            `CREATE TABLE IF NOT EXISTS role_permissions (
                id TEXT PRIMARY KEY,
                role_id TEXT NOT NULL,
                permission TEXT
            );`,
        ], "write")

        return {}
    } catch {
        return null
    }
}