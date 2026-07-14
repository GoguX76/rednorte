import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent, screen } from "@testing-library/preact";
import NotificationBell from "../NotificationBell";
import {
  $notifications,
  addNotification,
} from "../../stores/notifications";

beforeEach(() => {
  $notifications.set([]);
});

describe("NotificationBell", () => {
  it("debería renderizar el ícono de campana", () => {
    render(<NotificationBell />);
    expect(screen.getByLabelText("Notificaciones")).toBeDefined();
  });

  it("debería mostrar badge con conteo de no leídas", () => {
    addNotification({
      id: 1,
      user_id: "u1",
      type: "WAITLIST_STATUS_CHANGED",
      message: "Test",
      is_read: false,
      created_at: "2025-01-01T00:00:00Z",
    });
    addNotification({
      id: 2,
      user_id: "u1",
      type: "WAITLIST_STATUS_CHANGED",
      message: "Test 2",
      is_read: false,
      created_at: "2025-01-02T00:00:00Z",
    });

    render(<NotificationBell />);
    expect(screen.getByText("2")).toBeDefined();
  });

  it("debería abrir y cerrar el dropdown al hacer clic", async () => {
    render(<NotificationBell />);

    const button = screen.getByLabelText("Notificaciones");
    await fireEvent.click(button);
    expect(screen.getByText("Notificaciones")).toBeDefined();
    expect(screen.getByText("No hay notificaciones")).toBeDefined();

    await fireEvent.click(button);
    expect(screen.queryByText("No hay notificaciones")).toBeNull();
  });

  it("debería mostrar notificaciones en el dropdown", async () => {
    addNotification({
      id: 1,
      user_id: "u1",
      type: "WAITLIST_STATUS_CHANGED",
      message: "Tu turno ha cambiado",
      is_read: false,
      created_at: "2025-06-15T10:30:00Z",
    });

    render(<NotificationBell />);
    await fireEvent.click(screen.getByLabelText("Notificaciones"));

    expect(screen.getByText("Tu turno ha cambiado")).toBeDefined();
  });
});
