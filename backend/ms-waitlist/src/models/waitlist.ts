/** Estados válidos para una entrada en la lista de espera. */
export const VALID_STATUSES = ["waiting", "attending", "finished", "cancelled"] as const;

/**
 * Tipo derivado de los estados válidos.
 *
 * Restringe los valores permitidos a los definidos en {@link VALID_STATUSES}:
 * - `waiting` → paciente esperando turno
 * - `attending` → paciente siendo atendido
 * - `finished` → atención finalizada
 * - `cancelled` → entrada cancelada
 */
export type WaitlistStatus = typeof VALID_STATUSES[number];

/**
 * Representación de una entrada en la lista de espera hospitalaria.
 *
 * Cada entrada vincula un usuario con su nivel de prioridad, motivo
 * de consulta y estado actual dentro del flujo de atención.
 *
 * @property id - ID numérico autoincremental generado por PostgreSQL
 * @property userId - UUID del usuario asociado a la entrada
 * @property priority - Nivel de urgencia: 1 = urgente, 2 = alto, 3 = medio, 4 = bajo
 * @property status - Estado actual dentro del ciclo de vida de la entrada
 * @property reason - Motivo de la consulta médica (mínimo 5 caracteres)
 * @property createdAt - Timestamp de creación de la entrada
 */
export interface WaitlistEntry {
  id?: number;
  userId: string;
  priority: number;
  status: WaitlistStatus;
  reason: string | null;
  createdAt?: Date;
}
