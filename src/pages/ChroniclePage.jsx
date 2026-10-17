import React from 'react';
import { useGame } from '../context/GameContext';
import { fmtTime } from '../engine/gameEngine';

export default function ChroniclePage() {
  const { state } = useGame();
  const chronicle = state.chronicle || [];

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>📖 Kronik Dunia</h2>
          <div className="muted small">Sejarah peristiwa penting dunia.</div>
        </div>
      </div>

      <div className="card log">
        {chronicle.length ? (
          chronicle.map((x, idx) => (
            <div key={idx} className="logitem">
              <time>{fmtTime(x.at)} · {x.kind}</time>
              {x.text}
            </div>
          ))
        ) : (
          <div className="empty">
            Belum ada peristiwa besar. Quest, event, level-up, dan perang guild akan tercatat di sini.
          </div>
        )}
      </div>
    </div>
  );
}
