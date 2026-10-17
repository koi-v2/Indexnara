import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { dungeonData } from '../constants/gameData';
import { adventure } from '../engine/simulationCycle';
import { isCharacterRestricted } from '../engine/gameEngine';

export default function DungeonsPage() {
  const { state, setState, openModal, closeModal } = useGame();
  const characters = (state.characters || []).filter(c => !c.retired && !c.dead);

  const openDungeonRun = (dungeonKey) => {
    if (!characters.length) {
      alert('Tambahkan karakter terlebih dahulu.');
      return;
    }
    const d = dungeonData[dungeonKey];
    openModal({
      title: `Kirim Karakter · ${d.name}`,
      content: <DungeonRunForm dungeonKey={dungeonKey} />
    });
  };

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>⚔ Dungeon Ekspedisi</h2>
          <div className="muted small">Tantangan bertingkat untuk menguji ketangguhan karakter dan mengumpulkan material langka.</div>
        </div>
      </div>

      <div className="grid">
        {Object.entries(dungeonData).map(([key, d]) => (
          <div key={key} className="card">
            <h3>⚔ {d.name}</h3>
            <p className="muted small">Musuh Utama: <b>{d.enemy}</b> (Level Rekomendasi: {d.min}+)</p>
            <div className="stats">
              <div className="statbox">
                <b>{d.hp}</b>
                <small>HP Musuh</small>
              </div>
              <div className="statbox">
                <b>{d.atk}</b>
                <small>ATK Musuh</small>
              </div>
              <div className="statbox">
                <b>{d.gold}</b>
                <small>Hadiah Gold</small>
              </div>
              <div className="statbox">
                <b>{d.xp}</b>
                <small>Hadiah EXP</small>
              </div>
            </div>

            <div className="row" style={{ marginTop: '14px' }}>
              <button className="primary" onClick={() => openDungeonRun(key)}>
                Kirim Petualang
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DungeonRunForm({ dungeonKey }) {
  const { state, setState, closeModal, setCurrentPage } = useGame();
  const d = dungeonData[dungeonKey];
  const characters = (state.characters || []).filter(c => !c.retired && !c.dead);
  const [selectedCharId, setSelectedCharId] = useState(characters[0]?.id || '');

  const handleSend = () => {
    const c = characters.find(x => x.id === selectedCharId);
    if (!c) return;
    if (isCharacterRestricted(state, c)) {
      alert(`${c.name} tidak bisa mengikuti dungeon selama menjalani hukuman.`);
      return;
    }
    setState(prev => {
      const next = structuredClone(prev);
      const targetChar = next.characters.find(x => x.id === selectedCharId);
      if (targetChar) {
        adventure(next, targetChar, dungeonKey, true);
      }
      return next;
    });
    closeModal();
  };

  return (
    <div>
      <p className="muted small">Pilih karakter yang akan memasuki {d.name}:</p>
      <div className="field">
        <label>Karakter</label>
        <select value={selectedCharId} onChange={e => setSelectedCharId(e.target.value)}>
          {characters.map(c => (
            <option key={c.id} value={c.id}>
              {c.name} · Lv.{c.level} · HP {c.hp}/{c.maxHp}
            </option>
          ))}
        </select>
      </div>
      <div className="modalfoot">
        <button type="button" onClick={closeModal}>Batal</button>
        <button onClick={() => {
          closeModal();
          setCurrentPage('battleViewer');
        }}>
          ⚔️ Tonton di Battle Viewer
        </button>
        <button className="primary" onClick={handleSend}>Ekspedisi Cepat</button>
      </div>
    </div>
  );
}
