// db_setup.ts
import { createClient } from "@libsql/client";
import { v4 as uuidv4 } from "uuid";

// 1. Conexión local: Crea un archivo 'local.db' en tu carpeta
const client = createClient({ url: "file:local.db" });

async function setupDatabase() {
    console.log("Iniciando creación de la base de datos...");
    const idRolePatient = uuidv4();

    try {
        // 2. Batch: Ejecuta múltiples comandos en una sola transacción
        await client.batch([
            `CREATE TABLE IF NOT EXISTS roles (
                id TEXT PRIMARY KEY,
                key TEXT UNIQUE NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );`,
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
            // Índices de optimización
            `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`,
            // Inserción de roles por defecto
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
        ], "write");

        console.log("Base de datos local creada y configurada exitosamente.");
    } catch (error) {
        console.error("Error creando la base de datos:", error);
    }
}

setupDatabase();