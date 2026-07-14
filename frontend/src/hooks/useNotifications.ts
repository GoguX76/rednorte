import { useEffect, useRef } from 'preact/hooks';
import { addNotification, type Notification } from '../stores/notifications';

/** URL del WebSocket server para notificaciones en tiempo real. */
const WS_URL = import.meta.env.PUBLIC_WS_URL || 'ws://localhost:3002/ws';

/**
 * Reproduce un sonido breve de notificación usando la Web Audio API.
 *
 * Genera un tono sinusoidal que desciende de 800Hz a 400Hz durante
 * 0.3 segundos con fade-out gradual. Se ejecuta de forma síncrona
 * cuando llega un mensaje por WebSocket.
 */
function playDropSound() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch {
  }
}

/**
 * Hook personalizado que gestiona la conexión WebSocket para
 * recibir notificaciones en tiempo real.
 *
 * Características:
 * - Se conecta automáticamente cuando `userId` no es null
 * - Implementa reconexión con backoff exponencial (2s → 15s máximo)
 * - Al recibir un mensaje, lo agrega al store de notificaciones
 * - Reproduce un sonido de notificación al recibir cada mensaje
 * - Se desconecta limpiamente al desmontar el componente o cambiar userId
 *
 * @param userId - UUID del usuario autenticado o `null` si no hay sesión
 */
export function useNotifications(userId: string | null) {
  const wsRef = useRef<WebSocket | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!userId) return;

    let ws: WebSocket | null = null;
    let reconnectMs = 2000;
    let closed = false;

    function connect() {
      if (closed) return;
      ws = new WebSocket(`${WS_URL}?userId=${userId}`);
      wsRef.current = ws;

      ws.onopen = () => {
        reconnectMs = 2000;
      };

      ws.onmessage = (event) => {
        try {
          const data: Notification = JSON.parse(event.data);
          addNotification(data);
          playDropSound();
        } catch {
        }
      };

      ws.onclose = () => {
        if (closed) return;
        timerRef.current = setTimeout(() => {
          reconnectMs = Math.min(reconnectMs * 1.5, 15000);
          connect();
        }, reconnectMs);
      };
    }

    connect();

    return () => {
      closed = true;
      if (timerRef.current) clearTimeout(timerRef.current);
      if (ws) ws.close();
    };
  }, [userId]);
}
