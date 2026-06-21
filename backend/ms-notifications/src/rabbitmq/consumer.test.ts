import { describe, it, expect, mock, beforeEach, afterAll } from "bun:test";

// Test del consumidor de RabbitMQ
// startConsumer() se conecta a RabbitMQ, se suscribe a la cola y procesa mensajes

let consumeCallback: ((msg: any) => void) | null = null;
const mockAck = mock();
const mockNack = mock();
const mockConsume = mock(
  (_queue: string, cb: (msg: any) => void) => {
    consumeCallback = cb; // Guarda el callback para invocarlo manualmente en tests
  },
);
const mockAssertQueue = mock();
const mockCreateChannel = mock(() => ({
  assertQueue: mockAssertQueue,
  consume: mockConsume,
  ack: mockAck,
  nack: mockNack,
}));
const mockConnect = mock(() => ({
  createChannel: mockCreateChannel,
}));

// mock.module reemplaza 'amqplib' para evitar conexión real a RabbitMQ
mock.module("amqplib", () => ({
  default: { connect: mockConnect },
}));

// En lugar de mockear el servicio, se mockea el repositorio
// Así el servicio real se ejecuta y podemos verificar que se llamó a la BD
const mockSaveNotification = mock(() => Promise.resolve({ id: 1 }));
import { notificationRepository } from "../repository/notification_repository";
const originalSave = notificationRepository.saveNotification;
notificationRepository.saveNotification = mockSaveNotification;

import { startConsumer } from "./consumer";

describe("RabbitMQ Consumer", () => {
  // beforeEach: reinicia todos los mocks y configura los valores por defecto del canal
  beforeEach(() => {
    consumeCallback = null;
    mockAck.mockReset();
    mockNack.mockReset();
    mockConsume.mockReset();
    mockAssertQueue.mockReset();
    mockCreateChannel.mockReset();
    mockConnect.mockReset();
    mockSaveNotification.mockReset();

    mockConnect.mockResolvedValue({ createChannel: mockCreateChannel });
    mockCreateChannel.mockReturnValue({
      assertQueue: mockAssertQueue,
      consume: mockConsume,
      ack: mockAck,
      nack: mockNack,
    });
    mockAssertQueue.mockResolvedValue(undefined);
    mockConsume.mockImplementation(
      (_queue: string, cb: (msg: any) => void) => {
        consumeCallback = cb;
      },
    );
    mockSaveNotification.mockResolvedValue({ id: 1, user_id: "paciente-1" });
  });

  // afterAll: restaura el método original del repositorio para no contaminar otros tests
  afterAll(() => {
    notificationRepository.saveNotification = originalSave;
  });

  it("debería conectarse a RabbitMQ y crear el canal", async () => {
    await startConsumer();

    // Verifica que se estableció conexión, se creó canal y se declaró la cola
    expect(mockConnect).toHaveBeenCalled();
    expect(mockCreateChannel).toHaveBeenCalled();
    expect(mockAssertQueue).toHaveBeenCalledWith("notifications_queue", {
      durable: true,
    });
    expect(mockConsume).toHaveBeenCalledWith(
      "notifications_queue",
      expect.any(Function),
    );
  });

  it("debería procesar un mensaje válido, persistirlo y hacer ack", async () => {
    await startConsumer();

    // Simula un mensaje de RabbitMQ con todos los campos requeridos
    const msg = {
      content: Buffer.from(
        JSON.stringify({
          userId: "paciente-1",
          type: "turno_finalizado",
          message: "Tu turno ha terminado",
        }),
      ),
    };

    await consumeCallback!(msg);

    // Verifica que el service (vía repositorio) recibió los datos correctos
    expect(mockSaveNotification).toHaveBeenCalledWith({
      userId: "paciente-1",
      type: "turno_finalizado",
      message: "Tu turno ha terminado",
    });
    // Verifica que se hizo ack (mensaje procesado exitosamente)
    expect(mockAck).toHaveBeenCalledWith(msg);
    expect(mockNack).not.toHaveBeenCalled();
  });

  it("debería hacer nack sin reencolar si faltan campos requeridos (mensaje venenoso)", async () => {
    await startConsumer();

    // Mensaje con solo userId, sin type ni message
    const msg = {
      content: Buffer.from(JSON.stringify({ userId: "paciente-1" })),
    };

    await consumeCallback!(msg);

    // No debería persistir ni hacer ack, solo nack(false, false) = descartar
    expect(mockSaveNotification).not.toHaveBeenCalled();
    expect(mockNack).toHaveBeenCalledWith(msg, false, false);
  });

  it("debería hacer nack sin reencolar si el JSON es inválido (SyntaxError)", async () => {
    await startConsumer();

    const msg = {
      content: Buffer.from("JSON inválido"),
    };

    // Silencia console.error para no ensuciar la salida del test
    const originalConsoleError = console.error;
    console.error = mock();

    try {
      await consumeCallback!(msg);
    } finally {
      console.error = originalConsoleError;
    }

    // SyntaxError → nack(false, false) = descartar sin reintentar
    expect(mockSaveNotification).not.toHaveBeenCalled();
    expect(mockNack).toHaveBeenCalledWith(msg, false, false);
  });

  it("debería hacer nack con reencolar si el repository lanza un error", async () => {
    mockSaveNotification.mockRejectedValue(new Error("Error de base de datos"));

    await startConsumer();

    const msg = {
      content: Buffer.from(
        JSON.stringify({
          userId: "paciente-1",
          type: "turno_finalizado",
          message: "Tu turno ha terminado",
        }),
      ),
    };

    const originalConsoleError = console.error;
    console.error = mock();

    try {
      await consumeCallback!(msg);
    } finally {
      console.error = originalConsoleError;
    }

    // Error de proceso (no SyntaxError) → nack(false, true) = reencolar para reintentar
    expect(mockSaveNotification).toHaveBeenCalled();
    expect(mockNack).toHaveBeenCalledWith(msg, false, true);
  });

  it("NO debería procesar mensajes nulos", async () => {
    await startConsumer();

    // RabbitMQ envía null cuando no hay más mensajes
    await consumeCallback!(null);

    expect(mockSaveNotification).not.toHaveBeenCalled();
    expect(mockAck).not.toHaveBeenCalled();
    expect(mockNack).not.toHaveBeenCalled();
  });
});
