import { useState, useEffect } from 'preact/hooks';
import { useStore } from '@nanostores/preact';
import { $user, logout, initAuth } from '../stores/auth';
import NotificationBell from './NotificationBell';
import { useNotifications } from '../hooks/useNotifications';

const NAV_ITEMS = [
  { href: '/', label: 'Inicio', icon: '🏠' },
  { href: '/about', label: 'Quiénes Somos', icon: 'ℹ️' },
  { href: '/waitlist', label: 'Lista de Espera', icon: '📋' },
];

export default function Sidebar() {
  const user = useStore($user);
  const [isOpen, setIsOpen] = useState(false);

  useNotifications(user?.id ?? null);

  useEffect(() => {
    initAuth();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    logout();
  };

  const close = () => setIsOpen(false);

  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={() => setIsOpen(true)}
        class="fixed top-4 left-4 z-20 p-2.5 rounded-xl bg-white border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors cursor-pointer"
        aria-label="Abrir menú"
      >
        <svg class="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          class="fixed inset-0 bg-black/30 z-30 transition-opacity"
          onClick={close}
        />
      )}

      {/* Sidebar */}
      <aside
        class={`fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-200 flex flex-col z-40 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Close button */}
        <div class="flex items-center justify-between p-4 border-b border-slate-100">
          <a href="/" class="text-xl font-bold text-blue-900 tracking-tight" onClick={close}>
            RedNorte
          </a>
          <div class="flex items-center gap-1">
            {user && <NotificationBell />}
            <button
              onClick={close}
              class="p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Cerrar menú"
            >
              <svg class="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav class="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={close}
              class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 hover:bg-blue-50 hover:text-blue-900 font-medium transition-colors"
            >
              <span class="text-xl">{item.icon}</span>
              {item.label}
            </a>
          ))}
        </nav>

        {/* Auth section */}
        <div class="p-4 border-t border-slate-200">
          {user ? (
            <div class="space-y-2">
              <div class="px-4 py-2 text-sm text-slate-500 truncate bg-slate-50 rounded-lg">
                {user.email}
              </div>
              <button
                onClick={() => { handleLogout(); close(); }}
                class="w-full text-left px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 font-medium transition-colors cursor-pointer"
              >
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <div class="space-y-2">
              <a
                href="/login"
                onClick={close}
                class="block w-full text-center px-4 py-3 rounded-xl border-2 border-blue-700 text-blue-700 hover:bg-blue-50 font-bold transition-colors"
              >
                Iniciar Sesión
              </a>
              <a
                href="/register"
                onClick={close}
                class="block w-full text-center px-4 py-3 rounded-xl bg-blue-700 text-white hover:bg-blue-800 font-bold transition-colors"
              >
                Registrarse
              </a>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
