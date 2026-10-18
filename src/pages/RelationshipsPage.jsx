import React, { useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { uid, addLog, fmtTime, generateCharacterSkills } from '../engine/gameEngine';

export default function RelationshipsPage() {
  const { state, setState } = useGame();
  const relationships = state.relationships || [];
  const familyEvents = state.familyEvents || [];
  const active = relationships.filter(r => r.status !== 'Berakhir');

  // Tutup hubungan lama jika salah satu pasangan meninggal, pensiun, hilang, atau gender sama.
  useEffect(() => {
    const chars = state.characters || [];
    const needsCleanup = (state.relationships || []).some(r => {
      if (r.status === 'Berakhir') return false;
      const a = chars.find(c => c.id === r.a);
      const b = chars.find(c => c.id === r.b);
      return !a || !b || a.dead || a.retired || b.dead || b.retired || !a.gender || !b.gender || a.gender === b.gender;
    });
    if (!needsCleanup) return;
    setState(prev => {
      const next = structuredClone(prev);
      const charsNow = next.characters || [];
      (next.relationships || []).forEach(r => {
        if (r.status === 'Berakhir') return;
        const a = charsNow.find(c => c.id === r.a);
        const b = charsNow.find(c => c.id === r.b);
        const invalid = !a || !b || a.dead || a.retired || b.dead || b.retired || !a.gender || !b.gender || a.gender === b.gender;
        if (!invalid) return;
        r.status = 'Berakhir';
        r.endedAt = Date.now();
        r.endReason = (!a || !b || a?.dead || a?.retired || b?.dead || b?.retired) ? 'Pasangan meninggal atau tidak lagi aktif' : 'Tidak memenuhi aturan gender pasangan';
        if (a?.spouseId === b?.id) delete a.spouseId;
        if (b?.spouseId === a?.id) delete b.spouseId;
        next.familyEvents = next.familyEvents || [];
        next.familyEvents.push({ at: Date.now(), text: `${a?.name || 'Karakter'} dan ${b?.name || 'pasangannya'} mengakhiri hubungan: ${r.endReason}.` });
        addLog(next, `${a?.name || 'Karakter'} dan ${b?.name || 'pasangannya'}: hubungan berakhir (${r.endReason}).`, 'family');
      });
      return next;
    });
  }, [state.relationships, state.characters, setState]);
  const ended = relationships.filter(r => r.status === 'Berakhir');

  const getChar = (id) => (state.characters || []).find(c => c.id === id);

  const handleStart = () => {
    const pool = (state.characters || []).filter(c =>
      !c.retired && !c.dead && Number(c.age ?? 18) >= 18 &&
      (c.gender === 'Laki-laki' || c.gender === 'Perempuan') &&
      !active.some(r => r.a === c.id || r.b === c.id)
    );
    if (pool.length < 2) {
      alert('Butuh dua karakter dewasa (usia 18+) yang belum punya pasangan.');
      return;
    }
    const an = window.prompt('Masukkan nama karakter pertama:\n' + pool.map(c => c.name + ' (usia ' + Number(c.age ?? 18) + ')').join('\n'));
    if (!an) return;
    const a = pool.find(c => String(c.name).toLowerCase() === an.trim().toLowerCase());
    if (!a) {
      alert('Karakter pertama tidak ditemukan.');
      return;
    }
    const options = pool.filter(c => c.id !== a.id && c.gender !== a.gender);
    const bn = window.prompt('Masukkan nama karakter kedua:\n' + options.map(c => c.name + ' (usia ' + Number(c.age ?? 18) + ')').join('\n'));
    if (!bn) return;
    const b = options.find(c => String(c.name).toLowerCase() === bn.trim().toLowerCase());
    if (!b) {
      alert('Karakter kedua tidak ditemukan.');
      return;
    }

    setState(prev => {
      const next = structuredClone(prev);
      const r = {
        id: uid(),
        a: a.id,
        b: b.id,
        status: 'Pacaran',
        affection: 20,
        children: [],
        startedAt: Date.now(),
        history: [{ status: 'Pacaran', at: Date.now() }]
      };
      next.relationships = next.relationships || [];
      next.relationships.push(r);
      next.familyEvents = next.familyEvents || [];
      next.familyEvents.push({ at: Date.now(), text: a.name + ' dan ' + b.name + ' mulai pacaran.' });
      addLog(next, a.name + ' dan ' + b.name + ' mulai pacaran.', 'family');
      return next;
    });
  };

  const handleAdvanceAll = () => {
    if (!active.length) {
      alert('Belum ada hubungan aktif.');
      return;
    }
    setState(prev => {
      const next = structuredClone(prev);
      const nextActive = (next.relationships || []).filter(r => r.status !== 'Berakhir');
      nextActive.forEach(r => {
        const gain = 5 + Math.floor(Math.random() * 6);
        r.affection = Math.min(100, (Number(r.affection) || 0) + gain);
      });
      next.familyEvents = next.familyEvents || [];
      next.familyEvents.push({ at: Date.now(), text: 'Semua pasangan menghabiskan waktu bersama dan mempererat hubungan.' });
      return next;
    });
  };

  const handleAdvanceOne = (id) => {
    setState(prev => {
      const next = structuredClone(prev);
      const r = (next.relationships || []).find(x => x.id === id);
      if (!r) return prev;
      const gain = 8 + Math.floor(Math.random() * 8);
      r.affection = Math.min(100, (Number(r.affection) || 0) + gain);
      const a = (next.characters || []).find(c => c.id === r.a);
      const b = (next.characters || []).find(c => c.id === r.b);
      next.familyEvents = next.familyEvents || [];
      next.familyEvents.push({ at: Date.now(), text: (a?.name || 'Pasangan') + ' & ' + (b?.name || '') + ' menikmati waktu bersama (+ ' + gain + ' kedekatan).' });
      return next;
    });
  };

  const handleAction = (id, action) => {
    const r = relationships.find(x => x.id === id);
    if (!r) return;
    const a = getChar(r.a);
    const b = getChar(r.b);
    if (!a || !b) return;

    if (action === 'engage') {
      if ((Number(r.affection) || 0) < 30) {
        alert('Kedekatan minimal 30 diperlukan untuk bertunangan. Lakukan quality time dulu.');
        return;
      }
      if (!window.confirm('Konfirmasi: ' + a.name + ' dan ' + b.name + ' bertunangan?')) return;
      setState(prev => {
        const next = structuredClone(prev);
        const rel = (next.relationships || []).find(x => x.id === id);
        if (rel) {
          rel.status = 'Tunangan';
          rel.affection = Math.min(100, (Number(rel.affection) || 0) + 15);
          next.familyEvents = next.familyEvents || [];
          next.familyEvents.push({ at: Date.now(), text: a.name + ' dan ' + b.name + ' bertunangan.' });
          addLog(next, a.name + ' dan ' + b.name + ' resmi bertunangan.', 'family');
        }
        return next;
      });
    } else if (action === 'marry') {
      if ((Number(r.affection) || 0) < 50) {
        alert('Kedekatan minimal 50 diperlukan untuk menikah. Lakukan quality time dulu.');
        return;
      }
      if (!window.confirm('Konfirmasi pernikahan ' + a.name + ' dan ' + b.name + '?')) return;
      setState(prev => {
        const next = structuredClone(prev);
        const rel = (next.relationships || []).find(x => x.id === id);
        const charA = (next.characters || []).find(c => c.id === a.id);
        const charB = (next.characters || []).find(c => c.id === b.id);
        if (rel && charA && charB) {
          rel.status = 'Menikah';
          rel.marriedAt = Date.now();
          rel.affection = Math.min(100, (Number(rel.affection) || 0) + 20);
          charA.spouseId = charB.id;
          charB.spouseId = charA.id;
          next.familyEvents = next.familyEvents || [];
          next.familyEvents.push({ at: Date.now(), text: 'Pernikahan agung ' + charA.name + ' dan ' + charB.name + ' diadakan dengan meriah!' });
          addLog(next, charA.name + ' dan ' + charB.name + ' resmi menikah.', 'family');
        }
        return next;
      });
    } else if (action === 'child') {
      const childName = window.prompt('Masukkan nama anak untuk pasangan ' + a.name + ' dan ' + b.name + ':');
      if (!childName || !childName.trim()) return;

      setState(prev => {
        const next = structuredClone(prev);
        const rel = (next.relationships || []).find(x => x.id === id);
        if (!rel) return prev;

        const newChildId = uid();
        const baseAtk = Math.round(((Number(a.atk) || 10) + (Number(b.atk) || 10)) / 2 * 0.9);
        const baseDef = Math.round(((Number(a.def) || 5) + (Number(b.def) || 5)) / 2 * 0.9);
        const baseMag = Math.round(((Number(a.mag) || 5) + (Number(b.mag) || 5)) / 2 * 0.9);
        const baseAgi = Math.round(((Number(a.agi) || 5) + (Number(b.agi) || 5)) / 2 * 0.9);
        const maxHp = 80;
        const maxMp = 30;

        const newChar = {
          id: newChildId,
          name: childName.trim(),
          role: Math.random() < 0.5 ? a.role : b.role,
          age: 0,
          level: 1,
          maxHp,
          maxMp,
          hp: maxHp,
          mp: maxMp,
          atk: Math.max(1, baseAtk),
          def: Math.max(1, baseDef),
          mag: Math.max(1, baseMag),
          agi: Math.max(1, baseAgi),
          gold: 20,
          xp: 0,
          photo: '',
          personality: 'Anak dari ' + a.name + ' dan ' + b.name + '. Masih belajar tentang dunia.',
          aiStyle: a.aiStyle || 'balanced',
          aiGoal: 'exploration',
          inventory: [],
          equipment: { weapon: null, armor: null, accessory: null },
          locationId: 'town',
          status: 'Bebas',
          lastAction: 'Baru lahir',
          created: new Date().toISOString(),
          skills: generateCharacterSkills(),
          parentId1: a.id,
          parentId2: b.id
        };

        next.characters = next.characters || [];
        next.characters.push(newChar);
        rel.children = rel.children || [];
        rel.children.push(newChildId);
        next.familyEvents = next.familyEvents || [];
        next.familyEvents.push({ at: Date.now(), text: 'Kelahiran anak: ' + newChar.name + ', buah hati ' + a.name + ' dan ' + b.name + '!' });
        addLog(next, 'Kelahiran baru di dunia: ' + newChar.name + ' lahir!', 'family');
        return next;
      });
    } else if (action === 'end') {
      if (!window.confirm('Yakin mengakhiri hubungan ' + a.name + ' dan ' + b.name + '?')) return;
      setState(prev => {
        const next = structuredClone(prev);
        const rel = (next.relationships || []).find(x => x.id === id);
        const charA = (next.characters || []).find(c => c.id === a.id);
        const charB = (next.characters || []).find(c => c.id === b.id);
        if (rel) {
          rel.status = 'Berakhir';
          rel.endedAt = Date.now();
          rel.endReason = 'Perpisahan';
        }
        if (charA && charA.spouseId === b.id) delete charA.spouseId;
        if (charB && charB.spouseId === a.id) delete charB.spouseId;
        next.familyEvents = next.familyEvents || [];
        next.familyEvents.push({ at: Date.now(), text: a.name + ' dan ' + b.name + ' mengakhiri hubungan mereka.' });
        return next;
      });
    }
  };

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>💞 Hubungan & Keluarga</h2>
          <p className="muted small">Karakter dewasa bisa pacaran, bertunangan, menikah, punya anak, dan membangun garis keturunan.</p>
        </div>
        <button className="primary" onClick={handleStart}>💗 Mulai pacaran</button>
      </div>

      <div className="card">
        <h3>📌 Aturan hubungan</h3>
        <p className="small muted">
          Hanya karakter berusia 18 tahun ke atas yang bisa memulai hubungan. Setiap karakter hanya boleh punya satu hubungan aktif. Tahapan harus berurutan dan anak menjadi karakter baru dengan data orang tua.
        </p>
        <button onClick={handleAdvanceAll}>💞 Quality time semua pasangan</button>
      </div>

      <h3>Hubungan aktif</h3>
      {active.length ? (
        active.map(r => {
          const a = getChar(r.a);
          const b = getChar(r.b);
          const children = (r.children || []).map(id => getChar(id)).filter(Boolean);
          const affection = Math.max(0, Math.min(100, Number(r.affection) || 0));

          return (
            <div key={r.id} className="card" style={{ marginBottom: '10px' }}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <h3 style={{ margin: 0 }}>{a?.name || 'Karakter'} ♥ {b?.name || 'Karakter'}</h3>
                <span className="pill">{r.status}</span>
              </div>
              <p className="small muted">Kedekatan {affection}/100</p>
              <div className="bar"><i style={{ width: `${affection}%` }}></i></div>
              <p>💞 Bersama sejak: {r.startedAt ? new Date(r.startedAt).toLocaleDateString('id-ID') : 'tanggal tidak tercatat'}</p>
              <p>👶 Anak ({children.length}): {children.map(c => `${c.name} (usia ${c.age || 0})`).join(', ') || 'Belum punya anak'}</p>
              <div className="row">
                {r.status === 'Pacaran' && (
                  <button className="primary" onClick={() => handleAction(r.id, 'engage')}>💍 Tunangan</button>
                )}
                {r.status === 'Tunangan' && (
                  <button className="primary" onClick={() => handleAction(r.id, 'marry')}>💒 Menikah</button>
                )}
                {r.status === 'Menikah' && (
                  <button className="primary" onClick={() => handleAction(r.id, 'child')}>👶 Punya anak</button>
                )}
                <button onClick={() => handleAdvanceOne(r.id)}>💗 Quality time</button>
                <button className="danger" onClick={() => handleAction(r.id, 'end')}>💔 Akhiri</button>
              </div>
            </div>
          );
        })
      ) : (
        <div className="card muted">Belum ada hubungan aktif. Buat pasangan dari dua karakter dewasa yang belum memiliki pasangan.</div>
      )}

      {ended.length > 0 && (
        <div className="card">
          <h3>💔 Hubungan berakhir</h3>
          {ended.slice().reverse().map(r => {
            const a = getChar(r.a);
            const b = getChar(r.b);
            return (
              <div key={r.id} className="logitem">
                {a?.name || 'Karakter'} & {b?.name || 'Karakter'} · {r.endReason || 'Hubungan berakhir'}
              </div>
            );
          })}
        </div>
      )}

      <div className="card">
        <h3>📜 Riwayat keluarga</h3>
        {familyEvents.length ? (
          familyEvents.slice().reverse().slice(0, 50).map((e, idx) => (
            <div key={idx} className="logitem">
              <time>{e.at ? fmtTime(e.at) : ''}</time>
              {e.text || 'Peristiwa keluarga'}
            </div>
          ))
        ) : (
          <p className="muted">Belum ada peristiwa keluarga.</p>
        )}
      </div>
    </div>
  );
}
