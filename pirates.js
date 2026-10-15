// CORSAIRDASH: Sovereign Seas — Pirate Swarm & Maritime Trade Vessel AI Engine
// Converts DixieDash's TrafficManager into a dynamic naval ecosystem with difficulty-scaled pirate density escalation.

class PirateAndTradeManager {
  constructor(data) {
    this.data = data || window.CORSAIR_DATA;
    this.islands = this.data.islands || [];
    this.pirates = [];
    this.tradeShips = [];
    this.enemyProjectiles = [];
    this.salvageChests = [];

    this.maxTradeShips = 16;
    this.pirateSpawnTimer = 0;
    this.tradeSpawnTimer = 0;
  }

  getActivePirateCap(difficultyProfile, voyageSeconds, modMultiplier = 1.0, bossCycleOrGame = 1, bossesSlain = 0) {
    let bossCycle = 1;
    let slainCount = bossesSlain || 0;
    if (typeof bossCycleOrGame === 'object' && bossCycleOrGame !== null) {
      bossCycle = bossCycleOrGame.bossCycle || 1;
      slainCount = (bossCycleOrGame.stats && bossCycleOrGame.stats.bossesSlain) || 0;
    } else if (typeof bossCycleOrGame === 'number') {
      bossCycle = bossCycleOrGame;
    }
    const cycleBonus = Math.max(0, bossCycle - 1);
    const base = (difficultyProfile.initialMaxPirates || 8) + cycleBonus * 5 + Math.floor(slainCount * 0.6);
    const rate = (difficultyProfile.escalationRatePerMin || 3.0) * (1 + cycleBonus * 0.32);
    const cap = (difficultyProfile.absoluteMaxPirates || 28) + cycleBonus * 10 + Math.min(14, slainCount);
    const escalated = base + (voyageSeconds / 60) * rate;
    return Math.round(Math.min(cap, escalated) * modMultiplier);
  }

