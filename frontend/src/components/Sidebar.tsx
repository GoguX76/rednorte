import { useStore } from '@nanostores/preact';
import { $user, logout, initAuth } from '../stores/auth';
import { useEffect } from 'preact/hooks';

const NAV_ITEMS = [
  { href: '/', label: 'Inicio', icon: '🏠' },
  { href: '/about', label: 'Quiénes Somos', icon: 'ℹ️' },
  { href: '/waitlist', label: 'Lista de Espera', icon: '📋' },
];

export default function Sidebar() {
  const user = useStore($user);

  useEffect(() => {
    initAuth();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    logout();
  };

  return (
    <aside class="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full z-10">
      <div class="p-6 border-b border-slate-100">
        <a href="/" class="text-2xl font-bold text-blue-900 tracking-tight">
          RedNorte
        </a>
      </div>

      <nav class="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map((item) => (
          <a
            key={item.href}
            href={item.href}
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 hover:bg-blue-50 hover:text-blue-900 font-medium transition-colors"
          >
            <span class="text-xl">{item.icon}</span>
            {item.label}
          </a>
        ))}
      </nav>

      <div class="p-4 border-t border-slate-200">
        {user ? (
          <div class="space-y-2">
            <div class="px-4 py-2 text-sm text-slate-500 truncate bg-slate-50 rounded-lg">
              {user.email}
            </div>
            <button
              onClick={handleLogout}
              class="w-full text-left px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 font-medium transition-colors cursor-pointer"
            >
              Cerrar Sesión
            </button>
          </div>
        ) : (
          <div class="space-y-2">
            <a
              href="/login"
              class="block w-full text-center px-4 py-3 rounded-xl border-2 border-blue-700 text-blue-700 hover:bg-blue-50 font-bold transition-colors"
            >
              Iniciar Sesión
            </a>
            <a
              href="/register"
              class="block w-full text-center px-4 py-3 rounded-xl bg-blue-700 text-white hover:bg-blue-800 font-bold transition-colors"
            >
              Registrarse
            </a>
          </div>
        )}
      </div>
    </aside>
  );
}
