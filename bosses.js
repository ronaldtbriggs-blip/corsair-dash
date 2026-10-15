// CORSAIRDASH: Sovereign Seas — 7-Boss Monster & Endless Ascension Event Engine
// Supports 7 Legendary Sea Bosses, Campaign Victory progression, and Cycle II+ Recycled Boss Mutator Buffs!

class BossMonsterEventManager {
  constructor(data) {
    this.data = data || window.CORSAIR_DATA;
    this.catalog = this.data.bossMonsters || [];
    this.activeBoss = null;
    this.bossProjectiles = [];
    this.animTime = 0;
  }

  get isActive() {
    return this.activeBoss !== null;
  }

  spawnBoss(bossId, playerX, playerY, gameEngine) {
    let template = null;
    if (bossId) {
      template = this.catalog.find(b => b.id === bossId);
    }

    // If no specific bossId was requested, prioritize bosses not yet slain in the current 7-boss cycle!
    if (!template && gameEngine && Array.isArray(gameEngine.slainBossIdsInCycle)) {
      const remaining = this.catalog.filter(b => !gameEngine.slainBossIdsInCycle.includes(b.id));
      const pool = remaining.length > 0 ? remaining : this.catalog;
      template = pool[Math.floor(Math.random() * pool.length)];
    } else if (!template) {
      template = this.catalog[Math.floor(Math.random() * this.catalog.length)];
    }

    if (!template) return null;

    const cycle = (gameEngine && gameEngine.bossCycle) ? Math.max(1, gameEngine.bossCycle) : 1;
    const mutators = this.data.bossCycleMutators || [
      { prefix: 'AWAKENED', buffLabel: 'Campaign Tier', hpMult: 1.0, speedMult: 1.0, dmgMult: 1.0, bountyMult: 1.0, extraProj: 0 }
    ];
    const baseMut = mutators[Math.min(mutators.length - 1, cycle - 1)] || mutators[0];
    const overflowCycles = Math.max(0, cycle - mutators.length);

    const hpMult = baseMut.hpMult * (1 + overflowCycles * 0.45);
    const speedMult = Math.min(1.55, baseMut.speedMult * (1 + overflowCycles * 0.04));
    const dmgMult = baseMut.dmgMult * (1 + overflowCycles * 0.25);
    const bountyMult = baseMut.bountyMult * (1 + overflowCycles * 0.55);
    const extraProj = (baseMut.extraProj || 0) + Math.min(4, overflowCycles);

    const angle = Math.random() * Math.PI * 2;
    const spawnDist = 640;
    const bx = Math.max(-3800, Math.min(3800, playerX + Math.cos(angle) * spawnDist));
    const by = Math.max(-3800, Math.min(3800, playerY + Math.sin(angle) * spawnDist));

    const scaledHp = Math.round(template.maxHp * hpMult);
    const scaledBountyGold = Math.round(template.bountyGold * bountyMult);
    const scaledBountyScore = Math.round(template.bountyScore * bountyMult);
    const displayName = cycle > 1
      ? `${baseMut.prefix} ${template.name} [CYCLE ${cycle}]`
      : template.name;

    this.activeBoss = {
      ...template,
      baseId: template.id,
      name: displayName,
      cycle,
      buffLabel: cycle > 1 ? `${baseMut.prefix}: ${baseMut.buffLabel}` : 'Campaign Gauntlet Boss',
      x: bx,
      y: by,
      angle: Math.atan2(playerY - by, playerX - bx),
      hp: scaledHp,
      maxHp: scaledHp,
      speed: Math.round(template.speed * speedMult),
      bountyGold: scaledBountyGold,
      bountyScore: scaledBountyScore,
      dmgMult,
      extraProj,
      regenPerSec: baseMut.regenPerSec || 0,
      gravityPull: baseMut.gravityPull || 0,
      attackTimer: 2.0,
      specialTimer: 0,
      chargeTimer: 0,
      isCharging: false,
      carapaceShieldActive: false,
      hitFlash: 0,
      slowTimer: 0,
      slowAmount: 0,
      burnTimer: 0,
      burnDps: 0,
      segments: []
    };

    // Initialize trailing body segments for Leviathan Serpent
    if (template.id === 'leviathan') {
      for (let s = 0; s < 9; s++) {
        this.activeBoss.segments.push({ x: bx - s * 18, y: by });
      }
    }

    this.bossProjectiles = [];
    if (window.audioManager) window.audioManager.playBossRoar();
    if (gameEngine) gameEngine.updateBossHudUI();
    return this.activeBoss;
  }

