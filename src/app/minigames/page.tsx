'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Starfield from '@/components/Starfield';
import MemoryGame from '@/components/minigames/MemoryGame';
import CatcherGame from '@/components/minigames/CatcherGame';
import TypingGame from '@/components/minigames/TypingGame';
import DungeonGame from '@/components/minigames/DungeonGame';

type GameId = 'menu' | 'memory' | 'catcher' | 'typing' | 'dungeon';

const games = [
  {
    id: 'dungeon' as GameId,
    emoji: '⚔️',
    title: '간식왕국 던전',
    desc: '바이러스를 물리치고 생존하라!',
    color: '#ffd700',
    featured: true,
  },
  {
    id: 'memory' as GameId,
    emoji: '🃏',
    title: '간식 카드 뒤집기',
    desc: '같은 간식 짝을 찾아라!',
    color: '#00c9ff',
  },
  {
    id: 'catcher' as GameId,
    emoji: '🥕',
    title: '건강 간식 고르기',
    desc: '건강한 간식만 골라 클릭!',
    color: '#ff6b35',
  },
  {
    id: 'typing' as GameId,
    emoji: '⌨️',
    title: '간식 이름 타자',
    desc: '간식 이름을 빠르게 입력!',
    color: '#c850ff',
  },
];

export default function MinigamesPage() {
  const [activeGame, setActiveGame] = useState<GameId>('menu');
  const router = useRouter();

  return (
    <main className="min-h-screen relative overflow-hidden bg-deep-navy">
      {activeGame === 'menu' && <Starfield />}

      {/* Back to map */}
      <button
        onClick={() => router.push('/map')}
        className="fixed top-4 left-4 z-40 px-3 py-1.5 rounded-lg bg-dark-indigo border border-mute-blue/30 text-mute-blue text-sm font-ui hover:text-light-gray hover:border-mute-blue transition"
      >
        ← 작전 지도
      </button>

      <div className="relative z-10 flex flex-col items-center py-8 sm:py-12 px-4 min-h-screen">
        <AnimatePresence mode="wait">
          {activeGame === 'menu' ? (
            <motion.div
              key="menu"
              className="flex flex-col items-center w-full max-w-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: -30 }}
            >
              <h1 className="text-2xl sm:text-3xl lg:text-5xl font-title text-gold mb-2">
                미니게임
              </h1>
              <p className="text-sm lg:text-lg text-mute-blue font-ui mb-8 lg:mb-12">
                간식 지식을 게임으로 키워보자!
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 w-full">
                {games.map((game, i) => (
                  <motion.button
                    key={game.id}
                    className="flex flex-col items-center p-6 lg:p-8 rounded-2xl border-2 bg-dark-indigo/60 hover:bg-dark-indigo/80 transition-all group"
                    style={{ borderColor: game.color + '30' }}
                    onClick={() => setActiveGame(game.id)}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.15 }}
                    whileHover={{ scale: 1.03, borderColor: game.color }}
                  >
                    <span className="text-4xl lg:text-5xl mb-3 group-hover:scale-110 transition-transform">
                      {game.emoji}
                    </span>
                    <p className="text-base lg:text-lg font-title" style={{ color: game.color }}>
                      {game.title}
                    </p>
                    <p className="text-xs lg:text-sm text-mute-blue font-ui mt-1">
                      {game.desc}
                    </p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={activeGame}
              className="w-full max-w-2xl"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
            >
              {activeGame === 'dungeon' && <DungeonGame onBack={() => setActiveGame('menu')} />}
              {activeGame === 'memory' && <MemoryGame onBack={() => setActiveGame('menu')} />}
              {activeGame === 'catcher' && <CatcherGame onBack={() => setActiveGame('menu')} />}
              {activeGame === 'typing' && <TypingGame onBack={() => setActiveGame('menu')} />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
