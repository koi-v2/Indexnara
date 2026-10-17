import {
  KEY,
  fixedPotions,
  defaultLocations,
  defaultTerritories,
  defaultFactions,
  dungeonData,
  SKILL_ARCHETYPES,
  monsterRegions,
  dungeonMonsterSets,
  towerMonsterSets,
  materialCatalog,
  gearCatalog,
  craftRecipes,
  lifeGoals
} from '../constants/gameData';

export function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export function number(v, d = 0) {
  return Math.max(0, Number(v) || d);
}

export function esc(s) {
  return String(s ?? '');
}

export function fmtTime(v) {
  if (!v) return '';
  return new Date(v).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' });
}

export function titleClass(title) {
  const t = String(title || '').toLowerCase();
  if (/emas|juara|legenda|raja|conqueror|gold/.test(t)) return 'title-gold';
  if (/naga|api|abyss|merah|titan|slayer/.test(t)) return 'title-red';
  if (/es|petir|badai|langit|frost|biru/.test(t)) return 'title-blue';
  if (/alam|daun|penjelajah|hijau|ranger/.test(t)) return 'title-green';
  return '';
}

export function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const STARTER_ROSTER_VERSION = 1;
const STARTER_CHARACTERS = [
  { name:'Akari Fujimoto', gender:'Perempuan', role:'Mage', personality:'Lembut dan teliti; suka mempelajari sihir pemulihan.', description:'Penyihir muda dari desa pegunungan yang ingin memahami sihir kuno agar bisa melindungi kampung halamannya.', atk:6, def:6, mag:14, agi:8, maxHp:85, maxMp:40 },
  { name:'Haruto Kanzaki', gender:'Laki-laki', role:'Warrior', personality:'Berani, terus terang, dan selalu menepati janji.', description:'Anak pandai besi yang berkelana untuk membuktikan bahwa keberanian lebih penting daripada nama keluarga.', atk:14, def:10, mag:4, agi:7, maxHp:115, maxMp:25 },
  { name:'Yuna Tachibana', gender:'Perempuan', role:'Healer', personality:'Penyayang dan sabar; mendahulukan keselamatan orang lain.', description:'Tabib keliling yang membawa catatan obat herbal peninggalan neneknya.', atk:5, def:8, mag:13, agi:7, maxHp:90, maxMp:38 },
  { name:'Renji Takamura', gender:'Laki-laki', role:'Assassin', personality:'Pendiam, waspada, dan menyukai rencana yang rapi.', description:'Mantan kurir malam yang memakai kelincahan untuk mencari jejak kakaknya yang hilang.', atk:12, def:6, mag:5, agi:15, maxHp:95, maxMp:27 },
  { name:'Sakura Minazuki', gender:'Perempuan', role:'Ranger', personality:'Ceria, mandiri, dan sangat menyukai alam liar.', description:'Pemanah hutan yang mengenali jejak hewan dan ingin memetakan seluruh wilayah Lumina.', atk:11, def:7, mag:6, agi:13, maxHp:100, maxMp:28 },
  { name:'Daichi Moriyama', gender:'Laki-laki', role:'Guardian', personality:'Tenang, setia, dan rela menjadi pelindung kelompok.', description:'Penjaga gerbang desa yang memulai perjalanan setelah desanya selamat dari serangan monster.', atk:8, def:15, mag:4, agi:5, maxHp:125, maxMp:24 },
  { name:'Mio Hoshikawa', gender:'Perempuan', role:'Mage', personality:'Penasaran, kreatif, dan mudah terpikat teka-teki.', description:'Peneliti bintang yang percaya bahwa pola rasi bintang menyimpan petunjuk tentang dungeon.', atk:5, def:6, mag:15, agi:9, maxHp:82, maxMp:42 },
  { name:'Kaito Shiranui', gender:'Laki-laki', role:'Warrior', personality:'Kompetitif tetapi sportif; selalu menghormati lawan.', description:'Petarung jalanan yang ingin mengikuti turnamen arena untuk mendapatkan pengakuan.', atk:15, def:8, mag:3, agi:10, maxHp:110, maxMp:22 },
  { name:'Hina Amamiya', gender:'Perempuan', role:'Healer', personality:'Optimistis, ramah, dan pandai menenangkan orang.', description:'Relawan rumah singgah yang belajar sihir penyembuhan agar dapat membantu para petualang.', atk:4, def:7, mag:14, agi:8, maxHp:88, maxMp:40 },
  { name:'Souta Kirishima', gender:'Laki-laki', role:'Ranger', personality:'Praktis, sabar, dan ahli membaca arah.', description:'Pengantar barang antarwilayah yang mengenal jalan rahasia di sekitar Tambang Tua.', atk:10, def:8, mag:5, agi:13, maxHp:98, maxMp:26 },
  { name:'Rin Kurosawa', gender:'Perempuan', role:'Assassin', personality:'Cermat, mandiri, dan jarang bertindak tanpa alasan.', description:'Penyelidik muda yang mencari bukti tentang kelompok pencuri artefak.', atk:13, def:6, mag:6, agi:14, maxHp:92, maxMp:29 },
  { name:'Takumi Arai', gender:'Laki-laki', role:'Blacksmith', personality:'Rajin, teliti, dan senang memperbaiki barang rusak.', description:'Perajin logam pemula yang mengumpulkan material langka untuk membuat senjata pertamanya.', atk:9, def:10, mag:4, agi:6, maxHp:108, maxMp:24 },
  { name:'Natsumi Hayase', gender:'Perempuan', role:'Merchant', personality:'Pandai bernegosiasi, hemat, dan jeli melihat peluang.', description:'Pedagang keliling yang bermimpi membangun jaringan toko dari kota kecil hingga ibu kota.', atk:5, def:7, mag:7, agi:10, maxHp:90, maxMp:27 },
  { name:'Shun Arakawa', gender:'Laki-laki', role:'Mage', personality:'Analitis, serius, dan gemar mencatat hasil eksperimen.', description:'Murid akademi sihir yang meninggalkan ruang kelas demi menguji teorinya di lapangan.', atk:5, def:7, mag:15, agi:7, maxHp:84, maxMp:41 },
  { name:'Ayame Sakuraba', gender:'Perempuan', role:'Warrior', personality:'Tegas, disiplin, dan menghargai latihan rutin.', description:'Pendekar dari dojo kecil yang mencari gaya bertarung baru untuk menyempurnakan tekniknya.', atk:13, def:11, mag:4, agi:8, maxHp:112, maxMp:23 },
  { name:'Itsuki Nanase', gender:'Laki-laki', role:'Healer', personality:'Rendah hati, penuh empati, dan tidak suka pertengkaran.', description:'Pengelana yang mempelajari pertolongan pertama setelah pernah diselamatkan seorang tabib.', atk:5, def:8, mag:12, agi:7, maxHp:94, maxMp:36 },
  { name:'Fuyumi Shibata', gender:'Perempuan', role:'Ranger', personality:'Berani, fokus, dan menyukai tantangan jarak jauh.', description:'Pemburu musim dingin yang ingin menemukan sumber material langka di wilayah bersalju.', atk:11, def:8, mag:6, agi:12, maxHp:99, maxMp:28 },
  { name:'Toma Ichinose', gender:'Laki-laki', role:'Guardian', personality:'Sabar, bertanggung jawab, dan selalu menjaga formasi.', description:'Mantan pengawal karavan yang ingin membangun reputasi sebagai pelindung tepercaya.', atk:8, def:14, mag:4, agi:6, maxHp:122, maxMp:24 },
  { name:'Koharu Nishimura', gender:'Perempuan', role:'Mage', personality:'Imajinatif, ceria, dan suka mencoba kombinasi sihir.', description:'Penyihir pemula yang menciptakan mantra kecil dari catatan resep dan cerita rakyat.', atk:6, def:5, mag:14, agi:9, maxHp:83, maxMp:42 },
  { name:'Riku Matsuda', gender:'Laki-laki', role:'Assassin', personality:'Lincah, humoris, dan lebih suka menghindari konflik sia-sia.', description:'Pelari pesan yang memanfaatkan kecepatannya untuk menjelajahi lorong kota dan reruntuhan.', atk:12, def:6, mag:5, agi:15, maxHp:93, maxMp:27 },
  { name:'Emi Kisaragi', gender:'Perempuan', role:'Merchant', personality:'Ramah, terorganisasi, dan selalu menghitung risiko.', description:'Pengelola kios keluarga yang ingin mengumpulkan modal untuk membuka penginapan petualang.', atk:5, def:8, mag:6, agi:9, maxHp:92, maxMp:28 },
  { name:'Akio Endo', gender:'Laki-laki', role:'Blacksmith', personality:'Gigih, sederhana, dan bangga pada hasil kerja sendiri.', description:'Murid pandai besi yang mencari bijih terbaik untuk membuat perlengkapan yang tahan lama.', atk:10, def:11, mag:3, agi:6, maxHp:110, maxMp:22 },
  { name:'Nozomi Kanzawa', gender:'Perempuan', role:'Healer', personality:'Bijaksana, telaten, dan mudah dipercaya teman baru.', description:'Penjaga klinik desa yang ingin menemukan obat bagi penyakit misterius di perbatasan.', atk:4, def:8, mag:15, agi:7, maxHp:87, maxMp:41 },
  { name:'Yuto Saionji', gender:'Laki-laki', role:'Ranger', personality:'Santai, observatif, dan menyukai perjalanan panjang.', description:'Pencatat peta yang menggambar ulang jalur aman setelah perubahan monster di hutan.', atk:10, def:8, mag:6, agi:12, maxHp:100, maxMp:28 },
  { name:'Chihiro Ogasawara', gender:'Perempuan', role:'Guardian', personality:'Berani, protektif, dan tidak mudah menyerah.', description:'Mantan penjaga kuil yang membawa perisai tua untuk melindungi orang-orang yang ditemuinya.', atk:8, def:14, mag:5, agi:6, maxHp:120, maxMp:26 },
  { name:'Masato Kuroki', gender:'Laki-laki', role:'Warrior', personality:'Bersemangat, pekerja keras, dan suka membantu pemula.', description:'Petani yang berlatih menggunakan pedang kayu dan kini ingin mencoba hidup sebagai petualang.', atk:14, def:10, mag:3, agi:7, maxHp:114, maxMp:22 },
  { name:'Suzume Hanabishi', gender:'Perempuan', role:'Assassin', personality:'Cerdik, sabar, dan senang memecahkan misteri.', description:'Penyusup berbakat yang menerima pekerjaan mencari barang hilang tanpa menyakiti warga.', atk:12, def:6, mag:7, agi:14, maxHp:91, maxMp:30 },
  { name:'Keisuke Fushimi', gender:'Laki-laki', role:'Mage', personality:'Penuh rasa ingin tahu, logis, dan teliti terhadap detail.', description:'Arsiparis muda yang menguji teori sihir melalui simbol-simbol pada reruntuhan kuno.', atk:5, def:7, mag:15, agi:8, maxHp:85, maxMp:40 },
  { name:'Madoka Tsukishima', gender:'Perempuan', role:'Ranger', personality:'Mandiri, berani, dan menghormati keseimbangan alam.', description:'Penjaga jalur hutan yang berusaha melacak monster tanpa mengganggu satwa liar.', atk:11, def:8, mag:6, agi:13, maxHp:98, maxMp:27 },
  { name:'Daiki Yokoyama', gender:'Laki-laki', role:'Warrior', personality:'Setia kawan, optimistis, dan tidak mudah patah semangat.', description:'Anak penjaga penginapan yang ingin menjadi pahlawan lokal dan membantu membangun kembali jalan dagang.', atk:13, def:10, mag:4, agi:8, maxHp:113, maxMp:24 }
];

