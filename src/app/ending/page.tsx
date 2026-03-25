'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Starfield from '@/components/Starfield';
import ConfettiEffect from '@/components/Confetti';
import { npcs } from '@/data/npcs';

const endingScript = [
  { text: '간식왕국에 평화가 찾아왔다!', size: 'big', color: '#ffd700', delay: 0 },
  { text: '정크 바이러스가 완전히 물리쳐졌어!', size: 'medium', color: '#ff6b35', delay: 2 },
  { text: '', size: 'spacer', color: '', delay: 3.5 },
];

const npcCelebrations = [
  { npcId: 'ohbaksa' as const, message: '허허, 해냈구먼! 자네 덕분에 왕국이 다시 건강해졌다네! 🎉', delay: 4 },
  { npcId: 'dasom' as const, message: '와! 진짜 대박! 우리가 해냈어!! 최고야! 🎊', delay: 6 },
  { npcId: 'jjanggu' as const, message: '으하하!! 역시!! 데이터 마스터는 다르다고!! 🏆🔥', delay: 8 },
];

const credits = [
  '🏆 간식왕국 구출 대작전 🏆',
  '',
  '프로그램: 데이터로 레벨업!',
  '건강을 지키는 간식 생활',
  '',
  '🔬 오박사 — 데이터 연구소장',
  '🎨 다솜 박사 — 크리에이티브 랩',
  '🏋️ 짱구 원장 — 실전 훈련소',
  '',
  '그리고 가장 중요한...',
];

