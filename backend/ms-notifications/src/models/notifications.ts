/**
 * Representación de una notificación almacenada en la base de datos.
 *
 * Se persiste en la tabla `notifications` de PostgreSQL y se entrega
 * al usuario a través de WebSocket en tiempo real o al consultar el
 * endpoint de notificaciones.
 *
 * @property id - ID numérico autoincremental generado por PostgreSQL
 * @property userId - UUID del usuario destinatario de la notificación
 * @property type - Tipo de evento que generó la notificación (ej: `turno_asignado`, `turno_finalizado`)
 * @property message - Mensaje descriptivo de la notificación
 * @property isRead - Indica si el usuario ya leyó la notificación
 * @property createdAt - Timestamp de creación de la notificación
 */
export interface NotificationEntry {
  id?: number;
  userId: string;
  type: string;
  message: string;
  isRead?: boolean;
  createdAt?: Date;
}

/**
 * Payload de un evento recibido desde RabbitMQ.
 *
 * Representa el mensaje que el productor (ms-waitlist) envía cuando
 * se produce un cambio de estado en la lista de espera.
 *
 * @property userId - UUID del usuario afectado por el cambio
 * @property type - Tipo de evento (ej: `turno_asignado`, `turno_finalizado`)
 * @property newStatus - Nuevo estado de la entrada en la lista de espera
 * @property message - Mensaje descriptivo del evento
 * @property timestamp - Timestamp ISO 8601 de cuándo ocurrió el evento
 */
export interface EventPayload {
  userId: string;
  type: string;
  newStatus: string;
  message: string;
  timestamp: string;
}
