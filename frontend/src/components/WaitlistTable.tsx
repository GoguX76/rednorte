import { useState, useEffect } from 'preact/hooks';
import { useStore } from '@nanostores/preact';
import { $user } from '../stores/auth';
import { api, ApiError, type WaitlistEntry } from '../lib/api';

const PRIORITY_LABELS: Record<number, string> = {
  1: 'Baja',
  2: 'Media',
  3: 'Alta',
  4: 'Urgencia',
};

const PRIORITY_COLORS: Record<number, string> = {
  1: 'bg-green-100 text-green-800',
  2: 'bg-yellow-100 text-yellow-800',
  3: 'bg-orange-100 text-orange-800',
  4: 'bg-red-100 text-red-800',
};

const STATUS_LABELS: Record<string, string> = {
  waiting: 'En Espera',
  attending: 'En Atención',
  finished: 'Finalizado',
  cancelled: 'Cancelado',
};

const STATUS_COLORS: Record<string, string> = {
  waiting: 'bg-blue-100 text-blue-800',
  attending: 'bg-purple-100 text-purple-800',
  finished: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function WaitlistTable() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = useStore($user);

  const isPatient = user?.role_id === 'rol_patient';
  const hasToken = typeof localStorage !== 'undefined' && !!localStorage.getItem('token');

  useEffect(() => {
    if (!hasToken) {
      setLoading(false);
      setError('Unauthorized');
      return;
    }
    loadQueue();
  }, [user]);

  const loadQueue = async () => {
    setLoading(true);
    setError('');
    try {
      const data = isPatient ? await api.waitlist.getMyQueue() : await api.waitlist.getQueue();
      setEntries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar la lista');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div class="text-center py-12 text-gray-500">
        <div class="animate-pulse">Cargando lista de espera...</div>
      </div>
    );
  }

  const isUnauthorized = error.toLowerCase().includes('unauthorized') ||
    error.toLowerCase().includes('token') ||
    error.toLowerCase().includes('401');

  if (error) {
    if (isUnauthorized) {
      return (
        <div class="text-center py-16">
          <div class="bg-amber-50 border border-amber-200 text-amber-800 px-6 py-6 rounded-xl inline-block">
            <p class="text-lg font-semibold mb-2">Sesión no iniciada</p>
            <p class="text-sm mb-4">Debes iniciar sesión para ver la lista de espera.</p>
            <a
              href="/login"
              class="inline-block bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Iniciar Sesión
            </a>
          </div>
        </div>
      );
    }
    return (
      <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center">
        {error}
        <button
          onClick={loadQueue}
          class="ml-3 underline hover:text-red-800 cursor-pointer"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div class="text-center py-12 text-gray-400">
        {isPatient ? 'No tienes turnos registrados' : 'No hay pacientes en la lista de espera'}
      </div>
    );
  }

  return (
    <div class="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-gray-50 text-gray-600 uppercase text-xs tracking-wider">
            <th class="px-4 py-3 text-left">ID</th>
            <th class="px-4 py-3 text-left">Usuario</th>
            <th class="px-4 py-3 text-left">Prioridad</th>
            <th class="px-4 py-3 text-left">Estado</th>
            <th class="px-4 py-3 text-left">Motivo</th>
            <th class="px-4 py-3 text-left">Creado</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          {entries.map((entry) => (
            <tr key={entry.id} class="hover:bg-gray-50 transition-colors">
              <td class="px-4 py-3 font-mono text-gray-500">{entry.id}</td>
              <td class="px-4 py-3 font-mono text-gray-600">{entry.user_id.slice(0, 8)}...</td>
              <td class="px-4 py-3">
                <span class={`inline-block px-2 py-0.5 rounded text-xs font-medium ${PRIORITY_COLORS[entry.priority] || ''}`}>
                  {PRIORITY_LABELS[entry.priority] || entry.priority}
                </span>
              </td>
              <td class="px-4 py-3">
                <span class={`inline-block px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[entry.status] || ''}`}>
                  {STATUS_LABELS[entry.status] || entry.status}
                </span>
              </td>
              <td class="px-4 py-3 text-gray-700 max-w-xs truncate">{entry.reason}</td>
              <td class="px-4 py-3 text-gray-500 text-xs">
                {new Date(entry.created_at).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
