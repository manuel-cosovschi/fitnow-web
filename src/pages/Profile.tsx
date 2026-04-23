import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, LogOut, Heart, ChevronRight, Bell, Shield } from 'lucide-react';

const API = 'https://fitnow-api-production.up.railway.app/api';

const ROLE_CONFIG: Record<string, { label: string; color: string; grad: string }> = {
  user:          { label: 'Atleta',        color: '#1E90FF', grad: 'var(--grad-primary)' },
  provider_admin:{ label: 'Proveedor',     color: '#7B52F8', grad: 'var(--grad-purple)' },
  admin:         { label: 'Administrador', color: '#FF3055', grad: 'var(--grad-crimson)' },
};

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({ enrollments: 0, activities: 0 });

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token || !user) return;
    fetch(`${API}/enrollments/mine`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setStats(s => ({ ...s, enrollments: (d.enrollments || d.items || []).length })))
      .catch(() => {});
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) return null;

  const role = ROLE_CONFIG[user.role] || ROLE_CONFIG.user;
  const initials = (user.name || 'U').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
  const memberSince = user.created_at ? new Date(user.created_at).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' }) : null;

  const SETTINGS_GROUPS = [
    {
      title: 'Mi Cuenta',
      items: [
        { icon: <Heart size={18} color="var(--fn-crimson)" />, label: 'Favoritos',      bg: 'rgba(255,48,85,0.12)',    action: () => alert('Próximamente') },
        { icon: <Bell size={18} color="var(--fn-amber)" />,   label: 'Notificaciones',  bg: 'rgba(255,179,0,0.12)',   action: () => alert('Próximamente') },
        { icon: <Shield size={18} color="var(--fn-blue)" />,  label: 'Privacidad',      bg: 'rgba(30,144,255,0.12)',  action: () => alert('Próximamente') },
        { icon: <Settings size={18} color="var(--fn-slate)"/>,label: 'Configuración',   bg: 'rgba(136,153,170,0.12)', action: () => alert('Próximamente') },
      ],
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeUp 0.4s ease-out' }}>
      {/* Avatar section */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 12 }}>
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <div style={{ width: 86, height: 86, borderRadius: '50%', background: role.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 0 3px ${role.color}66` }}>
            <span style={{ fontFamily: '"DM Serif Display", serif', fontSize: 34, color: 'white' }}>{initials}</span>
          </div>
          <div style={{ position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, borderRadius: '50%', background: role.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--fn-bg)' }}>
            <span style={{ fontSize: 10 }}>✓</span>
          </div>
        </div>
        <h1 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 26, margin: '0 0 4px' }}>{user.name}</h1>
        <p style={{ color: 'var(--fn-slate)', fontSize: 14, margin: '0 0 12px' }}>{user.email}</p>
        <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 14px', borderRadius: 999, background: `${role.color}22`, color: role.color, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {role.label}
        </span>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        {[
          { label: 'Clases',   value: String(stats.enrollments) },
          { label: 'km',       value: '—' },
          { label: 'Logros',   value: '3' },
        ].map(s => (
          <div key={s.label} className="glass-card" style={{ padding: '16px 12px', textAlign: 'center' }}>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--fn-slate)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Info rows */}
      {memberSince && (
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: 'var(--fn-slate)' }}>Miembro desde</span>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{memberSince}</span>
          </div>
          {user.bio && (
            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--fn-border)' }}>
              <p style={{ fontSize: 13, color: 'var(--fn-slate)', margin: 0, lineHeight: 1.5 }}>{user.bio}</p>
            </div>
          )}
        </div>
      )}

      {/* Settings groups */}
      {SETTINGS_GROUPS.map(group => (
        <section key={group.title}>
          <h2 style={{ fontSize: 11, fontWeight: 700, color: 'var(--fn-slate)', textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 10px' }}>{group.title}</h2>
          <div className="glass-card" style={{ overflow: 'hidden' }}>
            {group.items.map((item, i) => (
              <div key={i} onClick={item.action} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: i < group.items.length - 1 ? '1px solid var(--fn-border)' : 'none', cursor: 'pointer' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {item.icon}
                </div>
                <span style={{ flex: 1, fontSize: 15, fontWeight: 600 }}>{item.label}</span>
                <ChevronRight size={16} color="var(--fn-ash)" />
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* Logout */}
      <button onClick={handleLogout} style={{
        width: '100%', padding: 16, borderRadius: 16, fontWeight: 700, fontSize: 15,
        background: 'transparent', color: 'var(--fn-crimson)',
        border: '1px solid rgba(255,48,85,0.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        transition: 'background 0.2s',
      }}>
        <LogOut size={18} /> Cerrar sesión
      </button>
    </div>
  );
}
