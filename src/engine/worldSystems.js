import {
  uid,
  esc,
  personalityTraits,
  gainXp,
  resolveFatality,
  isCharacterRestricted,
  isImprisoned,
  addLog,
  addChronicle,
  titlePerk,
  reputationLabel
} from './gameEngine';
import {
  towerMonsterSets,
  materialCatalog,
  lifeGoals
} from '../constants/gameData';
import {
  awardMonsterDrops,
  awardGearDrop,
  recordItemHistory
} from './simulationCycle';

export function towerEnsure(state) {
  state.tower = state.tower && typeof state.tower === 'object'
    ? state.tower
    : { records: [], history: [], settings: { autoExplore: true, partySize: 3 } };
  state.tower.records = Array.isArray(state.tower.records) ? state.tower.records : [];
  state.tower.history = Array.isArray(state.tower.history) ? state.tower.history : [];
  state.tower.settings = state.tower.settings || { autoExplore: true, partySize: 3 };
  state.characters.forEach(c => {
    if (!c.towerProgress || typeof c.towerProgress !== 'object') {
      c.towerProgress = { floor: 0, bestFloor: 0, wins: 0, losses: 0, attempts: 0, clearedBosses: [], lastRun: null };
    }
    c.towerProgress.clearedBosses = Array.isArray(c.towerProgress.clearedBosses) ? c.towerProgress.clearedBosses : [];
  });
}

export function towerArea(f) {
  if (f <= 10) return 'Ruins of Beginning';
  if (f <= 20) return 'Forest of Shadows';
  if (f <= 30) return 'Forgotten Catacombs';
  if (f <= 40) return 'Infernal Forge';
  if (f <= 50) return 'Frozen Abyss';
  if (f <= 60) return 'Sky Ruins';
  if (f <= 70) return 'Abyssal Prison';
  if (f <= 80) return "Dragon's Nest";
  if (f <= 90) return 'Realm of Chaos';
  return 'Divine Sanctuary';
}

export function towerEnemy(f) {
  const bosses = f % 10 === 0 || f === 100;
  const names = bosses
    ? ['Penjaga Kuno', 'Raja Kegelapan', 'Naga Purba', 'Ksatria Kehampaan', 'Penguasa Menara']
    : ['Slime Menara', 'Penjelajah Terkutuk', 'Serigala Bayangan', 'Golem Penjaga', 'Prajurit Abyss'];
  return {
    name: names[(f + (bosses ? Math.floor(f / 10) : f)) % names.length],
    boss: bosses,
    level: Math.max(1, Math.ceil(f * 1.35)),
    hp: Math.floor((90 + f * 36) * (bosses ? 3.2 : 1)),
    atk: Math.floor((8 + f * 2.8) * (bosses ? 1.55 : 1)),
    def: Math.floor(3 + f * 1.2)
  };
}

export function towerReward(f, boss, won) {
  const gold = Math.floor((20 + f * 11) * (boss ? 3 : 1));
  const exp = Math.floor((15 + f * 8) * (boss ? 2.5 : 1));
  const loot = won && (boss || Math.random() < 0.18)
    ? (f >= 70 ? 'Artefak Menara' : f >= 40 ? 'Equipment Elite' : f >= 20 ? 'Material Langka' : 'Equipment Langka')
    : null;
  return { gold, exp, loot };
}

export function awardTowerDrops(state, c, floor) {
  const entry = towerMonsterSets.find(x => floor >= x.from && floor <= x.to) || towerMonsterSets[0];
  const isBoss = floor % 10 === 0;
  const chosen = isBoss ? entry.boss : entry.monsters[Math.floor(Math.random() * entry.monsters.length)];
  const material = awardMonsterDrops(state, c, { name: chosen[0], material: chosen[1], extra: floor === 100 ? 'Eternity Fragment' : 'Tower Boss Core' }, 'tower', isBoss);
  const gear = awardGearDrop(state, c, 'tower', isBoss);
  return { material, gear };
}