  spawnPirate(playerX, playerY, difficultyProfile, voyageSeconds, forceNearPlayer = false, bossCycleOrGame = 1) {
    const bossCycle = (typeof bossCycleOrGame === 'object' && bossCycleOrGame !== null)
      ? (bossCycleOrGame.bossCycle || 1)
      : (Number(bossCycleOrGame) || 1);
    // Spawn on a ring 850 to 2,100 units around the player (avoiding island interiors)
    let sx = playerX;
    let sy = playerY;
    let valid = false;

    for (let attempt = 0; attempt < 12; attempt++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = forceNearPlayer ? (550 + Math.random() * 450) : (900 + Math.random() * 1250);
      sx = playerX + Math.cos(angle) * dist;
      sy = playerY + Math.sin(angle) * dist;

      // Clamp inside world bounds
      sx = Math.max(-3950, Math.min(3950, sx));
      sy = Math.max(-3950, Math.min(3950, sy));

      valid = true;
      for (const isl of this.islands) {
        if (Math.hypot(sx - isl.x, sy - isl.y) < isl.radius + 90) {
          valid = false;
          break;
        }
      }
      if (valid) break;
    }

    if (!valid) return null;

    const cycleBonus = Math.max(0, (bossCycle || 1) - 1);
    const cycleStatMult = 1.0 + cycleBonus * 0.30;
    const cycleBountyMult = 1.0 + cycleBonus * 0.45;

    // Select Pirate Tier based on voyage progression, difficulty & Boss Cycle
    const roll = Math.random() + Math.min(0.32, voyageSeconds / 800) + cycleBonus * 0.12;
    let pType = 'cutter';
    let name = cycleBonus > 0 ? `Ascended Cutter [C${bossCycle}]` : 'Blackwater Cutter';
    let hp = 65;
    let speed = 64;
    let damage = 11;
    let bountyGold = 85;
    let bountyScore = 350;
    let length = 32;
    let width = 15;
    let masts = 1;
    let hullColor = '#291d16';
    let sailColor = '#1e293b';

    if (roll > 0.85) {
      pType = 'dreadnought';
      name = cycleBonus > 0 ? `Ascended Skull Galleon [C${bossCycle}]` : 'Crimson Skull Galleon';
      hp = 240;
      speed = 55;
      damage = 22;
      bountyGold = 290;
      bountyScore = 1100;
      length = 54;
      width = 24;
      masts = 3;
      hullColor = '#1c1917';
      sailColor = '#7f1d1d';
    } else if (roll > 0.42) {
      pType = 'brigantine';
      name = cycleBonus > 0 ? `Ascended Raider Brig [C${bossCycle}]` : 'Corsair Raider Brig';
      hp = 130;
      speed = 60;
      damage = 15;
      bountyGold = 160;
      bountyScore = 650;
      length = 42;
      width = 19;
      masts = 2;
      hullColor = '#3b1d11';
      sailColor = '#111827';
    }

    const speedMult = (difficultyProfile.pirateSpeedMult || 1.0) * Math.min(1.35, 1 + cycleBonus * 0.06);
    const dmgMult = (difficultyProfile.pirateDamageMult || 1.0) * cycleStatMult;
    const scaledHp = Math.round(hp * cycleStatMult);

    const pirate = {
      id: 'pir_' + Math.random().toString(36).slice(2, 9),
      type: pType,
      name,
      x: sx,
      y: sy,
      angle: Math.atan2(playerY - sy, playerX - sx),
      speed: speed * speedMult * 0.7,
      maxSpeed: speed * speedMult,
      hp: scaledHp,
      maxHp: scaledHp,
      damage: Math.round(damage * dmgMult),
      bountyGold: Math.round(bountyGold * cycleBountyMult),
      bountyScore: Math.round(bountyScore * cycleBountyMult),
      length,
      width,
      masts,
      hullColor,
      sailColor,
      reloadTimer: 1.0 + Math.random() * 1.5,
      reloadDuration: Math.max(1.1, (difficultyProfile.pirateReloadSec || 2.5) * Math.pow(0.92, cycleBonus)),
      aiOffsetSign: Math.random() > 0.5 ? 1 : -1,
      hitFlash: 0,
      slowTimer: 0,
      slowAmount: 0,
      burnTimer: 0,
      burnDps: 0,
      ramCooldown: 0
    };

    this.pirates.push(pirate);
    return pirate;
  }

  spawnTradeShip(playerX, playerY) {
    if (this.tradeShips.length >= this.maxTradeShips || this.islands.length < 2) return;

    const origin = this.islands[Math.floor(Math.random() * this.islands.length)];
    let dest = this.islands[Math.floor(Math.random() * this.islands.length)];
    if (dest.id === origin.id) {
      dest = this.islands[(this.islands.indexOf(origin) + 1) % this.islands.length];
    }

    const t = 0.2 + Math.random() * 0.6;
    const sx = origin.dockX + (dest.dockX - origin.dockX) * t + (Math.random() - 0.5) * 200;
    const sy = origin.dockY + (dest.dockY - origin.dockY) * t + (Math.random() - 0.5) * 200;

    const roll = Math.random();
    let role = 'merchant';
    let name = 'East India Merchantman';
    let hullColor = '#78350f';
    let sailColor = '#fef3c7';
    let trimColor = '#fbbf24';
    let speed = 42;
    let length = 44;
    let width = 20;

    if (roll < 0.28) {
      role = 'navy';
      name = 'Royal Navy Patrol Frigate';
      hullColor = '#1e3a8a';
      sailColor = '#f8fafc';
      trimColor = '#fde047';
      speed = 54;
      length = 48;
      width = 21;
    } else if (roll < 0.55) {
      role = 'fishing';
      name = 'Island Pearl Dory';
      hullColor = '#0f766e';
      sailColor = '#e0f2fe';
      trimColor = '#38bdf8';
      speed = 34;
      length = 28;
      width = 13;
    }

    this.tradeShips.push({
      id: 'trd_' + Math.random().toString(36).slice(2, 9),
      role,
      name,
      x: sx,
      y: sy,
      targetIsland: dest,
      angle: Math.atan2(dest.dockY - sy, dest.dockX - sx),
      speed,
      hullColor,
      sailColor,
      trimColor,
      length,
      width,
      reloadTimer: 1.5
    });
  }

