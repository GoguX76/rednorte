// Almacena la relación de userId a un WebSocket
export const activeConnections = new Map<string, any>();

// Función que verifica que el usuario se encuentre conectado
export const notifyUserIfOnline = (userId: string, payload: any) => {
    if (activeConnections.has(userId)) {
        const ws = activeConnections.get(userId);
        ws.send(JSON.stringify(payload));
    } else {
        console.log("El usuario se encuentra offline")
    };
};

// Función para registrar un usuario cuando abre su conexión
export const addConnection = (userId: string, ws: any) => {
    activeConnections.set(userId, ws);
    console.log(`[+] Usuario ${userId} está conectado`);
}

// Función para limpiar la memoria cuando el usuario se desconecta
export const removeConnection = (userId: string) => {
    activeConnections.delete(userId);
    console.log(`[-] Usuario ${userId} desconectado`)
}