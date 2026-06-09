import { startConsumer } from "./rabbitmq/consumer";
import { addConnection, removeConnection } from "./websocket/connectionManager";

// Arrancamos el servicio de RabbitMQ
console.log("[*] Inicializando servicios de ms-notifications");
await startConsumer();

// Arrancamos el servidor web y WebSockets
const server = Bun.serve<{ userId: string }>({
    port: 3002,

    fetch(req, server) {
        const url = new URL(req.url);

        if (url.pathname === "/ws") {
            const userId = url.searchParams.get("userId");
            
            if(!userId) {
                return new Response("Se requiere un userId", { status: 400 });
            }

            const success = server.upgrade(req, {
                data: { userId }
            });

            if (success) return undefined;
            return new Response("Fallo al conectar WebSocket", { status: 500 });
        }

        return new Response("Not found", { status: 400 });
    },

    websocket: {
        open(ws) {
            console.log(`[WS] 🟢 Usuario conectado con ID: ${ws.data.userId}`);
            addConnection(ws.data.userId, ws)
        },
        message(ws, message) {
            console.log(`[WS] 📩 Mensaje ignorado del usuario ${ws.data.userId}`);
        },
        close(ws, code, message) {
            console.log(`[WS] 🔴 Usuario desconectado con ID: ${ws.data.userId}`);
            removeConnection(ws.data.userId)
        }
    }
});

console.log(`[🚀] Servidor HTTP escuchando en http://localhost:${server.port}`);
console.log(`[🚀] WebSockets listos en ws://localhost:${server.port}/ws`);