function createStarterCharacters() {
  return STARTER_CHARACTERS.map((c, index) => ({
    id: 'starter_' + (index + 1),
    ...c,
    age: 18, level: 1, xp: 0,
    hp: c.maxHp, mp: c.maxMp,
    gold: 100, photo: '',
    aiStyle: c.role === 'Mage' ? 'tactical' : c.role === 'Healer' ? 'support' : c.role === 'Merchant' || c.role === 'Blacksmith' ? 'collector' : c.role === 'Ranger' ? 'explorer' : 'warrior',
    aiGoal: c.role === 'Merchant' || c.role === 'Blacksmith' ? 'gold' : c.role === 'Healer' ? 'helpful' : c.role === 'Ranger' ? 'exploration' : 'level up',
    inventory: [], equipment: { weapon: null, armor: null, accessory: null },
    locationId: 'town', status: 'Bebas', lastAction: 'Baru bergabung',
    created: new Date().toISOString(), skills: generateCharacterSkills()
  }));
}

export function generateCharacterSkills() {
  const keys = Object.keys(SKILL_ARCHETYPES);
  const first = pickRandom(keys);
  const second = pickRandom(keys.filter(k => k !== first));
  const themes = [first, second];
  const nodes = [];

  themes.forEach((key, ti) => {
    const t = SKILL_ARCHETYPES[key];
    const root = 'root' + ti;
    const b1 = 'b' + ti + 'a';
    const b2 = 'b' + ti + 'b';
    const la = 'l' + ti + 'a';
    const lb = 'l' + ti + 'b';
    const lc = 'l' + ti + 'c';
    const ld = 'l' + ti + 'd';

    const baseSkillNames = {
      fire: 'Flame Slash', ice: 'Frost Edge', lightning: 'Thunder Fang',
      shadow: 'Shadow Pierce', holy: 'Radiant Strike', nature: 'Thorn Lash',
      blade: 'Quick Slash', arcane: 'Arcane Bolt', guard: 'Iron Guard', agile: 'Swift Step'
    };

    nodes.push({
      id: root,
      name: baseSkillNames[key] || 'Basic Strike',
      theme: key,
      icon: t.icon,
      desc: 'Skill bawaan ' + t.name + ' yang menjadi fondasi skill tree.',
      tier: 0,
      branch: ti,
      requires: [],
      cost: 0,
      unlocked: true,
      rank: 1,
      maxRank: 3,
      kind: 'base'
    });

    [
      [b1, t.branches[0][0], 0],
      [b2, t.branches[0][1], 1]
    ].forEach(([id, name]) => {
      nodes.push({
        id,
        name,
        theme: key,
        icon: t.icon,
        desc: 'Jalur pengembangan ' + name + '.',
        tier: 1,
        branch: ti,
        requires: [root],
        cost: 1,
        unlocked: false,
        rank: 0,
        maxRank: 5,
        kind: 'branch'
      });
    });

    [
      [la, b1, t.branches[1][0]],
      [lb, b1, t.branches[1][1]],
      [lc, b2, t.branches[1][0]],
      [ld, b2, t.branches[1][1]]
    ].forEach(([id, req, name]) => {
      nodes.push({
        id,
        name,
        theme: key,
        icon: t.icon,
        desc: 'Spesialisasi lanjutan ' + name + '.',
        tier: 2,
        branch: ti,
        requires: [req],
        cost: 2,
        unlocked: false,
        rank: 0,
        maxRank: 5,
        kind: 'advanced'
      });
    });

    [
      ['u' + ti + 'a', [la, lb], t.branches[2][0]],
      ['u' + ti + 'b', [lc, ld], t.branches[2][1]]
    ].forEach(([id, req, name]) => {
      nodes.push({
        id,
        name,
        theme: key,
        icon: t.icon,
        desc: 'Kemampuan puncak ' + name + '.',
        tier: 3,
        branch: ti,
        requires: req,
        cost: 4,
        unlocked: false,
        rank: 0,
        maxRank: 3,
        kind: 'ultimate'
      });
    });
  });

  return { version: 1, seed: uid() + uid(), themes, points: 12, spent: 0, nodes, createdAt: new Date().toISOString() };
}

