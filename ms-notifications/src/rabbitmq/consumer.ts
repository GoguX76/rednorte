import amqp from 'amqplib';
import { notificationService } from '../services/notification_service';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://root:root123@localhost:5672'; // Valor URL de RabbitMQ
const QUEUE_NAME = 'notifications_queue'; // Nombre de la queue

// Función que consume los datos que se publican
export const startConsumer = async () => {
    try {
        const connection = await amqp.connect(RABBITMQ_URL) // Se conecta al URL de RabbitMQ
        const channel = await connection.createChannel(); // Crea un canal de comunicación

        await channel.assertQueue(QUEUE_NAME, { durable: true }); // Asegura que la queue existe, sino, la crea

        console.log(`[*] Esperando mensajes en la cola '${QUEUE_NAME}'...`);

        channel.consume(QUEUE_NAME, async (msg) => {
            if (msg !== null) {
                try {
                    const notificationData = JSON.parse(msg.content.toString());
                    console.log(`[v] Mensaje recibido de RabbitMQ:`, notificationData);

                    if (!notificationData.userId || !notificationData.type || !notificationData.message) {
                        console.error("[!] Mensaje venenoso: Faltan campos requeridos.");
                        return channel.nack(msg, false, false);
                    }

                    await notificationService.processNotification(notificationData)

                    channel.ack(msg);
                } catch (processingError){
                    console.error("[!] Error al procesar el contenido del mensaje:", processingError)

                    if (processingError instanceof SyntaxError) {
                        channel.nack(msg, false, false);
                    } else {
                        channel.nack(msg, false, true);
                    }
                }
            }
        });
    } catch (error) {
        console.error("[!] Error iniciando el consumidor de RabbitMQ:", error)
    }
}