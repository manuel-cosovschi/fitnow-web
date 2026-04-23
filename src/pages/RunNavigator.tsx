import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, Square, Navigation } from 'lucide-react';

export default function RunNavigator() {
  const navigate = useNavigate();
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    let timer: any;
    if (isRunning) {
      timer = setInterval(() => {
        setElapsed(prev => prev + 1);
        setDistance(prev => prev + (Math.random() * 0.005)); // Simulate movement
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const pace = distance > 0 ? (elapsed / 60) / distance : 0;
  const formattedPace = pace > 0 ? `${Math.floor(pace)}'${Math.floor((pace % 1) * 60).toString().padStart(2, '0')}"` : "0'00\"";

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - env(safe-area-inset-top))', animation: 'fadeUp 0.4s ease-out' }}>
      <header style={{ padding: '0 0 16px 0', zIndex: 10 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'transparent', color: 'var(--fn-white)', fontSize: 14 }}>
          ← Cancelar Carrera
        </button>
      </header>

      {/* Fake Map Background */}
      <div style={{ position: 'absolute', inset: 0, background: '#0A1628', zIndex: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: '200%', height: '200%', top: '-50%', left: '-50%', backgroundImage: 'radial-gradient(circle, rgba(30,144,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.5 }} />
        <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)', width: 40, height: 40, background: 'rgba(30,144,255,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: isRunning ? 'scaleIn 1s infinite alternate' : 'none' }}>
          <Navigation size={20} color="var(--fn-blue)" fill="var(--fn-blue)" />
        </div>
      </div>

      <div style={{ flex: 1, zIndex: 1 }} />

      {/* Metrics Board */}
      <div style={{ zIndex: 1, background: 'rgba(10,22,40,0.85)', backdropFilter: 'blur(20px)', padding: 32, borderRadius: '32px 32px 0 0', borderTop: '1px solid var(--fn-border)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 13, color: 'var(--fn-slate)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 8 }}>Tiempo Transcurrido</div>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 64, fontWeight: 800, color: 'var(--fn-white)', lineHeight: 1 }}>
            {formatTime(elapsed)}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 32 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: 'var(--fn-slate)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Distancia</div>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 24, fontWeight: 800 }}>
              {distance.toFixed(2)} <span style={{ fontSize: 14, color: 'var(--fn-slate)' }}>km</span>
            </div>
          </div>
          <div style={{ width: 1, background: 'var(--fn-border)' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: 'var(--fn-slate)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Ritmo</div>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 24, fontWeight: 800 }}>
              {formattedPace} <span style={{ fontSize: 14, color: 'var(--fn-slate)' }}>/km</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24 }}>
          {isRunning ? (
            <>
              <button onClick={() => setIsRunning(false)} style={{ width: 72, height: 72, borderRadius: 36, background: 'rgba(255,179,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--fn-amber)' }}>
                <Pause size={32} color="var(--fn-amber)" fill="var(--fn-amber)" />
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setIsRunning(true)} style={{ width: 80, height: 80, borderRadius: 40, background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-brand)' }}>
                <Play size={40} color="white" fill="white" style={{ marginLeft: 6 }} />
              </button>
              {elapsed > 0 && (
                <button onClick={() => { setIsRunning(false); alert('Carrera finalizada. ¡Buen trabajo!'); navigate(-1); }} style={{ width: 72, height: 72, borderRadius: 36, background: 'rgba(255,48,85,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--fn-crimson)' }}>
                  <Square size={28} color="var(--fn-crimson)" fill="var(--fn-crimson)" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
