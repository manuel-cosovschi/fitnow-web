import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, Compass, User, Building2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const u = localStorage.getItem('user');
    if (!token) {
      navigate('/login');
    } else if (u) {
      setUser(JSON.parse(u));
    }
  }, [navigate]);

  if (!user) return null;

  const tabs = [
    { id: 'home', path: '/home', icon: Home, label: 'Inicio' },
    { id: 'explore', path: '/explore', icon: Compass, label: 'Explorar' },
    ...(user.role === 'provider_admin' || user.role === 'admin' 
        ? [{ id: 'provider', path: '/provider', icon: Building2, label: 'Panel' }] 
        : []),
    { id: 'profile', path: '/profile', icon: User, label: 'Perfil' },
  ];

  return (
    <div className="page-container">
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse 600px 400px at 50% 0%, rgba(30,144,255,0.12), transparent)', zIndex: 0, pointerEvents: 'none' }} />
      <div style={{ position: 'relative', zIndex: 1, padding: 20 }}>
        <Outlet />
      </div>

      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 80, background: 'rgba(10,22,40,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderTop: '1px solid var(--fn-border)', display: 'flex', justifyContent: 'space-around', alignItems: 'center', paddingBottom: 20, zIndex: 100 }}>
        {tabs.map(tab => {
          const isActive = location.pathname.startsWith(tab.path);
          return (
            <div key={tab.id} onClick={() => navigate(tab.path)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer', color: isActive ? 'var(--fn-blue)' : 'var(--fn-slate)' }}>
              <tab.icon size={24} color={isActive ? 'var(--fn-blue)' : 'currentColor'} fill={isActive ? 'rgba(30,144,255,0.2)' : 'none'} style={{ transition: 'all 0.2s', transform: isActive ? 'scale(1.1)' : 'scale(1)' }} />
              <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 500 }}>{tab.label}</span>
            </div>
          );
        })}
      </nav>
    </div>
  );
}
