import { sql } from "../db/connection";
import type { WaitlistEntry } from "../models/waitlist";

export class WaitlistRepository {

  // Inserta un nuevo registro en la waitlist
  async addToWaitlist(entry: WaitlistEntry) {
    const result = await sql`
      INSERT INTO waitlist_entries (user_id, priority, status, reason)
      VALUES (${entry.userId}, ${entry.priority}, ${entry.status}, ${entry.reason})
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
      SET status = ${newStatus}
      WHERE id = ${id}
      RETURNING *;
    `;
    return result[0];
  }
}
