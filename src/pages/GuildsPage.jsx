import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { uid, addLog, addChronicle } from '../engine/gameEngine';

export default function GuildsPage() {
  const { state, setState, openModal, closeModal } = useGame();
  const guilds = state.guilds || [];
  const characters = state.characters || [];

  const openCreateModal = () => {
    openModal({
      title: 'Bentuk Guild Baru',
      content: <GuildForm />
    });
  };

  const deleteGuild = (id) => {
    const g = guilds.find(x => x.id === id);
    if (!g) return;
    if (window.confirm(`Bubarkan Guild ${g.name}? Anggota akan menjadi tanpa guild.`)) {
      setState(prev => ({
        ...prev,
        characters: prev.characters.map(c => c.guildId === id ? { ...c, guildId: null } : c),
        guilds: prev.guilds.filter(x => x.id !== id)
      }));
    }
  };

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>⚑ Guild</h2>
          <div className="muted small">Kelola kelompok petualang, kas guild, misi dan tingkatan level.</div>
        </div>
        <button className="primary" onClick={openCreateModal}>＋ Buat Guild</button>
      </div>

      {guilds.length ? (
        <div className="grid">
          {guilds.map(g => {
            const members = characters.filter(c => c.guildId === g.id);
            const level = g.level || 1;
            const xp = g.xp || 0;
            const needXp = level * 100;
            const xpPct = Math.min(100, Math.max(0, (xp / needXp) * 100));

            return (
              <div key={g.id} className="card">
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <h3 style={{ margin: 0 }}>⚑ {g.name}</h3>
                  <span className="pill">Level {level}</span>
                </div>
                <p className="muted small">{g.description || 'Kelompok petualang yang saling mendukung.'}</p>

                <div className="stats">
                  <div className="statbox">
                    <b>{members.length}</b>
                    <small>Anggota</small>
                  </div>
                  <div className="statbox">
                    <b>{(g.treasury || 0).toLocaleString('id-ID')}</b>
                    <small>Kas Gold</small>
                  </div>
                </div>

                <div className="small muted" style={{ marginTop: '10px' }}>EXP Guild {xp}/{needXp}</div>
                <div className="bar xp"><i style={{ width: `${xpPct}%` }}></i></div>

                <h4>Anggota:</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '10px' }}>
                  {members.length ? (
                    members.map(m => (
                      <span key={m.id} className="pill">{m.name} · Lv.{m.level}</span>
                    ))
                  ) : (
                    <span className="muted small">Belum ada anggota.</span>
                  )}
                </div>

                <div className="row">
                  <button className="danger" onClick={() => deleteGuild(g.id)}>Bubarkan Guild</button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty">Belum ada guild terdaftar. Bentuk guild pertamamu.</div>
      )}
    </div>
  );
}

function GuildForm() {
  const { setState, closeModal } = useGame();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setState(prev => {
      const next = structuredClone(prev);
      const newGuild = {
        id: uid(),
        name: name.trim(),
        description: description.trim() || 'Perkumpulan petualang tangguh.',
        level: 1,
        xp: 0,
        treasury: 50,
        recruitment: { enabled: true, minLevel: 1, maxMembers: 20, style: 'balanced' },
        resources: {}
      };
      next.guilds = next.guilds || [];
      next.guilds.push(newGuild);
      addLog(next, `Guild baru didirikan: ${newGuild.name}.`, 'guild');
      addChronicle(next, `Guild ${newGuild.name} resmi didirikan.`, 'guild');
      return next;
    });
    closeModal();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="field">
        <label>Nama Guild</label>
        <input required value={name} onChange={e => setName(e.target.value)} placeholder="Contoh: Ksatria Cahaya" />
      </div>
      <div className="field">
        <label>Deskripsi & Semboyan</label>
        <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder="Tujuan, nilai, atau semboyan guild..." />
      </div>
      <div className="modalfoot">
        <button type="button" onClick={closeModal}>Batal</button>
        <button className="primary" type="submit">Dirikan Guild</button>
      </div>
    </form>
  );
}
