import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { uid, generateCharacterSkills, titleClass } from '../engine/gameEngine';

export default function CharactersPage() {
  const { state, setState, openModal, closeModal, setSelectedCharId, setCurrentPage } = useGame();
  const characters = state.characters || [];

  const handleDelete = (id) => {
    const c = characters.find(x => x.id === id);
    if (!c) return;
    if (window.confirm(`Hapus karakter ${c.name}?`)) {
      setState(prev => ({
        ...prev,
        characters: prev.characters.filter(x => x.id !== id)
      }));
    }
  };

  const openBulkModal = () => {
    openModal({
      title: '⚡ Bulk Character Generator',
      content: <BulkCharForm />
    });
  };

  const openAddModal = (existing = null) => {
    openModal({
      title: existing ? `Edit Karakter: ${existing.name}` : 'Tambah Karakter Baru',
      content: <CharForm existing={existing} />
    });
  };

  const viewProfile = (c) => {
    openModal({
      title: `Profil: ${c.name}`,
      content: (
        <div style={{ maxHeight: '80vh', overflowY: 'auto' }}>
          <div className="character" style={{ marginBottom: '14px' }}>
            <div className="avatar">
              {c.photo ? <img src={c.photo} alt={c.name} /> : c.name.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <h3 style={{ margin: 0 }}>{c.name}</h3>
              {c.activeTitle ? (
                <div className={`title-badge ${titleClass(c.activeTitle)}`}>✦ {c.activeTitle} ✦</div>
              ) : (
                <div className="muted small">Belum memiliki title</div>
              )}
              <div className="muted small">Lv. {c.level} · Usia {c.age || 18} · {c.role || 'Adventurer'}</div>
            </div>
          </div>

          <div className="stats" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '14px' }}>
            <div className="statbox"><b>{c.hp}/{c.maxHp}</b><small>HP</small></div>
            <div className="statbox"><b>{c.mp}/{c.maxMp}</b><small>MP</small></div>
            <div className="statbox"><b>{c.gold}</b><small>Gold</small></div>
            <div className="statbox"><b>{c.atk}</b><small>ATK</small></div>
            <div className="statbox"><b>{c.def}</b><small>DEF</small></div>
            <div className="statbox"><b>{c.mag || 5}</b><small>MAG</small></div>
          </div>

          <p><strong>Kepribadian:</strong> {c.personality || 'Tenang dan suka bertualang.'}</p>
          <p><strong>Tujuan AI:</strong> {c.aiGoal || 'balanced'}</p>
          <p><strong>Aktivitas Terakhir:</strong> {c.lastAction || 'Baru bergabung'}</p>
          <p><strong>Status:</strong> <span className="pill">{c.status || 'Bebas'}</span></p>

          <h4>🎒 Inventaris ({(c.inventory || []).length})</h4>
          <div className="card" style={{ maxHeight: '140px', overflowY: 'auto' }}>
            {(c.inventory || []).length ? (
              c.inventory.map((item, idx) => (
                <div key={idx} className="itemline">
                  <span>{item.name} {item.equipped ? ' (Dipakai)' : ''}</span>
                  <span className="pill">x{item.qty || 1}</span>
                </div>
              ))
            ) : (
              <p className="muted small">Inventaris kosong.</p>
            )}
          </div>

          <div className="row" style={{ marginTop: '14px', justifyContent: 'flex-end' }}>
            <button className="primary" onClick={() => {
              setSelectedCharId(c.id);
              closeModal();
              setCurrentPage('skills');
            }}>
              🌳 Buka Skill Tree
            </button>
            <button onClick={closeModal}>Tutup</button>
          </div>
        </div>
      )
    });
  };

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>Karakter</h2>
          <div className="muted small">Buat karakter dan atur stat awalnya.</div>
        </div>
        <div className="row">
          <button onClick={openBulkModal}>⚡ Generate banyak</button>
          <button className="primary" onClick={() => openAddModal()}>＋ Tambah</button>
        </div>
      </div>

      {characters.length ? (
        <div className="grid">
          {characters.map(c => {
            const hpPct = Math.min(100, Math.max(0, ((c.hp || 0) / (c.maxHp || 100)) * 100));
            const mpPct = Math.min(100, Math.max(0, ((c.mp || 0) / (c.maxMp || 30)) * 100));
            return (
              <div key={c.id} className="card">
                <div className="character">
                  <div className="avatar">
                    {c.photo ? <img src={c.photo} alt={c.name} /> : c.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="charname">{c.name}</div>
                    {c.activeTitle ? (
                      <div className={`title-badge ${titleClass(c.activeTitle)}`}>✦ {c.activeTitle} ✦</div>
                    ) : (
                      <div className="muted small">Belum memiliki title</div>
                    )}
                    <div className="muted small">Lv. {c.level} · Usia {c.age || 18} · {c.role || 'Adventurer'}</div>
                    <span className="pill">Gold {c.gold}</span>
                    <span className="pill">{c.status || 'Bebas'}</span>
                  </div>
                </div>

                <div className="small muted" style={{ marginTop: '10px' }}>HP {c.hp}/{c.maxHp}</div>
                <div className="bar"><i style={{ width: `${hpPct}%` }}></i></div>
                <div className="small muted">MP {c.mp}/{c.maxMp}</div>
                <div className="bar mp"><i style={{ width: `${mpPct}%` }}></i></div>

                <div className="row" style={{ marginTop: '8px' }}>
                  <button onClick={() => viewProfile(c)}>Lihat profil</button>
                  <button onClick={() => openAddModal(c)}>Edit</button>
                  <button className="danger" onClick={() => handleDelete(c.id)}>Hapus</button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty">Belum ada karakter. Tambahkan karakter pertamamu.</div>
      )}
    </div>
  );
}

function CharForm({ existing = null }) {
  const { setState, closeModal } = useGame();
  const [name, setName] = useState(existing?.name || '');
  const [role, setRole] = useState(existing?.role || 'Warrior');
  const [level, setLevel] = useState(existing?.level || 1);
  const [hp, setHp] = useState(existing?.maxHp || 100);
  const [mp, setMp] = useState(existing?.maxMp || 30);
  const [atk, setAtk] = useState(existing?.atk || 12);
  const [def, setDef] = useState(existing?.def || 8);
  const [mag, setMag] = useState(existing?.mag || 5);
  const [gold, setGold] = useState(existing?.gold || 100);
  const [personality, setPersonality] = useState(existing?.personality || 'Berani, suka bertualang dan jujur.');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setState(prev => {
      if (existing) {
        return {
          ...prev,
          characters: prev.characters.map(c => c.id === existing.id ? {
            ...c,
            name: name.trim(),
            role,
            level: Number(level),
            maxHp: Number(hp),
            hp: Math.min(c.hp || Number(hp), Number(hp)),
            maxMp: Number(mp),
            mp: Math.min(c.mp || Number(mp), Number(mp)),
            atk: Number(atk),
            def: Number(def),
            mag: Number(mag),
            gold: Number(gold),
            personality
          } : c)
        };
      } else {
        const newChar = {
          id: uid(),
          name: name.trim(),
          role,
          age: 18,
          level: Number(level),
          maxHp: Number(hp),
          maxMp: Number(mp),
          hp: Number(hp),
          mp: Number(mp),
          atk: Number(atk),
          def: Number(def),
          mag: Number(mag),
          agi: 8,
          gold: Number(gold),
          xp: 0,
          photo: '',
          personality,
          aiStyle: 'warrior',
          aiGoal: 'level up',
          inventory: [],
          equipment: { weapon: null, armor: null, accessory: null },
          locationId: 'town',
          status: 'Bebas',
          lastAction: 'Baru bergabung',
          created: new Date().toISOString(),
          skills: generateCharacterSkills()
        };
        return {
          ...prev,
          characters: [...prev.characters, newChar]
        };
      }
    });
    closeModal();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="formgrid">
        <div className="field full">
          <label>Nama Karakter</label>
          <input required value={name} onChange={e => setName(e.target.value)} placeholder="Contoh: Kaelen Ashford" />
        </div>
        <div className="field">
          <label>Role</label>
          <select value={role} onChange={e => setRole(e.target.value)}>
            <option value="Warrior">Warrior</option>
            <option value="Mage">Mage</option>
            <option value="Assassin">Assassin</option>
            <option value="Guardian">Guardian</option>
            <option value="Healer">Healer</option>
            <option value="Ranger">Ranger</option>
            <option value="Merchant">Merchant</option>
            <option value="Blacksmith">Blacksmith</option>
          </select>
        </div>
        <div className="field">
          <label>Level</label>
          <input type="number" min="1" max="999" value={level} onChange={e => setLevel(e.target.value)} />
        </div>
        <div className="field">
          <label>Max HP</label>
          <input type="number" min="10" value={hp} onChange={e => setHp(e.target.value)} />
        </div>
        <div className="field">
          <label>Max MP</label>
          <input type="number" min="0" value={mp} onChange={e => setMp(e.target.value)} />
        </div>
        <div className="field">
          <label>ATK</label>
          <input type="number" min="1" value={atk} onChange={e => setAtk(e.target.value)} />
        </div>
        <div className="field">
          <label>DEF</label>
          <input type="number" min="0" value={def} onChange={e => setDef(e.target.value)} />
        </div>
        <div className="field">
          <label>MAG</label>
          <input type="number" min="0" value={mag} onChange={e => setMag(e.target.value)} />
        </div>
        <div className="field">
          <label>Gold Awal</label>
          <input type="number" min="0" value={gold} onChange={e => setGold(e.target.value)} />
        </div>
        <div className="field full">
          <label>Kepribadian</label>
          <input value={personality} onChange={e => setPersonality(e.target.value)} placeholder="Cth: Ramah, ambisius, suka menolong" />
        </div>
      </div>
      <div className="modalfoot">
        <button type="button" onClick={closeModal}>Batal</button>
        <button className="primary" type="submit">{existing ? 'Simpan Perubahan' : 'Buat Karakter'}</button>
      </div>
    </form>
  );
}

function BulkCharForm() {
  const { setState, closeModal } = useGame();
  const [count, setCount] = useState(30);
  const [levels, setLevels] = useState('1-5');
  const [style, setStyle] = useState('mixed');

  const handleBulk = (e) => {
    e.preventDefault();
    const firstNames = ['Akira', 'Ren', 'Yuki', 'Kael', 'Rin', 'Sora', 'Haru', 'Mika', 'Kaito', 'Aoi', 'Rei', 'Nara', 'Luna', 'Arden', 'Shiro', 'Kira', 'Noa', 'Ryo', 'Astra', 'Hana'];
    const surnames = ['Kurogane', 'Tsukino', 'Arclight', 'Veyra', 'Kazehara', 'Mizuki', 'Ashford', 'Valen', 'Hoshino', 'Draven', 'Aether', 'Mori'];
    const roles = [
      { role: 'Warrior', style: 'warrior', goal: 'level up', stat: [15, 9, 3, 7] },
      { role: 'Mage', style: 'tactical', goal: 'equipment', stat: [5, 4, 16, 7] },
      { role: 'Assassin', style: 'warrior', goal: 'level up', stat: [12, 5, 5, 16] },
      { role: 'Guardian', style: 'cautious', goal: 'helpful', stat: [7, 16, 4, 5] },
      { role: 'Healer', style: 'support', goal: 'helpful', stat: [4, 7, 13, 7] },
      { role: 'Ranger', style: 'explorer', goal: 'exploration', stat: [11, 7, 7, 13] },
      { role: 'Merchant', style: 'collector', goal: 'gold', stat: [5, 6, 8, 7] }
    ];

    const bounds = levels.split('-').map(Number);
    const minLv = bounds[0] || 1;
    const maxLv = bounds[1] || minLv;

    const newChars = [];
    for (let i = 0; i < Math.min(100, Math.max(1, count)); i++) {
      const base = roles[Math.floor(Math.random() * roles.length)];
      const name = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${surnames[Math.floor(Math.random() * surnames.length)]} ${Math.floor(Math.random() * 999)}`;
      const level = minLv + Math.floor(Math.random() * (Math.max(minLv, maxLv) - minLv + 1));
      const [atk, def, mag, agi] = base.stat;
      const maxHp = 70 + level * 12 + Math.floor(Math.random() * 30);
      const maxMp = 20 + level * 5 + Math.floor(Math.random() * 15);

      newChars.push({
        id: uid(),
        name,
        role: base.role,
        age: 18,
        level,
        maxHp,
        maxMp,
        hp: maxHp,
        mp: maxMp,
        atk: atk + Math.floor(level * 1.5),
        def: def + Math.floor(level * 1.2),
        mag: mag + Math.floor(level * 1.4),
        agi: agi + Math.floor(level * 1.1),
        gold: 50 + Math.floor(Math.random() * 250),
        xp: 0,
        photo: '',
        personality: 'Mandiri dan bersemangat menjelajah.',
        aiStyle: base.style,
        aiGoal: base.goal,
        inventory: [],
        equipment: { weapon: null, armor: null, accessory: null },
        locationId: 'town',
        status: 'Bebas',
        lastAction: 'Baru bergabung',
        created: new Date().toISOString(),
        skills: generateCharacterSkills()
      });
    }

    setState(prev => ({
      ...prev,
      characters: [...prev.characters, ...newChars]
    }));
    closeModal();
    alert(`Berhasil membuat ${newChars.length} karakter baru!`);
  };

  return (
    <form onSubmit={handleBulk}>
      <p className="muted small">Buat banyak karakter sekaligus dengan statistik dan skill tree acak.</p>
      <div className="field">
        <label>Jumlah Karakter (1–100)</label>
        <input type="number" min="1" max="100" value={count} onChange={e => setCount(Number(e.target.value))} required />
      </div>
      <div className="field">
        <label>Rentang Level Awal</label>
        <select value={levels} onChange={e => setLevels(e.target.value)}>
          <option value="1">Semua mulai Level 1</option>
          <option value="1-5">Acak Level 1–5</option>
          <option value="1-10">Acak Level 1–10</option>
          <option value="5-15">Acak Level 5–15</option>
        </select>
      </div>
      <div className="field">
        <label>Gaya Karakter</label>
        <select value={style} onChange={e => setStyle(e.target.value)}>
          <option value="mixed">Campuran semua role</option>
          <option value="adventurer">Mayoritas petualang</option>
          <option value="civilian">Mayoritas warga & pengusaha</option>
        </select>
      </div>
      <div className="modalfoot">
        <button type="button" onClick={closeModal}>Batal</button>
        <button className="primary" type="submit">Generate {count} Karakter</button>
      </div>
    </form>
  );
}