export default function EndingPage() {
  const [studentName, setStudentName] = useState('');
  const [phase, setPhase] = useState<'story' | 'npcs' | 'credits' | 'final'>('story');
  const [showConfetti, setShowConfetti] = useState(false);
  const [visibleNpcs, setVisibleNpcs] = useState<number[]>([]);
  const router = useRouter();

  useEffect(() => {
    const name = localStorage.getItem('studentName') || '수호대원';
    setStudentName(name);

    // Phase transitions
    const t1 = setTimeout(() => setPhase('npcs'), 3500);
    const t2 = setTimeout(() => setVisibleNpcs([0]), 4000);
    const t3 = setTimeout(() => setVisibleNpcs([0, 1]), 6000);
    const t4 = setTimeout(() => setVisibleNpcs([0, 1, 2]), 8000);
    const t5 = setTimeout(() => {
      setShowConfetti(true);
      setPhase('credits');
    }, 10000);
    const t6 = setTimeout(() => setPhase('final'), 16000);

    return () => {
      [t1, t2, t3, t4, t5, t6].forEach(clearTimeout);
    };
  }, []);

  return (
    <main className="min-h-screen relative overflow-hidden bg-deep-navy">
      <Starfield />
      {showConfetti && <ConfettiEffect />}

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
        <AnimatePresence mode="wait">
          {/* Phase 1: Story text */}
          {phase === 'story' && (
            <motion.div
              key="story"
              className="text-center"
              exit={{ opacity: 0 }}
            >
              {endingScript.map((line, i) => (
                <motion.p
                  key={i}
                  className={`font-title ${
                    line.size === 'big' ? 'text-3xl sm:text-4xl lg:text-6xl' :
                    line.size === 'medium' ? 'text-xl sm:text-2xl lg:text-4xl' :
                    'h-6'
                  }`}
                  style={{ color: line.color }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: line.delay, duration: 0.8 }}
                >
                  {line.text}
                </motion.p>
              ))}

              {/* Villain defeated animation */}
              <motion.div
                className="mt-8"
                initial={{ opacity: 0, scale: 2, rotate: 0 }}
                animate={{ opacity: [0, 1, 1, 0], scale: [2, 1, 1, 0], rotate: [0, 0, 0, 180] }}
                transition={{ delay: 1.5, duration: 2 }}
              >
                <span className="text-6xl lg:text-8xl">👾</span>
              </motion.div>
              <motion.p
                className="text-lg lg:text-xl font-ui text-red-400 mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 1, 0] }}
                transition={{ delay: 2, duration: 1.5 }}
              >
                정크 바이러스 퇴치 완료!
              </motion.p>
            </motion.div>
          )}

          {/* Phase 2: NPC celebrations */}
          {phase === 'npcs' && (
            <motion.div
              key="npcs"
              className="w-full max-w-2xl lg:max-w-3xl space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.h2
                className="text-center text-2xl lg:text-4xl font-title text-gold mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                모두가 축하해줘요!
              </motion.h2>

              {npcCelebrations.map((item, i) => {
                const npc = npcs[item.npcId];
                return visibleNpcs.includes(i) ? (
                  <motion.div
                    key={item.npcId}
                    className="flex items-center gap-4 bg-dark-indigo/80 border rounded-2xl p-4 lg:p-6"
                    style={{ borderColor: npc.borderColor + '40' }}
                    initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div
                      className="w-16 h-16 lg:w-20 lg:h-20 rounded-full flex items-center justify-center text-3xl lg:text-4xl shrink-0"
                      style={{
                        border: `3px solid ${npc.borderColor}`,
                        background: `${npc.borderColor}15`,
                        boxShadow: `0 0 20px ${npc.borderColor}30`,
                      }}
                    >
                      {npc.fallbackEmoji}
                    </div>
                    <div>
                      <p className="text-sm lg:text-base font-bold font-ui" style={{ color: npc.borderColor }}>
                        {npc.name}
                      </p>
                      <p className="text-base lg:text-xl font-ui text-light-gray mt-1">
                        {item.message.replace('{name}', studentName)}
                      </p>
                    </div>
                  </motion.div>
                ) : null;
              })}
            </motion.div>
          )}

          {/* Phase 3: Credits */}
          {phase === 'credits' && (
            <motion.div
              key="credits"
              className="text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {credits.map((line, i) => (
                <motion.p
                  key={i}
                  className={`font-ui ${
                    line === '' ? 'h-4' :
                    i === 0 ? 'text-2xl lg:text-4xl font-title text-gold mb-4' :
                    line.startsWith('🔬') || line.startsWith('🎨') || line.startsWith('🏋️')
                      ? 'text-base lg:text-xl text-light-gray'
                      : line === '그리고 가장 중요한...'
                      ? 'text-lg lg:text-2xl text-gold mt-4'
                      : 'text-sm lg:text-lg text-mute-blue'
                  }`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.3, duration: 0.5 }}
                >
                  {line}
                </motion.p>
              ))}

              {/* Player name highlight */}
              <motion.div
                className="mt-6"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: credits.length * 0.3 + 0.5, duration: 0.6 }}
              >
                <p className="text-3xl lg:text-5xl font-title text-gold">
                  ⭐ {studentName} 수호대원 ⭐
                </p>
                <p className="text-base lg:text-xl font-ui text-cyan-blue mt-2">
                  간식왕국의 영웅!
                </p>
              </motion.div>
            </motion.div>
          )}

          {/* Phase 4: Final */}
          {phase === 'final' && (
            <motion.div
              key="final"
              className="text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="text-6xl lg:text-8xl mb-6">🏆</div>
              <h1 className="text-3xl lg:text-5xl font-title text-gold mb-4">THE END</h1>
              <p className="text-lg lg:text-xl font-ui text-light-gray mb-8">
                {studentName} 수호대원, 정말 수고했어!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => router.push('/gallery')}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-blue to-electric-purple text-white font-title text-lg hover:brightness-110 active:scale-95 transition-all"
                >
                  배지 보관함
                </button>
                <button
                  onClick={() => router.push('/map')}
                  className="px-8 py-3 rounded-xl bg-dark-indigo border border-mute-blue/30 text-light-gray font-title text-lg hover:border-gold/50 transition-all"
                >
                  작전 지도로
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