export function towerAttempt(state, c, manual = false) {
  towerEnsure(state);
  if (!c || c.retired || c.dead) return { ok: false, message: 'Karakter tidak tersedia.' };
  if (isCharacterRestricted(state, c)) return { ok: false, message: `${c.name} tidak bisa mengikuti Tower selama menjalani hukuman.` };
  const p = c.towerProgress;
  const floor = Math.min(100, Math.max(1, (p.floor || 0) + 1));
  const enemy = towerEnemy(floor);
  p.attempts = (p.attempts || 0) + 1;
  const power = (c.atk || 10) * 1.15 + (c.def || 5) * 0.65 + (c.level || 1) * 8 + (c.maxHp || 100) * 0.045 + (c.maxMp || 0) * 0.025;
  const threat = enemy.atk * 1.6 + enemy.def * 1.2 + enemy.level * 4 + (enemy.boss ? 30 : 0);
  const chance = Math.max(0.08, Math.min(0.94, 0.5 + (power - threat) / Math.max(100, threat * 1.5)));
  const won = Math.random() < chance;
  p.lastRun = new Date().toISOString();

  if (won) {
    p.floor = floor;
    p.bestFloor = Math.max(p.bestFloor || 0, floor);
    p.wins = (p.wins || 0) + 1;
    if (enemy.boss && !p.clearedBosses.includes(floor)) p.clearedBosses.push(floor);
    awardTowerDrops(state, c, floor);
    const r = towerReward(floor, enemy.boss, true);
    c.gold = (c.gold || 0) + r.gold;
    gainXp(state, c, r.exp);
    c.hp = Math.max(1, Math.min(c.maxHp || 100, (c.hp || 1) - Math.floor((enemy.atk * 0.35) * (enemy.boss ? 1.8 : 1))));
    if (r.loot) {
      c.inventory = Array.isArray(c.inventory) ? c.inventory : [];
      c.inventory.push({ id: uid(), name: `${r.loot} · Lantai ${floor}`, qty: 1, type: 'Equipment', rarity: floor >= 70 ? 'Legendary' : floor >= 40 ? 'Epic' : 'Rare' });
    }
    const title = floor === 100 ? 'Conqueror of Eternity' : floor % 10 === 0 ? `Penakluk Lantai ${floor}` : null;
    if (title) {
      c.titles = Array.isArray(c.titles) ? c.titles : [];
      if (!c.titles.includes(title)) c.titles.push(title);
      if (!c.activeTitle) c.activeTitle = title;
    }
    const msg = `${c.name} menaklukkan lantai ${floor} — ${enemy.name}! Hadiah ${r.gold} gold, ${r.exp} EXP${r.loot ? `, loot: ${r.loot}` : ''}.`;
    state.tower.history.unshift({
      id: uid(),
      at: new Date().toISOString(),
      characterId: c.id,
      characterName: c.name,
      floor,
      enemy: enemy.name,
      boss: enemy.boss,
      result: 'Menang',
      gold: r.gold,
      exp: r.exp,
      loot: r.loot || null
    });
    addLog(state, msg, 'tower', c.id);
    addChronicle(state, msg, 'tower');
    if (floor === 100) {
      state.tower.records.unshift({ characterId: c.id, characterName: c.name, floor: 100, at: new Date().toISOString() });
      state.tower.records = state.tower.records.slice(0, 100);
    }
    return { ok: true, message: msg };
  } else {
    p.losses = (p.losses || 0) + 1;
    c.hp = Math.max(1, Math.floor((c.maxHp || 100) * 0.25));
    if (resolveFatality(state, c, `ekspedisi Tower lantai ${floor} melawan ${enemy.name}`, enemy.boss ? 0.1 : 0.02)) {
      p.lastRunResult = 'Meninggal';
      state.tower.history.unshift({
        id: uid(),
        at: new Date().toISOString(),
        characterId: c.id,
        characterName: c.name,
        floor,
        enemy: enemy.name,
        boss: enemy.boss,
        result: 'Meninggal',
        gold: 0,
        exp: 0,
        loot: null
      });
      return { ok: false, message: `${c.name} meninggal di Tower lantai ${floor}.` };
    }
    const msg = `${c.name} gagal di lantai ${floor} (${enemy.name}), lalu mundur untuk memulihkan diri.`;
    state.tower.history.unshift({
      id: uid(),
      at: new Date().toISOString(),
      characterId: c.id,
      characterName: c.name,
      floor,
      enemy: enemy.name,
      boss: enemy.boss,
      result: 'Mundur',
      gold: 0,
      exp: 0,
      loot: null
    });
    addLog(state, msg, 'tower', c.id);
    return { ok: false, message: msg };
  }
}

export function towerAutoCycle(state) {
  towerEnsure(state);
  if (state.tower.settings.autoExplore === false || !state.characters.length || Math.random() > 0.12) return;
  const candidates = state.characters.filter(c => !c.retired && !c.dead && (c.hp || 0) > (c.maxHp || 100) * 0.55 && (c.towerProgress.floor || 0) < 100);
  if (!candidates.length) return;
  candidates.sort((a, b) => ((a.towerProgress.floor || 0) - (b.towerProgress.floor || 0)) || ((b.level || 1) - (a.level || 1)));
  const c = candidates[Math.floor(Math.random() * Math.min(candidates.length, 5))];
  towerAttempt(state, c, false);
}

