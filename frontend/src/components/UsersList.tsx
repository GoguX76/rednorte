import { useState, useEffect } from 'preact/hooks';
import { api, type UserResponse } from '../lib/api';

export default function UsersList() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const hasToken = typeof localStorage !== 'undefined' && !!localStorage.getItem('token');

  useEffect(() => {
    if (!hasToken) {
      setLoading(false);
      setError('Unauthorized');
      return;
    }
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.auth.getUsers();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div class="text-center py-12 text-gray-500"><div class="animate-pulse">Cargando usuarios...</div></div>;
  }

  if (error) {
    const isUnauthorized = error.toLowerCase().includes('unauthorized') || error.toLowerCase().includes('token') || error.toLowerCase().includes('401');
    if (isUnauthorized) {
      return (
        <div class="text-center py-16">
          <div class="bg-amber-50 border border-amber-200 text-amber-800 px-6 py-6 rounded-xl inline-block">
            <p class="text-lg font-semibold mb-2">Sesión no iniciada</p>
            <p class="text-sm mb-4">Debes iniciar sesión para ver los usuarios.</p>
            <a href="/login" class="inline-block bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">Iniciar Sesión</a>
          </div>
        </div>
      );
    }
    return (
      <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center">
        {error}
        <button onClick={loadUsers} class="ml-3 underline hover:text-red-800 cursor-pointer">Reintentar</button>
      </div>
    );
  }

  if (users.length === 0) {
    return <div class="text-center py-12 text-gray-400">No hay usuarios registrados</div>;
  }

  return (
    <div class="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-gray-50 text-gray-600 uppercase text-xs tracking-wider">
            <th class="px-4 py-3 text-left">Nombre</th>
            <th class="px-4 py-3 text-left">Email</th>
            <th class="px-4 py-3 text-left">Rol</th>
            <th class="px-4 py-3 text-left">ID</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id} class="hover:bg-gray-50 transition-colors">
              <td class="px-4 py-3 font-medium text-gray-800">{user.first_name}{user.last_name ? ` ${user.last_name}` : ''}</td>
              <td class="px-4 py-3 text-gray-600">{user.email}</td>
              <td class="px-4 py-3">
                <span class="inline-block px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  {user.role_id === 'rol_patient' ? 'Paciente' : user.role_id === 'rol_doctor' ? 'Médico' : user.role_id === 'rol_admin' ? 'Admin' : user.role_id}
                </span>
              </td>
              <td class="px-4 py-3 font-mono text-gray-400 text-xs">{user.id.slice(0, 8)}...</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
