// CORSAIRDASH: Sovereign Seas — Boss Monster Event Engine
// Replaces DixieDash's MarathonEvent with 4 Legendary Sea Bosses that can be slain for big bucks or outrun!

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
    const template = bossId
      ? (this.catalog.find(b => b.id === bossId) || this.catalog[0])
      : this.catalog[Math.floor(Math.random() * this.catalog.length)];

    if (!template) return null;

    const angle = Math.random() * Math.PI * 2;
    const spawnDist = 620;
    const bx = Math.max(-3800, Math.min(3800, playerX + Math.cos(angle) * spawnDist));
    const by = Math.max(-3800, Math.min(3800, playerY + Math.sin(angle) * spawnDist));

    this.activeBoss = {
      ...template,
      x: bx,
      y: by,
      angle: Math.atan2(playerY - by, playerX - bx),
      hp: template.maxHp,
      maxHp: template.maxHp,
      attackTimer: 2.2,
      chargeTimer: 0,
      isCharging: false,
      hitFlash: 0,
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

    // Megalodon high-speed lunge behavior
    let moveSpeed = b.speed;
    if (b.id === 'megalodon') {
      b.chargeTimer += dt;
      if (b.chargeTimer > 4.5 && dist < 580) {
        b.isCharging = true;
        moveSpeed = b.speed * 1.85;
        if (b.chargeTimer > 6.0) {
          b.isCharging = false;
          b.chargeTimer = 0;
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
    if (dist < 58 && !gameEngine.isPlayerInSafeHarbor()) {
      gameEngine.applyDamageToPlayer(24 * dt, b.name);
    }

    // Boss Ranged Attacks (Ink Vortexes, Spectral Broadsides, Lightning Orbs)
    b.attackTimer -= dt;
    if (b.attackTimer <= 0 && dist < 680 && !gameEngine.isPlayerInSafeHarbor()) {
      if (b.id === 'kraken') {
        b.attackTimer = 2.6;
        // 3-way ink vortex spread
        for (const spread of [-0.24, 0, 0.24]) {
          const sa = targetAngle + spread;
          this.bossProjectiles.push({
            x: b.x,
            y: b.y,
            vx: Math.cos(sa) * 310,
            vy: Math.sin(sa) * 310,
            radius: 8,
            damage: 18,
            color: '#c084fc',
            life: 2.2
          });
        }
      } else if (b.id === 'dutchman') {
        b.attackTimer = 2.2;
        // 5-shot cursed emerald chain-shot fan
        for (const spread of [-0.36, -0.18, 0, 0.18, 0.36]) {
          const sa = targetAngle + spread;
          this.bossProjectiles.push({
            x: b.x,
            y: b.y,
            vx: Math.cos(sa) * 350,
            vy: Math.sin(sa) * 350,
            radius: 7,
            damage: 16,
            color: '#34d399',
            life: 2.0
          });
        }
      } else if (b.id === 'leviathan') {
        b.attackTimer = 1.9;
        // High-velocity storm lightning orbs
        for (const spread of [-0.15, 0.15]) {
          const sa = targetAngle + spread;
          this.bossProjectiles.push({
            x: b.x,
            y: b.y,
            vx: Math.cos(sa) * 390,
            vy: Math.sin(sa) * 390,
            radius: 9,
            damage: 22,
            color: '#38bdf8',
            life: 2.1
          });
        }
      } else if (b.id === 'megalodon') {
        b.attackTimer = 3.0;
        // Tidal shockwave surge toward player
        this.bossProjectiles.push({
          x: b.x,
          y: b.y,
          vx: Math.cos(targetAngle) * 340,
          vy: Math.sin(targetAngle) * 340,
          radius: 10,
          damage: 20,
          color: '#f87171',
          life: 1.8
        });
      }
    }

    // Update Boss Projectiles
    for (let i = this.bossProjectiles.length - 1; i >= 0; i--) {
      const bp = this.bossProjectiles[i];
      bp.x += bp.vx * dt;
      bp.y += bp.vy * dt;
      bp.life -= dt;

      if (Math.hypot(bp.x - player.x, bp.y - player.y) < bp.radius + player.width * 0.75) {
        gameEngine.applyDamageToPlayer(bp.damage, b.name);
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

    // 2. Render Bespoke 2.5D/3D Boss Monster Model
    ctx.save();
    ctx.translate(b.x, b.y);

    // Threat aura ring
    const pulse = Math.sin(this.animTime * 5) * 6;
    ctx.strokeStyle = b.color;
    ctx.lineWidth = 3;
    ctx.setLineDash([12, 8]);
    ctx.beginPath();
    ctx.arc(0, 0, 58 + pulse, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    if (b.id === 'kraken') {
      // Dark abyssal ink pool
      ctx.fillStyle = 'rgba(59, 7, 100, 0.55)';
      ctx.beginPath();
      ctx.arc(0, 0, 52, 0, Math.PI * 2);
      ctx.fill();

      // 8 Writhing Tentacles
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

      // Kraken Mantle Head & Golden Eyes
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
      // Spectral emerald mist
      ctx.fillStyle = 'rgba(16, 185, 129, 0.28)';
      ctx.beginPath();
      ctx.ellipse(0, 0, 54, 28, 0, 0, Math.PI * 2);
      ctx.fill();

      // Ghost Galleon Hull
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

      // 3 Glowing Tattered Sails
      for (const mx of [-20, 0, 20]) {
        ctx.fillStyle = 'rgba(110, 231, 183, 0.82)';
        ctx.fillRect(mx - 4, -24, 8, 48);
      }
    } else if (b.id === 'megalodon') {
      ctx.rotate(b.angle);
      // Telegraphing Crimson Charge Line
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

      // Colossal Shark Body
      const tailSwing = Math.sin(this.animTime * 10) * 10;
      ctx.fillStyle = b.hitFlash > 0 ? '#ffffff' : '#991b1b';
      ctx.beginPath();
      ctx.moveTo(38, 0);
      ctx.quadraticCurveTo(10, -18, -36, tailSwing);
      ctx.quadraticCurveTo(10, 18, 38, 0);
      ctx.fill();

      // Pectoral & Dorsal Fins
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

      // Jaws & Teeth
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(26, -7, 8, 14);
    } else if (b.id === 'leviathan') {
      ctx.restore();
      // Render trailing segments in world space first
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
      // Dragon Head
      ctx.translate(b.x, b.y);
      ctx.rotate(b.angle);
      ctx.fillStyle = b.hitFlash > 0 ? '#ffffff' : '#06b6d4';
      ctx.beginPath();
      ctx.arc(0, 0, 25, 0, Math.PI * 2);
      ctx.fill();
      // Golden horns
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-5, -12);
      ctx.lineTo(-24, -26);
      ctx.moveTo(-5, 12);
      ctx.lineTo(-24, 26);
      ctx.stroke();
    }

    ctx.restore();

    // Floating Boss Nameplate in World Space
    ctx.save();
    ctx.font = 'bold 10px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fde047';
    ctx.fillText(`💀 ${b.name} (+${b.bountyGold}G)`, b.x, b.y - 68);
    ctx.restore();
  }
}

window.BossMonsterEventManager = BossMonsterEventManager;
