'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { snackItems, shuffle } from '@/data/snacks';

interface Card {
  id: number;
  emoji: string;
  name: string;
  pairId: number;
  flipped: boolean;
  matched: boolean;
}

interface MemoryGameProps {
  onBack: () => void;
}

export default function MemoryGame({ onBack }: MemoryGameProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matchedCount, setMatchedCount] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const totalPairs = 8;

  const initGame = useCallback(() => {
    const picked = shuffle(snackItems).slice(0, totalPairs);
    const pairs: Card[] = [];
    picked.forEach((s, i) => {
      pairs.push({ id: i * 2, emoji: s.emoji, name: s.name, pairId: i, flipped: false, matched: false });
      pairs.push({ id: i * 2 + 1, emoji: s.emoji, name: s.name, pairId: i, flipped: false, matched: false });
    });
    setCards(shuffle(pairs));
    setSelected([]);
    setMoves(0);
    setMatchedCount(0);
    setGameOver(false);
    setStartTime(Date.now());
    setElapsed(0);
  }, []);

  useEffect(() => { initGame(); }, [initGame]);

  // Timer
  useEffect(() => {
    if (gameOver || !startTime) return;
    const interval = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 100);
    return () => clearInterval(interval);
  }, [startTime, gameOver]);

  const handleClick = (id: number) => {
    if (selected.length >= 2) return;
    const card = cards.find((c) => c.id === id);
    if (!card || card.flipped || card.matched) return;

    const newCards = cards.map((c) => c.id === id ? { ...c, flipped: true } : c);
    setCards(newCards);
    const newSelected = [...selected, id];
    setSelected(newSelected);

    if (newSelected.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = newSelected.map((sid) => newCards.find((c) => c.id === sid)!);
      if (a.pairId === b.pairId) {
        setTimeout(() => {
          setCards((prev) => prev.map((c) => c.pairId === a.pairId ? { ...c, matched: true } : c));
          setMatchedCount((m) => {
            const next = m + 1;
            if (next === totalPairs) setGameOver(true);
            return next;
          });
          setSelected([]);
        }, 500);
      } else {
        setTimeout(() => {
          setCards((prev) => prev.map((c) =>
            newSelected.includes(c.id) ? { ...c, flipped: false } : c
          ));
          setSelected([]);
        }, 800);
      }
    }
  };

  const getStars = () => {
    if (moves <= totalPairs + 2) return 3;
    if (moves <= totalPairs + 6) return 2;
    return 1;
  };

  return (
    <div className="flex flex-col items-center">
      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-lg mb-4">
        <button onClick={onBack} className="text-sm text-mute-blue hover:text-light-gray font-ui transition">← 돌아가기</button>
        <div className="flex gap-4 text-sm font-ui">
          <span className="text-mute-blue">시도: <span className="text-light-gray">{moves}</span></span>
          <span className="text-mute-blue">짝: <span className="text-gold">{matchedCount}/{totalPairs}</span></span>
          <span className="text-mute-blue">시간: <span className="text-cyan-blue">{elapsed}초</span></span>
        </div>
      </div>

      {/* Game grid */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3 w-full max-w-lg">
        {cards.map((card) => (
          <motion.button
            key={card.id}
            className={`aspect-square rounded-xl flex flex-col items-center justify-center text-3xl sm:text-4xl lg:text-5xl transition-all ${
              card.matched
                ? 'bg-green-500/20 border-2 border-green-500/50'
                : card.flipped
                ? 'bg-dark-indigo border-2 border-cyan-blue/50'
                : 'bg-dark-indigo/80 border-2 border-mute-blue/20 hover:border-mute-blue/50'
            }`}
            onClick={() => handleClick(card.id)}
            whileTap={{ scale: 0.95 }}
          >
            {card.flipped || card.matched ? (
              <motion.div
                initial={{ rotateY: 90 }}
                animate={{ rotateY: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center"
              >
                <span>{card.emoji}</span>
                <span className="text-[8px] sm:text-[10px] text-mute-blue mt-0.5">{card.name}</span>
              </motion.div>
            ) : (
              <span className="text-2xl text-mute-blue/40">?</span>
            )}
          </motion.button>
        ))}
      </div>

      {/* Game Over */}
      {gameOver && (
        <motion.div
          className="mt-6 text-center bg-dark-indigo/90 border border-gold/30 rounded-2xl p-6 w-full max-w-sm"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <p className="text-2xl mb-2">{'⭐'.repeat(getStars())}{'☆'.repeat(3 - getStars())}</p>
          <p className="text-xl font-title text-gold mb-1">클리어!</p>
          <p className="text-sm font-ui text-light-gray">{moves}번 시도 · {elapsed}초</p>
          <button
            onClick={initGame}
            className="mt-4 px-6 py-2 rounded-lg bg-cyan-blue text-deep-navy font-title text-sm hover:brightness-110 transition"
          >
            다시 하기
          </button>
        </motion.div>
      )}
    </div>
  );
}
