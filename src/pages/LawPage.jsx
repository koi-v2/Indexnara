import React from 'react';
import { useGame } from '../context/GameContext';
import { uid, addLog, addChronicle, fmtTime } from '../engine/gameEngine';

export default function LawPage() {
  const { state, setState } = useGame();
  const crimes = state.crimes || [];
  const punishments = (state.punishments || []).filter(p => p.active);
  const cs = (state.characters || []).filter(c => !c.retired && !c.dead);

  const handleReportCrime = () => {
    if (!cs.length) {
      alert('Buat karakter dahulu.');
      return;
    }
    const name = window.prompt('Nama terlapor:\n' + cs.map(c => c.name).join(', '));
    if (!name) return;
    const c = cs.find(x => x.name.toLowerCase() === name.trim().toLowerCase());
    if (!c) {
      alert('Karakter tidak ditemukan.');
      return;
    }
    const reason = window.prompt('Jenis dugaan pelanggaran: Penyerangan tanpa izin / Pencurian barang atau gold / Pelanggaran aturan guild / Perkelahian antaranggota guild');
    if (!reason || !reason.trim()) return;

    setState(prev => {
      const next = structuredClone(prev);
      const targetChar = (next.characters || []).find(x => x.id === c.id);
      if (!targetChar) return prev;

      const pool = (next.characters || []).filter(x => !x.retired && !x.dead && x.id !== targetChar.id);
      const victim = pool.length && Math.random() < 0.82 ? pool[Math.floor(Math.random() * pool.length)] : null;
      let lossGold = 0;
      let injury = null;

      if (/pencurian/i.test(reason) && victim) {
        lossGold = Math.min(Math.max(0, Number(victim.gold) || 0), 10 + Math.floor(Math.random() * 26));
        victim.gold = Math.max(0, (Number(victim.gold) || 0) - lossGold);
        targetChar.gold = (Number(targetChar.gold) || 0) + lossGold;
      }

      if (/penyerangan|perkelahian/i.test(reason) && victim) {
        const severityRoll = Math.random();
        const severity = severityRoll < 0.42 ? 'Ringan' : severityRoll < 0.76 ? 'Sedang' : severityRoll < 0.94 ? 'Berat' : 'Kritis';
        const maxHp = Math.max(1, Number(victim.maxHp) || 100);
        const damagePct = severity === 'Ringan' ? 0.05 + Math.random() * 0.1 : severity === 'Sedang' ? 0.15 + Math.random() * 0.2 : severity === 'Berat' ? 0.35 + Math.random() * 0.25 : 0.6 + Math.random() * 0.3;
        const damage = Math.max(1, Math.round(maxHp * damagePct));
        victim.hp = Math.max(1, (Number(victim.hp) || maxHp) - damage);
        injury = {
          severity,
          damage,
          maxHp,
          damagePct: Math.round(damagePct * 100),
          condition: severity === 'Ringan' ? 'Memar; pulih cepat' : severity === 'Sedang' ? 'Luka dan perlu istirahat' : severity === 'Berat' ? 'Cedera serius; aktivitas terganggu' : 'Kondisi kritis; perlu perawatan segera'
        };
        victim.lastAction = 'Menjadi korban penyerangan (' + severity.toLowerCase() + ')';
      }

      const witnesses = pool.filter(x => x.id !== victim?.id && Math.random() < 0.28).slice(0, 3).map(x => x.name);
      if (victim && Math.random() < 0.8) witnesses.unshift(victim.name);
      const evidenceLevel = witnesses.length >= 2 ? 'Kuat' : witnesses.length === 1 ? 'Sedang' : 'Lemah';

      const cr = {
        id: uid(),
        at: new Date().toISOString(),
        characterId: targetChar.id,
        characterName: targetChar.name,
        reason: reason.trim(),
        victimId: victim?.id || null,
        victimName: victim?.name || 'Tidak diketahui',
        lossGold,
        injury,
        kind: 'reported',
        evidence: victim ? 'Korban teridentifikasi.' : 'Belum ada korban yang teridentifikasi.',
        witnesses,
        evidenceLevel,
        status: 'Menunggu investigasi',
        punished: false,
        source: 'reported'
      };

      next.crimes = next.crimes || [];
      next.crimes.unshift(cr);
      next.crimes = next.crimes.slice(0, 200);

      addLog(next, 'Insiden dilaporkan: ' + targetChar.name + ' — ' + reason.trim(), 'law', targetChar.id);
      addChronicle(next, 'Kasus baru dibuka: ' + targetChar.name + ' — ' + reason.trim() + '.', 'law');
      return next;
    });
  };

  const handleInvestigate = (id) => {
    setState(prev => {
      const next = structuredClone(prev);
      const cr = (next.crimes || []).find(x => x.id === id);
      if (!cr || cr.punished) return prev;

      const n = (cr.witnesses || []).length;
      const roll = Math.random();
      if (n >= 2 || roll < 0.35) {
        cr.evidenceLevel = 'Kuat';
        cr.status = 'Menunggu keputusan';
        cr.evidence += ' Penjaga menemukan bukti pendukung yang menguatkan laporan.';
      } else if (n === 1 || roll < 0.72) {
        cr.evidenceLevel = 'Sedang';
        cr.status = 'Menunggu keputusan';
        cr.evidence += ' Keterangan saksi mendukung sebagian laporan.';
      } else {
        cr.evidenceLevel = 'Lemah';
        cr.status = 'Bukti lemah';
        cr.evidence += ' Penyelidikan belum menemukan bukti yang cukup.';
      }

      addLog(next, 'Investigasi kasus ' + cr.characterName + ': bukti ' + cr.evidenceLevel + '.', 'law', cr.characterId);
      return next;
    });
  };

  const handlePunish = (id) => {
    const cr = crimes.find(x => x.id === id);
    if (!cr || cr.punished) return;

    if (!['Menunggu keputusan', 'Bukti lemah'].includes(cr.status)) {
      alert('Lakukan investigasi terlebih dahulu sebelum sidang.');
      return;
    }
    if (cr.evidenceLevel === 'Lemah' && cr.status === 'Bukti lemah' && !window.confirm('Bukti masih lemah. Tetap lanjutkan sidang?')) {
      return;
    }

    const type = window.prompt('Putusan: Denda / Larangan aktivitas / Penjara', 'Denda');
    if (!type) return;
    const normalized = /penjara|kurungan/i.test(type) ? 'Penjara' : /larangan/i.test(type) ? 'Larangan aktivitas' : 'Denda';
    const fine = normalized === 'Denda' ? Math.max(0, Number(window.prompt('Denda gold', '50')) || 0) : 0;
    const cycles = Math.max(1, Math.min(100, Number(window.prompt('Durasi dalam siklus', '3')) || 3));

    setState(prev => {
      const next = structuredClone(prev);
      const targetCrime = (next.crimes || []).find(x => x.id === id);
      const c = (next.characters || []).find(x => x.id === targetCrime?.characterId);
      if (!targetCrime || !c) return prev;

      c.gold = Math.max(0, (Number(c.gold) || 0) - fine);
      next.punishments = next.punishments || [];
      next.punishments.unshift({
        id: uid(),
        characterId: c.id,
        characterName: c.name,
        type: normalized,
        reason: targetCrime.reason,
        fine,
        cyclesLeft: cycles,
        active: true,
        at: new Date().toISOString(),
        caseId: targetCrime.id
      });
      targetCrime.punished = true;
      targetCrime.status = 'Putusan dijatuhkan: ' + normalized;

      if (targetCrime.victimId && targetCrime.lossGold > 0 && normalized === 'Denda') {
        const victim = (next.characters || []).find(x => x.id === targetCrime.victimId);
        if (victim) {
          const compensation = Math.min(fine, targetCrime.lossGold);
          victim.gold = (Number(victim.gold) || 0) + compensation;
          targetCrime.compensation = compensation;
        }
      }

      addChronicle(next, c.name + ' dijatuhi hukuman ' + normalized + ' setelah sidang kasus ' + targetCrime.reason + '.', 'law');
      addLog(next, 'Putusan hukum: ' + c.name + ' — ' + normalized + '.', 'law', c.id);
      return next;
    });
  };

  const handleRelease = (id) => {
    setState(prev => {
      const next = structuredClone(prev);
      const p = (next.punishments || []).find(x => x.id === id);
      if (!p || !p.active) return prev;
      p.active = false;
      p.cyclesLeft = 0;
      p.endedAt = new Date().toISOString();
      const c = (next.characters || []).find(x => x.id === p.characterId);
      if (c) c.lastAction = 'Hukuman berakhir';
      addChronicle(next, 'Hukuman ' + p.type + ' untuk ' + p.characterName + ' diakhiri.', 'law');
      addLog(next, 'Hukuman ' + p.type + ' untuk ' + p.characterName + ' diakhiri secara manual.', 'law', p.characterId);
      return next;
    });
  };

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>⚖️ Hukum & Hukuman</h2>
          <p className="muted small">Kejadian dunia, korban, kerugian, saksi, investigasi, dan keputusan hukum.</p>
        </div>
        <button className="primary" onClick={handleReportCrime}>＋ Buat laporan</button>
      </div>

      <div className="grid">
        <div className="card">
          <h3>📋 Kasus & investigasi</h3>
          {crimes.length ? (
            crimes.map(x => (
              <div key={x.id} className="logitem">
                <time>{fmtTime(x.at)}</time>
                <b>{x.characterName}</b> — {x.reason}
                <p className="small">
                  Korban: <b>{x.victimName || 'Tidak diketahui'}</b> · Kerugian: <b>{Number(x.lossGold || 0)} gold</b>
                </p>
                <p className="small">
                  {x.injury ? (
                    <>Dampak penyerangan: <b>{x.injury.severity}</b> · Kerusakan {x.injury.damage} HP ({x.injury.damagePct}%). {x.injury.condition}</>
                  ) : (
                    'Tidak ada cedera fisik tercatat.'
                  )}
                </p>
                <p className="small muted">{x.evidence || 'Belum ada bukti'}</p>
                <p className="small">
                  Saksi: {(x.witnesses || []).join(', ') || 'Tidak ada saksi'} · Bukti: {x.evidenceLevel || 'Belum dinilai'} · Status: <b>{x.status || (x.punished ? 'Hukuman dijatuhkan' : 'Menunggu investigasi')}</b>
                </p>
                {!x.punished && (
                  <div className="row" style={{ marginTop: '8px' }}>
                    {x.status !== 'Menunggu keputusan' && x.status !== 'Bukti lemah' && (
                      <button onClick={() => handleInvestigate(x.id)}>🔎 Investigasi</button>
                    )}
                    <button onClick={() => handlePunish(x.id)}>⚖️ Sidang / putuskan</button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="muted">Belum ada kasus. Insiden dapat muncul saat simulasi berjalan.</p>
          )}
        </div>

        <div className="card">
          <h3>🔒 Hukuman aktif</h3>
          {punishments.length ? (
            punishments.map(x => (
              <div key={x.id} className="logitem">
                <b>{x.characterName}</b>
                <p>{x.type} · {x.reason}</p>
                <small>Denda {x.fine} gold · {x.cyclesLeft} siklus tersisa</small>
                <br />
                <button style={{ marginTop: '8px' }} onClick={() => handleRelease(x.id)}>Akhiri hukuman</button>
              </div>
            ))
          ) : (
            <p className="muted">Tidak ada hukuman aktif.</p>
          )}
        </div>
      </div>
    </div>
  );
}