// World Boss
export function worldEnsure(state) {
  state.worldBosses = Array.isArray(state.worldBosses) ? state.worldBosses : [];
  state.bossHistory = Array.isArray(state.bossHistory) ? state.bossHistory : [];
  state.rivalries = Array.isArray(state.rivalries) ? state.rivalries : [];
  state.worldStories = Array.isArray(state.worldStories) ? state.worldStories : [];
  state.factions = Array.isArray(state.factions) ? state.factions : [];
  state.territories = Array.isArray(state.territories) ? state.territories : [];
}

export function activeBoss(state) {
  worldEnsure(state);
  return state.worldBosses.find(b => b.status === 'active') || null;
}

export function summonBoss(state) {
  worldEnsure(state);
  if (activeBoss(state)) return false;
  const pool = [
    { name: 'Ancient Dragon', level: Math.max(8, ...state.characters.map(c => c.level || 1)) + 5, hp: 1800, atk: 48, reward: 500, xp: 180 },
    { name: 'Abyssal Titan', level: Math.max(12, ...state.characters.map(c => c.level || 1)) + 7, hp: 2600, atk: 62, reward: 750, xp: 240 },
    { name: 'Moon Devourer', level: Math.max(15, ...state.characters.map(c => c.level || 1)) + 8, hp: 3400, atk: 76, reward: 1000, xp: 320 }
  ];
  const p = pool[Math.floor(Math.random() * pool.length)];
  const boss = {
    id: uid(),
    ...p,
    maxHp: p.hp,
    status: 'active',
    spawnedAt: new Date().toISOString(),
    participants: {},
    turns: 0,
    expiresAt: Date.now() + 30 * 60 * 1000
  };
  state.worldBosses.unshift(boss);
  state.worldBosses = state.worldBosses.slice(0, 15);
  addLog(state, `🚨 ${boss.name} muncul! Lv ${boss.level} mengancam dunia.`, 'boss');
  addChronicle(state, `World Boss ${boss.name} muncul di dunia.`, 'boss');
  return true;
}

export function attackBoss(state, charId) {
  worldEnsure(state);
  const c = state.characters.find(x => x.id === charId);
  const b = activeBoss(state);
  if (!c || !b) return { ok: false, msg: 'Karakter atau boss tidak tersedia.' };
  if (Date.now() > b.expiresAt) {
    b.status = 'escaped';
    addLog(state, `${b.name} menghilang setelah waktu habis.`, 'boss');
    return { ok: false, msg: `${b.name} telah menghilang.` };
  }
  if ((c.hp || 0) <= 1) return { ok: false, msg: `${c.name} terlalu lelah untuk bertarung.` };

  const power = Math.max(1, (c.atk || 1) + (c.mag || 0) * 0.35 + (c.level || 1) * 2 + Math.floor(Math.random() * 12));
  const damage = Math.min(b.hp, power);
  b.hp -= damage;
  b.turns++;
  b.participants[c.id] = b.participants[c.id] || { name: c.name, damage: 0, attacks: 0 };
  b.participants[c.id].damage += damage;
  b.participants[c.id].attacks++;

  const retaliation = Math.max(1, Math.floor(b.atk * 0.25 + Math.random() * b.atk * 0.35 - (c.def || 0) * 0.3));
  c.hp = Math.max(1, (c.hp || 1) - retaliation);
  c.lastAction = 'Menyerang World Boss';

  if (b.hp <= 0) {
    b.hp = 0;
    b.status = 'defeated';
    const total = Object.values(b.participants).reduce((n, p) => n + p.damage, 0) || 1;
    Object.entries(b.participants).forEach(([id, p]) => {
      const who = state.characters.find(x => x.id === id);
      if (!who) return;
      const share = p.damage / total;
      const gold = Math.max(25, Math.floor(b.reward * share));
      who.gold = (who.gold || 0) + gold;
      gainXp(state, who, Math.max(10, Math.floor(b.xp * share)));
      if (share > 0.3) {
        who.titles = who.titles || [];
        const t = `Penakluk ${b.name}`;
        if (!who.titles.includes(t)) who.titles.push(t);
        who.activeTitle = who.activeTitle || t;
      }
    });
    addLog(state, `🏆 ${b.name} berhasil dikalahkan oleh para petualang!`, 'boss');
    addChronicle(state, `World Boss ${b.name} dikalahkan.`, 'boss');
    state.bossHistory.unshift({ name: b.name, status: 'defeated', at: new Date().toISOString(), participants: Object.values(b.participants) });
  }
  return { ok: true, msg: `${c.name} memberikan ${damage} damage ke ${b.name}.` };
}

