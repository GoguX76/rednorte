import { describe, it, expect, beforeEach } from "vitest";
import {
  $notifications,
  $unreadCount,
  addNotification,
  markAsRead,
} from "../notifications";

describe("notifications store", () => {
  beforeEach(() => {
    $notifications.set([]);
  });

  it("debería iniciar vacío", () => {
    expect($notifications.get()).toEqual([]);
    expect($unreadCount.get()).toBe(0);
  });

  it("addNotification debería agregar al inicio", () => {
    const n1 = {
      id: 1,
      user_id: "u1",
      type: "WAITLIST_STATUS_CHANGED",
      message: "Test 1",
      is_read: false,
      created_at: "2025-01-01T00:00:00Z",
    };
    const n2 = {
      id: 2,
      user_id: "u1",
      type: "WAITLIST_STATUS_CHANGED",
      message: "Test 2",
      is_read: false,
      created_at: "2025-01-02T00:00:00Z",
    };
    addNotification(n1);
    addNotification(n2);
    expect($notifications.get()).toHaveLength(2);
    expect($notifications.get()[0].id).toBe(2);
    expect($notifications.get()[1].id).toBe(1);
  });

  it("$unreadCount debería contar no leídas", () => {
    addNotification({
      id: 1,
      user_id: "u1",
      type: "WAITLIST_STATUS_CHANGED",
      message: "No leída",
      is_read: false,
      created_at: "2025-01-01T00:00:00Z",
    });
    addNotification({
      id: 2,
      user_id: "u1",
      type: "WAITLIST_STATUS_CHANGED",
      message: "Leída",
      is_read: false,
      created_at: "2025-01-02T00:00:00Z",
    });
    expect($unreadCount.get()).toBe(2);
  });

  it("markAsRead debería marcar una notificación como leída", () => {
    addNotification({
      id: 1,
      user_id: "u1",
      type: "WAITLIST_STATUS_CHANGED",
      message: "Test",
      is_read: false,
      created_at: "2025-01-01T00:00:00Z",
    });
    markAsRead(1);
    expect($notifications.get()[0].is_read).toBe(true);
    expect($unreadCount.get()).toBe(0);
  });

  it("markAsRead con ID inexistente no debería cambiar nada", () => {
    addNotification({
      id: 1,
      user_id: "u1",
      type: "WAITLIST_STATUS_CHANGED",
      message: "Test",
      is_read: false,
      created_at: "2025-01-01T00:00:00Z",
    });
    markAsRead(999);
    expect($notifications.get()[0].is_read).toBe(false);
  });
});
