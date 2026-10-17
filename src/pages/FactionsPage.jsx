import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { uid, addLog, addChronicle } from '../engine/gameEngine';

export default function FactionsPage() {
  const { state, setState, openModal, closeModal } = useGame();
  const factions = state.factions || [];
  const characters = state.characters || [];

  const openQuestModal = (f) => {
    openModal({
      title: `📜 Misi Faksi: ${f.name}`,
      content: <FactionQuestForm faction={f} />
    });
  };

  const openWarModal = () => {
    if (factions.length < 2) {
      alert('Butuh minimal dua faksi untuk memulai perang.');
      return;
    }
    openModal({
      title: '⚔️ Perang Antarfaksi',
      content: <FactionWarForm />
    });
  };

  const handleJoinFaction = (charId, factionId) => {
    setState(prev => ({
      ...prev,
      characters: prev.characters.map(c => c.id === charId ? { ...c, factionId: factionId || null } : c)
    }));
  };

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>🌑 Faksi Dunia</h2>
          <div className="muted small">Kekuasaan politik, pengaruh, kas faksi, misi diplomatik, dan perang antarfaksi.</div>
        </div>
        <button className="primary" onClick={openWarModal}>⚔️ Perang Antarfaksi</button>
      </div>

      <div className="grid">
        {factions.map(f => {
          const members = characters.filter(c => c.factionId === f.id);
          const leader = characters.find(c => c.id === f.leaderId);

          return (
            <div key={f.id} className="card">
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <h3 style={{ margin: 0 }}>🌑 {f.name}</h3>
                <span className="pill">Pengaruh: {f.influence || 0}%</span>
              </div>
              <p className="muted small" style={{ margin: '6px 0' }}>{f.ethos}</p>

              <div className="stats">
                <div className="statbox">
                  <b>{members.length}</b>
                  <small>Anggota</small>
                </div>
                <div className="statbox">
                  <b>{(f.treasury || 0).toLocaleString('id-ID')}</b>
                  <small>Kas Gold</small>
                </div>
              </div>

              <div className="small" style={{ margin: '8px 0' }}>
                Pemimpin: <b>{leader ? leader.name : 'Belum ditetapkan'}</b>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '10px' }}>
                {members.map(m => (
                  <span key={m.id} className="pill">{m.name}</span>
                ))}
              </div>

              <div className="row">
                <button onClick={() => openQuestModal(f)}>📜 Jalankan Misi</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FactionQuestForm({ faction }) {
  const { state, setState, closeModal } = useGame();
  const [questType, setQuestType] = useState('patrol');

  const handleRun = (e) => {
    e.preventDefault();
    const members = (state.characters || []).filter(c => c.factionId === faction.id);
    if (!members.length) {
      alert('Rekrut minimal satu karakter ke faksi ini terlebih dahulu.');
      return;
    }
    const cost = questType === 'research' ? 20 : questType === 'diplomacy' ? 15 : 10;
    if ((faction.treasury || 0) < cost) {
      alert(`Kas faksi tidak cukup. Membutuhkan ${cost} gold.`);
      return;
    }

    setState(prev => {
      const next = structuredClone(prev);
      const f = next.factions.find(x => x.id === faction.id);
      f.treasury -= cost;
      const success = Math.random() < 0.75;
      if (success) {
        f.influence = Math.min(100, (f.influence || 0) + (questType === 'research' ? 5 : questType === 'diplomacy' ? 4 : 3));
        f.treasury += questType === 'research' ? 35 : questType === 'diplomacy' ? 25 : 20;
        addLog(next, `Misi faksi ${f.name} berhasil diselesaikan.`, 'faction');
        alert('Misi berhasil! Pengaruh dan kas faksi bertambah.');
      } else {
        f.influence = Math.max(0, (f.influence || 0) - 1);
        addLog(next, `Misi faksi ${f.name} gagal.`, 'faction');
        alert('Misi gagal; kas faksi terpakai.');
      }
      return next;
    });
    closeModal();
  };

  return (
    <form onSubmit={handleRun}>
      <div className="field">
        <label>Pilih Misi</label>
        <select value={questType} onChange={e => setQuestType(e.target.value)}>
          <option value="patrol">Patroli perbatasan — biaya 10 gold</option>
          <option value="research">Riset kuno — biaya 20 gold</option>
          <option value="diplomacy">Diplomasi — biaya 15 gold</option>
        </select>
      </div>
      <div className="modalfoot">
        <button type="button" onClick={closeModal}>Batal</button>
        <button className="primary" type="submit">Jalankan</button>
      </div>
    </form>
  );
}

function FactionWarForm() {
  const { state, setState, closeModal } = useGame();
  const factions = state.factions || [];
  const [faId, setFaId] = useState(factions[0]?.id || '');
  const [fbId, setFbId] = useState(factions[1]?.id || '');

  const handleWar = (e) => {
    e.preventDefault();
    if (faId === fbId) {
      alert('Pilih dua faksi yang berbeda.');
      return;
    }
    setState(prev => {
      const next = structuredClone(prev);
      const a = next.factions.find(f => f.id === faId);
      const b = next.factions.find(f => f.id === fbId);
      const win = Math.random() < 0.5 ? a : b;
      const lose = win.id === a.id ? b : a;

      win.influence = Math.min(100, (win.influence || 0) + 8);
      win.treasury = (win.treasury || 0) + 40;
      lose.influence = Math.max(0, (lose.influence || 0) - 3);
      lose.treasury = Math.max(0, (lose.treasury || 0) - 10);

      const msg = `${win.name} memenangkan perang melawan ${lose.name}! (+8 pengaruh, +40 gold).`;
      addLog(next, msg, 'faction');
      addChronicle(next, msg, 'Perang Faksi');
      alert(msg);
      return next;
    });
    closeModal();
  };

  return (
    <form onSubmit={handleWar}>
      <div className="field">
        <label>Faksi Penyerang</label>
        <select value={faId} onChange={e => setFaId(e.target.value)}>
          {factions.map(f => (
            <option key={f.id} value={f.id}>{f.name} (Pengaruh {f.influence}%)</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>Faksi Penantang</label>
        <select value={fbId} onChange={e => setFbId(e.target.value)}>
          {factions.map(f => (
            <option key={f.id} value={f.id}>{f.name} (Pengaruh {f.influence}%)</option>
          ))}
        </select>
      </div>
      <div className="modalfoot">
        <button type="button" onClick={closeModal}>Batal</button>
        <button className="primary" type="submit">Mulai Pertempuran</button>
      </div>
    </form>
  );
}
