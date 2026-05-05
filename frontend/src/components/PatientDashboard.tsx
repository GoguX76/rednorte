import { useState, useEffect } from 'preact/hooks';
import { useStore } from '@nanostores/preact';
import { $user, updateUsername } from '../store/userStore';

export default function PatientDashboard() {
  const user = useStore($user);
  const [newName, setNewName] = useState('');
  const [isClient, setIsClient] = useState(false);

  // Soluciona el problema de Astro esperando a que estemos en el navegador
  useEffect(() => {
    setIsClient(true);
    if (!user.isAuthenticated) {
      window.location.href = '/';
    }
  }, [user.isAuthenticated]);

  // Si aún no carga el cliente o no está logueado, no dibujamos nada
  if (!isClient || !user.isAuthenticated) return null;

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Cabecera del Portal */}
      <h1 style={{ color: '#003366', borderBottom: '2px solid #e5e7eb', paddingBottom: '1rem', fontSize: '2rem' }}>
        Bienvenido, {user.username}
      </h1>
      
      <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem', flexWrap: 'wrap' }}>
        
        {/* Tarjeta 1: Actualizar Datos (Tu punto 2 del requerimiento) */}
        <div style={{ 
          background: 'white', padding: '1.5rem', borderRadius: '12px', 
          boxShadow: '0 10px 25px rgba(0,0,0,0.05)', flex: '1', minWidth: '300px', height: 'fit-content' 
        }}>
          <h3 style={{ marginTop: 0, color: '#374151', fontSize: '1.2rem' }}>Configuración de Perfil</h3>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Actualiza tu nombre visible en el sistema.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input 
              type="text" 
              placeholder="Ej. Juan Pérez" 
              value={newName}
              onInput={(e) => setNewName((e.currentTarget as HTMLInputElement).value)}
              style={{ 
                padding: '0.8rem', borderRadius: '6px', border: '1px solid #ccc', 
                fontSize: '1rem', outline: 'none' 
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#003366')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#ccc')}
            />
            <button 
              onClick={() => {
                if(newName.trim()) {
                   updateUsername(newName);
                   setNewName('');
                }
              }} 
              style={{ 
                padding: '0.8rem', background: '#003366', color: 'white', border: 'none', 
                borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s' 
              }}
            >
              Actualizar Nombre
            </button>
          </div>
        </div>

        {/* Tarjeta 2: Panel de Solicitudes (Tu punto 3 del requerimiento) */}
        <div style={{ 
          background: 'white', padding: '1.5rem', borderRadius: '12px', 
          boxShadow: '0 10px 25px rgba(0,0,0,0.05)', flex: '2', minWidth: '400px' 
        }}>
          <h3 style={{ marginTop: 0, color: '#374151', fontSize: '1.2rem' }}>Mis Solicitudes Médicas</h3>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Revisa el estado actual de tus derivaciones en la red.
          </p>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f3f4f6' }}>
                  <th style={{ padding: '1rem', borderRadius: '8px 0 0 8px', color: '#4b5563' }}>Especialidad</th>
                  <th style={{ padding: '1rem', color: '#4b5563' }}>Estado</th>
                  <th style={{ padding: '1rem', borderRadius: '0 8px 8px 0', color: '#4b5563' }}>Fecha Ingreso</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '1.2rem 1rem', fontWeight: '500', color: '#111827' }}>Traumatología</td>
                  <td style={{ padding: '1.2rem 1rem' }}>
                    <span style={{ 
                      background: '#fef3c7', color: '#d97706', padding: '0.4rem 0.8rem', 
                      borderRadius: '999px', fontSize: '0.85rem', fontWeight: 'bold' 
                    }}>En Lista de Espera</span>
                  </td>
                  <td style={{ padding: '1.2rem 1rem', color: '#6b7280' }}>15-03-2026</td>
                </tr>
                <tr>
                  <td style={{ padding: '1.2rem 1rem', fontWeight: '500', color: '#111827' }}>Medicina General</td>
                  <td style={{ padding: '1.2rem 1rem' }}>
                    <span style={{ 
                      background: '#d1fae5', color: '#059669', padding: '0.4rem 0.8rem', 
                      borderRadius: '999px', fontSize: '0.85rem', fontWeight: 'bold' 
                    }}>Hora Asignada</span>
                  </td>
                  <td style={{ padding: '1.2rem 1rem', color: '#6b7280' }}>02-05-2026</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}