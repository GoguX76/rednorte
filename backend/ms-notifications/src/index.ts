import { startConsumer } from "./rabbitmq/consumer";
import { addConnection, removeConnection } from "./websocket/connectionManager";
import { AppError } from "./lib/app-error";
import { handleError } from "./lib/error-handler";

/** Puerto del servidor HTTP y WebSocket (por defecto 3002). */
const PORT = parseInt(Bun.env.PORT || "3002");

/**
 * Punto de entrada del microservicio de Notificaciones (ms-notifications).
 *
 * Este servicio opera de forma diferente a los demás:
 * - **No usa Hono**, sino `Bun.serve()` directamente para soporte nativo de WebSockets
 * - Inicia el consumer de RabbitMQ al arrancar (escucha la cola `notifications_queue`)
 * - Expone un endpoint `/health` para verificación de salud
 * - Expone un endpoint WebSocket `/ws` que acepta `?userId=UUID`
 *
 * Flujo WebSocket:
 * 1. El cliente se conecta a `ws://localhost:3002/ws?userId=UUID`
 * 2. Se registra la conexión en el `connectionManager`
 * 3. Cuando llega un mensaje desde RabbitMQ, se notifica al usuario en tiempo real
 * 4. Al desconectarse, se remueve la conexión del mapa
 */
console.log("[*] Inicializando servicios de ms-notifications");
await startConsumer();

const server = Bun.serve<{ userId: string }>({
    port: PORT,

    fetch(req, server) {
        try {
            const url = new URL(req.url);

            if (url.pathname === "/health") {
                return Response.json({ status: "ok", service: "ms-notifications" });
            }

            if (url.pathname === "/ws") {
                const userId = url.searchParams.get("userId");

                if(!userId) {
                    throw new AppError("Se requiere un userId", 400);
                }

                const success = server.upgrade(req, {
                    data: { userId }
                });

                if (success) return undefined;
                throw new AppError("Fallo al conectar WebSocket", 500);
            }

            throw new AppError("Ruta no encontrada", 404);
        } catch (err) {
            return handleError(err as Error);
        }
    },

    websocket: {
        open(ws) {
            console.log(`[WS] Usuario conectado con ID: ${ws.data.userId}`);
            addConnection(ws.data.userId, ws)
        },
        message(ws, message) {
            console.log(`[WS] Mensaje ignorado del usuario ${ws.data.userId}`);
        },
        close(ws, code, message) {
            console.log(`[WS] Usuario desconectado con ID: ${ws.data.userId}`);
            removeConnection(ws.data.userId)
        }
    }
});

console.log(`[🚀] Servidor HTTP escuchando en http://localhost:${server.port}`);
console.log(`[🚀] WebSockets listos en ws://localhost:${server.port}/ws`);