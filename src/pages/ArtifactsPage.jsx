import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { uid, addChronicle } from '../engine/gameEngine';

export default function ArtifactsPage() {
  const { state, setState } = useGame();
  const [selectedOwners, setSelectedOwners] = useState({});

  const artifacts = state.artifacts || [];
  const cs = (state.characters || []).filter(c => !c.retired && !c.dead);

  const handleCreate = () => {
    const name = window.prompt('Nama artefak:');
    if (!name || !name.trim()) return;
    const lore = window.prompt('Lore / asal-usul:', 'Relik kuno yang terlupakan.') || '';
    const rarity = window.prompt('Kelangkaan: Langka, Epik, atau Legendaris', 'Legendaris') || 'Langka';
    const atk = Math.max(0, Number(window.prompt('Bonus ATK', '5')) || 0);
    const def = Math.max(0, Number(window.prompt('Bonus DEF', '3')) || 0);
    const mag = Math.max(0, Number(window.prompt('Bonus MAG', '4')) || 0);

    const a = {
      id: uid(),
      name: name.trim(),
      lore,
      rarity,
      atk,
      def,
      mag,
      ownerId: null,
      history: [{ at: new Date().toISOString(), action: 'Ditempa', owner: 'Dunia' }]
    };

    setState(prev => {
      const next = structuredClone(prev);
      next.artifacts = next.artifacts || [];
      next.artifacts.push(a);
      addChronicle(next, 'Artefak unik ' + a.name + ' ditempa.', 'artifact');
      return next;
    });
  };

  const handleTransfer = (id) => {
    const newOwnerId = selectedOwners[id] || null;
    setState(prev => {
      const next = structuredClone(prev);
      const a = (next.artifacts || []).find(x => x.id === id);
      if (!a) return prev;
      if (a.ownerId === newOwnerId) return prev;

      const oldName = (next.characters || []).find(c => c.id === a.ownerId)?.name || 'Dunia';
      const nextName = (next.characters || []).find(c => c.id === newOwnerId)?.name || 'Dunia';

      a.ownerId = newOwnerId;
      a.history = a.history || [];
      a.history.unshift({
        at: new Date().toISOString(),
        action: 'Perpindahan',
        owner: nextName,
        previousOwner: oldName
      });
      a.history = a.history.slice(0, 100);
      addChronicle(next, a.name + ' berpindah dari ' + oldName + ' ke ' + nextName + '.', 'artifact');
      return next;
    });
  };

  const handleHistory = (a) => {
    const lines = (a.history || []).map(x =>
      new Date(x.at).toLocaleTimeString('id-ID') + ' — ' + x.action + ': ' + x.owner + (x.previousOwner ? ' (dari ' + x.previousOwner + ')' : '')
    );
    window.alert('Riwayat ' + a.name + '\n' + (lines.join('\n') || 'Belum ada catatan riwayat.'));
  };

  const handleDelete = (id, name) => {
    if (window.confirm('Hapus artefak ' + name + '?')) {
      setState(prev => {
        const next = structuredClone(prev);
        next.artifacts = (next.artifacts || []).filter(x => x.id !== id);
        return next;
      });
    }
  };

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>🏺 Artefak Unik</h2>
          <p className="muted small">Artefak punya lore, bonus stat, pemilik, dan riwayat kepemilikan.</p>
        </div>
        <button className="primary" onClick={handleCreate}>＋ Tempa artefak</button>
      </div>

      <div className="grid">
        {artifacts.length ? (
          artifacts.map(a => {
            const owner = cs.find(c => c.id === a.ownerId);
            const currentSelected = selectedOwners[a.id] !== undefined ? selectedOwners[a.id] : (a.ownerId || '');

            return (
              <div key={a.id} className="card">
                <h3>🏺 {a.name} <span className="pill">{a.rarity}</span></h3>
                <p className="muted small">{a.lore}</p>
                <p>ATK +{a.atk} · DEF +{a.def} · MAG +{a.mag}</p>
                <p>Pemilik: {owner ? owner.name : 'Dunia / belum dimiliki'}</p>
                <div className="row">
                  <select
                    value={currentSelected}
                    onChange={(e) => setSelectedOwners({ ...selectedOwners, [a.id]: e.target.value || null })}
                  >
                    <option value="">Tidak ada pemilik</option>
                    {cs.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <button onClick={() => handleTransfer(a.id)}>Pindahkan</button>
                  <button onClick={() => handleHistory(a)}>Riwayat</button>
                  <button className="danger" onClick={() => handleDelete(a.id, a.name)}>Hapus</button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="card empty">Belum ada artefak unik.</div>
        )}
      </div>
    </div>
  );
}
