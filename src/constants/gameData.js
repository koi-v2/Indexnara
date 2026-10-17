export const KEY = 'naraapp_world_v1';
export const NARA_SUPABASE_FUNCTION_URL = 'https://kkwduzwfuljdcawuwiku.supabase.co/functions/v1/Nara_App';

export const fixedPotions = [
  { id: 'hp_potion', name: 'HP Potion', type: 'consumable', price: 25, description: 'Memulihkan HP saat digunakan. Item bawaan, tidak bisa dihapus atau diubah.', effect: 'hp' },
  { id: 'mp_potion', name: 'MP Potion', type: 'consumable', price: 25, description: 'Memulihkan MP saat digunakan. Item bawaan, tidak bisa dihapus atau diubah.', effect: 'mp' }
];

export const defaultLocations = [
  { id: 'town', name: 'Kota Awal', type: 'town', description: 'Tempat aman untuk istirahat dan berbelanja.', unlocked: true },
  { id: 'forest', name: 'Hutan Lumina', type: 'field', description: 'Area berburu monster dan mencari material.', unlocked: true },
  { id: 'mine', name: 'Tambang Tua', type: 'gather', description: 'Tempat mengumpulkan bahan dan gold.', unlocked: true },
  { id: 'guildhall', name: 'Guild Hall', type: 'guild', description: 'Tempat anggota guild berkumpul.', unlocked: true }
];

export const defaultTerritories = [
  { id: 'lumina', name: 'Hutan Lumina', ownerGuildId: null, ownerFactionId: null, level: 1, prosperity: 20, resource: 'Herb', stock: 0, upgradeLevel: 1 },
  { id: 'oldmine', name: 'Tambang Tua', ownerGuildId: null, ownerFactionId: null, level: 1, prosperity: 15, resource: 'Iron Ore', stock: 0, upgradeLevel: 1 },
  { id: 'ruins', name: 'Reruntuhan Kuno', ownerGuildId: null, ownerFactionId: null, level: 2, prosperity: 10, resource: 'Relic', stock: 0, upgradeLevel: 1 },
  { id: 'crystalvale', name: 'Lembah Kristal', ownerGuildId: null, ownerFactionId: null, level: 2, prosperity: 28, resource: 'Crystal', stock: 0, upgradeLevel: 1 },
  { id: 'emberpeak', name: 'Puncak Bara', ownerGuildId: null, ownerFactionId: null, level: 3, prosperity: 22, resource: 'Fire Ore', stock: 0, upgradeLevel: 1 },
  { id: 'frostmarch', name: 'Perbatasan Es', ownerGuildId: null, ownerFactionId: null, level: 3, prosperity: 18, resource: 'Frost Herb', stock: 0, upgradeLevel: 1 },
  { id: 'suncoast', name: 'Pesisir Matahari', ownerGuildId: null, ownerFactionId: null, level: 2, prosperity: 35, resource: 'Pearl', stock: 0, upgradeLevel: 1 },
  { id: 'moonwood', name: 'Hutan Rembulan', ownerGuildId: null, ownerFactionId: null, level: 3, prosperity: 26, resource: 'Moonleaf', stock: 0, upgradeLevel: 1 },
  { id: 'ashlands', name: 'Tanah Abu', ownerGuildId: null, ownerFactionId: null, level: 4, prosperity: 12, resource: 'Ash Core', stock: 0, upgradeLevel: 1 },
  { id: 'windcliff', name: 'Tebing Angin', ownerGuildId: null, ownerFactionId: null, level: 2, prosperity: 30, resource: 'Wind Shard', stock: 0, upgradeLevel: 1 },
  { id: 'deepmarsh', name: 'Rawa Kelam', ownerGuildId: null, ownerFactionId: null, level: 3, prosperity: 16, resource: 'Venom Sac', stock: 0, upgradeLevel: 1 },
  { id: 'goldenfield', name: 'Dataran Emas', ownerGuildId: null, ownerFactionId: null, level: 4, prosperity: 42, resource: 'Gold Ore', stock: 0, upgradeLevel: 1 },
  { id: 'starfall', name: 'Kawah Bintang Jatuh', ownerGuildId: null, ownerFactionId: null, level: 5, prosperity: 20, resource: 'Star Fragment', stock: 0, upgradeLevel: 1 },
  { id: 'sunkenruins', name: 'Reruntuhan Tenggelam', ownerGuildId: null, ownerFactionId: null, level: 4, prosperity: 14, resource: 'Ancient Relic', stock: 0, upgradeLevel: 1 },
  { id: 'wyrmvalley', name: 'Lembah Wyrm', ownerGuildId: null, ownerFactionId: null, level: 5, prosperity: 24, resource: 'Dragon Scale', stock: 0, upgradeLevel: 1 },
  { id: 'highgarden', name: 'Taman Langit', ownerGuildId: null, ownerFactionId: null, level: 4, prosperity: 33, resource: 'Sky Flower', stock: 0, upgradeLevel: 1 },
  { id: 'abyssgate', name: 'Gerbang Abyss', ownerGuildId: null, ownerFactionId: null, level: 6, prosperity: 8, resource: 'Abyss Shard', stock: 0, upgradeLevel: 1 },
  { id: 'royalcapital', name: 'Ibu Kota Kerajaan', ownerGuildId: null, ownerFactionId: null, level: 6, prosperity: 50, resource: 'Royal Seal', stock: 0, upgradeLevel: 1 }
];

