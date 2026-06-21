import { describe, it, expect, mock, beforeEach } from "bun:test";

const mockSendToQueue = mock();
const mockAssertQueue = mock();
const mockClose = mock();
const mockCreateChannel = mock(() => ({
  assertQueue: mockAssertQueue,
  sendToQueue: mockSendToQueue,
  close: mockClose,
}));
const mockConnect = mock(() => ({
  createChannel: mockCreateChannel,
}));

mock.module("amqplib", () => ({
  default: { connect: mockConnect },
}));

import { publishNotification } from "./producer";

describe("RabbitMQ Producer", () => {
  beforeEach(() => {
    mockConnect.mockReset();
    mockCreateChannel.mockReset();
    mockAssertQueue.mockReset();
    mockSendToQueue.mockReset();
    mockClose.mockReset();

    mockConnect.mockResolvedValue({ createChannel: mockCreateChannel });
    mockCreateChannel.mockReturnValue({
      assertQueue: mockAssertQueue,
      sendToQueue: mockSendToQueue,
      close: mockClose,
    });
    mockAssertQueue.mockResolvedValue(undefined);
  });

  it("debería conectarse a RabbitMQ, declarar la cola y enviar el mensaje", async () => {
    const payload = { userId: "test-1", type: "TEST", message: "Prueba" };

    await publishNotification(payload);

    expect(mockConnect).toHaveBeenCalled();
    expect(mockCreateChannel).toHaveBeenCalled();
    expect(mockAssertQueue).toHaveBeenCalledWith("notifications_queue", {
      durable: true,
    });
    expect(mockSendToQueue).toHaveBeenCalledWith(
      "notifications_queue",
      Buffer.from(JSON.stringify(payload)),
    );
  });

  it("no debería lanzar error si RabbitMQ no está disponible", async () => {
    mockConnect.mockRejectedValue(new Error("Connection refused"));

    const payload = { userId: "test-2", type: "TEST", message: "Fallo" };

    const originalConsole = console.error;
    console.error = mock();

    try {
      await publishNotification(payload);
    } finally {
      console.error = originalConsole;
    }

    expect(mockConnect).toHaveBeenCalled();
  });
});
