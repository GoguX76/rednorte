import { sql } from "../db/connection";
import type { NotificationEntry } from "../models/notifications";

/**
 * Repositorio de acceso a datos para la tabla `notifications`.
 *
 * Gestiona las operaciones CRUD sobre las notificaciones usando
 * tagged templates de postgres.js.
 */
export const notificationRepository = {
  /**
   * Inserta una nueva notificación en la base de datos.
   *
   * @param entry - Datos de la notificación (userId, type, message)
   * @returns La notificación creada con su ID y timestamp generado por PostgreSQL
   */
  async saveNotification(entry: NotificationEntry) {
    const result = await sql`
      INSERT INTO notifications (user_id, type, message)
      VALUES (${entry.userId}, ${entry.type}, ${entry.message})
      RETURNING *;
    `;
    return result[0];
  },

  /**
   * Obtiene todas las notificaciones de un usuario.
   *
   * Retorna las notificaciones ordenadas por fecha de creación
   * descendente (más reciente primero).
   *
   * @param userId - UUID del usuario cuyas notificaciones se desean consultar
   * @returns Arreglo de notificaciones del usuario
   */
  async getNotificationsByUser(userId: string) {
    const result = await sql`
      SELECT * FROM notifications
      WHERE user_id = ${userId}
      ORDER BY created_at DESC;
    `;
    return result;
  },

  /**
   * Marca una notificación como leída.
   *
   * @param id - ID numérico de la notificación a marcar
   * @returns La notificación actualizada o `undefined` si no se encontró
   */
  async markAsRead(id: number) {
    const result = await sql`
      UPDATE notifications
      SET is_read = true
      WHERE id = ${id}
      RETURNING *;
    `;
    return result[0];
  }
}