export function ensureCharacterSkills(c) {
  if (!c.skills || !Array.isArray(c.skills.nodes)) {
    c.skills = generateCharacterSkills();
    return;
  }
  if (!Number.isFinite(c.skills.points)) c.skills.points = 12;
  if (!Number.isFinite(c.skills.spent)) c.skills.spent = 0;
  c.skills.nodes.forEach(n => {
    if (typeof n.unlocked !== 'boolean') n.unlocked = !!n.unlocked;
    if (!Number.isFinite(n.rank)) n.rank = n.unlocked ? 1 : 0;
  });
}

export function getDefaultState() {
  return {
    characters: createStarterCharacters(),
    starterRosterVersion: STARTER_ROSTER_VERSION,
    guilds: [],
    shop: [...fixedPotions],
    logs: [],
    chronicle: [],
    relationships: [],
    quests: [],
    events: [],
    locations: [...defaultLocations],
    territories: [...defaultTerritories],
    factions: [...defaultFactions],
    running: false,
    settings: { cycleSeconds: 8, logLimit: 500 },
    parties: [],
    worldCalendar: { year: 1, month: 1, day: 1, progressSeconds: 0 },
    arenaHistory: [],
    deathRecords: [],
    familyEvents: [],
    dynasties: [],
    guildWars: [],
    guildApplications: [],
    worldBosses: [],
    bossHistory: [],
    rivalries: [],
    worldStories: [],
    worldNews: [],
    businesses: [],
    itemHistory: [],
    worldHistory: [],
    artifacts: [],
    crimes: [],
    punishments: [],
    tower: { records: [], history: [], settings: { autoExplore: true, partySize: 3 } },
    monsterSystems: { history: [], settings: { openWorldDrops: true, dungeonDrops: true, towerDrops: true } },
    legacy: { retired: [], lineages: [], mentors: [] },
    town: { level: 1, prosperity: 50, visitors: 0, events: [], market: {} }
  };
}

