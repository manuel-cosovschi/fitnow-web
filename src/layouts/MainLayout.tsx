import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, Compass, User, Building2, CalendarCheck, Navigation } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const u = localStorage.getItem('user');
    if (!token) navigate('/login');
    else if (u) setUser(JSON.parse(u));
  }, [navigate]);

  if (!user) return null;

  const isProvider = user.role === 'provider_admin' || user.role === 'admin';

  const tabs = isProvider ? [
    { id: 'home',     path: '/home',     icon: Home,         label: 'Inicio' },
    { id: 'explore',  path: '/explore',  icon: Compass,      label: 'Explorar' },
    { id: 'provider', path: '/provider', icon: Building2,    label: 'Panel' },
    { id: 'profile',  path: '/profile',  icon: User,         label: 'Perfil' },
  ] : [
    { id: 'home',        path: '/home',        icon: Home,          label: 'Inicio' },
    { id: 'explore',     path: '/explore',     icon: Compass,       label: 'Explorar' },
    { id: 'run',         path: '/run',          icon: Navigation,    label: 'Run' },
    { id: 'enrollments', path: '/enrollments', icon: CalendarCheck, label: 'Mis Clases' },
    { id: 'profile',     path: '/profile',     icon: User,          label: 'Perfil' },
  ];

  return (
    <div className="page-container">
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse 600px 400px at 50% 0%, rgba(30,144,255,0.12), transparent)', zIndex: 0, pointerEvents: 'none' }} />
      <div style={{ position: 'relative', zIndex: 1, padding: 20 }}>
        <Outlet />
      </div>

      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        height: 'calc(64px + env(safe-area-inset-bottom))',
        paddingBottom: 'env(safe-area-inset-bottom)',
        background: 'rgba(10,22,40,0.88)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--fn-border)',
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        zIndex: 100,
      }}>
        {tabs.map(tab => {
          const isActive = location.pathname === tab.path || location.pathname.startsWith(tab.path + '/');
          return (
            <div key={tab.id} onClick={() => navigate(tab.path)} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              cursor: 'pointer', color: isActive ? 'var(--fn-blue)' : 'var(--fn-ash)',
              minWidth: 44, padding: '8px 4px',
              transition: 'color 0.2s',
            }}>
              <tab.icon
                size={22}
                color={isActive ? 'var(--fn-blue)' : 'var(--fn-ash)'}
                fill={isActive ? 'rgba(30,144,255,0.2)' : 'none'}
                style={{ transition: 'all 0.2s', transform: isActive ? 'scale(1.1)' : 'scale(1)' }}
              />
              <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500 }}>{tab.label}</span>
            </div>
          );
        })}
      </nav>
    </div>
  );
}
