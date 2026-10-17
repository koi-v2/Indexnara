import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { uid, gainXp, addLog, addChronicle } from '../engine/gameEngine';
import { adventure } from '../engine/simulationCycle';

export default function PartiesPage() {
  const { state, setState, openModal, closeModal } = useGame();
  const parties = state.parties || [];
  const characters = state.characters || [];

  const handlePartyAction = (partyId, kind) => {
    setState(prev => {
      const next = structuredClone(prev);
      const p = next.parties.find(x => x.id === partyId);
      if (!p) return prev;
      const members = p.members.map(id => next.characters.find(c => c.id === id)).filter(Boolean);
      let done = 0;

      members.forEach(c => {
        if (kind === 'dungeon') {
          const did = c.level >= 10 ? 'hard' : c.level >= 5 ? 'medium' : 'easy';
          adventure(next, c, did);
          done++;
        } else {
          const xp = 8 + Math.floor(Math.random() * 10);
          const gold = 5 + Math.floor(Math.random() * 8);
          gainXp(next, c, xp);
          c.gold = (c.gold || 0) + gold;
          c.lastAction = 'Berburu bersama ' + p.name;
          done++;
        }
      });

      p.activity = kind === 'dungeon' ? 'Dungeon bersama' : 'Berburu bersama';
      addLog(next, `Party ${p.name} melakukan ${p.activity}.`, 'party');
      addChronicle(next, `Party ${p.name} melakukan ${p.activity}.`, 'party');
      alert(`Aktivitas party selesai: ${done}/${members.length} karakter selesai beraktivitas!`);
      return next;
    });
  };

  const deleteParty = (id) => {
    setState(prev => ({
      ...prev,
      parties: prev.parties.filter(p => p.id !== id)
    }));
  };

  const openPartyModal = (existing = null) => {
    if (!characters.length) {
      alert('Tambahkan karakter terlebih dahulu sebelum membentuk party.');
      return;
    }
    openModal({
      title: existing ? 'Edit Party' : 'Bentuk Party Baru',
      content: <PartyForm existing={existing} />
    });
  };

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>⚔ Party</h2>
          <div className="muted small">Kelola kelompok petualang mandiri, maksimal 4 karakter per party.</div>
        </div>
        <button className="primary" onClick={() => openPartyModal()}>＋ Bentuk Party</button>
      </div>

      {parties.length ? (
        <div className="grid">
          {parties.map(p => {
            const leader = characters.find(c => c.id === p.leaderId);
            const memberList = (p.members || []).map(id => characters.find(c => c.id === id)).filter(Boolean);

            return (
              <div key={p.id} className="card">
                <h3>⚔ {p.name}</h3>
                <p className="muted small">Pemimpin: {leader ? leader.name : 'Belum ditetapkan'}</p>
                <div className="small" style={{ marginBottom: '8px' }}>
                  Anggota: {memberList.map(m => m.name).join(', ') || 'Kosong'}
                </div>
                <p className="muted small">Aktivitas: <span className="pill">{p.activity || 'Menunggu'}</span></p>

                <div className="row" style={{ marginTop: '12px' }}>
                  <button onClick={() => handlePartyAction(p.id, 'hunt')}>Berburu bersama</button>
                  <button onClick={() => handlePartyAction(p.id, 'dungeon')}>Dungeon bersama</button>
                  <button onClick={() => openPartyModal(p)}>Edit</button>
                  <button className="danger" onClick={() => deleteParty(p.id)}>Hapus</button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty">Belum ada party dibentuk. Bentuk kelompok untuk berburu atau menaklukkan dungeon bersama.</div>
      )}
    </div>
  );
}

function PartyForm({ existing = null }) {
  const { state, setState, closeModal } = useGame();
  const characters = state.characters || [];
  const [name, setName] = useState(existing?.name || 'Party Baru');
  const [leaderId, setLeaderId] = useState(existing?.leaderId || characters[0]?.id || '');
  const [selectedMembers, setSelectedMembers] = useState(existing?.members || (characters[0] ? [characters[0].id] : []));

  const toggleMember = (id) => {
    setSelectedMembers(prev => {
      if (prev.includes(id)) {
        if (id === leaderId) return prev; // Cannot deselect leader
        return prev.filter(x => x !== id);
      } else {
        if (prev.length >= 4) {
          alert('Maksimal 4 anggota per party.');
          return prev;
        }
        return [...prev, id];
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    const finalMembers = Array.from(new Set([leaderId, ...selectedMembers]));

    setState(prev => {
      const next = structuredClone(prev);
      const partyObj = {
        id: existing?.id || uid(),
        name: name.trim(),
        leaderId,
        members: finalMembers,
        activity: existing?.activity || 'Menunggu'
      };

      if (existing) {
        next.parties = next.parties.map(p => p.id === existing.id ? partyObj : p);
      } else {
        next.parties = next.parties || [];
        next.parties.push(partyObj);
        addLog(next, `Party ${partyObj.name} dibentuk.`, 'party');
      }
      return next;
    });
    closeModal();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="field">
        <label>Nama Party</label>
        <input required value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div className="field">
        <label>Pemimpin</label>
        <select value={leaderId} onChange={e => {
          setLeaderId(e.target.value);
          if (!selectedMembers.includes(e.target.value)) {
            setSelectedMembers(prev => [...prev, e.target.value].slice(0, 4));
          }
        }}>
          {characters.map(c => (
            <option key={c.id} value={c.id}>{c.name} · Lv.{c.level}</option>
          ))}
        </select>
      </div>

      <div className="field">
        <label>Pilih Anggota (Maksimal 4)</label>
        <div className="card" style={{ maxHeight: '180px', overflowY: 'auto' }}>
          {characters.map(c => (
            <label key={c.id} className="check" style={{ margin: '6px 0' }}>
              <input
                type="checkbox"
                checked={selectedMembers.includes(c.id) || c.id === leaderId}
                disabled={c.id === leaderId}
                onChange={() => toggleMember(c.id)}
              />
              {c.name} · Lv.{c.level} {c.id === leaderId ? '(Pemimpin)' : ''}
            </label>
          ))}
        </div>
      </div>

      <div className="modalfoot">
        <button type="button" onClick={closeModal}>Batal</button>
        <button className="primary" type="submit">Simpan Party</button>
      </div>
    </form>
  );
}
