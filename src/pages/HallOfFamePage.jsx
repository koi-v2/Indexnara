import React from 'react';
import { useGame } from '../context/GameContext';

export default function HallOfFamePage() {
  const { state } = useGame();
  const characters = state.characters || [];

  const renderRanking = (title, scoreFn, formatDesc, icon) => {
    const sorted = [...characters].sort((a, b) => scoreFn(b) - scoreFn(a)).slice(0, 5);

    return (
      <div className="card">
        <h3>{icon} {title}</h3>
        {sorted.length ? (
          sorted.map((c, i) => (
            <div key={c.id} className="itemline">
              <div>
                <b>#{i + 1} {c.name}</b>
                <div className="muted small">{formatDesc(c)}</div>
              </div>
              <span className="pill">{scoreFn(c).toLocaleString('id-ID')}</span>
            </div>
          ))
        ) : (
          <p className="muted">Belum ada karakter.</p>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>🏆 Hall of Fame</h2>
          <div className="muted small">Peringkat petualang terhebat berdasarkan statistik aktual yang tersimpan di dunia.</div>
        </div>
      </div>

      <div className="grid">
        {renderRanking('Terkaya', c => Number(c.gold) || 0, c => `Kekayaan: ${(Number(c.gold) || 0).toLocaleString('id-ID')} gold`, '💰')}
        {renderRanking('Level Tertinggi', c => Number(c.level) || 1, c => `Level ${c.level} · Usia ${c.age || 18}`, '⚔️')}
        {renderRanking('ATK Tertinggi', c => Number(c.atk) || 0, c => `Daya Serang ${c.atk}`, '💪')}
        {renderRanking('DEF Tertinggi', c => Number(c.def) || 0, c => `Pertahanan Fisik ${c.def}`, '🛡️')}
      </div>
    </div>
  );
}