export function loadInitialState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.characters)) {
        const d = getDefaultState();
        return {
          ...d,
          ...parsed,
          ...(!parsed.starterRosterVersion ? {
            characters: [...parsed.characters, ...createStarterCharacters().filter(s => !parsed.characters.some(c => c.id === s.id))],
            starterRosterVersion: STARTER_ROSTER_VERSION
          } : {}),
          running: false,
          shop: [...fixedPotions, ...(parsed.shop || []).filter(i => !['hp_potion', 'mp_potion'].includes(i.id))],
          locations: (Array.isArray(parsed.locations) && parsed.locations.length) ? parsed.locations : d.locations,
          territories: (Array.isArray(parsed.territories) && parsed.territories.length) ? parsed.territories : d.territories,
          factions: (Array.isArray(parsed.factions) && parsed.factions.length) ? parsed.factions : d.factions,
          worldCalendar: { year: 1, month: 1, day: 1, progressSeconds: 0, ...(parsed.worldCalendar || {}) },
          settings: { ...d.settings, ...(parsed.settings || {}) }
        };
      }
    }
  } catch (err) {
    console.error('Failed to load state from localStorage:', err);
  }
  return getDefaultState();
}

export function saveStateToStorage(state) {
  try {
    state.lastSavedAt = Date.now();
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Error saving state:', err);
  }
}