export const defaultFactions = [
  { id: 'crown', name: 'Kerajaan Fajar', ethos: 'Ketertiban dan perlindungan warga', influence: 35, treasury: 100, resources: {} },
  { id: 'guild', name: 'Aliansi Petualang', ethos: 'Kebebasan, eksplorasi, dan kontrak', influence: 30, treasury: 100, resources: {} },
  { id: 'veil', name: 'Ordo Tirai Hitam', ethos: 'Rahasia, pengetahuan terlarang, dan pengaruh', influence: 20, treasury: 100, resources: {} }
];

export const dungeonData = {
  easy: { id: 'easy', name: 'Dungeon Mudah', enemy: 'Slime', hp: 35, atk: 5, xp: 25, gold: 20, min: 1 },
  medium: { id: 'medium', name: 'Dungeon Sedang', enemy: 'Goblin', hp: 90, atk: 12, xp: 70, gold: 65, min: 5 },
  hard: { id: 'hard', name: 'Dungeon Sulit', enemy: 'Dark Knight', hp: 180, atk: 23, xp: 160, gold: 150, min: 10 }
};

export const SKILL_ARCHETYPES = {
  fire: { name: 'Api', icon: '🔥', branches: [['Fire Power', 'Burning Soul'], ['Inferno Strike', 'Flame Wave'], ['Phoenix Armor', 'Inferno King']] },
  ice: { name: 'Es', icon: '❄️', branches: [['Ice Power', 'Frost Guard'], ['Blizzard Burst', 'Frozen Counter'], ['Glacial King', 'Absolute Zero']] },
  lightning: { name: 'Petir', icon: '⚡', branches: [['Volt Power', 'Rapid Current'], ['Storm Breaker', 'Flash Step'], ['Tempest Lord', 'Thunder God']] },
  shadow: { name: 'Bayangan', icon: '🌑', branches: [['Dark Edge', 'Silent Step'], ['Phantom Hunt', 'Void Fang'], ['Night Sovereign', 'Eclipse King']] },
  holy: { name: 'Cahaya', icon: '✨', branches: [['Radiant Force', 'Sacred Ward'], ['Divine Pulse', 'Lightbringer'], ['Seraph Crown', 'Solar Judgment']] },
  nature: { name: 'Alam', icon: '🌿', branches: [['Thorn Mastery', 'Wild Growth'], ['Beast Bond', 'Verdant Heart'], ['Worldroot', 'Elder Bloom']] },
  blade: { name: 'Pedang', icon: '⚔️', branches: [['Edge Mastery', 'Blade Tempo'], ['Perfect Parry', 'Blade Dance'], ['Sword Saint', 'Heaven Splitter']] },
  arcane: { name: 'Arcane', icon: '🔮', branches: [['Mana Control', 'Arcane Focus'], ['Rift Burst', 'Spell Echo'], ['Astral Nova', 'Rift Sovereign']] },
  guard: { name: 'Pertahanan', icon: '🛡️', branches: [['Iron Body', 'Shield Wall'], ['Aegis Pulse', 'Last Bastion'], ['Unbreakable', 'Fortress Soul']] },
  agile: { name: 'Kelincahan', icon: '💨', branches: [['Swift Step', 'Keen Instinct'], ['Phantom Dash', 'Critical Flow'], ['Wind Sovereign', 'Perfect Tempo']] }
};

