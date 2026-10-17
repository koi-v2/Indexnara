import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { businessEnsure } from '../engine/worldSystems';
import { uid, addLog, addChronicle } from '../engine/gameEngine';

export default function BusinessPage() {
  const { state, setState, openModal, closeModal } = useGame();
  businessEnsure(state);

  const businesses = state.businesses || [];
  const characters = (state.characters || []).filter(c => !c.retired && !c.dead);

  const openBusinessModal = () => {
    if (!characters.length) {
      alert('Tambahkan karakter aktif terlebih dahulu.');
      return;
    }
    openModal({
      title: 'Buka Usaha Baru',
      content: <BusinessForm />
    });
  };

  const openQuestModal = () => {
    if (!businesses.length) {
      alert('Buka usaha terlebih dahulu.');
      return;
    }
    openModal({
      title: 'Buat Quest Pengadaan Material Bisnis',
      content: <BusinessQuestForm />
    });
  };

  const toggleBusiness = (bId) => {
    setState(prev => {
      const next = structuredClone(prev);
      const b = next.businesses.find(x => x.id === bId);
      if (b) b.active = !b.active;
      return next;
    });
  };

  const upgradeBusiness = (bId) => {
    setState(prev => {
      const next = structuredClone(prev);
      const b = next.businesses.find(x => x.id === bId);
      if (!b) return prev;
      const owner = next.characters.find(c => c.id === b.ownerId);
      const cost = (b.level || 1) * 100;
      if (!owner || (owner.gold || 0) < cost) {
        alert(`Gold pemilik tidak mencukupi (butuh ${cost} gold).`);
        return prev;
      }
      owner.gold -= cost;
      b.level = (b.level || 1) + 1;
      b.cost = (b.cost || 6) + 3;
      addLog(next, `${owner.name} meningkatkan usaha ${b.name} ke Level ${b.level}.`, 'business', owner.id);
      return next;
    });
  };

  const totalProfit = businesses.reduce((acc, b) => acc + (Number(b.profit) || 0), 0);
  const totalStock = businesses.reduce((acc, b) => acc + Object.values(b.stock || {}).reduce((sum, v) => sum + (Number(v) || 0), 0), 0);

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>🏪 Bisnis & Usaha Karakter</h2>
          <div className="muted small">Toko, penginapan, bengkel, dan restoran yang dikelola karakter dengan siklus jual beli otomatis.</div>
        </div>
        <div className="row">
          <button onClick={openQuestModal}>📜 Buat Quest Bisnis</button>
          <button className="primary" onClick={openBusinessModal}>＋ Buka Usaha</button>
        </div>
      </div>

      <div className="stats" style={{ marginBottom: '14px' }}>
        <div className="statbox">
          <b>{businesses.length}</b>
          <small>Usaha Terdaftar</small>
        </div>
        <div className="statbox">
          <b>{totalProfit.toLocaleString('id-ID')} gold</b>
          <small>Total Laba</small>
        </div>
        <div className="statbox">
          <b>{totalStock}</b>
          <small>Total Stok Barang</small>
        </div>
      </div>

      <div className="grid">
        {businesses.length ? (
          businesses.map(b => {
            const owner = (state.characters || []).find(c => c.id === b.ownerId);
            const stockItems = Object.entries(b.stock || {}).filter(([_, qty]) => Number(qty) > 0);

            return (
              <div key={b.id} className="card">
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <h3 style={{ margin: 0 }}>🏪 {b.name}</h3>
                  <span className="pill">Level {b.level || 1}</span>
                </div>
                <p className="muted small">
                  Jenis: <b>{b.type}</b> · Pemilik: <b>{owner ? owner.name : 'Tidak tersedia'}</b> · Biaya/siklus: {b.cost} gold
                </p>

                <div className="itemline">
                  <span>Pendapatan Kotor:</span>
                  <b>{(b.revenue || 0).toLocaleString('id-ID')} gold</b>
                </div>
                <div className="itemline">
                  <span>Laba Bersih:</span>
                  <b style={{ color: 'var(--green)' }}>{(b.profit || 0).toLocaleString('id-ID')} gold</b>
                </div>

                <h4>📦 Stok Barang ({stockItems.length}):</h4>
                {stockItems.length ? (
                  <div style={{ maxHeight: '110px', overflowY: 'auto', marginBottom: '8px' }}>
                    {stockItems.map(([name, qty]) => {
                      const meta = b.stockMeta?.[name] || {};
                      return (
                        <div key={name} className="itemline">
                          <div>
                            <b>{name}</b>
                            <div className="muted small">Modal: {meta.cost || 0}g · Jual: {meta.sell || 0}g</div>
                          </div>
                          <span className="pill">x{qty}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="muted small">Stok kosong. Petualang akan memasok barang saat simulasi berjalan.</p>
                )}

                <div className="row" style={{ marginTop: '10px' }}>
                  <button onClick={() => upgradeBusiness(b.id)}>
                    ⬆ Upgrade ({(b.level || 1) * 100}g)
                  </button>
                  <button onClick={() => toggleBusiness(b.id)}>
                    {b.active ? '⏸ Tutup Sementara' : '▶ Buka Kembali'}
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="card empty">Belum ada bisnis dibuka. Klik "Buka Usaha" untuk mendaftarkan usaha baru.</div>
        )}
      </div>
    </div>
  );
}

function BusinessForm() {
  const { state, setState, closeModal } = useGame();
  const characters = (state.characters || []).filter(c => !c.retired && !c.dead);
  const [name, setName] = useState('');
  const [ownerId, setOwnerId] = useState(characters[0]?.id || '');
  const [type, setType] = useState('toko');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    const owner = characters.find(c => c.id === ownerId);
    if (!owner) return;

    const cost = type.includes('penginapan') ? 12 : type.includes('restoran') ? 10 : type.includes('bengkel') ? 8 : 6;

    setState(prev => {
      const next = structuredClone(prev);
      next.businesses = next.businesses || [];
      const newBiz = {
        id: uid(),
        name: name.trim(),
        type,
        ownerId,
        level: 1,
        cost,
        active: true,
        revenue: 0,
        profit: 0,
        stock: {},
        stockValue: 0,
        itemsBought: 0,
        sales: 0,
        salesProfit: 0,
        stockMeta: {}
      };
      next.businesses.push(newBiz);
      addLog(next, `${owner.name} membuka usaha ${newBiz.name}.`, 'business', owner.id);
      addChronicle(next, `Usaha baru dibuka: ${newBiz.name} milik ${owner.name}.`, 'business');
      return next;
    });
    closeModal();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="field">
        <label>Nama Usaha</label>
        <input required value={name} onChange={e => setName(e.target.value)} placeholder="Contoh: Toko Ramuan Berkah" />
      </div>
      <div className="field">
        <label>Pemilik Karakter</label>
        <select value={ownerId} onChange={e => setOwnerId(e.target.value)}>
          {characters.map(c => (
            <option key={c.id} value={c.id}>{c.name} · Gold {c.gold}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>Jenis Usaha</label>
        <select value={type} onChange={e => setType(e.target.value)}>
          <option value="toko">Toko Bahan & Potion (Biaya 6g)</option>
          <option value="bengkel">Bengkel Senjata & Armor (Biaya 8g)</option>
          <option value="restoran">Kedai & Restoran (Biaya 10g)</option>
          <option value="penginapan">Penginapan Petualang (Biaya 12g)</option>
        </select>
      </div>
      <div className="modalfoot">
        <button type="button" onClick={closeModal}>Batal</button>
        <button className="primary" type="submit">Buka Usaha</button>
      </div>
    </form>
  );
}

function BusinessQuestForm() {
  const { state, setState, closeModal } = useGame();
  const businesses = (state.businesses || []).filter(b => b.active);
  const [bizId, setBizId] = useState(businesses[0]?.id || '');
  const [material, setMaterial] = useState('Slime Gel');
  const [qty, setQty] = useState(5);
  const [reward, setReward] = useState(25);

  const handleSubmit = (e) => {
    e.preventDefault();
    const b = businesses.find(x => x.id === bizId);
    if (!b) return;
    const owner = (state.characters || []).find(c => c.id === b.ownerId);
    if ((owner?.gold || 0) < Number(reward)) {
      alert('Gold pemilik usaha tidak mencukupi untuk menjamin hadiah quest.');
      return;
    }

    setState(prev => {
      const next = structuredClone(prev);
      const targetBiz = next.businesses.find(x => x.id === bizId);
      if (targetBiz) {
        targetBiz.quests = targetBiz.quests || [];
        targetBiz.quests.push({
          id: uid(),
          material,
          qty: Number(qty),
          reward: Number(reward),
          active: true,
          createdAt: Date.now()
        });
        addLog(next, `${targetBiz.name} menerbitkan quest pengumpulan ${qty} ${material} (hadiah ${reward}g).`, 'business');
      }
      return next;
    });
    closeModal();
    alert('Quest bisnis berhasil diterbitkan!');
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="field">
        <label>Pilih Usaha</label>
        <select value={bizId} onChange={e => setBizId(e.target.value)}>
          {businesses.map(b => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>Material yang Dibutuhkan</label>
        <select value={material} onChange={e => setMaterial(e.target.value)}>
          <option value="Slime Gel">Slime Gel</option>
          <option value="Mana Essence">Mana Essence</option>
          <option value="Nature Essence">Nature Essence</option>
          <option value="Crystal">Crystal</option>
          <option value="Iron Ore">Iron Ore</option>
        </select>
      </div>
      <div className="formgrid">
        <div className="field">
          <label>Jumlah</label>
          <input type="number" min="1" max="100" value={qty} onChange={e => setQty(e.target.value)} />
        </div>
        <div className="field">
          <label>Hadiah Gold</label>
          <input type="number" min="5" value={reward} onChange={e => setReward(e.target.value)} />
        </div>
      </div>
      <div className="modalfoot">
        <button type="button" onClick={closeModal}>Batal</button>
        <button className="primary" type="submit">Terbitkan</button>
      </div>
    </form>
  );
}
