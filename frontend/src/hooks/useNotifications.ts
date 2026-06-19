import { useEffect, useRef } from 'preact/hooks';
import { addNotification, type Notification } from '../stores/notifications';

const WS_URL = 'ws://localhost:3002/ws';

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
