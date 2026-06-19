import { atom, computed } from 'nanostores';

export type Notification = {
  id: number;
  user_id: string;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

export const $notifications = atom<Notification[]>([]);

export const $unreadCount = computed($notifications, (notifs) =>
  notifs.filter((n) => !n.is_read).length,
);

export function addNotification(n: Notification) {
  $notifications.set([n, ...$notifications.get()]);
}

export function markAsRead(id: number) {
  $notifications.set(
    $notifications.get().map((n) => (n.id === id ? { ...n, is_read: true } : n)),
  );
}
