import { sql } from "../db/connection";
import type { NotificationEntry } from "../models/notifications";

// Constante que encapsula las funciones del repositorio de notificaciones
export const notificationRepository = {
    // Función que inserta una nueva notificación a la base de datos
    async saveNotification(entry: NotificationEntry) {
        // Inserta los datos a la base de datos de notificaiones
        const result = await sql`
            INSERT INTO notifications (user_id, type, message)
            VALUES (${entry.userId}, ${entry.type}, ${entry.message})
            RETURNING *;
        `;
        // Retorna el primer elemento del array
        return result[0];
    },

    // Función que obtiene las notificaciones por el usuario
    async getNotificationsByUser(userId: string) {
        // Consulta que obtiene todas las notificaciones mediante el ID del usuario
        const result = await sql`
            SELECT * FROM notifications
            WHERE user_id = ${userId}
            ORDER BY created_at DESC;
        `;
        // Retorna el resultado
        return result;
    },

    // Función para marcar como leído en el frontend
    async markAsRead(id: number) {
        // Consulta que actualiza el estado de la notificación a leído
        const result = await sql`
            UPDATE notifications
            SET is_read = true
            WHERE id = ${id}
            RETURNING *;
        `;
        // Retorna el primer elemento del array
        return result[0];
    }
}