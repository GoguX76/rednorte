import { atom, computed } from 'nanostores';

/**
 * Representación de una notificación en el frontend.
 *
 * Se recibe desde el WebSocket o se carga desde la API de notificaciones.
 */
export type Notification = {
  /** ID numérico de la notificación */
  id: number;
  /** UUID del usuario destinatario */
  user_id: string;
  /** Tipo de evento que generó la notificación (ej: `WAITLIST_STATUS_CHANGED`) */
  type: string;
  /** Mensaje descriptivo de la notificación */
  message: string;
  /** Indica si el usuario ya leyó la notificación */
  is_read: boolean;
  /** Timestamp ISO 8601 de creación de la notificación */
  created_at: string;
};

/** Store atómico que almacena todas las notificaciones del usuario. */
export const $notifications = atom<Notification[]>([]);

/**
 * Store computado que retorna la cantidad de notificaciones no leídas.
 *
 * Se recalcula automáticamente cada vez que cambia `$notifications`.
 */
export const $unreadCount = computed($notifications, (notifs) =>
  notifs.filter((n) => !n.is_read).length,
);

/**
 * Agrega una nueva notificación al inicio de la lista.
 *
 * Se usa al recibir un mensaje por WebSocket para que las
 * notificaciones más recientes aparezcan primero.
 *
 * @param n - Notificación a agregar
 */
export function addNotification(n: Notification) {
  $notifications.set([n, ...$notifications.get()]);
}

/**
 * Marca una notificación como leída por su ID.
 *
 * Actualiza el store modificando el campo `is_read` de la
 * notificación correspondiente.
 *
 * @param id - ID numérico de la notificación a marcar
 */
export function markAsRead(id: number) {
  $notifications.set(
    $notifications.get().map((n) => (n.id === id ? { ...n, is_read: true } : n)),
  );
}