  stop() {
    this.activeBoss = null;
    this.bossProjectiles = [];
  }

  update(dt, player, gameEngine) {
    this.animTime += dt;
    if (!this.activeBoss) return;

    const b = this.activeBoss;
    if (b.hitFlash > 0) b.hitFlash = Math.max(0, b.hitFlash - dt * 4);

    // Burn DoT from Hellfire / Wildfire loadout modules
    if (b.burnTimer > 0) {
      b.burnTimer = Math.max(0, b.burnTimer - dt);
      b.hp -= (b.burnDps || 15) * dt;
    }

    // Slow debuff from Chain-Shot Dismasting Rig
    let slowFactor = 1.0;
    if (b.slowTimer > 0) {
      b.slowTimer = Math.max(0, b.slowTimer - dt);
      slowFactor = Math.max(0.45, 1.0 - (b.slowAmount || 0.25));
    }

    // Recycled Boss Regeneration (Cycle III+)
    if (b.regenPerSec > 0 && b.hp > 0 && b.hp < b.maxHp) {
      b.hp = Math.min(b.maxHp, b.hp + b.regenPerSec * dt);
    }

    const dx = player.x - b.x;
    const dy = player.y - b.y;
    const dist = Math.hypot(dx, dy);

    // Check if player successfully OUTRAN the Boss Monster!
    if (dist >= (b.escapeDistance || 2100)) {
      gameEngine.onBossOutrun(b);
      this.stop();
      return;
    }

    // Check if Boss HP reached 0 (Slain for the Big Bucks!)
    if (b.hp <= 0) {
      gameEngine.onBossSlain(b);
      this.stop();
      return;
    }

    // Steering toward player
    const targetAngle = Math.atan2(dy, dx);
    let diff = targetAngle - b.angle;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    b.angle += diff * Math.min(1.0, dt * (b.isCharging ? 0.8 : 2.2));

    let moveSpeed = b.speed * slowFactor;

    // Boss-specific movement & special aura behaviors
    if (b.id === 'megalodon') {
      b.chargeTimer += dt;
      if (b.chargeTimer > 4.5 && dist < 600) {
        b.isCharging = true;
        moveSpeed = b.speed * 1.85 * slowFactor;
        if (b.chargeTimer > 6.0) {
          b.isCharging = false;
          b.chargeTimer = 0;
        }
      }
    } else if (b.id === 'karkinos') {
      // Karkinos Reef Titan periodically hardens its obsidian carapace
      b.specialTimer += dt;
      b.carapaceShieldActive = (b.specialTimer % 7.5) > 5.0;
    } else if (b.id === 'charybdis' || b.gravityPull > 0) {
      // Charybdis Living Maelstrom (or Ascended Elder Bosses) pulls the player ship inward!
      const pullRadius = b.id === 'charybdis' ? 480 : 360;
      if (dist < pullRadius && dist > 35 && !gameEngine.isPlayerInSafeHarbor()) {
        const resist = Math.min(0.95, player.whirlpoolResist || 0);
        const pullPower = (b.id === 'charybdis' ? 68 : b.gravityPull) * (1 - resist) * (1 - dist / pullRadius);
        const pullAngle = Math.atan2(b.y - player.y, b.x - player.x);
        player.x += Math.cos(pullAngle) * pullPower * dt;
        player.y += Math.sin(pullAngle) * pullPower * dt;
      }
    } else if (b.id === 'armada_flagship') {
      // El Dorado Solar Dreadnought summons an escort cutter every 14s
      b.specialTimer += dt;
      if (b.specialTimer >= 14.0) {
        b.specialTimer = 0;
        if (gameEngine.pirateManager && gameEngine.pirateManager.pirates.length < 35) {
          gameEngine.pirateManager.spawnPirate(b.x, b.y, gameEngine.difficulty, gameEngine.stats.voyageSeconds, true);
        }
      }
    }

    b.x += Math.cos(b.angle) * moveSpeed * dt * 2.15;
    b.y += Math.sin(b.angle) * moveSpeed * dt * 2.15;

    // Update Leviathan trailing segments
    if (b.id === 'leviathan' && b.segments.length > 0) {
      let prevX = b.x;
      let prevY = b.y;
      for (const seg of b.segments) {
        const sdx = prevX - seg.x;
        const sdy = prevY - seg.y;
        const sa = Math.atan2(sdy, sdx);
        seg.x = prevX - Math.cos(sa) * 20;
        seg.y = prevY - Math.sin(sa) * 20;
        prevX = seg.x;
        prevY = seg.y;
      }
    }

    // Contact / Ramming damage if Boss touches player
    if (dist < 62 && !gameEngine.isPlayerInSafeHarbor()) {
      gameEngine.applyDamageToPlayer(25 * (b.dmgMult || 1.0) * dt, b.name, b);
    }

    // Boss Ranged Attacks (Scaled by Cycle Mutator Buffs!)
    b.attackTimer -= dt;
    if (b.attackTimer <= 0 && dist < 720 && !gameEngine.isPlayerInSafeHarbor()) {
      const dmgMult = b.dmgMult || 1.0;
      const extra = b.extraProj || 0;

      if (b.id === 'kraken') {
        b.attackTimer = Math.max(1.5, 2.5 - extra * 0.15);
        const count = 3 + extra;
        for (let i = 0; i < count; i++) {
          const spread = (i - (count - 1) / 2) * 0.22;
          const sa = targetAngle + spread;
          this.bossProjectiles.push({
            x: b.x,
            y: b.y,
            vx: Math.cos(sa) * 315,
            vy: Math.sin(sa) * 315,
            radius: 8,
            damage: Math.round(18 * dmgMult),
            color: '#c084fc',
            life: 2.2
          });
        }
      } else if (b.id === 'dutchman') {
        b.attackTimer = Math.max(1.4, 2.2 - extra * 0.12);
        const count = 5 + extra;
        for (let i = 0; i < count; i++) {
          const spread = (i - (count - 1) / 2) * 0.16;
          const sa = targetAngle + spread;
          this.bossProjectiles.push({
            x: b.x,
            y: b.y,
            vx: Math.cos(sa) * 355,
            vy: Math.sin(sa) * 355,
            radius: 7,
            damage: Math.round(16 * dmgMult),
            color: '#34d399',
            life: 2.0
          });
        }
      } else if (b.id === 'leviathan') {
        b.attackTimer = Math.max(1.2, 1.9 - extra * 0.12);
        const count = 2 + extra;
        for (let i = 0; i < count; i++) {
          const spread = (i - (count - 1) / 2) * 0.18;
          const sa = targetAngle + spread;
          this.bossProjectiles.push({
            x: b.x,
            y: b.y,
            vx: Math.cos(sa) * 395,
            vy: Math.sin(sa) * 395,
            radius: 9,
            damage: Math.round(22 * dmgMult),
            color: '#38bdf8',
            life: 2.1
          });
        }
      } else if (b.id === 'megalodon') {
        b.attackTimer = Math.max(1.8, 2.9 - extra * 0.15);
        const count = 1 + extra;
        for (let i = 0; i < count; i++) {
          const spread = (i - (count - 1) / 2) * 0.20;
          const sa = targetAngle + spread;
          this.bossProjectiles.push({
            x: b.x,
            y: b.y,
            vx: Math.cos(sa) * 345,
            vy: Math.sin(sa) * 345,
            radius: 10,
            damage: Math.round(20 * dmgMult),
            color: '#f87171',
            life: 1.9
          });
        }
      } else if (b.id === 'karkinos') {
        b.attackTimer = Math.max(1.5, 2.3 - extra * 0.12);
        const count = 4 + extra;
        for (let i = 0; i < count; i++) {
          const spread = (i - (count - 1) / 2) * 0.20;
          const sa = targetAngle + spread;
          this.bossProjectiles.push({
            x: b.x,
            y: b.y,
            vx: Math.cos(sa) * 330,
            vy: Math.sin(sa) * 330,
            radius: 9,
            damage: Math.round(21 * dmgMult),
            color: '#fb923c',
            life: 2.2
          });
        }
      } else if (b.id === 'charybdis') {
        b.attackTimer = Math.max(1.6, 2.4 - extra * 0.12);
        // 8-way radial swirling water-spout barrage
        const radialCount = 8 + extra * 2;
        for (let i = 0; i < radialCount; i++) {
          const sa = this.animTime + (i * Math.PI * 2) / radialCount;
          this.bossProjectiles.push({
            x: b.x,
            y: b.y,
            vx: Math.cos(sa) * 290,
            vy: Math.sin(sa) * 290,
            radius: 8,
            damage: Math.round(19 * dmgMult),
            color: '#22d3ee',
            life: 2.4
          });
        }
      } else if (b.id === 'armada_flagship') {
        b.attackTimer = Math.max(1.4, 2.0 - extra * 0.12);
        // Sweeping Golden Solar Broadside Fan
        const count = 6 + extra;
        for (let i = 0; i < count; i++) {
          const spread = (i - (count - 1) / 2) * 0.14;
          const sa = targetAngle + spread;
          this.bossProjectiles.push({
            x: b.x,
            y: b.y,
            vx: Math.cos(sa) * 380,
            vy: Math.sin(sa) * 380,
            radius: 8.5,
            damage: Math.round(24 * dmgMult),
            color: '#fde047',
            life: 2.3
          });
        }
      }
    }

    // Update Boss Projectiles
    for (let i = this.bossProjectiles.length - 1; i >= 0; i--) {
      const bp = this.bossProjectiles[i];
      bp.x += bp.vx * dt;
      bp.y += bp.vy * dt;
      bp.life -= dt;

      if (Math.hypot(bp.x - player.x, bp.y - player.y) < bp.radius + player.width * 0.75) {
        gameEngine.applyDamageToPlayer(bp.damage, b.name, b);
        this.bossProjectiles.splice(i, 1);
        continue;
      }

      if (bp.life <= 0) {
        this.bossProjectiles.splice(i, 1);
      }
    }

    gameEngine.updateBossHudUI();
  }

