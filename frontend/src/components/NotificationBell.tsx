import { useState, useRef, useEffect } from 'preact/hooks';
import { useStore } from '@nanostores/preact';
import { $notifications, $unreadCount, markAsRead } from '../stores/notifications';

const TYPE_ICONS: Record<string, string> = {
  WAITLIST_STATUS_CHANGED: '🔄',
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const notifications = useStore($notifications);
  const unreadCount = useStore($unreadCount);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} class="relative">
      <button
        onClick={() => setOpen(!open)}
        class="relative p-1.5 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
        aria-label="Notificaciones"
      >
        <svg class="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-5.2-5.98V3a.8.8 0 00-1.6 0v.02A6 6 0 006 11v3.159c0 .538-.214 1.055-.595 1.435L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span class="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[16px] h-4 px-1 text-[10px] font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div class="absolute top-full left-full ml-2 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-lg z-50 max-h-96 flex flex-col">
          <div class="px-4 py-3 border-b border-slate-100 font-semibold text-sm text-slate-700">
            Notificaciones
          </div>
          <div class="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div class="px-4 py-8 text-center text-sm text-slate-400">
                No hay notificaciones
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => markAsRead(n.id)}
                  class={`w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer ${
                    !n.is_read ? 'bg-blue-50/40' : ''
                  }`}
                >
                  <div class="flex items-start gap-2">
                    <span class="text-base mt-0.5 shrink-0">
                      {TYPE_ICONS[n.type] || '🔔'}
                    </span>
                    <div class="min-w-0">
                      <p class={`text-sm ${!n.is_read ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>
                        {n.message}
                      </p>
                      <p class="text-[11px] text-slate-400 mt-0.5">
                        {new Date(n.created_at).toLocaleString('es-ES', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
