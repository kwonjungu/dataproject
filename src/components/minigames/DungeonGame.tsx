'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CHARACTERS, CharacterId, PlayerState, Enemy, Projectile, Item, Particle,
  GAME_DURATION, MAP_SIZE, LEVEL_UP_CHOICES, EVOLUTION_THRESHOLDS,
} from '@/data/dungeonGame';
import { snackItems, shuffle } from '@/data/snacks';

interface DungeonGameProps { onBack: () => void; }
type Phase = 'select' | 'ready' | 'playing' | 'levelup' | 'boss' | 'over' | 'clear';

let eid = 0, iid = 0;

// All game state lives here, outside React rendering
interface GameState {
  player: PlayerState | null;
  enemies: Enemy[];
  projectiles: Projectile[];
  items: Item[];
  particles: Particle[];
  camera: { x: number; y: number };
  keys: Set<string>;
  touchDir: { x: number; y: number };
  lastAttack: number;
  lastSpawn: number;
  lastItemSpawn: number;
  time: number;
  charDef: (typeof CHARACTERS)['ohbaksa'];
  bossSpawned: boolean;
  villainImg: HTMLImageElement | null;
  phase: Phase;
}

function createGameState(): GameState {
  return {
    player: null, enemies: [], projectiles: [], items: [], particles: [],
    camera: { x: 0, y: 0 }, keys: new Set(), touchDir: { x: 0, y: 0 },
    lastAttack: 0, lastSpawn: 0, lastItemSpawn: 0, time: GAME_DURATION,
    charDef: CHARACTERS.ohbaksa, bossSpawned: false, villainImg: null, phase: 'select',
  };
}