export function bossCycle(state) {
  worldEnsure(state);
  const b = activeBoss(state);
  if (!b) return;
  if (Date.now() > b.expiresAt) {
    b.status = 'escaped';
    state.bossHistory.unshift({ name: b.name, status: 'escaped', at: new Date().toISOString(), participants: Object.values(b.participants) });
    addLog(state, `${b.name} menghilang setelah waktu habis.`, 'boss');
    return;
  }
  if (Math.random() < 0.22) {
    const candidates = state.characters.filter(c => !c.retired && (c.hp || 0) > (c.maxHp || 100) * 0.25 && !b.participants[c.id]);
    if (candidates.length) {
      const c = candidates[Math.floor(Math.random() * candidates.length)];
      const dmg = Math.max(1, (c.atk || 1) + (c.mag || 0) * 0.25 + (c.level || 1) + Math.floor(Math.random() * 8));
      b.hp = Math.max(0, b.hp - dmg);
      b.turns++;
      b.participants[c.id] = { name: c.name, damage: dmg, attacks: 1 };
      addLog(state, `${c.name} otomatis ikut menyerang ${b.name} (${dmg} damage).`, 'boss', c.id);
      if (b.hp === 0) {
        b.status = 'defeated';
        state.bossHistory.unshift({ name: b.name, status: 'defeated', at: new Date().toISOString(), participants: Object.values(b.participants) });
        addLog(state, `🏆 ${b.name} dikalahkan secara bersama-sama!`, 'boss');
      }
    }
  }
}

// Rivalries
export function relationFor(state, a, b) {
  worldEnsure(state);
  let r = state.rivalries.find(x => (x.a === a.id && x.b === b.id) || (x.a === b.id && x.b === a.id));
  if (!r) {
    r = { id: uid(), a: a.id, b: b.id, score: 0, meetings: 0, winsA: 0, winsB: 0, kind: 'Netral', updatedAt: new Date().toISOString() };
    state.rivalries.push(r);
  }
  return r;
}

export function rivalMeetings(state) {
  worldEnsure(state);
  if (state.characters.length < 2 || Math.random() > 0.4) return;
  const a = state.characters[Math.floor(Math.random() * state.characters.length)];
  const others = state.characters.filter(c => c.id !== a.id);
  if (!others.length) return;
  const b = others[Math.floor(Math.random() * others.length)];
  const r = relationFor(state, a, b);
  r.meetings++;
  r.score = Math.max(-100, Math.min(100, r.score + (Math.random() < 0.5 ? 1 : -1) * (5 + Math.floor(Math.random() * 9))));
  r.kind = r.score >= 55 ? 'Rival Abadi' : r.score >= 20 ? 'Saingan' : r.score <= -55 ? 'Musuh Bebuyutan' : r.score <= -20 ? 'Tidak Akur' : r.score <= -5 ? 'Dingin' : 'Netral';
  r.updatedAt = new Date().toISOString();
}

// Territories
export function territoryCycle(state) {
  worldEnsure(state);
  state.territories.forEach(t => {
    t.prosperity = Math.max(0, Math.min(100, (Number(t.prosperity) || 0) + (Math.random() < 0.5 ? 1 : -1)));
    if (t.ownerGuildId) {
      const g = state.guilds.find(x => x.id === t.ownerGuildId);
      if (g) g.treasury = (Number(g.treasury) || 0) + Math.max(1, Math.floor(t.prosperity / 25));
    }
  });
  if (state.guilds.length > 1 && Math.random() < 0.018) {
    const t = state.territories[Math.floor(Math.random() * state.territories.length)];
    if (t) {
      const old = t.ownerGuildId;
      const attackers = state.guilds.filter(g => g.id !== old);
      if (attackers.length) {
        const g = attackers[Math.floor(Math.random() * attackers.length)];
        const members = state.characters.filter(c => c.guildId === g.id);
        if (members.length && Math.random() < 0.25) {
          t.ownerGuildId = g.id;
          addChronicle(state, `${g.name} mengambil alih wilayah ${t.name}.`, 'territory');
        }
      }
    }
  }
}

