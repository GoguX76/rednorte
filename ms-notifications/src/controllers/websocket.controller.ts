import { Hono } from "hono";
import { createBunWebSocket } from "hono/bun";
import { addConnection, removeConnection } from "../websocket/connectionManager";

const wsApp = new Hono(); // Permite manejar métodos CRUD y HTTP
export const { upgradeWebSocket, websocket } = createBunWebSocket();

wsApp.get(
    '/',
    upgradeWebSocket((c) => {
        const userId = c.req.query('userId'); // Obtiene la userId

        // Verifica que exista un userId
        if (!userId) {
            console.log("[!] Intento de conexión sin userId")
        }

        return {
            // Se abre la conexión y la añade a la función de addConnection
            onOpen(event, ws) {
                if (userId) {
                    addConnection(userId, ws)
                } else {
                    console.log("[!] El userId es inválido")
                };
            },
            // onMessage cuando el cliente envíe datos
            onMessage(event, ws) {
                console.log(`Mensaje del cliente: ${event.data}`)
            },
            // Se ejecuta onClose cuando el túnel de rompe o el cliente de desconecta
            onClose(event, ws) {
                if(userId) {
                    removeConnection(userId)
                };
            }
        };
    })
)

export default wsApp;