function updateGame(g: GameState): void {
  const p = g.player;
  if (!p || (g.phase !== 'playing' && g.phase !== 'boss')) return;

  // Movement
  let dx = 0, dy = 0;
  if (g.keys.has('w') || g.keys.has('arrowup')) dy -= 1;
  if (g.keys.has('s') || g.keys.has('arrowdown')) dy += 1;
  if (g.keys.has('a') || g.keys.has('arrowleft')) dx -= 1;
  if (g.keys.has('d') || g.keys.has('arrowright')) dx += 1;
  if (g.touchDir.x || g.touchDir.y) { dx = g.touchDir.x; dy = g.touchDir.y; }
  const mag = Math.sqrt(dx * dx + dy * dy);
  if (mag > 0) {
    const spd = p.skillActive ? p.speed * 2 : p.speed;
    p.x += (dx / mag) * spd;
    p.y += (dy / mag) * spd;
  }
  p.x = Math.max(20, Math.min(MAP_SIZE - 20, p.x));
  p.y = Math.max(20, Math.min(MAP_SIZE - 20, p.y));

  // Timers
  if (p.invincible) { p.invincibleTimer -= 1 / 60; if (p.invincibleTimer <= 0) p.invincible = false; }
  if (p.skillActive) { p.skillTimer -= 1 / 60; if (p.skillTimer <= 0) p.skillActive = false; }
  if (p.skillCooldown > 0) p.skillCooldown -= 1 / 60;

  // Evolution
  for (let i = EVOLUTION_THRESHOLDS.length - 1; i >= 0; i--) {
    if (p.level >= EVOLUTION_THRESHOLDS[i]) { p.evolutionStage = i; break; }
  }

  // Auto attack
  const now = performance.now();
  if (now - g.lastAttack > 1000 / p.attackRate) {
    g.lastAttack = now;
    let nearest: Enemy | null = null, minDist = p.attackRange;
    for (const e of g.enemies) {
      const d = Math.hypot(e.x - p.x, e.y - p.y);
      if (d < minDist) { minDist = d; nearest = e; }
    }
    if (nearest) {
      const angle = Math.atan2(nearest.y - p.y, nearest.x - p.x);
      for (let i = 0; i < p.projectileCount; i++) {
        const spread = (i - (p.projectileCount - 1) / 2) * 0.15;
        const a = angle + spread;
        g.projectiles.push({
          x: p.x, y: p.y, vx: Math.cos(a) * 6, vy: Math.sin(a) * 6,
          damage: p.damage, radius: 4, life: 60, type: g.charDef.attackType, color: g.charDef.color,
        });
      }
    }
  }

  // Spawn enemies
  if (now - g.lastSpawn > (g.time > 120 ? 1200 : g.time > 60 ? 700 : 400)) {
    g.lastSpawn = now;
    const angle = Math.random() * Math.PI * 2;
    const dist = 400 + Math.random() * 200;
    const types: Enemy['type'][] = g.time > 120 ? ['normal'] : g.time > 60 ? ['normal', 'normal', 'speed'] : ['normal', 'speed', 'tank'];
    const type = types[Math.floor(Math.random() * types.length)];
    const ex = p.x + Math.cos(angle) * dist, ey = p.y + Math.sin(angle) * dist;
    const e: Enemy = type === 'speed'
      ? { id: eid++, x: ex, y: ey, hp: 10, maxHp: 10, speed: 2.5, radius: 12, type, color: '#ef4444', damage: 1 }
      : type === 'tank'
      ? { id: eid++, x: ex, y: ey, hp: 40, maxHp: 40, speed: 0.8, radius: 22, type, color: '#92400e', damage: 1 }
      : { id: eid++, x: ex, y: ey, hp: 15, maxHp: 15, speed: 1.2, radius: 14, type, color: '#a855f7', damage: 1 };
    g.enemies.push(e);
  }

  // Boss
  if (g.time <= 60 && !g.bossSpawned) {
    g.bossSpawned = true;
    g.enemies.push({ id: eid++, x: p.x + 500, y: p.y, hp: 300, maxHp: 300, speed: 0.6, radius: 40, type: 'boss', color: '#7c3aed', damage: 2 });
    g.phase = 'boss';
  }

  // Spawn items
  if (now - g.lastItemSpawn > 2000) {
    g.lastItemSpawn = now;
    const snack = shuffle(snackItems)[0];
    const rare = Math.random() < 0.1;
    g.items.push({
      id: iid++, x: p.x + (Math.random() - 0.5) * 600, y: p.y + (Math.random() - 0.5) * 600,
      emoji: rare ? '⭐' : snack.emoji, name: rare ? '골든' : snack.name,
      healthy: rare || snack.healthy, type: rare ? 'rare' : 'normal', radius: 15,
    });
  }

  // Projectiles
  g.projectiles = g.projectiles.filter((proj) => {
    proj.x += proj.vx; proj.y += proj.vy; proj.life -= 1;
    for (let i = g.enemies.length - 1; i >= 0; i--) {
      const e = g.enemies[i];
      if (Math.hypot(proj.x - e.x, proj.y - e.y) < e.radius + proj.radius) {
        e.hp -= proj.damage;
        for (let k = 0; k < 4; k++) g.particles.push({ x: proj.x, y: proj.y, vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4, life: 20, maxLife: 20, color: proj.color, radius: 3 });
        if (e.hp <= 0) {
          p.score += e.type === 'boss' ? 100 : e.type === 'tank' ? 20 : 10;
          p.kills += 1;
          p.exp += e.type === 'boss' ? 50 : e.type === 'tank' ? 15 : 8;
          for (let k = 0; k < 10; k++) g.particles.push({ x: e.x, y: e.y, vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 0.5) * 6, life: 30, maxLife: 30, color: e.color, radius: 4 });
          g.enemies.splice(i, 1);
        }
        return false;
      }
    }
    return proj.life > 0;
  });

  // Enemies hit player
  for (const e of g.enemies) {
    const a = Math.atan2(p.y - e.y, p.x - e.x);
    e.x += Math.cos(a) * e.speed;
    e.y += Math.sin(a) * e.speed;
    if (!p.invincible && Math.hypot(e.x - p.x, e.y - p.y) < e.radius + 16) {
      if (p.skillActive && g.charDef.id === 'dasom') continue;
      p.hp -= e.damage;
      p.invincible = true;
      p.invincibleTimer = 1;
      if (p.hp <= 0) { g.phase = 'over'; return; }
    }
  }

  // Collect items
  g.items = g.items.filter((item) => {
    if (Math.hypot(item.x - p.x, item.y - p.y) < item.radius + 16) {
      if (item.healthy) { p.exp += item.type === 'rare' ? 25 : 8; p.score += item.type === 'rare' ? 30 : 10; p.collected += 1; }
      else { p.score = Math.max(0, p.score - 5); }
      for (let k = 0; k < 5; k++) g.particles.push({ x: item.x, y: item.y, vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4, life: 20, maxLife: 20, color: item.healthy ? '#22c55e' : '#ef4444', radius: 3 });
      return false;
    }
    return true;
  });

  // Level up
  if (p.exp >= p.expToNext) {
    p.exp -= p.expToNext;
    p.level += 1;
    p.expToNext = Math.floor(p.expToNext * 1.4);
    g.phase = 'levelup';
  }

  // Particles
  g.particles = g.particles.filter((pt) => { pt.x += pt.vx; pt.y += pt.vy; pt.life -= 1; return pt.life > 0; });

  // Camera
  g.camera.x = p.x - 400;
  g.camera.y = p.y - 300;
}