export function worldDateText(calendar) {
  const d = calendar || { year: 1, month: 1, day: 1 };
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const m = months[Math.max(0, Math.min(11, d.month - 1))] || 'Januari';
  return `Tahun ${d.year} · ${m} ${d.day}`;
}

export function addLog(state, text, kind = 'info', charId = null) {
  state.logs.unshift({
    id: uid(),
    at: new Date().toISOString(),
    text,
    kind,
    charId
  });
  state.logs = state.logs.slice(0, state.settings?.logLimit || 500);
}

export function addChronicle(state, text, kind = 'world') {
  state.chronicle.unshift({
    id: uid(),
    at: new Date().toISOString(),
    text,
    kind
  });
  state.chronicle = state.chronicle.slice(0, 300);
}

export function personalityTraits(c) {
  const p = `${c.personality || ''} ${c.aiStyle || ''} ${c.aiGoal || ''}`.toLowerCase();
  return {
    aggressive: /agresif|berani|petarung|garang|suka bertarung|warrior/.test(p),
    coward: /pengecut|penakut|hati-hati|menghindari risiko|pemalu|cautious/.test(p),
    greedy: /serakah|kaya|gold|emas|harta|pedagang|collector/.test(p),
    smart: /cerdas|strategis|pintar|analitis|bijak|tactical/.test(p),
    helpful: /penolong|baik hati|membantu|setia|support/.test(p),
    ambitious: /ambisius|kuat|terkuat|kompetitif|level up/.test(p),
    explorer: /explorer|explore|penjelajah|eksplorasi|material/.test(p)
  };
}

