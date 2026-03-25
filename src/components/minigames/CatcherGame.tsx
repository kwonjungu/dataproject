'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { snackItems, shuffle } from '@/data/snacks';

interface FallingItem {
  id: number;
  emoji: string;
  name: string;
  healthy: boolean;
  x: number;
  y: number;
  speed: number;
}

interface CatcherGameProps {
  onBack: () => void;
}

const GAME_DURATION = 30;
const SPAWN_INTERVAL = 800;

export default function CatcherGame({ onBack }: CatcherGameProps) {
  const [items, setItems] = useState<FallingItem[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'over'>('ready');
  const [combo, setCombo] = useState(0);
  const [showFeedback, setShowFeedback] = useState<{ text: string; color: string; x: number } | null>(null);
  const nextId = useRef(0);
  const areaRef = useRef<HTMLDivElement>(null);

  const startGame = () => {
    setScore(0);
    setLives(3);
    setTimeLeft(GAME_DURATION);
    setItems([]);
    setCombo(0);
    setGameState('playing');
  };

  // Timer
  useEffect(() => {
    if (gameState !== 'playing') return;
    const t = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameState('over');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [gameState]);

  // Spawn items
  useEffect(() => {
    if (gameState !== 'playing') return;
    const t = setInterval(() => {
      const snack = shuffle(snackItems)[0];
      const newItem: FallingItem = {
        id: nextId.current++,
        emoji: snack.emoji,
        name: snack.name,
        healthy: snack.healthy,
        x: 5 + Math.random() * 85,
        y: -10,
        speed: 1.5 + Math.random() * 2,
      };
      setItems((prev) => [...prev, newItem]);
    }, SPAWN_INTERVAL);
    return () => clearInterval(t);
  }, [gameState]);

  // Animate falling
  useEffect(() => {
    if (gameState !== 'playing') return;
    const frame = setInterval(() => {
      setItems((prev) => {
        const next = prev
          .map((item) => ({ ...item, y: item.y + item.speed }))
          .filter((item) => item.y < 110);
        return next;
      });
    }, 50);
    return () => clearInterval(frame);
  }, [gameState]);

  // Check lives
  useEffect(() => {
    if (lives <= 0 && gameState === 'playing') {
      setGameState('over');
    }
  }, [lives, gameState]);

  const handleCatch = useCallback((item: FallingItem, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setItems((prev) => prev.filter((i) => i.id !== item.id));

    if (item.healthy) {
      const bonus = combo >= 3 ? 2 : 1;
      setScore((s) => s + (10 * bonus));
      setCombo((c) => c + 1);
      setShowFeedback({ text: bonus > 1 ? `+${10 * bonus} 콤보!` : '+10', color: '#22c55e', x: item.x });
    } else {
      setLives((l) => l - 1);
      setCombo(0);
      setShowFeedback({ text: '정크! -❤️', color: '#ef4444', x: item.x });
    }

    setTimeout(() => setShowFeedback(null), 600);
  }, [combo]);

  const getStars = () => {
    if (score >= 150) return 3;
    if (score >= 80) return 2;
    return 1;
  };

  return (
    <div className="flex flex-col items-center">
      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-lg mb-3">
        <button onClick={onBack} className="text-sm text-mute-blue hover:text-light-gray font-ui transition">← 돌아가기</button>
        {gameState === 'playing' && (
          <div className="flex gap-3 text-sm font-ui">
            <span className="text-gold">{score}점</span>
            <span className="text-red-400">{'❤️'.repeat(lives)}</span>
            <span className="text-cyan-blue">{timeLeft}초</span>
            {combo >= 3 && <span className="text-fire-orange">🔥x{combo}</span>}
          </div>
        )}
      </div>

      {/* Game area */}
      <div
        ref={areaRef}
        className="relative w-full max-w-lg aspect-[3/4] bg-dark-indigo/50 rounded-2xl border border-mute-blue/20 overflow-hidden"
      >
        {gameState === 'ready' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-4xl mb-4">🥕🍟</p>
            <h3 className="text-xl lg:text-2xl font-title text-gold mb-2">건강 간식 고르기</h3>
            <p className="text-sm font-ui text-light-gray mb-1">건강한 간식을 클릭하세요!</p>
            <p className="text-xs font-ui text-red-400 mb-4">정크푸드를 고르면 하트가 줄어요!</p>
            <button
              onClick={startGame}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-blue to-electric-purple text-white font-title text-lg hover:brightness-110 transition"
            >
              시작!
            </button>
          </div>
        )}

        {gameState === 'playing' && (
          <>
            {items.map((item) => (
              <motion.button
                key={item.id}
                className="absolute text-3xl sm:text-4xl lg:text-5xl cursor-pointer hover:scale-110 active:scale-90 transition-transform"
                style={{ left: `${item.x}%`, top: `${item.y}%`, transform: 'translate(-50%, -50%)' }}
                onClick={(e) => handleCatch(item, e)}
                onTouchStart={(e) => handleCatch(item, e)}
              >
                {item.emoji}
              </motion.button>
            ))}

            {/* Feedback popup */}
            {showFeedback && (
              <motion.p
                className="absolute text-lg font-title pointer-events-none"
                style={{ left: `${showFeedback.x}%`, top: '40%', color: showFeedback.color }}
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.6 }}
              >
                {showFeedback.text}
              </motion.p>
            )}

            {/* Legend */}
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-4 text-[10px] font-ui text-mute-blue">
              <span>🥕 건강 = +10점</span>
              <span>🍟 정크 = -❤️</span>
            </div>
          </>
        )}

        {gameState === 'over' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-deep-navy/80">
            <p className="text-2xl mb-2">{'⭐'.repeat(getStars())}{'☆'.repeat(3 - getStars())}</p>
            <p className="text-2xl font-title text-gold mb-1">게임 종료!</p>
            <p className="text-lg font-ui text-light-gray">{score}점</p>
            <button
              onClick={startGame}
              className="mt-4 px-6 py-2 rounded-lg bg-cyan-blue text-deep-navy font-title text-sm hover:brightness-110 transition"
            >
              다시 하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