export const monsterRegions = [
  { id: 'field', name: 'Beginner Field', min: 1, max: 10, monsters: [['Green Slime', 1, 'Slime Gel', 'Common'], ['Red Slime', 3, 'Red Slime Gel', 'Uncommon'], ['Wild Rabbit', 2, 'Soft Fur', 'Common'], ['Forest Wolf', 4, 'Wolf Fang', 'Common'], ['Goblin Scout', 5, 'Goblin Ear', 'Common'], ['Goblin Archer', 7, 'Goblin Bowstring', 'Uncommon'], ['Wild Boar', 6, 'Boar Tusk', 'Common'], ['Ancient Treant', 10, 'Ancient Bark', 'Rare']] },
  { id: 'forest', name: 'Deep Forest', min: 10, max: 25, monsters: [['Shadow Wolf', 12, 'Shadow Pelt', 'Uncommon'], ['Poison Spider', 14, 'Venom Sac', 'Uncommon'], ['Orc Warrior', 16, 'Orc Tusk', 'Common'], ['Orc Shaman', 19, 'Dark Essence', 'Rare'], ['Forest Panther', 21, 'Panther Claw', 'Rare'], ['Treant Guardian', 23, 'Nature Core', 'Rare'], ['Forest Wraith', 25, 'Wraith Essence', 'Epic']] },
  { id: 'desert', name: 'Scorched Desert', min: 25, max: 40, monsters: [['Sand Scorpion', 26, 'Scorpion Shell', 'Common'], ['Desert Jackal', 28, 'Jackal Fang', 'Common'], ['Sand Golem', 30, 'Sandstone Core', 'Uncommon'], ['Mummy', 32, 'Cursed Bone', 'Uncommon'], ['Fire Lizard', 35, 'Fire Scale', 'Rare'], ['Desert Djinn', 38, 'Djinn Essence', 'Epic']] },
  { id: 'frost', name: 'Frozen Highlands', min: 40, max: 55, monsters: [['Ice Wolf', 41, 'Frost Pelt', 'Common'], ['Frost Spider', 43, 'Frozen Silk', 'Uncommon'], ['Ice Golem', 46, 'Frost Core', 'Rare'], ['Snow Troll', 49, 'Troll Hide', 'Rare'], ['Frozen Wraith', 52, 'Frozen Soul', 'Epic'], ['Frost Dragon', 55, 'Frost Dragon Scale', 'Epic']] },
  { id: 'volcano', name: 'Volcanic Wasteland', min: 55, max: 75, monsters: [['Ash Goblin', 56, 'Ash Ore', 'Common'], ['Lava Slime', 58, 'Lava Gel', 'Uncommon'], ['Magma Golem', 62, 'Magma Core', 'Rare'], ['Flame Orc', 65, 'Flame Tusk', 'Uncommon'], ['Infernal Hound', 69, 'Infernal Fang', 'Rare'], ['Fire Wyvern', 73, 'Fire Wyvern Scale', 'Epic']] },
  { id: 'abyss', name: 'Abyssal Lands', min: 75, max: 100, monsters: [['Abyss Stalker', 76, 'Abyss Claw', 'Uncommon'], ['Dark Knight', 80, 'Dark Steel', 'Rare'], ['Void Wraith', 84, 'Void Essence', 'Rare'], ['Abyssal Demon', 88, 'Demon Horn', 'Epic'], ['Chaos Chimera', 93, 'Chaos Fang', 'Epic'], ['Fallen Seraph', 98, 'Fallen Feather', 'Epic'], ['Abyssal Behemoth', 100, 'Abyssal Core', 'Legendary']] }
];