export function reputationLabel(n) {
  if (n >= 75) return 'Legenda Dunia';
  if (n >= 45) return 'Pahlawan Terkenal';
  if (n >= 20) return 'Dikenal Banyak Orang';
  if (n >= 5) return 'Mulai Dikenal';
  if (n <= -40) return 'Buronan';
  if (n <= -15) return 'Nama Buruk';
  if (n < 0) return 'Dipandang Curiga';
  return 'Orang Biasa';
}

export function titlePerk(title) {
  const t = String(title || '').toLowerCase();
  if (/raja|kaya|jutawan|gold/.test(t)) return { label: 'Naluri Dagang', desc: '+5% peluang memperoleh gold' };
  if (/pembantai|warrior|naga|dark|shadow/.test(t)) return { label: 'Aura Tempur', desc: '+2 ATK saat berburu' };
  if (/penjelajah|explorer|laut|langit/.test(t)) return { label: 'Insting Penjelajah', desc: '+5% peluang menemukan material' };
  if (/guild|setia|guardian|penolong|healer/.test(t)) return { label: 'Semangat Pelindung', desc: '+2 DEF saat membantu sekutu' };
  return { label: 'Tekad Istimewa', desc: '+1 ATK dan +1 DEF' };
}

export function isImprisoned(state, c) {
  const p = (state.punishments || []).find(p => p.active && p.characterId === c?.id);
  return !!p && /penjara|dipenjara|kurungan/i.test(String(p.type || ''));
}

export function isActivityBanned(state, c) {
  const p = (state.punishments || []).find(p => p.active && p.characterId === c?.id);
  return !!p && /larangan aktivitas|larangan aktiv/i.test(String(p.type || ''));
}

export function isCharacterRestricted(state, c) {
  return isImprisoned(state, c) || isActivityBanned(state, c);
}

export function gainXp(state, c, xp) {
  const before = c.level;
  c.xp = (Number(c.xp) || 0) + xp;
  let need = c.level * 100;
  while (c.xp >= need && c.level < 999) {
    c.xp -= need;
    c.level++;
    c.maxHp = (Number(c.maxHp) || 100) + 10;
    c.maxMp = (Number(c.maxMp) || 30) + 3;
    c.atk = (Number(c.atk) || 5) + 2;
    c.def = (Number(c.def) || 3) + 1;
    c.hp = c.maxHp;
    c.mp = c.maxMp;
    addLog(state, `${c.name} naik ke level ${c.level}! Stat meningkat.`, 'level', c.id);
    addChronicle(state, `${c.name} mencapai Level ${c.level}.`, 'level');
    progressQuests(state, c, 'level');
    need = c.level * 100;
  }
  if (c.level > before && c.guildId) {
    const g = state.guilds.find(x => x.id === c.guildId);
    if (g) {
      g.xp = (Number(g.xp) || 0) + (c.level - before) * 20;
      guildLevel(state, g);
    }
  }
}