function drawGame(ctx: CanvasRenderingContext2D, g: GameState, W: number, H: number): void {
  ctx.fillStyle = '#0a0e27';
  ctx.fillRect(0, 0, W, H);

  const p = g.player;
  if (!p) return;

  const cx = g.camera.x, cy = g.camera.y;

  // Grid
  ctx.strokeStyle = '#1a1f4a';
  ctx.lineWidth = 1;
  for (let x = -(cx % 60); x < W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = -(cy % 60); y < H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

  // Items
  for (const item of g.items) {
    const sx = item.x - cx, sy = item.y - cy;
    if (sx < -50 || sx > W + 50 || sy < -50 || sy > H + 50) continue;
    ctx.font = item.type === 'rare' ? '28px serif' : '22px serif';
    ctx.textAlign = 'center';
    ctx.fillText(item.emoji, sx, sy + 7);
  }

  // Enemies
  for (const e of g.enemies) {
    const sx = e.x - cx, sy = e.y - cy;
    if (sx < -60 || sx > W + 60 || sy < -60 || sy > H + 60) continue;
    if (e.type === 'boss' && g.villainImg?.complete) {
      ctx.drawImage(g.villainImg, sx - 40, sy - 40, 80, 80);
    } else {
      ctx.beginPath(); ctx.arc(sx, sy, e.radius, 0, Math.PI * 2); ctx.fillStyle = e.color; ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(sx - e.radius * 0.2, sy - e.radius * 0.15, e.radius * 0.35, e.radius * 0.25, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(sx - e.radius * 0.1, sy - e.radius * 0.1, e.radius * 0.12, 0, Math.PI * 2); ctx.fill();
    }
    if (e.hp < e.maxHp) {
      ctx.fillStyle = '#333'; ctx.fillRect(sx - e.radius, sy - e.radius - 8, e.radius * 2, 4);
      ctx.fillStyle = '#ef4444'; ctx.fillRect(sx - e.radius, sy - e.radius - 8, e.radius * 2 * (e.hp / e.maxHp), 4);
    }
  }

  // Projectiles
  for (const proj of g.projectiles) {
    const sx = proj.x - cx, sy = proj.y - cy;
    ctx.beginPath(); ctx.arc(sx, sy, proj.radius, 0, Math.PI * 2);
    ctx.fillStyle = proj.color; ctx.fill();
    ctx.shadowColor = proj.color; ctx.shadowBlur = 8; ctx.fill(); ctx.shadowBlur = 0;
  }

  // Player
  const px = p.x - cx, py = p.y - cy;
  if (p.evolutionStage >= 3) {
    const grd = ctx.createRadialGradient(px, py, 0, px, py, 30);
    grd.addColorStop(0, g.charDef.color + '40'); grd.addColorStop(1, 'transparent');
    ctx.beginPath(); ctx.arc(px, py, 30, 0, Math.PI * 2); ctx.fillStyle = grd; ctx.fill();
  }
  const pColor = p.evolutionStage >= 4 ? '#ffd700' : p.evolutionStage >= 1 ? g.charDef.color : '#888';
  ctx.beginPath(); ctx.ellipse(px, py, 16, 20, 0, 0, Math.PI * 2); ctx.fillStyle = pColor; ctx.fill();
  ctx.strokeStyle = '#fff3'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#b3e5fc'; ctx.beginPath(); ctx.ellipse(px + 6, py - 5, 8, 6, 0.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(px + 8, py - 6, 2, 0, Math.PI * 2); ctx.fill();
  if (p.evolutionStage >= 2) { ctx.fillStyle = g.charDef.color; ctx.fillRect(px - 10, py - 28, 20, 10); }
  if (p.evolutionStage >= 4) { ctx.fillStyle = '#ffd700'; ctx.beginPath(); ctx.moveTo(px - 10, py - 28); ctx.lineTo(px - 12, py - 38); ctx.lineTo(px, py - 40); ctx.lineTo(px + 12, py - 38); ctx.lineTo(px + 10, py - 28); ctx.fill(); }
  if (p.invincible && Math.floor(Date.now() / 100) % 2 === 0) { ctx.beginPath(); ctx.arc(px, py, 24, 0, Math.PI * 2); ctx.strokeStyle = '#fff8'; ctx.lineWidth = 2; ctx.stroke(); }

  // Particles
  for (const pt of g.particles) {
    ctx.globalAlpha = pt.life / pt.maxLife;
    ctx.beginPath(); ctx.arc(pt.x - cx, pt.y - cy, pt.radius * (pt.life / pt.maxLife), 0, Math.PI * 2); ctx.fillStyle = pt.color; ctx.fill();
  }
  ctx.globalAlpha = 1;
}

export default function DungeonGame({ onBack }: DungeonGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<GameState>(createGameState());
  const animRef = useRef<number>(0);
  const [, forceRender] = useState(0);
  const [phase, setPhase] = useState<Phase>('select');
  const [levelUpChoices, setLevelUpChoices] = useState<typeof LEVEL_UP_CHOICES>([]);
  const [selectedChar, setSelectedChar] = useState<CharacterId | null>(null);

  // Sync phase from game state to React state
  const syncPhase = useCallback(() => {
    const g = gameRef.current;
    if (g.phase === 'levelup' && phase !== 'levelup') {
      setLevelUpChoices(shuffle(LEVEL_UP_CHOICES).slice(0, 3));
      setPhase('levelup');
    } else if (g.phase !== phase) {
      setPhase(g.phase);
    }
    forceRender(n => n + 1);
  }, [phase]);

  const startGame = useCallback((charId: CharacterId) => {
    const def = CHARACTERS[charId];
    const g = gameRef.current;
    g.player = {
      x: MAP_SIZE / 2, y: MAP_SIZE / 2, hp: def.baseHp, maxHp: def.baseHp,
      speed: def.baseSpeed, damage: def.baseDamage, attackRate: def.attackRate,
      attackRange: def.attackRange, level: 1, exp: 0, expToNext: 30,
      score: 0, kills: 0, collected: 0, projectileCount: 1,
      invincible: false, invincibleTimer: 0, skillActive: false, skillTimer: 0, skillCooldown: 0, evolutionStage: 0,
    };
    g.enemies = []; g.projectiles = []; g.items = []; g.particles = [];
    g.time = GAME_DURATION; g.charDef = def; g.bossSpawned = false;
    g.lastAttack = performance.now(); g.lastSpawn = performance.now(); g.lastItemSpawn = performance.now();
    g.camera = { x: 0, y: 0 }; g.keys = new Set(); g.touchDir = { x: 0, y: 0 };
    g.phase = 'ready';
    const img = new Image(); img.src = '/images/villain.png'; g.villainImg = img;
    setSelectedChar(charId);
    setPhase('ready');
  }, []);

  const beginPlaying = useCallback(() => {
    gameRef.current.phase = 'playing';
    setPhase('playing');
  }, []);

  const handleLevelUp = useCallback((choice: typeof LEVEL_UP_CHOICES[0]) => {
    const p = gameRef.current.player;
    if (!p) return;
    Object.assign(p, choice.apply(p));
    gameRef.current.phase = gameRef.current.bossSpawned ? 'boss' : 'playing';
    setPhase(gameRef.current.phase);
  }, []);

  // Keyboard
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      gameRef.current.keys.add(e.key.toLowerCase());
      if (e.key === ' ') {
        e.preventDefault();
        const p = gameRef.current.player;
        if (p && p.skillCooldown <= 0) {
          p.skillActive = true; p.skillTimer = 3; p.skillCooldown = 15;
          if (gameRef.current.charDef.id === 'dasom') { p.invincible = true; p.invincibleTimer = 3; }
        }
      }
    };
    const up = (e: KeyboardEvent) => gameRef.current.keys.delete(e.key.toLowerCase());
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);

  // Timer
  useEffect(() => {
    if (phase !== 'playing' && phase !== 'boss') return;
    const t = setInterval(() => {
      gameRef.current.time -= 1;
      if (gameRef.current.time <= 0) { gameRef.current.phase = 'clear'; setPhase('clear'); }
      forceRender(n => n + 1);
    }, 1000);
    return () => clearInterval(t);
  }, [phase]);

  // THE GAME LOOP — simple and reliable
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = true;
    const loop = () => {
      if (!running) return;
      updateGame(gameRef.current);
      drawGame(ctx, gameRef.current, canvas.width, canvas.height);
      syncPhase();
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => { running = false; cancelAnimationFrame(animRef.current); };
  }, [syncPhase]);

  // Touch
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const p = gameRef.current.player;
  const time = gameRef.current.time;

  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex items-center justify-between w-full mb-2">
        <button onClick={onBack} className="text-sm text-mute-blue hover:text-light-gray font-ui transition">← 돌아가기</button>
      </div>

      {/* Canvas is ALWAYS mounted */}
      <div className="relative w-full">
        {/* HUD */}
        {p && phase !== 'select' && (
          <div className="flex items-center justify-between mb-1 text-xs lg:text-sm font-ui">
            <div className="flex gap-2">
              <span className="text-red-400">{'❤️'.repeat(Math.max(0, p.hp))}{'🖤'.repeat(Math.max(0, p.maxHp - p.hp))}</span>
              <span className="text-gold">Lv.{p.level}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-light-gray">{p.score}점</span>
              <span className="text-cyan-blue">{Math.floor(time / 60)}:{String(time % 60).padStart(2, '0')}</span>
            </div>
          </div>
        )}
        {p && phase !== 'select' && (
          <div className="w-full h-1.5 bg-deep-navy rounded-full overflow-hidden mb-1">
            <div className="h-full bg-cyan-blue rounded-full" style={{ width: `${(p.exp / p.expToNext) * 100}%` }} />
          </div>
        )}

        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="rounded-xl border border-mute-blue/20 touch-none w-full bg-deep-navy"
          style={{ aspectRatio: '800/600', maxHeight: 'calc(100vh - 180px)' }}
          onTouchStart={(e) => { touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }}
          onTouchMove={(e) => {
            e.preventDefault();
            if (!touchStart.current) return;
            const dx = e.touches[0].clientX - touchStart.current.x;
            const dy = e.touches[0].clientY - touchStart.current.y;
            const m = Math.sqrt(dx * dx + dy * dy);
            gameRef.current.touchDir = m > 10 ? { x: dx / m, y: dy / m } : { x: 0, y: 0 };
          }}
          onTouchEnd={() => { touchStart.current = null; gameRef.current.touchDir = { x: 0, y: 0 }; }}
        />

        {/* Select overlay */}
        {phase === 'select' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-deep-navy/95 rounded-xl z-10">
            <h2 className="text-xl lg:text-3xl font-title text-gold mb-2">영웅 소환</h2>
            <p className="text-sm text-mute-blue font-ui mb-6">캐릭터를 선택하세요!</p>
            <div className="grid grid-cols-3 gap-3 px-4 w-full max-w-md">
              {Object.values(CHARACTERS).map((c) => (
                <button key={c.id} onClick={() => startGame(c.id)}
                  className="flex flex-col items-center p-3 lg:p-4 rounded-xl border-2 bg-dark-indigo/60 hover:bg-dark-indigo transition"
                  style={{ borderColor: c.color + '40' }}>
                  <span className="text-3xl lg:text-4xl mb-1">{c.emoji}</span>
                  <p className="text-xs lg:text-sm font-title" style={{ color: c.color }}>{c.name}</p>
                  <p className="text-[9px] text-mute-blue mt-1">HP {c.baseHp} · 속도 {c.baseSpeed}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Ready overlay */}
        {phase === 'ready' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-deep-navy/80 rounded-xl z-10">
            <p className="text-lg lg:text-2xl font-title text-gold mb-2">{selectedChar && CHARACTERS[selectedChar].emoji} {selectedChar && CHARACTERS[selectedChar].name}</p>
            <p className="text-xs text-mute-blue font-ui mb-6">3분간 생존하세요!</p>
            <button onClick={beginPlaying}
              className="px-10 py-4 rounded-2xl bg-gradient-to-r from-cyan-blue to-electric-purple text-white text-xl font-title hover:brightness-110 active:scale-95 transition">
              게임 시작!
            </button>
          </div>
        )}

        {/* Levelup overlay */}
        {phase === 'levelup' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-deep-navy/85 rounded-xl z-10 p-4">
            <p className="text-xl font-title text-gold mb-1">레벨 업!</p>
            <p className="text-sm text-mute-blue font-ui mb-4">Lv.{p?.level} — 하나를 선택하세요</p>
            <div className="space-y-2 w-full max-w-xs">
              {levelUpChoices.map((c) => (
                <button key={c.id} onClick={() => handleLevelUp(c)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-dark-indigo/80 border border-mute-blue/20 hover:border-gold/50 transition text-left">
                  <span className="text-2xl">{c.emoji}</span>
                  <div>
                    <p className="text-sm font-title text-light-gray">{c.name}</p>
                    <p className="text-xs text-mute-blue font-ui">{c.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Game over / clear overlay */}
        {(phase === 'over' || phase === 'clear') && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-deep-navy/90 rounded-xl z-10 p-4">
            <p className="text-2xl font-title mb-2" style={{ color: phase === 'clear' ? '#ffd700' : '#ef4444' }}>
              {phase === 'clear' ? '3분 생존 성공!' : '게임 오버'}
            </p>
            <div className="text-sm font-ui text-light-gray space-y-1 my-4">
              <p>점수: <span className="text-gold">{p?.score || 0}</span></p>
              <p>처치: {p?.kills || 0} · 수집: {p?.collected || 0} · Lv.{p?.level || 1}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { gameRef.current = createGameState(); setPhase('select'); setSelectedChar(null); }}
                className="px-5 py-2 rounded-lg bg-cyan-blue text-deep-navy font-title text-sm hover:brightness-110 transition">다시 하기</button>
              <button onClick={onBack}
                className="px-5 py-2 rounded-lg bg-dark-indigo border border-mute-blue/30 text-mute-blue font-ui text-sm">나가기</button>
            </div>
          </div>
        )}
      </div>

      {/* Skill + D-Pad */}
      {(phase === 'playing' || phase === 'boss') && selectedChar && p && (
        <div className="mt-2">
          <div className="flex justify-center mb-2">
            <button
              onClick={() => { if (p.skillCooldown <= 0) { p.skillActive = true; p.skillTimer = 3; p.skillCooldown = 15; if (gameRef.current.charDef.id === 'dasom') { p.invincible = true; p.invincibleTimer = 3; } } }}
              disabled={p.skillCooldown > 0}
              className="px-4 py-2 rounded-lg font-ui text-sm text-white transition disabled:opacity-30"
              style={{ background: CHARACTERS[selectedChar].color }}>
              {p.skillCooldown > 0 ? `${Math.ceil(p.skillCooldown)}초` : `⚡ ${CHARACTERS[selectedChar].skill}`}
            </button>
          </div>
          <div className="flex justify-center lg:hidden">
            <div className="grid grid-cols-3 gap-1 w-32">
              <div />
              <button onTouchStart={() => { gameRef.current.touchDir = { x: 0, y: -1 }; }} onTouchEnd={() => { gameRef.current.touchDir = { x: 0, y: 0 }; }} className="w-10 h-10 rounded-lg bg-dark-indigo/80 border border-mute-blue/30 flex items-center justify-center text-lg active:bg-mute-blue/20">↑</button>
              <div />
              <button onTouchStart={() => { gameRef.current.touchDir = { x: -1, y: 0 }; }} onTouchEnd={() => { gameRef.current.touchDir = { x: 0, y: 0 }; }} className="w-10 h-10 rounded-lg bg-dark-indigo/80 border border-mute-blue/30 flex items-center justify-center text-lg active:bg-mute-blue/20">←</button>
              <button onTouchStart={() => { gameRef.current.touchDir = { x: 0, y: 1 }; }} onTouchEnd={() => { gameRef.current.touchDir = { x: 0, y: 0 }; }} className="w-10 h-10 rounded-lg bg-dark-indigo/80 border border-mute-blue/30 flex items-center justify-center text-lg active:bg-mute-blue/20">↓</button>
              <button onTouchStart={() => { gameRef.current.touchDir = { x: 1, y: 0 }; }} onTouchEnd={() => { gameRef.current.touchDir = { x: 0, y: 0 }; }} className="w-10 h-10 rounded-lg bg-dark-indigo/80 border border-mute-blue/30 flex items-center justify-center text-lg active:bg-mute-blue/20">→</button>
            </div>
          </div>
          <p className="text-[10px] text-mute-blue text-center mt-1 font-ui hidden lg:block">WASD/방향키 · 스킬: 스페이스바</p>
        </div>
      )}
    </div>
  );
}