export const dungeonMonsterSets = [
  { id: 'easy', name: 'Beginner Cave', monsters: [['Cave Slime', 'Slime Gel'], ['Cave Bat', 'Bat Wing'], ['Cave Goblin', 'Goblin Ear'], ['Stone Beetle', 'Beetle Shell']], boss: ['Cave Guardian', 'Guardian Core'] },
  { id: 'medium', name: 'Goblin Stronghold', monsters: [['Goblin Soldier', 'Goblin Steel'], ['Goblin Archer', 'Goblin Bowstring'], ['Goblin Shaman', 'Goblin Soul'], ['Goblin Berserker', 'Berserker Fang']], boss: ['Goblin King', "Goblin King's Crown"] },
  { id: 'hard', name: 'Cursed Catacombs', monsters: [['Skeleton Warrior', 'Bone Fragment'], ['Skeleton Archer', 'Cursed Arrowhead'], ['Grave Wraith', 'Spirit Dust'], ['Cursed Knight', 'Cursed Steel']], boss: ['Lich King', 'Lich Core'] },
  { id: 'ruins', name: 'Ancient Ruins', monsters: [['Ruin Sentinel', 'Ancient Metal'], ['Stone Guardian', 'Guardian Core'], ['Ancient Automaton', 'Ancient Gear'], ['Ruin Specter', 'Ancient Spirit']], boss: ['Ancient Golem', 'Ancient Golem Core'] },
  { id: 'dragon', name: "Dragon's Lair", monsters: [['Dragon Whelp', 'Dragon Scale'], ['Dragon Knight', 'Dragon Steel'], ['Flame Drake', 'Drake Fang'], ['Dragon Priest', 'Dragon Essence']], boss: ['Elder Dragon', 'Elder Dragon Heart'] },
  { id: 'abyss', name: 'Abyssal Prison', monsters: [['Abyss Guard', 'Abyss Steel'], ['Soul Devourer', 'Devoured Soul'], ['Void Assassin', 'Void Claw'], ['Abyssal Horror', 'Horror Core']], boss: ['Abyss Lord', 'Abyss Lord Core'] },
  { id: 'divine', name: 'Divine Ruins', monsters: [['Fallen Templar', 'Divine Steel'], ['Corrupted Angel', 'Fallen Feather'], ['Holy Wraith', 'Sacred Dust'], ['Divine Guardian', 'Divine Core']], boss: ['Fallen God', "Fallen God's Heart"] }
];

export const towerMonsterSets = [
  { from: 1, to: 10, name: 'Ruins of Beginning', monsters: [['Tower Slime', 'Tower Gel'], ['Tower Goblin', 'Tower Ore']], boss: ['Guardian of the First Gate', 'First Gate Core'] },
  { from: 11, to: 20, name: 'Forest of Shadows', monsters: [['Tower Shadow Wolf', 'Shadow Pelt'], ['Tower Poison Spider', 'Tower Venom']], boss: ['Shadow Gatekeeper', 'Shadow Core'] },
  { from: 21, to: 30, name: 'Forgotten Catacombs', monsters: [['Tower Skeleton', 'Cursed Bone'], ['Grave Wraith', 'Wraith Essence']], boss: ['Undying Lich', 'Lich Heart'] },
  { from: 31, to: 40, name: 'Infernal Forge', monsters: [['Flame Golem', 'Flame Core'], ['Ash Demon', 'Ash Ore']], boss: ['Infernal Warden', 'Infernal Core'] },
  { from: 41, to: 50, name: 'Frozen Abyss', monsters: [['Frost Wraith', 'Frozen Soul'], ['Frozen Wyvern', 'Frozen Scale']], boss: ['Ancient Frost Dragon', 'Frozen Dragon Heart'] },
  { from: 51, to: 60, name: 'Sky Ruins', monsters: [['Sky Harpy', 'Storm Feather'], ['Thunder Golem', 'Thunder Core']], boss: ['Lord of the Storm', 'Storm Lord Core'] },
  { from: 61, to: 70, name: 'Abyssal Prison', monsters: [['Abyss Guard', 'Abyss Steel'], ['Soul Devourer', 'Devoured Soul']], boss: ['Abyss Overlord', 'Abyss Overlord Core'] },
  { from: 71, to: 80, name: "Dragon's Nest", monsters: [['Dragon Wraith', 'Dragon Wraith Scale'], ['Chaos Drake', 'Chaos Fang']], boss: ['Chaos Dragon Emperor', 'Chaos Dragon Heart'] },
  { from: 81, to: 90, name: 'Realm of Chaos', monsters: [['Fallen Seraph', 'Fallen Feather'], ['Void Reaper', 'Void Essence']], boss: ['Archangel of Ruin', 'Archangel Core'] },
  { from: 91, to: 100, name: 'Divine Sanctuary', monsters: [['Tower Executioner', 'Monarch Shard'], ['Chaos Guardian', 'Chaos Essence']], boss: ['Eternal Sovereign', 'Eternal Core'] }
];

