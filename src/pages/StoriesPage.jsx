import React from 'react';
import { useGame } from '../context/GameContext';
import { fmtTime } from '../engine/gameEngine';

export default function StoriesPage() {
  const { state } = useGame();
  const stories = state.worldStories || [];
  const chronicle = (state.chronicle || []).slice(0, 50);

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>📚 Kisah & Kronik Petualangan</h2>
          <div className="muted small">Catatan naratif dari seluruh aksi dan perkembangan dunia.</div>
        </div>
      </div>

      <div className="card">
        <h3>📖 Catatan Kisah Petualang</h3>
        {chronicle.length ? (
          <div className="log" style={{ maxHeight: '450px' }}>
            {chronicle.map((c, i) => (
              <div key={i} className="logitem">
                <time>{fmtTime(c.at)} · <span className="pill">{c.kind || 'world'}</span></time>
                <div>{c.text}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted">Belum ada kisah tercatat dalam babad sejarah dunia.</p>
        )}
      </div>
    </div>
  );
}
