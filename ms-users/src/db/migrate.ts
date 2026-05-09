import { createClient } from "@libsql/client";
import { readdirSync, readFileSync} from "node:fs"; 
import { join } from "node:path";

const client = createClient({ url: "file:local.db" })

async function runMigrations() {
    try {
        // Creación tabla de control si no existe
        await client.execute(`
            CREATE TABLE IF NOT EXISTS _migrations_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                file_name TEXT UNIQUE NOT NULL,
                executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP    
            );
        `);

        // Busca los archivos en carpeta migrations
        const migrationsDir = join(import.meta.dir, "../../migrations");
        // Lee la carpeta de migraciones y solo deja los .sql y los ordenara con sort
        const files = readdirSync(migrationsDir).filter(f => f.endsWith(".sql")).sort();
        // Busca en la base de datos que archivos se ejecutaron antes
        const history = await client.execute("SELECT file_name FROM _migrations_history");
        // Convierte la respuesta de la base de datos en un Set de JavaScript
        const executedFiles = new Set(history.rows.map(row => row.file_name));
        
        // Bucle for que comprueba si el file ya fue ejecutado antes para no generar errores
        for (const file of files) {
            if (executedFiles.has(file)) {
                console.log(`${file} ejecutado anteriormente, saltando...`)
                continue;
            }

            console.log(`Ejecutando nueva migracion: ${file}...`)

            // Guarda en la variable el .sql dentro de la carpeta migrations
            const sqlContent = readFileSync(join(migrationsDir, file), "utf-8");
            // Ejecuta lo que guardo sqlContent a la base de datos
            await client.executeMultiple(sqlContent);
            // Inserta en la tabla de _migrations_history el .sql ejecutado para que no generar errores
            await client.execute({
                sql: "INSERT INTO _migrations_history (file_name) VALUES (?)",
                args: [file] 
            })
        }

        console.log("Migraciones completadas");
    } catch (error) {
        console.log("Error ejecutando las migraciones", error)
    }
}

runMigrations();