import React from 'react';
import { useGame } from '../context/GameContext';
import { towerEnsure, towerArea, towerAttempt } from '../engine/worldSystems';
import { fmtTime } from '../engine/gameEngine';

export default function TowerPage() {
  const { state, setState } = useGame();
  towerEnsure(state);

  const tower = state.tower || { records: [], history: [], settings: { autoExplore: true } };
  const characters = (state.characters || []).filter(c => !c.retired && !c.dead);
  const rows = characters.map(c => ({ c, p: c.towerProgress || {} })).sort((a, b) => (b.p.bestFloor || 0) - (a.p.bestFloor || 0));
  const topConquerors = rows.slice(0, 10);
  const history = (tower.history || []).slice(0, 25);

  const toggleAuto = (enabled) => {
    setState(prev => {
      const next = structuredClone(prev);
      towerEnsure(next);
      next.tower.settings.autoExplore = enabled;
      return next;
    });
  };

  const handleSendChar = (charId) => {
    setState(prev => {
      const next = structuredClone(prev);
      const c = next.characters.find(x => x.id === charId);
      if (c) {
        const res = towerAttempt(next, c, true);
        alert(res.message);
      }
      return next;
    });
  };

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>🏰 Tower of Eternity</h2>
          <div className="muted small">100 lantai, 10 wilayah, boss tiap 10 lantai, hadiah dan progres tersimpan.</div>
        </div>
        <label className="pill" style={{ cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={tower.settings?.autoExplore !== false}
            onChange={(e) => toggleAuto(e.target.checked)}
            style={{ marginRight: '6px' }}
          />
          Ekspedisi AI Otomatis
        </label>
      </div>

      <div className="stats" style={{ marginBottom: '14px' }}>
        <div className="statbox">
          <b>{tower.records?.length || 0}</b>
          <small>Penakluk Lantai 100</small>
        </div>
        <div className="statbox">
          <b>{tower.history?.length || 0}</b>
          <small>Percobaan Tercatat</small>
        </div>
        <div className="statbox">
          <b>{rows.filter(x => (x.p.attempts || 0) > 0).length}</b>
          <small>Karakter Ikut Tower</small>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '14px' }}>
        <h3>⚔ Kirim Karakter ke Tower</h3>
        <p className="muted small">
          Pilih karakter untuk mencoba lantai berikutnya. Menang memberi gold, EXP, dan peluang loot; kalah membuat karakter mundur dengan HP rendah.
        </p>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--line)' }}>
                <th style={{ padding: '8px' }}>Karakter</th>
                <th style={{ padding: '8px' }}>Level</th>
                <th style={{ padding: '8px' }}>Lantai Berikutnya</th>
                <th style={{ padding: '8px' }}>Rekor</th>
                <th style={{ padding: '8px' }}>Menang/Kalah</th>
                <th style={{ padding: '8px' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ c, p }) => (
                <tr key={c.id} style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '8px' }}><b>{c.name}</b></td>
                  <td style={{ padding: '8px' }}>{c.level}</td>
                  <td style={{ padding: '8px' }}>{(p.floor || 0) >= 100 ? '100 · Selesai' : `${(p.floor || 0) + 1} / 100`}</td>
                  <td style={{ padding: '8px' }}>{p.bestFloor || 0}</td>
                  <td style={{ padding: '8px' }}>{p.wins || 0} / {p.losses || 0}</td>
                  <td style={{ padding: '8px' }}>
                    <button
                      className="primary"
                      disabled={(p.floor || 0) >= 100}
                      onClick={() => handleSendChar(c.id)}
                    >
                      Kirim
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '14px' }}>
        <h3>🏆 Hall of Tower</h3>
        {topConquerors.length ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--line)' }}>
                  <th style={{ padding: '8px' }}>#</th>
                  <th style={{ padding: '8px' }}>Karakter</th>
                  <th style={{ padding: '8px' }}>Rekor Tertinggi</th>
                  <th style={{ padding: '8px' }}>Boss Ditaklukkan</th>
                </tr>
              </thead>
              <tbody>
                {topConquerors.map(({ c, p }, i) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--line)' }}>
                    <td style={{ padding: '8px' }}>{i + 1}</td>
                    <td style={{ padding: '8px' }}><b>{c.name}</b></td>
                    <td style={{ padding: '8px' }}>{p.bestFloor || 0} / 100</td>
                    <td style={{ padding: '8px' }}>{(p.clearedBosses || []).length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="muted">Belum ada catatan peserta.</p>
        )}
      </div>

      <div className="card" style={{ marginBottom: '14px' }}>
        <h3>🗺 Peta 100 Lantai</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(95px, 1fr))', gap: '6px', maxHeight: '300px', overflowY: 'auto' }}>
          {Array.from({ length: 100 }, (_, i) => {
            const f = i + 1;
            const isBoss = f % 10 === 0 || f === 100;
            return (
              <div key={f} className="card" style={{ padding: '8px', textAlign: 'center', background: isBoss ? 'var(--panel2)' : 'var(--panel)' }}>
                <div style={{ fontSize: '16px', fontWeight: '800', color: isBoss ? 'var(--gold)' : 'var(--text)' }}>
                  {f}
                </div>
                <div className="muted small" style={{ fontSize: '10px' }}>
                  {isBoss ? '👑 BOSS' : towerArea(f)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <h3>📜 Riwayat Ekspedisi Tower</h3>
        {history.length ? (
          <div className="log" style={{ maxHeight: '250px' }}>
            {history.map((h, i) => (
              <div key={i} className="logitem">
                <time>{fmtTime(h.at)} · Lantai {h.floor}</time>
                <b>{h.characterName}</b> vs {h.enemy} — <span style={{ color: h.result === 'Menang' ? 'var(--green)' : 'var(--red)' }}>{h.result}</span>
                <div className="muted small">
                  Hadiah: {h.gold || 0} gold / {h.exp || 0} EXP {h.loot ? `· Loot: ${h.loot}` : ''}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted">Belum ada ekspedisi tercatat.</p>
        )}
      </div>
    </div>
  );
}
