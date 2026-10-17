import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { brainEnsure } from '../engine/worldSystems';
import { fmtTime, addLog } from '../engine/gameEngine';

export default function BrainPage() {
  const { state, setState, openModal, closeModal } = useGame();
  const characters = (state.characters || []).filter(c => !c.retired && !c.dead);

  const openFocusModal = (c) => {
    openModal({
      title: `🧠 Fokus Karakter: ${c.name}`,
      content: <BrainFocusForm char={c} />
    });
  };

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>🧠 Otak AI Karakter</h2>
          <div className="muted small">Tujuan, kecenderungan, pengalaman, rasa percaya diri, dan riwayat keputusan.</div>
        </div>
      </div>

      <div className="grid">
        {characters.length ? (
          characters.map(c => {
            const b = brainEnsure(c);
            const history = (c.brainHistory || []).slice(0, 5);

            return (
              <div key={c.id} className="card">
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <h3 style={{ margin: 0 }}>{c.name}</h3>
                  <span className="pill">Fokus: {b.goal}</span>
                </div>

                <div className="small muted" style={{ marginTop: '8px' }}>
                  Percaya Diri {b.confidence}% · Stres {b.stress}% · Loyalitas {b.loyalty}% · Rasa Ingin Tahu {b.curiosity}%
                </div>
                <div className="bar"><i style={{ width: `${b.confidence}%`, background: 'var(--accent)' }}></i></div>

                <p className="small">
                  Keputusan: <b>{b.decisionCount}</b> · Perkembangan: <b>{b.growth}%</b>
                </p>
                <p className="muted small">
                  Tindakan Terakhir: <i>{b.lastDecision}</i>
                </p>

                <div className="row" style={{ marginTop: '10px' }}>
                  <button onClick={() => openFocusModal(c)}>Atur Fokus</button>
                </div>

                {history.length > 0 && (
                  <details style={{ marginTop: '10px' }}>
                    <summary className="muted small" style={{ cursor: 'pointer' }}>Riwayat Keputusan</summary>
                    <div className="log" style={{ marginTop: '6px', maxHeight: '120px' }}>
                      {history.map((h, i) => (
                        <div key={i} className="logitem">
                          <time>{fmtTime(h.at)}</time>
                          {h.text}
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            );
          })
        ) : (
          <div className="card empty">Belum ada karakter aktif.</div>
        )}
      </div>
    </div>
  );
}

function BrainFocusForm({ char }) {
  const { setState, closeModal } = useGame();
  const [goal, setGoal] = useState(char.brain?.goal || char.aiGoal || 'balanced');

  const handleSubmit = (e) => {
    e.preventDefault();
    setState(prev => {
      const next = structuredClone(prev);
      const c = next.characters.find(x => x.id === char.id);
      if (c) {
        c.brain = brainEnsure(c);
        c.brain.goal = goal;
        c.aiGoal = goal;
        addLog(next, `${c.name} menetapkan fokus otak baru: ${goal}.`, 'brain', c.id);
      }
      return next;
    });
    closeModal();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="field">
        <label>Prioritas Otak Karakter</label>
        <select value={goal} onChange={e => setGoal(e.target.value)}>
          <option value="balanced">Seimbang (Adaptif)</option>
          <option value="level up">Naik Level (Fokus bertarung)</option>
          <option value="gold">Kekayaan (Fokus mengumpulkan gold)</option>
          <option value="equipment">Perlengkapan (Membeli & memakai gear)</option>
          <option value="exploration">Eksplorasi (Menjelajah tempat baru)</option>
          <option value="helpful">Membantu Sesama (Peduli sekutu)</option>
        </select>
      </div>
      <div className="modalfoot">
        <button type="button" onClick={closeModal}>Batal</button>
        <button className="primary" type="submit">Simpan Fokus</button>
      </div>
    </form>
  );
}
