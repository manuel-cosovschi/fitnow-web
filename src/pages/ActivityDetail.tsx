import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, CheckCircle2, Dumbbell, Zap, Trophy, Users, ShieldCheck, X } from 'lucide-react';

const API = 'https://fitnow-api-production.up.railway.app/api';

const KIND_CONFIG: Record<string, { color: string; grad: string; icon: JSX.Element }> = {
  gym:        { color: '#1E90FF', grad: 'var(--grad-primary)', icon: <Dumbbell size={32} color="white" /> },
  club:       { color: '#7B52F8', grad: 'var(--grad-purple)',  icon: <Trophy size={32} color="white" /> },
  trainer:    { color: '#FFB300', grad: 'var(--grad-amber)',   icon: <Zap size={32} color="white" /> },
  club_sport: { color: '#00E676', grad: 'var(--grad-success)', icon: <Users size={32} color="white" /> },
};
const DEFAULT_KIND = { color: '#1E90FF', grad: 'var(--grad-primary)', icon: <Dumbbell size={32} color="white" /> };

const PLANS = [
  { id: 'monthly',   label: 'Mensual',     multiplier: 1,   badge: null,         billed: 'Facturado mensualmente' },
  { id: 'quarterly', label: 'Trimestral',  multiplier: 2.7, badge: '10% OFF',    billed: 'Facturado cada 3 meses' },
  { id: 'annual',    label: 'Anual',       multiplier: 9.6, badge: '20% OFF 🔥', billed: 'Facturado anualmente' },
];

interface Confetti { id: number; x: number; color: string; delay: number; dur: number; }

function ConfettiPiece({ x, color, delay, dur }: Omit<Confetti, 'id'>) {
  return (
    <div style={{
      position: 'absolute', top: -12, left: `${x}%`,
      width: 8, height: 8, borderRadius: 2,
      background: color, opacity: 0,
      animation: `confettiFall ${dur}s ${delay}s ease-in forwards`,
    }} />
  );
}

