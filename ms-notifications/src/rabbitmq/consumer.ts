import amqp from 'amqplib';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://root:root123@localhost:5672'; // Valor URL de RabbitMQ
const QUEUE_NAME = 'notifications_queue'; // Nombre de la queue

// Función que consume los datos que se publican
export const startConsumer = async () => {
    try {
        const connection = await amqp.connect(RABBITMQ_URL) // Se conecta al URL de RabbitMQ
        const channel = await connection.createChannel(); // Crea un canal de comunicación

        await channel.assertQueue(QUEUE_NAME, { durable: true }); // Asegura que la queue existe, sino, la crea

        console.log(`[*] Esperando mensajes en la cola '${QUEUE_NAME}'...`);

        channel.consume(QUEUE_NAME, (msg) => {
            if (msg !== null) {
                const notificationData = JSON.parse(msg.content.toString());

                console.log(`[v] Mensaje recibido de RabbitMQ:`, notificationData);

                channel.ack(msg);
            }
        });
    } catch (error) {
        console.error("[!] Error iniciando el consumidor de RabbitMQ:", error)
    }
}