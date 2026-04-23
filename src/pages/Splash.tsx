import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap } from 'lucide-react';

export default function Splash() {
  const navigate = useNavigate();
  const [dots, setDots] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      // Check if logged in
      const token = localStorage.getItem('auth_token');
      if (token) navigate('/home');
      else navigate('/login');
    }, 2600);

    const interval = setInterval(() => {
      setDots(d => (d + 1) % 3);
    }, 400);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [navigate]);

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#020a14', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div style={{ position: 'absolute', top: 0, width: 720, height: 720, background: 'radial-gradient(circle, rgba(30,144,255,0.18) 0%, transparent 60%)', pointerEvents: 'none' }} />
      
      <div style={{ width: 92, height: 92, borderRadius: 28, background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-brand)', animation: 'scaleIn 0.6s cubic-bezier(0.34,1.56,0.64,1) both' }}>
        <Zap color="white" size={48} fill="white" />
      </div>
      
      <div style={{ marginTop: 28, textAlign: 'center' }}>
        <h1 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 54, fontWeight: 700, margin: 0, letterSpacing: -1, animation: 'fadeUp 0.6s 0.2s both' }}>FitNow</h1>
        <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--fn-slate)', letterSpacing: 3, textTransform: 'uppercase', marginTop: 10, animation: 'fadeUp 0.6s 0.35s both' }}>TU FITNESS SIN LÍMITES</p>
      </div>

      <div style={{ position: 'absolute', bottom: 64, display: 'flex', gap: 10, animation: 'fadeUp 0.6s 0.5s both' }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{ width: 10, height: 10, background: 'var(--fn-blue)', borderRadius: '50%', transform: `scale(${dots === i ? 1.4 : 0.8})`, opacity: dots === i ? 1 : 0.5, transition: 'all 0.2s' }} />
        ))}
      </div>
    </div>
  );
}
