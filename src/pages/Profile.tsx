import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, LogOut, Heart } from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeUp 0.4s ease-out' }}>
      <header style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 20 }}>
        <div style={{ width: 90, height: 90, borderRadius: 45, background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, boxShadow: 'var(--shadow-brand)' }}>
          <User size={40} color="white" />
        </div>
        <h1 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 28, margin: '0 0 4px 0' }}>{user.name}</h1>
        <p style={{ color: 'var(--fn-slate)', fontSize: 14, margin: 0 }}>{user.email}</p>
        <div style={{ marginTop: 12, padding: '4px 12px', background: 'var(--fn-elevated)', borderRadius: 12, fontSize: 12, fontWeight: 700, color: 'var(--fn-blue)', textTransform: 'uppercase' }}>
          {user.role === 'provider_admin' ? 'Proveedor' : 'Atleta PRO'}
        </div>
      </header>

      <section style={{ marginTop: 20 }}>
        <h2 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 20, marginBottom: 16 }}>Mi Cuenta</h2>
        
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <div onClick={() => alert('Próximamente: Lista de actividades favoritas.')} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', borderBottom: '1px solid var(--fn-border)', cursor: 'pointer' }}>
            <Heart size={20} color="var(--fn-crimson)" />
            <span style={{ fontSize: 15, fontWeight: 600 }}>Favoritos</span>
          </div>
          <div onClick={() => alert('Configuración no disponible en esta versión.')} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', borderBottom: '1px solid var(--fn-border)', cursor: 'pointer' }}>
            <Settings size={20} color="var(--fn-slate)" />
            <span style={{ fontSize: 15, fontWeight: 600 }}>Configuración</span>
          </div>
          <div onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', cursor: 'pointer' }}>
            <LogOut size={20} color="var(--fn-crimson)" />
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--fn-crimson)' }}>Cerrar Sesión</span>
          </div>
        </div>
      </section>
    </div>
  );
}
