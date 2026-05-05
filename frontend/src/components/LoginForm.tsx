import { useState } from 'preact/hooks';
import { loginUser } from '../store/userStore';

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: Event) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 1. Conexión real al microservicio Hono (Backend)
      const res = await fetch('http://localhost:3000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (data.success) {
        // 2. Actualizamos el ViewModel (Estado Global)
        loginUser(data.username);
        // 3. Redirigimos al portal de pacientes
        window.location.href = '/portal';
      } else {
        setError(data.message || 'Credenciales inválidas');
      }
    } catch (err) {
      // Fallback: Por si olvidaste encender tu backend con 'bun run dev'
      setError('Error de red. ¿Está encendido el servidor backend en el puerto 3000?');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Contenedor principal: Centra la tarjeta en la pantalla usando Flexbox
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      
      {/* Tarjeta (Card) del formulario: Sombras suaves y bordes redondeados */}
      <form onSubmit={handleLogin} style={{
        background: '#ffffff', padding: '2.5rem', borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '100%', maxWidth: '380px',
        display: 'flex', flexDirection: 'column', gap: '1.2rem'
      }}>
        
        {/* Cabecera del formulario */}
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0, color: '#003366', fontSize: '1.8rem' }}>Acceso Pacientes</h2>
          <p style={{ margin: '0.5rem 0 0', color: '#666', fontSize: '0.9rem' }}>Ingresa tus credenciales de RedNorte</p>
        </div>

        {/* Mensaje de error dinámico */}
        {error && (
          <div style={{ background: '#fee2e2', color: '#ef4444', padding: '0.8rem', borderRadius: '6px', fontSize: '0.9rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        {/* Input de Usuario */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <label style={{ fontSize: '0.9rem', color: '#444', fontWeight: '500' }}>Usuario</label>
          <input
            type="text"
            placeholder="ej. admin"
            value={username}
            onInput={(e) => setUsername((e.currentTarget as HTMLInputElement).value)}
            required
            style={{ 
              padding: '0.8rem', borderRadius: '6px', border: '1px solid #ccc', 
              fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s' 
            }}
            // Efecto visual al hacer clic (Focus)
            onFocus={(e) => (e.currentTarget.style.borderColor = '#003366')}
            onBlur={(e) => (e.currentTarget.style.borderColor = '#ccc')}
          />
        </div>

        {/* Input de Contraseña */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <label style={{ fontSize: '0.9rem', color: '#444', fontWeight: '500' }}>Contraseña</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onInput={(e) => setPassword((e.currentTarget as HTMLInputElement).value)}
            required
            style={{ 
              padding: '0.8rem', borderRadius: '6px', border: '1px solid #ccc', 
              fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s' 
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = '#003366')}
            onBlur={(e) => (e.currentTarget.style.borderColor = '#ccc')}
          />
        </div>

        {/* Botón de Ingreso interactivo */}
        <button
          type="submit"
          disabled={isLoading}
          style={{
            marginTop: '1rem', padding: '0.9rem', 
            background: isLoading ? '#9ca3af' : '#003366', // Cambia de color si está cargando
            color: 'white', border: 'none', borderRadius: '6px', fontSize: '1rem',
            fontWeight: 'bold', cursor: isLoading ? 'not-allowed' : 'pointer', 
            transition: 'background 0.2s'
          }}
        >
          {isLoading ? 'Verificando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
}