export function guildLevel(state, g) {
  g.xp = Math.max(0, Number(g.xp) || 0);
  g.level = Math.max(1, Number(g.level) || 1);
  while (g.level < 100 && g.xp >= g.level * 100) {
    g.xp -= g.level * 100;
    g.level++;
    addLog(state, `Guild ${g.name} naik ke level ${g.level}!`, 'guild');
    addChronicle(state, `Guild ${g.name} mencapai level ${g.level}.`, 'guild');
  }
  return g.level;
}

export function guildContribute(state, c, xp = 0, gold = 0, type = 'any') {
  const g = c?.guildId ? state.guilds.find(x => x.id === c.guildId) : null;
  if (!g) return;
  g.xp = (Number(g.xp) || 0) + Math.max(0, Math.floor(xp));
  g.treasury = (Number(g.treasury) || 0) + Math.max(0, Math.floor(gold));
  const m = g.mission;
  if (m && m.status === 'Aktif' && (m.type === 'any' || m.type === type)) {
    m.progress = Math.min(m.target, (m.progress || 0) + 1);
    if (m.progress >= m.target) {
      m.status = 'Selesai';
      const members = state.characters.filter(x => x.guildId === g.id);
      g.treasury += (m.rewardGold || 0);
      members.forEach(x => {
        x.gold = (Number(x.gold) || 0) + (m.rewardGold || 0);
        gainXp(state, x, m.rewardXp || 0);
      });
      addLog(state, `Guild ${g.name} menyelesaikan misi ${m.name}.`, 'guild');
      addChronicle(state, `Guild ${g.name} menyelesaikan misi ${m.name}.`, 'guild');
    }
  }
  guildLevel(state, g);
}

export function progressQuests(state, c, type) {
  state.quests.filter(q => q.status === 'Aktif' && (q.assigned || []).includes(c.id) && q.targetType === type).forEach(q => {
    q.progress = Math.min(q.target, (q.progress || 0) + 1);
    if (q.progress >= q.target) {
      q.status = 'Selesai';
      c.gold = (Number(c.gold) || 0) + (q.rewardGold || 0);
      gainXp(state, c, q.rewardXp || 0);
      addLog(state, `${c.name} menyelesaikan quest "${q.name}"!`, 'quest', c.id);
      addChronicle(state, `${c.name} menyelesaikan quest ${q.name}.`, 'quest');
    }
  });
}

export function checkAchievements(c) {
  c.achievements = Array.isArray(c.achievements) ? c.achievements : [];
  c.titles = Array.isArray(c.titles) ? c.titles : [];
  c.achievementsStats = c.achievementsStats || {};

  const defs = [
    { id: 'first_dungeon', name: 'Penakluk Pertama', title: 'Dungeon Conqueror', test: c => (c.achievementsStats?.wins || 0) >= 1 },
    { id: 'level10', name: 'Petualang Veteran', title: 'Veteran', test: c => c.level >= 10 },
    { id: 'rich', name: 'Kantong Tebal', title: 'Treasure Hunter', test: c => c.gold >= 1000 },
    { id: 'explorer', name: 'Penjelajah', title: 'Pathfinder', test: c => (c.achievementsStats?.explores || 0) >= 10 },
    { id: 'guild', name: 'Anggota Setia', title: 'Guild Veteran', test: c => !!c.guildId && (c.achievementsStats?.guild || 0) >= 5 }
  ];

  defs.forEach(d => {
    if (!c.achievements.includes(d.id) && d.test(c)) {
      c.achievements.push(d.id);
      if (!c.titles.includes(d.title)) c.titles.push(d.title);
      if (!c.activeTitle) c.activeTitle = d.title;
    }
  });
}

