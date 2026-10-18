import React from 'react';
import { useGame } from '../context/GameContext';
import { fmtTime } from '../engine/gameEngine';

export default function DeathsPage() {
  const { state } = useGame();
  const deathRecords = state.deathRecords || [];

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>🪦 Catatan Kematian</h2>
          <p className="muted small">Kematian bersifat permanen. Karakter yang meninggal tidak ikut simulasi lagi.</p>
        </div>
      </div>

      <div className="card">
        {deathRecords.length ? (
          deathRecords.map((d, idx) => (
            <div key={idx} className="logitem">
              <time>{fmtTime(d.at)}</time>
              <b>☠ {d.characterName}</b>
              <p className="small muted">
                Lv {Number(d.level || 1)} · Usia {Number(d.age || 18)} · {d.gender || 'Gender tidak tercatat'} · {d.role || 'Adventurer'} · {d.cause || 'Penyebab tidak diketahui'}
              </p>
              {d.activeTitle ? <p className="small">Title aktif saat meninggal: ✦ {d.activeTitle} ✦</p> : null}
              {(d.titles || []).length > 0 ? <p className="small">Semua title: {(d.titles || []).join(', ')}</p> : null}
              {(d.achievements || []).length > 0 ? <p className="small">Pencapaian: {(d.achievements || []).join(', ')}</p> : <p className="small muted">Tidak ada pencapaian tercatat.</p>}
            </div>
          ))
        ) : (
          <p className="muted">Belum ada karakter yang meninggal.</p>
        )}
      </div>
    </div>
  );
}
