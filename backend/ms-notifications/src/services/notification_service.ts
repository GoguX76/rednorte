import { notificationRepository } from "../repositories/notification_repository";
import { notifyUserIfOnline } from "../websocket/connectionManager";
import type { EventPayload, NotificationEntry } from "../models/notifications";

/**
 * Servicio de procesamiento de notificaciones.
 *
 * Recibe eventos desde RabbitMQ, los transforma al formato de
 * almacenamiento, persiste la notificación y la entrega en
 * tiempo real al usuario a través de WebSocket si está conectado.
 */
export const notificationService = {
  /**
   * Procesa un evento entrante de RabbitMQ.
   *
   * Flujo:
   * 1. Extrae userId, type y message del payload de RabbitMQ
   * 2. Persiste la notificación en PostgreSQL
   * 3. Notifica al usuario por WebSocket si está conectado
   *
   * @param payload - Evento recibido desde RabbitMQ con los datos del cambio de estado
   * @returns La notificación persistida con su ID y timestamp
   * @throws {Error} Si falla la inserción en la base de datos
   */
  async processNotification(payload: EventPayload) {
    try {
      const entryToSave: NotificationEntry = {
        userId: payload.userId,
        type: payload.type,
        message: payload.message
      };

      const savedRecord = await notificationRepository.saveNotification(entryToSave);
      notifyUserIfOnline(payload.userId, savedRecord)

      console.log(`[+] Notificación procesada y guardaba para el usuario ${payload.userId}`)
      return savedRecord;
      
    } catch (error){
      console.error("[!] Error procesando la notificación:", error);
      throw error;
    }
  }
};