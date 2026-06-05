import amqp from 'amqplib';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://root:root123@localhost:5672'; // Valor URL de RabbitMQ
const QUEUE_NAME = 'notifications_queue'; // Nombre de la queue

export const publishNotification = async (payload: any) => {
    try {
        const connection = await amqp.connect(RABBITMQ_URL); // Se conecta al URL de RabbitMQ
        const channel = await connection.createChannel(); // Crea un canal de comunicación

        await channel.assertQueue(QUEUE_NAME, { durable: true }); // Asegura que la queue existe, sino, la crea
        channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(payload))); // Transforma el objeto a un buffer y lo envía en formato JSON

        console.log("Evento enviado a RabbitMQ:", payload);

        // Cierra la conexión un instante para liberar memoria
        setTimeout(() => {
            connection.close();
        }, 500);
    } catch (error) {
        console.error("Error en el Productor de RabbitMQ:", error);
    }
};