// Factions
export function factionCycle(state) {
  worldEnsure(state);
  state.factions.forEach(f => {
    f.influence = Math.max(0, Math.min(100, (Number(f.influence) || 10) + (Math.random() < 0.4 ? 1 : -1)));
  });
}

// Business
export function businessEnsure(state) {
  state.businesses = Array.isArray(state.businesses) ? state.businesses : [];
  state.businesses.forEach(b => {
    b.stock = b.stock && typeof b.stock === 'object' ? b.stock : {};
    b.stockValue = Number(b.stockValue) || 0;
    b.itemsBought = Number(b.itemsBought) || 0;
    b.sales = Number(b.sales) || 0;
    b.salesProfit = Number(b.salesProfit) || 0;
    b.stockMeta = b.stockMeta && typeof b.stockMeta === 'object' ? b.stockMeta : {};
    b.quests = Array.isArray(b.quests) ? b.quests : [];
  });
}

export function businessCycle(state) {
  businessEnsure(state);
  state.businesses.filter(b => b.active).forEach(b => {
    const owner = state.characters.find(c => c.id === b.ownerId);
    if (!owner || owner.retired) {
      b.active = false;
      return;
    }
    if (isImprisoned(state, owner)) return;

    // customer sales
    for (const name of Object.keys(b.stock || {})) {
      const qty = Number(b.stock[name]) || 0;
      if (qty <= 0) continue;
      const meta = b.stockMeta[name] || { cost: 10, sell: 15, qty };
      const cost = Math.max(1, Number(meta.cost) || 10);
      const isPotion = name === 'HP Potion' || name === 'MP Potion';
      let price = Math.max(cost + 1, Number(meta.sell) || Math.ceil(cost * 1.5));
      meta.sell = price;
      const demand = (isPotion ? 0.65 : 0.18) + (Number(b.level) || 1) * 0.025;
      if (Math.random() < demand) {
        b.stock[name] = qty - 1;
        meta.qty = Math.max(0, (Number(meta.qty) || qty) - 1);
        owner.gold = (Number(owner.gold) || 0) + price;
        b.sales = (Number(b.sales) || 0) + price;
        b.salesProfit = (Number(b.salesProfit) || 0) + (price - cost);
        b.revenue = (Number(b.revenue) || 0) + price;
        b.profit = (Number(b.profit) || 0) + (price - cost);
        recordItemHistory(state, { name }, 'Terjual dari bisnis ' + b.name, owner, `Harga jual ${price} gold · modal ${cost} gold`);
        if (b.stock[name] <= 0) delete b.stock[name];
        if (meta.qty <= 0) delete b.stockMeta[name];
      }
    }

    // regular passive income
    const revenue = Math.floor((12 + b.level * 8 + Math.random() * 18) * Math.max(1, b.level));
    const profit = revenue - (b.cost || 6);
    if (profit > 0) owner.gold = (Number(owner.gold) || 0) + profit;
    b.revenue = (Number(b.revenue) || 0) + revenue;
    b.profit = (Number(b.profit) || 0) + Math.max(0, profit);
  });
}

// Relationships & Romance
export function ensureRelationships(state) {
  state.relationships = Array.isArray(state.relationships) ? state.relationships : [];
  state.familyEvents = Array.isArray(state.familyEvents) ? state.familyEvents : [];
  state.relationships.forEach(r => {
    r.affection = Math.max(0, Math.min(100, Number(r.affection) || 0));
    r.children = Array.isArray(r.children) ? r.children : [];
    r.status = r.status || 'Pacaran';
  });
}

