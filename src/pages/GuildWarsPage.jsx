import React from 'react';
import { useGame } from '../context/GameContext';
import { ensureDynastySystems } from '../engine/worldSystems';
import { fmtTime } from '../engine/gameEngine';

export default function GuildWarsPage() {
  const { state } = useGame();
  ensureDynastySystems(state);

  const guilds = state.guilds || [];
  const wars = state.guildWars || [];
  const activeGuilds = guilds.filter(g => (state.characters || []).some(c => c.guildId === g.id && !c.retired));

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>⚔ Simulasi Konflik Antar-Guild</h2>
          <div className="muted small">Saat simulasi aktif, guild dengan anggota aktif dapat bentrok otomatis memperebutkan pengaruh dan kas.</div>
        </div>
      </div>

      <div className="stats" style={{ marginBottom: '14px' }}>
        <div className="statbox">
          <b>{guilds.length}</b>
          <small>Total Guild</small>
        </div>
        <div className="statbox">
          <b>{activeGuilds.length}</b>
          <small>Guild Beranggota Aktif</small>
        </div>
        <div className="statbox">
          <b>{wars.length}</b>
          <small>Catatan Konflik</small>
        </div>
      </div>

      <div className="card">
        <h3>📜 Riwayat Peperangan & Bentrokan Guild</h3>
        {wars.length ? (
          <div className="log" style={{ maxHeight: '350px' }}>
            {wars.map((w, i) => (
              <div key={i} className="logitem">
                <time>{fmtTime(w.at)} · Tahun {w.year} / Bulan {w.month}</time>
                <b>{w.winner}</b> mengalahkan <b>{w.loser}</b>
                <div className="muted small">
                  Kekuatan tercatat: {w.powerA} vs {w.powerB} · Rampasan: +{w.reward} gold
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted">Belum ada konflik guild terjadi. Butuh minimal dua guild beranggotakan petualang aktif.</p>
        )}
      </div>
    </div>
  );
}
