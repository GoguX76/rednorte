import { describe, it, expect, mock, beforeEach } from "bun:test";

// Test del repositorio de notificaciones (capa de acceso a datos)
// El repositorio ejecuta consultas SQL usando el cliente 'postgres' con tagged templates

const mockSql = mock();

// mock.module reemplaza la exportación 'sql' de db/connection por un mock de Bun
// Esto evita conectar a PostgreSQL real durante los tests
mock.module("../db/connection", () => ({
  sql: mockSql,
}));

import { notificationRepository } from "./notification_repository";

describe("NotificationRepository", () => {
  // beforeEach: reinicia el mock de sql para que cada test tenga estado limpio
  beforeEach(() => {
    mockSql.mockReset();
  });

  describe("saveNotification", () => {
    it("debería insertar una notificación y retornar el registro creado", async () => {
      const fakeRow = {
        id: 1,
        user_id: "paciente-1",
        type: "turno_finalizado",
        message: "Tu turno ha terminado",
        is_read: false,
        created_at: new Date(),
      };

      // Simula que sql`INSERT...` devuelve un arreglo con la fila insertada
      mockSql.mockResolvedValue([fakeRow]);

      const result = await notificationRepository.saveNotification({
        userId: "paciente-1",
        type: "turno_finalizado",
        message: "Tu turno ha terminado",
      });

      expect(result).toEqual(fakeRow);
    });

    it("debería lanzar error si la inserción falla", async () => {
      const dbError = new Error("Constraint violation");
      mockSql.mockRejectedValue(dbError);

      await expect(
        notificationRepository.saveNotification({
          userId: "paciente-2",
          type: "recordatorio",
          message: "Tienes una cita mañana",
        }),
      ).rejects.toThrow(dbError);
    });
  });

  describe("getNotificationsByUser", () => {
    it("debería retornar las notificaciones de un usuario ordenadas por fecha descendente", async () => {
      const fakeRows = [
        { id: 2, user_id: "paciente-1", type: "recordatorio", message: "Cita mañana", is_read: false, created_at: new Date("2025-01-02") },
        { id: 1, user_id: "paciente-1", type: "turno_finalizado", message: "Tu turno ha terminado", is_read: true, created_at: new Date("2025-01-01") },
      ];

      mockSql.mockResolvedValue(fakeRows);

      const result = await notificationRepository.getNotificationsByUser("paciente-1");

      expect(result).toHaveLength(2);
      expect(result).toEqual(fakeRows);
    });

    it("debería retornar un arreglo vacío si el usuario no tiene notificaciones", async () => {
      mockSql.mockResolvedValue([]);

      const result = await notificationRepository.getNotificationsByUser("usuario-sin-notificaciones");

      expect(result).toEqual([]);
    });
  });

  describe("markAsRead", () => {
    it("debería marcar una notificación como leída", async () => {
      const fakeUpdatedRow = {
        id: 1,
        user_id: "paciente-1",
        type: "turno_finalizado",
        message: "Tu turno ha terminado",
        is_read: true,
        created_at: new Date(),
      };

      mockSql.mockResolvedValue([fakeUpdatedRow]);

      const result = await notificationRepository.markAsRead(1);

      expect(result).toEqual(fakeUpdatedRow);
      expect(result.is_read).toBe(true);
    });

    it("debería retornar undefined si la notificación no existe", async () => {
      mockSql.mockResolvedValue([]);

      const result = await notificationRepository.markAsRead(999);

      expect(result).toBeUndefined();
    });
  });
});
