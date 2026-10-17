import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import BattleViewer from '../components/BattleViewer';
import { dungeonData, monsterRegions, dungeonMonsterSets } from '../constants/gameData';
import { addLog, addChronicle } from '../engine/gameEngine';

export default function BattleViewerPage() {
  const { state, setState } = useGame();
  const characters = (state.characters || []).filter(c => !c.retired && !c.dead);

  const [mode, setMode] = useState('pvp'); // 'pvp' or 'pve'
  const [charAId, setCharAId] = useState(characters[0]?.id || '');
  const [charBId, setCharBId] = useState(characters[1]?.id || '');
  const [selectedMonster, setSelectedMonster] = useState('slime');

  const [activeBattle, setActiveBattle] = useState(null);
  const [battleResult, setBattleResult] = useState(null);

  // Monster presets
  const monsterPresets = [
    { id: 'slime', name: 'Green Slime', level: 2, hp: 45, maxHp: 45, mp: 10, maxMp: 10, atk: 7, def: 3, agi: 4, role: 'Monster Field', isMonster: true, rewardGold: 25, rewardXp: 30 },
    { id: 'goblin', name: 'Goblin Scout', level: 5, hp: 80, maxHp: 80, mp: 15, maxMp: 15, atk: 14, def: 6, agi: 8, role: 'Monster Field', isMonster: true, rewardGold: 50, rewardXp: 65 },
    { id: 'wolf', name: 'Shadow Wolf', level: 12, hp: 140, maxHp: 140, mp: 25, maxMp: 25, atk: 22, def: 10, agi: 14, role: 'Hutan Monster', isMonster: true, rewardGold: 95, rewardXp: 120 },
    { id: 'golem', name: 'Sand Golem', level: 25, hp: 280, maxHp: 280, mp: 20, maxMp: 20, atk: 35, def: 28, agi: 5, role: 'Monster Gurun', isMonster: true, rewardGold: 180, rewardXp: 220 },
    { id: 'dark_knight', name: 'Dark Knight', level: 40, hp: 420, maxHp: 420, mp: 40, maxMp: 40, atk: 52, def: 34, agi: 18, role: 'Dungeon Boss', isMonster: true, rewardGold: 350, rewardXp: 400 },
    { id: 'dragon', name: 'Elder Dragon', level: 60, hp: 750, maxHp: 750, mp: 60, maxMp: 60, atk: 85, def: 50, agi: 22, role: 'World Dragon Boss', isMonster: true, rewardGold: 800, rewardXp: 850 }
  ];

  // Random quick match
  const handleRandomQuickMatch = () => {
    if (characters.length < 2) {
      alert('Dibutuhkan minimal 2 karakter aktif.');
      return;
    }
    const idxA = Math.floor(Math.random() * characters.length);
    let idxB = Math.floor(Math.random() * characters.length);
    while (idxB === idxA && characters.length > 1) {
      idxB = Math.floor(Math.random() * characters.length);
    }
    const a = characters[idxA];
    const b = characters[idxB];
    setCharAId(a.id);
    setCharBId(b.id);
    setMode('pvp');
    startPvPBattle(a, b);
  };

  const startPvPBattle = (charA, charB) => {
    if (!charA || !charB) return;
    setBattleResult(null);
    setActiveBattle({
      fighterA: {
        ...charA,
        hp: charA.hp > 0 ? charA.hp : charA.maxHp
      },
      fighterB: {
        ...charB,
        hp: charB.hp > 0 ? charB.hp : charB.maxHp
      },
      type: 'pvp'
    });
  };

  const startPvEBattle = (charA, monster) => {
    if (!charA || !monster) return;
    setBattleResult(null);
    setActiveBattle({
      fighterA: {
        ...charA,
        hp: charA.hp > 0 ? charA.hp : charA.maxHp
      },
      fighterB: {
        ...monster
      },
      type: 'pve',
      monster
    });
  };

  const handleBattleFinish = ({ winner, loser, turns }) => {
    setBattleResult({ winner, loser, turns });

    // Apply real world consequences / rewards
    setState(prev => {
      const next = structuredClone(prev);
      const isA = winner.id === activeBattle.fighterA.id;
      const winnerChar = (next.characters || []).find(c => c.id === winner.id);
      const loserChar = (next.characters || []).find(c => c.id === loser.id);

      if (activeBattle.type === 'pvp') {
        if (winnerChar) {
          winnerChar.gold = (Number(winnerChar.gold) || 0) + 60;
          winnerChar.xp = (Number(winnerChar.xp) || 0) + 50;
          winnerChar.lastAction = `Menang duel arena melawan ${loser.name}`;
          addLog(next, `⚔️ ${winnerChar.name} mengalahkan ${loser.name} di Live Arena (+60 Gold, +50 EXP).`, 'arena', winnerChar.id);
          addChronicle(next, `Pertarungan sengit di Arena: ${winnerChar.name} mengalahkan ${loser.name} dalam ${turns} ronde!`, 'arena');
        }
        if (loserChar) {
          loserChar.xp = (Number(loserChar.xp) || 0) + 15;
          loserChar.hp = Math.max(1, Math.floor(loserChar.maxHp * 0.25));
          loserChar.lastAction = `Kalah duel arena dari ${winner.name}`;
        }
      } else if (activeBattle.type === 'pve') {
        if (winnerChar && !winner.isMonster) {
          const goldReward = activeBattle.monster?.rewardGold || 50;
          const xpReward = activeBattle.monster?.rewardXp || 40;
          winnerChar.gold = (Number(winnerChar.gold) || 0) + goldReward;
          winnerChar.xp = (Number(winnerChar.xp) || 0) + xpReward;
          winnerChar.lastAction = `Mengalahkan ${loser.name}`;
          addLog(next, `⚔️ ${winnerChar.name} menumbangkan ${loser.name} secara langsung (+${goldReward} Gold, +${xpReward} EXP)!`, 'monster', winnerChar.id);
          addChronicle(next, `${winnerChar.name} berhasil menaklukkan ${loser.name} dalam pertempuran epik!`, 'monster');
        } else if (loserChar) {
          loserChar.hp = Math.max(1, Math.floor(loserChar.maxHp * 0.2));
          loserChar.lastAction = `Kalah dari ${winner.name}`;
          addLog(next, `${loserChar.name} terpaksa mundur setelah terluka melawan ${winner.name}.`, 'monster', loserChar.id);
        }
      }
      return next;
    });
  };

  const selectedA = characters.find(c => c.id === charAId) || characters[0];
  const selectedB = characters.find(c => c.id === charBId) || characters[1];
  const selectedMon = monsterPresets.find(m => m.id === selectedMonster) || monsterPresets[0];

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>⚔️ Live Battle Viewer</h2>
          <div className="muted small">Tonton pertarungan animasi real-time antar-karakter atau ekspedisi melawan monster.</div>
        </div>
        <button className="primary" onClick={handleRandomQuickMatch}>
          🎲 Acak Duel Seimbang
        </button>
      </div>

      {/* MODE TABS */}
      <div className="tabs">
        <button
          className={mode === 'pvp' ? 'active' : ''}
          onClick={() => { setMode('pvp'); setActiveBattle(null); }}
        >
          🏟️ Duel Karakter (PvP Arena)
        </button>
        <button
          className={mode === 'pve' ? 'active' : ''}
          onClick={() => { setMode('pve'); setActiveBattle(null); }}
        >
          🐉 Ekspedisi Monster & Boss (PvE)
        </button>
      </div>

      {/* MATCH SETUP CARD */}
      {!activeBattle && (
        <div className="card" style={{ marginBottom: '14px' }}>
          <h3>Pengaturan Pertandingan</h3>
          {mode === 'pvp' ? (
            <div className="formgrid">
              <div className="field">
                <label>Petualang 1 (Kiri)</label>
                <select value={charAId} onChange={e => setCharAId(e.target.value)}>
                  {characters.map(c => (
                    <option key={c.id} value={c.id} disabled={c.id === charBId}>
                      {c.name} · Lv.{c.level} · {c.role || 'Adventurer'} (HP: {c.hp}/{c.maxHp})
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Petualang 2 (Kanan)</label>
                <select value={charBId} onChange={e => setCharBId(e.target.value)}>
                  {characters.map(c => (
                    <option key={c.id} value={c.id} disabled={c.id === charAId}>
                      {c.name} · Lv.{c.level} · {c.role || 'Adventurer'} (HP: {c.hp}/{c.maxHp})
                    </option>
                  ))}
                </select>
              </div>

              <div className="field full">
                <button
                  className="primary"
                  style={{ width: '100%', padding: '12px', fontSize: '15px' }}
                  onClick={() => startPvPBattle(selectedA, selectedB)}
                  disabled={!selectedA || !selectedB || selectedA.id === selectedB.id}
                >
                  ⚔️ Mulai Tonton Duel Sekarang!
                </button>
              </div>
            </div>
          ) : (
            <div className="formgrid">
              <div className="field">
                <label>Pilih Petualang</label>
                <select value={charAId} onChange={e => setCharAId(e.target.value)}>
                  {characters.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} · Lv.{c.level} · {c.role || 'Adventurer'} (HP: {c.hp}/{c.maxHp})
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Pilih Musuh / Monster</label>
                <select value={selectedMonster} onChange={e => setSelectedMonster(e.target.value)}>
                  {monsterPresets.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} · Lv.{m.level} · HP {m.maxHp} (Hadiah: {m.rewardGold} Gold)
                    </option>
                  ))}
                </select>
              </div>

              <div className="field full">
                <button
                  className="primary"
                  style={{ width: '100%', padding: '12px', fontSize: '15px' }}
                  onClick={() => startPvEBattle(selectedA, selectedMon)}
                  disabled={!selectedA}
                >
                  🐉 Mulai Ekspedisi Melawan {selectedMon.name}!
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ACTIVE BATTLE VIEWER */}
      {activeBattle && (
        <div>
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: '10px' }}>
            <span className="pill" style={{ fontSize: '13px', padding: '6px 12px' }}>
              🔴 Mode: {activeBattle.type === 'pvp' ? 'Duel Arena 1v1' : `Ekspedisi vs ${activeBattle.fighterB.name}`}
            </span>
            <button onClick={() => { setActiveBattle(null); setBattleResult(null); }}>
              ✖ Tutup / Pertandingan Baru
            </button>
          </div>

          <BattleViewer
            key={`${activeBattle.fighterA.id}-${activeBattle.fighterB.id}-${Date.now()}`}
            fighterA={activeBattle.fighterA}
            fighterB={activeBattle.fighterB}
            onFinish={handleBattleFinish}
            autoStart={true}
          />

          {battleResult && (
            <div className="card" style={{ marginTop: '14px', border: '1px solid var(--accent)' }}>
              <h3>🎉 Hasil Pertarungan Selesai</h3>
              <p>
                <b>{battleResult.winner.name}</b> berhasil memenangkan duel atas <b>{battleResult.loser.name}</b> dalam {battleResult.turns} ronde!
              </p>
              <div className="row">
                <button
                  className="primary"
                  onClick={() => {
                    if (activeBattle.type === 'pvp') {
                      startPvPBattle(selectedA, selectedB);
                    } else {
                      startPvEBattle(selectedA, selectedMon);
                    }
                  }}
                >
                  🔄 Tanding Ulang (Rematch)
                </button>
                <button onClick={() => { setActiveBattle(null); setBattleResult(null); }}>
                  Pilih Lawan Lain
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
