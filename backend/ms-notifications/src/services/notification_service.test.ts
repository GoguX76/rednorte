import { describe, it, expect, mock, beforeAll, beforeEach, afterAll } from "bun:test";
import { notificationRepository } from "../repository/notification_repository";
import { activeConnections } from "../websocket/connectionManager";
import { notificationService } from "./notification_service";

// Test del servicio de notificaciones (capa de lógica de negocio)
// El servicio orquesta: recibe un payload, lo persiste vía repository, y notifica por WebSocket
describe("NotificationService", () => {
  const validPayload = {
    userId: "paciente-1",
    type: "turno_finalizado",
    newStatus: "completed",
    message: "Tu turno ha terminado",
    timestamp: "2025-01-01T12:00:00Z",
  };

  const expectedEntry = {
    userId: "paciente-1",
    type: "turno_finalizado",
    message: "Tu turno ha terminado",
  };

  const savedNotification = {
    id: 1,
    user_id: "paciente-1",
    type: "turno_finalizado",
    message: "Tu turno ha terminado",
    is_read: false,
    created_at: new Date(),
  };

  const mockSaveNotification = mock();
  const mockWs = { send: mock() };

  const originalSave = notificationRepository.saveNotification;

  // Se reemplaza saveNotification del repositorio por un mock para evitar usar BD real
  beforeAll(() => {
    notificationRepository.saveNotification = mockSaveNotification;
  });

  // afterAll: se restaura el método original y se limpia el Map de conexiones WS
  afterAll(() => {
    notificationRepository.saveNotification = originalSave;
    activeConnections.clear();
  });

  // beforeEach: se reinician los mocks y el Map para que cada test arranque limpio
  beforeEach(() => {
    mockSaveNotification.mockReset();
    mockWs.send.mockReset();
    activeConnections.clear();
  });

  it("debería mapear el payload y guardar la notificación en la base de datos", async () => {
    mockSaveNotification.mockResolvedValue(savedNotification);

    const result = await notificationService.processNotification(validPayload);

    // Verifica que el service mapeó EventPayload a NotificationEntry correctamente
    expect(mockSaveNotification).toHaveBeenCalledWith(expectedEntry);
    // Verifica que retorna lo que devolvió el repository
    expect(result).toEqual(savedNotification);
  });

  it("debería notificar al usuario vía WebSocket después de guardar", async () => {
    activeConnections.set("paciente-1", mockWs);
    mockSaveNotification.mockResolvedValue(savedNotification);

    await notificationService.processNotification(validPayload);

    // Verifica que el WebSocket del usuario recibió la notificación como JSON
    expect(mockWs.send).toHaveBeenCalledWith(
      JSON.stringify(savedNotification),
    );
  });

  it("debería lanzar un error si el repositorio falla y NO notificar por WebSocket", async () => {
    activeConnections.set("paciente-1", mockWs);
    const dbError = new Error("Error de conexión a la BD");
    mockSaveNotification.mockRejectedValue(dbError);

    // Verifica que el error se propaga
    await expect(
      notificationService.processNotification(validPayload),
    ).rejects.toThrow(dbError);

    // Verifica que NO se intentó enviar WebSocket porque el guardado falló
    expect(mockWs.send).not.toHaveBeenCalled();
  });

  it("debería retornar la notificación con los campos esperados", async () => {
    mockSaveNotification.mockResolvedValue(savedNotification);

    const result = await notificationService.processNotification(validPayload);

    // Verifica que la estructura del objeto retornado contiene los campos clave
    expect(result).toHaveProperty("id", 1);
    expect(result).toHaveProperty("user_id", "paciente-1");
    expect(result).toHaveProperty("type", "turno_finalizado");
    expect(result).toHaveProperty("message", "Tu turno ha terminado");
  });
});
