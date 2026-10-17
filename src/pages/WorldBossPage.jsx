import React from 'react';
import { useGame } from '../context/GameContext';
import { activeBoss, summonBoss, attackBoss } from '../engine/worldSystems';
import { fmtTime } from '../engine/gameEngine';

export default function WorldBossPage() {
  const { state, setState } = useGame();
  const boss = activeBoss(state);
  const characters = (state.characters || []).filter(c => !c.retired && !c.dead);
  const history = state.bossHistory || [];

  const handleSummon = () => {
    setState(prev => {
      const next = structuredClone(prev);
      const success = summonBoss(next);
      if (!success) alert('Masih ada World Boss aktif.');
      return next;
    });
  };

  const handleAttack = (charId) => {
    setState(prev => {
      const next = structuredClone(prev);
      const res = attackBoss(next, charId);
      if (!res.ok) alert(res.msg);
      return next;
    });
  };

  const hpPct = boss ? Math.max(0, Math.min(100, (boss.hp / boss.maxHp) * 100)) : 0;
  const minutesLeft = boss ? Math.max(0, Math.ceil((boss.expiresAt - Date.now()) / 60000)) : 0;
  const participants = boss ? Object.values(boss.participants || {}).sort((a, b) => b.damage - a.damage) : [];

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>🐉 World Boss Raid</h2>
          <div className="muted small">Boss berbatas waktu, HP bersama, hadiah berdasarkan kontribusi damage.</div>
        </div>
        <button className="primary" onClick={handleSummon} disabled={!!boss}>
          ＋ Panggil World Boss
        </button>
      </div>

      {boss ? (
        <>
          <div className="card boss-card" style={{ marginBottom: '14px' }}>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <h2 style={{ margin: 0 }}>☠ {boss.name} · Lv {boss.level}</h2>
              <span className="pill">⏳ Sisa {minutesLeft} menit</span>
            </div>
            <div className="itemline" style={{ marginTop: '8px' }}>
              <span>HP Boss:</span>
              <b>{boss.hp.toLocaleString('id-ID')} / {boss.maxHp.toLocaleString('id-ID')}</b>
            </div>
            <div className="bar"><i style={{ width: `${hpPct}%`, background: 'var(--red)' }}></i></div>
            <p className="muted small">
              Hadiah total: {boss.reward} gold · {boss.xp} EXP · Total serangan: {boss.turns}
            </p>

            <h4>Peringkat Kontribusi:</h4>
            {participants.length ? (
              <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                {participants.map((p, i) => (
                  <div key={i} className="itemline">
                    <span>#{i + 1} {p.name}</span>
                    <b>{p.damage.toLocaleString('id-ID')} dmg ({p.attacks} serangan)</b>
                  </div>
                ))}
              </div>
            ) : (
              <p className="muted small">Belum ada petualang yang menyerang boss ini.</p>
            )}
          </div>

          <div className="card">
            <h3>⚔ Kirim Petualang untuk Menyerang</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '250px', overflowY: 'auto' }}>
              {characters.map(c => (
                <div key={c.id} className="itemline">
                  <div>
                    <b>{c.name}</b>
                    <div className="muted small">Lv {c.level} · HP {c.hp}/{c.maxHp} · ATK {c.atk}</div>
                  </div>
                  <button
                    className="primary"
                    disabled={(c.hp || 0) <= 1}
                    onClick={() => handleAttack(c.id)}
                  >
                    Serang
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="card empty">
          Belum ada World Boss yang muncul. Klik "Panggil World Boss" untuk memulai pertempuran raid bersama!
        </div>
      )}

      <div className="card" style={{ marginTop: '14px' }}>
        <h3>📜 Riwayat Raid Sebelumnya</h3>
        {history.length ? (
          <div className="log" style={{ maxHeight: '200px' }}>
            {history.map((h, i) => (
              <div key={i} className="itemline">
                <span>{h.name} · <b style={{ color: h.status === 'defeated' ? 'var(--green)' : 'var(--red)' }}>{h.status === 'defeated' ? 'Berhasil Ditaklukkan' : 'Kabur'}</b></span>
                <span className="muted small">{fmtTime(h.at)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted">Belum ada catatan riwayat raid.</p>
        )}
      </div>
    </div>
  );
}
