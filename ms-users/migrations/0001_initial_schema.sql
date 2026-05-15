-- Creación de tabla roles
CREATE TABLE IF NOT EXISTS roles (
    id TEXT PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Creación de la tabla usuarios
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role_id TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
);

-- Creación índice para mejor rendimiento en la DB
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Inserción de los roles existentes en el sistema
INSERT INTO roles (id, key, description) VALUES ('rol_patient', 'patient', 'Paciente') ON CONFLICT (id) DO NOTHING;
INSERT INTO roles (id, key, description) VALUES ('rol_doctor', 'doctor', 'Médico') ON CONFLICT (id) DO NOTHING;
INSERT INTO roles (id, key, description) VALUES ('rol_admin', 'admin', 'Administrador') ON CONFLICT (id) DO NOTHING;
