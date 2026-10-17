import React from 'react';
import { useGame } from '../context/GameContext';
import { ensureDynastySystems } from '../engine/worldSystems';

export default function DynastyPage() {
  const { state } = useGame();
  ensureDynastySystems(state);

  const dynasties = [...(state.dynasties || [])].sort((a, b) => (b.renown || 0) - (a.renown || 0));
  const characters = state.characters || [];
  const retired = state.legacy?.retired || [];

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>👑 Dinasti & Garis Keturunan</h2>
          <div className="muted small">Keluarga terbentuk dari karakter, penerus tercatat dalam silsilah, dan reputasi dinasti berkembang.</div>
        </div>
      </div>

      <div className="grid">
        {dynasties.length ? (
          dynasties.map((d, i) => {
            const memberList = (d.members || []).map(id =>
              characters.find(c => c.id === id) || retired.find(c => c.id === id)
            ).filter(Boolean);

            return (
              <div key={d.id} className="card">
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <h3 style={{ margin: 0 }}>👑 {d.name}</h3>
                  <span className="pill">Peringkat #{i + 1}</span>
                </div>
                <p className="muted small">Pendiri: {d.founderName || 'Tidak diketahui'}</p>

                <div className="stats" style={{ margin: '8px 0' }}>
                  <div className="statbox">
                    <b>{memberList.length}</b>
                    <small>Anggota</small>
                  </div>
                  <div className="statbox">
                    <b>{(d.renown || 0).toLocaleString('id-ID')}</b>
                    <small>Reputasi Dinasti</small>
                  </div>
                </div>

                <h4>Anggota Tercatat:</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {memberList.length ? (
                    memberList.map(m => (
                      <span key={m.id} className="pill">
                        {m.name} {m.retired ? '(Pensiun)' : `(Lv.${m.level})`}
                      </span>
                    ))
                  ) : (
                    <span className="muted small">Belum ada anggota terdaftar.</span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="empty">Dinasti akan terbentuk otomatis saat karakter dibuat atau penerus lahir.</div>
        )}
      </div>
    </div>
  );
}
