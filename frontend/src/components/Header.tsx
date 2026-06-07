import { useStore } from '@nanostores/preact';
import { $user, logout, initAuth } from '../stores/auth';
import { useEffect } from 'preact/hooks';

export default function Header() {
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
    <header class="bg-blue-700 text-white shadow-lg">
      <nav class="container mx-auto flex justify-between items-center p-4">
        <a href="/" class="text-xl font-bold tracking-tight hover:text-blue-200 transition-colors">
          RedNorte
        </a>
        <div class="flex gap-6 items-center">
          <a href="/" class="hover:text-blue-200 transition-colors">Inicio</a>
          <a href="/waitlist" class="hover:text-blue-200 transition-colors">Lista de Espera</a>
          {user ? (
            <div class="flex gap-4 items-center">
              <span class="text-sm text-blue-200">{user.email}</span>
              <button
                onClick={handleLogout}
                class="bg-blue-500 hover:bg-blue-400 px-3 py-1.5 rounded text-sm font-medium transition-colors cursor-pointer"
              >
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <a
              href="/login"
              class="bg-blue-500 hover:bg-blue-400 px-3 py-1.5 rounded text-sm font-medium transition-colors"
            >
              Iniciar Sesión
            </a>
          )}
        </div>
      </nav>
    </header>
  );
}
