import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Plus, Dumbbell } from 'lucide-react';

export default function TrainingPlan() {
  const navigate = useNavigate();
  const [completedSets, setCompletedSets] = useState<Record<string, boolean>>({});

  const [exercises, setExercises] = useState([
    {
      id: 1,
      name: 'Press de Banca',
      sets: [
        { id: 1, reps: 10, weight: 60 },
        { id: 2, reps: 8, weight: 65 },
        { id: 3, reps: 6, weight: 70 }
      ]
    },
    {
      id: 2,
      name: 'Sentadillas',
      sets: [
        { id: 1, reps: 12, weight: 80 },
        { id: 2, reps: 10, weight: 90 },
        { id: 3, reps: 8, weight: 100 }
      ]
    }
  ]);

  const addSet = (exId: number) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exId) {
        const nextSetId = ex.sets.length > 0 ? Math.max(...ex.sets.map(s => s.id)) + 1 : 1;
        const lastSet = ex.sets.length > 0 ? ex.sets[ex.sets.length - 1] : { reps: 10, weight: 0 };
        return {
          ...ex,
          sets: [...ex.sets, { id: nextSetId, reps: lastSet.reps, weight: lastSet.weight }]
        };
      }
      return ex;
    }));
  };

  const finishWorkout = () => {
    alert('¡Entrenamiento Guardado Exitosamente!');
    navigate(-1);
  };



  const toggleSet = (exId: number, setId: number) => {
    const key = `${exId}-${setId}`;
    setCompletedSets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '20px', animation: 'fadeUp 0.4s ease-out', paddingBottom: 40 }}>
      <header>
        <button onClick={() => navigate(-1)} style={{ background: 'transparent', color: 'var(--fn-white)', padding: '0 0 16px 0', fontSize: 14 }}>
          ← Volver
        </button>
        <h1 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 28, margin: '0 0 8px 0' }}>Entrenamiento Libre</h1>
        <p style={{ color: 'var(--fn-slate)', fontSize: 14, margin: 0 }}>Registra tu rutina actual.</p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {exercises.map((ex) => (
          <div key={ex.id} className="glass-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(123,82,248,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Dumbbell size={20} color="var(--fn-purple)" />
              </div>
              <h3 style={{ fontSize: 18, margin: 0, fontWeight: 700 }}>{ex.name}</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {ex.sets.map((set) => {
                const key = `${ex.id}-${set.id}`;
                const isCompleted = completedSets[key];
                return (
                  <div key={set.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: isCompleted ? 'rgba(0,230,118,0.1)' : 'var(--fn-elevated)', borderRadius: 12, border: `1px solid ${isCompleted ? 'var(--fn-green)' : 'var(--fn-border)'}`, transition: 'all 0.2s' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--fn-slate)', width: 24 }}>{set.id}</div>
                    <div style={{ flex: 1, display: 'flex', gap: 16 }}>
                      <div style={{ fontSize: 15 }}>
                        <span style={{ color: 'var(--fn-slate)' }}>Reps:</span> <strong>{set.reps}</strong>
                      </div>
                      <div style={{ fontSize: 15 }}>
                        <span style={{ color: 'var(--fn-slate)' }}>Kg:</span> <strong>{set.weight}</strong>
                      </div>
                    </div>
                    <button 
                      onClick={() => toggleSet(ex.id, set.id)}
                      style={{ width: 32, height: 32, borderRadius: 16, background: isCompleted ? 'var(--fn-green)' : 'transparent', border: `2px solid ${isCompleted ? 'var(--fn-green)' : 'var(--fn-slate)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      {isCompleted && <Check size={16} color="var(--fn-bg)" strokeWidth={3} />}
                    </button>
                  </div>
                );
              })}
            </div>

            <button onClick={() => addSet(ex.id)} style={{ width: '100%', marginTop: 16, padding: 12, borderRadius: 12, border: '1px dashed var(--fn-purple)', color: 'var(--fn-purple)', background: 'transparent', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Plus size={18} /> Agregar Serie
            </button>
          </div>
        ))}

        <button onClick={() => alert('Función de buscar nuevos ejercicios próximamente.')} style={{ padding: 16, borderRadius: 16, background: 'var(--fn-surface)', color: 'var(--fn-white)', border: '1px dashed var(--fn-slate)', fontWeight: 600 }}>
          + Añadir Ejercicio
        </button>
      </div>

      <button onClick={finishWorkout} style={{ width: '100%', padding: 18, borderRadius: 16, background: 'var(--grad-purple)', color: 'white', fontWeight: 700, fontSize: 16, boxShadow: 'var(--shadow-purple)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
        Finalizar Entrenamiento
      </button>
    </div>
  );
}
