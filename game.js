// CORSAIRDASH: Sovereign Seas — Core Game Engine
// Features 10 Ship Tiers, 14 Loadout Modules with 5 Rarity Tiers & Special Abilities, 7 Boss Monsters, Endless Cycles & Mobile Protection.

class GameEngine {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.minimapCanvas = document.getElementById('minimap-canvas');
    this.minimapCtx = this.minimapCanvas ? this.minimapCanvas.getContext('2d') : null;

    this.data = window.CORSAIR_DATA || {};
    this.islands = this.data.islands || [];
    this.shipTiers = this.data.shipTiers || [];
    this.loadoutCatalog = this.data.loadoutModules || [];
    this.moduleRarities = this.data.moduleRarities || {};
    this.achievementsCatalog = this.data.achievementsCatalog || [];
    this.difficulties = this.data.difficulties || {};

    // Active Difficulty Mode ('easy', 'medium', 'hard')
    this.difficultyId = 'medium';
    this.difficulty = this.difficulties[this.difficultyId] || this.difficulties.medium;

    // Sandbox Cheat Menu visibility (OFF by default unless toggled on Start Menu)
    this.cheatsEnabled = Boolean(window.cheatsEnabledAtStart);

    // Sub-engines
    this.map = new ArchipelagoMap(this.data);
    this.pirateManager = new PirateAndTradeManager(this.data);
    this.bossManager = new BossMonsterEventManager(this.data);

    // Universal Modder Runtime Multipliers
    this.modPirateDensityMult = 1.0;
    this.modSpeedMult = 1.0;
    this.modCannonReloadMult = 1.0;

    // Ship Progression & Loadout State (10 Ship Tiers, up to 20 Slots)
    this.currentTierIndex = 0; // Starts at Tier 1: Coastal Sloop
    this.unlockedTierIndex = 0;
    this.equippedModules = []; // Array of module instances occupying slots
    this.rarityMarketOffers = []; // 6 rotating Rarity-Rolled modules in Shipyard

    // 7-Boss Gauntlet & Endless Cycle State
    this.bossCycle = 1;
    this.slainBossIdsInCycle = new Set();
    this.victoryTriggeredThisRun = false;

    // Player Ship Physics & Combat State (Spawns at Port Royal Haven dock)
    this.player = {
      x: 0,
      y: 310,
      prevX: 0,
      prevY: 310,
      angle: -Math.PI / 2,
      speed: 0,
      maxSpeed: 68,
      accel: 78,
      turnSpeed: 3.2,
      drifting: false,
      hull: 100,
      maxHull: 100,
      cargoCapacity: 2,
      cannonsPerSide: 1,
      cannonDamage: 24,
      cannonRange: 420,
      reloadTime: 1.45,
      reloadTimer: 0,
      swivelGuns: 0,
      swivelFireRateMult: 1.0,
      swivelTimer: 0,
      pointDefense: 0,
      pointDefenseChance: 0,
      pointDefenseTimer: 0,
      mortarGuns: 0,
      mortarCount: 0,
      mortarDamage: 0,
      mortarCooldown: 3.5,
      mortarSplashRadius: 68,
      mortarTimer: 0,
      chainLightning: 0,
      chainLightningChance: 0,
      burnDamage: 0,
      hellfireDPS: 0,
      slowEffect: 0,
      slowOnHit: 0,
      thornsReflect: 0,
      ramDamage: 0,
      whirlpoolResist: 0,
      fireBarrelsCount: 0,
      barrelDamageBonus: 0,
      barrelDamage: 95,
      barrelAutoDrop: 0,
      autoDropBarrelInterval: 0,
      autoBarrelTimer: 0,
      barrelMagnet: 0,
      magneticBarrels: false,
      barrelCooldown: 0,
      magnetRadius: 0,
      salvageGoldBonus: 0,
      chestHeal: 0,
      bountyBonus: 0,
      payoutBonus: 0,
      scoreBonus: 0,
      regenPerSec: 0,
      damageReduction: 0,
      stormArmor: 0,
      windEfficiency: 0,
      reefProtection: 0,
      unarmedSmugglerBonus: true,
      paddleWheels: false,
      boneRam: false,
      celestialAura: false,
      width: 16,
      length: 34,
      masts: 1,
      hullColor: '#8b5a2b',
      trimColor: '#eab308',
      sailColor: '#f8fafc',
      hitFlash: 0
    };

    // Camera
    this.camera = {
      x: this.player.x,
      y: this.player.y,
      width: window.innerWidth,
      height: window.innerHeight,
      zoom: 1.0
    };

    // Wind & Weather State
    this.windAngle = -Math.PI * 0.25;
    this.windSpeed = 18;
    this.windShiftTimer = 0;
    this.weather = 'CLEAR_TRADEWINDS';
    this.activeEvent = null;
    this.eventTimeRemaining = 0;
    this.nextEventTimer = 38;

    // Particles, Cannonballs, Lightning Arcs, Wakes & Floating Fire Barrels
    this.wakeMarks = [];
    this.particles = [];
    this.lightningArcs = [];
    this.floatingTexts = [];
    this.playerProjectiles = [];
    this.droppedFireBarrels = [];

    // Charter Ledger State Machine
    this.appState = 'SEARCHING';
    this.currentOrder = null;
    this.offerTimer = 0;
    this.offerDuration = 25;
    this.rhumbRoute = null;
    this.offerCheckTimer = 1.5;

    try {
      this.offerAlertMode = localStorage.getItem('corsairdash_offer_alert_mode') || 'PILL_ONLY';
    } catch (e) {
      this.offerAlertMode = 'PILL_ONLY';
    }

    // Load Persistent High Scores, Boss Kill Records & Achievements
    let savedHigh = 0;
    let savedDiffHigh = { easy: 0, medium: 0, hard: 0 };
    let savedBossCounts = {};
    let savedSlainBosses = [];
    let savedAchievements = [];
    let savedHighestCycle = 1;
    try {
      savedHigh = parseInt(localStorage.getItem('corsairdash_highscore') || '0', 10) || 0;
      const dh = JSON.parse(localStorage.getItem('corsairdash_diff_highscores') || '{}');
      if (dh && typeof dh === 'object') savedDiffHigh = { easy: dh.easy || 0, medium: dh.medium || 0, hard: dh.hard || 0 };
      const bc = JSON.parse(localStorage.getItem('corsairdash_boss_counts') || '{}');
      if (bc && typeof bc === 'object') savedBossCounts = bc;
      const sb = JSON.parse(localStorage.getItem('corsairdash_slain_bosses') || '[]');
      if (Array.isArray(sb)) savedSlainBosses = sb;
      const ach = JSON.parse(localStorage.getItem('corsairdash_achievements') || '[]');
      if (Array.isArray(ach)) savedAchievements = ach;
      savedHighestCycle = parseInt(localStorage.getItem('corsairdash_best_cycle') || localStorage.getItem('corsairdash_highest_cycle') || '1', 10) || 1;
    } catch (e) {}

    this.unlockedAchievements = new Set(savedAchievements);
    this.allTimeSlainBossIds = new Set(savedSlainBosses);
    this.slainBossCounts = savedBossCounts;
    this.highScoreByDiff = savedDiffHigh;
    this.highestBossCycle = savedHighestCycle;
    this.pacifistDeliveries = 0;

    this.stats = {
      gold: 180,
      score: 0,
      highScore: savedHigh,
      deliveries: 0,
      cratesHauled: 0,
      piratesSunk: 0,
      bossesSlain: 0,
      bossesOutrun: 0,
      maxTierReached: 1,
      reputation: 5.00,
      voyageSeconds: 0
    };

    // Input & Steering State
    this.keys = {};
    this.wheelSteerInput = 0;
    this.tiltSteerInput = 0;
    this.tiltEnabled = false;
    this.tiltBaseline = null;
    this.tiltCalibrationCount = 0;
    this.isTouchingWheel = false;
    this.activeWheelTouchId = null;
    this.boundaryAlertCooldown = 0;