  render(ctx, camera) {
    if (!this.activeBoss) return;
    const b = this.activeBoss;

    // 1. Render Boss Projectiles
    for (const bp of this.bossProjectiles) {
      ctx.save();
      ctx.fillStyle = bp.color;
      ctx.shadowColor = bp.color;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(bp.x, bp.y, bp.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 2. Render Bespoke 2.5D/3D Boss Monster Model (All 7 Bosses!)
    ctx.save();
    ctx.translate(b.x, b.y);

    // Threat aura ring (Double Golden Ring if Cycle II+ Ascended Boss!)
    const pulse = Math.sin(this.animTime * 5) * 6;
    ctx.strokeStyle = b.color;
    ctx.lineWidth = b.cycle > 1 ? 4 : 3;
    ctx.setLineDash([12, 8]);
    ctx.beginPath();
    ctx.arc(0, 0, 62 + pulse, 0, Math.PI * 2);
    ctx.stroke();
    if (b.cycle > 1) {
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 74 - pulse * 0.6, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    if (b.id === 'kraken') {
      ctx.fillStyle = 'rgba(59, 7, 100, 0.55)';
      ctx.beginPath();
      ctx.arc(0, 0, 52, 0, Math.PI * 2);
      ctx.fill();

      for (let t = 0; t < 8; t++) {
        const baseA = (t * Math.PI * 2) / 8 + Math.sin(this.animTime * 3 + t) * 0.25;
        ctx.strokeStyle = b.hitFlash > 0 ? '#ffffff' : '#9333ea';
        ctx.lineWidth = 9;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        const midX = Math.cos(baseA + 0.3) * 32;
        const midY = Math.sin(baseA + 0.3) * 32;
        const tipX = Math.cos(baseA) * 58;
        const tipY = Math.sin(baseA) * 58;
        ctx.quadraticCurveTo(midX, midY, tipX, tipY);
        ctx.stroke();
      }

      ctx.fillStyle = b.hitFlash > 0 ? '#ffffff' : '#581c87';
      ctx.beginPath();
      ctx.arc(0, 0, 26, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(-9, -6, 5, 0, Math.PI * 2);
      ctx.arc(9, -6, 5, 0, Math.PI * 2);
      ctx.fill();
    } else if (b.id === 'dutchman') {
      ctx.rotate(b.angle);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.28)';
      ctx.beginPath();
      ctx.ellipse(0, 0, 54, 28, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = b.hitFlash > 0 ? '#ffffff' : '#064e3b';
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(42, 0);
      ctx.quadraticCurveTo(15, -22, -38, -18);
      ctx.lineTo(-38, 18);
      ctx.quadraticCurveTo(15, 22, 42, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      for (const mx of [-20, 0, 20]) {
        ctx.fillStyle = 'rgba(110, 231, 183, 0.82)';
        ctx.fillRect(mx - 4, -24, 8, 48);
      }
    } else if (b.id === 'megalodon') {
      ctx.rotate(b.angle);
      if (b.chargeTimer > 3.2) {
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.65)';
        ctx.lineWidth = 4;
        ctx.setLineDash([10, 6]);
        ctx.beginPath();
        ctx.moveTo(35, 0);
        ctx.lineTo(240, 0);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      const tailSwing = Math.sin(this.animTime * 10) * 10;
      ctx.fillStyle = b.hitFlash > 0 ? '#ffffff' : '#991b1b';
      ctx.beginPath();
      ctx.moveTo(38, 0);
      ctx.quadraticCurveTo(10, -18, -36, tailSwing);
      ctx.quadraticCurveTo(10, 18, 38, 0);
      ctx.fill();

      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(5, -14);
      ctx.lineTo(-10, -32);
      ctx.lineTo(-12, -10);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(5, 14);
      ctx.lineTo(-10, 32);
      ctx.lineTo(-12, 10);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(26, -7, 8, 14);
    } else if (b.id === 'leviathan') {
      ctx.restore();
      ctx.save();
      for (let i = b.segments.length - 1; i >= 0; i--) {
        const seg = b.segments[i];
        const r = Math.max(8, 22 - i * 1.5);
        ctx.fillStyle = b.hitFlash > 0 ? '#ffffff' : (i % 2 === 0 ? '#0891b2' : '#0e7490');
        ctx.beginPath();
        ctx.arc(seg.x, seg.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.translate(b.x, b.y);
      ctx.rotate(b.angle);
      ctx.fillStyle = b.hitFlash > 0 ? '#ffffff' : '#06b6d4';
      ctx.beginPath();
      ctx.arc(0, 0, 25, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-5, -12);
      ctx.lineTo(-24, -26);
      ctx.moveTo(-5, 12);
      ctx.lineTo(-24, 26);
      ctx.stroke();
    } else if (b.id === 'karkinos') {
      // Boss #5: Karkinos the Colossal Reef Titan (Volcanic Emperor Crab)
      ctx.rotate(b.angle);
      // 6 Jointed Obsidian Crab Legs
      ctx.strokeStyle = '#7c2d12';
      ctx.lineWidth = 6;
      for (const side of [-1, 1]) {
        for (let l = -1; l <= 1; l++) {
          const legSwing = Math.sin(this.animTime * 6 + l) * 5;
          ctx.beginPath();
          ctx.moveTo(l * 12, side * 18);
          ctx.lineTo(l * 16 + legSwing, side * 44);
          ctx.stroke();
        }
      }
      // Twin Crushing Pincers extending forward
      const snap = Math.abs(Math.sin(this.animTime * 4)) * 8;
      ctx.fillStyle = b.hitFlash > 0 ? '#ffffff' : '#ea580c';
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.arc(28, side * (22 - snap * 0.4), 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      // Armored Volcanic Carapace
      ctx.fillStyle = b.hitFlash > 0 ? '#ffffff' : (b.carapaceShieldActive ? '#f59e0b' : '#9a3412');
      ctx.beginPath();
      ctx.ellipse(0, 0, 32, 36, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = b.carapaceShieldActive ? '#fef08a' : '#fb923c';
      ctx.lineWidth = b.carapaceShieldActive ? 4 : 2.5;
      ctx.stroke();
    } else if (b.id === 'charybdis') {
      // Boss #6: Charybdis the Living Maelstrom
      for (let ring = 3; ring >= 1; ring--) {
        ctx.strokeStyle = ring === 1 ? '#e879f9' : 'rgba(56, 189, 248, 0.55)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, ring * 20 + Math.sin(this.animTime * 6 + ring) * 3, this.animTime * 3 * ring, this.animTime * 3 * ring + Math.PI * 1.4);
        ctx.stroke();
      }
      // Abyssal Maw & 12 Rotating Teeth
      ctx.fillStyle = b.hitFlash > 0 ? '#ffffff' : '#090d16';
      ctx.beginPath();
      ctx.arc(0, 0, 26, 0, Math.PI * 2);
      ctx.fill();

      const teeth = 12;
      for (let t = 0; t < teeth; t++) {
        const ta = this.animTime * 2.5 + (t * Math.PI * 2) / teeth;
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(Math.cos(ta) * 24, Math.sin(ta) * 24, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (b.id === 'armada_flagship') {
      // Boss #7: El Dorado Solar Armada Dreadnought
      ctx.rotate(b.angle);
      // Golden Solar Aura
      ctx.fillStyle = 'rgba(250, 204, 21, 0.22)';
      ctx.beginPath();
      ctx.ellipse(0, 0, 68, 36, 0, 0, Math.PI * 2);
      ctx.fill();

      // Gargantuan Gilded Hull
      ctx.fillStyle = b.hitFlash > 0 ? '#ffffff' : '#713f12';
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(56, 0);
      ctx.quadraticCurveTo(22, -28, -50, -22);
      ctx.lineTo(-50, 22);
      ctx.quadraticCurveTo(22, 28, 56, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 5 Royal Golden Sails
      for (const mx of [-34, -17, 0, 17, 34]) {
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(mx - 4, -28, 8, 56);
      }
    }

    ctx.restore();

    // Floating Boss Nameplate in World Space
    ctx.save();
    ctx.font = 'bold 10px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fde047';
    ctx.fillText(`💀 ${b.name} (+${b.bountyGold}G)`, b.x, b.y - 74);
    if (b.carapaceShieldActive) {
      ctx.fillStyle = '#fb923c';
      ctx.font = 'bold 8px "Press Start 2P", monospace';
      ctx.fillText('🛡️ CARAPACE SHIELD ACTIVE!', b.x, b.y - 88);
    }
    ctx.restore();
  }
}

window.BossMonsterEventManager = BossMonsterEventManager;

