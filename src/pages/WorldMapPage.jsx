import React from 'react';
import { useGame } from '../context/GameContext';

export default function WorldMapPage() {
  const { state, setState } = useGame();
  const locations = state.locations || [];
  const characters = state.characters || [];

  const toggleUnlock = (id) => {
    setState(prev => ({
      ...prev,
      locations: prev.locations.map(loc => loc.id === id ? { ...loc, unlocked: !loc.unlocked } : loc)
    }));
  };

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>🗺 Peta Dunia & Lokasi</h2>
          <div className="muted small">Area penjelajahan, tempat gathering, kota awal, dan markas guild.</div>
        </div>
      </div>

      <div className="grid">
        {locations.map(loc => {
          const presentChars = characters.filter(c => c.locationId === loc.id);

          return (
            <div key={loc.id} className="card">
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <h3 style={{ margin: 0 }}>📍 {loc.name}</h3>
                <span className="pill">{loc.type.toUpperCase()}</span>
              </div>
              <p className="muted small" style={{ marginTop: '6px' }}>{loc.description}</p>

              <div className="itemline">
                <span>Karakter di lokasi ini:</span>
                <b>{presentChars.length}</b>
              </div>

              {presentChars.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', margin: '8px 0' }}>
                  {presentChars.map(c => (
                    <span key={c.id} className="pill">{c.name} (Lv.{c.level})</span>
                  ))}
                </div>
              )}

              <div className="row" style={{ marginTop: '10px' }}>
                <button onClick={() => toggleUnlock(loc.id)}>
                  {loc.unlocked ? 'Tutup Akses' : 'Buka Akses'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
