// CORSAIRDASH: Sovereign Seas — Master World, Ship Tiers, Loadout & Boss Data
// Inspired by DixieDash's arcade delivery loop, reimagined for the Golden Age of Sail.

window.CORSAIR_DATA = {
  worldBounds: {
    minX: -4200,
    maxX: 4200,
    minY: -4200,
    maxY: 4200
  },

  // 3 Difficulty Modes: Govern both Sailing Physics AND Pirate Density Escalation over time
  difficulties: {
    easy: {
      id: 'easy',
      name: 'MERCHANT BREEZE',
      badge: '🟢 MERCHANT BREEZE',
      tagline: 'Forgiving wind physics & gradual pirate patrols. Great for high-capacity cargo runners.',
      scoreMultiplier: 1.0,
      payoutMultiplier: 1.0,
      // Sailing physics parameters
      headwindPenalty: 0.12,      // Only 12% speed loss when sailing directly into wind
      tailwindBonus: 0.25,        // +25% speed with favorable wind
      steerResponsiveness: 1.15,  // Nimble arcade helm
      hullInertia: 0.982,
      reefDamageMult: 0.5,
      // Pirate density & escalation parameters
      initialMaxPirates: 5,
      absoluteMaxPirates: 14,
      escalationRatePerMin: 1.5,  // +1.5 max pirates per minute of voyage
      pirateSpawnInterval: 4.5,
      pirateSpeedMult: 0.85,
      pirateDamageMult: 0.75,
      pirateReloadSec: 3.4,
      bossIntervalSec: 115
    },
    medium: {
      id: 'medium',
      name: 'PRIVATEER TRADEWINDS',
      badge: '🟡 PRIVATEER TRADEWINDS',
      tagline: 'Authentic wind-angle sailing & steadily escalating pirate hunting packs.',
      scoreMultiplier: 1.5,
      payoutMultiplier: 1.2,
      // Sailing physics parameters
      headwindPenalty: 0.35,      // 35% speed loss into headwind — rewards tacking & rigging!
      tailwindBonus: 0.32,        // +32% speed on broad reach / tailwind
      steerResponsiveness: 1.0,
      hullInertia: 0.986,
      reefDamageMult: 1.0,
      // Pirate density & escalation parameters
      initialMaxPirates: 9,
      absoluteMaxPirates: 28,
      escalationRatePerMin: 3.5,  // +3.5 max pirates per minute
      pirateSpawnInterval: 2.6,
      pirateSpeedMult: 1.0,
      pirateDamageMult: 1.0,
      pirateReloadSec: 2.5,
      bossIntervalSec: 85
    },
    hard: {
      id: 'hard',
      name: 'CURSED MAELSTROM',
      badge: '🔴 CURSED MAELSTROM',
      tagline: 'Heavy helm momentum, gale currents & relentless pirate armada swarms!',
      scoreMultiplier: 2.5,
      payoutMultiplier: 1.5,
      // Sailing physics parameters
      headwindPenalty: 0.52,      // Strong headwind resistance — must read the wind compass!
      tailwindBonus: 0.40,        // Huge surge when catching the gale
      steerResponsiveness: 0.88,  // Heavier authentic keel inertia
      hullInertia: 0.990,
      reefDamageMult: 1.6,
      // Pirate density & escalation parameters
      initialMaxPirates: 15,
      absoluteMaxPirates: 46,
      escalationRatePerMin: 6.5,  // Rapidly swarms the sea (+6.5 pirates/min up to 46!)
      pirateSpawnInterval: 1.3,
      pirateSpeedMult: 1.14,
      pirateDamageMult: 1.35,
      pirateReloadSec: 1.85,
      bossIntervalSec: 60
    }
  },

  // 6 Ship Tiers: Starting at Tier 1 (Coastal Sloop) + 5 more upgrade tiers up to First-Rate Man-o'-War
  shipTiers: [
    {
      level: 1,
      id: 'sloop',
      name: 'Coastal Sloop',
      subtitle: 'Tier I • Light Island Courier',
      cost: 0,
      maxSlots: 2,
      baseHull: 100,
      baseSpeed: 68,
      baseAccel: 78,
      baseTurn: 3.2,
      baseCargo: 2,
      baseCannonsPerSide: 1,
      masts: 1,
      length: 34,
      width: 16,
      hullColor: '#8b5a2b',
      trimColor: '#eab308',
      sailColor: '#f8fafc',
      description: 'Nimble single-mast sloop. Fast in shallow coves with 2 loadout slots—choose between extra hold space or basic deck guns.'
    },
    {
      level: 2,
      id: 'schooner',
      name: 'Topsail Schooner',
      subtitle: 'Tier II • Smuggler\'s Packet',
      cost: 250,
      maxSlots: 4,
      baseHull: 155,
      baseSpeed: 75,
      baseAccel: 84,
      baseTurn: 3.0,
      baseCargo: 3,
      baseCannonsPerSide: 2,
      masts: 2,
      length: 42,
      width: 18,
      hullColor: '#6b4226',
      trimColor: '#38bdf8',
      sailColor: '#fef9c3',
      description: 'Sleek twin-mast schooner built to outrun revenue cutters. 4 loadout slots allow a dedicated runner or light raider build.'
    },
    {
      level: 3,
      id: 'brigantine',
      name: 'Corsair Brigantine',
      subtitle: 'Tier III • Armed Escort Vessel',
      cost: 700,
      maxSlots: 6,
      baseHull: 230,
      baseSpeed: 73,
      baseAccel: 80,
      baseTurn: 2.75,
      baseCargo: 5,
      baseCannonsPerSide: 3,
      masts: 2,
      length: 48,
      width: 21,
      hullColor: '#4a2c18',
      trimColor: '#f97316',
      sailColor: '#f1f5f9',
      description: 'Versatile square-rigged brigantine with reinforced gunwale ports and 6 modular loadout slots.'
    },
    {
      level: 4,
      id: 'fluyt',
      name: 'East India Fluyt',
      subtitle: 'Tier IV • High-Seas Treasure Carrack',
      cost: 1600,
      maxSlots: 8,
      baseHull: 340,
      baseSpeed: 70,
      baseAccel: 75,
      baseTurn: 2.45,
      baseCargo: 8,
      baseCannonsPerSide: 4,
      masts: 3,
      length: 56,
      width: 25,
      hullColor: '#5c3a21',
      trimColor: '#10b981',
      sailColor: '#fffbeb',
      description: 'Deep-bellied 3-mast merchant carrack with a towering sterncastle and 8 loadout slots for massive trade hauls.'
    },
    {
      level: 5,
      id: 'frigate',
      name: 'Royal Heavy Frigate',
      subtitle: 'Tier V • Fast Line-of-Battle Cruiser',
      cost: 3500,
      maxSlots: 10,
      baseHull: 490,
      baseSpeed: 77,
      baseAccel: 86,
      baseTurn: 2.55,
      baseCargo: 10,
      baseCannonsPerSide: 6,
      masts: 3,
      length: 64,
      width: 26,
      hullColor: '#291d16',
      trimColor: '#f43f5e',
      sailColor: '#ffffff',
      description: 'Masterpiece of naval architecture. Combines 3 full-rigged masts, heavy gun decks, and 10 customization slots.'
    },
    {
      level: 6,
      id: 'manowar',
      name: 'First-Rate Man-o\'-War',
      subtitle: 'Tier VI • Sovereign Dreadnought Galleon',
      cost: 7500,
      maxSlots: 12,
      baseHull: 720,
      baseSpeed: 74,
      baseAccel: 82,
      baseTurn: 2.30,
      baseCargo: 14,
      baseCannonsPerSide: 9,
      masts: 4,
      length: 74,
      width: 30,
      hullColor: '#1a110b',
      trimColor: '#fbbf24',
      sailColor: '#fef08a',
      description: 'The undisputed monarch of the seven seas! 4 golden-rigged masts, triple gun decks, gilded stern lanterns, and the maximum 12 loadout slots.'
    }
  ],

  // 8 Loadout Modules: Each occupies 1 Slot. Players can stack or mix modules with real trade-offs!
  loadoutModules: [
    {
      id: 'cargo_hold',
      name: 'Expanded Cargo Hold',
      icon: '📦',
      category: 'TRADE',
      cost: 120,
      slotCost: 1,
      shortStat: '+3 Cargo Crates • -2% Speed',
      description: 'Adds +3 Cargo Crate capacity so contracts pay drastically more gold, but extra weight trims top speed by -2% and uses a weapon/defense slot.',
      effects: {
        cargoBonus: 3,
        speedMult: -0.02,
        payoutBonus: 0.12
      }
    },
    {
      id: 'cannon_battery',
      name: 'Broadside Cannon Battery',
      icon: '💣',
      category: 'OFFENSE',
      cost: 150,
      slotCost: 1,
      shortStat: '+2 Broadside Guns • +22 Damage',
      description: 'Mounts heavy 24-pounder brass cannons on port and starboard decks. Essential for blasting pirate packs and sea monsters.',
      effects: {
        cannonsPerSide: 1,
        cannonDamage: 22,
        reloadReduction: 0.10
      }
    },
    {
      id: 'swivel_culverin',
      name: 'Swivel Chase Culverins',
      icon: '🎯',
      category: 'OFFENSE',
      cost: 220,
      slotCost: 1,
      shortStat: 'Auto-Fire Deck Gun • +20% Range',
      description: '360-degree brass swivel guns that automatically target and fire at the closest pirate or boss monster every 2.0 seconds!',
      effects: {
        swivelGuns: 1,
        cannonRangeMult: 0.20
      }
    },
    {
      id: 'iron_hull',
      name: 'Ironclad Oak Plating',
      icon: '🛡️',
      category: 'DEFENSE',
      cost: 140,
      slotCost: 1,
      shortStat: '+95 Max Hull HP • -12% Dmg Taken',
      description: 'Bolts thick seasoned live-oak and iron plates over the waterline, boosting Max Hull by +95 HP and deflecting enemy shot.',
      effects: {
        hullBonus: 95,
        damageReduction: 0.12
      }
    },
    {
      id: 'silk_sails',
      name: 'Silk Studding Sails',
      icon: '⛵',
      category: 'SPEED',
      cost: 160,
      slotCost: 1,
      shortStat: '+11% Top Speed • +18% Wind Tack',
      description: 'Fine outlaw silk canvas that catches the faintest breeze. Boosts top speed by +11% and cuts headwind penalty.',
      effects: {
        speedMult: 0.11,
        accelMult: 0.15,
        windEfficiency: 0.18
      }
    },
    {
      id: 'copper_rudder',
      name: 'Copper-Sheathed Keel',
      icon: '⚓',
      category: 'HANDLING',
      cost: 130,
      slotCost: 1,
      shortStat: '+22% Turn Rate • Reef Immunity',
      description: 'Copper hull sheathing and balanced helm tackle. Increases turning agility by +22% and prevents coral reef hull scraping.',
      effects: {
        turnMult: 0.22,
        reefProtection: 0.65
      }
    },
    {
      id: 'carpenter_crew',
      name: 'Master Carpenter Crew',
      icon: '🔨',
      category: 'DEFENSE',
      cost: 260,
      slotCost: 1,
      shortStat: '+4.0 Hull HP/sec Auto-Repair',
      description: 'Veteran shipwrights who plug cannonball holes and splice rigging while underway, restoring +4.0 Hull HP every second at sea.',
      effects: {
        regenPerSec: 4.0
      }
    },
    {
      id: 'fire_barrels',
      name: 'Greek Fire Stern Barrels',
      icon: '🛢️',
      category: 'TACTICAL',
      cost: 200,
      slotCost: 1,
      shortStat: 'Drops Explosive Fire Kegs [E]',
      description: 'Ideal for unarmed cargo runners! Jettisons floating Greek Fire powder kegs off your stern [E] that detonate on pursuing pirates.',
      effects: {
        fireBarrels: 1,
        barrelDamage: 85
      }
    }
  ],

  // 12 Hand-Crafted 2.5D Island Ports across the Archipelago
  islands: [
    {
      id: 'port_royal',
      name: 'Port Royal Haven',
      region: 'Crown Heartlands',
      x: 0,
      y: 0,
      radius: 260,
      dockX: 0,
      dockY: 295,
      archStyle: 'citadel_harbor',
      specialty: 'Royal Bullion & Naval Supplies',
      icon: '🏰',
      themeColor: '#eab308',
      sandColor: '#fde68a',
      grassColor: '#15803d',
      rockColor: '#57534e',
      description: 'The bustling seat of the Royal Governor, guarded by limestone bastions, a soaring harbor lighthouse, and the Grand Drydock.'
    },
    {
      id: 'tortuga_cove',
      name: 'Tortuga Smuggler\'s Cove',
      region: 'Dead Man\'s Reach',
      x: -2150,
      y: -1450,
      radius: 230,
      dockX: -1920,
      dockY: -1350,
      archStyle: 'pirate_skull_cove',
      specialty: 'Spiced Rum & Contraband Velvet',
      icon: '🏴‍☠️',
      themeColor: '#ef4444',
      sandColor: '#fcd34d',
      grassColor: '#166534',
      rockColor: '#292524',
      description: 'Carved into a grinning basalt skull cliff! Torchlit taverns, rum distilleries, and rowdy buccaneer wharves.'
    },
    {
      id: 'nassau_atoll',
      name: 'Nassau Spice Atoll',
      region: 'Turquoise Shallows',
      x: 1950,
      y: -1200,
      radius: 245,
      dockX: 1710,
      dockY: -1100,
      archStyle: 'windmill_plantation',
      specialty: 'Saffron, Nutmeg & Cinnamon',
      icon: '🌴',
      themeColor: '#10b981',
      sandColor: '#fef08a',
      grassColor: '#22c55e',
      rockColor: '#78716c',
      description: 'Fragrant coral atoll famous for its spinning Dutch windmills, spice warehouses, and crystal-clear lagoon.'
    },
    {
      id: 'sovereign_bastion',
      name: 'Fort Sovereign Bastion',
      region: 'Iron Strait',
      x: -1550,
      y: 1850,
      radius: 250,
      dockX: -1320,
      dockY: 1740,
      archStyle: 'star_fortress',
      specialty: 'Bronze Cannons & Black Powder',
      icon: '🛡️',
      themeColor: '#38bdf8',
      sandColor: '#e7e5e4',
      grassColor: '#14532d',
      rockColor: '#44403c',
      description: 'Impregnable star-shaped naval fortress bristling with coastal artillery and ironworks foundries.'
    },
    {
      id: 'emerald_cay',
      name: 'Emerald Sugar Cay',
      region: 'Windward Tropics',
      x: 2450,
      y: 1450,
      radius: 235,
      dockX: 2210,
      dockY: 1380,
      archStyle: 'waterfall_terraces',
      specialty: 'Refined Sugar & Molasses Casks',
      icon: '🎋',
      themeColor: '#34d399',
      sandColor: '#fef3c7',
      grassColor: '#16a34a',
      rockColor: '#57534e',
      description: 'Steep emerald terraces fed by a cascading mountain waterfall and waterwheel sugar mills.'
    },
    {
      id: 'port_castille',
      name: 'Puerto de Castille',
      region: 'Gilded Coast',
      x: 450,
      y: -2650,
      radius: 255,
      dockX: 450,
      dockY: -2370,
      archStyle: 'spanish_cathedral',
      specialty: 'minted Doubloons & Silver Ingots',
      icon: '⛪',
      themeColor: '#f59e0b',
      sandColor: '#fde68a',
      grassColor: '#15803d',
      rockColor: '#78350f',
      description: 'Ornate Spanish mission port crowned by a twin-belfry white stucco cathedral and royal mint.'
    },
    {
      id: 'blackbeard_roost',
      name: 'Blackbeard\'s Roost',
      region: 'Shipwreck Graveyard',
      x: -3250,
      y: 350,
      radius: 215,
      dockX: -3010,
      dockY: 350,
      archStyle: 'shipwreck_anchorage',
      specialty: 'Salvaged Relics & Cutlasses',
      icon: '⚓',
      themeColor: '#a855f7',
      sandColor: '#d6d3d1',
      grassColor: '#3f6212',
      rockColor: '#1c1917',
      description: 'A perilous anchorage built from the upturned hulls of sunken galleons amidst jagged sea stacks.'
    },
    {
      id: 'sunfire_volcano',
      name: 'Sunfire Caldera Isle',
      region: 'Brimstone Rim',
      x: 3250,
      y: -2850,
      radius: 265,
      dockX: 2990,
      dockY: -2720,
      archStyle: 'volcano_obsidian',
      specialty: 'Obsidian Glass & Brimstone Sulfur',
      icon: '🌋',
      themeColor: '#f97316',
      sandColor: '#44403c',
      grassColor: '#365314',
      rockColor: '#1c1917',
      description: 'Active volcanic peak with glowing lava rivers pouring down basalt cliffs into steaming black-sand docks.'
    },
    {
      id: 'ivory_watchtower',
      name: 'Pharos Ivory Key',
      region: 'Eastern Horizon',
      x: 3400,
      y: 120,
      radius: 210,
      dockX: 3165,
      dockY: 120,
      archStyle: 'pharos_lighthouse',
      specialty: 'Astrolabes, Maps & Fine Silk',
      icon: '🗼',
      themeColor: '#60a5fa',
      sandColor: '#fef9c3',
      grassColor: '#15803d',
      rockColor: '#cbd5e1',
      description: 'Home to the Cartographers\' Guild and a 200-foot white marble Pharos beacon sweeping the eastern sea.'
    },
    {
      id: 'serpent_reef',
      name: 'Serpent\'s Tooth Lagoon',
      region: 'Coral Labyrinth',
      x: -450,
      y: 2950,
      radius: 225,
      dockX: -450,
      dockY: 2700,
      archStyle: 'stilt_village',
      specialty: 'Abyssal Pearls & Ambergris',
      icon: '🦪',
      themeColor: '#ec4899',
      sandColor: '#fbcfe8',
      grassColor: '#047857',
      rockColor: '#475569',
      description: 'Lantern-lit bamboo stilt pavilions suspended above a glowing magenta and turquoise coral reef.'
    },
    {
      id: 'mistral_fjord',
      name: 'Mistral Whaling Outpost',
      region: 'Northern Squalls',
      x: -2950,
      y: -2950,
      radius: 230,
      dockX: -2710,
      dockY: -2820,
      archStyle: 'whaling_outpost',
      specialty: 'Lantern Whale Oil & Pine Timber',
      icon: '🐋',
      themeColor: '#22d3ee',
      sandColor: '#cbd5e1',
      grassColor: '#0f766e',
      rockColor: '#334155',
      description: 'Wind-swept pine island framed by giant whalebone arches, smoking blubber tryworks, and sturdy timber piers.'
    },
    {
      id: 'gallows_atoll',
      name: 'Ghostly Gallows Ruins',
      region: 'Cursed Reaches',
      x: -3100,
      y: 2850,
      radius: 240,
      dockX: -2850,
      dockY: 2720,
      archStyle: 'ancient_monoliths',
      specialty: 'Aztec Idol Gold & Cursed Chests',
      icon: '💀',
      themeColor: '#8b5cf6',
      sandColor: '#a8a29e',
      grassColor: '#115e59',
      rockColor: '#1e1b4b',
      description: 'Misty sunken temple columns and emerald fire braziers where only the boldest captains dare trade.'
    }
  ],

  // Trade Goods Catalog (Payout scales with distance AND number of crates hauled!)
  cargoGoods: [
    { id: 'spices', name: 'East India Saffron & Cloves', icon: '🌶️', baseValuePerCrate: 36, fragility: 'keep_dry' },
    { id: 'rum', name: 'Aged Tortuga Spiced Rum', icon: '🍺', baseValuePerCrate: 32, fragility: 'flammable' },
    { id: 'bullion', name: 'Royal Crown Gold Bullion', icon: '🪙', baseValuePerCrate: 55, fragility: 'heavy_pirate_bait' },
    { id: 'silk', name: 'Imperial Damascus Silk Bolts', icon: '🧶', baseValuePerCrate: 42, fragility: 'keep_dry' },
    { id: 'powder', name: 'Brimstone Black Powder Kegs', icon: '🧨', baseValuePerCrate: 48, fragility: 'explosive' },
    { id: 'pearls', name: 'Lustrous South Sea Pearls', icon: '🦪', baseValuePerCrate: 50, fragility: 'high_value' },
    { id: 'sugar', name: 'Emerald Cane Sugar Loaves', icon: '🍯', baseValuePerCrate: 28, fragility: 'keep_dry' },
    { id: 'relics', name: 'Gilded Aztec Sun Relics', icon: '🗿', baseValuePerCrate: 62, fragility: 'cursed_bait' }
  ],

  // Sailing-Age Charter Personas (For immersive Harbor Master & Wharf Delivery flavor)
  charterClients: [
    {
      name: 'Lord Beckett (East India Trading Co.)',
      note: 'Deliver dry and intact to the Harbor Master\'s crane! Do not let buccaneers delay the King\'s tariff!',
      riskyUnloadHazard: true
    },
    {
      name: 'Madame Ching (Smuggler Queen)',
      note: 'Slip past the patrols and heave the crates onto the back wharf before the revenue cutters spot your sails!',
      riskyUnloadHazard: true
    },
    {
      name: 'Quartermaster Gibbs (Tavern Guild)',
      note: 'The crew has been dry for a fortnight! Bring those rum casks straight to the pier crane without cracking a barrel!',
      riskyUnloadHazard: true
    },
    {
      name: 'Doña Isabella de Castille',
      note: 'Sacred cathedral bells and velvet vestments from across the sea. Moor gently beside the stone quay!',
      riskyUnloadHazard: false
    },
    {
      name: 'Master Artificer Vance (Sovereign Foundry)',
      note: 'Volatile sulfur and ordnance! Keep water off the powder fuses and crane carefully onto the magazine dock!',
      riskyUnloadHazard: true
    },
    {
      name: 'Chief Pearl Diver Kahuna',
      note: 'Lustrous pearls from the deep reef. Meet our outrigger canoes by the lantern pier at high tide!',
      riskyUnloadHazard: false
    }
  ],

  // 4 Legendary Boss Monsters (Triggered as dynamic ocean events — fight for big bucks or outrun!)
  bossMonsters: [
    {
      id: 'kraken',
      name: 'THE ABYSSAL KRAKEN',
      title: '🐙 SCOURGE OF THE DEEP TRENCH',
      maxHp: 520,
      speed: 56,
      bountyGold: 1200,
      bountyScore: 5000,
      escapeDistance: 2100,
      color: '#a855f7',
      accentColor: '#e879f9',
      warningText: '🐙 BOSS EVENT: THE ABYSSAL KRAKEN RISES FROM THE DEEP! SLAY FOR +1,200 GOLD OR OUTRUN IT! 🐙',
      lore: 'Eight towering tentacles and a crushing beak! Sloops without cannons should hoist full sail and outrun its ink vortexes!'
    },
    {
      id: 'dutchman',
      name: 'THE FLYING DUTCHMAN',
      title: '👻 SPECTRAL DREADNOUGHT OF DAVY JONES',
      maxHp: 680,
      speed: 64,
      bountyGold: 1500,
      bountyScore: 6500,
      escapeDistance: 2250,
      color: '#10b981',
      accentColor: '#6ee7b7',
      warningText: '👻 BOSS EVENT: THE FLYING DUTCHMAN EMERGES FROM CURSED FOG! +1,500 GOLD BOUNTY OR FLEE! 👻',
      lore: 'A glowing emerald ghost galleon firing triple broadsides of spectral chain-shot!'
    },
    {
      id: 'megalodon',
      name: 'CRIMSON JAWS MEGALODON',
      title: '🦈 ANCIENT APEX TITAN OF THE REEF',
      maxHp: 460,
      speed: 73,
      bountyGold: 1000,
      bountyScore: 4200,
      escapeDistance: 2050,
      color: '#ef4444',
      accentColor: '#fca5a5',
      warningText: '🦈 BOSS EVENT: CRIMSON JAWS MEGALODON IS STALKING YOUR WAKE! +1,000 GOLD BOUNTY! 🦈',
      lore: 'Charges at blistering speed! Use Anchor-Drift [SPACE] to dodge its jaws and broadside its flank!'
    },
    {
      id: 'leviathan',
      name: 'AZURE LEVIATHAN SERPENT',
      title: '🐉 EMPEROR DRAGON OF THE MAELSTROM',
      maxHp: 820,
      speed: 62,
      bountyGold: 1800,
      bountyScore: 8000,
      escapeDistance: 2300,
      color: '#06b6d4',
      accentColor: '#fde047',
      warningText: '🐉 BOSS EVENT: THE AZURE LEVIATHAN SEA SERPENT AWAKENS! +1,800 GOLD JACKPOT OR RUN! 🐉',
      lore: 'Colossal multi-segmented sea dragon that hurls storm-lightning orbs across the waves!'
    }
  ]
};

