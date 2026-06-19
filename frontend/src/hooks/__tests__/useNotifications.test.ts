import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/preact";
import { useNotifications } from "../useNotifications";
import { $notifications } from "../../stores/notifications";

interface WsMap {
  ws: RealFakeWebSocket | null;
}

class RealFakeWebSocket {
  url: string;
  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  close = vi.fn();
  readyState = 0;

  constructor(url: string) {
    const wsMap = (globalThis as any).__wsMap;
    this.url = url;
    if (wsMap) wsMap.ws = this;
  }
}

let wsMap: WsMap;

beforeEach(() => {
  $notifications.set([]);
  wsMap = { ws: null };
  (globalThis as any).__wsMap = wsMap;
  vi.stubGlobal("WebSocket", RealFakeWebSocket as any);
  vi.stubGlobal("AudioContext", vi.fn(() => ({
    createOscillator: vi.fn(() => ({
      type: "",
      frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    })),
    createGain: vi.fn(() => ({
      gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
    })),
    destination: {},
    currentTime: 0,
  })));
  vi.useFakeTimers();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

function getWs(): RealFakeWebSocket {
  if (!wsMap.ws) throw new Error("WebSocket no creado");
  return wsMap.ws;
}

describe("useNotifications", () => {
  it("debería conectar WebSocket si hay userId", () => {
    renderHook(() => useNotifications("user-123"));
    expect(getWs().url).toContain("userId=user-123");
  });

  it("no debería conectar si userId es null", () => {
    renderHook(() => useNotifications(null));
    expect(wsMap.ws).toBeNull();
  });

  it("debería agregar notificación al recibir mensaje", () => {
    renderHook(() => useNotifications("user-123"));

    const notificationPayload = {
      id: 1,
      user_id: "user-123",
      type: "WAITLIST_STATUS_CHANGED",
      message: "Tu turno ha cambiado",
      is_read: false,
      created_at: new Date().toISOString(),
    };

    act(() => {
      getWs().onmessage?.({ data: JSON.stringify(notificationPayload) } as MessageEvent);
    });

    expect($notifications.get()).toHaveLength(1);
    expect($notifications.get()[0].message).toBe("Tu turno ha cambiado");
  });

  it("debería reconectar al cerrarse el WebSocket", () => {
    renderHook(() => useNotifications("user-123"));
    const firstWs = getWs();

    act(() => {
      firstWs.onclose?.({ code: 1006, reason: "Connection lost" } as CloseEvent);
    });

    vi.advanceTimersByTime(2000);
    const secondWs = getWs();

    expect(secondWs).not.toBe(firstWs);
  });

  it("debería cerrar WebSocket al desmontar", () => {
    const { unmount } = renderHook(() => useNotifications("user-123"));
    unmount();
    expect(getWs().close).toHaveBeenCalled();
  });
});
