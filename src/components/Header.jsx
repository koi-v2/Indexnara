import React, { useRef } from 'react';
import { useGame } from '../context/GameContext';
import { worldDateText } from '../engine/gameEngine';

export default function Header() {
  const { state, running, toggleSim, tickOnce, exportData, importData, supabaseSync } = useGame();
  const fileInputRef = useRef(null);

  const totalGold = (state.characters || []).reduce((acc, c) => acc + (Number(c.gold) || 0), 0);
  const totalChars = (state.characters || []).length;
  const totalShopItems = (state.shop || []).length;
  const totalLogs = (state.logs || []).length;

  return (
    <header>
      <div className="top">
        <div>
          <div className="brand">
            NARA<span>APP</span> <span style={{ color: '#fff' }}>/ WORLD</span>
          </div>
          <div className="sub">Autonomous text RPG · Admin dashboard</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
          <span className="badge" style={{ color: running ? 'var(--green)' : 'var(--muted)' }}>
            {running ? '● SIMULASI AKTIF' : 'SIMULASI BERHENTI'}
          </span>
          <span className="pill">
            {worldDateText(state.worldCalendar)}
          </span>
        </div>
      </div>

      <section className="hero">
        <h1>World Control</h1>
        <p>Kamu mengatur dunia dan karakternya. Mereka mengambil keputusan serta beraktivitas sendiri saat simulasi berjalan.</p>
        <div className="stats">
          <div className="statbox">
            <b>{totalChars}</b>
            <small>Karakter</small>
          </div>
          <div className="statbox">
            <b>{totalGold.toLocaleString('id-ID')}</b>
            <small>Total gold</small>
          </div>
          <div className="statbox">
            <b>{totalShopItems}</b>
            <small>Jenis barang di shop</small>
          </div>
          <div className="statbox">
            <b>{totalLogs}</b>
            <small>Catatan aktivitas</small>
          </div>
        </div>
        <div className="row" style={{ marginTop: '14px' }}>
          <button className="primary" onClick={toggleSim}>
            {running ? '⏸ Hentikan simulasi' : '▶ Jalankan simulasi'}
          </button>
          <button onClick={tickOnce}>
            ⏩ 1 siklus
          </button>
          <button onClick={exportData}>
            Ekspor data
          </button>
          <button onClick={() => fileInputRef.current?.click()}>
            Impor data
          </button>
          <button onClick={supabaseSync}>
            ☁️ Supabase Sync
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            style={{ display: 'none' }}
            onChange={(e) => {
              if (e.target.files?.[0]) {
                importData(e.target.files[0]);
                e.target.value = '';
              }
            }}
          />
        </div>
      </section>
    </header>
  );
}
