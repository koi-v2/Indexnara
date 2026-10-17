import React from 'react';
import { useGame } from '../context/GameContext';
import { gearCatalog } from '../constants/gameData';
import { addLog, addChronicle } from '../engine/gameEngine';

export default function EquipmentPage() {
  const { state, setState, openModal, closeModal } = useGame();
  const characters = (state.characters || []).filter(c => !c.retired && !c.dead);

  const buyGearPrompt = (item) => {
    if (!characters.length) {
      alert('Tambahkan karakter dulu.');
      return;
    }

    openModal({
      title: 'Beli ' + item.name,
      content: (
        <form onSubmit={(e) => {
          e.preventDefault();
          const charId = e.target.char.value;
          closeModal();
          handleBuyGear(charId, item);
        }}>
          <div className="field">
            <label>Karakter pembeli ({item.price} Gold)</label>
            <select name="char">
              {characters.map(c => (
                <option key={c.id} value={c.id}>{c.name} (Gold: {c.gold || 0})</option>
              ))}
            </select>
          </div>
          <div className="modalfoot">
            <button type="button" onClick={closeModal}>Batal</button>
            <button className="primary" type="submit">Beli</button>
          </div>
        </form>
      )
    });
  };

  const handleBuyGear = (charId, item) => {
    setState(prev => {
      const next = structuredClone(prev);
      const c = (next.characters || []).find(x => x.id === charId);
      if (!c) return prev;
      if ((c.gold || 0) < item.price) {
        alert('Gold tidak cukup.');
        return prev;
      }

      c.gold -= item.price;
      c.inventory = c.inventory || [];
      const owned = c.inventory.find(i => i.id === item.id && i.qty > 0);
      if (owned) owned.qty++;
      else c.inventory.push({ ...item, qty: 1, type: 'Equipment' });

      addLog(next, c.name + ' membeli ' + item.name + ' seharga ' + item.price + ' gold.', 'equipment', c.id);
      addChronicle(next, c.name + ' memperoleh equipment baru: ' + item.name + '.', 'equipment');
      return next;
    });
  };

  const equipGearPrompt = (c) => {
    const items = (c.inventory || []).filter(i =>
      gearCatalog.some(g => g.id === i.id) && i.qty > 0
    );

    openModal({
      title: 'Atur equipment · ' + c.name,
      content: (
        <div>
          {items.length ? (
            items.map(i => {
              const meta = gearCatalog.find(g => g.id === i.id);
              return (
                <div key={i.id} className="itemline">
                  <div>
                    <b>{i.name}</b>
                    <div className="muted small">
                      {meta?.rarity || 'Equipment'} · Slot: {meta?.slot || 'slot'} · ATK +{meta?.atk || 0} · DEF +{meta?.def || 0} · HP +{meta?.hp || 0}
                    </div>
                  </div>
                  <button onClick={() => {
                    handleEquipGear(c.id, meta);
                    closeModal();
                  }}>Pakai</button>
                </div>
              );
            })
          ) : (
            <div className="empty">Belum punya equipment di inventory. Beli dari katalog terlebih dahulu.</div>
          )}
          <div className="modalfoot">
            <button onClick={closeModal}>Tutup</button>
          </div>
        </div>
      )
    });
  };

  const handleEquipGear = (charId, gear) => {
    setState(prev => {
      const next = structuredClone(prev);
      const c = (next.characters || []).find(x => x.id === charId);
      if (!c || !gear) return prev;

      if (c.baseAtk == null) c.baseAtk = c.atk || 1;
      if (c.baseDef == null) c.baseDef = c.def || 0;
      if (c.baseMaxHp == null) c.baseMaxHp = c.maxHp || 100;

      c.equipment = c.equipment || {};
      const prevId = c.equipment[gear.slot];
      if (prevId) {
        const oldInv = c.inventory.find(i => i.id === prevId);
        if (oldInv) oldInv.qty++;
        else {
          const pg = gearCatalog.find(x => x.id === prevId);
          if (pg) c.inventory.push({ ...pg, qty: 1, type: 'Equipment' });
        }
      }

      const owned = c.inventory.find(i => i.id === gear.id);
      if (owned) {
        owned.qty--;
        if (owned.qty <= 0) {
          c.inventory = c.inventory.filter(x => x.id !== gear.id);
        }
      }

      c.equipment[gear.slot] = gear.id;

      // recalculate equipmentStats
      const stats = { atk: 0, def: 0, hp: 0 };
      Object.values(c.equipment).forEach(id => {
        const x = gearCatalog.find(y => y.id === id);
        if (x) {
          stats.atk += x.atk;
          stats.def += x.def;
          stats.hp += x.hp;
        }
      });
      c.equipmentStats = stats;
      c.atk = Math.max(1, (c.baseAtk || 1) + stats.atk);
      c.def = Math.max(0, (c.baseDef || 0) + stats.def);
      c.maxHp = Math.max(1, (c.baseMaxHp || 100) + stats.hp);
      c.hp = Math.min(c.maxHp, c.hp || 1);

      addLog(next, c.name + ' memakai ' + gear.name + '.', 'equipment', c.id);
      return next;
    });
  };

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>💎 Equipment & Relik</h2>
          <div className="muted small">Beli perlengkapan, pasang ke slot, dan tingkatkan stat karakter.</div>
        </div>
      </div>

      <div className="grid">
        <div className="card">
          <h3>🛒 Katalog</h3>
          {gearCatalog.map(g => (
            <div key={g.id} className="itemline">
              <div>
                <b>{g.name}</b> <span className="pill">{g.rarity}</span>
                <div className="muted small">{g.desc}</div>
                <div className="small">
                  Slot: {g.slot} · ATK +{g.atk} · DEF +{g.def} · HP +{g.hp} · {g.price} gold
                </div>
              </div>
              <button onClick={() => buyGearPrompt(g)}>Beli</button>
            </div>
          ))}
        </div>

        <div className="card">
          <h3>🎒 Karakter & Perlengkapan</h3>
          {characters.map(c => {
            const eq = c.equipment || {};
            const equippedStr = Object.entries(eq).map(([slot, id]) => {
              const item = gearCatalog.find(g => g.id === id);
              return `${slot}: ${item ? item.name : 'Kosong'}`;
            }).join(' · ');

            return (
              <div key={c.id} className="itemline">
                <div>
                  <b>{c.name}</b>
                  <div className="muted small">{equippedStr || 'Belum ada equipment'}</div>
                  <div className="small">ATK {c.atk} · DEF {c.def} · HP {c.hp}/{c.maxHp}</div>
                </div>
                <button onClick={() => equipGearPrompt(c)}>Atur</button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