export default function ActivityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState<any>(null);
  const [provider, setProvider] = useState<any>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [step, setStep] = useState(1); // 1=confirm, 2=plan, 3=pay, 4=success
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [enrolling, setEnrolling] = useState(false);
  const [confetti, setConfetti] = useState<Confetti[]>([]);
  const confettiIdRef = useRef(0);

  useEffect(() => {
    fetch(`${API}/activities/${id}`)
      .then(r => r.json())
      .then(d => { setActivity(d.activity || d); setProvider(d.provider || null); })
      .catch(console.error);
  }, [id]);

  const openWizard = () => { setStep(1); setSelectedPlan('monthly'); setSheetOpen(true); };
  const closeWizard = () => { setSheetOpen(false); };

  const handlePay = async () => {
    setEnrolling(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API}/enrollments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ activity_id: Number(id) }),
      });
      if (res.ok || res.status === 409) {
        const pieces: Confetti[] = Array.from({ length: 28 }, (_, i) => ({
          id: ++confettiIdRef.current,
          x: Math.random() * 100,
          color: ['#1E90FF','#7B52F8','#00E676','#FFB300','#FF3055'][i % 5],
          delay: Math.random() * 0.6,
          dur: 1.2 + Math.random() * 0.8,
        }));
        setConfetti(pieces);
        setStep(4);
        setTimeout(() => setConfetti([]), 3000);
      } else {
        alert('Error al inscribirse. Intenta de nuevo.');
      }
    } catch { alert('Error de red'); }
    finally { setEnrolling(false); }
  };

  if (!activity) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--fn-slate)' }}>
      Cargando...
    </div>
  );

  const kind = KIND_CONFIG[activity.kind] || DEFAULT_KIND;
  const seatsLeft = activity.seats_left ?? null;
  const capacity = activity.capacity ?? null;
  const seatsUsed = capacity != null && seatsLeft != null ? capacity - seatsLeft : null;
  const seatsPct = capacity && seatsUsed != null ? Math.min((seatsUsed / capacity) * 100, 100) : null;
  const seatsColor = seatsPct == null ? kind.color : seatsPct > 80 ? '#FFB300' : '#00E676';

  const basePrice = Number(activity.price || 0);
  const plan = PLANS.find(p => p.id === selectedPlan) || PLANS[0];
  const planPrice = Math.round(basePrice * plan.multiplier);

  return (
    <>
      <style>{`
        @keyframes confettiFall {
          0%   { opacity: 1; transform: translateY(0) rotate(0deg); }
          100% { opacity: 0; transform: translateY(340px) rotate(720deg); }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
      `}</style>

      <div style={{ paddingBottom: 100, animation: 'fadeUp 0.4s ease-out' }}>
        {/* Hero */}
        <div style={{ margin: '-20px -20px 0', height: 280, background: kind.grad, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -60, top: -60, width: 260, height: 260, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ position: 'absolute', right: 20, bottom: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,22,40,0.75) 0%, transparent 55%)' }} />

          <button onClick={() => navigate(-1)} style={{
            position: 'absolute', top: 16, left: 16, width: 40, height: 40, borderRadius: 12,
            background: 'rgba(10,22,40,0.55)', backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ArrowLeft size={20} color="white" />
          </button>

          <div style={{ position: 'absolute', bottom: 20, left: 20, right: 20 }}>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', color: 'white', textTransform: 'uppercase' }}>
              {activity.kind || 'Actividad'}
            </span>
            <h1 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 26, margin: '8px 0 4px', color: 'white', lineHeight: 1.2 }}>
              {activity.title}
            </h1>
            {activity.location && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>
                <MapPin size={13} /><span>{activity.location}</span>
              </div>
            )}
          </div>
        </div>

        <div style={{ padding: '24px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Price + capacity */}
          <div className="glass-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: seatsPct != null ? 16 : 0 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--fn-slate)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Inversión mensual</div>
                <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 32, fontWeight: 800, color: 'var(--fn-blue)', lineHeight: 1 }}>
                  ${basePrice.toLocaleString('es-AR')}
                  <span style={{ fontSize: 14, color: 'var(--fn-slate)', fontWeight: 400 }}> /mes</span>
                </div>
              </div>
              {seatsLeft != null && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: 'var(--fn-slate)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Cupos</div>
                  <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 20, fontWeight: 700, color: seatsColor }}>
                    {seatsLeft} <span style={{ fontSize: 12, color: 'var(--fn-slate)', fontWeight: 400 }}>libres</span>
                  </div>
                </div>
              )}
            </div>
            {seatsPct != null && capacity && (
              <div>
                <div style={{ height: 6, borderRadius: 999, background: 'var(--fn-elevated)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${seatsPct}%`, background: seatsColor, borderRadius: 999, transition: 'width 0.6s ease' }} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--fn-slate)', marginTop: 6 }}>
                  {seatsUsed} de {capacity} lugares ocupados
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {activity.description && (
            <div className="glass-card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 11, fontWeight: 700, color: 'var(--fn-slate)', textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 10px' }}>Descripción</h3>
              <p style={{ color: 'var(--fn-white)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>{activity.description}</p>
            </div>
          )}

          {/* Provider card */}
          {provider && (
            <div className="glass-card" style={{ padding: 16, borderLeft: `3px solid ${kind.color}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: `${kind.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontFamily: '"DM Serif Display", serif', fontSize: 18, color: kind.color }}>
                    {(provider.name || 'P').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 15, fontWeight: 700 }}>{provider.name}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 700, color: '#00E676', background: 'rgba(0,230,118,0.12)', padding: '2px 8px', borderRadius: 999 }}>
                      <ShieldCheck size={11} /> Verificado
                    </span>
                  </div>
                  {provider.address && <div style={{ fontSize: 12, color: 'var(--fn-slate)', marginTop: 2 }}>{provider.address}</div>}
                </div>
              </div>
            </div>
          )}

          {/* Sessions */}
          {activity.sessions?.length > 0 && (
            <div>
              <h3 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 18, margin: '0 0 12px' }}>Próximas sesiones</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {activity.sessions.slice(0, 5).map((s: any) => (
                  <div key={s.id} className="glass-card" style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>
                      {new Date(s.start_time).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </span>
                    <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 13, color: kind.color }}>
                      {new Date(s.start_time).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sticky CTA */}
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '16px 20px', paddingBottom: 'calc(16px + env(safe-area-inset-bottom))', background: 'rgba(10,22,40,0.92)', backdropFilter: 'blur(20px)', borderTop: '1px solid var(--fn-border)', zIndex: 50 }}>
          <button onClick={openWizard} style={{
            width: '100%', padding: 18, borderRadius: 16, fontWeight: 700, fontSize: 16,
            background: 'var(--grad-primary)', color: 'white', boxShadow: 'var(--shadow-brand)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10,
          }}>
            Inscribirme ahora
          </button>
        </div>
      </div>

      {/* Enrollment Wizard Bottom Sheet */}
      {sheetOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}
          onClick={e => { if (e.target === e.currentTarget && step !== 4) closeWizard(); }}
        >
          {/* Backdrop */}
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} />

          {/* Sheet */}
          <div style={{
            position: 'relative', zIndex: 1,
            background: 'var(--fn-surface)', borderRadius: '24px 24px 0 0',
            padding: '8px 20px 32px', paddingBottom: 'calc(32px + env(safe-area-inset-bottom))',
            animation: 'slideUp 0.32s cubic-bezier(0.32,0.72,0,1)',
            maxHeight: '90vh', overflowY: 'auto',
          }}>
            {/* Handle */}
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--fn-elevated)', margin: '8px auto 20px' }} />

            {/* Step indicator (only for steps 1-3) */}
            {step < 4 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <h2 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 20, margin: 0 }}>
                  {step === 1 ? 'Confirmar inscripción' : step === 2 ? 'Elegí tu plan' : 'Método de pago'}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {[1,2,3].map(n => (
                    <div key={n} style={{
                      width: n === step ? 20 : 8, height: 8, borderRadius: 4,
                      background: n === step ? 'var(--fn-blue)' : n < step ? '#00E676' : 'var(--fn-elevated)',
                      transition: 'all 0.3s',
                    }} />
                  ))}
                </div>
                <button onClick={closeWizard} style={{ background: 'var(--fn-elevated)', border: 'none', width: 32, height: 32, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={16} color="var(--fn-slate)" />
                </button>
              </div>
            )}

            {/* Step 1: Confirm */}
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="glass-card" style={{ padding: 16, display: 'flex', gap: 14, borderLeft: `3px solid ${kind.color}` }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: kind.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {kind.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{activity.title}</div>
                    {provider && <div style={{ fontSize: 13, color: 'var(--fn-slate)' }}>{provider.name}</div>}
                  </div>
                </div>

                <div className="glass-card" style={{ padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: 14, color: 'var(--fn-slate)' }}>Precio mensual</span>
                    <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 16, fontWeight: 700, color: kind.color }}>
                      ${basePrice.toLocaleString('es-AR')}
                    </span>
                  </div>
                  {activity.location && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--fn-slate)', fontSize: 13 }}>
                      <MapPin size={13} /><span>{activity.location}</span>
                    </div>
                  )}
                </div>

                <p style={{ fontSize: 12, color: 'var(--fn-slate)', lineHeight: 1.5, textAlign: 'center', margin: '0 8px' }}>
                  Al continuar aceptás los términos y condiciones. Podés cancelar en cualquier momento.
                </p>

                <button onClick={() => setStep(2)} style={{
                  width: '100%', padding: 16, borderRadius: 14, fontWeight: 700, fontSize: 15,
                  background: kind.grad, color: 'white', boxShadow: `0 8px 24px ${kind.color}44`,
                }}>
                  Continuar
                </button>
              </div>
            )}

            {/* Step 2: Plan selection */}
            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {PLANS.map(p => {
                  const price = Math.round(basePrice * p.multiplier);
                  const isSelected = selectedPlan === p.id;
                  return (
                    <button key={p.id} onClick={() => setSelectedPlan(p.id)} style={{
                      width: '100%', padding: 16, borderRadius: 14, textAlign: 'left',
                      background: isSelected ? `${kind.color}18` : 'var(--fn-elevated)',
                      border: `2px solid ${isSelected ? kind.color : 'transparent'}`,
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      transition: 'all 0.15s',
                    }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--fn-white)' }}>{p.label}</span>
                          {p.badge && (
                            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 999, background: '#00E67622', color: '#00E676' }}>
                              {p.badge}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--fn-slate)' }}>{p.billed}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 18, fontWeight: 800, color: isSelected ? kind.color : 'var(--fn-white)' }}>
                          ${price.toLocaleString('es-AR')}
                        </div>
                        {p.id !== 'monthly' && (
                          <div style={{ fontSize: 11, color: 'var(--fn-slate)' }}>
                            ${Math.round(price / (p.id === 'quarterly' ? 3 : 12)).toLocaleString('es-AR')}/mes
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}

                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <button onClick={() => setStep(1)} style={{ flex: 1, padding: 14, borderRadius: 14, fontWeight: 600, fontSize: 14, background: 'var(--fn-elevated)', color: 'var(--fn-slate)' }}>
                    Atrás
                  </button>
                  <button onClick={() => setStep(3)} style={{ flex: 2, padding: 14, borderRadius: 14, fontWeight: 700, fontSize: 15, background: kind.grad, color: 'white', boxShadow: `0 8px 24px ${kind.color}44` }}>
                    Continuar
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="glass-card" style={{ padding: 16 }}>
                  <div style={{ fontSize: 11, color: 'var(--fn-slate)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Resumen</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 14, color: 'var(--fn-slate)' }}>{activity.title}</span>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{plan.label}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--fn-border)', paddingTop: 10, marginTop: 4 }}>
                    <span style={{ fontSize: 15, fontWeight: 700 }}>Total</span>
                    <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 18, fontWeight: 800, color: kind.color }}>
                      ${planPrice.toLocaleString('es-AR')}
                    </span>
                  </div>
                </div>

                {/* Mock card input */}
                <div>
                  <div style={{ fontSize: 11, color: 'var(--fn-slate)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Método de pago</div>
                  <div className="glass-card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 26, borderRadius: 6, background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, fontWeight: 800, color: 'white' }}>VISA</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>•••• •••• •••• 4242</div>
                      <div style={{ fontSize: 11, color: 'var(--fn-slate)' }}>Demo — siempre aprobado</div>
                    </div>
                    <CheckCircle2 size={18} color="#00E676" />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <button onClick={() => setStep(2)} style={{ flex: 1, padding: 14, borderRadius: 14, fontWeight: 600, fontSize: 14, background: 'var(--fn-elevated)', color: 'var(--fn-slate)' }}>
                    Atrás
                  </button>
                  <button onClick={handlePay} disabled={enrolling} style={{ flex: 2, padding: 14, borderRadius: 14, fontWeight: 700, fontSize: 15, background: kind.grad, color: 'white', boxShadow: `0 8px 24px ${kind.color}44`, opacity: enrolling ? 0.7 : 1 }}>
                    {enrolling ? 'Procesando...' : `Pagar $${planPrice.toLocaleString('es-AR')}`}
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Success */}
            {step === 4 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 0 8px', position: 'relative', overflow: 'hidden', minHeight: 320 }}>
                {/* Confetti */}
                {confetti.map(c => <ConfettiPiece key={c.id} x={c.x} color={c.color} delay={c.delay} dur={c.dur} />)}

                <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'rgba(0,230,118,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, animation: 'scaleIn 0.5s cubic-bezier(0.34,1.56,0.64,1)' }}>
                  <CheckCircle2 size={44} color="#00E676" />
                </div>

                <h2 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 26, margin: '0 0 8px', textAlign: 'center' }}>¡Inscripción exitosa!</h2>
                <p style={{ color: 'var(--fn-slate)', fontSize: 15, textAlign: 'center', margin: '0 0 8px', lineHeight: 1.5 }}>
                  Estás inscripto en <strong style={{ color: 'var(--fn-white)' }}>{activity.title}</strong>
                </p>
                <p style={{ color: 'var(--fn-slate)', fontSize: 13, textAlign: 'center', margin: '0 0 28px' }}>
                  Plan {plan.label} · ${planPrice.toLocaleString('es-AR')}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
                  <button onClick={() => navigate('/enrollments')} style={{ width: '100%', padding: 16, borderRadius: 14, fontWeight: 700, fontSize: 15, background: 'var(--grad-success)', color: 'white', boxShadow: '0 8px 24px rgba(0,230,118,0.35)' }}>
                    Ver mis clases
                  </button>
                  <button onClick={() => { closeWizard(); navigate(-1); }} style={{ width: '100%', padding: 14, borderRadius: 14, fontWeight: 600, fontSize: 14, background: 'var(--fn-elevated)', color: 'var(--fn-slate)' }}>
                    Seguir explorando
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