export const materialCatalog = [
  ['Slime Gel', 'Common', 'Potion dasar'],
  ['Red Slime Gel', 'Uncommon', 'Potion api'],
  ['Soft Fur', 'Common', 'Armor ringan'],
  ['Raw Meat', 'Common', 'Bahan konsumsi'],
  ['Wolf Fang', 'Common', 'Senjata ringan'],
  ['Wolf Pelt', 'Common', 'Armor'],
  ['Goblin Ear', 'Common', 'Kontrak guild'],
  ['Crude Ore', 'Common', 'Peleburan'],
  ['Goblin Bowstring', 'Uncommon', 'Busur'],
  ['Boar Tusk', 'Common', 'Senjata'],
  ['Treant Bark', 'Uncommon', 'Armor alam'],
  ['Nature Essence', 'Rare', 'Equipment alam'],
  ['Ancient Bark', 'Rare', 'Armor langka'],
  ['Heart of Nature', 'Epic', 'Artefak alam'],
  ['Shadow Pelt', 'Uncommon', 'Armor bayangan'],
  ['Venom Sac', 'Uncommon', 'Potion racun'],
  ['Spider Silk', 'Uncommon', 'Armor dan aksesori'],
  ['Orc Tusk', 'Common', 'Senjata'],
  ['Iron Scrap', 'Common', 'Peleburan'],
  ['Cursed Herb', 'Uncommon', 'Potion kutukan'],
  ['Dark Essence', 'Rare', 'Equipment gelap'],
  ['Panther Claw', 'Rare', 'Senjata kritikal'],
  ['Nature Core', 'Rare', 'Upgrade alam'],
  ['Wraith Essence', 'Epic', 'Equipment roh'],
  ['Queen Venom', 'Epic', 'Racun boss'],
  ['Spider Queen Core', 'Legendary', 'Crafting boss'],
  ['Scorpion Shell', 'Common', 'Armor'],
  ['Jackal Fang', 'Common', 'Senjata'],
  ['Sandstone Core', 'Uncommon', 'Equipment bumi'],
  ['Cursed Bone', 'Uncommon', 'Equipment gelap'],
  ['Ancient Cloth', 'Common', 'Jubah'],
  ['Fire Scale', 'Rare', 'Armor api'],
  ['Djinn Essence', 'Epic', 'Aksesori sihir'],
  ['Colossus Core', 'Epic', 'Crafting boss'],
  ["Desert King's Relic", 'Legendary', 'Artefak'],
  ['Frost Pelt', 'Common', 'Armor dingin'],
  ['Frozen Silk', 'Uncommon', 'Armor'],
  ['Frost Core', 'Rare', 'Equipment es'],
  ['Troll Hide', 'Rare', 'Armor berat'],
  ['Troll Blood', 'Uncommon', 'Potion'],
  ['Frozen Soul', 'Epic', 'Equipment roh'],
  ['Wyvern Scale', 'Rare', 'Armor wyvern'],
  ['Frost Dragon Scale', 'Epic', 'Armor naga es'],
  ['Frozen Dragon Heart', 'Legendary', 'Crafting boss'],
  ['Ash Ore', 'Common', 'Peleburan'],
  ['Lava Gel', 'Uncommon', 'Potion api'],
  ['Magma Core', 'Rare', 'Equipment magma'],
  ['Flame Tusk', 'Uncommon', 'Senjata'],
  ['Infernal Fang', 'Rare', 'Senjata api'],
  ['Fire Wyvern Scale', 'Epic', 'Armor api'],
  ['Infernal Dragon Heart', 'Legendary', 'Crafting boss'],
  ['Eternal Flame', 'Legendary', 'Upgrade api'],
  ['Abyss Claw', 'Uncommon', 'Senjata abyss'],
  ['Dark Steel', 'Rare', 'Equipment gelap'],
  ['Void Essence', 'Rare', 'Equipment void'],
  ['Demon Horn', 'Epic', 'Equipment demon'],
  ['Chaos Fang', 'Epic', 'Senjata chaos'],
  ['Fallen Feather', 'Epic', 'Equipment divine'],
  ['Abyssal Core', 'Legendary', 'Crafting abyss'],
  ['Bat Wing', 'Common', 'Potion dan aksesori'],
  ['Beetle Shell', 'Common', 'Armor'],
  ['Guardian Core', 'Rare', 'Equipment guardian'],
  ['Goblin Steel', 'Uncommon', 'Senjata goblin'],
  ['Goblin Soul', 'Rare', 'Crafting sihir'],
  ['Berserker Fang', 'Rare', 'Senjata'],
  ["Goblin King's Crown", 'Epic', 'Trofi boss'],
  ['Bone Fragment', 'Common', 'Crafting tulang'],
  ['Cursed Arrowhead', 'Uncommon', 'Amunisi'],
  ['Spirit Dust', 'Uncommon', 'Potion roh'],
  ['Cursed Steel', 'Rare', 'Senjata'],
  ['Lich Core', 'Epic', 'Equipment undead'],
  ['Ancient Metal', 'Rare', 'Equipment kuno'],
  ['Ancient Gear', 'Uncommon', 'Crafting mekanis'],
  ['Ancient Spirit', 'Epic', 'Relik'],
  ['Ancient Golem Core', 'Epic', 'Crafting boss'],
  ['Relic Shard', 'Rare', 'Upgrade artefak'],
  ['Dragon Scale', 'Rare', 'Armor naga'],
  ['Dragon Steel', 'Epic', 'Senjata naga'],
  ['Drake Fang', 'Rare', 'Senjata'],
  ['Dragon Essence', 'Epic', 'Crafting naga'],
  ['Elder Dragon Heart', 'Legendary', 'Crafting endgame'],
  ['Legendary Scale', 'Legendary', 'Armor legendaris'],
  ['Abyss Steel', 'Epic', 'Equipment abyss'],
  ['Devoured Soul', 'Rare', 'Crafting roh'],
  ['Void Claw', 'Epic', 'Senjata void'],
  ['Horror Core', 'Epic', 'Equipment horror'],
  ['Abyss Lord Core', 'Legendary', 'Crafting boss'],
  ['Divine Steel', 'Epic', 'Equipment divine'],
  ['Sacred Dust', 'Rare', 'Potion suci'],
  ['Divine Core', 'Legendary', 'Crafting endgame'],
  ['God Fragment', 'Legendary', 'Artefak'],
  ["Fallen God's Heart", 'Legendary', 'Crafting endgame'],
  ['Tower Gel', 'Common', 'Crafting tower'],
  ['Tower Ore', 'Common', 'Peleburan tower'],
  ['First Gate Core', 'Rare', 'Crafting tower'],
  ['Tower Venom', 'Uncommon', 'Potion tower'],
  ['Shadow Core', 'Rare', 'Equipment tower'],
  ['Lich Heart', 'Epic', 'Equipment undead'],
  ['Flame Core', 'Rare', 'Equipment api'],
  ['Infernal Core', 'Epic', 'Crafting infernal'],
  ['Frozen Scale', 'Rare', 'Armor es'],
  ['Thunder Core', 'Rare', 'Equipment petir'],
  ['Storm Feather', 'Uncommon', 'Aksesori petir'],
  ['Storm Lord Core', 'Epic', 'Crafting boss'],
  ['Abyss Overlord Core', 'Legendary', 'Crafting boss'],
  ['Dragon Wraith Scale', 'Epic', 'Armor roh naga'],
  ['Chaos Dragon Heart', 'Legendary', 'Crafting boss'],
  ['Monarch Shard', 'Epic', 'Upgrade tower'],
  ['Chaos Essence', 'Epic', 'Crafting chaos'],
  ['Eternal Core', 'Legendary', 'Crafting legendaris'],
  ['Eternity Fragment', 'Legendary', 'Upgrade artefak'],
  ['Mana Essence', 'Common', 'Potion mana dasar'],
  ['Crystal', 'Rare', 'Pusat sihir']
];

