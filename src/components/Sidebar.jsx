import React from 'react';
import { useGame } from '../context/GameContext';

export default function Sidebar() {
  const { currentPage, setCurrentPage } = useGame();

  const navGroups = [
    {
      title: '👥 Karakter',
      defaultOpen: true,
      items: [
        { id: 'characters', label: '♙ Daftar Karakter' },
        { id: 'battleViewer', label: '⚔️ Live Battle Viewer' },
        { id: 'skills', label: '🌳 Skill Tree' },
        { id: 'arena', label: '🏟 Arena Tahunan' }
      ]
    },
    {
      title: '🏰 Guild & Party',
      defaultOpen: false,
      items: [
        { id: 'guilds', label: '⚑ Guild' },
        { id: 'guildRecruitment', label: '📨 Rekrutmen AI' },
        { id: 'parties', label: '⚔ Party' }
      ]
    },
    {
      title: '🌍 Dunia',
      defaultOpen: false,
      items: [
        { id: 'world', label: '🗺 Peta Dunia' },
        { id: 'territories', label: '🏰 Wilayah' },
        { id: 'factions', label: '🌑 Faksi' },
        { id: 'boss', label: '🐉 World Boss' },
        { id: 'rivals', label: '⚔ Rival' },
        { id: 'dungeons', label: '⚔ Dungeon' },
        { id: 'tower', label: '🏰 Tower 1–100' },
        { id: 'materials', label: '🧪 Monster & Material' },
        { id: 'quests', label: '📜 Quest/Event' }
      ]
    },
    {
      title: '🧠 Kehidupan AI',
      defaultOpen: false,
      items: [
        { id: 'life', label: '🧠 AI Life' },
        { id: 'brain', label: '🧠 Otak AI' },
        { id: 'legacy', label: '🧬 Generasi & Warisan' },
        { id: 'dynasty', label: '👑 Dinasti' },
        { id: 'guildwars', label: '⚔ Perang Antar-Guild' },
        { id: 'renown', label: '⭐ Reputasi & Berita' },
        { id: 'stories', label: '📚 Kisah' }
      ]
    },
    {
      title: '⚙️ Lainnya',
      defaultOpen: false,
      items: [
        { id: 'business', label: '🏪 Bisnis Karakter' },
        { id: 'hall', label: '🏆 Hall of Fame' },
        { id: 'itemhistory', label: '📜 Sejarah Barang' },
        { id: 'graphs', label: '📈 Grafik Dunia' },
        { id: 'artifacts', label: '🏺 Artefak Unik' },
        { id: 'law', label: '⚖️ Hukum & Hukuman' },
        { id: 'deaths', label: '🪦 Catatan Kematian' },
        { id: 'relationships', label: '💞 Hubungan & Keluarga' },
        { id: 'equipment', label: '💎 Equipment' },
        { id: 'chronicle', label: '📖 Kronik' },
        { id: 'logs', label: '☷ Log aktivitas' },
        { id: 'settings', label: '⚙ Pengaturan' }
      ]
    }
  ];

  return (
    <nav className="nav" id="nav">
      {navGroups.map((group, idx) => {
        const containsActive = group.items.some(i => i.id === currentPage);
        return (
          <details key={idx} className="nav-group" open={group.defaultOpen || containsActive}>
            <summary>{group.title}</summary>
            {group.items.map(item => (
              <button
                key={item.id}
                className={currentPage === item.id ? 'active' : ''}
                onClick={() => setCurrentPage(item.id)}
              >
                {item.label}
              </button>
            ))}
          </details>
        );
      })}
    </nav>
  );
}
