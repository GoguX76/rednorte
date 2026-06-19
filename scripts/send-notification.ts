import amqp from 'amqplib';

const {
  RABBITMQ_URL = 'amqp://root:root123@localhost:5672',
  USER_ID = '',
  TYPE = 'TEST',
  NEW_STATUS = '',
  MESSAGE = '',
} = process.env;

const userId = USER_ID || process.argv[2] || '';
const type = TYPE || process.argv[3] || 'TEST';
const newStatus = NEW_STATUS || process.argv[4] || '';
const message = MESSAGE || process.argv[5] || `Notificación de prueba (${type})`;

if (!userId) {
  console.error('Uso: bun run scripts/send-notification.ts <userId> [type] [newStatus] [message]');
  console.error('  También via variables de entorno: USER_ID, TYPE, NEW_STATUS, MESSAGE');
  process.exit(1);
}

const payload = {
  userId,
  type,
  ...(newStatus && { newStatus }),
  message,
  timestamp: new Date().toISOString(),
};

const QUEUE_NAME = 'notifications_queue';

try {
  const connection = await amqp.connect(RABBITMQ_URL);
  const channel = await connection.createChannel();
  await channel.assertQueue(QUEUE_NAME, { durable: true });

  channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(payload)));
  console.log(`[✓] Notificación enviada a "${QUEUE_NAME}":`);
  console.log(JSON.stringify(payload, null, 2));

  await new Promise((resolve) => setTimeout(resolve, 500));
  await connection.close();
  process.exit(0);
} catch (err) {
  console.error('[✗] Error al enviar notificación:', err);
  process.exit(1);
}
