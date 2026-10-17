import React from 'react';
import { useGame } from '../context/GameContext';
import { fmtTime } from '../engine/gameEngine';

export default function ItemHistoryPage() {
  const { state, setState } = useGame();
  const history = state.itemHistory || [];

  const handleClear = () => {
    if (window.confirm('Bersihkan seluruh sejarah barang?')) {
      setState(prev => ({
        ...prev,
        itemHistory: []
      }));
    }
  };

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>📜 Sejarah Barang & Perlengkapan</h2>
          <div className="muted small">Catatan jejak kepemilikan, transaksi jual beli bisnis, dan pemakaian perlengkapan.</div>
        </div>
        <button onClick={handleClear}>Bersihkan Riwayat</button>
      </div>

      <div className="card">
        {history.length ? (
          <div className="log" style={{ maxHeight: '480px' }}>
            {history.map((h, i) => (
              <div key={i} className="logitem">
                <time>{fmtTime(h.at)} · {h.action}</time>
                <b>{h.itemName}</b> — <span className="muted small">{h.character}</span>
                <div className="small" style={{ marginTop: '2px' }}>
                  {h.detail || 'Tidak ada catatan tambahan'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted">Belum ada riwayat transaksi barang. Transaksi toko dan pemakaian equipment akan muncul di sini.</p>
        )}
      </div>
    </div>
  );
}