  // When player blows the brass foghorn [H], nearby trade vessels scatter slightly
  foghornReaction(playerX, playerY) {
    for (const ts of this.tradeShips) {
      const d = Math.hypot(ts.x - playerX, ts.y - playerY);
      if (d < 340) {
        ts.angle = Math.atan2(ts.y - playerY, ts.x - playerX);
        ts.speed = Math.min(68, ts.speed + 16);
      }
    }
  }

  update(dt, player, difficultyProfile, voyageSeconds, gameEngine) {
    const bossCycle = gameEngine.bossCycle || 1;
    const bossesSlain = (gameEngine.stats && gameEngine.stats.bossesSlain) || 0;
    const activeCap = this.getActivePirateCap(
      difficultyProfile,
      voyageSeconds,
      gameEngine.modPirateDensityMult || 1.0,
      bossCycle,
      bossesSlain
    );

    // 1. Spawn new pirates up to the difficulty & cycle-escalated cap
    this.pirateSpawnTimer += dt;
    const cycleSpawnBoost = 1.0 + Math.max(0, bossCycle - 1) * 0.35 + bossesSlain * 0.05;
    const spawnInterval = Math.max(
      0.45,
      (difficultyProfile.pirateSpawnInterval || 2.5) / ((gameEngine.modPirateDensityMult || 1.0) * cycleSpawnBoost)
    );
    if (this.pirateSpawnTimer >= spawnInterval && this.pirates.length < activeCap) {
      this.pirateSpawnTimer = 0;
      this.spawnPirate(player.x, player.y, difficultyProfile, voyageSeconds, false, bossCycle);
    }

    // 2. Spawn ambient Trade & Royal Navy vessels
    this.tradeSpawnTimer += dt;
    if (this.tradeSpawnTimer >= 2.0 && this.tradeShips.length < this.maxTradeShips) {
      this.tradeSpawnTimer = 0;
      this.spawnTradeShip(player.x, player.y);
    }

    // 3. Despawn ships that drifted > 3,400 units from player
    this.pirates = this.pirates.filter(p => Math.hypot(p.x - player.x, p.y - player.y) < 3300 && p.hp > 0);
    this.tradeShips = this.tradeShips.filter(t => Math.hypot(t.x - player.x, t.y - player.y) < 3600);

    // 4. Update Pirate AI & Cannon Volleys
    for (let i = this.pirates.length - 1; i >= 0; i--) {
      const p = this.pirates[i];
      this.updatePirateAI(p, dt, player, gameEngine);
      if (p.hp <= 0) {
        gameEngine.onPirateSunk(p, true);
        this.pirates.splice(i, 1);
      }
    }

    // 5. Update Merchant & Royal Navy AI
    for (const ts of this.tradeShips) {
      this.updateTradeShipAI(ts, dt, gameEngine);
    }

    // 6. Update Enemy Cannonballs
    for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
      const proj = this.enemyProjectiles[i];
      proj.x += proj.vx * dt;
      proj.y += proj.vy * dt;
      proj.life -= dt;

      // Check hit against Player Ship
      const distToPlayer = Math.hypot(proj.x - player.x, proj.y - player.y);
      if (distToPlayer < (player.width * 0.85)) {
        gameEngine.applyDamageToPlayer(proj.damage, 'Pirate Cannonball', proj.sourcePirate);
        this.enemyProjectiles.splice(i, 1);
        continue;
      }

      if (proj.life <= 0) {
        gameEngine.spawnWaterSplash(proj.x, proj.y, 5);
        this.enemyProjectiles.splice(i, 1);
      }
    }

