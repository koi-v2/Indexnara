import React from 'react';
import { useGame } from '../context/GameContext';
import { renownEnsure, updateRenownFromCharacter } from '../engine/worldSystems';
import { reputationLabel, titlePerk, fmtTime, addLog, addChronicle } from '../engine/gameEngine';

export default function RenownPage() {
  const { state, setState } = useGame();
  const characters = (state.characters || []).map(c => {
    renownEnsure(c);
    updateRenownFromCharacter(state, c);
    return c;
  }).sort((a, b) => b.reputation - a.reputation);

  const worldNews = state.worldNews || [];

  const triggerWorldEvent = () => {
    if (!characters.length) {
      alert('Tambahkan karakter terlebih dahulu.');
      return;
    }
    setState(prev => {
      const next = structuredClone(prev);
      next.worldNews = next.worldNews || [];
      const c = next.characters[Math.floor(Math.random() * next.characters.length)];
      const gain = 20 + Math.floor(Math.random() * 50);
      c.gold = (c.gold || 0) + gain;
      const text = `${c.name} menemukan peti harta karun kuno berisi ${gain} gold! Kisah ini tersebar di seluruh kota.`;
      next.worldNews.unshift({ id: Math.random().toString(), at: new Date().toISOString(), text, kind: 'Harta Karun' });
      addLog(next, text, 'renown', c.id);
      addChronicle(next, text, 'renown');
      alert(`Peristiwa Dunia: ${text}`);
      return next;
    });
  };

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>⭐ Reputasi & Berita Dunia</h2>
          <div className="muted small">Reputasi berkembang dari pencapaian karakter. Berita dunia menyiarkan kisah mereka.</div>
        </div>
        <button className="primary" onClick={triggerWorldEvent}>🎲 Picu Peristiwa Dunia</button>
      </div>

      <div className="grid" style={{ marginBottom: '14px' }}>
        <div className="card">
          <h3>🏅 Peringkat Reputasi</h3>
          {characters.length ? (
            <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
              {characters.map((c, i) => {
                const repPct = Math.max(0, Math.min(100, ((c.reputation + 100) / 2)));
                return (
                  <div key={c.id} className="itemline">
                    <div>
                      <b>#{i + 1} {c.name}</b>
                      <div className="muted small">{reputationLabel(c.reputation)} · {c.activeTitle || 'Belum ada title'}</div>
                      <div className="bar" style={{ width: '120px' }}>
                        <i style={{ width: `${repPct}%` }}></i>
                      </div>
                    </div>
                    <span className="pill">{c.reputation > 0 ? `+${c.reputation}` : c.reputation}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="muted">Belum ada karakter.</p>
          )}
        </div>

        <div className="card">
          <h3>✨ Gelar & Efek Pasif Title</h3>
          {characters.length ? (
            <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
              {characters.map(c => {
                const p = titlePerk(c.activeTitle);
                return (
                  <div key={c.id} className="itemline">
                    <div>
                      <b>{c.name}</b> <span className="muted small">({c.activeTitle || 'Tanpa title'})</span>
                      <div className="small" style={{ color: 'var(--gold)' }}>{p.label}: {p.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="muted">Belum ada karakter.</p>
          )}
        </div>
      </div>

      <div className="card">
        <h3>📰 Berita Dunia Terbaru</h3>
        {worldNews.length ? (
          <div className="log" style={{ maxHeight: '250px' }}>
            {worldNews.slice(0, 30).map((n, i) => (
              <div key={i} className="logitem">
                <time>{fmtTime(n.at)} · {n.kind}</time>
                {n.text}
              </div>
            ))}
          </div>
        ) : (
          <p className="muted">Belum ada berita dunia tersiar.</p>
        )}
      </div>
    </div>
  );
}