export function romanceAutoCycle(state) {
  ensureRelationships(state);
  const adults = state.characters.filter(c => c && !c.retired && !c.dead && Number(c.age ?? 18) >= 18);
  const paired = new Set();
  state.relationships.filter(r => r.status !== 'Berakhir').forEach(r => {
    paired.add(r.a);
    paired.add(r.b);
  });
  const singles = adults.filter(c => !paired.has(c.id));
  if (singles.length >= 2 && Math.random() < 0.12) {
    const firstIndex = Math.floor(Math.random() * singles.length);
    const a = singles[firstIndex];
    const candidates = singles.filter(c => c.id !== a.id);
    if (candidates.length) {
      const b = candidates[Math.floor(Math.random() * candidates.length)];
      const r = {
        id: uid(),
        a: a.id,
        b: b.id,
        status: 'Pacaran',
        affection: 10 + Math.floor(Math.random() * 16),
        children: [],
        startedAt: Date.now(),
        history: [{ status: 'Pacaran', at: Date.now(), automatic: true }],
        automatic: true
      };
      state.relationships.push(r);
      state.familyEvents.push({ at: Date.now(), text: `💞 ${a.name} dan ${b.name} mulai pacaran.` });
      addLog(state, `${a.name} dan ${b.name} mulai pacaran secara otomatis.`, 'family');
      paired.add(a.id);
      paired.add(b.id);
    }
  }

  state.relationships.filter(r => r.status !== 'Berakhir' && r.automatic).forEach(r => {
    const a = state.characters.find(c => c.id === r.a);
    const b = state.characters.find(c => c.id === r.b);
    if (!a || !b || a.dead || b.dead || a.retired || b.retired) return;
    if (Math.random() < 0.32) r.affection = Math.min(100, (Number(r.affection) || 0) + 1 + Math.floor(Math.random() * 3));
    if (r.status === 'Pacaran' && r.affection >= 30 && Math.random() < 0.08) {
      r.status = 'Tunangan';
      state.familyEvents.push({ at: Date.now(), text: `💍 ${a.name} dan ${b.name} otomatis bertunangan.` });
      addLog(state, `💍 ${a.name} dan ${b.name} otomatis bertunangan.`, 'family');
    }
    if (r.status === 'Tunangan' && r.affection >= 50 && Math.random() < 0.05) {
      r.status = 'Menikah';
      r.marriedAt = Date.now();
      a.spouseId = b.id;
      b.spouseId = a.id;
      state.familyEvents.push({ at: Date.now(), text: `💒 ${a.name} dan ${b.name} resmi menikah.` });
      addLog(state, `💒 ${a.name} dan ${b.name} resmi menikah.`, 'family');
    }
  });
}

// Dynasties & Guild Wars
export function ensureDynastySystems(state) {
  state.dynasties = Array.isArray(state.dynasties) ? state.dynasties : [];
  state.guildWars = Array.isArray(state.guildWars) ? state.guildWars : [];
}

export function dynastyForCharacter(state, c) {
  ensureDynastySystems(state);
  if (c.dynastyId) {
    const found = state.dynasties.find(d => d.id === c.dynastyId);
    if (found) return found;
  }
  const name = (c.familyName || c.surname || '').trim() || ((c.name || 'Petualang').trim().split(/\s+/).slice(-1)[0] || 'Tak Bernama');
  let d = state.dynasties.find(x => x.name.toLowerCase() === name.toLowerCase());
  if (!d) {
    d = { id: uid(), name, founderId: c.id, founderName: c.name, createdAt: new Date().toISOString(), members: [], renown: 0, legacy: [] };
    state.dynasties.push(d);
  }
  if (!d.members.includes(c.id)) d.members.push(c.id);
  c.dynastyId = d.id;
  c.familyName = d.name;
  return d;
}

export function dynastyCycle(state) {
  ensureDynastySystems(state);
  state.characters.forEach(c => {
    if (c && !c.retired && !c.dead) {
      const d = dynastyForCharacter(state, c);
      d.renown = Math.max(0, (d.renown || 0) + Math.floor(Math.max(0, (c.level || 1) - 1) / 10));
    }
  });
}

export function guildWarCycle(state) {
  ensureDynastySystems(state);
  const guilds = state.guilds || [];
  if (guilds.length < 2 || Math.random() > 0.012) return;
  const a = guilds[Math.floor(Math.random() * guilds.length)];
  const b = guilds.filter(g => g.id !== a.id)[Math.floor(Math.random() * (guilds.length - 1))];
  if (!a || !b) return;
  const membersA = state.characters.filter(c => c.guildId === a.id && !c.retired);
  const membersB = state.characters.filter(c => c.guildId === b.id && !c.retired);
  if (!membersA.length || !membersB.length) return;

  const power = g => state.characters.filter(c => c.guildId === g.id && !c.retired)
    .reduce((n, c) => n + (c.level || 1) * 3 + (c.atk || 0) * 0.35 + (c.def || 0) * 0.25, 0) + (g.level || 1) * 10;
  const pa = power(a);
  const pb = power(b);
  const winner = pa === pb ? (Math.random() < 0.5 ? a : b) : (pa > pb ? a : b);
  const loser = winner.id === a.id ? b : a;
  const reward = Math.max(10, Math.floor((loser.treasury || 0) * 0.04) + 20);
  winner.treasury = (winner.treasury || 0) + reward;
  loser.treasury = Math.max(0, (loser.treasury || 0) - Math.min(reward, Math.floor((loser.treasury || 0) * 0.04)));
  winner.xp = (winner.xp || 0) + 10;

  const war = {
    id: uid(),
    at: new Date().toISOString(),
    year: state.worldCalendar?.year || 1,
    month: state.worldCalendar?.month || 1,
    attacker: a.name,
    defender: b.name,
    winner: winner.name,
    loser: loser.name,
    powerA: Math.round(pa),
    powerB: Math.round(pb),
    reward
  };
  state.guildWars.unshift(war);
  state.guildWars = state.guildWars.slice(0, 100);
  const msg = `Konflik antar-guild: ${a.name} melawan ${b.name}. ${winner.name} menang dan memperoleh ${reward} gold.`;
  addLog(state, msg, 'guild');
  addChronicle(state, msg, 'Perang Guild');
}

