import { describe, it, expect, mock, beforeEach } from "bun:test";
import {
  activeConnections,
  notifyUserIfOnline,
  addConnection,
  removeConnection,
} from "../websocket/connectionManager";

describe("Connection Manager (WebSockets)", () => {
  // Limpiamos la memoria antes de cada prueba para evitar que un test contamine a otro
  beforeEach(() => {
    activeConnections.clear();
  });

  it("Debería agregar una conexión al Map exitosamente", () => {
    const userId = "paciente-1";
    const mockWs = { send: mock() }; // Objeto falso con una función espía

    addConnection(userId, mockWs);

    expect(activeConnections.has(userId)).toBe(true);
    expect(activeConnections.get(userId)).toEqual(mockWs);
  });

  it("Debería remover una conexión del Map", () => {
    const userId = "paciente-2";
    const mockWs = { send: mock() };
    
    addConnection(userId, mockWs); // Entra
    removeConnection(userId);      // Sale

    expect(activeConnections.has(userId)).toBe(false);
  });

  it("Debería enviar el payload por WebSocket si el usuario está online", () => {
    const userId = "paciente-3";
    const mockWs = { send: mock() };
    const payloadTest = { message: "Tu turno ha terminado" };
    
    addConnection(userId, mockWs);
    notifyUserIfOnline(userId, payloadTest);

    // Verificamos que la función send() fue ejecutada
    expect(mockWs.send).toHaveBeenCalled();
    // Verificamos que se envió exactamente el JSON convertido a texto
    expect(mockWs.send).toHaveBeenCalledWith(JSON.stringify(payloadTest));
  });

  it("NO debería explotar si intenta notificar a un usuario offline", () => {
    const userId = "fantasma-404";
    const payloadTest = { message: "Nadie me escucha" };

    // Ejecutamos la función esperando que NO arroje ningún error (Crash)
    expect(() => notifyUserIfOnline(userId, payloadTest)).not.toThrow();
  });
});