    this.recalculateShipStats();
    this.rerollRarityMarket(true);
    this.setupInput();
    this.initTouchControls();
    this.initMobileExitProtection();
    this.initMinimapInteractions();
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    this.lastTime = performance.now();
  }

  // Normalize any equipped module entry (supports full rarity instance object or legacy string ID)
  resolveEquippedModule(entry) {
    if (!entry) return null;
    if (typeof entry === 'object' && entry.effects) return entry;
    const baseMod = this.loadoutCatalog.find(m => m.id === entry);
    if (!baseMod) return null;
    return this.createModuleInstance(baseMod, 'basic');
  }

  // Create a Basic or Rarity-Rolled Module Instance with Multiplied Stats & Special Sauce
  createModuleInstance(baseMod, rarityId = 'basic') {
    const rar = this.moduleRarities[rarityId] || this.moduleRarities.basic || {
      id: 'basic', name: 'BASIC', badge: '⚪ BASIC', color: '#94a3b8', statMult: 1.0, costMult: 1.0
    };
    const mult = rar.statMult || 1.0;
    const cost = Math.round(baseMod.cost * (rar.costMult || 1.0));

    const effects = {};
    const baseEf = baseMod.effects || {};
    for (const k of Object.keys(baseEf)) {
      const val = baseEf[k];
      if (k === 'cannonsPerSide' || k === 'swivelGuns' || k === 'fireBarrels' || k === 'mortarGuns') {
        effects[k] = val;
      } else if (k === 'cargoBonus' || k === 'hullBonus' || k === 'cannonDamage' || k === 'barrelDamage' || k === 'magnetRadius' || k === 'mortarDamage') {
        effects[k] = Math.round(val * mult);
      } else if (val > 0) {
        effects[k] = Number((val * mult).toFixed(3));
      } else {
        effects[k] = val;
      }
    }

    let displayName = baseMod.name;
    let specialSauce = null;

    if (rarityId !== 'basic' && baseMod.rarityPerks && baseMod.rarityPerks[rarityId]) {
      const perk = baseMod.rarityPerks[rarityId];
      if (perk.title) displayName = perk.title;
      if (perk.sauce) specialSauce = perk.sauce;
      if (perk.bonusEffects) {
        for (const [bk, bval] of Object.entries(perk.bonusEffects)) {
          effects[bk] = (effects[bk] || 0) + bval;
        }
      }
    }

    // Format a crisp summary of the multiplied stats
    const statParts = [];
    if (effects.cargoBonus) statParts.push(`+${effects.cargoBonus} Crates`);
    if (effects.cannonsPerSide) statParts.push(`+${effects.cannonsPerSide} Gun/Side`);
    if (effects.cannonDamage) statParts.push(`+${effects.cannonDamage} Dmg`);
    if (effects.swivelGuns) statParts.push(`+${effects.swivelGuns} Swivel`);
    if (effects.mortarGuns) statParts.push(`${effects.mortarGuns}x Mortar (${effects.mortarDamage || 48} AoE)`);
    if (effects.hullBonus) statParts.push(`+${effects.hullBonus} Hull`);
    if (effects.regenPerSec) statParts.push(`+${Number(effects.regenPerSec).toFixed(1)} HP/s`);
    if (effects.speedMult) statParts.push(`${effects.speedMult > 0 ? '+' : ''}${Math.round(effects.speedMult * 100)}% Speed`);
    if (effects.turnMult) statParts.push(`+${Math.round(effects.turnMult * 100)}% Turn`);
    if (effects.magnetRadius) statParts.push(`+${effects.magnetRadius}m Magnet`);
    if (effects.bountyBonus) statParts.push(`+${Math.round(effects.bountyBonus * 100)}% Bounties`);
    if (effects.fireBarrels) statParts.push(`Fire Kegs (${effects.barrelDamage || 85} Dmg)`);

    return {
      instanceId: 'mod_' + Math.random().toString(36).slice(2, 9),
      baseId: baseMod.id,
      name: displayName,
      baseName: baseMod.name,
      icon: baseMod.icon,
      category: baseMod.category,
      rarity: rar.id,
      rarityName: rar.name || rar.id.toUpperCase(),
      rarityBadge: rar.badge,
      rarityColor: rar.color,
      statMult: mult,
      cost,
      shortStat: statParts.length > 0 ? statParts.join(' • ') : baseMod.shortStat,
      description: baseMod.description,
      specialSauce,
      effects
    };
  }

  // Roll 6 Random Rarity Loadout Offers for the Shipyard Special Market
  rerollRarityMarket(freeRoll = false) {
    const rerollCost = 75;
    if (!freeRoll) {
      if (this.stats.gold < rerollCost) {
        this.showBanner(`🪙 NEED ${rerollCost} GOLD TO REROLL THE RARITY MARKET!`, 'linear-gradient(90deg, #b91c1c, #dc2626)');
        return;
      }
      this.stats.gold -= rerollCost;
      if (window.audioManager) window.audioManager.playDoubloonChime();
    }

    const cycleBoost = Math.max(0, (this.bossCycle || 1) - 1) * 4;
    const rarityTable = [
      { id: 'uncommon', weight: Math.max(18, 42 - cycleBoost) },
      { id: 'rare', weight: 32 + Math.floor(cycleBoost * 0.5) },
      { id: 'epic', weight: 18 + cycleBoost },
      { id: 'legendary', weight: 8 + cycleBoost }
    ];
    const totalWeight = rarityTable.reduce((acc, r) => acc + r.weight, 0);

    const pickRarity = () => {
      let roll = Math.random() * totalWeight;
      for (const r of rarityTable) {
        if (roll < r.weight) return r.id;
        roll -= r.weight;
      }
      return 'uncommon';
    };

    this.rarityMarketOffers = [];
    for (let i = 0; i < 6; i++) {
      const baseMod = this.loadoutCatalog[Math.floor(Math.random() * this.loadoutCatalog.length)];
      let rarId = pickRarity();
      if (i === 0 && rarId === 'uncommon') rarId = 'rare';
      this.rarityMarketOffers.push(this.createModuleInstance(baseMod, rarId));
    }

    this.updateGaugesUI();
    this.renderLoadoutModalUI();
  }

  // Recalculate effective ship stats from current Ship Tier + Equipped Loadout Modules
  recalculateShipStats() {
    const tier = this.shipTiers[this.currentTierIndex] || this.shipTiers[0];
    const prevMaxHull = this.player.maxHull || tier.baseHull;
    const hullPct = Math.min(1.0, (this.player.hull || prevMaxHull) / Math.max(1, prevMaxHull));

    let maxHull = tier.baseHull;
    let speedMult = 1.0;
    let accelMult = 1.0;
    let turnMult = 1.0;
    let cargoCap = tier.baseCargo;
    let cannonsPerSide = tier.baseCannonsPerSide;
    let cannonDamage = 24 + (tier.level - 1) * 6;
    let cannonRangeMult = 1.0;
    let reloadMult = 1.0;
    let swivelGuns = 0;
    let swivelFireRateMult = 1.0;
    let pointDefense = 0;
    let mortarGuns = 0;
    let mortarDamage = 0;
    let chainLightning = 0;
    let burnDamage = 0;
    let slowEffect = 0;
    let thornsReflect = 0;
    let ramDamage = 0;
    let whirlpoolResist = 0;
    let fireBarrels = 0;
    let barrelDamageBonus = 0;
    let barrelAutoDrop = 0;
    let barrelMagnet = 0;
    let magnetRadius = 0;
    let salvageGoldBonus = 0;
    let chestHeal = 0;
    let bountyBonus = 0;
    let payoutBonus = 0;
    let scoreBonus = 0;
    let regenPerSec = 0;
    let damageReduction = 0;
    let windEfficiency = tier.paddleWheels ? 0.35 : 0;
    let reefProtection = 0;
    let hasOffensiveGunModule = false;

    for (let i = 0; i < this.equippedModules.length; i++) {
      const mod = this.resolveEquippedModule(this.equippedModules[i]);
      if (!mod || !mod.effects) continue;
      this.equippedModules[i] = mod;
      const ef = mod.effects;

      if (ef.hullBonus) maxHull += ef.hullBonus;
      if (ef.speedMult) speedMult += ef.speedMult;
      if (ef.accelMult) accelMult += ef.accelMult;
      if (ef.turnMult) turnMult += ef.turnMult;
      if (ef.cargoBonus) cargoCap += ef.cargoBonus;
      if (ef.cannonsPerSide) {
        cannonsPerSide += ef.cannonsPerSide;
        hasOffensiveGunModule = true;
      }
      if (ef.cannonDamage) cannonDamage += ef.cannonDamage;
      if (ef.reloadReduction) reloadMult = Math.max(0.35, reloadMult - ef.reloadReduction);
      if (ef.swivelGuns) {
        swivelGuns += ef.swivelGuns;
        hasOffensiveGunModule = true;
      }
      if (ef.swivelFireRateMult) swivelFireRateMult += ef.swivelFireRateMult;
      if (ef.pointDefense) pointDefense += ef.pointDefense;
      if (ef.mortarGuns) {
        mortarGuns += ef.mortarGuns;
        mortarDamage += (ef.mortarDamage || 48);
        hasOffensiveGunModule = true;
      }
      if (ef.chainLightning) chainLightning += ef.chainLightning;
      if (ef.burnDamage) burnDamage += ef.burnDamage;
      if (ef.slowEffect) slowEffect = Math.min(0.70, slowEffect + ef.slowEffect);
      if (ef.thornsReflect) thornsReflect = Math.min(1.5, thornsReflect + ef.thornsReflect);
      if (ef.ramDamage) ramDamage += ef.ramDamage;
      if (ef.whirlpoolResist) whirlpoolResist = Math.min(1.0, whirlpoolResist + ef.whirlpoolResist);
      if (ef.cannonRangeMult) cannonRangeMult += ef.cannonRangeMult;
      if (ef.fireBarrels) fireBarrels += ef.fireBarrels;
      if (ef.barrelDamage) barrelDamageBonus += ef.barrelDamage;
      if (ef.barrelAutoDrop) barrelAutoDrop += ef.barrelAutoDrop;
      if (ef.barrelMagnet) barrelMagnet += ef.barrelMagnet;
      if (ef.magnetRadius) magnetRadius += ef.magnetRadius;
      if (ef.salvageGoldBonus) salvageGoldBonus += ef.salvageGoldBonus;
      if (ef.chestHeal) chestHeal += ef.chestHeal;
      if (ef.bountyBonus) bountyBonus += ef.bountyBonus;
      if (ef.payoutBonus) payoutBonus += ef.payoutBonus;
      if (ef.scoreBonus) scoreBonus += ef.scoreBonus;
      if (ef.regenPerSec) regenPerSec += ef.regenPerSec;
      if (ef.damageReduction) damageReduction = Math.min(0.72, damageReduction + ef.damageReduction);
      if (ef.windEfficiency) windEfficiency = Math.min(1.0, windEfficiency + ef.windEfficiency);
      if (ef.reefProtection) reefProtection = Math.min(1.0, reefProtection + ef.reefProtection);
    }

    // "Unarmed Smuggler Overdrive": If player slots ONLY cargo/speed/evasion and 0 gun modules, grant +12% speed!
    this.player.unarmedSmugglerBonus = !hasOffensiveGunModule;
    if (this.player.unarmedSmugglerBonus) {
      speedMult += 0.12;
    }

    this.player.maxHull = Math.round(maxHull);
    this.player.hull = Math.max(20, Math.round(this.player.maxHull * hullPct));
    this.player.maxSpeed = Math.round(tier.baseSpeed * Math.max(0.65, speedMult) * (this.modSpeedMult || 1.0));
    this.player.accel = Math.round(tier.baseAccel * Math.max(0.65, accelMult));
    this.player.turnSpeed = tier.baseTurn * Math.max(0.65, turnMult);
    this.player.cargoCapacity = cargoCap;
    this.player.cannonsPerSide = cannonsPerSide;
    this.player.cannonDamage = cannonDamage;
    this.player.cannonRange = Math.round(420 * cannonRangeMult);
    this.player.reloadTime = Math.max(0.35, 1.45 * reloadMult / (this.modCannonReloadMult || 1.0));
    this.player.swivelGuns = swivelGuns;
    this.player.swivelFireRateMult = swivelFireRateMult;
    this.player.pointDefense = pointDefense;
    this.player.pointDefenseChance = pointDefense > 0 ? Math.min(0.65, pointDefense * 0.35) : 0;
    this.player.mortarGuns = mortarGuns;
    this.player.mortarCount = mortarGuns;
    this.player.mortarDamage = mortarDamage || 85;
    this.player.mortarCooldown = Math.max(1.4, 3.8 / Math.max(1, mortarGuns));
    this.player.mortarSplashRadius = 68 + mortarGuns * 12;
    this.player.chainLightning = chainLightning;
    this.player.chainLightningChance = chainLightning > 0 ? Math.min(0.75, chainLightning * 0.35) : 0;
    this.player.burnDamage = burnDamage;
    this.player.hellfireDPS = burnDamage;
    this.player.slowEffect = slowEffect;
    this.player.slowOnHit = slowEffect;
    this.player.thornsReflect = thornsReflect;
    this.player.ramDamage = ramDamage;
    this.player.whirlpoolResist = whirlpoolResist;
    this.player.fireBarrelsCount = fireBarrels;
    this.player.barrelDamageBonus = barrelDamageBonus;
    this.player.barrelDamage = 85 + barrelDamageBonus;
    this.player.barrelAutoDrop = barrelAutoDrop;
    this.player.autoDropBarrelInterval = barrelAutoDrop > 0 ? Math.max(2.0, 6.0 / barrelAutoDrop) : 0;
    this.player.barrelMagnet = barrelMagnet;
    this.player.magneticBarrels = barrelMagnet > 0;
    this.player.magnetRadius = magnetRadius;
    this.player.salvageGoldBonus = salvageGoldBonus;
    this.player.chestHeal = chestHeal;
    this.player.bountyBonus = bountyBonus;
    this.player.payoutBonus = payoutBonus;
    this.player.scoreBonus = scoreBonus;
    this.player.regenPerSec = regenPerSec;
    this.player.damageReduction = damageReduction;
    this.player.windEfficiency = windEfficiency;
    this.player.reefProtection = reefProtection;

    this.player.paddleWheels = Boolean(tier.paddleWheels);
    this.player.boneRam = Boolean(tier.boneRam);
    this.player.celestialAura = Boolean(tier.celestialAura);
    this.player.width = tier.width;
    this.player.length = tier.length;
    this.player.masts = tier.masts;
    this.player.hullColor = tier.hullColor;
    this.player.trimColor = tier.trimColor;
    this.player.sailColor = tier.sailColor;

    this.updateGaugesUI();
  }

  setDifficulty(diffId) {
    if (!this.difficulties[diffId]) return;
    this.difficultyId = diffId;
    this.difficulty = this.difficulties[diffId];

    document.querySelectorAll('[data-diff-btn]').forEach(btn => {
      if (btn.getAttribute('data-diff-btn') === diffId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    const hudDiff = document.getElementById('hud-difficulty-badge');
    if (hudDiff) {
      hudDiff.innerText = this.difficulty.badge;
    }

    this.showBanner(`⚓ DIFFICULTY SET: ${this.difficulty.badge} (${this.difficulty.scoreMultiplier}x SCORE)`, 'linear-gradient(90deg, #0284c7, #2563eb)');
    this.updateMenuModalUI();
    this.updatePhoneUI();
  }

  resizeCanvas() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.camera.width = this.canvas.width;
    this.camera.height = this.canvas.height;
  }

  // Mobile Touch & History Guards to prevent accidental app exits, edge-swipe back, or pull-to-refresh
  initMobileExitProtection() {
    // 1. Block pinch-zoom, double-tap zoom, and long-press context menu
    window.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    }, { passive: false });

    window.addEventListener('gesturestart', (e) => {
      e.preventDefault();
    }, { passive: false });

    // 2. Intercept screen-edge touches (within 28px of left/right edge) so iOS/Android Back-Swipe doesn't exit the game!
    window.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches.length > 1) {
        if (e.cancelable) e.preventDefault();
        return;
      }
      if (e.touches && e.touches.length === 1) {
        const t = e.touches[0];
        const nearHorizontalEdge = t.clientX < 28 || t.clientX > window.innerWidth - 28;
        const nearBottomBar = t.clientY > window.innerHeight - 18;
        if ((nearHorizontalEdge || nearBottomBar) && e.cancelable) {
          const isInteractiveBtn = e.target && e.target.closest('button, a, input, select');
          if (!isInteractiveBtn) {
            e.preventDefault();
          }
        }
      }
    }, { passive: false });

    // 3. Prevent browser pull-to-refresh & rubber-banding while allowing smooth scrolling inside modals
    window.addEventListener('touchmove', (e) => {
      const scrollable = e.target && e.target.closest('.modal-content-box, .phone-screen, .compact-status-pill');
      if (!scrollable) {
        if (e.cancelable) e.preventDefault();
      }
    }, { passive: false });

    // 4. History Back-Button / Back-Swipe Trap: closes open modals or protects active voyage instead of exiting!
    try {
      window.history.pushState({ corsairGuard: true }, '');
      window.addEventListener('popstate', () => {
        try {
          window.history.pushState({ corsairGuard: true }, '');
        } catch (err) {}

        const openModals = ['loadout-modal', 'achievements-modal', 'menu-modal', 'mod-studio-modal', 'victory-modal'];
        for (const id of openModals) {
          const el = document.getElementById(id);
          if (el && el.style.display === 'flex') {
            el.style.display = 'none';
            return;
          }
        }
        const dock = document.getElementById('phone-dock');
        if (dock && !dock.classList.contains('minimized')) {
          this.togglePhone(false);
          return;
        }
        this.showBanner('⚓ BACK GESTURE INTERCEPTED — VOYAGE PROTECTED!', 'linear-gradient(90deg, #0284c7, #2563eb)', 2600);
      });
    } catch (err) {}

    // 5. Warn before accidental tab close or reload during an active run
    window.addEventListener('beforeunload', (e) => {
      if (this.stats && this.stats.voyageSeconds > 10) {
        e.preventDefault();
        e.returnValue = '';
      }
    });
  }

  setupInput() {
    window.addEventListener('keydown', (e) => {
      const k = e.key.toLowerCase();
      this.keys[k] = true;

      if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) {
        e.preventDefault();
      }

      if (window.audioManager) window.audioManager.resume();

      if (k === 'f') {
        this.fireBroadsides();
      }
      if (k === 'e') {
        this.dropGreekFireBarrel();
      }
      if (k === 'h') {
        if (window.audioManager) window.audioManager.playFoghorn();
        this.pirateManager.foghornReaction(this.player.x, this.player.y);
      }
      if (k === 'r') {
        this.toggleRadioPlay();
      }
      if (k === 'l' || k === 'b') {
        this.toggleLoadoutModal();
      }
      if (k === 'm') {
        this.toggleMenuModal();
      }
      if (k === 'p') {
        this.togglePhone();
      }
      if (k === 'y' || k === 'enter') {
        if (this.appState === 'OFFER' && this.currentOrder) {
          this.acceptOrder();
        } else {
          this.fireBroadsides();
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });

    // Click on ocean canvas fires broadsides!
    if (this.canvas) {
      this.canvas.addEventListener('mousedown', (e) => {
        if (e.button === 0) {
          if (window.audioManager) window.audioManager.resume();
          this.fireBroadsides();
        }
      });
    }
  }

  initTouchControls() {
    const bindBtn = (id, onDown, onUp) => {
      const btn = document.getElementById(id);
      if (!btn) return;

      const handleDown = (e) => {
        if (e.cancelable) e.preventDefault();
        if (window.audioManager) window.audioManager.resume();
        btn.classList.add('active');
        onDown();
      };

      const handleUp = (e) => {
        if (e.cancelable) e.preventDefault();
        btn.classList.remove('active');
        if (onUp) onUp();
      };

      btn.addEventListener('touchstart', handleDown, { passive: false });
      btn.addEventListener('touchend', handleUp, { passive: false });
      btn.addEventListener('touchcancel', handleUp, { passive: false });
      btn.addEventListener('mousedown', handleDown);
      btn.addEventListener('mouseup', handleUp);
      btn.addEventListener('mouseleave', handleUp);
    };

    bindBtn('touch-gas', () => { this.keys['w'] = true; }, () => { this.keys['w'] = false; });
    bindBtn('touch-brake', () => { this.keys['s'] = true; }, () => { this.keys['s'] = false; });
    bindBtn('touch-drift', () => { this.keys[' '] = true; }, () => { this.keys[' '] = false; });
    bindBtn('touch-fire', () => { this.fireBroadsides(); }, () => {});
    bindBtn('touch-barrel', () => { this.dropGreekFireBarrel(); }, () => {});
    bindBtn('touch-horn', () => {
      if (window.audioManager) window.audioManager.playFoghorn();
      this.pirateManager.foghornReaction(this.player.x, this.player.y);
    }, () => {});

    // Wooden Ship's Helm Wheel Touch Steering
    const wheelBox = document.getElementById('touch-wheel-container');
    const wheelEl = document.getElementById('touch-steering-wheel');
    if (wheelBox && wheelEl) {
      const getSteerAngle = (clientX, clientY) => {
        const rect = wheelBox.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = clientX - cx;
        const dy = clientY - cy;
        const maxOffset = rect.width * 0.62;
        const normX = Math.max(-1, Math.min(1, dx / maxOffset));
        const angle = Math.atan2(dy, dx);
        let relAngle = angle - (-Math.PI / 2);
        while (relAngle > Math.PI) relAngle -= Math.PI * 2;
        while (relAngle < -Math.PI) relAngle += Math.PI * 2;
        const normRot = Math.max(-1, Math.min(1, relAngle / (Math.PI * 0.48)));
        return Math.abs(normX) > Math.abs(normRot) ? normX : normRot;
      };

      const handleWheelStart = (e) => {
        if (e.target && e.target.closest('#touch-horn')) return;
        if (e.cancelable) e.preventDefault();
        if (window.audioManager) window.audioManager.resume();
        const touch = e.changedTouches ? e.changedTouches[0] : e;
        this.isTouchingWheel = true;
        this.activeWheelTouchId = touch.identifier !== undefined ? touch.identifier : 'mouse';
        const steer = getSteerAngle(touch.clientX, touch.clientY);
        this.wheelSteerInput = steer;
        wheelEl.style.transform = `rotate(${steer * 80}deg)`;
      };

      const handleWindowTouchMove = (e) => {
        if (!this.isTouchingWheel) return;
        if (this.activeWheelTouchId === 'mouse') {
          const steer = getSteerAngle(e.clientX, e.clientY);
          this.wheelSteerInput = steer;
          wheelEl.style.transform = `rotate(${steer * 80}deg)`;
          return;
        }
        if (e.changedTouches) {
          for (let i = 0; i < e.changedTouches.length; i++) {
            const t = e.changedTouches[i];
            if (t.identifier === this.activeWheelTouchId) {
              if (e.cancelable) e.preventDefault();
              const steer = getSteerAngle(t.clientX, t.clientY);
              this.wheelSteerInput = steer;
              wheelEl.style.transform = `rotate(${steer * 80}deg)`;
              break;
            }
          }
        }
      };

      const handleWindowTouchEnd = () => {
        if (!this.isTouchingWheel) return;
        this.isTouchingWheel = false;
        this.activeWheelTouchId = null;
      };

      wheelBox.addEventListener('touchstart', handleWheelStart, { passive: false });
      window.addEventListener('touchmove', handleWindowTouchMove, { passive: false });
      window.addEventListener('touchend', handleWindowTouchEnd, { passive: false });
      window.addEventListener('touchcancel', handleWindowTouchEnd, { passive: false });
      wheelBox.addEventListener('mousedown', handleWheelStart);
      window.addEventListener('mousemove', (e) => {
        if (this.isTouchingWheel && this.activeWheelTouchId === 'mouse') handleWindowTouchMove(e);
      });
      window.addEventListener('mouseup', handleWindowTouchEnd);
    }
  }

  initMinimapInteractions() {
    if (!this.minimapCanvas) return;
    const canvas = this.minimapCanvas;

    const handleTap = (clientX, clientY) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = clientX - rect.left;
      const clickY = clientY - rect.top;
      const bounds = this.data.worldBounds;
      const worldX = bounds.minX + (clickX / rect.width) * (bounds.maxX - bounds.minX);
      const worldY = bounds.minY + (clickY / rect.height) * (bounds.maxY - bounds.minY);

      let bestIsland = null;
      let bestDist = 1400;
      for (const isl of this.islands) {
        const d = Math.hypot(isl.x - worldX, isl.y - worldY);
        if (d < bestDist) {
          bestDist = d;
          bestIsland = isl;
        }
      }

      if (bestIsland) {
        this.rhumbRoute = [
          { x: this.player.x, y: this.player.y },
          { x: bestIsland.dockX, y: bestIsland.dockY }
        ];
        if (window.audioManager) window.audioManager.playContractBell();
        this.showBanner(`🧭 ASTROLABE BEARING SET: ${bestIsland.name.toUpperCase()}`, 'linear-gradient(90deg, #0ea5e9, #06b6d4)');
      }
    };

    canvas.addEventListener('click', (e) => handleTap(e.clientX, e.clientY));
    canvas.addEventListener('touchstart', (e) => {
      if (e.cancelable) e.preventDefault();
      if (e.touches && e.touches.length > 0) {
        handleTap(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: false });
  }

  // --- Broadsides, Swivel Culverins, Mortar Bombards & Greek Fire Barrels ---

  fireBroadsides() {
    const p = this.player;
    if (p.reloadTimer > 0) return;

    p.reloadTimer = p.reloadTime;
    const count = Math.max(1, p.cannonsPerSide);
    if (window.audioManager) window.audioManager.playCannonBroadside(count);

    // Fire Port (-PI/2) and Starboard (+PI/2) cannonball volleys!
    const spacing = Math.min(12, (p.length * 0.65) / Math.max(1, count));
    const hasHellfire = (p.hellfireDPS || 0) > 0;
    const hasLightning = (p.chainLightningChance || 0) > 0;
    const projColor = hasLightning ? '#c084fc' : (hasHellfire ? '#fb923c' : '#fde047');

    for (const side of [-1, 1]) {
      const sideAngle = p.angle + side * (Math.PI / 2);
      for (let i = 0; i < count; i++) {
        const offsetAlongHull = (i - (count - 1) / 2) * spacing;
        const sx = p.x + Math.cos(p.angle) * offsetAlongHull + Math.cos(sideAngle) * (p.width * 0.55);
        const sy = p.y + Math.sin(p.angle) * offsetAlongHull + Math.sin(sideAngle) * (p.width * 0.55);

        const spread = (Math.random() - 0.5) * 0.08;
        const fireAngle = sideAngle + spread;
        const speed = 440;

        this.playerProjectiles.push({
          x: sx,
          y: sy,
          vx: Math.cos(fireAngle) * speed + Math.cos(p.angle) * p.speed * 0.35,
          vy: Math.sin(fireAngle) * speed + Math.sin(p.angle) * p.speed * 0.35,
          damage: p.cannonDamage,
          life: p.cannonRange / speed,
          radius: hasHellfire ? 5.2 : 4.5,
          color: projColor,
          hellfireDPS: p.hellfireDPS || 0,
          slowOnHit: p.slowOnHit || 0,
          chainLightningChance: p.chainLightningChance || 0
        });

        this.spawnMuzzleSmoke(sx, sy);
      }
    }
  }

  fireSwivelCulverin(dt) {
    const p = this.player;
    if (p.swivelGuns <= 0) return;

    // Legendary Swivel Point-Defense: intercept nearby enemy cannonballs!
    if ((p.pointDefenseChance || 0) > 0 && this.pirateManager && this.pirateManager.enemyProjectiles) {
      for (let i = this.pirateManager.enemyProjectiles.length - 1; i >= 0; i--) {
        const cb = this.pirateManager.enemyProjectiles[i];
        if (!cb._pdChecked && Math.hypot(cb.x - p.x, cb.y - p.y) < 95) {
          cb._pdChecked = true;
          if (Math.random() < p.pointDefenseChance) {
            this.spawnMuzzleSmoke(cb.x, cb.y);
            this.pirateManager.enemyProjectiles.splice(i, 1);
          }
        }
      }
    }

    p.swivelTimer -= dt;
    if (p.swivelTimer > 0) return;

    // Find closest pirate or active Boss within range
    let bestTarget = null;
    let bestDist = p.cannonRange * 1.15;

    if (this.bossManager.activeBoss) {
      const b = this.bossManager.activeBoss;
      const bd = Math.hypot(b.x - p.x, b.y - p.y);
      if (bd < bestDist) {
        bestDist = bd;
        bestTarget = b;
      }
    }

    for (const pir of this.pirateManager.pirates) {
      const d = Math.hypot(pir.x - p.x, pir.y - p.y);
      if (d < bestDist) {
        bestDist = d;
        bestTarget = pir;
      }
    }

    if (!bestTarget) return;

    p.swivelTimer = Math.max(0.45, 2.0 / p.swivelGuns);
    if (window.audioManager) window.audioManager.playSwivelShot();

    const aimAngle = Math.atan2(bestTarget.y - p.y, bestTarget.x - p.x);
    this.playerProjectiles.push({
      x: p.x + Math.cos(aimAngle) * 14,
      y: p.y + Math.sin(aimAngle) * 14,
      vx: Math.cos(aimAngle) * 490,
      vy: Math.sin(aimAngle) * 490,
      damage: Math.round(p.cannonDamage * 0.78),
      life: 1.15,
      radius: 3.8,
      color: '#38bdf8',
      hellfireDPS: (p.hellfireDPS || 0) * 0.5,
      slowOnHit: (p.slowOnHit || 0) * 0.65,
      chainLightningChance: (p.chainLightningChance || 0) * 0.5
    });
    this.spawnMuzzleSmoke(p.x + Math.cos(aimAngle) * 12, p.y + Math.sin(aimAngle) * 12);
  }

  fireMortarBombard(dt) {
    const p = this.player;
    if ((p.mortarCount || 0) <= 0) return;

    p.mortarTimer -= dt;
    if (p.mortarTimer > 0) return;

    let bestTarget = null;
    let bestDist = 470;

    if (this.bossManager.activeBoss) {
      const b = this.bossManager.activeBoss;
      const bd = Math.hypot(b.x - p.x, b.y - p.y);
      if (bd < bestDist) {
        bestDist = bd;
        bestTarget = b;
      }
    }

    if (!bestTarget) {
      for (const pir of this.pirateManager.pirates) {
        const d = Math.hypot(pir.x - p.x, pir.y - p.y);
        if (d < bestDist) {
          bestDist = d;
          bestTarget = pir;
        }
      }
    }

    if (!bestTarget) return;

    p.mortarTimer = p.mortarCooldown || 3.5;
    if (window.audioManager) window.audioManager.playCannonBroadside(2);

    const aimAngle = Math.atan2(bestTarget.y - p.y, bestTarget.x - p.x);
    const speed = 330;
    this.playerProjectiles.push({
      x: p.x,
      y: p.y,
      vx: Math.cos(aimAngle) * speed,
      vy: Math.sin(aimAngle) * speed,
      damage: p.mortarDamage || 85,
      life: Math.min(1.6, bestDist / speed + 0.25),
      radius: 7.5,
      color: '#f97316',
      isMortar: true,
      splashRadius: p.mortarSplashRadius || 65,
      hellfireDPS: Math.max(12, p.hellfireDPS || 0),
      slowOnHit: p.slowOnHit || 0
    });
    this.spawnMuzzleSmoke(p.x, p.y);
  }

  dropGreekFireBarrel(isAuto = false) {
    const p = this.player;
    if (p.fireBarrelsCount <= 0) {
      if (!isAuto) {
        this.showBanner('🛢️ EQUIP "GREEK FIRE STERN BARRELS" IN LOADOUT [L] TO DROP FIRE KEGS!', 'linear-gradient(90deg, #b45309, #d97706)');
      }
      return;
    }
    if (!isAuto && p.barrelCooldown > 0) return;

    if (!isAuto) {
      p.barrelCooldown = Math.max(1.2, 3.8 / p.fireBarrelsCount);
    }
    const bx = p.x - Math.cos(p.angle) * (p.length * 0.65);
    const by = p.y - Math.sin(p.angle) * (p.length * 0.65);

    this.droppedFireBarrels.push({
      x: bx,
      y: by,
      radius: 18,
      damage: (p.barrelDamage || 95) + p.fireBarrelsCount * 22,
      life: 15.0,
      magnetic: Boolean(p.magneticBarrels)
    });

    if (window.audioManager && !isAuto) window.audioManager.playSplash();
  }

  // --- Shipyard, 10 Ship Tiers, Rarity Market & Loadout Store Mechanics ---

  toggleLoadoutModal(open) {
    const modal = document.getElementById('loadout-modal');
    if (!modal) return;
    if (open === undefined) {
      open = modal.style.display === 'none' || !modal.style.display;
    }
    modal.style.display = open ? 'flex' : 'none';
    if (open) {
      if (window.audioManager) window.audioManager.resume();
      this.renderLoadoutModalUI();
    }
  }

  buyOrSelectShipTier(tierIndex) {
    const tier = this.shipTiers[tierIndex];
    if (!tier) return;

    if (tierIndex <= this.unlockedTierIndex) {
      // Already unlocked — switch to it and refund excess slots if downsizing
      this.currentTierIndex = tierIndex;
      while (this.equippedModules.length > tier.maxSlots) {
        const removed = this.resolveEquippedModule(this.equippedModules.pop());
        if (removed) this.stats.gold += removed.cost;
      }
      this.recalculateShipStats();
      this.player.hull = this.player.maxHull;
      if (window.audioManager) window.audioManager.playDoubloonChime();
      this.renderLoadoutModalUI();
      this.updatePhoneUI();
      return;
    }

    if (this.stats.gold < tier.cost) {
      this.showBanner(`🪙 NEED ${tier.cost.toLocaleString()} GOLD FOR ${tier.name.toUpperCase()}!`, 'linear-gradient(90deg, #b91c1c, #dc2626)');
      return;
    }

    this.stats.gold -= tier.cost;
    this.unlockedTierIndex = Math.max(this.unlockedTierIndex, tierIndex);
    this.currentTierIndex = tierIndex;
    if (tier.level > (this.stats.maxTierReached || 1)) {
      this.stats.maxTierReached = tier.level;
    }
    this.recalculateShipStats();
    this.player.hull = this.player.maxHull;
    this.rerollRarityMarket(true);
    this.addScore(tier.cost * 2, `COMMISSIONED ${tier.name.toUpperCase()}`);
    this.checkAchievements();

    if (window.audioManager) window.audioManager.playDoubloonChime();
    this.showBanner(`⚓ COMMISSIONED TIER ${tier.level}: ${tier.name.toUpperCase()} (${tier.maxSlots} LOADOUT SLOTS)!`, 'linear-gradient(90deg, #059669, #10b981)');
    this.renderLoadoutModalUI();
    this.updatePhoneUI();
  }

  equipLoadoutModule(modId) {
    const tier = this.shipTiers[this.currentTierIndex];
    const mod = this.loadoutCatalog.find(m => m.id === modId);
    if (!tier || !mod) return;

    if (this.equippedModules.length >= tier.maxSlots) {
      this.showBanner(`⚠️ ALL ${tier.maxSlots} SLOTS FULL ON ${tier.name.toUpperCase()}! UNEQUIP A SLOT OR UPGRADE SHIP TIER!`, 'linear-gradient(90deg, #d97706, #ea580c)');
      return;
    }

    const instance = this.createModuleInstance(mod, 'basic');
    if (this.stats.gold < instance.cost) {
      this.showBanner(`🪙 NEED ${instance.cost} GOLD TO SLOT ${instance.name.toUpperCase()}!`, 'linear-gradient(90deg, #b91c1c, #dc2626)');
      return;
    }

    this.stats.gold -= instance.cost;
    this.equippedModules.push(instance);
    this.recalculateShipStats();
    this.checkAchievements();
    if (window.audioManager) window.audioManager.playDoubloonChime();
    this.renderLoadoutModalUI();
    this.updatePhoneUI();
  }

  equipRarityMarketOffer(offerIndex) {
    const tier = this.shipTiers[this.currentTierIndex];
    const offer = this.rarityMarketOffers[offerIndex];
    if (!tier || !offer) return;

    if (this.equippedModules.length >= tier.maxSlots) {
      this.showBanner(`⚠️ ALL ${tier.maxSlots} SLOTS FULL ON ${tier.name.toUpperCase()}! UNEQUIP A SLOT OR UPGRADE SHIP TIER!`, 'linear-gradient(90deg, #d97706, #ea580c)');
      return;
    }

    if (this.stats.gold < offer.cost) {
      this.showBanner(`🪙 NEED ${offer.cost.toLocaleString()} GOLD FOR ${offer.rarityName.toUpperCase()} ${offer.name.toUpperCase()}!`, 'linear-gradient(90deg, #b91c1c, #dc2626)');
      return;
    }

    this.stats.gold -= offer.cost;
    this.equippedModules.push(offer);

    // Replace that market slot with a fresh roll!
    const weights = [
      { id: 'uncommon', weight: 46 },
      { id: 'rare', weight: 32 },
      { id: 'epic', weight: 15 },
      { id: 'legendary', weight: 7 }
    ];
    let r = Math.random() * 100;
    let nextRarity = 'uncommon';
    for (const w of weights) {
      if (r < w.weight) { nextRarity = w.id; break; }
      r -= w.weight;
    }
    const randomBase = this.loadoutCatalog[Math.floor(Math.random() * this.loadoutCatalog.length)];
    this.rarityMarketOffers[offerIndex] = this.createModuleInstance(randomBase, nextRarity);

    this.recalculateShipStats();
    this.checkAchievements();
    if (window.audioManager) window.audioManager.playDoubloonChime();
    this.showBanner(
      `${offer.rarityBadge} EQUIPPED ${offer.name.toUpperCase()}! ${offer.specialSauce ? '✨ ' + offer.specialSauce : ''}`,
      'linear-gradient(90deg, #7c3aed, #d97706)',
      4500
    );
    this.renderLoadoutModalUI();
    this.updatePhoneUI();
  }

  unequipLoadoutSlot(slotIndex) {
    if (slotIndex < 0 || slotIndex >= this.equippedModules.length) return;
    const removedEntry = this.equippedModules.splice(slotIndex, 1)[0];
    const mod = this.resolveEquippedModule(removedEntry);
    if (mod) {
      this.stats.gold += mod.cost; // 100% refund so players can freely experiment with builds!
    }
    this.recalculateShipStats();
    if (window.audioManager) window.audioManager.playContractBell();
    this.renderLoadoutModalUI();
    this.updatePhoneUI();
  }

  repairHullAtPort() {
    const missing = this.player.maxHull - this.player.hull;
    if (missing <= 0) {
      this.showBanner('🛡️ HULL IS ALREADY AT 100% SHIPSHAPE INTEGRITY!', 'linear-gradient(90deg, #059669, #10b981)');
      return;
    }

    const inHarbor = this.isPlayerInSafeHarbor();
    const cost = inHarbor ? Math.min(25, Math.ceil(missing * 0.15)) : Math.min(60, Math.ceil(missing * 0.35));

    if (this.stats.gold < cost) {
      this.player.hull = Math.min(this.player.maxHull, this.player.hull + 50);
      this.showBanner('🔨 HARBOR CARPENTERS PATCHED +50 HULL HP ON CREDIT!', 'linear-gradient(90deg, #0284c7, #0ea5e9)');
    } else {
      this.stats.gold -= cost;
      this.player.hull = this.player.maxHull;
      this.showBanner(`🔨 HULL REPAIRED TO 100% (${this.player.maxHull} HP) FOR ${cost} GOLD!`, 'linear-gradient(90deg, #059669, #10b981)');
    }

    if (window.audioManager) window.audioManager.playDoubloonChime();
    this.updateGaugesUI();
    this.renderLoadoutModalUI();
  }

  renderLoadoutModalUI() {
    const tier = this.shipTiers[this.currentTierIndex];
    const slotsContainer = document.getElementById('loadout-slots-grid');
    const tiersContainer = document.getElementById('loadout-tiers-grid');
    const rarityContainer = document.getElementById('loadout-rarity-market-grid');
    const storeContainer = document.getElementById('loadout-store-grid');
    const summaryEl = document.getElementById('loadout-ship-summary');

    if (summaryEl && tier) {
      const buildStyle = this.player.unarmedSmugglerBonus
        ? '🏃 SMUGGLER (+12% SPD & +25% PAY)'
        : `💣 ${this.player.cannonsPerSide * 2} GUNS (${this.player.cannonDamage} DMG)`;
      summaryEl.innerHTML = `
        <div class="shipyard-stat-pill"><span>🪙 GOLD:</span><strong class="font-gold">${Math.floor(this.stats.gold).toLocaleString()}g</strong></div>
        <div class="shipyard-stat-pill"><span>🚢 VESSEL:</span><strong class="font-cyan">Lv.${tier.level} ${tier.name}</strong></div>
        <div class="shipyard-stat-pill"><span>🧩 SLOTS:</span><strong class="font-amber">${this.equippedModules.length} / ${tier.maxSlots}</strong></div>
        <div class="shipyard-stat-pill"><span>📦 HOLD:</span><strong>${this.player.cargoCapacity} Crates</strong></div>
        <div class="shipyard-stat-pill"><span>🛡️ HULL:</span><strong>${Math.ceil(this.player.hull)}/${this.player.maxHull}</strong></div>
        <div class="shipyard-stat-pill"><span>⚡ BUILD:</span><strong style="color:#34d399;">${buildStyle}</strong></div>
      `;
    }

    // 1. Render Active Ship's Loadout Slots (with Rarity Badges & 100% Gold Refund)
    if (slotsContainer && tier) {
      let slotsHtml = '';
      for (let s = 0; s < tier.maxSlots; s++) {
        const entry = this.equippedModules[s];
        const mod = entry ? this.resolveEquippedModule(entry) : null;
        if (mod) {
          const rarityClass = `slot-rarity-${mod.rarity || 'basic'}`;
          slotsHtml += `
            <button class="slot-cell filled ${rarityClass}" onclick="window.game.unequipLoadoutSlot(${s})" title="${mod.specialSauce ? mod.specialSauce + ' — ' : ''}Click to Unequip & Refund ${mod.cost}g">
              <span class="slot-rarity-tag" style="color:${mod.rarityColor || '#cbd5e1'};">${mod.rarityBadge || '⚪ BASIC'}</span>
              <span class="slot-icon">${mod.icon}</span>
              <span class="slot-name">${mod.name}</span>
              <span class="slot-refund">✕ REFUND ${mod.cost}g</span>
            </button>
          `;
        } else {
          slotsHtml += `
            <div class="slot-cell empty">
              <span class="slot-icon">➕</span>
              <span class="slot-name">OPEN SLOT #${s + 1}</span>
              <span class="slot-refund">Select Module Below</span>
            </div>
          `;
        }
      }
      slotsContainer.innerHTML = slotsHtml;
    }

    // 2. Render All 10 Ship Tiers Progression (Lv.1 Harbor Sloop to Lv.10 Celestial Sovereign Ark)
    if (tiersContainer) {
      tiersContainer.innerHTML = this.shipTiers.map((t, idx) => {
        const isCurrent = idx === this.currentTierIndex;
        const isUnlocked = idx <= this.unlockedTierIndex;
        const canAfford = this.stats.gold >= t.cost;
        let btnLabel = isCurrent ? '✅ ACTIVE VESSEL' : (isUnlocked ? '⛵ BOARD SHIP' : `🪙 BUY (${t.cost.toLocaleString()}g)`);
        let btnClass = isCurrent ? 'tier-btn active' : (isUnlocked || canAfford ? 'tier-btn buyable' : 'tier-btn locked');

        return `
          <div class="ship-tier-card ${isCurrent ? 'current-tier' : ''}">
            <div class="tier-header">
              <span class="tier-badge">TIER ${t.level}</span>
              <span class="tier-slots">${t.maxSlots} SLOTS</span>
            </div>
            <div class="tier-title">${t.name}</div>
            <div class="tier-stats">
              🛡️ ${t.baseHull} HP • 📦 ${t.baseCargo} Hold • ⛵ ${t.baseSpeed} kts • 💣 ${t.baseCannonsPerSide * 2} Guns
            </div>
            <button class="${btnClass}" onclick="window.game.buyOrSelectShipTier(${idx})">${btnLabel}</button>
          </div>
        `;
      }).join('');
    }

    // 3. Render Rotating Special Rarity Market (Uncommon, Rare, Epic & Legendary with Special Sauce!)
    if (rarityContainer && tier) {
      if (!this.rarityMarketOffers || this.rarityMarketOffers.length === 0) {
        this.rerollRarityMarket(true);
      }
      rarityContainer.innerHTML = this.rarityMarketOffers.map((offer, idx) => {
        const canBuy = this.stats.gold >= offer.cost && this.equippedModules.length < tier.maxSlots;
        return `
          <div class="module-store-card rarity-${offer.rarity}">
            <div class="rarity-banner-row">
              <span class="rarity-pill" style="color:${offer.rarityColor}; border-color:${offer.rarityColor};">${offer.rarityBadge}</span>
              <span class="rarity-mult-tag">${offer.statMult}x STATS</span>
            </div>
            <div class="mod-card-top">
              <span class="mod-icon">${offer.icon}</span>
              <div class="mod-title-group">
                <div class="mod-name" style="color:${offer.rarityColor};">${offer.name}</div>
                <div class="mod-stat">${offer.shortStat}</div>
              </div>
              <span class="mod-cost">${offer.cost.toLocaleString()}g</span>
            </div>
            ${offer.specialSauce ? `<div class="mod-special-sauce">✨ <strong>SPECIAL SAUCE:</strong> ${offer.specialSauce}</div>` : ''}
            <button class="mod-buy-btn ${canBuy ? '' : 'disabled'}" onclick="window.game.equipRarityMarketOffer(${idx})">
              ⚡ BUY & SLOT ${offer.rarityName.toUpperCase()} (${offer.cost.toLocaleString()}g)
            </button>
          </div>
        `;
      }).join('');
    }

    // 4. Render Standard Basic Shipwright Catalog (All 14 Items Always Available at 1.0x Basic Rarity)
    if (storeContainer && tier) {
      storeContainer.innerHTML = this.loadoutCatalog.map(mod => {
        const countEquipped = this.equippedModules.filter(e => (typeof e === 'string' ? e === mod.id : e.baseId === mod.id)).length;
        const canBuy = this.stats.gold >= mod.cost && this.equippedModules.length < tier.maxSlots;
        return `
          <div class="module-store-card rarity-basic">
            <div class="mod-card-top">
              <span class="mod-icon">${mod.icon}</span>
              <div class="mod-title-group">
                <div class="mod-name">${mod.name} ${countEquipped > 0 ? `<span class="equipped-count">x${countEquipped}</span>` : ''}</div>
                <div class="mod-stat">${mod.shortStat}</div>
              </div>
              <span class="mod-cost">${mod.cost}g</span>
            </div>
            <div class="mod-desc">${mod.description}</div>
            <button class="mod-buy-btn ${canBuy ? '' : 'disabled'}" onclick="window.game.equipLoadoutModule('${mod.id}')">
              ➕ SLOT BASIC MODULE (${mod.cost}g • 1 SLOT)
            </button>
          </div>
        `;
      }).join('');
    }
  }

  // --- Island-to-Island Trade Charter System (Sailing Equivalent of DixieDash Orders) ---

  getNearestIsland(x, y) {
    let best = this.islands[0];
    let bestD = Infinity;
    for (const isl of this.islands) {
      const d = Math.hypot(isl.dockX - x, isl.dockY - y);
      if (d < bestD) {
        bestD = d;
        best = isl;
      }
    }
    return { island: best, dist: bestD };
  }

  isPlayerInSafeHarbor() {
    for (const isl of this.islands) {
      if (Math.hypot(this.player.x - isl.dockX, this.player.y - isl.dockY) < 95) {
        return isl;
      }
    }
    return null;
  }

  generateRandomOrder(forceOriginNearPlayer = false) {
    if (this.islands.length < 2) return;

    let origin = this.islands[Math.floor(Math.random() * this.islands.length)];
    if (forceOriginNearPlayer || Math.random() < 0.6) {
      origin = this.getNearestIsland(this.player.x, this.player.y).island;
    }

    const otherIslands = this.islands.filter(i => i.id !== origin.id);
    const destination = otherIslands[Math.floor(Math.random() * otherIslands.length)];

    const goodsList = this.data.cargoGoods || [];
    const good = goodsList[Math.floor(Math.random() * goodsList.length)];
    const clients = this.data.charterClients || [];
    const client = clients[Math.floor(Math.random() * clients.length)];

    const distUnits = Math.hypot(destination.dockX - origin.dockX, destination.dockY - origin.dockY);
    const leagues = (distUnits / 950).toFixed(1);

    // Crates scale directly with player's Cargo Hold capacity + Royal Letter of Marque payoutBonus!
    const crates = this.player.cargoCapacity;
    const diffMult = this.difficulty.payoutMultiplier || 1.0;
    const smugglerMult = this.player.unarmedSmugglerBonus ? 1.25 : 1.0;
    const marqueMult = 1.0 + (this.player.payoutBonus || 0);

    const baseGold = Math.round((45 + parseFloat(leagues) * 28 + crates * good.baseValuePerCrate) * diffMult * smugglerMult * marqueMult);
    const tipGold = Math.round(baseGold * (0.25 + Math.random() * 0.20));
    const totalGold = baseGold + tipGold;

    this.currentOrder = {
      origin,
      destination,
      good,
      client,
      crates,
      leagues,
      baseGold,
      tipGold,
      payout: totalGold,
      accepted: false
    };

    this.appState = 'OFFER';
    this.offerTimer = this.offerDuration;
    if (window.audioManager) window.audioManager.playContractBell();
    this.updatePhoneUI();
    this.updatePhonePill();

    if (this.offerAlertMode === 'PILL_ONLY') {
      this.showOfferToast();
      this.togglePhone(false);
    } else {
      this.dismissOfferToast();
      this.togglePhone(true);
    }
  }

  acceptOrder() {
    if (!this.currentOrder) return;
    this.currentOrder.accepted = true;

    const distToOrigin = Math.hypot(this.player.x - this.currentOrder.origin.dockX, this.player.y - this.currentOrder.origin.dockY);
    if (distToOrigin < 160) {
      this.confirmCargoLoading();
      return;
    }

    this.appState = 'TO_PICKUP';
    this.dismissOfferToast();
    this.rhumbRoute = [
      { x: this.player.x, y: this.player.y },
      { x: this.currentOrder.origin.dockX, y: this.currentOrder.origin.dockY }
    ];

    this.updatePhoneUI();
    this.togglePhone(false);
    if (window.audioManager) window.audioManager.playDoubloonChime();
  }

  declineOrder() {
    this.currentOrder = null;
    this.appState = 'SEARCHING';
    this.rhumbRoute = null;
    this.dismissOfferToast();
    this.updatePhoneUI();
    this.togglePhone(false);
  }

  arriveAtPickupPort() {
    this.appState = 'AT_PICKUP';
    this.updatePhoneUI();
    this.togglePhone(true);
  }

  confirmCargoLoading() {
    if (!this.currentOrder) return;
    this.appState = 'TO_DESTINATION';
    if (window.audioManager) window.audioManager.playDoubloonChime();

    this.rhumbRoute = [
      { x: this.player.x, y: this.player.y },
      { x: this.currentOrder.destination.dockX, y: this.currentOrder.destination.dockY }
    ];

    this.showBanner(
      `📦 LOADED ${this.currentOrder.crates}x ${this.currentOrder.good.name.toUpperCase()}! SAIL TO ${this.currentOrder.destination.name.toUpperCase()}!`,
      'linear-gradient(90deg, #059669, #10b981)'
    );
    this.updatePhoneUI();
    this.togglePhone(false);
  }

  arriveAtDestinationPort() {
    this.appState = 'DROPOFF_MODAL';
    this.togglePhone(false);
    this.showDropoffModal();
  }

  showDropoffModal() {
    const modal = document.getElementById('dropoff-modal');
    if (!modal || !this.currentOrder) return;
    modal.style.display = 'flex';
    const o = this.currentOrder;
    document.getElementById('dropoff-dest-name').innerText = `${o.destination.icon} ${o.destination.name} Wharf`;
    document.getElementById('dropoff-address').innerText = `Charter for ${o.client.name} • ${o.crates}x ${o.good.name}`;
    document.getElementById('dropoff-instructions').innerText = `"${o.client.note}"`;
  }

  completeDelivery(carefulCraneUnload) {
    document.getElementById('dropoff-modal').style.display = 'none';
    if (!this.currentOrder) return;

    if (window.audioManager) window.audioManager.playDoubloonChime();

    const o = this.currentOrder;
    let earnedBase = o.baseGold;
    let earnedTip = o.tipGold;
    let stars = 5;
    let reviewComment = `Every crate of ${o.good.name} arrived dry and sealed! The Harbor Master salutes your seamanship!`;

    if (!carefulCraneUnload && o.client.riskyUnloadHazard) {
      stars = 2;
      earnedTip = 0;
      reviewComment = `You tossed the ${o.good.name} barrels into the harbor surf! Half the shipment got soaked in saltwater!`;
    } else if (this.weather === 'HURRICANE_SQUALL') {
      earnedTip += Math.round(o.baseGold * 0.30);
      reviewComment = `Sailing through a howling hurricane squall to deliver ${o.crates} crates?! Legendary captain! +30% Storm Bonus!`;
      this.unlockAchievement('storm_rider');
    } else if (this.weather === 'SIREN_GLOW') {
      earnedTip += Math.round(o.baseGold * 0.35);
      reviewComment = `Golden tradewinds delivery at sunset! Extra doubloons from the Merchant Guild!`;
    }

    if (this.player.unarmedSmugglerBonus) {
      this.unlockAchievement('smuggler_king');
    }

    const totalGold = earnedBase + earnedTip;
    const scoreEarned = Math.round(totalGold * 10 * (this.difficulty.scoreMultiplier || 1.0));

    this.stats.gold += totalGold;
    this.stats.deliveries += 1;
    this.stats.cratesHauled += o.crates;
    this.stats.reputation = ((this.stats.reputation * (this.stats.deliveries - 1) + stars) / this.stats.deliveries).toFixed(2);
    this.addScore(scoreEarned, `DELIVERED ${o.crates} CRATES`);

    // Auto-patch +40 Hull HP & refresh the Rarity Market upon completing a delivery at port!
    this.player.hull = Math.min(this.player.maxHull, this.player.hull + 40);
    this.rerollRarityMarket(true);
    this.checkAchievements();

    const colors = ['#fbbf24', '#38bdf8', '#34d399', '#f43f5e', '#a855f7'];
    for (let i = 0; i < 55; i++) {
      this.particles.push({
        x: this.player.x + (Math.random() - 0.5) * 30,
        y: this.player.y + (Math.random() - 0.5) * 30,
        vx: (Math.random() - 0.5) * 180,
        vy: (Math.random() - 0.5) * 180 - 40,
        life: 2.2,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    this.currentOrder = null;
    this.rhumbRoute = null;
    this.appState = 'SEARCHING';

    this.showReviewModal(stars, totalGold, scoreEarned, reviewComment);
    this.updatePhoneUI();
    this.updateGaugesUI();
  }

  showReviewModal(stars, goldEarned, scoreEarned, comment) {
    const modal = document.getElementById('review-modal');
    if (!modal) return;
    modal.style.display = 'flex';
    document.getElementById('review-stars').innerText = '★'.repeat(stars) + '☆'.repeat(5 - stars);
    document.getElementById('review-payout').innerText = `+${goldEarned.toLocaleString()} GOLD (+${scoreEarned.toLocaleString()} PTS)`;
    document.getElementById('review-text').innerText = `"${comment}"`;
  }

  closeReviewModal() {
    document.getElementById('review-modal').style.display = 'none';
  }

  // --- Combat, Damage, Salvage, 7-Boss Gauntlet Victory & Endless Cycles ---

  addScore(points, reason) {
    const bonusMult = 1.0 + (this.player ? (this.player.scoreBonus || 0) : 0);
    const pts = Math.round(points * bonusMult);
    this.stats.score += pts;
    if (this.stats.score > this.stats.highScore) {
      this.stats.highScore = this.stats.score;
      try {
        localStorage.setItem('corsairdash_highscore', String(this.stats.highScore));
      } catch (e) {}
    }
    if (reason) {
      this.floatingTexts.push({
        x: this.player.x,
        y: this.player.y - 28,
        text: `+${pts.toLocaleString()} PTS (${reason})`,
        color: '#fde047',
        life: 1.8
      });
    }
    this.checkAchievements();
  }

  applyDamageToPlayer(rawDamage, sourceName, sourcePirate = null) {
    if (this.isPlayerInSafeHarbor()) return; // Safe inside port mooring ring!
    const stormDef = this.weather === 'HURRICANE_SQUALL' ? (this.player.stormArmor || 0) : 0;
    const totalDR = Math.min(0.85, (this.player.damageReduction || 0) + stormDef);
    const reduced = rawDamage * (1 - totalDR);
    this.player.hull = Math.max(0, this.player.hull - reduced);
    this.player.hitFlash = 1.0;

    // Legendary Iron Hull Thorns Reflection!
    if ((this.player.thornsReflect || 0) > 0 && sourcePirate && sourcePirate.hp > 0) {
      const reflected = rawDamage * this.player.thornsReflect;
      sourcePirate.hp -= reflected;
      sourcePirate.hitFlash = 1.0;
    }

    if (rawDamage >= 5 && window.audioManager) {
      window.audioManager.playHitWood();
    }

    if (this.player.hull <= 0) {
      this.handlePlayerShipwreck(sourceName);
    }
  }

  handlePlayerShipwreck(sourceName) {
    if (window.audioManager) window.audioManager.playExplosion();
    const salvageFee = Math.floor(this.stats.gold * 0.15);
    this.stats.gold = Math.max(0, this.stats.gold - salvageFee);
    this.player.hull = this.player.maxHull;
    this.player.x = 0;
    this.player.y = 310;
    this.player.speed = 0;
    this.bossManager.stop();
    this.updateBossHudUI();

    this.showBanner(
      `⚓ SHIPWRECKED BY ${(sourceName || 'THE SEA').toUpperCase()}! TOWED TO PORT ROYAL (-${salvageFee}g SALVAGE) • HIGH SCORE: ${this.stats.highScore.toLocaleString()}!`,
      'linear-gradient(90deg, #991b1b, #dc2626)'
    );
  }

  onPirateSunk(pirate, byPlayer = true) {
    if (window.audioManager) window.audioManager.playExplosion();

    for (let i = 0; i < 24; i++) {
      this.particles.push({
        x: pirate.x,
        y: pirate.y,
        vx: (Math.random() - 0.5) * 140,
        vy: (Math.random() - 0.5) * 140,
        life: 1.1,
        color: i % 2 === 0 ? '#f97316' : '#92400e'
      });
    }

    this.pirateManager.spawnSalvageChest(pirate.x, pirate.y, Math.round(pirate.bountyGold * 0.65), pirate.name);

    if (byPlayer) {
      const bountyMult = 1.0 + (this.player.bountyBonus || 0);
      const earnedGold = Math.round(pirate.bountyGold * bountyMult);
      this.stats.gold += earnedGold;
      this.stats.piratesSunk += 1;
      const pts = Math.round(pirate.bountyScore * (this.difficulty.scoreMultiplier || 1.0));
      this.addScore(pts, `SUNK ${pirate.name.toUpperCase()}`);
      this.checkAchievements();
    }
  }

  collectSalvageChest(chest) {
    if (window.audioManager) window.audioManager.playDoubloonChime();
    const salvageMult = 1.0 + (this.player.salvageGoldBonus || 0);
    const goldEarned = Math.round(chest.gold * salvageMult);
    this.stats.gold += goldEarned;
    if ((this.player.chestHeal || 0) > 0) {
      this.player.hull = Math.min(this.player.maxHull, this.player.hull + this.player.chestHeal);
    }
    this.addScore(goldEarned * 5 * (this.difficulty.scoreMultiplier || 1.0), `PLUNDER CHEST +${goldEarned}G`);
    this.checkAchievements();
  }

  onBossSlain(boss) {
    if (window.audioManager) {
      window.audioManager.playExplosion();
      window.audioManager.playDoubloonChime();
    }

    const bountyMult = 1.0 + (this.player.bountyBonus || 0);
    const goldReward = Math.round(boss.bountyGold * bountyMult);
    this.stats.gold += goldReward;
    this.stats.bossesSlain += 1;

    this.slainBossIdsInCycle.add(boss.id);
    this.allTimeSlainBossIds.add(boss.id);
    try {
      localStorage.setItem('corsairdash_slain_bosses', JSON.stringify(Array.from(this.allTimeSlainBossIds)));
    } catch (e) {}

    const pts = Math.round(boss.bountyScore * (this.difficulty.scoreMultiplier || 1.0));
    this.addScore(pts, `SLAIN ${boss.name}`);

    // Spawn 4 Legendary Salvage Chests around the slain Boss!
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI * 2) / 4;
      this.pirateManager.spawnSalvageChest(
        boss.x + Math.cos(a) * 58,
        boss.y + Math.sin(a) * 58,
        Math.round(280 * (this.bossCycle || 1)),
        'LEGENDARY BOSS HOARD'
      );
    }

    if (this.bossCycle >= 2 || (boss.cycle && boss.cycle >= 2)) {
      this.unlockAchievement('ascended_boss_kill');
    }

    // Refresh Rarity Market with high-tier loot after slaying a Boss!
    this.rerollRarityMarket(true);
    this.checkAchievements();

    // Check Win Condition:
    // 1) All 3 new Elder Bosses (Karkinos, Charybdis, Solar Armada) slain, OR
    // 2) All 7 Bosses in the current cycle slain!
    const totalBossCatalogCount = (this.data.bossMonsters || []).length || 7;
    const threeNewEldersSlain =
      this.slainBossIdsInCycle.has('karkinos') &&
      this.slainBossIdsInCycle.has('charybdis') &&
      this.slainBossIdsInCycle.has('armada_flagship');
    const allSevenSlainInCycle = this.slainBossIdsInCycle.size >= totalBossCatalogCount;

    if (allSevenSlainInCycle || (threeNewEldersSlain && !this.victoryTriggeredThisRun)) {
      const completedCycle = this.bossCycle;
      this.victoryTriggeredThisRun = true;

      if (allSevenSlainInCycle) {
        // Recycle all 7 bosses into the next Endless Cycle with Ascended Mutator Buffs!
        this.bossCycle += 1;
        this.slainBossIdsInCycle.clear();
        try {
          const savedBestCycle = parseInt(localStorage.getItem('corsairdash_best_cycle') || '1', 10) || 1;
          if (this.bossCycle > savedBestCycle) {
            localStorage.setItem('corsairdash_best_cycle', String(this.bossCycle));
          }
        } catch (e) {}
      }

      this.checkAchievements();
      this.showVictoryModal(completedCycle, allSevenSlainInCycle);
    } else {
      const remaining = totalBossCatalogCount - this.slainBossIdsInCycle.size;
      this.showBanner(
        `🏆 ${boss.name} SLAIN! +${goldReward.toLocaleString()}G & +${pts.toLocaleString()} PTS! (${this.slainBossIdsInCycle.size}/${totalBossCatalogCount} CYCLE ${this.bossCycle} BOSSES SLAIN — ${remaining} LEFT)! 🏆`,
        'linear-gradient(90deg, #ca8a04, #eab308)',
        6500
      );
    }

    this.updateBossHudUI();
  }

  showVictoryModal(completedCycle = 1, fullSevenCleared = false) {
    const modal = document.getElementById('victory-modal');
    if (!modal) return;
    modal.style.display = 'flex';

    const titleEl = document.getElementById('victory-modal-title') || document.getElementById('victory-title');
    const subEl = document.getElementById('victory-modal-subtitle');
    const bodyEl = document.getElementById('victory-modal-body') || document.getElementById('victory-desc');

    const mutators = this.data.bossCycleMutators || [];
    const nextMut = mutators[Math.min(this.bossCycle - 1, mutators.length - 1)] || {
      prefix: `CYCLE ${this.bossCycle} ASCENDED`,
      buffLabel: 'Recycled Bosses gain massive HP, Speed & Frenzy!'
    };
    const mutLabel = nextMut.prefix || nextMut.badge || `CYCLE ${this.bossCycle}`;
    const mutDesc = nextMut.buffLabel || nextMut.perkDesc || 'Increased Boss HP, Speed & Volley Fire!';

    if (titleEl) {
      titleEl.innerText = fullSevenCleared
        ? `👑 CYCLE ${completedCycle} CONQUERED — ALL 7 SOVEREIGN BOSSES SLAIN! 👑`
        : `👑 CAMPAIGN VICTORY — ELDER TITANS CONQUERED! 👑`;
    }
    if (subEl) {
      subEl.innerText = fullSevenCleared
        ? `ENTERING ENDLESS CYCLE ${this.bossCycle}: ${mutLabel}`
        : `ELDER ARCHIPELAGO TITANS VANQUISHED!`;
    }
    if (bodyEl) {
      const tier = this.shipTiers[this.currentTierIndex];
      const msgHtml = fullSevenCleared
        ? `You have vanquished all <strong>7 Legendary Terrors of the Archipelago</strong> in Cycle ${completedCycle}! The seas now enter <strong>ENDLESS CYCLE ${this.bossCycle} (${mutLabel})</strong>: all 7 bosses recycle with <em>${mutDesc}</em> and pirate swarm density accelerates further!`
        : `You have slain the <strong>Elder Archipelago Titans</strong> (Karkinos, Charybdis & the El Dorado Solar Armada)! You have won the campaign — keep sailing to finish all 7 bosses and enter <strong>Endless Cycle II+</strong> where bosses recycle with ferocious new buffs!`;
      bodyEl.innerHTML = `
        <div style="margin-bottom: 10px;">${msgHtml}</div>
        <div style="background:#0f172a; border:1px solid #eab308; border-radius:8px; padding:10px;">
          <div style="font-family:'Press Start 2P', monospace; font-size:10px; color:#fde047; margin-bottom:6px;">
            🏆 SCORE: ${this.stats.score.toLocaleString()} • 👑 HIGH SCORE: ${this.stats.highScore.toLocaleString()}
          </div>
          <div style="font-size:12px; color:#e2e8f0;">
            🚢 Vessel: <strong>Lv.${tier ? tier.level : 1} ${tier ? tier.name : 'Sloop'}</strong> • 💀 Total Bosses Slain: <strong>${this.stats.bossesSlain}</strong> • 🏴‍☠️ Pirates Sunk: <strong>${this.stats.piratesSunk}</strong>
          </div>
        </div>
      `;
    }
  }

  closeVictoryModalAndContinue() {
    const modal = document.getElementById('victory-modal');
    if (modal) modal.style.display = 'none';
    this.showBanner(
      `🌊 ENDLESS VOYAGE CONTINUES — CYCLE ${this.bossCycle} ACTIVE! HUNT THE RECYCLED TITANS FOR RECORD HIGH SCORES!`,
      'linear-gradient(90deg, #7c3aed, #db2777)',
      6000
    );
  }

  onBossOutrun(boss) {
    if (window.audioManager) window.audioManager.playDoubloonChime();
    this.stats.gold += 140;
    this.stats.bossesOutrun += 1;
    const pts = Math.round(700 * (this.difficulty.scoreMultiplier || 1.0));
    this.addScore(pts, `OUTRAN ${boss.name}`);

    this.showBanner(
      `⛵ DARING ESCAPE! YOU OUTRAN ${boss.name} (+140 GOLD & +${pts} PTS)!`,
      'linear-gradient(90deg, #0284c7, #06b6d4)'
    );
    this.updateBossHudUI();
  }

  updateBossHudUI() {
    const hud = document.getElementById('boss-hud-bar');
    if (!hud) return;

    const b = this.bossManager.activeBoss;
    if (!b) {
      hud.style.display = 'none';
      return;
    }

    hud.style.display = 'flex';
    const hpPct = Math.max(0, Math.min(100, (b.hp / b.maxHp) * 100));
    const dist = Math.round(Math.hypot(this.player.x - b.x, this.player.y - b.y));
    const esc = b.escapeDistance || 2100;

    const titleEl = document.getElementById('boss-hud-title');
    const hpFill = document.getElementById('boss-hud-hp-fill');
    const metaEl = document.getElementById('boss-hud-meta');

    if (titleEl) titleEl.innerText = `${b.name} (BOUNTY: +${b.bountyGold.toLocaleString()}G)`;
    if (hpFill) hpFill.style.width = `${hpPct}%`;
    if (metaEl) metaEl.innerText = `HP: ${Math.ceil(b.hp).toLocaleString()}/${b.maxHp.toLocaleString()} • OUTRUN: ${dist}/${esc}m ${b.buffLabel ? '• ' + b.buffLabel : ''}`;
  }

  // --- Achievements & High Score Hall of Fame System ---

  unlockAchievement(achId) {
    if (!achId || this.unlockedAchievements.has(achId)) return;
    const catalog = this.data.achievementsCatalog || [];
    const ach = catalog.find(a => a.id === achId);
    if (!ach) return;

    this.unlockedAchievements.add(achId);
    try {
      localStorage.setItem('corsairdash_achievements', JSON.stringify(Array.from(this.unlockedAchievements)));
    } catch (e) {}

    if (ach.rewardGold) {
      this.stats.gold += ach.rewardGold;
    }
    if (ach.rewardScore) {
      this.addScore(ach.rewardScore, `ACHIEVEMENT: ${ach.title}`);
    }

    if (window.audioManager) window.audioManager.playDoubloonChime();
    this.floatingTexts.push({
      x: this.player.x,
      y: this.player.y - 48,
      text: `🏆 ACHIEVEMENT: ${ach.title.toUpperCase()} (+${ach.rewardGold || 0}G)!`,
      color: '#fbbf24',
      life: 2.8
    });
  }

  checkAchievements() {
    if (this.stats.deliveries >= 1) this.unlockAchievement('first_delivery');
    if (
      this.stats.deliveries >= 3 &&
      (this.player.cannons || 0) === 0 &&
      (this.player.autoTurrets || 0) === 0 &&
      !this.player.mortarUnlocked
    ) {
      this.unlockAchievement('pacifist_smuggler');
    }
    if (this.stats.cratesHauled >= 50) this.unlockAchievement('merchant_prince');
    if (this.stats.piratesSunk >= 15) this.unlockAchievement('pirate_hunter_15');
    if (this.stats.piratesSunk >= 50) this.unlockAchievement('pirate_hunter_50');

    if (this.allTimeSlainBossIds.has('kraken')) this.unlockAchievement('slay_kraken');
    if (this.allTimeSlainBossIds.has('dutchman')) this.unlockAchievement('slay_dutchman');
    if (this.allTimeSlainBossIds.has('megalodon')) this.unlockAchievement('slay_megalodon');
    if (this.allTimeSlainBossIds.has('leviathan')) this.unlockAchievement('slay_leviathan');
    if (this.allTimeSlainBossIds.has('karkinos')) this.unlockAchievement('slay_karkinos');
    if (this.allTimeSlainBossIds.has('charybdis')) this.unlockAchievement('slay_charybdis');
    if (this.allTimeSlainBossIds.has('armada_flagship')) this.unlockAchievement('slay_armada');

    if (
      this.allTimeSlainBossIds.has('karkinos') &&
      this.allTimeSlainBossIds.has('charybdis') &&
      this.allTimeSlainBossIds.has('armada_flagship')
    ) {
      this.unlockAchievement('elder_trio_win');
    }
    if (this.allTimeSlainBossIds.size >= 7) {
      this.unlockAchievement('all_seven_bosses');
    }
    if (this.bossCycle >= 2 && this.stats.bossesSlain > 7) {
      this.unlockAchievement('ascended_boss_kill');
    }
    if (this.equippedModules.some(e => typeof e === 'object' && e && e.rarity === 'legendary')) {
      this.unlockAchievement('legendary_loadout');
    }
    if ((this.stats.maxTierReached || 1) >= 10 || this.currentTierIndex >= 9) {
      this.unlockAchievement('tier_10_ark');
    }
  }

  toggleAchievementsModal(open) {
    const modal = document.getElementById('achievements-modal');
    if (!modal) return;
    if (open === undefined) {
      open = modal.style.display === 'none' || !modal.style.display;
    }
    modal.style.display = open ? 'flex' : 'none';
    if (open) {
      if (window.audioManager) window.audioManager.resume();
      this.checkAchievements();
      this.renderAchievementsModalUI();
    }
  }

  renderAchievementsModalUI() {
    const summaryEl = document.getElementById('achievements-highscore-banner') || document.getElementById('achievements-highscore-summary');
    const bossCycleLabel = document.getElementById('boss-cycle-badge-label');
    const bossGridEl = document.getElementById('boss-checklist-grid') || document.getElementById('achievements-boss-checklist');
    const achCountLabel = document.getElementById('achievements-count-label');
    const achGridEl = document.getElementById('achievements-list-grid') || document.getElementById('achievements-grid');

    const catalog = this.data.achievementsCatalog || [];
    const bosses = this.data.bossMonsters || [];

    if (bossCycleLabel) {
      bossCycleLabel.innerText = `CYCLE ${this.bossCycle} (${this.slainBossIdsInCycle.size}/${bosses.length} SLAIN)`;
    }
    if (achCountLabel) {
      achCountLabel.innerText = `${this.unlockedAchievements.size} / ${catalog.length} UNLOCKED`;
    }

    if (summaryEl) {
      summaryEl.innerHTML = `
        <div class="shipyard-stat-pill"><span>👑 ALL-TIME HI-SCORE:</span><strong class="font-gold">${this.stats.highScore.toLocaleString()}</strong></div>
        <div class="shipyard-stat-pill"><span>🏆 VOYAGE SCORE:</span><strong class="font-cyan">${this.stats.score.toLocaleString()}</strong></div>
        <div class="shipyard-stat-pill"><span>🔁 BOSS CYCLE:</span><strong class="font-amber">CYCLE ${this.bossCycle} (${this.slainBossIdsInCycle.size}/${bosses.length})</strong></div>
        <div class="shipyard-stat-pill"><span>💀 BOSSES SLAIN:</span><strong>${this.stats.bossesSlain}</strong></div>
        <div class="shipyard-stat-pill"><span>🏴‍☠️ PIRATES SUNK:</span><strong>${this.stats.piratesSunk}</strong></div>
        <div class="shipyard-stat-pill"><span>🎖️ UNLOCKED:</span><strong style="color:#34d399;">${this.unlockedAchievements.size} / ${catalog.length}</strong></div>
      `;
    }

    if (bossGridEl) {
      bossGridEl.innerHTML = bosses.map((b, idx) => {
        const slainThisCycle = this.slainBossIdsInCycle.has(b.id);
        const slainEver = this.allTimeSlainBossIds.has(b.id);
        return `
          <div class="boss-check-card ${slainThisCycle ? 'slain-cycle' : (slainEver ? 'slain-ever' : 'unslain')}">
            <div class="boss-check-num">#${idx + 1} ${slainThisCycle ? '✅ SLAIN (CYCLE ' + this.bossCycle + ')' : (slainEver ? '🏆 SLAIN (PAST CYCLE)' : '⚔️ UNTAMED')}</div>
            <div class="boss-check-name">${b.icon || '💀'} ${b.name}</div>
            <div class="boss-check-meta">${b.title || b.subtitle || 'Sovereign Boss'} • +${b.bountyGold.toLocaleString()}g</div>
          </div>
        `;
      }).join('');
    }

    if (achGridEl) {
      achGridEl.innerHTML = catalog.map(ach => {
        const unlocked = this.unlockedAchievements.has(ach.id);
        return `
          <div class="achievement-card ${unlocked ? 'unlocked' : 'locked'}">
            <div class="ach-icon">${unlocked ? ach.icon : '🔒'}</div>
            <div class="ach-info">
              <div class="ach-title">${ach.title}</div>
              <div class="ach-desc">${ach.desc}</div>
            </div>
            <div class="ach-badge">${unlocked ? '✅ UNLOCKED' : `+${ach.rewardGold || 0}G`}</div>
          </div>
        `;
      }).join('');
    }
  }

  // --- Event Director (7 Boss Monsters & Maritime Weather Events) ---

  updateEventDirector(dt) {
    this.windShiftTimer += dt;
    if (this.windShiftTimer > 18) {
      this.windShiftTimer = 0;
      this.windAngle += (Math.random() - 0.5) * 0.45;
      this.windSpeed = Math.round(14 + Math.random() * 14);
    }

    if (this.activeEvent) {
      this.eventTimeRemaining -= dt;
      if (this.eventTimeRemaining <= 0) {
        this.endCurrentEvent();
      }
    } else {
      this.nextEventTimer -= dt;
      if (this.nextEventTimer <= 0) {
        this.triggerRandomMaritimeEvent();
        // Recycled boss cycles spawn events slightly faster!
        const cycleSpeedup = Math.max(0.55, 1.0 - (this.bossCycle - 1) * 0.10);
        this.nextEventTimer = (this.difficulty.bossIntervalSec || 75) * cycleSpeedup * (0.75 + Math.random() * 0.35);
      }
    }
  }

  triggerRandomMaritimeEvent(forcedType) {
    const pool = [
      'BOSS_AUTO',
      'BOSS_AUTO',
      'BOSS_AUTO',
      'HURRICANE_SQUALL',
      'SIREN_GLOW',
      'BLACK_ARMADA'
    ];
    const chosen = forcedType || pool[Math.floor(Math.random() * pool.length)];
    this.activeEvent = chosen;

    if (chosen.startsWith('BOSS_')) {
      const rawId = chosen.replace('BOSS_', '').toLowerCase();
      const bossId = rawId === 'auto' ? null : rawId;
      const boss = this.bossManager.spawnBoss(bossId, this.player.x, this.player.y, this);
      this.eventTimeRemaining = 100;
      if (boss) {
        this.showBanner(boss.warningText, 'linear-gradient(90deg, #7e22ce, #db2777)', 7000);
      }
    } else if (chosen === 'HURRICANE_SQUALL') {
      this.eventTimeRemaining = 55;
      this.weather = 'HURRICANE_SQUALL';
      this.windSpeed = 32;
      this.showBanner('⛈️ GALE WARNING: CARIBBEAN HURRICANE SQUALL! +32 KT WINDS & +30% STORM PAYOUTS! ⛈️', 'linear-gradient(90deg, #1e3a8a, #0284c7)', 6000);
    } else if (chosen === 'SIREN_GLOW') {
      this.eventTimeRemaining = 60;
      this.weather = 'SIREN_GLOW';
      this.showBanner('🌅 GOLDEN HORIZON: SIREN\'S SUNSET TRADEWINDS! +35% CHARTER BONUS TIPS! 🌅', 'linear-gradient(90deg, #b45309, #f59e0b)', 6000);
    } else if (chosen === 'BLACK_ARMADA') {
      this.eventTimeRemaining = 50;
      const packSize = 5 + Math.min(6, (this.bossCycle - 1) * 2);
      for (let i = 0; i < packSize; i++) {
        this.pirateManager.spawnPirate(this.player.x, this.player.y, this.difficulty, this.stats.voyageSeconds, true, this);
      }
      this.showBanner(`🏴‍☠️ BLACK ARMADA AMBUSH! ${packSize} PIRATE HUNTERS SPOTTED ON THE HORIZON! 🏴‍☠️`, 'linear-gradient(90deg, #991b1b, #ef4444)', 6000);
    }
  }

  endCurrentEvent() {
    this.activeEvent = null;
    this.weather = 'CLEAR_TRADEWINDS';
    this.windSpeed = 18;
  }

  // --- Player Sailing Physics & Obstacle Collisions ---

  getWindMultiplierForAngle(shipAngle) {
    let diff = Math.abs(shipAngle - this.windAngle);
    while (diff > Math.PI * 2) diff -= Math.PI * 2;
    if (diff > Math.PI) diff = Math.PI * 2 - diff;

    // diff == 0 means sailing directly WITH the wind (tailwind / running)
    // diff == PI means sailing directly INTO the wind (headwind / in irons)
    const alignment = Math.cos(diff); // +1 with wind, -1 into wind
    if (alignment >= 0) {
      return 1.0 + alignment * (this.difficulty.tailwindBonus || 0.30);
    } else {
      const rawPenalty = Math.abs(alignment) * (this.difficulty.headwindPenalty || 0.35);
      const mitigatedPenalty = rawPenalty * (1 - (this.player.windEfficiency || 0));
      return Math.max(0.45, 1.0 - mitigatedPenalty);
    }
  }

  updatePlayerPhysics(dt) {
    const p = this.player;
    p.prevX = p.x;
    p.prevY = p.y;

    if (p.hitFlash > 0) p.hitFlash = Math.max(0, p.hitFlash - dt * 4);
    if (p.reloadTimer > 0) p.reloadTimer = Math.max(0, p.reloadTimer - dt);
    if (p.barrelCooldown > 0) p.barrelCooldown = Math.max(0, p.barrelCooldown - dt);

    // Passive Master Carpenter Crew Hull Regeneration (plus gentle harbor repair when docked)
    const inHarbor = this.isPlayerInSafeHarbor();
    const totalRegen = (p.regenPerSec || 0) + (inHarbor ? 8.0 : 0);
    if (totalRegen > 0 && p.hull < p.maxHull) {
      p.hull = Math.min(p.maxHull, p.hull + totalRegen * dt);
    }

    const windMult = this.getWindMultiplierForAngle(p.angle);
    const effectiveMaxSpeed = p.maxSpeed * windMult;

    if (this.keys['arrowup'] || this.keys['w']) {
      p.speed = Math.min(effectiveMaxSpeed, p.speed + p.accel * windMult * dt);
    } else if (this.keys['arrowdown'] || this.keys['s']) {
      p.speed = Math.max(-p.maxSpeed * 0.35, p.speed - p.accel * dt * 1.15);
    } else {
      p.speed *= (this.difficulty.hullInertia || 0.986);
    }

    // Spring-back virtual helm wheel
    if (this.wheelSteerInput !== 0 && !this.isTouchingWheel) {
      this.wheelSteerInput *= 0.76;
      if (Math.abs(this.wheelSteerInput) < 0.03) this.wheelSteerInput = 0;
      const wheelEl = document.getElementById('touch-steering-wheel');
      if (wheelEl && !this.tiltEnabled) {
        wheelEl.style.transform = `rotate(${this.wheelSteerInput * 80}deg)`;
      }
    }

    let steerValue = 0;
    if (this.keys['arrowleft'] || this.keys['a']) steerValue -= 1.0;
    if (this.keys['arrowright'] || this.keys['d']) steerValue += 1.0;
    if (this.wheelSteerInput !== 0) steerValue = this.wheelSteerInput;
    else if (this.tiltEnabled && this.tiltSteerInput !== 0) steerValue = this.tiltSteerInput;

    // Anchor-Drift Turn [Spacebar] allows sharp broadside pivoting!
    p.drifting = Boolean(this.keys[' ']);
    const driftTurnBoost = p.drifting ? 1.55 : 1.0;

    if (steerValue !== 0) {
      const speedFactor = Math.min(1.0, Math.abs(p.speed) / Math.max(1, p.maxSpeed) + 0.35);
      const dirSign = p.speed >= -2 ? 1 : -1;
      p.angle += steerValue * p.turnSpeed * (this.difficulty.steerResponsiveness || 1.0) * driftTurnBoost * dt * dirSign * speedFactor;
    }

    if (p.drifting && Math.abs(p.speed) > 18) {
      p.speed *= 0.975;
      if (Math.random() < 0.35 && window.audioManager) window.audioManager.playSplash();
    }

    // Spawn Foaming Ocean Wake Trail
    if (Math.abs(p.speed) > 12 && Math.random() < 0.55) {
      this.wakeMarks.push({
        x: p.x - Math.cos(p.angle) * (p.length * 0.45),
        y: p.y - Math.sin(p.angle) * (p.length * 0.45),
        angle: p.angle,
        width: p.width * (p.drifting ? 1.25 : 0.85),
        life: 1.0
      });
    }

    p.x += Math.cos(p.angle) * p.speed * dt * 2.55;
    p.y += Math.sin(p.angle) * p.speed * dt * 2.55;

    // World Boundary Enforcement
    const b = this.data.worldBounds;
    if (p.x < b.minX) { p.x = b.minX + 20; p.speed = -p.speed * 0.4; }
    if (p.x > b.maxX) { p.x = b.maxX - 20; p.speed = -p.speed * 0.4; }
    if (p.y < b.minY) { p.y = b.minY + 20; p.speed = -p.speed * 0.4; }
    if (p.y > b.maxY) { p.y = b.maxY - 20; p.speed = -p.speed * 0.4; }

    this.handleMaritimeHazardsAndCollisions(dt);

    if (window.audioManager) {
      window.audioManager.updateSailingAudio(p.speed, p.maxSpeed, windMult - 1.0);
    }

    this.camera.x += (p.x - this.camera.x) * dt * 5.2;
    this.camera.y += (p.y - this.camera.y) * dt * 5.2;
  }

  handleMaritimeHazardsAndCollisions(dt) {
    const p = this.player;

    // 1. Island Shore Collisions (Push safely off beach, while allowing docking at Wharf!)
    for (const isl of this.islands) {
      const d = Math.hypot(p.x - isl.x, p.y - isl.y);
      const minDist = isl.radius + p.width * 0.5;
      if (d < minDist) {
        const pushAngle = Math.atan2(p.y - isl.y, p.x - isl.x);
        p.x = isl.x + Math.cos(pushAngle) * minDist;
        p.y = isl.y + Math.sin(pushAngle) * minDist;
        p.speed *= -0.35;
      }
    }

    // 2. Jagged 3D Sea Stacks Collisions
    for (const rock of this.data.seaStacks || []) {
      const d = Math.hypot(p.x - rock.x, p.y - rock.y);
      const minDist = rock.radius + p.width * 0.55;
      if (d < minDist) {
        const pushAngle = Math.atan2(p.y - rock.y, p.x - rock.x);
        p.x = rock.x + Math.cos(pushAngle) * minDist;
        p.y = rock.y + Math.sin(pushAngle) * minDist;
        if (Math.abs(p.speed) > 15) {
          this.applyDamageToPlayer(8 * (this.difficulty.reefDamageMult || 1.0), 'Jagged Sea Stack');
        }
        p.speed = -p.speed * 0.4;
      }
    }

    // 3. Razor Coral Reefs (Slowdown & Hull Scrape unless protected by Copper-Sheathed Keel)
    for (const reef of this.data.coralReefs || []) {
      const d = Math.hypot(p.x - reef.x, p.y - reef.y);
      if (d < reef.radius) {
        const prot = p.reefProtection || 0;
        p.speed *= (1 - 0.025 * (1 - prot));
        if (Math.abs(p.speed) > 20 && prot < 0.8) {
          this.applyDamageToPlayer(6 * dt * (1 - prot) * (this.difficulty.reefDamageMult || 1.0), 'Razor Coral Reef');
        }
      }
    }

    // 4. Spinning Whirlpools / Maelstroms (Pull inward + Swirl angle)
    for (const v of this.data.whirlpools || []) {
      const d = Math.hypot(p.x - v.x, p.y - v.y);
      if (d < v.radius && d > 5) {
        const pullAngle = Math.atan2(v.y - p.y, v.x - p.x);
        const factor = 1 - d / v.radius;
        p.x += Math.cos(pullAngle) * v.pullStrength * factor * dt;
        p.y += Math.sin(pullAngle) * v.pullStrength * factor * dt;
        p.angle += v.spinDir * 1.4 * factor * dt;
        if (d < 28) {
          this.applyDamageToPlayer(14 * dt, 'Maelstrom Abyss');
        }
      }
    }

    // 5. Floating Explosive Powder Mines
    for (const m of this.data.floatingMines || []) {
      if (!m.active) continue;
      const d = Math.hypot(p.x - m.x, p.y - m.y);
      if (d < m.radius + p.width * 0.65) {
        m.active = false;
        m.respawnTimer = 45;
        if (window.audioManager) window.audioManager.playExplosion();
        this.applyDamageToPlayer(28, 'Floating Powder Mine');
        for (let i = 0; i < 20; i++) {
          this.particles.push({
            x: m.x,
            y: m.y,
            vx: (Math.random() - 0.5) * 160,
            vy: (Math.random() - 0.5) * 160,
            life: 0.9,
            color: '#f97316'
          });
        }
      }
    }

    // 6. Check Port Pickup & Delivery Triggers
    if (this.appState === 'TO_PICKUP' && this.currentOrder) {
      const orig = this.currentOrder.origin;
      if (Math.hypot(p.x - orig.dockX, p.y - orig.dockY) < 90) {
        this.confirmCargoLoading();
      }
    } else if (this.appState === 'TO_DESTINATION' && this.currentOrder) {
      const dest = this.currentOrder.destination;
      if (Math.hypot(p.x - dest.dockX, p.y - dest.dockY) < 90) {
        this.arriveAtDestinationPort();
      }
    }
  }

  updatePlayerProjectilesAndBarrels(dt) {
    // 1. Update Player Cannonballs, Swivel Shots & Mortar Shells
    for (let i = this.playerProjectiles.length - 1; i >= 0; i--) {
      const proj = this.playerProjectiles[i];
      proj.x += proj.vx * dt;
      proj.y += proj.vy * dt;
      proj.life -= dt;

      let hit = false;
      let hitTarget = null;

      // Hit Boss Monster?
      const boss = this.bossManager.activeBoss;
      if (boss && Math.hypot(proj.x - boss.x, proj.y - boss.y) < 56) {
        boss.hp -= proj.damage;
        boss.hitFlash = 1.0;
        if (proj.hellfireDPS > 0) {
          boss.burnDPS = Math.max(boss.burnDPS || 0, proj.hellfireDPS);
          boss.burnTimer = 4.0;
        }
        if (proj.slowOnHit > 0) {
          boss.slowFactor = Math.max(boss.slowFactor || 0, proj.slowOnHit);
          boss.slowTimer = 3.5;
        }
        if (window.audioManager) window.audioManager.playHitWood();
        this.spawnMuzzleSmoke(proj.x, proj.y);
        hit = true;
        hitTarget = boss;
      }

      // Hit Pirate Ship?
      if (!hit) {
        for (let pIdx = this.pirateManager.pirates.length - 1; pIdx >= 0; pIdx--) {
          const pir = this.pirateManager.pirates[pIdx];
          if (Math.hypot(proj.x - pir.x, proj.y - pir.y) < pir.width * 0.95) {
            pir.hp -= proj.damage;
            pir.hitFlash = 1.0;
            if (proj.hellfireDPS > 0) {
              pir.burnDPS = Math.max(pir.burnDPS || 0, proj.hellfireDPS);
              pir.burnTimer = 4.0;
            }
            if (proj.slowOnHit > 0) {
              pir.slowFactor = Math.max(pir.slowFactor || 0, proj.slowOnHit);
              pir.slowTimer = 4.0;
            }
            if (window.audioManager) window.audioManager.playHitWood();
            this.spawnMuzzleSmoke(proj.x, proj.y);
            hitTarget = pir;
            if (pir.hp <= 0) {
              this.onPirateSunk(pir, true);
              this.pirateManager.pirates.splice(pIdx, 1);
            }
            hit = true;
            break;
          }
        }
      }

      // Hit Floating Sea Mine?
      if (!hit) {
        for (const m of this.data.floatingMines || []) {
          if (m.active && Math.hypot(proj.x - m.x, proj.y - m.y) < m.radius + 8) {
            m.active = false;
            m.respawnTimer = 45;
            if (window.audioManager) window.audioManager.playExplosion();
            this.addScore(150, 'CLEARED SEA MINE');
            hit = true;
            break;
          }
        }
      }

      // Trigger Chain-Lightning on Hit (Legendary / Special Sauce)!
      if (hit && hitTarget && (proj.chainLightningChance || 0) > 0 && Math.random() < proj.chainLightningChance) {
        let arcTarget = null;
        let arcDist = 210;
        for (const pir of this.pirateManager.pirates) {
          if (pir === hitTarget || pir.hp <= 0) continue;
          const d = Math.hypot(pir.x - proj.x, pir.y - proj.y);
          if (d < arcDist) {
            arcDist = d;
            arcTarget = pir;
          }
        }
        if (!arcTarget && boss && boss !== hitTarget && Math.hypot(boss.x - proj.x, boss.y - proj.y) < 230) {
          arcTarget = boss;
        }
        if (arcTarget) {
          const arcDmg = Math.round(proj.damage * 0.75);
          arcTarget.hp -= arcDmg;
          arcTarget.hitFlash = 1.0;
          this.lightningArcs.push({
            x1: proj.x,
            y1: proj.y,
            x2: arcTarget.x,
            y2: arcTarget.y,
            life: 0.25
          });
          if (arcTarget.hp <= 0 && this.pirateManager.pirates.includes(arcTarget)) {
            const idx = this.pirateManager.pirates.indexOf(arcTarget);
            if (idx !== -1) {
              this.onPirateSunk(arcTarget, true);
              this.pirateManager.pirates.splice(idx, 1);
            }
          }
        }
      }

      // Mortar Bombard AoE Splash Explosion on Hit or Max Range!
      if (proj.isMortar && (hit || proj.life <= 0)) {
        const splashR = proj.splashRadius || 68;
        if (window.audioManager) window.audioManager.playExplosion();
        for (let k = 0; k < 22; k++) {
          this.particles.push({
            x: proj.x,
            y: proj.y,
            vx: (Math.random() - 0.5) * 165,
            vy: (Math.random() - 0.5) * 165,
            life: 0.85,
            color: k % 2 === 0 ? '#f97316' : '#fde047'
          });
        }
        for (let pIdx = this.pirateManager.pirates.length - 1; pIdx >= 0; pIdx--) {
          const pir = this.pirateManager.pirates[pIdx];
          if (pir === hitTarget) continue;
          if (Math.hypot(pir.x - proj.x, pir.y - proj.y) < splashR) {
            pir.hp -= Math.round(proj.damage * 0.75);
            pir.hitFlash = 1.0;
            pir.burnDPS = Math.max(pir.burnDPS || 0, 12);
            pir.burnTimer = 3.5;
            if (pir.hp <= 0) {
              this.onPirateSunk(pir, true);
              this.pirateManager.pirates.splice(pIdx, 1);
            }
          }
        }
        if (boss && boss !== hitTarget && Math.hypot(boss.x - proj.x, boss.y - proj.y) < splashR + 30) {
          boss.hp -= Math.round(proj.damage * 0.75);
          boss.hitFlash = 1.0;
        }
        this.playerProjectiles.splice(i, 1);
        continue;
      }

      if (hit || proj.life <= 0) {
        if (!hit) this.spawnWaterSplash(proj.x, proj.y, 4);
        this.playerProjectiles.splice(i, 1);
      }
    }

    // 2. Update Dropped Greek Fire Barrels (with Optional Legendary Magnetism!)
    for (let i = this.droppedFireBarrels.length - 1; i >= 0; i--) {
      const b = this.droppedFireBarrels[i];
      b.life -= dt;
      if (b.life <= 0) {
        this.droppedFireBarrels.splice(i, 1);
        continue;
      }

      let detonated = false;
      for (let pIdx = this.pirateManager.pirates.length - 1; pIdx >= 0; pIdx--) {
        const pir = this.pirateManager.pirates[pIdx];
        const dist = Math.hypot(b.x - pir.x, b.y - pir.y);
        if (b.magnetic && dist < 145 && dist > 10) {
          const pullA = Math.atan2(b.y - pir.y, b.x - pir.x);
          pir.x += Math.cos(pullA) * 85 * dt;
          pir.y += Math.sin(pullA) * 85 * dt;
        }
        if (dist < b.radius + pir.width) {
          pir.hp -= b.damage;
          pir.hitFlash = 1.0;
          pir.burnDPS = Math.max(pir.burnDPS || 0, 18);
          pir.burnTimer = 4.0;
          detonated = true;
          if (pir.hp <= 0) {
            this.onPirateSunk(pir, true);
            this.pirateManager.pirates.splice(pIdx, 1);
          }
        }
      }

      const boss = this.bossManager.activeBoss;
      if (boss && Math.hypot(b.x - boss.x, b.y - boss.y) < 62) {
        boss.hp -= b.damage;
        boss.hitFlash = 1.0;
        boss.burnDPS = Math.max(boss.burnDPS || 0, 22);
        boss.burnTimer = 4.0;
        detonated = true;
      }

      if (detonated) {
        if (window.audioManager) window.audioManager.playExplosion();
        for (let k = 0; k < 20; k++) {
          this.particles.push({
            x: b.x,
            y: b.y,
            vx: (Math.random() - 0.5) * 150,
            vy: (Math.random() - 0.5) * 150,
            life: 0.9,
            color: '#f97316'
          });
        }
        this.droppedFireBarrels.splice(i, 1);
      }
    }
  }

  spawnMuzzleSmoke(x, y) {
    for (let i = 0; i < 5; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 55,
        vy: (Math.random() - 0.5) * 55,
        life: 0.45 + Math.random() * 0.25,
        color: i % 2 === 0 ? '#fde047' : '#cbd5e1'
      });
    }
  }

  spawnWaterSplash(x, y, count = 5) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 45,
        vy: (Math.random() - 0.5) * 45,
        life: 0.35,
        color: '#e0f2fe'
      });
    }
  }

  // --- Main Update Loop ---

  update(dt) {
    this.stats.voyageSeconds += dt;

    this.updatePlayerPhysics(dt);
    this.fireSwivelCulverin(dt);
    this.fireMortarBombard(dt);

    // Automatic Greek Fire Stern Barrel Dispenser (Epic/Legendary Greek Fire perk!)
    if ((this.player.autoDropBarrelInterval || 0) > 0 && this.player.fireBarrelsCount > 0) {
      this.player.autoBarrelTimer = (this.player.autoBarrelTimer || 0) + dt;
      if (this.player.autoBarrelTimer >= this.player.autoDropBarrelInterval) {
        this.player.autoBarrelTimer = 0;
        this.dropGreekFireBarrel(true);
      }
    }

    this.updatePlayerProjectilesAndBarrels(dt);

    this.pirateManager.update(dt, this.player, this.difficulty, this.stats.voyageSeconds, this);
    this.bossManager.update(dt, this.player, this);
    this.map.update(dt);
    this.updateEventDirector(dt);

    // Keep rhumb line anchored to player's bow
    if (this.rhumbRoute && this.rhumbRoute.length >= 2) {
      this.rhumbRoute[0].x = this.player.x;
      this.rhumbRoute[0].y = this.player.y;
    }

    if (this.appState === 'OFFER') {
      this.offerTimer -= dt;
      if (this.offerTimer <= 0) {
        this.declineOrder();
      } else {
        const sec = Math.max(0, Math.ceil(this.offerTimer));
        const timerElem = document.getElementById('offer-countdown');
        if (timerElem) timerElem.innerText = sec;
        const toastTimer = document.getElementById('toast-timer');
        if (toastTimer) toastTimer.innerText = `${sec}s`;
        const pillBadge = document.getElementById('phone-pill-badge');
        if (pillBadge && this.currentOrder) {
          pillBadge.innerText = `+${this.currentOrder.payout}g (${sec}s)`;
        }
      }
    }

    if (this.appState === 'SEARCHING') {
      this.offerCheckTimer += dt;
      if (this.offerCheckTimer > 3.2) {
        this.offerCheckTimer = 0;
        this.generateRandomOrder();
      }
    }

    for (let i = this.wakeMarks.length - 1; i >= 0; i--) {
      this.wakeMarks[i].life -= dt * 0.45;
      if (this.wakeMarks[i].life <= 0) this.wakeMarks.splice(i, 1);
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.life -= dt;
      if (pt.life <= 0) this.particles.splice(i, 1);
    }

    for (let i = this.lightningArcs.length - 1; i >= 0; i--) {
      this.lightningArcs[i].life -= dt;
      if (this.lightningArcs[i].life <= 0) this.lightningArcs.splice(i, 1);
    }

    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= 28 * dt;
      ft.life -= dt;
      if (ft.life <= 0) this.floatingTexts.splice(i, 1);
    }

    this.updateGaugesUI();
  }

  // --- HUD & Charter Ledger UI Updates ---

  updateGaugesUI() {
    const p = this.player;
    const speedEl = document.getElementById('speed-display');
    if (speedEl) speedEl.innerText = Math.abs(Math.round(p.speed * 0.45));

    const hullFill = document.getElementById('gauge-hull-fill');
    if (hullFill) {
      const pct = Math.max(0, Math.min(100, (p.hull / p.maxHull) * 100));
      hullFill.style.width = `${pct}%`;
    }

    const cannonFill = document.getElementById('gauge-cannon-fill');
    if (cannonFill) {
      const readyPct = p.reloadTimer <= 0 ? 100 : Math.round((1 - p.reloadTimer / p.reloadTime) * 100);
      cannonFill.style.width = `${readyPct}%`;
    }

    const touchBarrelBtn = document.getElementById('touch-barrel');
    if (touchBarrelBtn) {
      touchBarrelBtn.style.display = p.fireBarrelsCount > 0 ? 'flex' : 'none';
    }

    const goldEl = document.getElementById('today-earnings');
    if (goldEl) goldEl.innerText = `🪙 ${Math.floor(this.stats.gold).toLocaleString()}g`;

    const scoreEl = document.getElementById('today-score');
    if (scoreEl) scoreEl.innerText = `🏆 ${this.stats.score.toLocaleString()}`;

    const highEl = document.getElementById('today-highscore');
    if (highEl) highEl.innerText = `👑 HI: ${this.stats.highScore.toLocaleString()}`;

    const bossCycleHud = document.getElementById('boss-cycle-hud');
    if (bossCycleHud) {
      bossCycleHud.innerText = `💀 ${this.slainBossIdsInCycle.size}/7 (C${this.bossCycle})`;
    }

    const windEl = document.getElementById('weather-status');
    if (windEl) {
      const dirs = ['E', 'SE', 'S', 'SW', 'W', 'NW', 'N', 'NE'];
      const normA = ((this.windAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      const dirStr = dirs[Math.round((normA / (Math.PI * 2)) * 8) % 8];
      const cycleStr = this.bossCycle > 1 ? ` • C${this.bossCycle}` : '';
      windEl.innerText = `🧭 ${dirStr} ${this.windSpeed}KT • 🏴‍☠️ ${this.pirateManager.pirates.length}${cycleStr}`;
    }

    const tier = this.shipTiers[this.currentTierIndex];
    const loadoutBtn = document.getElementById('loadout-hud-btn');
    if (loadoutBtn && tier) {
      loadoutBtn.innerText = `⚓ Lv.${tier.level} (${this.equippedModules.length}/${tier.maxSlots})`;
    }
  }

  updatePhonePill() {
    const pill = document.getElementById('phone-minimized-pill');
    const title = document.getElementById('phone-pill-title');
    const badge = document.getElementById('phone-pill-badge');
    if (!pill || !title || !badge) return;

    pill.classList.remove('offer-alert');

    if (this.appState === 'OFFER' && this.currentOrder) {
      pill.classList.add('offer-alert');
      const sec = Math.max(0, Math.ceil(this.offerTimer || 25));
      title.innerText = '🕊️ NEW CHARTER!';
      badge.innerText = `+${this.currentOrder.payout}g (${sec}s)`;
    } else if (this.appState === 'TO_PICKUP' && this.currentOrder) {
      title.innerText = 'SAIL TO PORT';
      badge.innerText = this.currentOrder.origin.name.split(' ')[0].toUpperCase();
    } else if (this.appState === 'TO_DESTINATION' && this.currentOrder) {
      title.innerText = 'HAULING CARGO';
      const dist = (Math.hypot(this.player.x - this.currentOrder.destination.dockX, this.player.y - this.currentOrder.destination.dockY) / 950).toFixed(1);
      badge.innerText = `${dist} LG`;
    } else {
      title.innerText = 'CHARTER LEDGER';
      badge.innerText = 'SCANNING';
    }
  }

  togglePhone(show) {
    const dock = document.getElementById('phone-dock');
    const pill = document.getElementById('phone-minimized-pill');
    const backdrop = document.getElementById('phone-backdrop');
    if (!dock) return;

    if (show === undefined) {
      show = dock.classList.contains('minimized');
    }

    if (show) {
      dock.classList.remove('minimized');
      if (backdrop) backdrop.style.display = 'block';
      if (pill) pill.classList.remove('active-pulsing');
      this.updatePhoneUI();
    } else {
      dock.classList.add('minimized');
      if (backdrop) backdrop.style.display = 'none';
      if (pill) pill.classList.add('active-pulsing');
    }

    this.updatePhonePill();
  }

  showOfferToast() {
    const toast = document.getElementById('offer-toast');
    if (!toast || !this.currentOrder) return;
    const o = this.currentOrder;

    const titleEl = document.getElementById('toast-store-title');
    const payoutEl = document.getElementById('toast-payout');
    const distEl = document.getElementById('toast-distance');
    const timerEl = document.getElementById('toast-timer');

    if (titleEl) titleEl.innerText = `${o.crates}x ${o.good.name.toUpperCase()} (${o.origin.name} ➔ ${o.destination.name})`;
    if (payoutEl) payoutEl.innerText = `+${o.payout} GOLD`;
    if (distEl) distEl.innerText = `${o.leagues} leagues`;
    if (timerEl) timerEl.innerText = `${Math.ceil(this.offerTimer || 25)}s`;

    toast.style.display = 'flex';
  }

  dismissOfferToast() {
    const toast = document.getElementById('offer-toast');
    if (toast) toast.style.display = 'none';
  }

  showBanner(htmlText, bgGradient, durationMs = 4200) {
    const banner = document.getElementById('event-banner');
    if (!banner) return;
    banner.style.display = 'block';
    if (bgGradient) banner.style.background = bgGradient;
    banner.innerHTML = htmlText;

    if (this._bannerTimeout) clearTimeout(this._bannerTimeout);
    this._bannerTimeout = setTimeout(() => {
      banner.style.display = 'none';
    }, durationMs);
  }

  updatePhoneUI() {
    const screen = document.getElementById('phone-content');
    if (!screen) return;

    const tier = this.shipTiers[this.currentTierIndex];
    const activeCap = this.pirateManager.getActivePirateCap(this.difficulty, this.stats.voyageSeconds, this.modPirateDensityMult, this);

    if (this.appState === 'SEARCHING') {
      screen.innerHTML = `
        <div style="padding: 16px 12px; text-align: center;">
          <div style="font-size: 28px; margin-bottom: 8px;">🔭</div>
          <div style="font-family: 'Press Start 2P', monospace; font-size: 10px; color: #fbbf24; margin-bottom: 6px;">SCANNING ARCHIPELAGO PORTS...</div>
          <div style="font-size: 12px; color: #cbd5e1; line-height: 1.4;">Carrier pigeons & signal flags awaiting your next Island Cargo Charter!</div>

          <div class="driver-stats-grid" style="margin-top: 14px;">
            <div class="stat-cell"><div class="label">SHIP TIER</div><div class="val orange">Lv.${tier.level} ${tier.name.split(' ').pop()}</div></div>
            <div class="stat-cell"><div class="label">CARGO HOLD</div><div class="val green">${this.player.cargoCapacity} Crates</div></div>
            <div class="stat-cell"><div class="label">PIRATE SWARM</div><div class="val" style="color:#f87171;">${this.pirateManager.pirates.length}/${activeCap}</div></div>
            <div class="stat-cell"><div class="label">BOSS CYCLE</div><div class="val green">Cycle ${this.bossCycle} (${this.slainBossIdsInCycle.size}/7)</div></div>
          </div>

          <button class="phone-action-btn success" style="margin-top: 12px;" onclick="window.game.generateRandomOrder(true)">
            🕊️ REQUEST IMMEDIATE PORT CHARTER
          </button>
          <button class="phone-action-btn" style="margin-top: 8px; background: linear-gradient(180deg, #0284c7, #0369a1);" onclick="window.game.toggleLoadoutModal(true)">
            ⚓ OPEN SHIPYARD & RARITY STORE (${this.equippedModules.length}/${tier.maxSlots})
          </button>
          <button class="phone-action-btn" style="margin-top: 8px; background: linear-gradient(180deg, #ca8a04, #a16207);" onclick="window.game.toggleAchievementsModal(true)">
            🏆 ACHIEVEMENTS & HIGH SCORES
          </button>
          <button class="phone-action-btn secondary" style="margin-top: 8px;" onclick="window.game.togglePhone(false)">
            ⛵ MINIMIZE LEDGER & SAIL
          </button>
        </div>
      `;
    } else if (this.appState === 'OFFER' && this.currentOrder) {
      const o = this.currentOrder;
      screen.innerHTML = `
        <div class="order-card" style="border-color: #fbbf24;">
          <div class="order-badge-row">
            <span class="order-status-badge">ROYAL CHARTER (${o.leagues} LG)</span>
            <span class="order-payout">+${o.payout}g</span>
          </div>
          <div class="restaurant-title">${o.origin.icon} ${o.origin.name}</div>
          <div class="restaurant-tagline">➔ Sail To: ${o.destination.icon} ${o.destination.name}</div>

          <div class="order-items-list">
            <div class="order-item-line">
              <span>${o.good.icon} ${o.crates}x ${o.good.name}</span>
              <span>+${o.baseGold}g Base</span>
            </div>
            <div class="order-item-line">
              <span>🎖️ Admiral's Prompt Bonus</span>
              <span>+${o.tipGold}g Tip</span>
            </div>
          </div>

          <div class="customer-info-box">
            <div class="customer-name">Chartered By: ${o.client.name}</div>
            <div class="customer-instructions">"${o.client.note}"</div>
          </div>

          <div style="text-align: center; margin: 8px 0; font-family: 'Press Start 2P', monospace; font-size: 10px; color: #fde047;">
            SIGNAL EXPIRES: <span id="offer-countdown">${Math.ceil(this.offerTimer)}</span>s
          </div>

          <button class="phone-action-btn success" onclick="window.game.acceptOrder()">✒️ SIGN CHARTER (+${o.payout} GOLD)</button>
          <button class="phone-action-btn secondary" onclick="window.game.declineOrder()">PASS CHARTER</button>
        </div>
      `;
    } else if (this.appState === 'TO_PICKUP' && this.currentOrder) {
      const o = this.currentOrder;
      const distLeft = (Math.hypot(this.player.x - o.origin.dockX, this.player.y - o.origin.dockY) / 950).toFixed(1);
      screen.innerHTML = `
        <div class="order-card">
          <div class="order-badge-row">
            <span class="order-status-badge" style="background:#0284c7;">STEP 1: SAIL TO ORIGIN PORT</span>
            <span class="order-payout">+${o.payout}g</span>
          </div>
          <div class="restaurant-title">${o.origin.icon} ${o.origin.name}</div>
          <div style="color: #38bdf8; font-size: 13px; margin: 6px 0;">🧭 Distance to Wharf: ${distLeft} leagues</div>
          <div style="font-size: 12px; color: #cbd5e1; margin-bottom: 12px;">Follow the golden compass rhumb line into ${o.origin.name}'s harbor ring to load ${o.crates}x ${o.good.name}!</div>
          <button class="phone-action-btn success" onclick="window.game.confirmCargoLoading()">📦 LOAD CARGO AT WHARF NOW</button>
          <button class="phone-action-btn secondary" style="margin-top: 8px;" onclick="window.game.togglePhone(false)">⛵ MINIMIZE & SAIL</button>
        </div>
      `;
    } else if (this.appState === 'TO_DESTINATION' && this.currentOrder) {
      const o = this.currentOrder;
      const distLeft = (Math.hypot(this.player.x - o.destination.dockX, this.player.y - o.destination.dockY) / 950).toFixed(1);
      screen.innerHTML = `
        <div class="order-card">
          <div class="order-badge-row">
            <span class="order-status-badge" style="background:#059669;">STEP 2: DELIVER CARGO</span>
            <span class="order-payout">+${o.payout}g</span>
          </div>
          <div class="restaurant-title" style="color: #34d399;">${o.destination.icon} ${o.destination.name}</div>
          <div style="font-size: 12px; color: #fde047; margin: 4px 0;">📦 Hauling: ${o.crates}x ${o.good.name}</div>
          <div style="color: #38bdf8; font-size: 13px; margin: 6px 0;">🧭 Distance Remaining: ${distLeft} leagues</div>
          <div class="customer-info-box" style="margin-top: 8px;">
            <div class="customer-instructions">"${o.client.note}"</div>
          </div>
          <button class="phone-action-btn success" onclick="window.game.arriveAtDestinationPort()">⚓ MOOR & UNLOAD AT WHARF</button>
          <button class="phone-action-btn secondary" style="margin-top: 8px;" onclick="window.game.togglePhone(false)">⛵ MINIMIZE & SAIL</button>
        </div>
      `;
    }

    this.updatePhonePill();
  }

  // --- Menu, Shanty Radio & Universal Modder Studio ---

  toggleMenuModal(open) {
    const modal = document.getElementById('menu-modal');
    if (!modal) return;
    if (open === undefined) {
      open = modal.style.display === 'none' || !modal.style.display;
    }
    modal.style.display = open ? 'flex' : 'none';
    if (open) {
      if (window.audioManager) window.audioManager.resume();
      this.updateMenuModalUI();
    }
  }

  toggleModStudioModal(open) {
    const modal = document.getElementById('mod-studio-modal');
    if (!modal) return;
    if (open === undefined) {
      open = modal.style.display === 'none' || !modal.style.display;
    }
    modal.style.display = open ? 'flex' : 'none';
  }

  updateMenuModalUI() {
    if (!window.audioManager) return;
    const radioStatus = document.getElementById('radio-status');
    const playBtn = document.getElementById('menu-radio-play-btn');
    const muteBtn = document.getElementById('menu-radio-mute-btn');
    const lyricEl = document.getElementById('shanty-lyric-line');

    if (radioStatus) {
      radioStatus.innerText = window.audioManager.shantyPlaying
        ? window.audioManager.trackNames[window.audioManager.currentTrack]
        : 'SHANTY CHOIR RESTING (PRESS SING)';
    }
    if (lyricEl) {
      lyricEl.innerText = window.audioManager.currentLyricLine;
    }
    if (playBtn) {
      playBtn.innerText = window.audioManager.shantyPlaying ? '⏸️ REST' : '🪗 SING SHANTY';
    }
    if (muteBtn) {
      muteBtn.innerText = window.audioManager.isMuted ? '🔇 MUTED' : '🔊 SOUND';
    }
  }

  toggleRadioPlay() {
    if (!window.audioManager) return;
    window.audioManager.resume();
    const state = window.audioManager.toggleShanty();
    this.updateMenuModalUI();
    if (state.playing) {
      this.showBanner(`🎶 CREW SINGING: ${state.trackName.toUpperCase()}`, 'linear-gradient(90deg, #0d9488, #059669)');
    }
  }

  nextRadioTrack() {
    if (!window.audioManager) return;
    window.audioManager.resume();
    window.audioManager.nextTrack();
    this.updateMenuModalUI();
  }

  prevRadioTrack() {
    if (!window.audioManager) return;
    window.audioManager.resume();
    window.audioManager.prevTrack();
    this.updateMenuModalUI();
  }

  toggleMute() {
    if (!window.audioManager) return;
    window.audioManager.resume();
    window.audioManager.toggleMute();
    this.updateMenuModalUI();
  }

  resetPlayerVehicle() {
    this.player.x = 0;
    this.player.y = 310;
    this.player.speed = 0;
    this.toggleMenuModal(false);
    this.showBanner('⚓ SHIP TOWED SAFELY TO PORT ROYAL HAVEN WHARF!', 'linear-gradient(90deg, #0284c7, #0ea5e9)');
  }

  // --- Universal Modder Live Actions ---

  modSpawnBoss(bossId) {
    this.toggleModStudioModal(false);
    this.triggerRandomMaritimeEvent('BOSS_' + bossId.toUpperCase());
  }

  modGrantGold(amount = 2000) {
    this.stats.gold += amount;
    if (window.audioManager) window.audioManager.playDoubloonChime();
    this.checkAchievements();
    this.updateGaugesUI();
    this.renderLoadoutModalUI();
    this.showBanner(`🛠️ MOD STUDIO: GRANTED +${amount.toLocaleString()} GOLD DOUBLOONS!`, 'linear-gradient(90deg, #ca8a04, #eab308)');
  }

  modUnlockAllShips() {
    this.unlockedTierIndex = this.shipTiers.length - 1;
    this.currentTierIndex = this.shipTiers.length - 1;
    this.stats.maxTierReached = 10;
    this.recalculateShipStats();
    this.player.hull = this.player.maxHull;
    this.checkAchievements();
    if (window.audioManager) window.audioManager.playDoubloonChime();
    this.toggleModStudioModal(false);
    this.toggleLoadoutModal(true);
    this.showBanner('🛠️ MOD STUDIO: UNLOCKED ALL 10 SHIP TIERS INCLUDING CELESTIAL SOVEREIGN ARK (20 SLOTS)!', 'linear-gradient(90deg, #7c3aed, #9333ea)');
  }

  modExportSnapshot() {
    const payload = {
      modpack: 'corsair-dash-universal-mod',
      timestamp: new Date().toISOString(),
      difficulty: this.difficultyId,
      shipTierLevel: this.currentTierIndex + 1,
      bossCycle: this.bossCycle,
      equippedModules: this.equippedModules,
      gold: Math.floor(this.stats.gold),
      score: this.stats.score,
      highScore: this.stats.highScore,
      mutators: {
        pirateDensityMult: this.modPirateDensityMult,
        speedMult: this.modSpeedMult,
        cannonReloadMult: this.modCannonReloadMult
      }
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'corsair-dash-modpack.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  // --- Rendering (World, Ships, Broadsides, Weather & Nautical Chart Minimap) ---

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.save();
    ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
    ctx.scale(this.camera.zoom, this.camera.zoom);
    ctx.translate(-this.camera.x, -this.camera.y);

    let activePortTarget = null;
    if (this.currentOrder) {
      if (this.appState === 'TO_PICKUP') {
        activePortTarget = { ...this.currentOrder.origin, isDelivery: false };
      } else if (this.appState === 'TO_DESTINATION') {
        activePortTarget = { ...this.currentOrder.destination, isDelivery: true };
      }
    }

    // 1. Render 2.5D Archipelago Ocean, Islands, Reefs, Whirlpools & Rhumb Line
    this.map.render(ctx, this.camera, this.rhumbRoute, this.weather, this.windAngle, this.windSpeed, activePortTarget);

    // 2. Render Foaming Ship Wake Marks
    for (const wm of this.wakeMarks) {
      ctx.save();
      ctx.translate(wm.x, wm.y);
      ctx.rotate(wm.angle);
      ctx.strokeStyle = `rgba(224, 242, 254, ${wm.life * 0.35})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -wm.width * 0.45);
      ctx.lineTo(-14, -wm.width * 0.7);
      ctx.moveTo(0, wm.width * 0.45);
      ctx.lineTo(-14, wm.width * 0.7);
      ctx.stroke();
      ctx.restore();
    }

    // 3. Render Dropped Greek Fire Barrels
    for (const b of this.droppedFireBarrels) {
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.fillStyle = '#7c2d12';
      ctx.beginPath();
      ctx.arc(0, 0, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = b.magnetic ? '#c084fc' : '#f97316';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();
    }

    // 4. Render Pirates, Trade Vessels & Floating Plunder Chests
    this.pirateManager.render(ctx, this.camera);

    // 5. Render Active Boss Monster (All 7 Bosses + Recycled Mutator Aura)
    this.bossManager.render(ctx, this.camera);

    // 6. Render Player Cannonballs, Swivel Shots & Mortar Shells
    for (const proj of this.playerProjectiles) {
      ctx.save();
      ctx.fillStyle = proj.color || '#fde047';
      ctx.shadowColor = proj.isMortar ? '#ea580c' : '#f59e0b';
      ctx.shadowBlur = proj.isMortar ? 12 : 8;
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 6b. Render Chain-Lightning Arcs
    for (const arc of this.lightningArcs) {
      ctx.save();
      ctx.strokeStyle = '#e879f9';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(arc.x1, arc.y1);
      const midX = (arc.x1 + arc.x2) / 2 + (Math.random() - 0.5) * 18;
      const midY = (arc.y1 + arc.y2) / 2 + (Math.random() - 0.5) * 18;
      ctx.lineTo(midX, midY);
      ctx.lineTo(arc.x2, arc.y2);
      ctx.stroke();
      ctx.restore();
    }

    // 7. Render Player Sailing Ship (Scales visually across all 10 Ship Tiers!)
    this.renderPlayerShip(ctx);

    // 8. Render Explosion & Splash Particles
    for (const pt of this.particles) {
      ctx.fillStyle = pt.color;
      ctx.fillRect(pt.x - 2, pt.y - 2, 4, 4);
    }

    // 9. Render Floating Score, Plunder & Achievement Popups
    for (const ft of this.floatingTexts) {
      ctx.save();
      ctx.font = 'bold 10px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }

    ctx.restore();

    // 10. Render Atmospheric Weather Overlay
    this.renderWeatherOverlay(ctx);

    // 11. Render Nautical Chart Minimap
    this.renderMinimap();
  }

  renderPlayerShip(ctx) {
    const p = this.player;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);

    const len = p.length;
    const wid = p.width;

    // Tier 10 Celestial Sovereign Ark Golden Constellation Halo!
    if (p.celestialAura) {
      ctx.save();
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.55)';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([8, 6]);
      ctx.rotate(Date.now() * 0.0015);
      ctx.beginPath();
      ctx.arc(0, 0, len * 0.62, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Hull shadow on water
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(3, 4, len * 0.54, wid * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tier 8 Steam-Assisted Ironclad Paddle-Wheels!
    if (p.paddleWheels) {
      ctx.fillStyle = '#d97706';
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1.5;
      ctx.fillRect(-6, -wid * 0.68, 12, 5);
      ctx.strokeRect(-6, -wid * 0.68, 12, 5);
      ctx.fillRect(-6, wid * 0.68 - 5, 12, 5);
      ctx.strokeRect(-6, wid * 0.68 - 5, 12, 5);
    }

    // Tier 9 Krakenbone Dreadnought Ivory Ramming Tusks!
    if (p.boneRam) {
      ctx.strokeStyle = '#fef3c7';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(len * 0.45, -wid * 0.25);
      ctx.quadraticCurveTo(len * 0.72, -wid * 0.42, len * 0.82, -wid * 0.12);
      ctx.moveTo(len * 0.45, wid * 0.25);
      ctx.quadraticCurveTo(len * 0.72, wid * 0.42, len * 0.82, wid * 0.12);
      ctx.stroke();
    }

    // Bowsprit spar extending forward
    ctx.strokeStyle = '#fde68a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(len * 0.4, 0);
    ctx.lineTo(len * 0.72, 0);
    ctx.stroke();

    // Ship Hull Body
    ctx.fillStyle = p.hitFlash > 0 ? '#ffffff' : p.hullColor;
    ctx.beginPath();
    ctx.moveTo(len * 0.56, 0);
    ctx.quadraticCurveTo(len * 0.25, -wid * 0.58, -len * 0.48, -wid * 0.46);
    ctx.lineTo(-len * 0.48, wid * 0.46);
    ctx.quadraticCurveTo(len * 0.25, wid * 0.58, len * 0.56, 0);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = p.trimColor;
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // Quarterdeck & Planking
    ctx.fillStyle = '#b45309';
    ctx.fillRect(-len * 0.36, -wid * 0.32, len * 0.64, wid * 0.64);

    // Render Visible Cargo Crates on Deck when hauling an active order!
    if (this.appState === 'TO_DESTINATION' && this.currentOrder) {
      ctx.fillStyle = '#d97706';
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1;
      const showCrates = Math.min(6, this.currentOrder.crates);
      for (let c = 0; c < showCrates; c++) {
        const cx = -len * 0.20 + (c % 3) * 8;
        const cy = (c < 3 ? -1 : 1) * (wid * 0.16);
        ctx.fillRect(cx - 3, cy - 3, 6, 6);
        ctx.strokeRect(cx - 3, cy - 3, 6, 6);
      }
    }

    // Render Broadside Cannon Barrels protruding from Port & Starboard gunwales
    const guns = Math.min(12, p.cannonsPerSide);
    ctx.fillStyle = '#1e293b';
    for (let g = 0; g < guns; g++) {
      const gx = -len * 0.30 + (g * (len * 0.58)) / Math.max(1, guns - 1 || 1);
      ctx.fillRect(gx - 1.5, -wid * 0.62, 3, 5);
      ctx.fillRect(gx - 1.5, wid * 0.62 - 5, 3, 5);
    }

    // Render Masts & Billowing Sails (1 to 5 Masts depending on Ship Tier!)
    const masts = p.masts || 1;
    for (let m = 0; m < masts; m++) {
      const mx = masts === 1 ? 0 : (-len * 0.28 + (m * (len * 0.56)) / (masts - 1));
      ctx.strokeStyle = '#fde68a';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(mx, -wid * 0.78);
      ctx.lineTo(mx, wid * 0.78);
      ctx.stroke();

      ctx.fillStyle = p.sailColor;
      ctx.beginPath();
      ctx.moveTo(mx, -wid * 0.75);
      ctx.quadraticCurveTo(mx + 12, 0, mx, wid * 0.75);
      ctx.lineTo(mx - 3, wid * 0.62);
      ctx.quadraticCurveTo(mx + 5, 0, mx - 3, -wid * 0.62);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.arc(mx, 0, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Golden Stern Lanterns
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(-len * 0.48, -wid * 0.3, 3, 0, Math.PI * 2);
    ctx.arc(-len * 0.48, wid * 0.3, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Floating Musical Notes when Sea Shanty Choir is singing!
    if (window.audioManager && window.audioManager.shantyPlaying) {
      const bob = Math.sin(Date.now() * 0.006) * 5;
      ctx.save();
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fde047';
      ctx.fillText('🎶', p.x, p.y - wid - 16 + bob);
      ctx.restore();
    }
  }

  renderWeatherOverlay(ctx) {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const now = Date.now() * 0.001;

    if (this.weather === 'HURRICANE_SQUALL') {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = 'rgba(186, 230, 253, 0.32)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 28; i++) {
        const rx = (now * 700 + i * 137) % w;
        const ry = (now * 900 + i * 89) % h;
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx - 18, ry + 28);
        ctx.stroke();
      }
    } else if (this.weather === 'SIREN_GLOW') {
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, 'rgba(124, 45, 18, 0.14)');
      grad.addColorStop(1, 'rgba(245, 158, 11, 0.16)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    }
  }

  renderMinimap() {
    if (!this.minimapCtx || !this.minimapCanvas) return;
    const mctx = this.minimapCtx;
    const w = this.minimapCanvas.width;
    const h = this.minimapCanvas.height;
    mctx.clearRect(0, 0, w, h);

    const bounds = this.data.worldBounds;
    const spanX = bounds.maxX - bounds.minX;
    const spanY = bounds.maxY - bounds.minY;
    const toMapX = (x) => ((x - bounds.minX) / spanX) * w;
    const toMapY = (y) => ((y - bounds.minY) / spanY) * h;

    mctx.fillStyle = '#082f49';
    mctx.fillRect(0, 0, w, h);

    if (this.rhumbRoute && this.rhumbRoute.length > 1) {
      mctx.strokeStyle = '#fde047';
      mctx.lineWidth = 2;
      mctx.beginPath();
      for (let i = 0; i < this.rhumbRoute.length; i++) {
        const pt = this.rhumbRoute[i];
        if (i === 0) mctx.moveTo(toMapX(pt.x), toMapY(pt.y));
        else mctx.lineTo(toMapX(pt.x), toMapY(pt.y));
      }
      mctx.stroke();
    }

    for (const isl of this.islands) {
      const mx = toMapX(isl.x);
      const my = toMapY(isl.y);
      mctx.fillStyle = isl.themeColor || '#22c55e';
      mctx.beginPath();
      mctx.arc(mx, my, 4.5, 0, Math.PI * 2);
      mctx.fill();
      mctx.strokeStyle = '#ffffff';
      mctx.lineWidth = 1;
      mctx.stroke();
    }

    mctx.fillStyle = '#ef4444';
    for (const pir of this.pirateManager.pirates) {
      mctx.fillRect(toMapX(pir.x) - 1.5, toMapY(pir.y) - 1.5, 3, 3);
    }

    if (this.bossManager.activeBoss) {
      const b = this.bossManager.activeBoss;
      mctx.fillStyle = '#e879f9';
      mctx.beginPath();
      mctx.arc(toMapX(b.x), toMapY(b.y), 5.5, 0, Math.PI * 2);
      mctx.fill();
    }

    const px = toMapX(this.player.x);
    const py = toMapY(this.player.y);
    mctx.save();
    mctx.translate(px, py);
    mctx.rotate(this.player.angle);
    mctx.fillStyle = '#fde047';
    mctx.beginPath();
    mctx.moveTo(7, 0);
    mctx.lineTo(-5, -4.5);
    mctx.lineTo(-2, 0);
    mctx.lineTo(-5, 4.5);
    mctx.closePath();
    mctx.fill();
    mctx.restore();
  }

  loop(timestamp) {
    const rawDt = (timestamp - this.lastTime) / 1000;
    const dt = isFinite(rawDt) ? Math.min(0.1, Math.max(0.001, rawDt)) : 0.016;
    this.lastTime = timestamp;

    try {
      this.update(dt);
      this.render();
    } catch (err) {
      console.error('CORSAIRDASH Loop Warning:', err);
    }

    requestAnimationFrame((t) => this.loop(t));
  }

  start() {
    if (this._started) return;
    this._started = true;
    this.updatePhoneUI();
    this.updateGaugesUI();
    requestAnimationFrame((t) => this.loop(t));
  }
}

window.GameEngine = GameEngine;
