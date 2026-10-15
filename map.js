// CORSAIRDASH: Sovereign Seas — 2.5D / 3D Archipelago & Ocean Perspective Renderer
// Renders animated ocean swells, wind streaks, 12 bespoke 3D islands, whirlpools, reefs, and sea stacks.

class ArchipelagoMap {
  constructor(data) {
    this.data = data || window.CORSAIR_DATA;
    this.islands = this.data.islands || [];
    this.seaStacks = this.data.seaStacks || [];
    this.coralReefs = this.data.coralReefs || [];
    this.whirlpools = this.data.whirlpools || [];
    this.floatingMines = this.data.floatingMines || [];

    this.waveTime = 0;
    this.windmillAngle = 0;
    this.lighthouseAngle = 0;
    this.vortexAngle = 0;
    this.rhumbOffset = 0;
    this.seagulls = [];
    this.initSeagulls();
  }

  initSeagulls() {
    for (const isl of this.islands) {
      for (let i = 0; i < 4; i++) {
        this.seagulls.push({
          cx: isl.x,
          cy: isl.y,
          orbitRadius: 90 + i * 45,
          angle: (i * Math.PI) / 2,
          speed: 0.45 + (i % 3) * 0.15,
          flapPhase: i * 1.3
        });
      }
    }
  }

  update(dt) {
    this.waveTime += dt;
    this.windmillAngle += dt * 1.4;
    this.lighthouseAngle += dt * 1.8;
    this.vortexAngle += dt * 2.6;
    this.rhumbOffset -= dt * 48;

    for (const g of this.seagulls) {
      g.angle += g.speed * dt;
      g.flapPhase += dt * 9;
    }

    // Respawn detonated sea mines after cooldown
    for (const m of this.floatingMines) {
      if (!m.active) {
        m.respawnTimer -= dt;
        if (m.respawnTimer <= 0) {
          m.active = true;
        }
      }
    }
  }

  // 2.5D Perspective Offset helper (Matches DixieDash's 3D extrusion feel!)
  getExtrudeOffset(worldX, worldY, camera, height) {
    const dx = (worldX - camera.x) * 0.00055;
    const dy = (worldY - camera.y) * 0.00055 - 0.35; // Slight northward sun/camera tilt
    return {
      ox: dx * height,
      oy: dy * height
    };
  }

  render(ctx, camera, rhumbRoute, weather, windAngle, windStrength, activePortTarget) {
    const viewLeft = camera.x - camera.width / 2 - 360;
    const viewRight = camera.x + camera.width / 2 + 360;
    const viewTop = camera.y - camera.height / 2 - 360;
    const viewBottom = camera.y + camera.height / 2 + 360;

    // 1. Deep Ocean Base, Swells & Live Wind Streaks
    this.renderOceanSurface(ctx, viewLeft, viewRight, viewTop, viewBottom, weather, windAngle, windStrength);

    // 2. Spinning Maelstroms / Whirlpools
    this.renderWhirlpools(ctx, viewLeft, viewRight, viewTop, viewBottom);

    // 3. Shallow Coral Reefs & Sandbars
    this.renderCoralReefs(ctx, viewLeft, viewRight, viewTop, viewBottom);

    // 4. Island Lagoons, Beaches, Wharves & Glowing Harbor Docking Rings
    this.renderIslandBasesAndWharves(ctx, camera, viewLeft, viewRight, viewTop, viewBottom, activePortTarget);

    // 5. Golden Astrolabe Rhumb Line Navigation Trail
    if (rhumbRoute && rhumbRoute.length > 1) {
      this.renderRhumbRoute(ctx, rhumbRoute, activePortTarget);
    }

    // 6. Floating Sea Mines / Powder Kegs
    this.renderFloatingMines(ctx, viewLeft, viewRight, viewTop, viewBottom);

    // 7. 3D Extruded Sea Stacks & Crashing Rocks
    this.renderSeaStacks(ctx, camera, viewLeft, viewRight, viewTop, viewBottom);

    // 8. Bespoke 3D Island Architecture & Landmarks
    this.renderIslandArchitecture(ctx, camera, viewLeft, viewRight, viewTop, viewBottom);

    // 9. Circling Harbor Seagulls
    this.renderSeagulls(ctx, viewLeft, viewRight, viewTop, viewBottom);

    // 10. World Edge Chart Borders & Reefs
    this.renderWorldBoundaries(ctx);
  }

