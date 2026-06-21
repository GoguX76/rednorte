import { notificationRepository } from "../repository/notification_repository";
import { notifyUserIfOnline } from "../websocket/connectionManager";
import type { EventPayload, NotificationEntry } from "../models/notifications";

// Constante que encapsula las funciones del servicio de notificaciones
export const notificationService = {
    // Mapea y procesa las notificaciones entrantes según los datos que requiere la base de datos y para evitar errores
    async processNotification(payload: EventPayload) {
        try {
            // Mapeamos los datos que nos manda RabbitMQ para enviarlos a la base de datos
            const entryToSave: NotificationEntry = {
                userId: payload.userId,
                type: payload.type,
                message: payload.message
            };

            // Ejecuta la consulta INSERT en la base de datos, PostgreSQL devuelve la fila creada y se guarda en savedRecord
            const savedRecord = await notificationRepository.saveNotification(entryToSave);
            // Logramos que el usuario reciba la notificación en el frontend de manera inmediata
            notifyUserIfOnline(payload.userId, savedRecord)

            console.log(`[+] Notificación procesada y guardaba para el usuario ${payload.userId}`)
            return savedRecord;
            
        } catch (error){
            console.error("[!] Error procesando la notificación:", error);
            throw error;
        }
    }
};