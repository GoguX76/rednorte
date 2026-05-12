import { sql } from "../db/connection";
import type { WaitlistEntry } from "../models/waitlist";

export class WaitlistRepository {

  // Inserta un nuevo registro en la waitlist
  async addToWaitlist(entry: WaitlistEntry) {
    const result = await sql`
      INSERT INTO waitlist_entries (user_id, priority, status, reason)
      VALUES (${ /* inyecta el userId */ }, ${ /* inyecta la prioridad */ }, ${ /* inyecta el estado */ }, ${ /* inyecta el motivo */ })
      RETURNING *;
    `;
    return result[0];
  }

  // Lee los registros que hay en la waitlist
  async getPendingPatients() {
    const result = await sql`
      SELECT * FROM waitlist_entries
      WHERE status = 'waiting'
      ORDER BY priority DESC, created_at ASC;
    `;
    return result;
  }

  // Modificar un registro existente en la waitlist
  async updateStatus(id: number, newStatus: string) {
    const result = await sql`
      UPDATE waitlist_entries
      SET status = ${ /* inyecta el nuevo estado */ }
      WHERE id = ${ /* inyecta el id del paciente */ }
      RETURNING *;
    `;
    return result[0];
  }
}
