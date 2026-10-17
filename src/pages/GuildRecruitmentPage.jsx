import React from 'react';
import { useGame } from '../context/GameContext';
import { fmtTime } from '../engine/gameEngine';

export default function GuildRecruitmentPage() {
  const { state, setState } = useGame();
  const guilds = state.guilds || [];
  const applications = state.guildApplications || [];

  const updateRecruitment = (guildId, field, value) => {
    setState(prev => {
      const next = structuredClone(prev);
      const g = next.guilds.find(x => x.id === guildId);
      if (g) {
        g.recruitment = g.recruitment || { enabled: true, minLevel: 1, maxMembers: 20, style: 'balanced' };
        g.recruitment[field] = value;
      }
      return next;
    });
  };

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>📨 Rekrutmen AI Guild</h2>
          <div className="muted small">Atur kriteria rekrutmen otomatis dan pantau pelamar dari para karakter.</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '14px' }}>
        <h3>⚙️ Kebijakan Rekrutmen Otomatis</h3>
        <p className="muted small">
          Saat simulasi berjalan, guild yang mengaktifkan rekrutmen akan menyeleksi karakter bebas berdasarkan kepribadian, gaya AI, dan level minimum.
        </p>

        {guilds.length ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {guilds.map(g => {
              const rec = g.recruitment || { enabled: true, minLevel: 1, maxMembers: 20, style: 'balanced' };
              const currentMembers = (state.characters || []).filter(c => c.guildId === g.id).length;

              return (
                <div key={g.id} className="card" style={{ background: 'var(--panel2)' }}>
                  <div className="row" style={{ justifyContent: 'space-between' }}>
                    <b>⚑ {g.name}</b>
                    <span className="pill">{currentMembers}/{rec.maxMembers} Anggota</span>
                  </div>

                  <div className="formgrid" style={{ marginTop: '10px' }}>
                    <div className="field">
                      <label className="check">
                        <input
                          type="checkbox"
                          checked={rec.enabled}
                          onChange={(e) => updateRecruitment(g.id, 'enabled', e.target.checked)}
                        />
                        Aktifkan Rekrutmen Otomatis
                      </label>
                    </div>
                    <div className="field">
                      <label>Gaya Rekrutmen</label>
                      <select
                        value={rec.style}
                        onChange={(e) => updateRecruitment(g.id, 'style', e.target.value)}
                      >
                        <option value="balanced">Seimbang (Semua petualang)</option>
                        <option value="elite">Elite (Level & kekuatan tinggi)</option>
                        <option value="friendly">Ramah (Karakter penolong & setia)</option>
                        <option value="ambitious">Ambisius (Petarung & pejuang perang)</option>
                      </select>
                    </div>
                    <div className="field">
                      <label>Level Minimum</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={rec.minLevel}
                        onChange={(e) => updateRecruitment(g.id, 'minLevel', Number(e.target.value))}
                      />
                    </div>
                    <div className="field">
                      <label>Kapasitas Maksimal</label>
                      <input
                        type="number"
                        min="2"
                        max="100"
                        value={rec.maxMembers}
                        onChange={(e) => updateRecruitment(g.id, 'maxMembers', Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="muted">Belum ada guild untuk dikonfigurasi.</p>
        )}
      </div>

      <div className="card">
        <h3>📜 Riwayat Rekrutmen & Penerimaan</h3>
        {applications.length ? (
          <div className="log" style={{ maxHeight: '350px' }}>
            {applications.map((app, idx) => (
              <div key={idx} className="logitem">
                <time>{fmtTime(app.at)} · {app.kind === 'recruit' ? 'Rekrutmen Guild' : 'Pilihan Mandiri'}</time>
                <b>{app.characterName}</b> bergabung ke <b>{app.guildName}</b>
                <div className="muted small">{app.reason}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted">Belum ada catatan rekrutmen. Jalankan simulasi untuk memulai seleksi.</p>
        )}
      </div>
    </div>
  );
}