    // 7. Update Floating Salvage Plunder Chests (Supports Grappling Harpoon Winch Magnet!)
    const magnetRange = 52 + (player.magnetRadius || 0);
    for (let i = this.salvageChests.length - 1; i >= 0; i--) {
      const chest = this.salvageChests[i];
      chest.life -= dt;
      if (chest.life <= 0) {
        this.salvageChests.splice(i, 1);
        continue;
      }

      const d = Math.hypot(chest.x - player.x, chest.y - player.y);
      if (d < magnetRange && d >= 48) {
        const pullAngle = Math.atan2(player.y - chest.y, player.x - chest.x);
        const pullSpeed = 260 + (player.magnetRadius || 0) * 0.65;
        chest.x += Math.cos(pullAngle) * pullSpeed * dt;
        chest.y += Math.sin(pullAngle) * pullSpeed * dt;
      }

      if (Math.hypot(chest.x - player.x, chest.y - player.y) < 52) {
        gameEngine.collectSalvageChest(chest);
        this.salvageChests.splice(i, 1);
      }
    }
  }

  updatePirateAI(p, dt, player, gameEngine) {
    if (p.hitFlash > 0) p.hitFlash = Math.max(0, p.hitFlash - dt * 4);
    if (p.ramCooldown > 0) p.ramCooldown = Math.max(0, p.ramCooldown - dt);

    // Burn DoT from Hellfire Cannon / Wildfire Mortar
    if (p.burnTimer > 0) {
      p.burnTimer = Math.max(0, p.burnTimer - dt);
      p.hp -= (p.burnDps || p.burnDPS || 15) * dt;
    }

    // Slow debuff from Chain-Shot Dismasting Rig
    let slowMult = 1.0;
    if (p.slowTimer > 0) {
      p.slowTimer = Math.max(0, p.slowTimer - dt);
      slowMult = Math.max(0.30, 1.0 - (p.slowAmount || p.slowFactor || 0.30));
    }

    const dx = player.x - p.x;
    const dy = player.y - p.y;
    const distToPlayer = Math.hypot(dx, dy);
    let desiredAngle = Math.atan2(dy, dx);

    // Ramming Check (Copper/Orichalcum Keel, Steam Boiler, or Krakenbone Dreadnought)
    const contactDist = (player.width + p.width) * 0.72;
    if (distToPlayer < contactDist && p.ramCooldown <= 0) {
      p.ramCooldown = 1.0;
      const ramDmg = (player.ramDamage || 0) + (player.boneRam ? 95 : 0);
      if (ramDmg > 0) {
        p.hp -= ramDmg;
        p.hitFlash = 1.0;
        if (window.audioManager) window.audioManager.playHitWood();
        gameEngine.spawnMuzzleSmoke(p.x, p.y);
      }
    }

    // If within broadside range (160-340 units), angle slightly to orbit and fire broadsides!
    if (distToPlayer < 290 && distToPlayer > 110) {
      desiredAngle += (Math.PI * 0.36) * p.aiOffsetSign;
    }

    // Island avoidance steering for pirates
    for (const isl of this.islands) {
      const idist = Math.hypot(p.x - isl.x, p.y - isl.y);
      if (idist < isl.radius + 95) {
        desiredAngle = Math.atan2(p.y - isl.y, p.x - isl.x);
        break;
      }
    }

    // Smooth angle turn
    let diff = desiredAngle - p.angle;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    p.angle += diff * Math.min(1.0, dt * 2.4 * slowMult);

    // Move pirate vessel
    p.speed = Math.min(p.maxSpeed * slowMult, p.speed + 35 * dt);
    p.x += Math.cos(p.angle) * p.speed * dt * 2.3;
    p.y += Math.sin(p.angle) * p.speed * dt * 2.3;

    // Fire Cannonball at Player if in range (and player is not inside safe dock ring)
    p.reloadTimer -= dt;
    if (p.reloadTimer <= 0 && distToPlayer < 480 && !gameEngine.isPlayerInSafeHarbor()) {
      p.reloadTimer = p.reloadDuration * (0.85 + Math.random() * 0.3);

      // Lead-shot calculation
      const leadTime = distToPlayer / 380;
      const aimX = player.x + Math.cos(player.angle) * player.speed * leadTime * 0.9 + (Math.random() - 0.5) * 45;
      const aimY = player.y + Math.sin(player.angle) * player.speed * leadTime * 0.9 + (Math.random() - 0.5) * 45;
      const shotAngle = Math.atan2(aimY - p.y, aimX - p.x);

      this.enemyProjectiles.push({
        x: p.x + Math.cos(shotAngle) * 14,
        y: p.y + Math.sin(shotAngle) * 14,
        vx: Math.cos(shotAngle) * 370,
        vy: Math.sin(shotAngle) * 370,
        damage: p.damage,
        life: 1.45,
        color: '#f97316',
        sourcePirate: p
      });

      gameEngine.spawnMuzzleSmoke(p.x + Math.cos(shotAngle) * 12, p.y + Math.sin(shotAngle) * 12);
    }
  }

  updateTradeShipAI(ts, dt, gameEngine) {
    const dest = ts.targetIsland;
    if (!dest) return;

    const dx = dest.dockX - ts.x;
    const dy = dest.dockY - ts.y;
    const dist = Math.hypot(dx, dy);

    if (dist < 90) {
      // Pick next island destination
      ts.targetIsland = this.islands[Math.floor(Math.random() * this.islands.length)];
      return;
    }

    let desiredAngle = Math.atan2(dy, dx);
    for (const isl of this.islands) {
      const idist = Math.hypot(ts.x - isl.x, ts.y - isl.y);
      if (idist < isl.radius + 70) {
        desiredAngle = Math.atan2(ts.y - isl.y, ts.x - isl.x);
        break;
      }
    }

    let diff = desiredAngle - ts.angle;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    ts.angle += diff * Math.min(1.0, dt * 1.8);

    ts.x += Math.cos(ts.angle) * ts.speed * dt * 2.1;
    ts.y += Math.sin(ts.angle) * ts.speed * dt * 2.1;

    // Royal Navy Patrol Frigates fire on nearby Pirates to make the sea feel alive!
    if (ts.role === 'navy') {
      ts.reloadTimer -= dt;
      if (ts.reloadTimer <= 0) {
        for (const p of this.pirates) {
          const pd = Math.hypot(p.x - ts.x, p.y - ts.y);
          if (pd < 360) {
            ts.reloadTimer = 2.8;
            p.hp -= 18;
            p.hitFlash = 1.0;
            gameEngine.spawnMuzzleSmoke(ts.x, ts.y);
            if (p.hp <= 0) {
              gameEngine.onPirateSunk(p, false);
            }
            break;
          }
        }
      }
    }
  }

  spawnSalvageChest(x, y, goldAmount, label = 'PIRATE PLUNDER') {
    this.salvageChests.push({
      x,
      y,
      gold: goldAmount,
      label,
      life: 35.0
    });
  }

  render(ctx, camera) {
    const left = camera.x - camera.width / 2 - 120;
    const right = camera.x + camera.width / 2 + 120;
    const top = camera.y - camera.height / 2 - 120;
    const bottom = camera.y + camera.height / 2 + 120;

    // 1. Floating Salvage Plunder Chests
    const now = Date.now() * 0.004;
    for (const c of this.salvageChests) {
      if (c.x < left || c.x > right || c.y < top || c.y > bottom) continue;
      ctx.save();
      ctx.translate(c.x, c.y + Math.sin(now + c.x) * 3);

      // Golden beacon ring
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 16 + Math.sin(now * 2) * 3, 0, Math.PI * 2);
      ctx.stroke();

      // Chest box
      ctx.fillStyle = '#92400e';
      ctx.fillRect(-9, -7, 18, 14);
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 2;
      ctx.strokeRect(-9, -7, 18, 14);

      ctx.font = 'bold 7px "Press Start 2P", monospace';
      ctx.fillStyle = '#fde047';
      ctx.textAlign = 'center';
      ctx.fillText(`+${c.gold}G`, 0, -12);
      ctx.restore();
    }

    // 2. Render Civilian & Royal Navy Trade Vessels
    for (const ts of this.tradeShips) {
      if (ts.x < left || ts.x > right || ts.y < top || ts.y > bottom) continue;
      this.renderVessel(ctx, ts, false);
    }

    // 3. Render Swarming Pirate Vessels
    for (const p of this.pirates) {
      if (p.x < left || p.x > right || p.y < top || p.y > bottom) continue;
      this.renderVessel(ctx, p, true);
    }

    // 4. Render Enemy Cannonballs
    for (const proj of this.enemyProjectiles) {
      ctx.save();
      ctx.fillStyle = '#111827';
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    }
  }

  renderVessel(ctx, ship, isPirate) {
    ctx.save();
    ctx.translate(ship.x, ship.y);
    ctx.rotate(ship.angle);

    const len = ship.length;
    const wid = ship.width;

    // White V-wake behind stern
    ctx.strokeStyle = 'rgba(224, 242, 254, 0.32)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-len / 2, -wid * 0.3);
    ctx.lineTo(-len / 2 - 22, -wid * 0.85);
    ctx.moveTo(-len / 2, wid * 0.3);
    ctx.lineTo(-len / 2 - 22, wid * 0.85);
    ctx.stroke();

    // Hull shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(2, 3, len * 0.52, wid * 0.52, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pointed Wooden Ship Hull
    ctx.fillStyle = ship.hitFlash > 0 ? '#ffffff' : ship.hullColor;
    ctx.beginPath();
    ctx.moveTo(len * 0.56, 0); // Bow sprit point
    ctx.quadraticCurveTo(len * 0.25, -wid * 0.55, -len * 0.48, -wid * 0.45);
    ctx.lineTo(-len * 0.48, wid * 0.45);
    ctx.quadraticCurveTo(len * 0.25, wid * 0.55, len * 0.56, 0);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = isPirate ? '#ef4444' : (ship.trimColor || '#fde047');
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Deck planking
    ctx.fillStyle = isPirate ? '#451a03' : '#a16207';
    ctx.fillRect(-len * 0.32, -wid * 0.28, len * 0.58, wid * 0.56);

    // Masts & Billowing Sails
    const mastCount = ship.masts || (isPirate ? 2 : 2);
    for (let m = 0; m < mastCount; m++) {
      const mx = -len * 0.22 + (m * (len * 0.44)) / Math.max(1, mastCount - 1 || 1);
      // Yardarm
      ctx.strokeStyle = '#fde68a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(mx, -wid * 0.65);
      ctx.lineTo(mx, wid * 0.65);
      ctx.stroke();

      // Billowing canvas sail
      ctx.fillStyle = ship.sailColor;
      ctx.beginPath();
      ctx.moveTo(mx, -wid * 0.62);
      ctx.quadraticCurveTo(mx + 9, 0, mx, wid * 0.62);
      ctx.lineTo(mx - 3, wid * 0.52);
      ctx.quadraticCurveTo(mx + 4, 0, mx - 3, -wid * 0.52);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();

    // Pirate Health Bar & Jolly Roger Skull Badge (unrotated above ship)
    if (isPirate) {
      const hpRatio = Math.max(0, ship.hp / ship.maxHp);
      const barW = 36;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.fillRect(ship.x - barW / 2, ship.y - wid - 14, barW, 5);
      ctx.fillStyle = hpRatio > 0.4 ? '#ef4444' : '#fbbf24';
      ctx.fillRect(ship.x - barW / 2, ship.y - wid - 14, barW * hpRatio, 5);
    }
  }
}

window.PirateAndTradeManager = PirateAndTradeManager;
