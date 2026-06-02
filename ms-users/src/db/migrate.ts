import { sql } from "./connection";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

async function runMigrations() {
  try {
    // Creación de la tabla de historial
    await sql`
            CREATE TABLE IF NOT EXISTS _migrations_history (
                id SERIAL PRIMARY KEY,
                file_name TEXT UNIQUE NOT NULL,
                executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;

    const migrationsDir = join(process.cwd(), "migrations");
    const files = readdirSync(migrationsDir)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    // Consulta del historial
    const history = await sql`SELECT file_name FROM _migrations_history`;
    const executedFiles = new Set(history.map((row) => row.file_name));

    for (const file of files) {
      if (executedFiles.has(file)) {
        console.log(`${file} ejecutado anteriormente, saltando...`);
        continue;
      }

      console.log(`Ejecutando nueva migracion: ${file}...`);
      const sqlContent = readFileSync(join(migrationsDir, file), "utf-8");

      // Ejecutar el SQL crudo de 0001_initial_schema.sql
      await sql.unsafe(sqlContent);

      // Registra la migración protegiendo la variable de inyecciones
      await sql`
                INSERT INTO _migrations_history (file_name) VALUES (${file})
            `;
    }

    console.log("Migraciones completadas");
  } catch (error) {
    console.error("Error ejecutando las migraciones:", error);
  } finally {
    // Cierre de la conexión para que el script termine correctamente
    await sql.end();
  }
}

runMigrations();
