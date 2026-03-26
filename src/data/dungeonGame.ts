// Game constants and types for the Dungeon Crawler

export type CharacterId = 'ohbaksa' | 'dasom' | 'jjanggu';

export interface CharacterDef {
  id: CharacterId;
  name: string;
  emoji: string;
  color: string;
  baseHp: number;
  baseSpeed: number;
  baseDamage: number;
  attackType: 'laser' | 'bomb' | 'punch';
  attackRange: number;
  attackRate: number; // attacks per second
  skill: string;
  skillDesc: string;
}

export const CHARACTERS: Record<CharacterId, CharacterDef> = {
  ohbaksa: {
    id: 'ohbaksa',
    name: '오박사',
    emoji: '🔬',
    color: '#ffd700',
    baseHp: 5,
    baseSpeed: 2.5,
    baseDamage: 8,
    attackType: 'laser',
    attackRange: 200,
    attackRate: 2,
    skill: '분석 스캔',
    skillDesc: '3초간 모든 간식의 종류 표시',
  },
  dasom: {
    id: 'dasom',
    name: '다솜 박사',
    emoji: '🎨',
    color: '#ff6b35',
    baseHp: 4,
    baseSpeed: 3.5,
    baseDamage: 6,
    attackType: 'bomb',
    attackRange: 120,
    attackRate: 1.5,
    skill: '크리에이티브 실드',
    skillDesc: '3초간 무적',
  },
  jjanggu: {
    id: 'jjanggu',
    name: '짱구 원장',
    emoji: '🏋️',
    color: '#c850ff',
    baseHp: 3,
    baseSpeed: 3,
    baseDamage: 15,
    attackType: 'punch',
    attackRange: 80,
    attackRate: 2.5,
    skill: '열정 돌진',
    skillDesc: '3초간 속도 2배 + 관통',
  },
};

export interface LevelUpChoice {
  id: string;
  emoji: string;
  name: string;
  desc: string;
  apply: (state: PlayerState) => PlayerState;
}

export interface PlayerState {
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  speed: number;
  damage: number;
  attackRate: number;
  attackRange: number;
  level: number;
  exp: number;
  expToNext: number;
  score: number;
  kills: number;
  collected: number;
  projectileCount: number;
  invincible: boolean;
  invincibleTimer: number;
  skillActive: boolean;
  skillTimer: number;
  skillCooldown: number;
  evolutionStage: number; // 0-4
}

export interface Enemy {
  id: number;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  speed: number;
  radius: number;
  type: 'normal' | 'speed' | 'tank' | 'boss';
  color: string;
  damage: number;
}

export interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  radius: number;
  life: number;
  type: 'laser' | 'bomb' | 'punch';
  color: string;
}

export interface Item {
  id: number;
  x: number;
  y: number;
  emoji: string;
  name: string;
  healthy: boolean;
  type: 'normal' | 'rare';
  radius: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  radius: number;
}

export const GAME_DURATION = 180; // 3 minutes
export const MAP_SIZE = 1600;
export const VIEWPORT_PADDING = 40;

export const EVOLUTION_THRESHOLDS = [0, 3, 5, 8, 10];
export const EVOLUTION_COLORS = ['#888', '', '', '', '#ffd700'];

export const LEVEL_UP_CHOICES: LevelUpChoice[] = [
  { id: 'hp', emoji: '🥛', name: '우유 갑옷', desc: 'HP +1', apply: (s) => ({ ...s, maxHp: s.maxHp + 1, hp: s.hp + 1 }) },
  { id: 'speed', emoji: '🍎', name: '사과 속도업', desc: '속도 20% 증가', apply: (s) => ({ ...s, speed: s.speed * 1.2 }) },
  { id: 'damage', emoji: '🥕', name: '당근 파워업', desc: '공격력 25% 증가', apply: (s) => ({ ...s, damage: s.damage * 1.25 }) },
  { id: 'double', emoji: '🔫', name: '더블샷', desc: '투사체 +1', apply: (s) => ({ ...s, projectileCount: Math.min(s.projectileCount + 1, 5) }) },
  { id: 'rate', emoji: '⚡', name: '빠른 공격', desc: '공격 속도 30% 증가', apply: (s) => ({ ...s, attackRate: s.attackRate * 1.3 }) },
  { id: 'range', emoji: '🎯', name: '사거리 증가', desc: '공격 범위 30% 증가', apply: (s) => ({ ...s, attackRange: s.attackRange * 1.3 }) },
  { id: 'heal', emoji: '💚', name: '회복', desc: 'HP 전체 회복', apply: (s) => ({ ...s, hp: s.maxHp }) },
];
