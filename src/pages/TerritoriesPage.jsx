import React from 'react';
import { useGame } from '../context/GameContext';
import { addChronicle } from '../engine/gameEngine';

export default function TerritoriesPage() {
  const { state, setState } = useGame();
  const territories = state.territories || [];
  const guilds = state.guilds || [];
  const factions = state.factions || [];

  const handleUpgrade = (tId) => {
    setState(prev => {
      const next = structuredClone(prev);
      const t = next.territories.find(x => x.id === tId);
      if (!t) return prev;
      t.level = (Number(t.level) || 1) + 1;
      t.prosperity = Math.min(100, (Number(t.prosperity) || 0) + 15);
      addChronicle(next, `Wilayah ${t.name} ditingkatkan ke Level ${t.level}.`, 'territory');
      return next;
    });
  };

  const handleAssignGuild = (tId, guildId) => {
    setState(prev => {
      const next = structuredClone(prev);
      const t = next.territories.find(x => x.id === tId);
      if (!t) return prev;
      t.ownerGuildId = guildId || null;
      const g = next.guilds.find(x => x.id === guildId);
      addChronicle(next, `Wilayah ${t.name} kini dikuasai oleh ${g ? g.name : 'Netral'}.`, 'territory');
      return next;
    });
  };

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>🏰 Wilayah Dunia & Perebutan</h2>
          <div className="muted small">18 wilayah dengan tingkat kemakmuran, hasil sumber daya, dan penguasa guild.</div>
        </div>
      </div>

      <div className="grid">
        {territories.map(t => {
          const ownerGuild = guilds.find(g => g.id === t.ownerGuildId);
          const ownerFaction = factions.find(f => f.id === t.ownerFactionId);
          const prosperity = Math.max(0, Math.min(100, Number(t.prosperity) || 0));

          return (
            <div key={t.id} className="card">
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <h3 style={{ margin: 0 }}>🏰 {t.name}</h3>
                <span className="pill">Level {t.level}</span>
              </div>
              <div className="muted small" style={{ margin: '4px 0' }}>
                Sumber Daya: <b>{t.resource}</b>
              </div>

              <div className="small muted" style={{ marginTop: '8px' }}>Kemakmuran: {prosperity}/100</div>
              <div className="bar"><i style={{ width: `${prosperity}%` }}></i></div>

              <div className="itemline">
                <span>Penguasa Guild:</span>
                <b>{ownerGuild ? ownerGuild.name : 'Netral (Tanpa Penguasa)'}</b>
              </div>

              <div className="row" style={{ marginTop: '10px' }}>
                <select
                  value={t.ownerGuildId || ''}
                  onChange={(e) => handleAssignGuild(t.id, e.target.value)}
                  style={{ flex: 1, minWidth: '130px' }}
                >
                  <option value="">-- Tetapkan Guild --</option>
                  {guilds.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
                <button className="primary" onClick={() => handleUpgrade(t.id)}>
                  ⬆ Upgrade
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
