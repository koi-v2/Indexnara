import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { uid, fmtTime } from '../engine/gameEngine';

export default function RivalsPage() {
  const { state, setState, openModal, closeModal } = useGame();
  const rivalries = state.rivalries || [];
  const characters = state.characters || [];

  const openCreateRivalModal = () => {
    if (characters.length < 2) {
      alert('Tambahkan minimal dua karakter untuk membentuk rivalitas.');
      return;
    }
    openModal({
      title: 'Bentuk Hubungan Rivalitas',
      content: <RivalForm />
    });
  };

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>⚔ Rival & Persaingan</h2>
          <div className="muted small">Pertemuan simulasi membentuk saingan, hubungan dingin, dan musuh bebuyutan.</div>
        </div>
        <button className="primary" onClick={openCreateRivalModal}>＋ Bentuk Rivalitas</button>
      </div>

      <div className="grid">
        {rivalries.length ? (
          rivalries.map(r => {
            const charA = characters.find(c => c.id === r.a);
            const charB = characters.find(c => c.id === r.b);
            const intensity = Math.abs(r.score || 0);

            return (
              <div key={r.id} className="card">
                <h3>{charA?.name || '?'} × {charB?.name || '?'}</h3>
                <span className="pill">{r.kind || 'Netral'}</span>
                <div className="bar"><i style={{ width: `${intensity}%`, background: r.score >= 0 ? 'var(--accent)' : 'var(--red)' }}></i></div>
                <p className="muted small" style={{ marginTop: '8px' }}>
                  Intensitas: {r.score} · Pertemuan: {r.meetings} · Terakhir: {fmtTime(r.updatedAt)}
                </p>
              </div>
            );
          })
        ) : (
          <div className="empty">Belum ada catatan rivalitas. Bentuk secara manual atau biarkan simulasi berjalan.</div>
        )}
      </div>
    </div>
  );
}

function RivalForm() {
  const { state, setState, closeModal } = useGame();
  const characters = state.characters || [];
  const [aId, setAId] = useState(characters[0]?.id || '');
  const [bId, setBId] = useState(characters[1]?.id || '');
  const [score, setScore] = useState(25);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (aId === bId) {
      alert('Pilih dua karakter yang berbeda.');
      return;
    }

    setState(prev => {
      const next = structuredClone(prev);
      next.rivalries = next.rivalries || [];
      const numScore = Number(score);
      const kind = numScore >= 55 ? 'Rival Abadi' : numScore >= 20 ? 'Saingan' : numScore <= -55 ? 'Musuh Bebuyutan' : numScore <= -20 ? 'Tidak Akur' : 'Netral';
      next.rivalries.push({
        id: uid(),
        a: aId,
        b: bId,
        score: numScore,
        meetings: 1,
        winsA: 0,
        winsB: 0,
        kind,
        updatedAt: new Date().toISOString()
      });
      return next;
    });
    closeModal();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="field">
        <label>Karakter A</label>
        <select value={aId} onChange={e => setAId(e.target.value)}>
          {characters.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>Karakter B</label>
        <select value={bId} onChange={e => setBId(e.target.value)}>
          {characters.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>Intensitas Awal</label>
        <select value={score} onChange={e => setScore(Number(e.target.value))}>
          <option value="25">Saingan (Positif / Kompetitif)</option>
          <option value="60">Rival Abadi (Sangat Kuat)</option>
          <option value="-30">Tidak Akur (Hubungan Dingin)</option>
          <option value="-70">Musuh Bebuyutan (Saling Membenci)</option>
        </select>
      </div>
      <div className="modalfoot">
        <button type="button" onClick={closeModal}>Batal</button>
        <button className="primary" type="submit">Bentuk</button>
      </div>
    </form>
  );
}