// AI Life
export function lifeEnsure(c) {
  if (!c.life || typeof c.life !== 'object') {
    c.life = { energy: 75, hunger: 20, mood: 70, social: 50, day: 1, friends: [], memories: [], activity: 'Menjalani hari' };
  }
  return c.life;
}

export function lifeGoalEnsure(c) {
  const l = lifeEnsure(c);
  if (!l.goal) {
    const map = { 'level up': 'hero', gold: 'rich', exploration: 'explorer', helpful: 'social', equipment: 'craft' };
    l.goal = { id: map[c.aiGoal] || lifeGoals[Math.floor(Math.random() * lifeGoals.length)].id, progress: 0, completed: false, history: [] };
  }
  return l.goal;
}

export function lifeTownEnsure(state) {
  state.town = state.town || { level: 1, prosperity: 50, visitors: 0, events: [], market: {} };
  return state.town;
}

export function lifeCycle(state, c) {
  const l = lifeEnsure(c);
  lifeGoalEnsure(c);
  l.day++;
  l.energy = Math.max(0, l.energy - (3 + Math.floor(Math.random() * 7)));
  l.hunger = Math.min(100, l.hunger + (4 + Math.floor(Math.random() * 7)));
  l.social = Math.max(0, l.social - (Math.random() < 0.35 ? 3 : 1));

  if (l.hunger > 78) {
    l.mood = Math.max(0, l.mood - 4);
    if ((c.gold || 0) >= 5 && Math.random() < 0.7) {
      c.gold -= 5;
      l.hunger = Math.max(0, l.hunger - 25);
      l.activity = 'Membeli makanan';
    }
  }
  if (l.energy < 22) {
    l.energy = Math.min(100, l.energy + 38);
    l.mood = Math.min(100, l.mood + 5);
    c.hp = Math.min(c.maxHp || 100, (c.hp || 0) + Math.ceil((c.maxHp || 100) * 0.08));
    l.activity = 'Istirahat memulihkan tenaga';
    return;
  }
  l.activity = 'Aktivitas harian';
}

// AI Brain
export function brainEnsure(c) {
  if (!c.brain || typeof c.brain !== 'object') {
    c.brain = { goal: c.aiGoal || 'balanced', confidence: 50, stress: 10, loyalty: 50, curiosity: 50, decisionCount: 0, lastDecision: 'Mulai mengenal dunia', growth: 0, values: [] };
  }
  c.brainHistory = Array.isArray(c.brainHistory) ? c.brainHistory : [];
  return c.brain;
}

export function brainAfterAction(state, c, prevAction) {
  const b = brainEnsure(c);
  b.decisionCount++;
  b.growth = Math.min(100, b.growth + 1);
  b.confidence = Math.max(10, Math.min(100, b.confidence + (Math.random() < 0.6 ? 1 : -1)));
  b.lastDecision = c.lastAction || 'Mengikuti naluri';
  c.brainHistory.unshift({ at: new Date().toISOString(), text: b.lastDecision, kind: 'decision' });
  c.brainHistory = c.brainHistory.slice(0, 40);
}

// Renown
export function renownEnsure(c) {
  if (!c) return null;
  c.reputation = Number.isFinite(Number(c.reputation)) ? Math.max(-100, Math.min(100, Number(c.reputation))) : Math.min(30, Math.max(0, (c.level || 1) - 1) * 2);
  c.renownHistory = Array.isArray(c.renownHistory) ? c.renownHistory : [];
  c.worldTitles = Array.isArray(c.worldTitles) ? c.worldTitles : [];
  return c;
}

