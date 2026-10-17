import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { ensureCharacterSkills, addLog } from '../engine/gameEngine';
import { SKILL_ARCHETYPES } from '../constants/gameData';

export default function SkillTreePage() {
  const { state, setState, selectedCharId, setSelectedCharId } = useGame();
  const characters = state.characters || [];
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  if (!characters.length) {
    return (
      <div>
        <div className="section-head">
          <div>
            <h2>🌳 Skill Tree</h2>
            <div className="muted small">Setiap karakter mendapat pohon kemampuan acak.</div>
          </div>
        </div>
        <div className="empty">Buat karakter dahulu untuk mendapatkan skill bawaan dan skill tree.</div>
      </div>
    );
  }

  const activeChar = characters.find(c => c.id === selectedCharId) || characters[0];
  ensureCharacterSkills(activeChar);
  const sk = activeChar.skills;

  const handleCharSelect = (id) => {
    setSelectedCharId(id);
    setSelectedNodeId(null);
  };

  const convertExp = () => {
    if ((Number(activeChar.xp) || 0) < 100) {
      alert('Butuh minimal 100 EXP untuk mendapat 1 Skill Point.');
      return;
    }
    setState(prev => {
      const next = structuredClone(prev);
      const c = next.characters.find(x => x.id === activeChar.id);
      c.xp -= 100;
      c.skills.points++;
      addLog(next, `${c.name} menukar 100 EXP menjadi 1 Skill Point.`, 'skill', c.id);
      return next;
    });
  };

  const selectedNode = selectedNodeId ? sk.nodes.find(n => n.id === selectedNodeId) : null;
  const reqNodes = selectedNode ? selectedNode.requires.map(id => sk.nodes.find(x => x.id === id)).filter(Boolean) : [];
  const canUnlock = selectedNode && !selectedNode.unlocked && reqNodes.every(p => p.unlocked && p.rank >= p.maxRank) && (sk.points >= selectedNode.cost);
  const canUpgrade = selectedNode && selectedNode.unlocked && selectedNode.rank < selectedNode.maxRank && sk.points >= 1;

  const unlockNode = () => {
    if (!canUnlock) return;
    setState(prev => {
      const next = structuredClone(prev);
      const c = next.characters.find(x => x.id === activeChar.id);
      const n = c.skills.nodes.find(x => x.id === selectedNode.id);
      c.skills.points -= n.cost;
      c.skills.spent += n.cost;
      n.unlocked = true;
      n.rank = 1;
      addLog(next, `${c.name} membuka skill ${n.name}.`, 'skill', c.id);
      return next;
    });
  };

  const upgradeNode = () => {
    if (!canUpgrade) return;
    setState(prev => {
      const next = structuredClone(prev);
      const c = next.characters.find(x => x.id === activeChar.id);
      const n = c.skills.nodes.find(x => x.id === selectedNode.id);
      c.skills.points--;
      c.skills.spent++;
      n.rank++;
      addLog(next, `${c.name} meningkatkan ${n.name} ke Lv.${n.rank}.`, 'skill', c.id);
      return next;
    });
  };

  const tiers = [0, 1, 2, 3].map(t => sk.nodes.filter(n => n.tier === t));

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>🌳 Skill Tree Personal</h2>
          <div className="muted small">Cabang acak berdasarkan bakat bawaan karakter.</div>
        </div>
        <span className="pill">🌱 {sk.points} SP</span>
      </div>

      <div className="card">
        <label className="small muted">Pilih karakter</label>
        <select
          style={{ width: '100%', marginTop: '6px' }}
          value={activeChar.id}
          onChange={(e) => handleCharSelect(e.target.value)}
        >
          {characters.map(c => (
            <option key={c.id} value={c.id}>{c.name} · Lv.{c.level}</option>
          ))}
        </select>

        <div className="character" style={{ marginTop: '12px' }}>
          <div className="avatar">
            {activeChar.photo ? <img src={activeChar.photo} alt={activeChar.name} /> : activeChar.name.slice(0, 1).toUpperCase()}
          </div>
          <div>
            <h3 style={{ margin: 0 }}>{activeChar.name}</h3>
            <div className="muted small">
              Bakat: {sk.themes.map(k => `${SKILL_ARCHETYPES[k]?.icon || '✨'} ${SKILL_ARCHETYPES[k]?.name || k}`).join(' · ')}
            </div>
            <div className="small">
              SP: <b>{sk.points}</b> · Terpakai: {sk.spent} · EXP: {activeChar.xp || 0}
            </div>
            <button style={{ marginTop: '8px' }} onClick={convertExp}>
              Tukar 100 EXP → 1 SP
            </button>
          </div>
        </div>
      </div>

      <div className="skill-tree-wrap">
        {tiers.map((nodes, idx) => (
          <React.Fragment key={idx}>
            <div className="skill-tier">
              <div className="skill-tier-label">
                {['TIER 0 · SKILL BAWAAN', 'TIER 1 · PILIH JALUR', 'TIER 2 · SPESIALISASI', 'TIER 3 · ULTIMATE'][idx]}
              </div>
              <div className="skill-node-grid">
                {nodes.map(n => (
                  <button
                    key={n.id}
                    className={`skill-node ${n.unlocked ? 'unlocked' : 'locked'} ${n.kind === 'ultimate' ? 'ultimate' : ''} ${selectedNodeId === n.id ? 'active' : ''}`}
                    onClick={() => setSelectedNodeId(n.id)}
                    style={selectedNodeId === n.id ? { outline: '2px solid var(--accent)' } : {}}
                  >
                    <span className="skill-icon">{n.icon}</span>
                    <b>{n.name}</b>
                    <small>{n.unlocked ? `Lv. ${n.rank}/${n.maxRank}` : `🔒 ${n.cost} SP`}</small>
                  </button>
                ))}
              </div>
            </div>
            {idx < 3 && <div className="skill-connector">↓ cabang pengembangan ↓</div>}
          </React.Fragment>
        ))}
      </div>

      <div className="card">
        {selectedNode ? (
          <div>
            <h3>{selectedNode.icon} {selectedNode.name}</h3>
            <div className="row" style={{ marginBottom: '8px' }}>
              <span className="pill">{SKILL_ARCHETYPES[selectedNode.theme]?.name || selectedNode.theme}</span>
              <span className="pill">{selectedNode.kind.toUpperCase()}</span>
              <span className="pill">
                {selectedNode.unlocked
                  ? `Terbuka · Lv. ${selectedNode.rank}/${selectedNode.maxRank}`
                  : (canUnlock ? 'Syarat terpenuhi' : `Syarat: ${reqNodes.map(p => `${p.name} Lv.${p.maxRank}`).join(' + ')}`)}
              </span>
            </div>
            <p>{selectedNode.desc}</p>
            <div className="row">
              {selectedNode.unlocked ? (
                <button
                  className="primary"
                  disabled={!canUpgrade}
                  onClick={upgradeNode}
                >
                  {selectedNode.rank < selectedNode.maxRank ? '⬆ Upgrade (1 SP)' : 'Maksimal'}
                </button>
              ) : (
                <button
                  className="primary"
                  disabled={!canUnlock}
                  onClick={unlockNode}
                >
                  🔓 Buka skill ({selectedNode.cost} SP)
                </button>
              )}
            </div>
          </div>
        ) : (
          <div>
            <h3>ℹ️ Pilih node skill</h3>
            <p className="muted small">Pilih salah satu kotak skill di pohon kemampuan di atas untuk melihat syarat membuka dan meningkatkannya.</p>
          </div>
        )}
      </div>
    </div>
  );
}
