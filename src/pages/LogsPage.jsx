import React from 'react';
import { useGame } from '../context/GameContext';
import { fmtTime } from '../engine/gameEngine';

export default function LogsPage() {
  const { state, setState } = useGame();
  const logs = state.logs || [];

  const handleClearLogs = () => {
    if (window.confirm('Bersihkan semua log aktivitas?')) {
      setState(prev => {
        const next = structuredClone(prev);
        next.logs = [];
        return next;
      });
    }
  };

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>Log aktivitas</h2>
          <div className="muted small">Jejak keputusan dan aktivitas setiap karakter.</div>
        </div>
        <button onClick={handleClearLogs}>Bersihkan log</button>
      </div>

      <div className="card log">
        {logs.length ? (
          logs.map((l, idx) => (
            <div key={idx} className="logitem">
              <time>{fmtTime(l.at)} · {l.kind}</time>
              {l.text}
            </div>
          ))
        ) : (
          <div className="empty">Belum ada aktivitas.</div>
        )}
      </div>
    </div>
  );
}