export const gearCatalog = [
  { id: 'rusty_sword', name: 'Pedang Berkarat', slot: 'weapon', rarity: 'Common', atk: 3, def: 0, hp: 0, price: 50, desc: 'Pedang tua berkekuatan minim.' },
  { id: 'iron_sword', name: 'Pedang Besi', slot: 'weapon', rarity: 'Uncommon', atk: 6, def: 0, hp: 0, price: 150, desc: 'Senjata andal para petualang baru.' },
  { id: 'steel_blade', name: 'Bilah Baja', slot: 'weapon', rarity: 'Rare', atk: 10, def: 1, hp: 0, price: 350, desc: 'Bilah tajam dengan keseimbangan tinggi.' },
  { id: 'shadow_dagger', name: 'Belati Bayangan', slot: 'weapon', rarity: 'Epic', atk: 12, def: 0, hp: 0, price: 650, desc: 'Belati ringan untuk serangan cepat.' },
  { id: 'knight_greatsword', name: 'Greatsword Ksatria', slot: 'weapon', rarity: 'Legendary', atk: 19, def: 2, hp: 0, price: 1400, desc: 'Pedang besar dengan daya serang tinggi.' },
  { id: 'arcane_staff', name: 'Tongkat Arkanum', slot: 'weapon', rarity: 'Epic', atk: 3, def: 0, hp: 0, price: 700, desc: 'Tongkat yang menyalurkan sihir.' },
  { id: 'guardian_armor', name: 'Armor Guardian', slot: 'armor', rarity: 'Rare', atk: 0, def: 8, hp: 35, price: 300, desc: 'Armor kokoh untuk garis depan.' },
  { id: 'leather_armor', name: 'Armor Kulit', slot: 'armor', rarity: 'Common', atk: 0, def: 3, hp: 10, price: 120, desc: 'Perlindungan ringan bagi pemula.' },
  { id: 'steel_plate', name: 'Baju Zirah Baja', slot: 'armor', rarity: 'Epic', atk: 1, def: 13, hp: 50, price: 850, desc: 'Zirah baja yang kuat.' },
  { id: 'dragon_mail', name: 'Dragon Mail', slot: 'armor', rarity: 'Legendary', atk: 2, def: 16, hp: 80, price: 1200, desc: 'Armor dari sisik naga.' },
  { id: 'mage_robe', name: 'Jubah Penyihir', slot: 'armor', rarity: 'Rare', atk: 1, def: 4, hp: 25, price: 380, desc: 'Jubah untuk pengguna sihir.' },
  { id: 'abyss_plate', name: 'Zirah Abyss', slot: 'armor', rarity: 'Legendary', atk: 3, def: 20, hp: 90, price: 1800, desc: 'Zirah yang menyerap energi abyss.' },
  { id: 'swift_boots', name: 'Sepatu Swift', slot: 'accessory', rarity: 'Rare', atk: 3, def: 2, hp: 0, price: 250, desc: 'Meningkatkan kelincahan pemakainya.' },
  { id: 'traveler_boots', name: 'Sepatu Pengelana', slot: 'accessory', rarity: 'Common', atk: 1, def: 1, hp: 5, price: 100, desc: 'Sepatu awet untuk perjalanan.' },
  { id: 'wind_boots', name: 'Sepatu Angin', slot: 'accessory', rarity: 'Epic', atk: 5, def: 2, hp: 10, price: 750, desc: 'Sepatu ringan yang terasa seperti angin.' },
  { id: 'sage_relic', name: 'Relik Sage', slot: 'accessory', rarity: 'Epic', atk: 2, def: 0, hp: 20, price: 500, desc: 'Relik tua dengan energi misterius.' },
  { id: 'nature_charm', name: 'Jimat Alam', slot: 'accessory', rarity: 'Rare', atk: 1, def: 2, hp: 15, price: 350, desc: 'Jimat yang menyimpan energi alam.' },
  { id: 'abyss_relic', name: 'Relik Abyss', slot: 'accessory', rarity: 'Legendary', atk: 8, def: 5, hp: 25, price: 1250, desc: 'Relik dengan kekuatan dari abyss.' },
  { id: 'healing_charm', name: 'Jimat Pemulih', slot: 'accessory', rarity: 'Uncommon', atk: 0, def: 1, hp: 15, price: 220, desc: 'Membantu pemulihan vitalitas.' },
  { id: 'dragon_ring', name: 'Cincin Naga', slot: 'accessory', rarity: 'Epic', atk: 4, def: 2, hp: 10, price: 900, desc: 'Cincin berisi sisa kekuatan naga.' }
];

