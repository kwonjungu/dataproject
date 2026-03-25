'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { snackItems, shuffle } from '@/data/snacks';

interface TypingGameProps {
  onBack: () => void;
}

const GAME_DURATION = 40;
const WORDS_COUNT = 20;

export default function TypingGame({ onBack }: TypingGameProps) {
  const [words, setWords] = useState<typeof snackItems>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'over'>('ready');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const startGame = useCallback(() => {
    setWords(shuffle(snackItems).slice(0, WORDS_COUNT));
    setCurrentIndex(0);
    setInput('');
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setTimeLeft(GAME_DURATION);
    setGameState('playing');
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

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

  const currentWord = words[currentIndex];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWord || gameState !== 'playing') return;

    if (input.trim() === currentWord.name) {
      const bonus = streak >= 4 ? 3 : streak >= 2 ? 2 : 1;
      setScore((s) => s + (10 * bonus));
      setStreak((s) => {
        const next = s + 1;
        setMaxStreak((m) => Math.max(m, next));
        return next;
      });
      setFeedback('correct');
    } else {
      setStreak(0);
      setFeedback('wrong');
    }

    setTimeout(() => setFeedback(null), 400);
    setInput('');

    if (currentIndex >= words.length - 1) {
      setGameState('over');
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  const getStars = () => {
    if (score >= 150) return 3;
    if (score >= 80) return 2;
    return 1;
  };

  const timerColor = timeLeft <= 5 ? 'text-red-400' : timeLeft <= 10 ? 'text-fire-orange' : 'text-cyan-blue';

  return (
    <div className="flex flex-col items-center">
      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-lg mb-4">
        <button onClick={onBack} className="text-sm text-mute-blue hover:text-light-gray font-ui transition">← 돌아가기</button>
        {gameState === 'playing' && (
          <div className="flex gap-3 text-sm font-ui">
            <span className="text-gold">{score}점</span>
            <span className={timerColor}>{timeLeft}초</span>
            <span className="text-mute-blue">{currentIndex + 1}/{words.length}</span>
            {streak >= 2 && <span className="text-fire-orange">🔥x{streak}</span>}
          </div>
        )}
      </div>

      {/* Game area */}
      <div className="w-full max-w-lg bg-dark-indigo/50 rounded-2xl border border-mute-blue/20 p-6 sm:p-8 min-h-[400px] flex flex-col items-center justify-center">
        {gameState === 'ready' && (
          <div className="text-center">
            <p className="text-4xl mb-4">⌨️</p>
            <h3 className="text-xl lg:text-2xl font-title text-gold mb-2">간식 이름 타자 게임</h3>
            <p className="text-sm font-ui text-light-gray mb-1">화면에 나오는 간식 이름을 빠르게 입력하세요!</p>
            <p className="text-xs font-ui text-mute-blue mb-4">연속 정답이면 콤보 보너스!</p>
            <button
              onClick={startGame}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-blue to-electric-purple text-white font-title text-lg hover:brightness-110 transition"
            >
              시작!
            </button>
          </div>
        )}

        {gameState === 'playing' && currentWord && (
          <div className="text-center w-full">
            {/* Progress bar */}
            <div className="w-full h-2 bg-deep-navy rounded-full overflow-hidden mb-8">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-cyan-blue to-electric-purple"
                animate={{ width: `${((currentIndex) / words.length) * 100}%` }}
              />
            </div>

            {/* Snack display */}
            <motion.div
              key={currentIndex}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="mb-6"
            >
              <span className="text-6xl sm:text-7xl lg:text-8xl block mb-3">{currentWord.emoji}</span>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-title text-light-gray">
                {currentWord.name}
              </p>
              <p className="text-xs text-mute-blue mt-1">
                {currentWord.healthy ? '🥕 건강한 간식' : '🍟 정크 간식'}
              </p>
            </motion.div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="flex gap-2 max-w-xs mx-auto">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="여기에 입력!"
                className={`flex-1 px-4 py-3 rounded-xl bg-deep-navy border-2 text-light-gray text-center text-lg font-ui placeholder:text-mute-blue/50 focus:outline-none transition ${
                  feedback === 'correct' ? 'border-green-400' :
                  feedback === 'wrong' ? 'border-red-400' :
                  'border-mute-blue/30 focus:border-gold'
                }`}
                autoComplete="off"
                autoFocus
              />
              <button
                type="submit"
                className="px-4 py-3 rounded-xl bg-cyan-blue text-deep-navy font-title hover:brightness-110 transition"
              >
                입력
              </button>
            </form>

            {/* Feedback */}
            {feedback === 'correct' && (
              <motion.p
                className="text-green-400 font-ui mt-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                정답! {streak >= 2 ? `🔥 ${streak}콤보!` : ''}
              </motion.p>
            )}
            {feedback === 'wrong' && (
              <motion.p
                className="text-red-400 font-ui mt-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                틀렸어요!
              </motion.p>
            )}
          </div>
        )}

        {gameState === 'over' && (
          <div className="text-center">
            <p className="text-2xl mb-2">{'⭐'.repeat(getStars())}{'☆'.repeat(3 - getStars())}</p>
            <p className="text-2xl font-title text-gold mb-1">게임 종료!</p>
            <p className="text-lg font-ui text-light-gray">{score}점</p>
            <p className="text-sm font-ui text-mute-blue">최대 콤보: {maxStreak}연속</p>
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
