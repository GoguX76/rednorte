import { useState } from 'preact/hooks';
import { api } from '../lib/api';

export default function RegisterForm() {
  const [first_name, setFirstName] = useState('');
  const [last_name, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await api.auth.register({ first_name, last_name, email, password });
      setSuccess('Usuario registrado exitosamente');
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} class="max-w-md mx-auto bg-white p-8 rounded-xl shadow-md border border-gray-200">
      <h2 class="text-2xl font-bold text-gray-800 mb-6 text-center">Registrar Usuario</h2>

      {error && (
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>
      )}
      {success && (
        <div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">{success}</div>
      )}

      <div class="mb-4">
        <label for="first_name" class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
        <input id="first_name" type="text" value={first_name} onInput={(e) => setFirstName((e.target as HTMLInputElement).value)} required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors" placeholder="Juan" />
      </div>

      <div class="mb-4">
        <label for="last_name" class="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
        <input id="last_name" type="text" value={last_name} onInput={(e) => setLastName((e.target as HTMLInputElement).value)} class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors" placeholder="Pérez" />
      </div>

      <div class="mb-4">
        <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
        <input id="email" type="email" value={email} onInput={(e) => setEmail((e.target as HTMLInputElement).value)} required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors" placeholder="correo@ejemplo.com" />
      </div>

      <div class="mb-6">
        <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
        <input id="password" type="password" value={password} onInput={(e) => setPassword((e.target as HTMLInputElement).value)} required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors" placeholder="••••••••" />
      </div>

      <button type="submit" disabled={loading} class="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-2.5 px-4 rounded-lg transition-colors cursor-pointer">
        {loading ? 'Registrando...' : 'Registrar'}
      </button>
    </form>
  );
}
