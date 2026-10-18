import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { monsterRegions, dungeonMonsterSets, towerMonsterSets, materialCatalog } from '../constants/gameData';
import { monsterSystemsEnsure } from '../engine/simulationCycle';
import { fmtTime } from '../engine/gameEngine';

export default function MaterialsPage() {
  const { state, setState, openModal, closeModal } = useGame();
  monsterSystemsEnsure(state);

  const characters = (state.characters || []).filter(c => !c.retired && !c.dead);
  const history = (state.monsterSystems?.history || []).slice(0, 30);
  const settings = state.monsterSystems?.settings || { openWorldDrops: true, dungeonDrops: true, towerDrops: true };

  const updateSetting = (key, val) => {
    setState(prev => {
      const next = structuredClone(prev);
      monsterSystemsEnsure(next);
      next.monsterSystems.settings[key] = val;
      return next;
    });
  };

  const openCraftModal = () => {
    if (!characters.length) {
      alert('Tambahkan karakter terlebih dahulu.');
      return;
    }
    openModal({
      title: '🔨 Crafting Material & Potion',
      content: <CraftForm />
    });
  };

  // Compile materials across characters
  const materialList = characters.flatMap(c =>
    Object.entries(c.materials || {})
      .filter(([_, q]) => q > 0)
      .map(([name, qty]) => {
        const meta = materialCatalog.find(m => m[0] === name);
        return { charName: c.name, charId: c.id, name, qty, rarity: meta?.[1] || 'Common', use: meta?.[2] || 'Crafting' };
      })
  );

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>🧪 Monster & Material</h2>
          <div className="muted small">Bestiary, drop material, inventaris bahan, crafting potion & perlengkapan.</div>
        </div>
        <span className="pill">🤖 Crafting otomatis oleh karakter</span>
      </div>

      <div className="card" style={{ marginBottom: '14px' }}>
        <h3>⚙️ Pengaturan Drop Material</h3>
        <div className="row">
          <label className="pill" style={{ cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={settings.openWorldDrops !== false}
              onChange={e => updateSetting('openWorldDrops', e.target.checked)}
              style={{ marginRight: '6px' }}
            />
            Dunia Terbuka
          </label>
          <label className="pill" style={{ cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={settings.dungeonDrops !== false}
              onChange={e => updateSetting('dungeonDrops', e.target.checked)}
              style={{ marginRight: '6px' }}
            />
            Dungeon
          </label>
          <label className="pill" style={{ cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={settings.towerDrops !== false}
              onChange={e => updateSetting('towerDrops', e.target.checked)}
              style={{ marginRight: '6px' }}
            />
            Tower
          </label>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '14px' }}>
        <h3>🎒 Inventaris Material Karakter</h3>
        {materialList.length ? (
          <div style={{ overflowX: 'auto', maxHeight: '250px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--line)' }}>
                  <th style={{ padding: '8px' }}>Karakter</th>
                  <th style={{ padding: '8px' }}>Material</th>
                  <th style={{ padding: '8px' }}>Jumlah</th>
                  <th style={{ padding: '8px' }}>Rarity</th>
                  <th style={{ padding: '8px' }}>Kegunaan</th>
                </tr>
              </thead>
              <tbody>
                {materialList.map((m, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--line)' }}>
                    <td style={{ padding: '8px' }}><b>{m.charName}</b></td>
                    <td style={{ padding: '8px' }}>{m.name}</td>
                    <td style={{ padding: '8px' }}>x{m.qty}</td>
                    <td style={{ padding: '8px' }}><span className="pill">{m.rarity}</span></td>
                    <td style={{ padding: '8px' }} className="muted small">{m.use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="muted">Belum ada material yang dikumpulkan. Jalankan simulasi atau berburu monster.</p>
        )}
      </div>

      <div className="card">
        <h3>📜 Riwayat Drop Terbaru</h3>
        {history.length ? (
          <div className="log" style={{ maxHeight: '220px' }}>
            {history.map((h, i) => (
              <div key={i} className="logitem">
                <time>{fmtTime(h.at)} · {h.mode.toUpperCase()}</time>
                <b>{h.characterName}</b> mengalahkan <b>{h.monster}</b>
                <div className="muted small">
                  Drop: {(h.drops || []).map(d => `${d.name} ×${d.qty}`).join(', ')}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted">Belum ada catatan drop material.</p>
        )}
      </div>
    </div>
  );
}