export function resolveFatality(state, c, context, baseChance) {
  if (!c || c.dead || c.retired) return false;
  const chance = Math.max(0, Math.min(0.25, Number(baseChance) || 0));
  if (Math.random() >= chance) return false;
  c.dead = true;
  c.retired = true;
  c.status = 'Meninggal';
  c.hp = 0;
  c.deathAt = new Date().toISOString();
  c.deathCause = context;
  state.deathRecords = Array.isArray(state.deathRecords) ? state.deathRecords : [];
  state.deathRecords.unshift({
    id: uid(),
    characterId: c.id,
    characterName: c.name,
    at: c.deathAt,
    cause: context,
    level: c.level || 1,
    age: c.age || 18
  });
  state.deathRecords = state.deathRecords.slice(0, 300);
  addLog(state, `☠ ${c.name} meninggal saat ${context}. Petualangannya berakhir.`, 'death', c.id);
  addChronicle(state, `${c.name} meninggal saat ${context}. Namanya tercatat dalam sejarah dunia.`, 'death');
  return true;
}

export function runAnnualArena(state) {
  const eligible = state.characters.filter(c => !c.retired && !c.dead);
  if (eligible.length < 2) {
    addChronicle(state, `Kompetisi arena tahun ${state.worldCalendar.year} dibatalkan: dibutuhkan minimal 2 karakter.`, 'arena');
    return;
  }
  const ranked = eligible.map(c => ({
    c,
    score: (Number(c.level) || 1) * 5 + (Number(c.atk) || 0) * 1.4 + (Number(c.def) || 0) * 0.9 + (Number(c.mag) || 0) * 1.2 + (Number(c.agi) || 0) * 0.7 + Math.random() * 35
  })).sort((a, b) => b.score - a.score);

  const prizes = [
    { place: 1, gold: 1000, title: 'Juara Arena Tahunan', icon: '🥇' },
    { place: 2, gold: 600, title: 'Runner-up Arena', icon: '🥈' },
    { place: 3, gold: 300, title: 'Peringkat Ketiga Arena', icon: '🥉' }
  ];

  const top3 = ranked.slice(0, 3).map((x, i) => {
    const prize = prizes[i];
    const c = x.c;
    c.gold = (Number(c.gold) || 0) + prize.gold;
    c.titles = Array.isArray(c.titles) ? c.titles : [];
    if (!c.titles.includes(prize.title)) c.titles.push(prize.title);
    c.activeTitle = c.activeTitle || prize.title;
    return {
      id: c.id,
      name: c.name,
      level: c.level,
      score: Math.round(x.score),
      place: i + 1,
      goldReward: prize.gold,
      title: prize.title
    };
  });

  const winner = ranked[0].c;
  gainXp(state, winner, 250);
  const event = {
    year: state.worldCalendar.year,
    winnerId: winner.id,
    winnerName: winner.name,
    participants: eligible.length,
    at: worldDateText(state.worldCalendar),
    top3
  };
  state.arenaHistory = Array.isArray(state.arenaHistory) ? state.arenaHistory : [];
  state.arenaHistory.unshift(event);
  state.arenaHistory = state.arenaHistory.slice(0, 100);

  addLog(state, `Arena Tahunan Tahun ${event.year}: ` + top3.map((x, i) => `${i + 1}. ${x.name} (+${x.goldReward} gold, title ${x.title})`).join('; ') + '. Juara 1 juga mendapat 250 EXP.', 'arena', winner.id);
  addChronicle(state, `Arena Tahunan Tahun ${event.year} dimenangkan oleh ${winner.name} dari ${eligible.length} peserta.`, 'arena');
}

export function advanceWorldCalendar(state) {
  const cal = state.worldCalendar || (state.worldCalendar = { year: 1, month: 1, day: 1, progressSeconds: 0 });
  cal.progressSeconds = (Number(cal.progressSeconds) || 0) + Math.max(3, Number(state.settings?.cycleSeconds) || 8);
  if (cal.progressSeconds < 600) return;
  cal.progressSeconds -= 600;
  cal.day++;
  if (cal.day > 30) {
    cal.day = 1;
    cal.month++;
  }
  if (cal.month > 12) {
    cal.month = 1;
    cal.year++;
    state.characters.forEach(c => {
      c.age = Math.max(0, Number(c.age) || 18) + 1;
    });
    addChronicle(state, `Tahun ${cal.year} dimulai. Semua karakter bertambah usia satu tahun.`, 'calendar');
    runAnnualArena(state);
  }
}
