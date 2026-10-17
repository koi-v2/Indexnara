import React from 'react';
import { useGame } from '../context/GameContext';
import { lifeEnsure, lifeGoalEnsure, lifeTownEnsure } from '../engine/worldSystems';
import { lifeGoals } from '../constants/gameData';
import { addLog, addChronicle, fmtTime } from '../engine/gameEngine';

export default function LifePage() {
  const { state, setState } = useGame();
  const characters = (state.characters || []).filter(c => !c.retired && !c.dead);
  const town = lifeTownEnsure(state);
  const chronicle = (state.chronicle || []).filter(x => ['life', 'relationship', 'travel', 'ambition', 'town'].includes(x.kind)).slice(0, 20);

  const triggerWorldEvent = () => {
    if (!characters.length) {
      alert('Tambahkan karakter terlebih dahulu.');
      return;
    }
    const events = [
      { name: 'Festival Kota', run: c => { const l = lifeEnsure(c); l.mood = Math.min(100, l.mood + 18); l.social = Math.min(100, l.social + 12); return `${c.name} menikmati festival kota.`; } },
      { name: 'Hujan Deras', run: c => { const l = lifeEnsure(c); l.energy = Math.max(0, l.energy - 8); return `${c.name} berteduh dari hujan deras.`; } },
      { name: 'Kabar Baik', run: c => { const l = lifeEnsure(c); l.mood = Math.min(100, l.mood + 12); c.gold = (c.gold || 0) + 5; return `${c.name} menerima kabar baik dan 5 gold.`; } }
    ];
    const ev = events[Math.floor(Math.random() * events.length)];
    setState(prev => {
      const next = structuredClone(prev);
      next.characters.forEach(c => {
        const msg = ev.run(c);
        addLog(next, msg, 'life', c.id);
      });
      addChronicle(next, `Peristiwa dunia: ${ev.name}`, 'town');
      alert(`Kejadian dunia: ${ev.name}`);
      return next;
    });
  };

  const performLifeAction = (charId, action) => {
    setState(prev => {
      const next = structuredClone(prev);
      const c = next.characters.find(x => x.id === charId);
      if (!c) return prev;
      const l = lifeEnsure(c);
      if (action === 'rest') {
        l.energy = Math.min(100, l.energy + 40);
        l.mood = Math.min(100, l.mood + 8);
        c.hp = Math.min(c.maxHp || 100, (c.hp || 0) + 20);
        l.activity = 'Istirahat';
        addLog(next, `${c.name} beristirahat memulihkan tenaga.`, 'life', c.id);
      } else if (action === 'work') {
        const earned = 5 + Math.floor(Math.random() * ((c.level || 1) + 5));
        c.gold = (c.gold || 0) + earned;
        l.energy = Math.max(0, l.energy - 12);
        l.hunger = Math.min(100, l.hunger + 8);
        l.activity = 'Bekerja';
        addLog(next, `${c.name} bekerja dan memperoleh ${earned} gold.`, 'life', c.id);
      }
      return next;
    });
  };

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>🧠 AI Social Life</h2>
          <div className="muted small">Ambisi jangka panjang, emosi, energi, rasa lapar, dan perkembangan kota.</div>
        </div>
        <button className="primary" onClick={triggerWorldEvent}>🎲 Kejadian Spontan</button>
      </div>

      <div className="grid" style={{ marginBottom: '14px' }}>
        <div className="card">
          <h3>🏙️ Status Kehidupan Kota</h3>
          <div className="stats">
            <div className="statbox">
              <b>{town.level || 1}</b>
              <small>Level Kota</small>
            </div>
            <div className="statbox">
              <b>{Math.round(town.prosperity || 50)}/100</b>
              <small>Kemakmuran</small>
            </div>
            <div className="statbox">
              <b>{town.visitors || 0}</b>
              <small>Kunjungan</small>
            </div>
          </div>
          <p className="muted small" style={{ marginTop: '8px' }}>
            Warga bekerja, makan, bersosialisasi, dan berdagang secara mandiri di kota.
          </p>
        </div>
      </div>

      {characters.length ? (
        <div className="grid">
          {characters.map(c => {
            const l = lifeEnsure(c);
            const g = lifeGoalEnsure(c);
            const goalObj = lifeGoals.find(x => x.id === g.id) || lifeGoals[0];

            return (
              <div key={c.id} className="card">
                <div className="character">
                  <div className="avatar">
                    {c.photo ? <img src={c.photo} alt={c.name} /> : c.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ margin: 0 }}>{c.name}</h3>
                    <div className="muted small">Hari ke-{l.day || 1} · {l.activity || 'Menjalani hari'}</div>
                  </div>
                </div>

                <div style={{ marginTop: '10px' }}>
                  {[
                    ['Energi', l.energy, 'var(--accent)'],
                    ['Lapar', l.hunger, 'var(--red)'],
                    ['Mood', l.mood, 'var(--green)'],
                    ['Sosial', l.social, '#7eafff']
                  ].map(([label, val, col], idx) => (
                    <div key={idx} style={{ marginBottom: '6px' }}>
                      <div className="small muted">{label}: {val}/100</div>
                      <div className="bar">
                        <i style={{ width: `${val}%`, background: col }}></i>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="itemline" style={{ marginTop: '10px' }}>
                  <div>
                    <b>🎯 Ambisi: {goalObj.name}</b>
                    <div className="muted small">{goalObj.desc}</div>
                  </div>
                  <span className="pill">{g.completed ? '✅ Tercapai' : `Progress: ${g.progress || 0}`}</span>
                </div>

                <div className="row" style={{ marginTop: '10px' }}>
                  <button onClick={() => performLifeAction(c.id, 'work')}>Bekerja</button>
                  <button onClick={() => performLifeAction(c.id, 'rest')}>Istirahat</button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty">Belum ada karakter yang menjalani kehidupan dunia.</div>
      )}

      <div className="card" style={{ marginTop: '14px' }}>
        <h3>📖 Kronik Kehidupan Terbaru</h3>
        {chronicle.length ? (
          <div className="log" style={{ maxHeight: '200px' }}>
            {chronicle.map((x, i) => (
              <div key={i} className="logitem">
                <time>{fmtTime(x.at)} · {x.kind}</time>
                {x.text}
              </div>
            ))}
          </div>
        ) : (
          <p className="muted">Belum ada catatan peristiwa kehidupan.</p>
        )}
      </div>
    </div>
  );
}