  renderOceanSurface(ctx, left, right, top, bottom, weather, windAngle, windStrength) {
    // Base pelagic ocean fill
    let oceanColor = '#072a47';
    if (weather === 'HURRICANE_SQUALL') oceanColor = '#051c33';
    else if (weather === 'SIREN_GLOW') oceanColor = '#0b2545';
    else if (weather === 'CURSED_FOG') oceanColor = '#08262c';

    ctx.fillStyle = oceanColor;
    ctx.fillRect(left, top, right - left, bottom - top);

    // Subtle nautical chart grid lines (every 600 world units)
    const gridStep = 600;
    const startGX = Math.floor(left / gridStep) * gridStep;
    const startGY = Math.floor(top / gridStep) * gridStep;

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = startGX; x <= right; x += gridStep) {
      ctx.moveTo(x, top);
      ctx.lineTo(x, bottom);
    }
    for (let y = startGY; y <= bottom; y += gridStep) {
      ctx.moveTo(left, y);
      ctx.lineTo(right, y);
    }
    ctx.stroke();

    // Animated Ocean Wave Crests
    const waveTile = 180;
    const startWX = Math.floor(left / waveTile) * waveTile;
    const startWY = Math.floor(top / waveTile) * waveTile;

    ctx.strokeStyle = 'rgba(125, 211, 252, 0.14)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let gx = startWX; gx <= right; gx += waveTile) {
      for (let gy = startWY; gy <= bottom; gy += waveTile) {
        const hash = Math.sin(gx * 0.013 + gy * 0.017) * 40;
        const bobX = gx + hash + Math.cos(this.waveTime * 1.4 + gy * 0.01) * 14;
        const bobY = gy + hash + Math.sin(this.waveTime * 1.4 + gx * 0.01) * 8;
        ctx.moveTo(bobX - 18, bobY);
        ctx.quadraticCurveTo(bobX, bobY - 7, bobX + 18, bobY);
      }
    }
    ctx.stroke();

    // Live Wind Streamlines (Flowing in exact windAngle direction so player feels the breeze!)
    const windCos = Math.cos(windAngle || 0);
    const windSin = Math.sin(windAngle || 0);
    const cell = 320;
    const startCX = Math.floor(left / cell) * cell;
    const startCY = Math.floor(top / cell) * cell;

    ctx.strokeStyle = 'rgba(224, 242, 254, 0.16)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let cx = startCX; cx <= right; cx += cell) {
      for (let cy = startCY; cy <= bottom; cy += cell) {
        const phase = ((this.waveTime * (60 + (windStrength || 18) * 2) + cx * 0.37 + cy * 0.53) % cell);
        const wx = cx + windCos * phase;
        const wy = cy + windSin * phase;
        const len = 36 + (windStrength || 18) * 0.8;
        ctx.moveTo(wx, wy);
        ctx.lineTo(wx + windCos * len, wy + windSin * len);
      }
    }
    ctx.stroke();
  }

  renderWhirlpools(ctx, left, right, top, bottom) {
    for (const v of this.whirlpools) {
      if (v.x + v.radius < left || v.x - v.radius > right || v.y + v.radius < top || v.y - v.radius > bottom) continue;

      ctx.save();
      ctx.translate(v.x, v.y);

      // Outer turquoise current glow
      const grad = ctx.createRadialGradient(0, 0, 8, 0, 0, v.radius);
      grad.addColorStop(0, '#020617');
      grad.addColorStop(0.28, '#0f172a');
      grad.addColorStop(0.65, 'rgba(6, 182, 212, 0.38)');
      grad.addColorStop(1, 'rgba(6, 182, 212, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, v.radius, 0, Math.PI * 2);
      ctx.fill();

      // Rotating foam spiral arms
      ctx.rotate(this.vortexAngle * v.spinDir);
      ctx.strokeStyle = 'rgba(165, 243, 252, 0.55)';
      ctx.lineWidth = 2.5;
      for (let arm = 0; arm < 4; arm++) {
        ctx.save();
        ctx.rotate((arm * Math.PI) / 2);
        ctx.beginPath();
        for (let r = 12; r < v.radius * 0.88; r += 8) {
          const a = r * 0.045;
          const px = Math.cos(a) * r;
          const py = Math.sin(a) * r;
          if (r === 12) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.restore();
      }

      ctx.restore();
    }
  }

  renderCoralReefs(ctx, left, right, top, bottom) {
    for (const reef of this.coralReefs) {
      if (reef.x + reef.radius < left || reef.x - reef.radius > right || reef.y + reef.radius < top || reef.y - reef.radius > bottom) continue;

      ctx.save();
      ctx.translate(reef.x, reef.y);

      // Shallow turquoise shoal water
      ctx.fillStyle = 'rgba(20, 184, 166, 0.28)';
      ctx.beginPath();
      ctx.arc(0, 0, reef.radius, 0, Math.PI * 2);
      ctx.fill();

      // Dashed surf ring
      ctx.strokeStyle = 'rgba(204, 251, 241, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, reef.radius * 0.92, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Coral heads inside shoal
      ctx.fillStyle = reef.coralColor;
      for (let i = 0; i < 7; i++) {
        const a = i * 0.9;
        const dist = (i % 3) * (reef.radius * 0.26) + 12;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * dist, Math.sin(a) * dist, 5 + (i % 3) * 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  renderFloatingMines(ctx, left, right, top, bottom) {
    for (const m of this.floatingMines) {
      if (!m.active) continue;
      if (m.x < left || m.x > right || m.y < top || m.y > bottom) continue;

      const bob = Math.sin(this.waveTime * 4 + m.x) * 2.5;
      ctx.save();
      ctx.translate(m.x, m.y + bob);

      // Ripple ring
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(0, 0, m.radius + 4 + Math.sin(this.waveTime * 3) * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Iron-banded powder keg body
      ctx.fillStyle = '#451a03';
      ctx.beginPath();
      ctx.arc(0, 0, m.radius, 0, Math.PI * 2);
      ctx.fill();

      // Red explosive band
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, m.radius * 0.65, 0, Math.PI * 2);
      ctx.stroke();

      // Sputtering fuse spark
      const sparkOn = Math.floor(this.waveTime * 10) % 2 === 0;
      ctx.fillStyle = sparkOn ? '#fde047' : '#f97316';
      ctx.beginPath();
      ctx.arc(0, -3, 3.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  renderSeaStacks(ctx, camera, left, right, top, bottom) {
    for (const rock of this.seaStacks) {
      if (rock.x + rock.radius < left || rock.x - rock.radius > right || rock.y + rock.radius < top || rock.y - rock.radius > bottom) continue;

      const ext = this.getExtrudeOffset(rock.x, rock.y, camera, rock.height);
      const foamPulse = Math.sin(this.waveTime * 3 + rock.x * 0.05) * 4;

      // Crashing white surf ring
      ctx.strokeStyle = 'rgba(240, 249, 255, 0.65)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(rock.x, rock.y, rock.radius + 5 + foamPulse, 0, Math.PI * 2);
      ctx.stroke();

      // Base rock footprint
      ctx.fillStyle = '#1c1917';
      ctx.beginPath();
      ctx.arc(rock.x, rock.y, rock.radius, 0, Math.PI * 2);
      ctx.fill();

      // 3D Extruded Spire Body
      ctx.fillStyle = rock.tone;
      ctx.beginPath();
      ctx.arc(rock.x + ext.ox * 0.5, rock.y + ext.oy * 0.5, rock.radius * 0.78, 0, Math.PI * 2);
      ctx.fill();

      // 3D Spire Peak
      ctx.fillStyle = '#78716c';
      ctx.beginPath();
      ctx.arc(rock.x + ext.ox, rock.y + ext.oy, rock.radius * 0.45, 0, Math.PI * 2);
      ctx.fill();

      // Sea moss cap
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.arc(rock.x + ext.ox, rock.y + ext.oy, rock.radius * 0.25, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  renderIslandBasesAndWharves(ctx, camera, left, right, top, bottom, activePortTarget) {
    for (const isl of this.islands) {
      if (isl.x + isl.radius + 200 < left || isl.x - isl.radius - 200 > right ||
          isl.y + isl.radius + 200 < top || isl.y - isl.radius - 200 > bottom) {
        continue;
      }

      // 1. Outer Turquoise Lagoon Halo
      const lagoonGrad = ctx.createRadialGradient(isl.x, isl.y, isl.radius * 0.7, isl.x, isl.y, isl.radius * 1.48);
      lagoonGrad.addColorStop(0, 'rgba(6, 182, 212, 0.55)');
      lagoonGrad.addColorStop(0.6, 'rgba(14, 165, 233, 0.25)');
      lagoonGrad.addColorStop(1, 'rgba(14, 165, 233, 0)');
      ctx.fillStyle = lagoonGrad;
      ctx.beginPath();
      ctx.arc(isl.x, isl.y, isl.radius * 1.48, 0, Math.PI * 2);
      ctx.fill();

      // 2. Foaming Surf Line around Beach
      const surfExpand = Math.sin(this.waveTime * 2.5 + isl.x) * 4;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(isl.x, isl.y, isl.radius + 6 + surfExpand, 0, Math.PI * 2);
      ctx.stroke();

      // 3. Sandy Beach Ring
      ctx.fillStyle = isl.sandColor || '#fde68a';
      ctx.beginPath();
      ctx.arc(isl.x, isl.y, isl.radius, 0, Math.PI * 2);
      ctx.fill();

      // 4. Elevated Interior Lush Terrain (with 2.5D extrusion)
      const ext1 = this.getExtrudeOffset(isl.x, isl.y, camera, 28);
      ctx.fillStyle = isl.grassColor || '#15803d';
      ctx.beginPath();
      ctx.arc(isl.x + ext1.ox * 0.4, isl.y + ext1.oy * 0.4, isl.radius * 0.82, 0, Math.PI * 2);
      ctx.fill();

      // Inner Highland Plateau
      ctx.fillStyle = isl.rockColor || '#57534e';
      ctx.beginPath();
      ctx.arc(isl.x + ext1.ox * 0.8, isl.y + ext1.oy * 0.8, isl.radius * 0.52, 0, Math.PI * 2);
      ctx.fill();

      // 5. Wooden Harbor Wharf Pier connecting island shore to (dockX, dockY)
      const pierAngle = Math.atan2(isl.dockY - isl.y, isl.dockX - isl.x);
      const startX = isl.x + Math.cos(pierAngle) * (isl.radius * 0.72);
      const startY = isl.y + Math.sin(pierAngle) * (isl.radius * 0.72);

      ctx.save();
      ctx.strokeStyle = '#5c3a21';
      ctx.lineWidth = 22;
      ctx.lineCap = 'butt';
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(isl.dockX, isl.dockY);
      ctx.stroke();

      // Pier plank cross-ties
      ctx.strokeStyle = '#3e2723';
      ctx.lineWidth = 2;
      const pierLen = Math.hypot(isl.dockX - startX, isl.dockY - startY);
      const steps = Math.floor(pierLen / 10);
      const perpX = -Math.sin(pierAngle) * 11;
      const perpY = Math.cos(pierAngle) * 11;
      for (let s = 0; s <= steps; s++) {
        const t = s / Math.max(1, steps);
        const px = startX + (isl.dockX - startX) * t;
        const py = startY + (isl.dockY - startY) * t;
        ctx.beginPath();
        ctx.moveTo(px - perpX, py - perpY);
        ctx.lineTo(px + perpX, py + perpY);
        ctx.stroke();
      }
      ctx.restore();

      // 6. Glowing Harbor Mooring Zone at (dockX, dockY)
      const isTarget = activePortTarget && activePortTarget.id === isl.id;
      const pulse = Math.sin(this.waveTime * 5) * 6;
      const ringRadius = isTarget ? 64 + pulse : 46;

      ctx.save();
      ctx.translate(isl.dockX, isl.dockY);

      ctx.strokeStyle = isTarget ? '#fbbf24' : 'rgba(56, 189, 248, 0.75)';
      ctx.lineWidth = isTarget ? 4 : 2.5;
      ctx.setLineDash([10, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = isTarget ? 'rgba(251, 191, 36, 0.20)' : 'rgba(56, 189, 248, 0.10)';
      ctx.beginPath();
      ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
      ctx.fill();

      // Wharf Anchor Label
      ctx.font = 'bold 9px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = isTarget ? '#fde047' : '#bae6fd';
      ctx.fillText(isTarget ? '⚓ TARGET WHARF' : '⚓ HARBOR DOCK', 0, ringRadius + 16);
      ctx.restore();
    }
  }

  renderIslandArchitecture(ctx, camera, left, right, top, bottom) {
    for (const isl of this.islands) {
      if (isl.x + isl.radius + 200 < left || isl.x - isl.radius - 200 > right ||
          isl.y + isl.radius + 200 < top || isl.y - isl.radius - 200 > bottom) {
        continue;
      }

      const ext = this.getExtrudeOffset(isl.x, isl.y, camera, 85);
      const topX = isl.x + ext.ox;
      const topY = isl.y + ext.oy;

      // Render swaying 3D palm trees around beach perimeter
      for (let t = 0; t < 8; t++) {
        const a = (t * Math.PI * 2) / 8 + 0.35;
        const tx = isl.x + Math.cos(a) * (isl.radius * 0.76);
        const ty = isl.y + Math.sin(a) * (isl.radius * 0.76);
        this.renderPalmTree3D(ctx, tx, ty, camera);
      }

      // Bespoke 3D Landmark Architecture by Island Style
      ctx.save();
      if (isl.archStyle === 'citadel_harbor' || isl.archStyle === 'star_fortress') {
        // Star Fortress Walls & Citadel Keep
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(isl.x - 55, isl.y - 55, 110, 110);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 4;
        ctx.strokeRect(isl.x - 55, isl.y - 55, 110, 110);

        // Extruded Keep Tower
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(topX - 32, topY - 32, 64, 64);
        ctx.fillStyle = isl.themeColor;
        ctx.fillRect(topX - 24, topY - 24, 48, 48);

        // Harbor Lighthouse with rotating golden searchlight
        this.renderLighthouse3D(ctx, isl.x + 70, isl.y - 50, camera);
      } else if (isl.archStyle === 'pirate_skull_cove') {
        // Grinning Basalt Skull Cliff & Torch Eyes
        ctx.fillStyle = '#1c1917';
        ctx.beginPath();
        ctx.arc(topX, topY, 64, 0, Math.PI * 2);
        ctx.fill();

        // Glowing molten torch eyes
        ctx.fillStyle = '#ff5500';
        ctx.beginPath();
        ctx.arc(topX - 22, topY - 10, 12, 0, Math.PI * 2);
        ctx.arc(topX + 22, topY - 10, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(topX - 22, topY - 10, 6, 0, Math.PI * 2);
        ctx.arc(topX + 22, topY - 10, 6, 0, Math.PI * 2);
        ctx.fill();
      } else if (isl.archStyle === 'windmill_plantation') {
        // Warehouse roofs
        ctx.fillStyle = '#9a3412';
        ctx.fillRect(isl.x - 70, isl.y + 15, 55, 36);
        ctx.fillRect(isl.x + 15, isl.y + 15, 55, 36);

        // 3D Extruded Windmill Tower & Spinning Sails
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.arc(topX, topY, 26, 0, Math.PI * 2);
        ctx.fill();

        ctx.save();
        ctx.translate(topX, topY);
        ctx.rotate(this.windmillAngle);
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 4;
        for (let b = 0; b < 4; b++) {
          ctx.rotate(Math.PI / 2);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(0, -56);
          ctx.stroke();
          ctx.fillStyle = 'rgba(254, 249, 195, 0.75)';
          ctx.fillRect(0, -52, 14, 36);
        }
        ctx.restore();
      } else if (isl.archStyle === 'volcano_obsidian') {
        // Smoking Volcanic Caldera & Molten Lava River
        ctx.fillStyle = '#292524';
        ctx.beginPath();
        ctx.arc(topX, topY, 72, 0, Math.PI * 2);
        ctx.fill();

        // Glowing Lava Crater
        const lavaPulse = Math.sin(this.waveTime * 4) * 5;
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.arc(topX, topY, 32 + lavaPulse, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(topX, topY, 16, 0, Math.PI * 2);
        ctx.fill();
      } else if (isl.archStyle === 'pharos_lighthouse') {
        this.renderLighthouse3D(ctx, isl.x, isl.y, camera, 1.5);
      } else if (isl.archStyle === 'spanish_cathedral') {
        // White stucco cathedral nave
        ctx.fillStyle = '#fffbeb';
        ctx.fillRect(isl.x - 50, isl.y - 35, 100, 70);
        // Terracotta roof
        ctx.fillStyle = '#c2410c';
        ctx.fillRect(topX - 44, topY - 28, 88, 56);
        // Golden cross spire
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(topX, topY - 45);
        ctx.lineTo(topX, topY - 10);
        ctx.moveTo(topX - 12, topY - 32);
        ctx.lineTo(topX + 12, topY - 32);
        ctx.stroke();
      } else {
        // Classic Harbor Fort & Tavern Cluster
        ctx.fillStyle = '#78350f';
        ctx.fillRect(isl.x - 48, isl.y - 30, 96, 60);
        ctx.fillStyle = isl.themeColor || '#eab308';
        ctx.beginPath();
        ctx.arc(topX, topY, 28, 0, Math.PI * 2);
        ctx.fill();
      }

      // Floating Island Port Name Banner
      ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
      ctx.fillRect(isl.x - 115, isl.y - isl.radius - 36, 230, 26);
      ctx.strokeStyle = isl.themeColor || '#eab308';
      ctx.lineWidth = 2;
      ctx.strokeRect(isl.x - 115, isl.y - isl.radius - 36, 230, 26);

      ctx.font = 'bold 10px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`${isl.icon} ${isl.name.toUpperCase()}`, isl.x, isl.y - isl.radius - 19);
      ctx.restore();
    }
  }

  renderLighthouse3D(ctx, x, y, camera, scale = 1.0) {
    const ext = this.getExtrudeOffset(x, y, camera, 115 * scale);
    const tx = x + ext.ox;
    const ty = y + ext.oy;

    // Tower shaft
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 22 * scale;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(tx, ty);
    ctx.stroke();

    // Red spiral stripe
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 18 * scale;
    ctx.beginPath();
    ctx.moveTo((x + tx) / 2, (y + ty) / 2);
    ctx.lineTo(tx, ty);
    ctx.stroke();

    // Lantern room
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(tx, ty, 11 * scale, 0, Math.PI * 2);
    ctx.fill();

    // Rotating Golden Searchlight Cone
    ctx.save();
    ctx.translate(tx, ty);
    ctx.rotate(this.lighthouseAngle);
    const beamGrad = ctx.createLinearGradient(0, 0, 240 * scale, 0);
    beamGrad.addColorStop(0, 'rgba(253, 224, 71, 0.55)');
    beamGrad.addColorStop(1, 'rgba(253, 224, 71, 0)');
    ctx.fillStyle = beamGrad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(240 * scale, -45 * scale);
    ctx.lineTo(240 * scale, 45 * scale);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  renderPalmTree3D(ctx, x, y, camera) {
    const ext = this.getExtrudeOffset(x, y, camera, 36);
    const sway = Math.sin(this.waveTime * 2.2 + x * 0.05) * 4;
    const topX = x + ext.ox + sway;
    const topY = y + ext.oy;

    // Trunk
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo((x + topX) / 2 + 4, (y + topY) / 2, topX, topY);
    ctx.stroke();

    // 5 Palm Fronds
    ctx.strokeStyle = '#16a34a';
    ctx.lineWidth = 3;
    for (let f = 0; f < 5; f++) {
      const a = (f * Math.PI * 2) / 5 + sway * 0.03;
      ctx.beginPath();
      ctx.moveTo(topX, topY);
      ctx.lineTo(topX + Math.cos(a) * 15, topY + Math.sin(a) * 15);
      ctx.stroke();
    }
  }

  renderRhumbRoute(ctx, route, activePortTarget) {
    ctx.save();
    ctx.strokeStyle = activePortTarget && activePortTarget.isDelivery ? '#34d399' : '#fbbf24';
    ctx.lineWidth = 5;
    ctx.setLineDash([18, 12]);
    ctx.lineDashOffset = this.rhumbOffset;

    ctx.beginPath();
    for (let i = 0; i < route.length; i++) {
      const pt = route[i];
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    }
    ctx.stroke();
    ctx.restore();
  }

  renderSeagulls(ctx, left, right, top, bottom) {
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 1.8;
    for (const g of this.seagulls) {
      const gx = g.cx + Math.cos(g.angle) * g.orbitRadius;
      const gy = g.cy + Math.sin(g.angle) * g.orbitRadius;
      if (gx < left || gx > right || gy < top || gy > bottom) continue;

      const wingY = Math.sin(g.flapPhase) * 4;
      ctx.beginPath();
      ctx.moveTo(gx - 6, gy + wingY);
      ctx.quadraticCurveTo(gx - 3, gy - 3, gx, gy);
      ctx.quadraticCurveTo(gx + 3, gy - 3, gx + 6, gy + wingY);
      ctx.stroke();
    }
  }

  renderWorldBoundaries(ctx) {
    const b = this.data.worldBounds;
    ctx.save();
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 8;
    ctx.setLineDash([28, 18]);
    ctx.strokeRect(b.minX, b.minY, b.maxX - b.minX, b.maxY - b.minY);
    ctx.restore();
  }
}

window.ArchipelagoMap = ArchipelagoMap;