export function updateRenownFromCharacter(state, c) {
  renownEnsure(c);
  const target = Math.min(100, Math.floor((c.level || 1) * 1.8) + ((c.gold || 0) >= 1000 ? 8 : 0) + (c.titles || []).length * 4);
  if (target > c.reputation && Math.random() < 0.12) {
    const diff = Math.min(2, target - c.reputation);
    c.reputation = Math.min(100, c.reputation + diff);
    c.renownHistory.unshift({ at: new Date().toISOString(), amount: diff, reason: 'Pencapaian diakui dunia' });
    c.renownHistory = c.renownHistory.slice(0, 20);
  }
}

// Law
export function lawCycle(state) {
  state.punishments = Array.isArray(state.punishments) ? state.punishments : [];
  state.punishments.forEach(p => {
    if (!p.active) return;
    p.cyclesLeft = Math.max(0, (Number(p.cyclesLeft) || 1) - 1);
    if (!p.cyclesLeft) {
      p.active = false;
      addChronicle(state, `Hukuman ${p.type} untuk ${p.characterName} berakhir.`, 'law');
      addLog(state, `Hukuman ${p.type} untuk ${p.characterName} berakhir; karakter kembali bebas.`, 'law', p.characterId);
    }
  });
}

export function autoCrimeCycle(state, c) {
  if (!c || c.retired || c.dead || isCharacterRestricted(state, c) || Math.random() > 0.012) return;
  const traits = personalityTraits(c);
  const cases = [];
  if (traits.aggressive && Math.random() < 0.55) cases.push('Penyerangan tanpa izin');
  if (traits.greedy && (c.gold || 0) > 40 && Math.random() < 0.5) cases.push('Pencurian barang atau gold');
  if (!cases.length) return;
  const reason = cases[Math.floor(Math.random() * cases.length)];

  state.crimes = Array.isArray(state.crimes) ? state.crimes : [];
  if (state.crimes.some(x => x.characterId === c.id && !x.punished && x.reason === reason)) return;

  const pool = state.characters.filter(x => !x.retired && !x.dead && x.id !== c.id);
  const victim = pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
  state.crimes.unshift({
    id: uid(),
    at: new Date().toISOString(),
    characterId: c.id,
    characterName: c.name,
    reason,
    victimId: victim?.id || null,
    victimName: victim?.name || 'Tidak diketahui',
    lossGold: 15,
    evidenceLevel: 'Sedang',
    status: 'Menunggu investigasi',
    punished: false
  });
  state.crimes = state.crimes.slice(0, 200);
  addLog(state, `Insiden terjadi: ${c.name} — ${reason}`, 'law', c.id);
  addChronicle(state, `Kasus baru dibuka: ${c.name} — ${reason}.`, 'law');
}

// Capture history snapshot
export function captureWorldHistory(state) {
  state.worldHistory = Array.isArray(state.worldHistory) ? state.worldHistory : [];
  const activeChars = state.characters.filter(x => !x.retired && !x.dead);
  state.worldHistory.push({
    at: new Date().toISOString(),
    cycle: (state.worldHistory.at(-1)?.cycle || 0) + 1,
    characters: activeChars.length,
    gold: activeChars.reduce((n, x) => n + (Number(x.gold) || 0), 0),
    level: activeChars.reduce((n, x) => n + (Number(x.level) || 1), 0),
    artifacts: (state.artifacts || []).length
  });
  state.worldHistory = state.worldHistory.slice(-60);
}

// Master tick cycle
export function runSimulationCycle(prevState) {
  const state = structuredClone(prevState);
  advanceWorldCalendar(state);
  romanceAutoCycle(state);
  lawCycle(state);

  if (!state.characters.length) {
    addLog(state, 'Simulasi menunggu: tambahkan karakter terlebih dahulu.', 'system');
    return state;
  }

  towerEnsure(state);
  towerAutoCycle(state);
  dynastyCycle(state);
  guildWarCycle(state);

  const activeChars = [...state.characters].filter(c => !c.retired && !c.dead).sort(() => Math.random() - 0.5);
  activeChars.forEach(c => {
    if (isCharacterRestricted(state, c)) {
      lifeCycle(state, c);
      return;
    }
    const previous = c.lastAction;
    lifeCycle(state, c);
    if (Math.random() < 0.16) openWorldEncounter(state, c);
    if (Math.random() < 0.9) aiAct(state, c);
    autoCrimeCycle(state, c);
    brainAfterAction(state, c, previous);
    updateRenownFromCharacter(state, c);
  });

  rivalMeetings(state);
  bossCycle(state);
  territoryCycle(state);
  factionCycle(state);
  businessCycle(state);
  captureWorldHistory(state);

  return state;
}
