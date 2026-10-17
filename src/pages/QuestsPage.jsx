import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { uid, addLog, addChronicle } from '../engine/gameEngine';

export default function QuestsPage() {
  const { state, setState, openModal, closeModal } = useGame();
  const quests = state.quests || [];
  const events = state.events || [];
  const characters = (state.characters || []).filter(c => !c.retired && !c.dead);

  const openQuestModal = () => {
    openModal({
      title: 'Buat Quest Baru',
      content: <QuestForm />
    });
  };

  const triggerWorldEvent = (type) => {
    setState(prev => {
      const next = structuredClone(prev);
      if (type === 'invasion') {
        const msg = '🚨 Pasukan monster menyerbu wilayah sekitar! Karakter bersiap mempertahankan wilayah.';
        addLog(next, msg, 'event');
        addChronicle(next, msg, 'event');
        next.events.unshift({ id: uid(), name: 'Monster Invasion', at: new Date().toISOString() });
      } else if (type === 'doublegold') {
        const msg = '✨ Keberkahan Emas: Berkah ekonomi melimpah ruah di seluruh penjuru kota!';
        addLog(next, msg, 'event');
        addChronicle(next, msg, 'event');
        next.characters.forEach(c => {
          c.gold = (c.gold || 0) + 20;
        });
      }
      return next;
    });
  };

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>📜 Quest & Peristiwa Dunia</h2>
          <div className="muted small">Tugas petualang dan kejadian spontan yang dapat dipicu admin.</div>
        </div>
        <div className="row">
          <button onClick={() => triggerWorldEvent('doublegold')}>💰 Berkah Emas (+20g)</button>
          <button className="primary" onClick={openQuestModal}>＋ Buat Quest</button>
        </div>
      </div>

      <div className="grid" style={{ marginBottom: '14px' }}>
        {quests.length ? (
          quests.map(q => {
            const pct = Math.min(100, Math.max(0, ((q.progress || 0) / (q.target || 1)) * 100));
            return (
              <div key={q.id} className="card">
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <h3 style={{ margin: 0 }}>📜 {q.name}</h3>
                  <span className="pill">{q.status || 'Aktif'}</span>
                </div>
                <p className="muted small" style={{ margin: '6px 0' }}>{q.description}</p>

                <div className="small muted">Progress: {q.progress || 0} / {q.target}</div>
                <div className="bar"><i style={{ width: `${pct}%` }}></i></div>

                <div className="itemline">
                  <span>Hadiah:</span>
                  <b>{q.rewardGold} Gold / {q.rewardXp} EXP</b>
                </div>
              </div>
            );
          })
        ) : (
          <div className="card empty">Belum ada quest aktif. Tambahkan quest baru untuk para petualang.</div>
        )}
      </div>

      <div className="card">
        <h3>📜 Riwayat Peristiwa Spontan</h3>
        {events.length ? (
          <div className="log" style={{ maxHeight: '200px' }}>
            {events.map((e, i) => (
              <div key={i} className="logitem">
                <b>{e.name}</b>
                <div className="muted small">{e.at}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted">Belum ada catatan peristiwa dunia.</p>
        )}
      </div>
    </div>
  );
}

function QuestForm() {
  const { state, setState, closeModal } = useGame();
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [targetType, setTargetType] = useState('explore');
  const [target, setTarget] = useState(3);
  const [rewardGold, setRewardGold] = useState(50);
  const [rewardXp, setRewardXp] = useState(40);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setState(prev => {
      const next = structuredClone(prev);
      next.quests = next.quests || [];
      const allActiveCharIds = (next.characters || []).map(c => c.id);
      next.quests.push({
        id: uid(),
        name: name.trim(),
        description: desc.trim() || 'Tugas petualangan dari guild.',
        targetType,
        target: Number(target),
        progress: 0,
        rewardGold: Number(rewardGold),
        rewardXp: Number(rewardXp),
        status: 'Aktif',
        assigned: allActiveCharIds
      });
      addLog(next, `Quest baru diterbitkan: "${name.trim()}".`, 'quest');
      return next;
    });
    closeModal();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="field">
        <label>Nama Quest</label>
        <input required value={name} onChange={e => setName(e.target.value)} placeholder="Contoh: Berburu Slime Liar" />
      </div>
      <div className="field">
        <label>Deskripsi</label>
        <textarea rows={2} value={desc} onChange={e => setDesc(e.target.value)} />
      </div>
      <div className="field">
        <label>Jenis Target</label>
        <select value={targetType} onChange={e => setTargetType(e.target.value)}>
          <option value="explore">Penjelajahan / Berburu</option>
          <option value="dungeon">Penyelesaian Dungeon</option>
          <option value="level">Mencapai Level Baru</option>
        </select>
      </div>
      <div className="field">
        <label>Jumlah Target</label>
        <input type="number" min="1" max="100" value={target} onChange={e => setTarget(e.target.value)} />
      </div>
      <div className="formgrid">
        <div className="field">
          <label>Hadiah Gold</label>
          <input type="number" min="0" value={rewardGold} onChange={e => setRewardGold(e.target.value)} />
        </div>
        <div className="field">
          <label>Hadiah EXP</label>
          <input type="number" min="0" value={rewardXp} onChange={e => setRewardXp(e.target.value)} />
        </div>
      </div>
      <div className="modalfoot">
        <button type="button" onClick={closeModal}>Batal</button>
        <button className="primary" type="submit">Terbitkan Quest</button>
      </div>
    </form>
  );
}
