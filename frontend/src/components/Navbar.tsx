import { useStore } from '@nanostores/preact';
import { $user, logoutUser } from '../store/userStore';

export default function Navbar() {
  const user = useStore($user);

  return (
    <nav style={{ 
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
      padding: '1rem 2rem', background: '#003366', color: 'white', 
      fontFamily: 'system-ui, sans-serif', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
    }}>
      <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '0.5px' }}>RedNorte</h2>
      
      {user.isAuthenticated && user.username && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{
            width: '35px', height: '35px', borderRadius: '50%', background: '#10b981',
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            fontWeight: 'bold', fontSize: '1.1rem', color: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}>
            {user.username.charAt(0).toUpperCase()}
          </div>
          <button 
            onClick={logoutUser} 
            style={{ 
              padding: '0.5rem 1rem', background: 'rgba(255, 255, 255, 0.1)', 
              color: 'white', border: '1px solid rgba(255, 255, 255, 0.3)', 
              borderRadius: '6px', cursor: 'pointer', fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </nav>
  );
}