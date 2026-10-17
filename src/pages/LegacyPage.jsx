import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { uid, fmtTime, addLog, addChronicle } from '../engine/gameEngine';
import { dynastyForCharacter } from '../engine/worldSystems';

export default function LegacyPage() {
  const { state, setState, openModal, closeModal } = useGame();
  const legacy = state.legacy || { retired: [], lineages: [], mentors: [] };
  const retired = legacy.retired || [];
  const lineages = legacy.lineages || [];
  const activeChars = (state.characters || []).filter(c => !c.retired && !c.dead);

  const openSuccessorModal = () => {
    if (!activeChars.length) {
      alert('Belum ada karakter aktif untuk dijadikan leluhur/mentor.');
      return;
    }
    openModal({
      title: '🌱 Buat Generasi Baru (Penerus)',
      content: <SuccessorForm />
    });
  };

  const openRetireModal = () => {
    if (!activeChars.length) {
      alert('Tidak ada karakter aktif untuk dipensiunkan.');
      return;
    }
    openModal({
      title: '🕯️ Pensiunkan Petualang Senior',
      content: <RetireForm />
    });
  };

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>🧬 Generasi & Warisan</h2>
          <div className="muted small">Pensiunkan petualang senior, pilih mentor, dan lahirkan generasi penerus.</div>
        </div>
        <div className="row">
          <button onClick={openRetireModal}>🕯️ Pensiunkan Karakter</button>
          <button className="primary" onClick={openSuccessorModal}>＋ Buat Penerus</button>
        </div>
      </div>

      <div className="grid" style={{ marginBottom: '14px' }}>
        <div className="card">
          <h3>📜 Garis Keturunan & Silsilah ({lineages.length})</h3>
          {lineages.length ? (
            <div className="log" style={{ maxHeight: '250px' }}>
              {lineages.slice(0, 30).map((x, i) => (
                <div key={i} className="logitem">
                  <time>{fmtTime(x.at)}</time>
                  <b>{x.childName}</b> — Penerus dari <b>{x.parentName}</b>
                  <div className="muted small">{x.legacyText || 'Mewarisi nama dan kehormatan keluarga.'}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted">Belum ada penerus yang tercatat.</p>
          )}
        </div>

        <div className="card">
          <h3>🏛️ Arsip Karakter Pensiun ({retired.length})</h3>
          {retired.length ? (
            <div className="log" style={{ maxHeight: '250px' }}>
              {retired.map((r, i) => (
                <div key={i} className="logitem">
                  <b>{r.name}</b> · Lv.{r.level} · {r.role}
                  <div className="muted small">Pensiun: {fmtTime(r.retiredAt)} · Alasan: {r.reason}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted">Belum ada karakter yang pensiun.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function SuccessorForm() {
  const { state, setState, closeModal } = useGame();
  const activeChars = (state.characters || []).filter(c => !c.retired && !c.dead);
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState(activeChars[0]?.id || '');
  const [style, setStyle] = useState('balanced');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    const parent = activeChars.find(c => c.id === parentId);
    if (!parent) return;

    setState(prev => {
      const next = structuredClone(prev);
      const child = {
        id: uid(),
        name: name.trim(),
        role: `Penerus ${parent.role}`,
        level: 1,
        age: 18,
        maxHp: Math.max(70, Math.floor((parent.maxHp || 100) * 0.65)),
        maxMp: Math.max(15, Math.floor((parent.maxMp || 30) * 0.65)),
        hp: Math.max(70, Math.floor((parent.maxHp || 100) * 0.65)),
        mp: Math.max(15, Math.floor((parent.maxMp || 30) * 0.65)),
        atk: Math.max(5, Math.floor((parent.atk || 10) * 0.55)),
        def: Math.max(3, Math.floor((parent.def || 5) * 0.55)),
        mag: Math.max(3, Math.floor((parent.mag || 5) * 0.55)),
        agi: Math.max(3, Math.floor((parent.agi || 5) * 0.7)),
        gold: Math.min(150, Math.floor((parent.gold || 0) * 0.08)),
        xp: 0,
        photo: '',
        personality: `Mewarisi kisah ${parent.name}; tumbuh dengan jalan hidupnya sendiri.`,
        aiStyle: style,
        aiGoal: parent.aiGoal || 'balanced',
        inventory: [],
        equipment: { weapon: null, armor: null, accessory: null },
        locationId: 'town',
        status: 'Bebas',
        lastAction: `Memulai perjalanan sebagai penerus ${parent.name}`,
        created: new Date().toISOString(),
        generation: (parent.generation || 1) + 1,
        ancestorId: parent.id
      };

      const dyn = dynastyForCharacter(next, parent);
      child.dynastyId = dyn.id;
      child.familyName = dyn.name;
      if (!dyn.members.includes(child.id)) dyn.members.push(child.id);

      next.characters.push(child);
      next.legacy = next.legacy || { retired: [], lineages: [], mentors: [] };
      next.legacy.lineages.unshift({
        at: new Date().toISOString(),
        parentId: parent.id,
        parentName: parent.name,
        childId: child.id,
        childName: child.name,
        generation: child.generation,
        legacyText: `Penerus generasi baru dari ${parent.name}.`
      });

      addLog(next, `Penerus baru lahir: ${child.name} dari garis keturunan ${parent.name}.`, 'legacy', child.id);
      addChronicle(next, `${child.name} memulai generasi baru sebagai penerus ${parent.name}.`, 'legacy');
      return next;
    });
    closeModal();
    alert(`Penerus baru ${name.trim()} berhasil lahir!`);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="field">
        <label>Nama Penerus</label>
        <input required value={name} onChange={e => setName(e.target.value)} placeholder="Contoh: Arden Ashford Jr." />
      </div>
      <div className="field">
        <label>Leluhur / Mentor</label>
        <select value={parentId} onChange={e => setParentId(e.target.value)}>
          {activeChars.map(c => (
            <option key={c.id} value={c.id}>{c.name} · Lv.{c.level} · {c.role}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>Gaya Karakter Penerus</label>
        <select value={style} onChange={e => setStyle(e.target.value)}>
          <option value="balanced">Seimbang</option>
          <option value="warrior">Petarung Tangguh</option>
          <option value="tactical">Strategis & Analitis</option>
          <option value="cautious">Hati-hati & Bertahan</option>
          <option value="explorer">Penjelajah Alam</option>
        </select>
      </div>
      <div className="modalfoot">
        <button type="button" onClick={closeModal}>Batal</button>
        <button className="primary" type="submit">Lahirkan Penerus</button>
      </div>
    </form>
  );
}

function RetireForm() {
  const { state, setState, closeModal } = useGame();
  const activeChars = (state.characters || []).filter(c => !c.retired && !c.dead);
  const [retireId, setRetireId] = useState(activeChars[0]?.id || '');
  const [reason, setReason] = useState('Pensiun sukarela untuk melatih generasi baru.');

  const handleRetire = (e) => {
    e.preventDefault();
    const c = activeChars.find(x => x.id === retireId);
    if (!c) return;

    setState(prev => {
      const next = structuredClone(prev);
      const target = next.characters.find(x => x.id === retireId);
      if (target) {
        target.retired = true;
        target.retiredAt = new Date().toISOString();
        target.retireReason = reason;
        next.legacy = next.legacy || { retired: [], lineages: [], mentors: [] };
        next.legacy.retired.unshift({
          id: target.id,
          name: target.name,
          level: target.level,
          role: target.role,
          retiredAt: target.retiredAt,
          reason
        });
        addLog(next, `${target.name} resmi pensiun dari dunia petualang.`, 'legacy', target.id);
        addChronicle(next, `${target.name} pensiun setelah mengabdi panjang bagi dunia.`, 'legacy');
      }
      return next;
    });
    closeModal();
  };

  return (
    <form onSubmit={handleRetire}>
      <div className="field">
        <label>Pilih Karakter untuk Pensiun</label>
        <select value={retireId} onChange={e => setRetireId(e.target.value)}>
          {activeChars.map(c => (
            <option key={c.id} value={c.id}>{c.name} · Lv.{c.level} · {c.role}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>Alasan Pensiun</label>
        <input value={reason} onChange={e => setReason(e.target.value)} />
      </div>
      <div className="modalfoot">
        <button type="button" onClick={closeModal}>Batal</button>
        <button className="primary" type="submit">Pensiunkan</button>
      </div>
    </form>
  );
}
