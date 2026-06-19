import { useState } from 'preact/hooks';
import { api } from '../lib/api';
import { login } from '../stores/auth';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.auth.login(email, password);
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      login(res.token, res.user);
      window.location.href = '/waitlist';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      class="max-w-md mx-auto bg-white p-8 md:p-10 rounded-2xl shadow-md border border-slate-200"
    >
      <h2 class="text-2xl font-bold text-slate-800 mb-6 text-center">Iniciar Sesión</h2>

      {error && (
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-5 text-sm">
          {error}
        </div>
      )}

      <div class="mb-4">
        <label for="email" class="block text-sm font-medium text-slate-700 mb-1">
          Correo Electrónico
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onInput={(e) => setEmail((e.target as HTMLInputElement).value)}
          required
          class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          placeholder="correo@ejemplo.com"
        />
      </div>

      <div class="mb-6">
        <label for="password" class="block text-sm font-medium text-slate-700 mb-1">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onInput={(e) => setPassword((e.target as HTMLInputElement).value)}
          required
          class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        class="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white font-bold py-3.5 px-4 rounded-xl transition-colors cursor-pointer text-lg"
      >
        {loading ? 'Ingresando...' : 'Ingresar'}
      </button>

      <p class="mt-5 text-center text-slate-500 text-sm">
        ¿No tienes cuenta?{' '}
        <a href="/register" class="text-blue-700 hover:underline font-medium">
          Regístrate aquí
        </a>
      </p>
    </form>
  );
}
