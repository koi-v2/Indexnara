import React from 'react';
import { useGame } from '../context/GameContext';
import { worldDateText, runAnnualArena } from '../engine/gameEngine';

export default function ArenaPage() {
  const { state, setState, setCurrentPage } = useGame();
  const eligible = (state.characters || []).filter(c => !c.retired && !c.dead);
  const history = state.arenaHistory || [];

  const handleManualArena = () => {
    if (eligible.length < 2) {
      alert('Dibutuhkan minimal 2 karakter aktif untuk menyelenggarakan arena.');
      return;
    }
    setState(prev => {
      const next = structuredClone(prev);
      runAnnualArena(next);
      return next;
    });
  };

  const prizeRows = [
    ['🥇', 'Juara 1', '1.000 Gold', 'Juara Arena Tahunan', '+ 250 EXP'],
    ['🥈', 'Juara 2', '600 Gold', 'Runner-up Arena', ''],
    ['🥉', 'Juara 3', '300 Gold', 'Peringkat Ketiga Arena', '']
  ];

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>🏟 Arena Kompetisi</h2>
          <div className="muted small">Kompetisi otomatis setiap tahun dunia. Peringkat dihitung dari level dan statistik karakter.</div>
        </div>
        <div className="row">
          <button className="primary" onClick={() => setCurrentPage('battleViewer')}>
            ⚔️ Tonton Duel Live
          </button>
          <button onClick={handleManualArena}>
            🏆 Selenggarakan Turnamen
          </button>
        </div>
      </div>

      <div className="card">
        <div className="stats">
          <div className="statbox">
            <b>{worldDateText(state.worldCalendar)}</b>
            <small>Tanggal dunia</small>
          </div>
          <div className="statbox">
            <b>{eligible.length}</b>
            <small>Peserta aktif</small>
          </div>
          <div className="statbox">
            <b>Setiap 1 tahun</b>
            <small>Jadwal kompetisi</small>
          </div>
        </div>
        <p className="muted small" style={{ marginTop: '10px' }}>
          Satu hari dunia berlangsung selama 10 menit waktu simulasi aktif. Saat simulasi dihentikan, kalender ikut berhenti. Setiap tahun baru, karakter bertambah usia dan arena otomatis diselenggarakan.
        </p>
      </div>

      <h3>🎁 Hadiah Arena Tahunan</h3>
      <div className="card">
        {prizeRows.map((r, i) => (
          <div key={i} className="itemline">
            <div>
              {r[0]} <b>{r[1]}</b>
              <div className="muted small">Title: {r[3]} {r[4] && `· ${r[4]}`}</div>
            </div>
            <b>{r[2]}</b>
          </div>
        ))}
      </div>

      <h3>🏆 Daftar Pemenang Tiap Tahun</h3>
      {history.length ? (
        history.map((e, idx) => (
          <div key={idx} className="card" style={{ marginBottom: '10px' }}>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0 }}>🏆 Arena Tahun {e.year}</h3>
              <span className="pill">{e.participants} peserta</span>
            </div>
            <div className="small muted" style={{ margin: '6px 0 12px' }}>Tanggal: {e.at || ''}</div>
            {(e.top3 || []).map((x, i) => (
              <div key={i} className="itemline">
                <div>
                  <b>{x.place || i + 1}. {x.name}</b> <span className="muted small">Lv {x.level}</span>
                  <div className="muted small">🏅 {x.title}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <b>{Number(x.score || 0)} poin</b>
                  <div className="small" style={{ color: 'var(--gold)' }}>
                    +{Number(x.goldReward || 0).toLocaleString('id-ID')} Gold
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))
      ) : (
        <div className="empty">Belum ada pemenang. Arena pertama berlangsung saat Tahun 2 dimulai atau diselenggarakan secara manual.</div>
      )}
    </div>
  );
}
