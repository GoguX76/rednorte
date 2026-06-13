export interface NotificationEntry {
  id?: number;
  userId: string;
  type: string;
  message: string;
  isRead?: boolean;
  createdAt?: Date;
}

export interface EventPayload {
  userId: string;
  type: string;
  newStatus: string;
  message: string;
  timestamp: string;
}
