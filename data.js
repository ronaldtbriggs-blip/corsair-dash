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

  // 10 Ship Tiers: Starting at Tier 1 (Coastal Sloop) + 9 more upgrade tiers up to Celestial Sovereign Ark (20 Slots)
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
      description: '4 golden-rigged masts, triple gun decks, gilded stern lanterns, and 12 modular loadout slots.'
    },
    {
      level: 7,
      id: 'treasure_galleon',
      name: 'Imperial Treasure Galleon',
      subtitle: 'Tier VII • Crown Armada Flagship',
      cost: 15000,
      maxSlots: 14,
      baseHull: 1050,
      baseSpeed: 76,
      baseAccel: 85,
      baseTurn: 2.35,
      baseCargo: 20,
      baseCannonsPerSide: 11,
      masts: 4,
      length: 80,
      width: 33,
      hullColor: '#3b1d0e',
      trimColor: '#fde047',
      sailColor: '#fef3c7',
      description: 'Colossal Spanish-style treasure galleon with vaulted bullion holds, royal sterncastles, and 14 loadout slots.'
    },
    {
      level: 8,
      id: 'steam_ironclad',
      name: 'Steam-Assisted Ironclad',
      subtitle: 'Tier VIII • Paddle-Wheel War Frigate',
      cost: 30000,
      maxSlots: 16,
      baseHull: 1550,
      baseSpeed: 82,
      baseAccel: 94,
      baseTurn: 2.50,
      baseCargo: 26,
      baseCannonsPerSide: 14,
      masts: 3,
      paddleWheels: true,
      length: 84,
      width: 34,
      hullColor: '#1e293b',
      trimColor: '#38bdf8',
      sailColor: '#e2e8f0',
      description: 'Riveted iron hull plates and twin coal-fired brass paddlewheels alongside full sails! 16 loadout slots.'
    },
    {
      level: 9,
      id: 'kraken_dreadnought',
      name: 'Krakenbone Dreadnought',
      subtitle: 'Tier IX • Abyssal Monster Hunter',
      cost: 60000,
      maxSlots: 18,
      baseHull: 2300,
      baseSpeed: 86,
      baseAccel: 98,
      baseTurn: 2.60,
      baseCargo: 34,
      baseCannonsPerSide: 18,
      masts: 4,
      boneRam: true,
      length: 90,
      width: 36,
      hullColor: '#2e1065',
      trimColor: '#c084fc',
      sailColor: '#f3e8ff',
      description: 'Forged from slain sea-monster ribs and leviathan scales! Armed with an abyssal bow-ram and 18 loadout slots.'
    },
    {
      level: 10,
      id: 'celestial_ark',
      name: 'Celestial Sovereign Ark',
      subtitle: 'Tier X • Mythic Apex of the Endless Seas',
      cost: 120000,
      maxSlots: 20,
      baseHull: 3500,
      baseSpeed: 92,
      baseAccel: 106,
      baseTurn: 2.75,
      baseCargo: 48,
      baseCannonsPerSide: 24,
      masts: 5,
      celestialAura: true,
      length: 98,
      width: 38,
      hullColor: '#422006',
      trimColor: '#fde047',
      sailColor: '#fef08a',
      description: 'The ultimate 5-masted mythic flagship! Shimmering astral sails, 48-gun broadsides, and the maximum 20 loadout slots!'
    }
  ],

  // 5 Rarity Levels for Loadout Modules:
  // 'basic' is always available in the standard catalog with no extra special sauce.
  // Random rotating Dockyard Market offers roll Uncommon, Rare, Epic, and Legendary versions with multiplied stats & special abilities!
  moduleRarities: {
    basic: {
      id: 'basic',
      name: 'BASIC',
      badge: '⚪ BASIC',
      color: '#94a3b8',
      borderColor: '#475569',
      bgGradient: 'linear-gradient(180deg, #1e293b, #0f172a)',
      statMult: 1.0,
      costMult: 1.0,
      rollWeight: 0
    },
    uncommon: {
      id: 'uncommon',
      name: 'UNCOMMON',
      badge: '🟢 UNCOMMON',
      color: '#4ade80',
      borderColor: '#22c55e',
      bgGradient: 'linear-gradient(180deg, #064e3b, #022c22)',
      statMult: 1.35,
      costMult: 1.45,
      rollWeight: 42
    },
    rare: {
      id: 'rare',
      name: 'RARE',
      badge: '🔵 RARE',
      color: '#38bdf8',
      borderColor: '#0284c7',
      bgGradient: 'linear-gradient(180deg, #0c4a6e, #082f49)',
      statMult: 1.75,
      costMult: 2.15,
      rollWeight: 32
    },
    epic: {
      id: 'epic',
      name: 'EPIC',
      badge: '🟣 EPIC',
      color: '#c084fc',
      borderColor: '#9333ea',
      bgGradient: 'linear-gradient(180deg, #3b0764, #1e1b4b)',
      statMult: 2.35,
      costMult: 3.25,
      rollWeight: 18
    },
    legendary: {
      id: 'legendary',
      name: 'LEGENDARY',
      badge: '🟡 LEGENDARY',
      color: '#fde047',
      borderColor: '#eab308',
      bgGradient: 'linear-gradient(180deg, #713f12, #422006)',
      statMult: 3.25,
      costMult: 4.80,
      rollWeight: 8
    }
  },

  // 14 Unique Loadout Modules:
  // Available as Basic (no special sauce) anytime, OR rolled in the Rotating Rarity Market with multiplied bonuses & special abilities!
  loadoutModules: [
    {
      id: 'cargo_hold',
      name: 'Expanded Cargo Hold',
      icon: '📦',
      category: 'TRADE',
      cost: 120,
      slotCost: 1,
      shortStat: '+3 Cargo Crates • -2% Speed',
      description: 'Adds +3 Cargo Crate capacity so contracts pay more gold, though extra weight trims top speed by -2%.',
      effects: {
        cargoBonus: 3,
        speedMult: -0.02,
        payoutBonus: 0.12
      },
      rarityPerks: {
        uncommon: {
          title: 'Reinforced Cedar Hold',
          sauce: '✨ Removes the -2% weight speed penalty!',
          bonusEffects: { speedMult: 0.02 }
        },
        rare: {
          title: 'Smuggler\'s False-Bottom Hold',
          sauce: '✨ Zero weight penalty + +10% extra Charter Gold!',
          bonusEffects: { speedMult: 0.03, payoutBonus: 0.10 }
        },
        epic: {
          title: 'East India Vaulted Hold',
          sauce: '✨ Grants +5% Sailing Speed & +20% Charter Payouts!',
          bonusEffects: { speedMult: 0.07, payoutBonus: 0.20 }
        },
        legendary: {
          title: 'Bottomless Dimensional Hold',
          sauce: '🔥 LEGENDARY SAUCE: +10 Crates, +8% Speed & +40% Charter Gold!',
          bonusEffects: { cargoBonus: 1, speedMult: 0.10, payoutBonus: 0.40 }
        }
      }
    },
    {
      id: 'cannon_battery',
      name: 'Broadside Cannon Battery',
      icon: '💣',
      category: 'OFFENSE',
      cost: 150,
      slotCost: 1,
      shortStat: '+1 Gun/Side • +22 Damage',
      description: 'Mounts heavy 24-pounder brass cannons on port and starboard decks for blasting pirate packs and sea monsters.',
      effects: {
        cannonsPerSide: 1,
        cannonDamage: 22,
        reloadReduction: 0.10
      },
      rarityPerks: {
        uncommon: {
          title: 'Long-Nine Bronze Battery',
          sauce: '✨ +15% Cannonball Range & Velocity!',
          bonusEffects: { cannonRangeMult: 0.15 }
        },
        rare: {
          title: 'Double-Shotted Culverin Deck',
          sauce: '✨ Cannonballs pierce & ignite targets for +15 burn damage!',
          bonusEffects: { cannonDamage: 15, burnDamage: 12 }
        },
        epic: {
          title: 'Obsidian Hellfire Battery',
          sauce: '✨ Volleys explode on impact & chain +35 lightning damage to nearby foes!',
          bonusEffects: { cannonDamage: 28, chainLightning: 35 }
        },
        legendary: {
          title: 'Sovereign Dragon-Breath Battery',
          sauce: '🔥 LEGENDARY SAUCE: Fires Hellfire & Chain-Lightning salvos (+65 Chain Dmg & -25% Reload)!',
          bonusEffects: { cannonsPerSide: 1, cannonDamage: 40, reloadReduction: 0.15, chainLightning: 65, burnDamage: 25 }
        }
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
      description: '360-degree brass swivel guns that automatically target and fire at the closest pirate or boss monster!',
      effects: {
        swivelGuns: 1,
        cannonRangeMult: 0.20
      },
      rarityPerks: {
        uncommon: {
          title: 'Rifled Brass Swivel',
          sauce: '✨ +25% Auto-Turret Fire Rate!',
          bonusEffects: { swivelFireRateMult: 0.25 }
        },
        rare: {
          title: 'Twin Clockwork Culverin',
          sauce: '✨ Fires high-velocity armor-piercing bolts (+20 Dmg)!',
          bonusEffects: { cannonDamage: 20, swivelFireRateMult: 0.35 }
        },
        epic: {
          title: 'Aegis Interceptor Turret',
          sauce: '✨ Point-Defense: shoots down 1 incoming enemy cannonball every 2.5s!',
          bonusEffects: { pointDefense: 1, swivelFireRateMult: 0.50 }
        },
        legendary: {
          title: 'Vulcan Gatling Repeater',
          sauce: '🔥 LEGENDARY SAUCE: Rapid-fire auto-turret + shoots down incoming enemy & boss projectiles!',
          bonusEffects: { swivelGuns: 2, pointDefense: 2, cannonDamage: 35, swivelFireRateMult: 0.85 }
        }
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
      description: 'Bolts thick seasoned live-oak and iron plates over the waterline, boosting Max Hull and deflecting enemy shot.',
      effects: {
        hullBonus: 95,
        damageReduction: 0.12
      },
      rarityPerks: {
        uncommon: {
          title: ' Tempered Steel Belt',
          sauce: '✨ +2.0 Hull HP/sec passive hull reinforcement!',
          bonusEffects: { regenPerSec: 2.0 }
        },
        rare: {
          title: 'Spiked Bulwark Armor',
          sauce: '✨ Reflects 30% of enemy damage back at attackers!',
          bonusEffects: { thornsReflect: 0.30 }
        },
        epic: {
          title: 'Kraken-Chitin Fortress Hull',
          sauce: '✨ Reflects 50% damage back at attackers + +5 HP/s regen!',
          bonusEffects: { thornsReflect: 0.50, regenPerSec: 5.0 }
        },
        legendary: {
          title: 'Immortal Leviathan-Scale Aegis',
          sauce: '🔥 LEGENDARY SAUCE: +350 Hull, -25% Dmg Taken & reflects 80% of damage back at enemies!',
          bonusEffects: { hullBonus: 60, damageReduction: 0.10, thornsReflect: 0.80, regenPerSec: 8.0 }
        }
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
      description: 'Fine outlaw silk canvas that catches the faintest breeze. Boosts top speed and cuts headwind penalty.',
      effects: {
        speedMult: 0.11,
        accelMult: 0.15,
        windEfficiency: 0.18
      },
      rarityPerks: {
        uncommon: {
          title: 'Tradewind Spinnaker Rig',
          sauce: '✨ +15% Turn Agility while under full sail!',
          bonusEffects: { turnMult: 0.15 }
        },
        rare: {
          title: 'Storm-Weaver Canvas',
          sauce: '✨ +35% Headwind Resistance & +10% Charter Payout!',
          bonusEffects: { windEfficiency: 0.25, payoutBonus: 0.10 }
        },
        epic: {
          title: 'Gale-Lord Winged Rigging',
          sauce: '✨ Near-total Headwind Immunity (90%) + +18% Turn Rate!',
          bonusEffects: { windEfficiency: 0.55, turnMult: 0.18 }
        },
        legendary: {
          title: 'Astral Zephyr Cloud-Sails',
          sauce: '🔥 LEGENDARY SAUCE: 100% Headwind Immunity (sail full speed into any gale) + +15% Extra Speed!',
          bonusEffects: { speedMult: 0.12, windEfficiency: 1.0, turnMult: 0.25 }
        }
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
      description: 'Copper hull sheathing and balanced helm tackle. Increases turning agility and prevents coral reef scraping.',
      effects: {
        turnMult: 0.22,
        reefProtection: 0.65
      },
      rarityPerks: {
        uncommon: {
          title: 'Bronze Fin Keel',
          sauce: '✨ 100% Coral Reef Immunity + +6% Speed!',
          bonusEffects: { reefProtection: 0.35, speedMult: 0.06 }
        },
        rare: {
          title: 'Sawtooth Boarding Prow',
          sauce: '✨ Ramming pirate ships slices their hull for 65 damage!',
          bonusEffects: { ramDamage: 65, reefProtection: 0.35 }
        },
        epic: {
          title: 'Maelstrom Gyro-Keel',
          sauce: '✨ 75% Whirlpool Immunity + 110 Ramming Damage!',
          bonusEffects: { whirlpoolResist: 0.75, ramDamage: 110, reefProtection: 0.35 }
        },
        legendary: {
          title: 'Orichalcum Leviathan-Cutter Keel',
          sauce: '🔥 LEGENDARY SAUCE: 100% Reef & Whirlpool Immunity + Anchor-Drift Ramming deals 200 Damage!',
          bonusEffects: { reefProtection: 1.0, whirlpoolResist: 1.0, ramDamage: 200, speedMult: 0.10 }
        }
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
      description: 'Veteran shipwrights who plug cannonball holes and splice rigging while underway, restoring Hull HP every second.',
      effects: {
        regenPerSec: 4.0
      },
      rarityPerks: {
        uncommon: {
          title: 'Royal Dockyard Surgeons',
          sauce: '✨ Also reinforces Max Hull by +60 HP!',
          bonusEffects: { hullBonus: 60 }
        },
        rare: {
          title: 'Dwarven Iron-Wright Crew',
          sauce: '✨ +100 Max Hull HP & -8% Damage Taken!',
          bonusEffects: { hullBonus: 100, damageReduction: 0.08 }
        },
        epic: {
          title: 'Spectral Repair Spirits',
          sauce: '✨ Repairs timbers AND speeds up Cannon Reload by +15%!',
          bonusEffects: { hullBonus: 140, reloadReduction: 0.15 }
        },
        legendary: {
          title: 'Immortal Shipwright Guild',
          sauce: '🔥 LEGENDARY SAUCE: Massive Hull Regen + +220 Max Hull & -15% Damage Taken!',
          bonusEffects: { regenPerSec: 6.0, hullBonus: 220, damageReduction: 0.15 }
        }
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
      description: 'Jettisons floating Greek Fire powder kegs off your stern [E] that detonate on pursuing pirates and bosses.',
      effects: {
        fireBarrels: 1,
        barrelDamage: 85
      },
      rarityPerks: {
        uncommon: {
          title: 'Naphtha Pitch Kegs',
          sauce: '✨ +40 Barrel Blast Damage & wider explosion radius!',
          bonusEffects: { barrelDamage: 40 }
        },
        rare: {
          title: 'Magnetic Lodestone Mines',
          sauce: '✨ Dropped barrels drift magnetically toward nearby pirates!',
          bonusEffects: { barrelMagnet: 1, barrelDamage: 65 }
        },
        epic: {
          title: 'Auto-Dispenser Stern Chute',
          sauce: '✨ Automatically drops a free Greek Fire barrel every 5 seconds while chased!',
          bonusEffects: { barrelAutoDrop: 1, barrelMagnet: 1, barrelDamage: 90 }
        },
        legendary: {
          title: 'Cataclysmic Maelstrom Kegs',
          sauce: '🔥 LEGENDARY SAUCE: Auto-drops magnetic cluster mines that deal massive AoE damage!',
          bonusEffects: { fireBarrels: 2, barrelAutoDrop: 1, barrelMagnet: 1, barrelDamage: 160 }
        }
      }
    },
    {
      id: 'harpoon_winch',
      name: 'Grappling Harpoon Winch',
      icon: '🧲',
      category: 'TACTICAL',
      cost: 190,
      slotCost: 1,
      shortStat: '+180m Plunder Magnet • +25% Salvage Gold',
      description: 'reels in floating salvage plunder chests from afar and pries open hidden doubloon compartments!',
      effects: {
        magnetRadius: 180,
        salvageGoldBonus: 0.25
      },
      rarityPerks: {
        uncommon: {
          title: 'Barbed Whaler Winch',
          sauce: '✨ Scooping a chest also repairs +20 Hull HP!',
          bonusEffects: { chestHeal: 20 }
        },
        rare: {
          title: 'Golden Grapnel Reel',
          sauce: '✨ +40% Salvage Gold & +30 Hull HP repaired per chest!',
          bonusEffects: { salvageGoldBonus: 0.25, chestHeal: 30 }
        },
        epic: {
          title: 'Lodestone Treasure Vacuum',
          sauce: '✨ Pulls chests across huge distances + +60% Chest Gold!',
          bonusEffects: { magnetRadius: 180, salvageGoldBonus: 0.45, chestHeal: 45 }
        },
        legendary: {
          title: 'Poseidon\'s Abyssal Grapnel',
          sauce: '🔥 LEGENDARY SAUCE: Map-wide 650m Chest Magnet, Double Salvage Gold & +60 Hull Repair per chest!',
          bonusEffects: { magnetRadius: 300, salvageGoldBonus: 0.85, chestHeal: 60 }
        }
      }
    },
    {
      id: 'chain_shot',
      name: 'Chain-Shot Dismasting Rig',
      icon: '⛓️',
      category: 'OFFENSE',
      cost: 210,
      slotCost: 1,
      shortStat: 'Snare Enemy Sails (-30% Speed) • +15 Dmg',
      description: 'Twin iron balls linked by heavy chain that shred enemy rigging, slowing hit pirates and bosses by 30%!',
      effects: {
        cannonDamage: 15,
        slowEffect: 0.30
      },
      rarityPerks: {
        uncommon: {
          title: 'Barbed Chain-Shot',
          sauce: '✨ Also reduces Cannon Reload time by -10%!',
          bonusEffects: { reloadReduction: 0.10 }
        },
        rare: {
          title: 'Cursed Shackles Shot',
          sauce: '✨ Cripples target speed by 45% & adds +20 Cannon Damage!',
          bonusEffects: { slowEffect: 0.15, cannonDamage: 20 }
        },
        epic: {
          title: 'Davy Jones Anchor-Chain',
          sauce: '✨ +1 Extra Gun/Side & snares targets by 55%!',
          bonusEffects: { cannonsPerSide: 1, slowEffect: 0.25, cannonDamage: 30 }
        },
        legendary: {
          title: 'Titan-Binder Mythic Chains',
          sauce: '🔥 LEGENDARY SAUCE: Locks down enemy ships & slows Boss Monsters by 65% + +50 Damage!',
          bonusEffects: { cannonsPerSide: 1, slowEffect: 0.35, cannonDamage: 50, reloadReduction: 0.15 }
        }
      }
    },
    {
      id: 'steam_boiler',
      name: 'Dwarven Steam Boiler',
      icon: '⚙️',
      category: 'SPEED',
      cost: 280,
      slotCost: 1,
      shortStat: '+10% Speed • +22% Accel • -35% Headwind',
      description: 'Pressurized coal-fired auxiliary steam engine that powers through dead calms and headwinds with raw torque.',
      effects: {
        speedMult: 0.10,
        accelMult: 0.22,
        windEfficiency: 0.35
      },
      rarityPerks: {
        uncommon: {
          title: 'High-Pressure Brass Boiler',
          sauce: '✨ Adds +60 Hull HP from iron boiler casing!',
          bonusEffects: { hullBonus: 60 }
        },
        rare: {
          title: 'Twin-Piston Overdrive Engine',
          sauce: '✨ +50% Whirlpool Escape Thrust & +8% Extra Speed!',
          bonusEffects: { whirlpoolResist: 0.50, speedMult: 0.08 }
        },
        epic: {
          title: 'Brimstone Magma Core',
          sauce: '✨ Ramming enemies releases a steam blast for +90 Damage!',
          bonusEffects: { ramDamage: 90, speedMult: 0.12 }
        },
        legendary: {
          title: 'Sunforged Perpetual Reactor',
          sauce: '🔥 LEGENDARY SAUCE: +35% Speed, 100% Headwind/Whirlpool Immunity & +150 Steam Ram Damage!',
          bonusEffects: { speedMult: 0.16, windEfficiency: 1.0, whirlpoolResist: 1.0, ramDamage: 150 }
        }
      }
    },
    {
      id: 'alchemist_mortar',
      name: 'Alchemist\'s Mortar Bombard',
      icon: '☄️',
      category: 'OFFENSE',
      cost: 310,
      slotCost: 1,
      shortStat: 'Auto-Lobs AoE Explosive Shells (48 Dmg)',
      description: 'Heavy deck mortar that automatically lobs high-arcing alchemical firebombs at nearby enemy clusters!',
      effects: {
        mortarGuns: 1,
        mortarDamage: 48
      },
      rarityPerks: {
        uncommon: {
          title: 'Siege Bronze Bombard',
          sauce: '✨ +25% Mortar Blast Radius & Range!',
          bonusEffects: { cannonRangeMult: 0.20 }
        },
        rare: {
          title: 'Wildfire Cluster Mortar',
          sauce: '✨ Shells leave burning pitch on impact (+25 Burn Damage)!',
          bonusEffects: { mortarDamage: 25, burnDamage: 20 }
        },
        epic: {
          title: 'Volcanic Caldera Howitzer',
          sauce: '✨ Fires twin mortar shells per salvo with huge AoE!',
          bonusEffects: { mortarGuns: 1, mortarDamage: 45 }
        },
        legendary: {
          title: 'Apocalypse Star-Fall Bombard',
          sauce: '🔥 LEGENDARY SAUCE: Rains triple meteor-fire shells across the sea (+140 AoE Dmg)!',
          bonusEffects: { mortarGuns: 2, mortarDamage: 90, chainLightning: 45 }
        }
      }
    },
    {
      id: 'siren_figurehead',
      name: 'Siren\'s Enchanted Figurehead',
      icon: '🧜‍♀️',
      category: 'DEFENSE',
      cost: 240,
      slotCost: 1,
      shortStat: '-55% Vortex Pull • +15% Charter Gold',
      description: 'Carved gilded figurehead blessed by sea nymphs. Calms whirlpools, inspires merchants, and wards the hull.',
      effects: {
        whirlpoolResist: 0.55,
        payoutBonus: 0.15,
        damageReduction: 0.08
      },
      rarityPerks: {
        uncommon: {
          title: 'Pearl-Crowned Nymph',
          sauce: '✨ +2.5 Hull HP/sec ocean blessing regeneration!',
          bonusEffects: { regenPerSec: 2.5 }
        },
        rare: {
          title: 'Valkyrie of the Tides',
          sauce: '✨ 100% Whirlpool Immunity + +15% Bounty Gold!',
          bonusEffects: { whirlpoolResist: 0.50, bountyBonus: 0.15 }
        },
        epic: {
          title: 'Goddess Amphitrite Figurehead',
          sauce: '✨ +5 HP/s Hull Regen, -15% Damage Taken & +25% Payouts!',
          bonusEffects: { regenPerSec: 5.0, damageReduction: 0.08, payoutBonus: 0.15 }
        },
        legendary: {
          title: 'Queen Calypso\'s Sovereign Idol',
          sauce: '🔥 LEGENDARY SAUCE: 100% Hazard Immunity, +8 HP/s Regen & +45% All Gold Earned!',
          bonusEffects: { whirlpoolResist: 1.0, reefProtection: 1.0, regenPerSec: 8.0, payoutBonus: 0.30, bountyBonus: 0.30 }
        }
      }
    },
    {
      id: 'letter_of_marque',
      name: 'Royal Letter of Marque',
      icon: '📜',
      category: 'TRADE',
      cost: 275,
      slotCost: 1,
      shortStat: '+30% Pirate/Boss Bounties • +15% Score',
      description: 'Official Admiralty commission authorizing privateer prize bounties for every pirate ship and sea monster slain!',
      effects: {
        bountyBonus: 0.30,
        payoutBonus: 0.12,
        scoreBonus: 0.15
      },
      rarityPerks: {
        uncommon: {
          title: 'Governor\'s Prize Seal',
          sauce: '✨ +1 Extra Cargo Crate Space for royal dispatches!',
          bonusEffects: { cargoBonus: 1 }
        },
        rare: {
          title: 'Viceroy\'s Golden Charter',
          sauce: '✨ +2 Cargo Crates & +25% Extra Boss Bounty Gold!',
          bonusEffects: { cargoBonus: 2, bountyBonus: 0.25 }
        },
        epic: {
          title: 'Grand Admiral\'s Signet',
          sauce: '✨ +3 Cargo Crates, +40% Bounties & +25% Arcade Score!',
          bonusEffects: { cargoBonus: 3, bountyBonus: 0.40, scoreBonus: 0.25 }
        },
        legendary: {
          title: 'Crown Sovereign Writ of Empire',
          sauce: '🔥 LEGENDARY SAUCE: DOUBLES all Pirate & Boss Bounties, +4 Cargo Crates & +50% Arcade Score!',
          bonusEffects: { cargoBonus: 4, bountyBonus: 0.75, payoutBonus: 0.30, scoreBonus: 0.50 }
        }
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
      specialty: 'Minted Doubloons & Silver Ingots',
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

  // Sailing-Age Charter Personas
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

  // 7 Legendary Boss Monsters (Slaying all 7 wins the Campaign & recycles the Boss Gauntlet with Ascended Mutator Buffs!)
  bossMonsters: [
    {
      id: 'kraken',
      icon: '🐙',
      name: 'THE ABYSSAL KRAKEN',
      title: '🐙 SCOURGE OF THE DEEP TRENCH',
      maxHp: 520,
      speed: 56,
      bountyGold: 1200,
      bountyScore: 5000,
      escapeDistance: 2100,
      color: '#a855f7',
      accentColor: '#e879f9',
      warningText: '🐙 BOSS EVENT (1/7): THE ABYSSAL KRAKEN RISES FROM THE DEEP! SLAY FOR +1,200G OR OUTRUN IT!',
      lore: 'Eight towering tentacles and a crushing beak! Sloops without cannons should hoist full sail and outrun its ink vortexes!'
    },
    {
      id: 'dutchman',
      icon: '👻',
      name: 'THE FLYING DUTCHMAN',
      title: '👻 SPECTRAL DREADNOUGHT OF DAVY JONES',
      maxHp: 680,
      speed: 64,
      bountyGold: 1500,
      bountyScore: 6500,
      escapeDistance: 2250,
      color: '#10b981',
      accentColor: '#6ee7b7',
      warningText: '👻 BOSS EVENT (2/7): THE FLYING DUTCHMAN EMERGES FROM CURSED FOG! +1,500G BOUNTY OR FLEE!',
      lore: 'A glowing emerald ghost galleon firing wide broadsides of spectral chain-shot!'
    },
    {
      id: 'megalodon',
      icon: '🦈',
      name: 'CRIMSON JAWS MEGALODON',
      title: '🦈 ANCIENT APEX TITAN OF THE REEF',
      maxHp: 460,
      speed: 73,
      bountyGold: 1000,
      bountyScore: 4200,
      escapeDistance: 2050,
      color: '#ef4444',
      accentColor: '#fca5a5',
      warningText: '🦈 BOSS EVENT (3/7): CRIMSON JAWS MEGALODON IS STALKING YOUR WAKE! +1,000G BOUNTY!',
      lore: 'Charges at blistering speed! Use Anchor-Drift [SPACE] to dodge its jaws and broadside its flank!'
    },
    {
      id: 'leviathan',
      icon: '🐉',
      name: 'AZURE LEVIATHAN SERPENT',
      title: '🐉 EMPEROR DRAGON OF THE MAELSTROM',
      maxHp: 820,
      speed: 62,
      bountyGold: 1800,
      bountyScore: 8000,
      escapeDistance: 2300,
      color: '#06b6d4',
      accentColor: '#fde047',
      warningText: '🐉 BOSS EVENT (4/7): THE AZURE LEVIATHAN SEA SERPENT AWAKENS! +1,800G JACKPOT OR RUN!',
      lore: 'Colossal multi-segmented sea dragon that hurls storm-lightning orbs across the waves!'
    },
    {
      id: 'karkinos',
      icon: '🦀',
      name: 'KARKINOS THE REEF TITAN',
      title: '🦀 OBSIDIAN CARAPACE EMPEROR CRAB',
      maxHp: 960,
      speed: 58,
      bountyGold: 2200,
      bountyScore: 9500,
      escapeDistance: 2350,
      color: '#f97316',
      accentColor: '#fde047',
      warningText: '🦀 BOSS EVENT (5/7): KARKINOS THE COLOSSAL REEF TITAN CLAWS UP FROM THE CALDERA! +2,200G BOUNTY!',
      lore: 'Armored volcanic crustacean with crushing obsidian pincers, mortar bubble salvos, and periodic shell hardening!'
    },
    {
      id: 'charybdis',
      icon: '🌪️',
      name: 'CHARYBDIS LIVING MAELSTROM',
      title: '🌪️ DEVOURING VORTEX BEAST OF THE ELDER SEA',
      maxHp: 1150,
      speed: 54,
      bountyGold: 2600,
      bountyScore: 11500,
      escapeDistance: 2400,
      color: '#38bdf8',
      accentColor: '#c084fc',
      warningText: '🌪️ BOSS EVENT (6/7): CHARYBDIS THE LIVING MAELSTROM OPENS ITS ABYSSAL MAW! +2,600G BOUNTY!',
      lore: 'Sentient tooth-ringed whirlpool monster that drags ships toward its jaws while firing radial water-spout geysers!'
    },
    {
      id: 'armada_flagship',
      icon: '👑',
      name: 'EL DORADO SOLAR DREADNOUGHT',
      title: '👑 GOLDEN IMPERIAL TITAN-FORTRESS OF THE SUN',
      maxHp: 1450,
      speed: 65,
      bountyGold: 3200,
      bountyScore: 15000,
      escapeDistance: 2500,
      color: '#eab308',
      accentColor: '#fef08a',
      warningText: '👑 BOSS EVENT (7/7): EL DORADO SOLAR ARMADA DREADNOUGHT CHALLENGES YOUR SOVEREIGNTY! +3,200G!',
      lore: 'Five-masted golden citadel flagship firing sweeping 8-gun broadsides and solar mortar barrages!'
    }
  ],

  // Recycled Boss Mutator Prefixes for Cycle II, III, IV+ (Endless Roguelike Scaling!)
  bossCycleMutators: [
    { prefix: 'AWAKENED', buffLabel: 'Normal Campaign Tier', hpMult: 1.0, speedMult: 1.0, dmgMult: 1.0, bountyMult: 1.0, extraProj: 0 },
    { prefix: 'ENRAGED', buffLabel: '+50% HP • +25% Fury Speed & Extra Volley Shots', hpMult: 1.5, speedMult: 1.12, dmgMult: 1.3, bountyMult: 1.65, extraProj: 1 },
    { prefix: 'HELLFORGED', buffLabel: '+110% HP • Vampiric Regeneration & +60% Damage', hpMult: 2.1, speedMult: 1.20, dmgMult: 1.6, bountyMult: 2.4, extraProj: 2, regenPerSec: 12 },
    { prefix: 'ABYSSAL ELDER', buffLabel: '+185% HP • Maelstrom Gravity Aura & Double Barrages', hpMult: 2.85, speedMult: 1.28, dmgMult: 2.0, bountyMult: 3.4, extraProj: 3, regenPerSec: 22, gravityPull: 42 },
    { prefix: 'APOCALYPTIC', buffLabel: 'Mythic Endless Scaling (+280% HP & Cataclysmic Volleys)', hpMult: 3.8, speedMult: 1.35, dmgMult: 2.5, bountyMult: 5.0, extraProj: 4, regenPerSec: 35, gravityPull: 65 }
  ],

  // 16 Maritime Achievements (Persisted in localStorage, viewable from Title Screen & In-Game)
  achievementsCatalog: [
    { id: 'first_delivery', icon: '⚓', title: 'First Charter Signed', desc: 'Complete your first island-to-island cargo delivery.', rewardGold: 100, rewardScore: 500 },
    { id: 'pacifist_smuggler', icon: '🕊️', title: 'Smuggler\'s Grace', desc: 'Complete 3 deliveries with 0 offensive weapon modules equipped.', rewardGold: 250, rewardScore: 1200 },
    { id: 'merchant_prince', icon: '📦', title: 'Merchant Prince', desc: 'Haul 50 total cargo crates across the archipelago.', rewardGold: 400, rewardScore: 2000 },
    { id: 'pirate_hunter_15', icon: '🏴‍☠️', title: 'Scourge of Tortuga', desc: 'Sink 15 pirate vessels in naval combat.', rewardGold: 300, rewardScore: 1500 },
    { id: 'pirate_hunter_50', icon: '💀', title: 'Black Armada Breaker', desc: 'Sink 50 pirate vessels across your voyages.', rewardGold: 800, rewardScore: 4000 },
    { id: 'slay_kraken', icon: '🐙', title: 'Kraken Slayer', desc: 'Slay The Abyssal Kraken in open combat.', rewardGold: 350, rewardScore: 2000 },
    { id: 'slay_dutchman', icon: '👻', title: 'Davy Jones\' Locker', desc: 'Slay The Flying Dutchman spectral galleon.', rewardGold: 400, rewardScore: 2500 },
    { id: 'slay_megalodon', icon: '🦈', title: 'Apex Predator', desc: 'Slay the Crimson Jaws Megalodon.', rewardGold: 350, rewardScore: 2000 },
    { id: 'slay_leviathan', icon: '🐉', title: 'Dragon of the Deep', desc: 'Slay the Azure Leviathan Serpent.', rewardGold: 450, rewardScore: 3000 },
    { id: 'slay_karkinos', icon: '🦀', title: 'Cracked Carapace', desc: 'Slay Karkinos the Colossal Reef Titan.', rewardGold: 550, rewardScore: 3500 },
    { id: 'slay_charybdis', icon: '🌪️', title: 'Maelstrom Conqueror', desc: 'Slay Charybdis the Living Maelstrom.', rewardGold: 650, rewardScore: 4200 },
    { id: 'slay_armada', icon: '👑', title: 'Sun Fleet Shattered', desc: 'Slay the El Dorado Solar Armada Dreadnought.', rewardGold: 800, rewardScore: 5000 },
    { id: 'elder_trio_win', icon: '🔱', title: 'Trident of the Elder Titans', desc: 'Slay the 3 Elder Bosses (Karkinos, Charybdis & El Dorado).', rewardGold: 2000, rewardScore: 10000 },
    { id: 'all_seven_bosses', icon: '🏆', title: 'Sovereign of the Seven Seas', desc: 'Slay all 7 Legendary Boss Monsters to complete a full Gauntlet Cycle!', rewardGold: 5000, rewardScore: 25000 },
    { id: 'ascended_boss_kill', icon: '♾️', title: 'Ascended Roguelike Legend', desc: 'Slay a Recycled Boss in Cycle II or higher with Ascended Buffs!', rewardGold: 1500, rewardScore: 8000 },
    { id: 'legendary_loadout', icon: '🟡', title: 'Mythic Shipwright', desc: 'Equip a Legendary-rarity module in your ship\'s loadout.', rewardGold: 500, rewardScore: 2500 },
    { id: 'tier_10_ark', icon: '🚢', title: 'Celestial Admiral', desc: 'Commission Tier 10: The Celestial Sovereign Ark (20 Loadout Slots).', rewardGold: 3000, rewardScore: 15000 }
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
