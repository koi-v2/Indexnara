import React from 'react';
import { useGame } from '../context/GameContext';
import { captureWorldHistory } from '../engine/worldSystems';

export default function GraphsPage() {
  const { state, setState } = useGame();
  const history = state.worldHistory || [];

  const handleSnapshot = () => {
    setState(prev => {
      const next = structuredClone(prev);
      captureWorldHistory(next);
      return next;
    });
  };

  const renderChart = (label, key, strokeColor = 'var(--accent)') => {
    const vals = history.map(x => Number(x[key]) || 0);
    if (!vals.length) {
      return (
        <div className="card">
          <h3>{label}</h3>
          <p className="muted small">Grafik akan terisi setelah simulasi berjalan atau snapshot dicatat.</p>
        </div>
      );
    }
    const maxVal = Math.max(1, ...vals);
    const minVal = Math.min(...vals);
    const w = 500;
    const h = 140;
    const padding = 16;
    const points = vals.map((v, i) => {
      const x = padding + (i * (w - 2 * padding)) / Math.max(1, vals.length - 1);
      const y = h - padding - ((v - minVal) / Math.max(1, maxVal - minVal)) * (h - 2 * padding);
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="card">
        <h3>{label}</h3>
        <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: '140px', background: 'var(--panel2)', borderRadius: '8px' }}>
          <polyline
            points={points}
            fill="none"
            stroke={strokeColor}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="row" style={{ justifyContent: 'space-between', marginTop: '6px' }}>
          <small className="muted">Awal: {vals[0].toLocaleString('id-ID')}</small>
          <small className="muted">Terbaru: {vals[vals.length - 1].toLocaleString('id-ID')}</small>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>📈 Grafik & Tren Dunia</h2>
          <div className="muted small">Perkembangan populasi, kekayaan, kekuatan, dan artefak hingga 60 siklus terakhir.</div>
        </div>
        <button onClick={handleSnapshot}>📸 Catat Snapshot Manual</button>
      </div>

      <div className="grid">
        {renderChart('Populasi Karakter Aktif', 'characters', 'var(--accent)')}
        {renderChart('Total Gold Dunia', 'gold', 'var(--gold)')}
        {renderChart('Akumulasi Level Karakter', 'level', 'var(--green)')}
        {renderChart('Artefak Unik di Dunia', 'artifacts', 'var(--red)')}
      </div>
    </div>
  );
}