// Procedurally generate deterministic Archipelago Obstacles (Sea Stacks, Coral Reefs, Whirlpools, Powder Mines)
(function generateArchipelagoHazards() {
  const data = window.CORSAIR_DATA;
  const islands = data.islands;

  // Deterministic PRNG so map layout is consistent
  let seed = 171507;
  function rand() {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  }

  function isClearOfIslands(x, y, minBuffer) {
    for (const isl of islands) {
      const d = Math.hypot(x - isl.x, y - isl.y);
      if (d < isl.radius + minBuffer) return false;
      const dDock = Math.hypot(x - isl.dockX, y - isl.dockY);
      if (dDock < 240) return false;
    }
    return true;
  }

  data.seaStacks = [];
  data.coralReefs = [];
  data.whirlpools = [];
  data.floatingMines = [];

  // 1. 75 Jagged 3D Basalt Sea Stacks & Crashing Rocks
  for (let i = 0; i < 160 && data.seaStacks.length < 75; i++) {
    const x = (rand() - 0.5) * 7600;
    const y = (rand() - 0.5) * 7600;
    if (!isClearOfIslands(x, y, 220)) continue;
    data.seaStacks.push({
      id: `rock_${data.seaStacks.length}`,
      x: Math.round(x),
      y: Math.round(y),
      radius: Math.round(28 + rand() * 34),
      height: Math.round(45 + rand() * 65),
      spires: 2 + Math.floor(rand() * 3),
      tone: rand() > 0.5 ? '#44403c' : '#292524'
    });
  }

  // 2. 42 Razor Coral Reefs & Sandbars (Slow ships & scrape hulls without Copper Keel)
  for (let i = 0; i < 110 && data.coralReefs.length < 42; i++) {
    const x = (rand() - 0.5) * 7400;
    const y = (rand() - 0.5) * 7400;
    if (!isClearOfIslands(x, y, 200)) continue;
    data.coralReefs.push({
      id: `reef_${data.coralReefs.length}`,
      x: Math.round(x),
      y: Math.round(y),
      radius: Math.round(65 + rand() * 55),
      coralColor: ['#f472b6', '#fb923c', '#a78bfa', '#2dd4bf'][Math.floor(rand() * 4)]
    });
  }

  // 3. 10 Spinning Maelstroms / Whirlpools
  for (let i = 0; i < 50 && data.whirlpools.length < 10; i++) {
    const x = (rand() - 0.5) * 6800;
    const y = (rand() - 0.5) * 6800;
    if (!isClearOfIslands(x, y, 420)) continue;
    data.whirlpools.push({
      id: `vortex_${data.whirlpools.length}`,
      x: Math.round(x),
      y: Math.round(y),
      radius: Math.round(115 + rand() * 45),
      pullStrength: 55 + rand() * 25,
      spinDir: rand() > 0.5 ? 1 : -1
    });
  }

  // 4. 36 Floating Sea Mines / Powder Keg Traps (Can be shot with cannons or avoided!)
  for (let i = 0; i < 90 && data.floatingMines.length < 36; i++) {
    const x = (rand() - 0.5) * 7200;
    const y = (rand() - 0.5) * 7200;
    if (!isClearOfIslands(x, y, 260)) continue;
    data.floatingMines.push({
      id: `mine_${data.floatingMines.length}`,
      x: Math.round(x),
      y: Math.round(y),
      radius: 14,
      active: true,
      respawnTimer: 0
    });
  }
})();
