-- Creación de tabla para la lista de espera
CREATE TABLE IF NOT EXISTS waitlist_entries (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,           -- El ID que nos mandará ms-users
    priority INTEGER NOT NULL DEFAULT 1, -- Ej: 1 (Baja), 2 (Media), 3 (Alta), 4 (Urgencia)
    status TEXT NOT NULL DEFAULT 'waiting', -- Estados: waiting, attending, finished, cancelled
    reason TEXT,                     -- Motivo de la consulta
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_waitlist_status ON waitlist_entries(status);
