import { sql } from "../db/connection";
import type { WaitlistEntry } from "../models/waitlist";

/**
 * Repositorio de acceso a datos para la tabla `waitlist_entries`.
 *
 * Gestiona las operaciones CRUD sobre las entradas de la lista
 * de espera hospitalaria usando tagged templates de postgres.js.
 */
export const waitlistRepository = {
  /**
   * Inserta una nueva entrada en la lista de espera.
   *
   * @param entry - Datos de la entrada (userId, priority, status, reason)
   * @returns La entrada creada con su ID autoincremental y timestamp
   */
  async addToWaitlist(entry: WaitlistEntry) {
    const result = await sql`
      INSERT INTO waitlist_entries (user_id, priority, status, reason)
      VALUES (${entry.userId}, ${entry.priority}, ${entry.status}, ${entry.reason})
      RETURNING *;
    `;
    return result[0];
  },

  /**
   * Obtiene todas las entradas con estado `waiting`.
   *
   * Ordena por prioridad descendente (urgente primero) y por
   * fecha de creación ascendente (más antigua primero).
   *
   * @returns Arreglo de entradas en espera
   */
  async getPendingPatients() {
    const result = await sql`
      SELECT * FROM waitlist_entries
      WHERE status = 'waiting'
      ORDER BY priority DESC, created_at ASC;
    `;
    return result;
  },

  /**
   * Actualiza el estado de una entrada existente.
   *
   * @param id - ID numérico de la entrada a actualizar
   * @param newStatus - Nuevo estado de la entrada
   * @returns La entrada actualizada o `undefined` si no se encontró
   */
  async updateStatus(id: number, newStatus: string) {
    const result = await sql`
      UPDATE waitlist_entries
      SET status = ${newStatus}
      WHERE id = ${id}
      RETURNING *;
    `;
    return result[0];
  },

  /**
   * Busca todas las entradas de la lista de espera de un usuario.
   *
   * @param userId - UUID del usuario cuyas entradas se desean consultar
   * @returns Arreglo de entradas ordenadas por fecha de creación descendente
   */
  async findByUserId(userId: string) {
    const result = await sql`
      SELECT * FROM waitlist_entries
      WHERE user_id = ${userId}
      ORDER BY created_at DESC;
    `;
    return result;
  }
}
