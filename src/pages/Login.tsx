import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Mail, Lock, User, Building2 } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState('user');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = isRegister ? 'auth/register' : 'auth/login';
      const body = isRegister ? { email, password, name, role } : { email, password };
      
      const res = await fetch(`https://fitnow-api-production.up.railway.app/api/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error');
      
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/home');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 24px' }}>
      <div style={{ position: 'absolute', top: 0, width: '100%', height: 320, background: 'linear-gradient(to bottom, rgba(30,144,255,0.18), transparent)', zIndex: 0 }} />
      
      <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 40, animation: 'scaleIn 0.6s ease-out' }}>
        <div style={{ width: 72, height: 72, background: 'var(--grad-primary)', borderRadius: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-brand)', marginBottom: 16 }}>
          <Zap size={36} fill="white" color="white" />
        </div>
        <h1 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 36, margin: 0 }}>FitNow</h1>
        <p style={{ color: 'var(--fn-slate)', fontSize: 14, marginTop: 8 }}>{isRegister ? 'Creá tu cuenta gratis' : 'Bienvenido de vuelta'}</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card" style={{ zIndex: 1, width: '100%', maxWidth: 400, padding: 24, display: 'flex', flexDirection: 'column', gap: 16, animation: 'fadeUp 0.6s 0.2s both' }}>
        {isRegister && (
          <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
            <div onClick={() => setRole('user')} style={{ flex: 1, padding: 16, borderRadius: 14, background: 'var(--fn-elevated)', border: `1px solid ${role === 'user' ? 'var(--fn-blue)' : 'var(--fn-border)'}`, textAlign: 'center', cursor: 'pointer' }}>
              <User size={20} color={role === 'user' ? 'var(--fn-blue)' : 'var(--fn-slate)'} style={{ margin: '0 auto 8px' }} />
              <div style={{ fontSize: 14, fontWeight: 'bold', color: role === 'user' ? 'white' : 'var(--fn-slate)' }}>Atleta</div>
            </div>
            <div onClick={() => setRole('provider_admin')} style={{ flex: 1, padding: 16, borderRadius: 14, background: 'var(--fn-elevated)', border: `1px solid ${role === 'provider_admin' ? 'var(--fn-purple)' : 'var(--fn-border)'}`, textAlign: 'center', cursor: 'pointer' }}>
              <Building2 size={20} color={role === 'provider_admin' ? 'var(--fn-purple)' : 'var(--fn-slate)'} style={{ margin: '0 auto 8px' }} />
              <div style={{ fontSize: 14, fontWeight: 'bold', color: role === 'provider_admin' ? 'white' : 'var(--fn-slate)' }}>Proveedor</div>
            </div>
          </div>
        )}

        {isRegister && (
          <div style={{ position: 'relative' }}>
            <User size={18} color="var(--fn-blue)" style={{ position: 'absolute', left: 16, top: 16 }} />
            <input placeholder="Nombre completo" value={name} onChange={e => setName(e.target.value)} required style={{ paddingLeft: 46 }} />
          </div>
        )}

        <div style={{ position: 'relative' }}>
          <Mail size={18} color="var(--fn-blue)" style={{ position: 'absolute', left: 16, top: 16 }} />
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required style={{ paddingLeft: 46 }} />
        </div>

        <div style={{ position: 'relative' }}>
          <Lock size={18} color="var(--fn-blue)" style={{ position: 'absolute', left: 16, top: 16 }} />
          <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} required style={{ paddingLeft: 46 }} />
        </div>

        <button type="submit" disabled={loading} style={{ background: 'var(--grad-primary)', color: 'white', padding: 16, borderRadius: 16, fontWeight: 'bold', fontSize: 16, marginTop: 8, boxShadow: 'var(--shadow-brand)', opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Cargando...' : (isRegister ? 'Crear cuenta' : 'Iniciar sesión')}
        </button>
      </form>

      <button onClick={() => setIsRegister(!isRegister)} style={{ zIndex: 1, marginTop: 24, background: 'transparent', color: 'var(--fn-slate)', fontSize: 14 }}>
        {isRegister ? '¿Ya tenés cuenta? ' : '¿No tenés cuenta? '}
        <strong style={{ color: 'var(--fn-blue)' }}>{isRegister ? 'Iniciá sesión' : 'Registrate gratis'}</strong>
      </button>
    </div>
  );
}
