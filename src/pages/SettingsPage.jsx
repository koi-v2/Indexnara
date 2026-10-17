import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

export default function SettingsPage() {
  const { state, setState, resetData } = useGame();
  const [cycleSeconds, setCycleSeconds] = useState(state.settings?.cycleSeconds || 8);
  const [logLimit, setLogLimit] = useState(state.settings?.logLimit || 400);

  const handleSave = () => {
    setState(prev => {
      const next = structuredClone(prev);
      next.settings = next.settings || {};
      next.settings.cycleSeconds = Math.max(3, Math.min(120, Number(cycleSeconds) || 8));
      next.settings.logLimit = Math.max(100, Math.min(5000, Number(logLimit) || 400));
      return next;
    });
    alert('Pengaturan berhasil disimpan!');
  };

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>Pengaturan dunia</h2>
          <div className="muted small">Atur ritme simulasi otomatis.</div>
        </div>
      </div>

      <div className="card">
        <div className="formgrid">
          <div className="field">
            <label>Jeda antar siklus (detik)</label>
            <input
              type="number"
              min="3"
              max="120"
              value={cycleSeconds}
              onChange={(e) => setCycleSeconds(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Batas log disimpan</label>
            <input
              type="number"
              min="100"
              max="5000"
              value={logLimit}
              onChange={(e) => setLogLimit(e.target.value)}
            />
          </div>
        </div>

        <div className="row" style={{ marginTop: '16px' }}>
          <button className="primary" onClick={handleSave}>Simpan pengaturan</button>
          <button className="danger" onClick={resetData}>Reset seluruh dunia</button>
        </div>
      </div>

      <div className="card" style={{ marginTop: '12px' }}>
        <b>Catatan penyimpanan</b>
        <p className="muted small" style={{ marginTop: '6px' }}>
          Data disimpan secara lokal pada browser/aplikasi. Gunakan Ekspor data untuk backup file JSON. Tersedia juga fitur sinkronisasi online ke cloud via tombol Supabase Sync di header.
        </p>
      </div>
    </div>
  );
}