export const craftRecipes = {
  hp_lesser: { name: 'Lesser HP Potion', need: { 'Slime Gel': 2 }, rarity: 'Common', type: 'consumable', effect: 'hp', heal: 45 },
  hp_greater: { name: 'Greater HP Potion', need: { 'Slime Gel': 4, 'Nature Essence': 1 }, rarity: 'Rare', type: 'consumable', effect: 'hp', heal: 120 },
  mp_lesser: { name: 'Lesser MP Potion', need: { 'Mana Essence': 2 }, rarity: 'Common', type: 'consumable', effect: 'mp', restore: 40 },
  mp_greater: { name: 'Greater MP Potion', need: { 'Mana Essence': 4, 'Crystal': 1 }, rarity: 'Rare', type: 'consumable', effect: 'mp', restore: 100 },
  potion: { name: 'Monster Potion', need: { 'Slime Gel': 2 }, rarity: 'Common', type: 'consumable', effect: 'hp', heal: 45 },
  iron: { name: 'Reinforced Iron Gear', need: { 'Crude Ore': 3, 'Goblin Steel': 1 }, rarity: 'Rare', type: 'armor', def: 8, hpBonus: 20 },
  forest: { name: 'Nature Charm', need: { 'Nature Essence': 2, 'Treant Bark': 2 }, rarity: 'Rare', type: 'accessory', mag: 7, def: 3 },
  dragon: { name: 'Dragon Scale Armor', need: { 'Dragon Scale': 4, 'Elder Dragon Heart': 1 }, rarity: 'Legendary', type: 'armor', def: 18, hpBonus: 60 },
  abyss: { name: 'Abyss Relic', need: { 'Abyssal Core': 1, 'Void Essence': 3 }, rarity: 'Epic', type: 'accessory', atk: 10, mag: 12 },
  eternity: { name: 'Eternity Artifact', need: { 'Eternal Core': 1, 'Eternity Fragment': 3 }, rarity: 'Legendary', type: 'accessory', atk: 15, def: 10, mag: 15 }
};

export const lifeGoals = [
  { id: 'hero', name: 'Menjadi Pahlawan', desc: 'Naik level dan membantu warga.' },
  { id: 'rich', name: 'Menjadi Kaya', desc: 'Mengumpulkan gold.' },
  { id: 'explorer', name: 'Penjelajah Dunia', desc: 'Mengunjungi berbagai tempat.' },
  { id: 'social', name: 'Membangun Persahabatan', desc: 'Mengenal dan membantu karakter lain.' },
  { id: 'craft', name: 'Kolektor Material', desc: 'Mengumpulkan bahan dan perlengkapan.' },
  { id: 'guild', name: 'Tokoh Guild', desc: 'Membantu guild dan anggotanya.' }
];
