import {
  uid,
  esc,
  personalityTraits,
  gainXp,
  checkAchievements,
  resolveFatality,
  advanceWorldCalendar,
  isCharacterRestricted,
  addLog,
  addChronicle,
  titlePerk,
  ensureCharacterSkills,
  titleClass
} from './gameEngine';
import {
  fixedPotions,
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

export function slotFor(item) {
  if (item.slot) return item.slot;
  if (item.type === 'weapon') return 'weapon';
  if (item.type === 'armor') return 'armor';
  if (item.type === 'accessory' || item.type === 'boots' || item.type === 'relic') return 'accessory';
  return null;
}

export function gearBonus(item, stat) {
  return Number(item?.[stat]) || 0;
}

export function recordItemHistory(state, item, action, character, detail = '') {
  state.itemHistory = Array.isArray(state.itemHistory) ? state.itemHistory : [];
  state.itemHistory.unshift({
    id: uid(),
    at: new Date().toISOString(),
    itemName: item?.name || 'Barang tak dikenal',
    itemId: item?.id || null,
    action,
    character: character?.name || 'Dunia',
    detail
  });
  state.itemHistory = state.itemHistory.slice(0, 500);
}

export function equipItem(state, c, item) {
  recordItemHistory(state, item, 'Dipasang', c, 'Perlengkapan karakter');
  const slot = slotFor(item);
  if (!slot) return false;
  c.equipment = c.equipment || { weapon: null, armor: null, accessory: null };
  const old = c.equipment[slot];
  if (old) {
    c.atk = Math.max(1, (c.atk || 0) - gearBonus(old, 'atk'));
    c.def = Math.max(0, (c.def || 0) - gearBonus(old, 'def'));
    c.mag = Math.max(0, (c.mag || 0) - gearBonus(old, 'mag'));
    const invOld = c.inventory.find(x => x.id === old.id);
    if (invOld) invOld.equipped = false;
  }
  c.equipment[slot] = {
    id: item.id,
    name: item.name,
    type: item.type,
    atk: item.atk || 0,
    def: item.def || 0,
    mag: item.mag || 0
  };
  item.equipped = true;
  c.atk = (c.atk || 0) + gearBonus(item, 'atk');
  c.def = (c.def || 0) + gearBonus(item, 'def');
  c.mag = (c.mag || 0) + gearBonus(item, 'mag');
  c.lastAction = 'Memakai ' + item.name;
  addLog(state, `${c.name} memasang ${item.name} pada slot ${slot}.`, 'equipment', c.id);
  return true;
}

export function buy(state, c, item) {
  recordItemHistory(state, item, 'Dibeli', c, `Harga ${item.price} gold`);
  if ((c.gold || 0) < item.price) {
    c.lastAction = 'Tidak cukup gold untuk membeli ' + item.name;
    addLog(state, `${c.name} ingin membeli ${item.name} tetapi gold tidak cukup.`, 'shop', c.id);
    return false;
  }
  c.gold -= item.price;
  c.inventory = Array.isArray(c.inventory) ? c.inventory : [];
  const existing = c.inventory.find(x => x.id === item.id);
  let owned;
  if (existing) {
    existing.qty = (existing.qty || 1) + 1;
    owned = existing;
  } else {
    owned = {
      id: item.id,
      name: item.name,
      type: item.type,
      qty: 1,
      atk: item.atk || 0,
      def: item.def || 0,
      mag: item.mag || 0,
      effect: item.effect || null,
      equipped: false
    };
    c.inventory.push(owned);
  }
  const slot = slotFor(item);
  if (slot) {
    const old = c.equipment?.[slot];
    const score = x => (x?.atk || 0) + (x?.def || 0) + (x?.mag || 0);
    if (!old || score(item) > score(old)) {
      equipItem(state, c, owned);
    }
  }
  c.lastAction = 'Membeli ' + item.name;
  addLog(state, `${c.name} membeli ${item.name} seharga ${item.price} gold.`, 'shop', c.id);
  return true;
}

export function usePotion(c, effect) {
  if (!Array.isArray(c.inventory)) return false;
  const it = c.inventory.find(x => x.effect === effect && x.qty > 0);
  if (!it) return false;
  const before = effect === 'hp' ? c.hp : c.mp;
  if (effect === 'hp') {
    c.hp = Math.min(c.maxHp || 100, (c.hp || 0) + Math.ceil((c.maxHp || 100) * 0.45));
  } else {
    c.mp = Math.min(c.maxMp || 30, (c.mp || 0) + Math.ceil((c.maxMp || 30) * 0.45));
  }
  if ((effect === 'hp' ? c.hp : c.mp) === before) return false;
  it.qty--;
  return true;
}

export function autoSkillBrain(state, c, traits) {
  ensureCharacterSkills(c);
  const sk = c.skills;
  if (!sk || !Array.isArray(sk.nodes)) return;
  const last = Number(sk.lastLevelChecked) || Number(c.level) || 1;
  if (c.level > last) {
    sk.points += Math.min(3, c.level - last);
    sk.lastLevelChecked = c.level;
  } else if (!sk.lastLevelChecked) {
    sk.lastLevelChecked = Number(c.level) || 1;
  }
  const prefs = [];
  if (traits.aggressive) prefs.push('fire', 'lightning', 'blade', 'shadow');
  if (traits.smart) prefs.push('arcane', 'ice', 'lightning');
  if (traits.coward) prefs.push('guard', 'ice', 'holy');
  if (traits.helpful) prefs.push('holy', 'nature', 'guard');
  if (traits.explorer) prefs.push('nature', 'agile', 'shadow');
  if (traits.ambitious) prefs.push('blade', 'fire', 'arcane');

  const themeScore = k => (prefs.includes(k) ? 4 : 0) +
    (k === 'guard' && c.def > c.atk ? 2 : 0) +
    (k === 'arcane' && c.mag >= c.atk ? 2 : 0) +
    (k === 'agile' && c.agi >= c.def ? 1 : 0) + Math.random() * 0.5;

  const chosen = sk.aiChosenTheme && sk.themes.includes(sk.aiChosenTheme)
    ? sk.aiChosenTheme
    : [...sk.themes].sort((a, b) => themeScore(b) - themeScore(a))[0];
  sk.aiChosenTheme = chosen;

  for (let safety = 0; safety < 4 && sk.points > 0; safety++) {
    const eligible = sk.nodes.filter(n => !n.unlocked && n.theme === chosen)
      .map(n => ({ n, req: n.requires.map(id => sk.nodes.find(x => x.id === id)) }))
      .filter(x => x.req.length && x.req.every(p => p && p.unlocked && p.rank >= p.maxRank))
      .sort((a, b) => a.n.tier - b.n.tier);

    const next = eligible.find(x => sk.points >= x.n.cost);
    const up = sk.nodes.filter(n => n.unlocked && n.rank < n.maxRank).sort((a, b) =>
      ((b.theme === chosen ? 4 : 0) + (b.tier === 0 ? 3 : 0) + (b.kind === 'branch' ? 2 : 0)) -
      ((a.theme === chosen ? 4 : 0) + (a.tier === 0 ? 3 : 0) + (a.kind === 'branch' ? 2 : 0))
    )[0];

    if (next && (!up || next.n.tier <= 1 || up.tier >= 2)) {
      sk.points -= next.n.cost;
      sk.spent += next.n.cost;
      next.n.unlocked = true;
      next.n.rank = 1;
      addLog(state, `${c.name} secara mandiri membuka ${next.n.name} di Skill Tree.`, 'skill', c.id);
      continue;
    }
    if (up && sk.points >= 1) {
      sk.points--;
      sk.spent++;
      up.rank++;
      addLog(state, `${c.name} melatih ${up.name} hingga Lv.${up.rank} secara mandiri.`, 'skill', c.id);
      continue;
    }
    if (next) {
      sk.points -= next.n.cost;
      sk.spent += next.n.cost;
      next.n.unlocked = true;
      next.n.rank = 1;
      addLog(state, `${c.name} membuka ${next.n.name} secara mandiri.`, 'skill', c.id);
      continue;
    }
    break;
  }
}

export function resolveCharacterSkillCombat(c, d) {
  ensureCharacterSkills(c);
  const nodes = c.skills.nodes.filter(n => n.unlocked);
  let attackBonus = 0;
  let defenseBonus = 0;
  let enemyPressure = 0;
  const usable = [];

  nodes.forEach(n => {
    const rank = Math.max(1, n.rank || 1);
    if (['fire', 'lightning', 'shadow', 'blade', 'arcane'].includes(n.theme)) {
      attackBonus += n.tier === 0 ? 0.035 : n.tier === 1 ? 0.025 : n.tier === 2 ? 0.035 : 0.06;
    }
    if (['ice', 'holy', 'nature', 'guard'].includes(n.theme)) {
      defenseBonus += n.tier === 0 ? 0.025 : n.tier === 1 ? 0.025 : n.tier === 2 ? 0.035 : 0.05;
    }
    if (n.tier >= 2) enemyPressure += n.tier === 2 ? 2 : 5;
    if (n.kind === 'base' || n.kind === 'ultimate' || n.tier === 2) usable.push({ ...n, rank });
  });

  attackBonus = Math.min(0.35, attackBonus);
  defenseBonus = Math.min(0.3, defenseBonus);

  if (usable.length) {
    const n = usable[Math.floor(Math.random() * usable.length)];
    const cost = n.tier === 3 ? 8 : n.tier === 2 ? 5 : 2;
    if ((c.mp || 0) >= cost) {
      c.mp -= cost;
      c.lastAction = 'Menggunakan ' + n.name + ' di ' + d.name;
    }
  }
  return { attackBonus, defenseBonus, enemyPressure };
}

export function monsterSystemsEnsure(state) {
  state.monsterSystems = state.monsterSystems && typeof state.monsterSystems === 'object'
    ? state.monsterSystems
    : { history: [], settings: { openWorldDrops: true, dungeonDrops: true, towerDrops: true } };
  state.monsterSystems.history = Array.isArray(state.monsterSystems.history) ? state.monsterSystems.history : [];
  state.characters.forEach(c => {
    c.materials = c.materials && typeof c.materials === 'object' ? c.materials : {};
    c.materialLog = Array.isArray(c.materialLog) ? c.materialLog : [];
  });
}

export function monsterDropChance(rarity, boss, mode) {
  let chance = { Common: 0.72, Uncommon: 0.42, Rare: 0.20, Epic: 0.085, Legendary: 0.025 }[rarity] || 0.25;
  if (boss) chance = Math.min(0.92, chance * 2.8);
  if (mode === 'tower') chance = Math.min(0.95, chance * 1.25);
  return chance;
}

export function awardMonsterDrops(state, c, monster, mode, boss = false) {
  monsterSystemsEnsure(state);
  if (!c || !monster) return [];
  const enabled = mode === 'tower'
    ? state.monsterSystems.settings.towerDrops
    : mode === 'dungeon'
    ? state.monsterSystems.settings.dungeonDrops
    : state.monsterSystems.settings.openWorldDrops;
  if (!enabled) return [];
  const catalog = materialCatalog.find(x => x[0] === monster.material);
  const rarity = catalog?.[1] || 'Common';
  const drops = [];
  if (Math.random() < monsterDropChance(rarity, boss, mode)) {
    const qty = rarity === 'Common' && Math.random() < 0.18 ? 2 : 1;
    c.materials[monster.material] = (c.materials[monster.material] || 0) + qty;
    drops.push({ name: monster.material, qty, rarity });
  }
  if (boss && Math.random() < 0.22) {
    const extra = monster.extra || (mode === 'tower' ? 'Eternity Fragment' : 'Boss Core');
    c.materials[extra] = (c.materials[extra] || 0) + 1;
    drops.push({ name: extra, qty: 1, rarity: 'Epic' });
  }
  if (drops.length) {
    drops.forEach(d => c.materialLog.unshift({ at: new Date().toISOString(), monster: monster.name, mode, material: d.name, qty: d.qty, rarity: d.rarity }));
    c.materialLog = c.materialLog.slice(0, 100);
    state.monsterSystems.history.unshift({
      id: uid(),
      at: new Date().toISOString(),
      characterId: c.id,
      characterName: c.name,
      monster: monster.name,
      mode,
      drops
    });
    state.monsterSystems.history = state.monsterSystems.history.slice(0, 300);
    addLog(state, `${c.name} mendapat drop dari ${monster.name}: ` + drops.map(d => `${d.name} ×${d.qty}`).join(', ') + '.', 'material', c.id);
  }
  return drops;
}

export function awardGearDrop(state, c, mode, boss) {
  if (!c || !Array.isArray(gearCatalog) || !gearCatalog.length) return null;
  const chance = mode === 'tower' ? (boss ? 0.42 : 0.045) : (boss ? 0.28 : 0.018);
  if (Math.random() > chance) return null;
  const pool = gearCatalog.filter(g => {
    if (mode === 'tower') return boss ? ['Epic', 'Legendary'].includes(g.rarity) : ['Rare', 'Epic', 'Legendary'].includes(g.rarity);
    return boss ? ['Rare', 'Epic', 'Legendary'].includes(g.rarity) : ['Common', 'Uncommon', 'Rare'].includes(g.rarity);
  });
  if (!pool.length) return null;
  const g = pool[Math.floor(Math.random() * pool.length)];
  c.inventory = Array.isArray(c.inventory) ? c.inventory : [];
  const owned = c.inventory.find(i => i.id === g.id && i.qty > 0);
  if (owned) owned.qty++;
  else c.inventory.push({ ...g, qty: 1, type: 'Equipment', equipped: false });
  const msg = `🎁 ${c.name} mendapatkan ${g.name} (${g.rarity}) dari ${mode === 'tower' ? 'Tower' : 'Dungeon'}!`;
  addLog(state, msg, 'equipment', c.id);
  addChronicle(state, msg, 'equipment');
  return g;
}

export function adventure(state, c, id, manual = false) {
  const d = dungeonData[id];
  if (!d) return;
  const skillBattle = resolveCharacterSkillCombat(c, d);
  if (c.level < d.min) {
    c.lastAction = 'Mencoba ' + d.name + ' tapi belum cukup level';
    addLog(state, `${c.name} mempertimbangkan ${d.name}, tetapi levelnya belum cukup.`, 'decision', c.id);
    return;
  }
  if (c.hp < c.maxHp * 0.35) {
    if (!usePotion(c, 'hp')) {
      c.hp = Math.min(c.maxHp, c.hp + Math.ceil(c.maxHp * 0.18));
      c.lastAction = 'Beristirahat memulihkan HP';
      addLog(state, `${c.name} memilih beristirahat sebelum masuk dungeon.`, 'rest', c.id);
      return;
    }
  }
  if (c.mp < (c.maxMp || 30) * 0.25 && (c.maxMp || 30) > 0) usePotion(c, 'mp');
  const power = ((c.atk || 5) + (c.mag || 0) * 0.6 + (c.def || 3) * 0.25 + (c.level || 1) * 2) * (1 + skillBattle.attackBonus);
  const enemyPower = d.hp + d.atk * 3;
  let win = power * 1.3 + Math.random() * 45 >= enemyPower + skillBattle.enemyPressure;
  if (c.hp < c.maxHp * 0.2) win = false;

  if (win) {
    const dentry = dungeonMonsterSets.find(x => x.id === d.id) || dungeonMonsterSets[0];
    const isBoss = Math.random() < 0.14;
    const chosen = isBoss ? dentry.boss : dentry.monsters[Math.floor(Math.random() * dentry.monsters.length)];
    awardMonsterDrops(state, c, { name: chosen[0], material: chosen[1], extra: isBoss ? 'Boss Core' : null }, 'dungeon', isBoss);
    awardGearDrop(state, c, 'dungeon', isBoss);

    c.achievementsStats = c.achievementsStats || {};
    c.achievementsStats.wins = (c.achievementsStats.wins || 0) + 1;
    checkAchievements(c);
    const damage = Math.min(c.hp - 1, Math.max(1, Math.floor((d.atk + Math.floor(Math.random() * d.atk)) * (1 - skillBattle.defenseBonus))));
    c.hp = Math.max(1, c.hp - damage);
    c.gold = (c.gold || 0) + d.gold;
    gainXp(state, c, d.xp);
    c.lastAction = 'Menang di ' + d.name;
    c.status = 'Bebas';
    addLog(state, `${c.name} mengalahkan ${d.enemy} di ${d.name}, memperoleh ${d.xp} EXP dan ${d.gold} gold.`, 'dungeon', c.id);
    addChronicle(state, `${c.name} menaklukkan ${d.name}.`, 'dungeon');
  } else {
    const damage = Math.min(c.hp - 1, Math.max(1, Math.floor((d.atk + Math.floor(Math.random() * d.atk * 1.5)) * (1 - skillBattle.defenseBonus))));
    c.hp = Math.max(1, c.hp - damage);
    c.lastAction = 'Kalah/mundur dari ' + d.name;
    c.status = 'Bebas';
    if (resolveFatality(state, c, 'ekspedisi dungeon ' + d.name, 0.035)) return;
    addLog(state, `${c.name} gagal menaklukkan ${d.name} dan mundur untuk memulihkan diri.`, 'dungeon', c.id);
  }
}

export function openWorldEncounter(state, c) {
  monsterSystemsEnsure(state);
  if (!c || c.retired || isCharacterRestricted(state, c) || Math.random() > 0.16) return false;
  const level = Math.max(1, c.level || 1);
  const region = monsterRegions.find(r => level >= r.min && level <= r.max) || monsterRegions[0];
  const eligible = region.monsters.filter(m => m[1] <= level + 3);
  if (!eligible.length) return false;
  const chosen = eligible[Math.floor(Math.random() * eligible.length)];
  const boss = chosen[1] >= region.max && Math.random() < 0.08;
  const enemy = { name: chosen[0], level: chosen[1], material: chosen[2], hp: 25 + chosen[1] * 18, atk: 3 + chosen[1] * 2, boss };
  const power = (c.atk || 10) + (c.def || 5) * 0.45 + level * 5;
  const threat = enemy.level * 4 + enemy.atk * 1.5 + (boss ? 40 : 0);
  const win = Math.random() < Math.max(0.12, Math.min(0.93, 0.55 + (power - threat) / Math.max(100, threat * 1.4)));
  c.lastAction = 'Menjelajah dan bertemu ' + enemy.name;
  if (win) {
    c.gold = (c.gold || 0) + 5 + enemy.level * 3;
    gainXp(state, c, 8 + enemy.level * 5);
    c.hp = Math.max(1, (c.hp || 1) - Math.min((c.hp || 1) - 1, Math.floor(enemy.atk * (boss ? 2 : 0.6))));
    awardMonsterDrops(state, c, enemy, 'open', boss);
    addChronicle(state, `${c.name} mengalahkan ${enemy.name} di ${region.name}.`, 'monster');
    return true;
  }
  c.hp = Math.max(1, Math.floor((c.maxHp || 100) * 0.4));
  if (resolveFatality(state, c, 'pertarungan melawan ' + enemy.name, boss ? 0.12 : 0.025)) return false;
  addLog(state, `${c.name} mundur dari ${enemy.name} di ${region.name}.`, 'monster', c.id);
  return false;
}

export function locationAction(state, c, t) {
  const loc = state.locations.find(x => x.id === c.locationId) || state.locations.find(x => x.id === 'town');
  if (!loc) {
    c.locationId = 'town';
    return false;
  }
  const type = loc.type;
  if (type === 'field') {
    const monsters = [
      { name: 'Slime', power: 7, xp: 9, gold: 5 },
      { name: 'Goblin', power: 13, xp: 15, gold: 10 },
      { name: 'Serigala Hutan', power: 18, xp: 20, gold: 13 }
    ];
    const m = monsters[Math.floor(Math.random() * (t.aggressive ? 3 : 2))];
    const power = (c.atk || 5) + (c.mag || 0) * 0.45 + (c.level || 1) * 1.4 + Math.random() * 12;
    if (power >= m.power || Math.random() < 0.25) {
      const xp = m.xp + Math.floor(Math.random() * (t.ambitious ? 10 : 5));
      const gold = m.gold + Math.floor(Math.random() * (t.greedy ? 12 : 5));
      gainXp(state, c, xp);
      c.gold = (c.gold || 0) + gold;
      let loot = '';
      if (Math.random() < (t.explorer ? 0.55 : 0.35)) {
        const mats = [{ id: 'iron_ore', name: 'Iron Ore', price: 8 }, { id: 'herb', name: 'Healing Herb', price: 6 }, { id: 'monster_fang', name: 'Monster Fang', price: 12 }];
        const m2 = mats[Math.floor(Math.random() * mats.length)];
        c.inventory = Array.isArray(c.inventory) ? c.inventory : [];
        const owned = c.inventory.find(i => i.id === m2.id);
        if (owned) owned.qty = (owned.qty || 1) + 1;
        else c.inventory.push({ ...m2, type: 'material', qty: 1 });
        loot = ' dan menemukan ' + m2.name;
      }
      c.achievementsStats = c.achievementsStats || {};
      c.achievementsStats.explores = (c.achievementsStats.explores || 0) + 1;
      checkAchievements(c);
      c.lastAction = 'Berburu ' + m.name;
      c.status = 'Bebas';
      addLog(state, `${c.name} berburu di ${loc.name}, mengalahkan ${m.name} dan mendapat ${xp} EXP, ${gold} gold${loot}.`, 'location', c.id);
    } else {
      const dmg = Math.max(1, Math.floor(m.power * 0.25) - Math.floor((c.def || 0) * 0.15));
      c.hp = Math.max(1, (c.hp || 1) - dmg);
      c.lastAction = 'Mundur dari ' + m.name;
      c.status = 'Bebas';
      addLog(state, `${c.name} bertemu ${m.name} di ${loc.name} dan mundur setelah kehilangan ${dmg} HP.`, 'location', c.id);
    }
    return true;
  }
  if (type === 'gather') {
    const mats = [{ id: 'iron_ore', name: 'Iron Ore', price: 8 }, { id: 'herb', name: 'Healing Herb', price: 6 }, { id: 'monster_fang', name: 'Monster Fang', price: 12 }];
    const m = t.greedy ? mats[0] : mats[Math.floor(Math.random() * mats.length)];
    const qty = 1 + (Math.random() < 0.22 ? 1 : 0);
    c.inventory = Array.isArray(c.inventory) ? c.inventory : [];
    const owned = c.inventory.find(i => i.id === m.id);
    if (owned) owned.qty = (owned.qty || 1) + qty;
    else c.inventory.push({ ...m, type: 'material', qty });
    const gold = 3 + Math.floor(Math.random() * (t.greedy ? 15 : 7));
    c.gold = (c.gold || 0) + gold;
    c.achievementsStats = c.achievementsStats || {};
    c.achievementsStats.guild = (c.achievementsStats.guild || 0) + (c.guildId ? 1 : 0);
    checkAchievements(c);
    c.lastAction = 'Menambang dan mengumpulkan bahan';
    addLog(state, `${c.name} bekerja di ${loc.name}, mendapat ${qty} ${m.name} dan ${gold} gold.`, 'location', c.id);
    return true;
  }
  if (type === 'town') {
    const oldHp = c.hp;
    const oldMp = c.mp;
    c.hp = Math.min(c.maxHp || 100, (c.hp || 0) + Math.max(3, Math.ceil((c.maxHp || 100) * 0.08)));
    c.mp = Math.min(c.maxMp || 30, (c.mp || 0) + Math.max(2, Math.ceil((c.maxMp || 30) * 0.08)));
    const mat = (c.inventory || []).find(i => i.type === 'material' && (i.qty || 0) > 1);
    if (mat && Math.random() < 0.35) {
      const qty = Math.max(1, Math.floor(mat.qty / 2));
      const gold = qty * (mat.price || 8);
      mat.qty -= qty;
      c.gold = (c.gold || 0) + gold;
      if (!mat.qty) c.inventory = c.inventory.filter(i => i !== mat);
      c.lastAction = 'Menjual material di kota';
      addLog(state, `${c.name} menjual ${qty} ${mat.name} di ${loc.name} dan mendapat ${gold} gold.`, 'location', c.id);
    } else {
      c.lastAction = 'Beristirahat di kota';
      addLog(state, `${c.name} beristirahat di ${loc.name} dan memulihkan ${(c.hp - oldHp)} HP serta ${(c.mp - oldMp)} MP.`, 'location', c.id);
    }
    return true;
  }
  return false;
}

function autoCraftForCharacter(state, c) {
  c.materials = c.materials && typeof c.materials === 'object' ? c.materials : {};
  c.inventory = Array.isArray(c.inventory) ? c.inventory : [];
  const recipes = Object.entries(craftRecipes || {});
  // Craft a useful potion when low on consumables, otherwise craft one affordable upgrade.
  const hpCount = c.inventory.filter(i => i.effect === 'hp' && (Number(i.qty) || 0) > 0).reduce((n, i) => n + i.qty, 0);
  const mpCount = c.inventory.filter(i => i.effect === 'mp' && (Number(i.qty) || 0) > 0).reduce((n, i) => n + i.qty, 0);
  let candidates = recipes.filter(([key, r]) => {
    if (!r || !r.need) return false;
    if (r.effect === 'hp' && hpCount >= 2) return false;
    if (r.effect === 'mp' && mpCount >= 2) return false;
    if (r.type !== 'consumable' && c.level < 3) return false;
    if (r.type !== 'consumable' && c.inventory.some(i => i.name === r.name)) return false;
    return Object.entries(r.need).every(([mat, qty]) => (Number(c.materials[mat]) || 0) >= qty);
  });
  if (!candidates.length || Math.random() > 0.22) return false;
  candidates.sort((a, b) => {
    const rank = ([, r]) => r.type === 'consumable' ? 0 : (r.rarity === 'Legendary' ? 4 : r.rarity === 'Epic' ? 3 : r.rarity === 'Rare' ? 2 : 1);
    return rank(b) - rank(a);
  });
  const [key, recipe] = candidates[0];
  for (const [mat, qty] of Object.entries(recipe.need)) c.materials[mat] -= qty;
  c.inventory.push({
    id: uid(), name: recipe.name, qty: 1, type: recipe.type, rarity: recipe.rarity,
    atk: recipe.atk || 0, def: recipe.def || 0, mag: recipe.mag || 0,
    effect: recipe.effect || null, heal: recipe.heal || 0, restore: recipe.restore || 0,
    hpBonus: recipe.hpBonus || 0, equipped: false, crafted: true
  });
  addLog(state, `${c.name} otomatis membuat ${recipe.name} dari material yang dikumpulkan.`, 'craft', c.id);
  return true;
}

export function aiAct(state, c) {
  if (isCharacterRestricted(state, c)) return;
  const t = personalityTraits(c);
  autoSkillBrain(state, c, t);
  if (autoCraftForCharacter(state, c)) return;

  if ((c.hp || 0) < (c.maxHp || 100) * 0.45) {
    if (usePotion(c, 'hp')) return;
    const hpItem = state.shop.find(i => i.effect === 'hp');
    if (hpItem && (c.gold || 0) >= hpItem.price && !(c.inventory || []).some(i => i.effect === 'hp' && i.qty > 0)) {
      buy(state, c, hpItem);
      return;
    }
    if ((c.hp || 0) < (c.maxHp || 100) * 0.3) {
      const old = c.hp;
      c.hp = Math.min(c.maxHp, c.hp + Math.ceil(c.maxHp * (t.coward ? 0.28 : 0.2)));
      c.lastAction = 'Beristirahat';
      addLog(state, `${c.name} ${t.coward ? 'menghindari bahaya dan beristirahat karena sifatnya yang penakut.' : `beristirahat memulihkan HP (${old} → ${c.hp}).`}`, 'decision', c.id);
      return;
    }
  }

  if ((c.maxMp || 0) && (c.mp || 0) < (c.maxMp || 100) * 0.4) {
    if (usePotion(c, 'mp')) return;
    const mpItem = state.shop.find(i => i.effect === 'mp');
    if (mpItem && (c.gold || 0) >= mpItem.price && !(c.inventory || []).some(i => i.effect === 'mp' && i.qty > 0)) {
      buy(state, c, mpItem);
      return;
    }
  }

  const options = (state.shop || []).filter(i =>
    !i.locked && (c.gold || 0) >= i.price &&
    !(c.inventory || []).some(x => x.id === i.id) &&
    ((i.type === 'weapon' && ((i.atk || 0) > 0 || (i.mag || 0) > 0)) ||
      (i.type === 'armor' && (i.def || 0) > 0) ||
      (i.type === 'accessory' && ((i.atk || 0) > 0 || (i.def || 0) > 0 || (i.mag || 0) > 0)))
  );
  const buyChance = t.greedy ? 0.75 : (t.smart ? 0.55 : (t.ambitious ? 0.5 : (t.aggressive ? 0.4 : 0.35)));
  if (options.length && Math.random() < (c.aiGoal === 'equipment' ? Math.max(buyChance, 0.8) : buyChance)) {
    const ranked = [...options].sort((a, b) => ((b.atk || 0) + (b.mag || 0) + (b.def || 0)) - ((a.atk || 0) + (a.mag || 0) + (a.def || 0)));
    buy(state, c, t.smart ? ranked[0] : ranked[Math.floor(Math.random() * ranked.length)]);
    return;
  }

  if (Math.random() < 0.88 && locationAction(state, c, t)) return;

  if ((t.helpful || c.aiGoal === 'helpful') && state.characters.some(x => x.id !== c.id && x.hp < x.maxHp * 0.4) && Math.random() < 0.55) {
    const ally = state.characters.filter(x => x.id !== c.id && x.hp < x.maxHp * 0.4).sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
    if (ally) {
      const gift = Math.min(c.gold || 0, 10 + Math.floor(Math.random() * 16));
      if (gift > 0) {
        c.gold -= gift;
        ally.gold = (ally.gold || 0) + gift;
        c.lastAction = 'Membantu ' + ally.name;
        addLog(state, `${c.name} membantu ${ally.name} dengan memberi ${gift} gold.`, 'guild', c.id);
        return;
      }
    }
  }

  let preferred = c.level >= 10 ? 'hard' : c.level >= 5 ? 'medium' : 'easy';
  if (t.smart) {
    const candidate = ['easy', 'medium', 'hard'].filter(id => c.level >= dungeonData[id].min)
      .map(id => ({ id, power: dungeonData[id].hp + dungeonData[id].atk * 3 })).sort((a, b) => a.power - b.power);
    const power = (c.atk || 5) + (c.mag || 0) * 0.6 + (c.def || 3) * 0.25 + (c.level || 1) * 2;
    preferred = candidate.find(x => power * 1.3 >= x.power)?.id || 'easy';
  }
  if (t.coward && c.hp < c.maxHp * 0.65 && Math.random() < 0.8) {
    const old = c.hp;
    c.hp = Math.min(c.maxHp, c.hp + Math.ceil(c.maxHp * 0.25));
    c.lastAction = 'Menghindari bahaya dan beristirahat';
    addLog(state, `${c.name} menghindari dungeon sementara karena sifatnya yang penakut. (${old} → ${c.hp} HP)`, 'decision', c.id);
    return;
  }
  if (c.hp < c.maxHp * 0.65 && Math.random() < (t.aggressive ? 0.2 : 0.5)) {
    const old = c.hp;
    c.hp = Math.min(c.maxHp, c.hp + Math.ceil(c.maxHp * 0.15));
    c.lastAction = 'Beristirahat';
    addLog(state, `${c.name} memutuskan beristirahat (${old} → ${c.hp} HP).`, 'rest', c.id);
    return;
  }
  if (Math.random() < (t.aggressive ? 0.9 : (t.ambitious || c.aiGoal === 'level up' ? 0.86 : (t.coward ? 0.4 : (t.explorer || c.aiGoal === 'exploration' ? 0.45 : 0.72))))) {
    if (t.aggressive && c.level >= 10 && Math.random() < 0.25) preferred = 'hard';
    adventure(state, c, preferred);
    return;
  }

  const gain = 5 + Math.floor(Math.random() * (t.greedy || c.aiGoal === 'gold' ? 26 : 11));
  c.gold = (c.gold || 0) + gain;
  const xp = 5 + Math.floor(Math.random() * (t.ambitious || c.aiGoal === 'level up' ? 22 : 9));
  gainXp(state, c, xp);
  c.lastAction = 'Mengumpulkan resource';
  c.locationId = Math.random() < 0.45 ? 'forest' : (Math.random() < 0.5 ? 'mine' : 'town');
  addLog(state, `${c.name} menjelajah sekitar, mendapat ${gain} gold dan ${xp} EXP.`, 'explore', c.id);
}
