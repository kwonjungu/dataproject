'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CHARACTERS, CharacterId, PlayerState, Enemy, Projectile, Item, Particle,
  GAME_DURATION, MAP_SIZE, LEVEL_UP_CHOICES, EVOLUTION_THRESHOLDS,
} from '@/data/dungeonGame';
import { snackItems, shuffle } from '@/data/snacks';

interface DungeonGameProps {
  onBack: () => void;
}

type GamePhase = 'select' | 'playing' | 'levelup' | 'boss' | 'over' | 'clear';

let enemyId = 0;
let itemId = 0;

export default function DungeonGame({ onBack }: DungeonGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ w: 640, h: 480 });
  const [phase, setPhase] = useState<GamePhase>('select');
  const [selectedChar, setSelectedChar] = useState<CharacterId | null>(null);
  const [player, setPlayer] = useState<PlayerState | null>(null);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [levelUpChoices, setLevelUpChoices] = useState<typeof LEVEL_UP_CHOICES>([]);
  const [finalScore, setFinalScore] = useState(0);
  const [bossHp, setBossHp] = useState(0);
  const [bossMaxHp, setBossMaxHp] = useState(0);

  // Game state refs (mutable for game loop)
  const gameRef = useRef({
    player: null as PlayerState | null,
    enemies: [] as Enemy[],
    projectiles: [] as Projectile[],
    items: [] as Item[],
    particles: [] as Particle[],
    keys: new Set<string>(),
    touchDir: { x: 0, y: 0 },
    camera: { x: 0, y: 0 },
    lastAttack: 0,
    lastSpawn: 0,
    lastItemSpawn: 0,
    running: false,
    time: GAME_DURATION,
    charDef: CHARACTERS.ohbaksa,
    bossSpawned: false,
    villainImg: null as HTMLImageElement | null,
  });

  // Start game with selected character
  const startGame = useCallback((charId: CharacterId) => {
    const def = CHARACTERS[charId];
    const p: PlayerState = {
      x: MAP_SIZE / 2, y: MAP_SIZE / 2,
      hp: def.baseHp, maxHp: def.baseHp,
      speed: def.baseSpeed, damage: def.baseDamage,
      attackRate: def.attackRate, attackRange: def.attackRange,
      level: 1, exp: 0, expToNext: 30, score: 0, kills: 0, collected: 0,
      projectileCount: 1, invincible: false, invincibleTimer: 0,
      skillActive: false, skillTimer: 0, skillCooldown: 0,
      evolutionStage: 0,
    };
    setPlayer(p);
    setSelectedChar(charId);
    setTimeLeft(GAME_DURATION);
    gameRef.current = {
      ...gameRef.current,
      player: p, enemies: [], projectiles: [], items: [], particles: [],
      keys: new Set(), touchDir: { x: 0, y: 0 },
      lastAttack: 0, lastSpawn: 0, lastItemSpawn: 0,
      running: true, time: GAME_DURATION, charDef: def, bossSpawned: false,
    };

    // Load villain image
    const img = new Image();
    img.src = '/images/villain.png';
    gameRef.current.villainImg = img;

    setPhase('playing');
  }, []);

  // Canvas resize
  useEffect(() => {
    const resize = () => {
      const el = containerRef.current;
      if (!el) return;
      const w = Math.min(el.clientWidth, window.innerWidth - 16);
      const h = Math.min(window.innerHeight - 160, w * 0.75);
      setCanvasSize({ w: Math.floor(w), h: Math.floor(Math.max(h, 300)) });
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [phase]);

  // Input handlers
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      gameRef.current.keys.add(e.key.toLowerCase());
      if (e.key === ' ') { e.preventDefault(); activateSkill(); }
    };
    const onKeyUp = (e: KeyboardEvent) => gameRef.current.keys.delete(e.key.toLowerCase());
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => { window.removeEventListener('keydown', onKeyDown); window.removeEventListener('keyup', onKeyUp); };
  }, []);

  // Timer
  useEffect(() => {
    if (phase !== 'playing' && phase !== 'boss') return;
    const t = setInterval(() => {
      gameRef.current.time -= 1;
      setTimeLeft(gameRef.current.time);
      if (gameRef.current.time <= 0) {
        gameRef.current.running = false;
        setPhase('clear');
        setFinalScore(gameRef.current.player?.score || 0);
      }
    }, 1000);
    return () => clearInterval(t);
  }, [phase]);

  // Main game loop
  useEffect(() => {
    if (phase !== 'playing' && phase !== 'boss') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    gameRef.current.running = true;
    let animId: number;

    const loop = () => {
      if (!gameRef.current.running) return;
      const g = gameRef.current;
      const p = g.player;
      if (!p) return;

      const W = canvas.width;
      const H = canvas.height;

      // --- UPDATE ---
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

      // Camera
      g.camera.x = p.x - W / 2;
      g.camera.y = p.y - H / 2;

      // Timers
      if (p.invincible) { p.invincibleTimer -= 1/60; if (p.invincibleTimer <= 0) p.invincible = false; }
      if (p.skillActive) { p.skillTimer -= 1/60; if (p.skillTimer <= 0) p.skillActive = false; }
      if (p.skillCooldown > 0) p.skillCooldown -= 1/60;

      // Evolution
      for (let i = EVOLUTION_THRESHOLDS.length - 1; i >= 0; i--) {
        if (p.level >= EVOLUTION_THRESHOLDS[i]) { p.evolutionStage = i; break; }
      }

      // Auto attack
      const now = performance.now();
      if (now - g.lastAttack > 1000 / p.attackRate) {
        g.lastAttack = now;
        // Find nearest enemy
        let nearest: Enemy | null = null;
        let minDist = p.attackRange;
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
              x: p.x, y: p.y,
              vx: Math.cos(a) * 6, vy: Math.sin(a) * 6,
              damage: p.damage, radius: 4, life: 60,
              type: g.charDef.attackType,
              color: g.charDef.color,
            });
          }
        }
      }

      // Spawn enemies
      if (now - g.lastSpawn > (g.time > 60 ? 1200 : g.time > 30 ? 700 : 400)) {
        g.lastSpawn = now;
        const angle = Math.random() * Math.PI * 2;
        const dist = 400 + Math.random() * 200;
        const ex = p.x + Math.cos(angle) * dist;
        const ey = p.y + Math.sin(angle) * dist;
        const types: Enemy['type'][] = g.time > 120 ? ['normal'] : g.time > 60 ? ['normal', 'normal', 'speed'] : ['normal', 'speed', 'tank'];
        const type = types[Math.floor(Math.random() * types.length)];
        const e: Enemy = type === 'speed'
          ? { id: enemyId++, x: ex, y: ey, hp: 10, maxHp: 10, speed: 2.5, radius: 12, type, color: '#ef4444', damage: 1 }
          : type === 'tank'
          ? { id: enemyId++, x: ex, y: ey, hp: 40, maxHp: 40, speed: 0.8, radius: 22, type, color: '#92400e', damage: 1 }
          : { id: enemyId++, x: ex, y: ey, hp: 15, maxHp: 15, speed: 1.2, radius: 14, type, color: '#a855f7', damage: 1 };
        g.enemies.push(e);
      }

      // Boss at 60s left
      if (g.time <= 60 && !g.bossSpawned) {
        g.bossSpawned = true;
        const boss: Enemy = {
          id: enemyId++, x: p.x + 500, y: p.y, hp: 300, maxHp: 300,
          speed: 0.6, radius: 40, type: 'boss', color: '#7c3aed', damage: 2,
        };
        g.enemies.push(boss);
        setBossHp(300);
        setBossMaxHp(300);
        setPhase('boss');
      }

      // Spawn items
      if (now - g.lastItemSpawn > 2000) {
        g.lastItemSpawn = now;
        const snack = shuffle(snackItems)[0];
        const rare = Math.random() < 0.1;
        g.items.push({
          id: itemId++,
          x: p.x + (Math.random() - 0.5) * 600,
          y: p.y + (Math.random() - 0.5) * 600,
          emoji: rare ? '⭐' : snack.emoji,
          name: rare ? '골든 간식' : snack.name,
          healthy: rare ? true : snack.healthy,
          type: rare ? 'rare' : 'normal',
          radius: 15,
        });
      }

      // Update projectiles
      g.projectiles = g.projectiles.filter((proj) => {
        proj.x += proj.vx;
        proj.y += proj.vy;
        proj.life -= 1;
        // Hit enemies
        for (let i = g.enemies.length - 1; i >= 0; i--) {
          const e = g.enemies[i];
          if (Math.hypot(proj.x - e.x, proj.y - e.y) < e.radius + proj.radius) {
            e.hp -= proj.damage;
            // Particles
            for (let k = 0; k < 4; k++) {
              g.particles.push({
                x: proj.x, y: proj.y,
                vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4,
                life: 20, maxLife: 20, color: proj.color, radius: 3,
              });
            }
            if (e.hp <= 0) {
              p.score += e.type === 'boss' ? 100 : e.type === 'tank' ? 20 : 10;
              p.kills += 1;
              p.exp += e.type === 'boss' ? 50 : e.type === 'tank' ? 15 : 8;
              // Death particles
              for (let k = 0; k < 10; k++) {
                g.particles.push({
                  x: e.x, y: e.y,
                  vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 0.5) * 6,
                  life: 30, maxLife: 30, color: e.color, radius: 4,
                });
              }
              if (e.type === 'boss') setBossHp(0);
              g.enemies.splice(i, 1);
            } else if (e.type === 'boss') {
              setBossHp(e.hp);
            }
            return false;
          }
        }
        return proj.life > 0;
      });

      // Update enemies (move toward player)
      for (const e of g.enemies) {
        const a = Math.atan2(p.y - e.y, p.x - e.x);
        e.x += Math.cos(a) * e.speed;
        e.y += Math.sin(a) * e.speed;
        // Hit player
        if (!p.invincible && Math.hypot(e.x - p.x, e.y - p.y) < e.radius + 16) {
          if (p.skillActive && g.charDef.id === 'dasom') continue; // shield
          p.hp -= e.damage;
          p.invincible = true;
          p.invincibleTimer = 1;
          if (p.hp <= 0) {
            gameRef.current.running = false;
            setFinalScore(p.score);
            setPhase('over');
            return;
          }
        }
      }

      // Collect items
      g.items = g.items.filter((item) => {
        if (Math.hypot(item.x - p.x, item.y - p.y) < item.radius + 16) {
          if (item.healthy) {
            p.exp += item.type === 'rare' ? 25 : 8;
            p.score += item.type === 'rare' ? 30 : 10;
            p.collected += 1;
            for (let k = 0; k < 6; k++) {
              g.particles.push({
                x: item.x, y: item.y,
                vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4,
                life: 20, maxLife: 20, color: '#22c55e', radius: 3,
              });
            }
          } else {
            p.score -= 5;
            p.speed *= 0.7;
            setTimeout(() => { if (g.player) g.player.speed = CHARACTERS[selectedChar!].baseSpeed * (1 + (p.level - 1) * 0.05); }, 2000);
            for (let k = 0; k < 4; k++) {
              g.particles.push({
                x: item.x, y: item.y,
                vx: (Math.random() - 0.5) * 3, vy: (Math.random() - 0.5) * 3,
                life: 15, maxLife: 15, color: '#ef4444', radius: 3,
              });
            }
          }
          return false;
        }
        return true;
      });

      // Level up check
      if (p.exp >= p.expToNext) {
        p.exp -= p.expToNext;
        p.level += 1;
        p.expToNext = Math.floor(p.expToNext * 1.4);
        gameRef.current.running = false;
        const choices = shuffle(LEVEL_UP_CHOICES).slice(0, 3);
        setLevelUpChoices(choices);
        setPlayer({ ...p });
        setPhase('levelup');
        return;
      }

      // Update particles
      g.particles = g.particles.filter((pt) => {
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life -= 1;
        return pt.life > 0;
      });

      setPlayer({ ...p });

      // --- DRAW ---
      ctx.fillStyle = '#0a0e27';
      ctx.fillRect(0, 0, W, H);

      // Grid
      ctx.strokeStyle = '#111640';
      ctx.lineWidth = 1;
      const gridSize = 60;
      const startX = -(g.camera.x % gridSize);
      const startY = -(g.camera.y % gridSize);
      for (let x = startX; x < W; x += gridSize) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = startY; y < H; y += gridSize) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

      const cx = g.camera.x;
      const cy = g.camera.y;

      // Items
      for (const item of g.items) {
        const sx = item.x - cx;
        const sy = item.y - cy;
        if (sx < -50 || sx > W + 50 || sy < -50 || sy > H + 50) continue;
        ctx.font = item.type === 'rare' ? '28px serif' : '22px serif';
        ctx.textAlign = 'center';
        ctx.fillText(item.emoji, sx, sy + 7);
      }

      // Enemies
      for (const e of g.enemies) {
        const sx = e.x - cx;
        const sy = e.y - cy;
        if (sx < -60 || sx > W + 60 || sy < -60 || sy > H + 60) continue;

        if (e.type === 'boss' && g.villainImg?.complete) {
          ctx.drawImage(g.villainImg, sx - 40, sy - 40, 80, 80);
        } else {
          ctx.beginPath();
          ctx.arc(sx, sy, e.radius, 0, Math.PI * 2);
          ctx.fillStyle = e.color;
          ctx.fill();
          // Eyes (among-us style)
          ctx.fillStyle = '#fff';
          ctx.beginPath();
          ctx.ellipse(sx - e.radius * 0.2, sy - e.radius * 0.15, e.radius * 0.35, e.radius * 0.25, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#111';
          ctx.beginPath();
          ctx.arc(sx - e.radius * 0.1, sy - e.radius * 0.1, e.radius * 0.12, 0, Math.PI * 2);
          ctx.fill();
        }
        // HP bar
        if (e.hp < e.maxHp) {
          ctx.fillStyle = '#333';
          ctx.fillRect(sx - e.radius, sy - e.radius - 8, e.radius * 2, 4);
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(sx - e.radius, sy - e.radius - 8, e.radius * 2 * (e.hp / e.maxHp), 4);
        }
      }

      // Projectiles
      for (const proj of g.projectiles) {
        const sx = proj.x - cx;
        const sy = proj.y - cy;
        ctx.beginPath();
        ctx.arc(sx, sy, proj.radius, 0, Math.PI * 2);
        ctx.fillStyle = proj.color;
        ctx.fill();
        ctx.shadowColor = proj.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Player
      const px = p.x - cx;
      const py = p.y - cy;
      const charDef = g.charDef;

      // Glow for high evolution
      if (p.evolutionStage >= 3) {
        ctx.beginPath();
        ctx.arc(px, py, 30, 0, Math.PI * 2);
        const grd = ctx.createRadialGradient(px, py, 0, px, py, 30);
        grd.addColorStop(0, charDef.color + '40');
        grd.addColorStop(1, 'transparent');
        ctx.fillStyle = grd;
        ctx.fill();
      }

      // Body (among-us bean shape)
      const pColor = p.evolutionStage >= 4 ? '#ffd700' : p.evolutionStage >= 1 ? charDef.color : '#888';
      ctx.beginPath();
      ctx.ellipse(px, py, 16, 20, 0, 0, Math.PI * 2);
      ctx.fillStyle = pColor;
      ctx.fill();
      ctx.strokeStyle = '#fff3';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Visor
      ctx.fillStyle = '#b3e5fc';
      ctx.beginPath();
      ctx.ellipse(px + 6, py - 5, 8, 6, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(px + 8, py - 6, 2, 0, Math.PI * 2);
      ctx.fill();

      // Hat (evolution 2+)
      if (p.evolutionStage >= 2) {
        ctx.fillStyle = charDef.color;
        ctx.beginPath();
        ctx.moveTo(px - 10, py - 18);
        ctx.lineTo(px + 10, py - 18);
        ctx.lineTo(px + 6, py - 28);
        ctx.lineTo(px - 6, py - 28);
        ctx.closePath();
        ctx.fill();
      }

      // Crown (evolution 4+)
      if (p.evolutionStage >= 4) {
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.moveTo(px - 10, py - 28);
        ctx.lineTo(px - 12, py - 38);
        ctx.lineTo(px - 4, py - 32);
        ctx.lineTo(px, py - 40);
        ctx.lineTo(px + 4, py - 32);
        ctx.lineTo(px + 12, py - 38);
        ctx.lineTo(px + 10, py - 28);
        ctx.closePath();
        ctx.fill();
      }

      // Invincible flash
      if (p.invincible && Math.floor(Date.now() / 100) % 2 === 0) {
        ctx.beginPath();
        ctx.arc(px, py, 24, 0, Math.PI * 2);
        ctx.strokeStyle = '#fff8';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Particles
      for (const pt of g.particles) {
        const sx = pt.x - cx;
        const sy = pt.y - cy;
        ctx.globalAlpha = pt.life / pt.maxLife;
        ctx.beginPath();
        ctx.arc(sx, sy, pt.radius * (pt.life / pt.maxLife), 0, Math.PI * 2);
        ctx.fillStyle = pt.color;
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => { gameRef.current.running = false; cancelAnimationFrame(animId); };
  }, [phase, selectedChar]);

  // Touch joystick handler
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const tx = touch.clientX - rect.left - cx;
    const ty = touch.clientY - rect.top - cy;
    const mag = Math.sqrt(tx * tx + ty * ty);
    if (mag > 20) {
      gameRef.current.touchDir = { x: tx / mag, y: ty / mag };
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    gameRef.current.touchDir = { x: 0, y: 0 };
  }, []);

  // Skill activation
  const activateSkill = useCallback(() => {
    const p = gameRef.current.player;
    if (!p || p.skillCooldown > 0) return;
    p.skillActive = true;
    p.skillTimer = 3;
    p.skillCooldown = 15;
    if (gameRef.current.charDef.id === 'dasom') { p.invincible = true; p.invincibleTimer = 3; }
  }, []);

  // Level up selection
  const handleLevelUp = useCallback((choice: typeof LEVEL_UP_CHOICES[0]) => {
    const p = gameRef.current.player;
    if (!p) return;
    const updated = choice.apply(p);
    Object.assign(p, updated);
    setPlayer({ ...p });
    gameRef.current.running = true;
    setPhase(gameRef.current.bossSpawned ? 'boss' : 'playing');
  }, []);

  const getStars = () => {
    if (finalScore >= 300) return 3;
    if (finalScore >= 150) return 2;
    return 1;
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex items-center justify-between w-full mb-2">
        <button onClick={onBack} className="text-sm text-mute-blue hover:text-light-gray font-ui transition">← 돌아가기</button>
      </div>

      <AnimatePresence mode="wait">
        {/* Character Select */}
        {phase === 'select' && (
          <motion.div key="select" className="text-center w-full max-w-2xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 className="text-xl lg:text-3xl font-title text-gold mb-2">영웅 소환</h2>
            <p className="text-sm text-mute-blue font-ui mb-6">캐릭터를 선택하세요!</p>
            <div className="grid grid-cols-3 gap-3 lg:gap-4">
              {Object.values(CHARACTERS).map((c) => (
                <motion.button
                  key={c.id}
                  className="flex flex-col items-center p-4 lg:p-6 rounded-2xl border-2 bg-dark-indigo/60 hover:bg-dark-indigo/80 transition-all"
                  style={{ borderColor: c.color + '40' }}
                  onClick={() => startGame(c.id)}
                  whileHover={{ scale: 1.05, borderColor: c.color }}
                >
                  <span className="text-4xl lg:text-5xl mb-2">{c.emoji}</span>
                  <p className="text-sm lg:text-base font-title" style={{ color: c.color }}>{c.name}</p>
                  <div className="mt-2 text-[10px] lg:text-xs text-mute-blue font-ui space-y-0.5">
                    <p>HP {c.baseHp} · 속도 {c.baseSpeed}</p>
                    <p>공격: {c.attackType === 'laser' ? '레이저' : c.attackType === 'bomb' ? '폭탄' : '펀치'}</p>
                    <p className="mt-1" style={{ color: c.color }}>{c.skill}</p>
                  </div>
                </motion.button>
              ))}
            </div>
            <p className="text-xs text-mute-blue mt-4 font-ui">이동: WASD 또는 방향키 · 공격: 자동 · 스킬: 스페이스바</p>
          </motion.div>
        )}

        {/* Game Canvas */}
        {(phase === 'playing' || phase === 'boss') && player && (
          <motion.div key="game" ref={containerRef} className="relative w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* HUD */}
            <div className="flex items-center justify-between mb-2 text-xs lg:text-sm font-ui">
              <div className="flex gap-3">
                <span className="text-red-400">{'❤️'.repeat(player.hp)}{'🖤'.repeat(player.maxHp - player.hp)}</span>
                <span className="text-gold">Lv.{player.level}</span>
              </div>
              <div className="flex gap-3">
                <span className="text-light-gray">{player.score}점</span>
                <span className="text-cyan-blue">{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</span>
              </div>
            </div>

            {/* EXP bar */}
            <div className="w-full h-1.5 bg-deep-navy rounded-full overflow-hidden mb-2">
              <div className="h-full bg-cyan-blue rounded-full transition-all" style={{ width: `${(player.exp / player.expToNext) * 100}%` }} />
            </div>

            {/* Boss HP */}
            {phase === 'boss' && bossMaxHp > 0 && bossHp > 0 && (
              <div className="mb-2">
                <p className="text-xs text-red-400 font-title text-center mb-0.5">⚠️ 정크킹</p>
                <div className="w-full h-2 bg-deep-navy rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full transition-all" style={{ width: `${(bossHp / bossMaxHp) * 100}%` }} />
                </div>
              </div>
            )}

            <canvas
              ref={canvasRef}
              width={canvasSize.w}
              height={canvasSize.h}
              className="rounded-xl border border-mute-blue/20 touch-none"
              style={{ width: canvasSize.w, height: canvasSize.h, maxWidth: '100%' }}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            />

            {/* Skill button */}
            <div className="flex justify-center mt-3 gap-3">
              <button
                onClick={activateSkill}
                disabled={player.skillCooldown > 0}
                className="px-4 py-2 rounded-lg font-ui text-sm text-white transition disabled:opacity-30"
                style={{ background: selectedChar ? CHARACTERS[selectedChar].color : '#888' }}
              >
                {player.skillCooldown > 0 ? `${Math.ceil(player.skillCooldown)}초` : `⚡ ${CHARACTERS[selectedChar!].skill}`}
              </button>
            </div>
            <p className="text-[10px] text-mute-blue text-center mt-1 font-ui">이동: WASD/방향키 · 스킬: 스페이스바/위 버튼</p>
          </motion.div>
        )}

        {/* Level Up */}
        {phase === 'levelup' && player && (
          <motion.div key="levelup" className="text-center w-full max-w-lg" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <p className="text-2xl font-title text-gold mb-1">레벨 업!</p>
            <p className="text-sm text-mute-blue font-ui mb-4">Lv.{player.level} — 하나를 선택하세요</p>
            <div className="space-y-2">
              {levelUpChoices.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleLevelUp(c)}
                  className="w-full flex items-center gap-3 p-4 rounded-xl bg-dark-indigo/80 border border-mute-blue/20 hover:border-gold/50 transition text-left"
                >
                  <span className="text-3xl">{c.emoji}</span>
                  <div>
                    <p className="text-sm font-title text-light-gray">{c.name}</p>
                    <p className="text-xs text-mute-blue font-ui">{c.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Game Over / Clear */}
        {(phase === 'over' || phase === 'clear') && (
          <motion.div key="result" className="text-center w-full max-w-sm" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="bg-dark-indigo/90 border border-gold/30 rounded-2xl p-6">
              <p className="text-2xl mb-2">{'⭐'.repeat(getStars())}{'☆'.repeat(3 - getStars())}</p>
              <p className="text-2xl font-title mb-1" style={{ color: phase === 'clear' ? '#ffd700' : '#ef4444' }}>
                {phase === 'clear' ? '3분 생존 성공!' : '게임 오버'}
              </p>
              <div className="text-sm font-ui text-light-gray space-y-1 my-4">
                <p>점수: <span className="text-gold">{finalScore}</span></p>
                <p>처치: {player?.kills || 0} · 수집: {player?.collected || 0}</p>
                <p>레벨: Lv.{player?.level || 1}</p>
              </div>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => { setPhase('select'); setPlayer(null); }}
                  className="px-5 py-2 rounded-lg bg-cyan-blue text-deep-navy font-title text-sm hover:brightness-110 transition"
                >
                  다시 하기
                </button>
                <button
                  onClick={onBack}
                  className="px-5 py-2 rounded-lg bg-dark-indigo border border-mute-blue/30 text-mute-blue font-ui text-sm hover:text-light-gray transition"
                >
                  나가기
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
