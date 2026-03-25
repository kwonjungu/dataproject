'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { npcs } from '@/data/npcs';
import ConfettiEffect from './Confetti';

interface EndingSequenceProps {
  studentName: string;
  onComplete: () => void;
}

const VILLAIN_IMAGE = '/images/villain.png';

const npcCelebrations = [
  { npcId: 'ohbaksa' as const, message: '허허, 해냈구먼! 자네 덕분에 왕국이 다시 건강해졌다네!' },
  { npcId: 'dasom' as const, message: '와! 진짜 대박! 우리가 해냈어!! 최고야!' },
  { npcId: 'jjanggu' as const, message: '으하하!! 역시!! 데이터 마스터는 다르다고!!' },
];

type Phase = 'villain' | 'npcs' | 'credits' | 'final';

export default function EndingSequence({ studentName, onComplete }: EndingSequenceProps) {
  const [phase, setPhase] = useState<Phase>('villain');
  const [visibleNpcs, setVisibleNpcs] = useState<number[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [villainImgError, setVillainImgError] = useState(false);

  useEffect(() => {
    // Phase 1: Villain defeated (0-4s)
    const t1 = setTimeout(() => setPhase('npcs'), 4500);
    // Phase 2: NPCs appear one by one
    const t2 = setTimeout(() => setVisibleNpcs([0]), 5000);
    const t3 = setTimeout(() => setVisibleNpcs([0, 1]), 7000);
    const t4 = setTimeout(() => setVisibleNpcs([0, 1, 2]), 9000);
    // Phase 3: Credits
    const t5 = setTimeout(() => {
      setShowConfetti(true);
      setPhase('credits');
    }, 11000);
    // Phase 4: Final
    const t6 = setTimeout(() => setPhase('final'), 17000);

    return () => [t1, t2, t3, t4, t5, t6].forEach(clearTimeout);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[90] bg-deep-navy/95 backdrop-blur-sm overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {showConfetti && <ConfettiEffect />}

      <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12">
        <AnimatePresence mode="wait">
          {/* Phase 1: Villain Defeated */}
          {phase === 'villain' && (
            <motion.div
              key="villain"
              className="text-center"
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <motion.h2
                className="text-2xl sm:text-3xl lg:text-5xl font-title text-gold mb-6"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                간식왕국에 평화가 찾아왔다!
              </motion.h2>

              {/* Villain image - spinning and shrinking */}
              <motion.div
                className="relative w-32 h-32 sm:w-40 sm:h-40 lg:w-52 lg:h-52 mx-auto mb-6"
                initial={{ scale: 1.2, opacity: 1, rotate: 0 }}
                animate={{ scale: [1.2, 1, 0.8, 0], opacity: [1, 1, 0.8, 0], rotate: [0, 10, -10, 180] }}
                transition={{ delay: 1, duration: 2.5, ease: 'easeIn' }}
              >
                {!villainImgError ? (
                  <Image
                    src={VILLAIN_IMAGE}
                    alt="정크 바이러스"
                    fill
                    className="object-contain"
                    sizes="208px"
                    onError={() => setVillainImgError(true)}
                  />
                ) : (
                  <span className="text-7xl lg:text-9xl flex items-center justify-center h-full">👾</span>
                )}
              </motion.div>

              <motion.p
                className="text-lg sm:text-xl lg:text-3xl font-title text-red-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 1, 0] }}
                transition={{ delay: 1.5, duration: 2 }}
              >
                정크 바이러스 퇴치 완료!
              </motion.p>

              <motion.p
                className="text-base sm:text-lg lg:text-2xl font-ui text-fire-orange mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5 }}
              >
                정크 바이러스가 완전히 물리쳐졌어!
              </motion.p>
            </motion.div>
          )}

          {/* Phase 2: NPC Celebrations */}
          {phase === 'npcs' && (
            <motion.div
              key="npcs"
              className="w-full max-w-2xl lg:max-w-3xl space-y-4 lg:space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.h2
                className="text-center text-xl sm:text-2xl lg:text-4xl font-title text-gold mb-6 lg:mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                모두가 축하해줘요!
              </motion.h2>

              {npcCelebrations.map((item, i) => {
                const npc = npcs[item.npcId];
                const celebImg = npc.images.celebrate;
                return visibleNpcs.includes(i) ? (
                  <motion.div
                    key={item.npcId}
                    className="flex items-center gap-4 lg:gap-6 bg-dark-indigo/80 border rounded-2xl p-4 lg:p-6"
                    style={{ borderColor: npc.borderColor + '40' }}
                    initial={{ opacity: 0, x: i % 2 === 0 ? -60 : 60 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    <div
                      className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full overflow-hidden relative shrink-0 flex items-center justify-center"
                      style={{
                        border: `3px solid ${npc.borderColor}`,
                        background: `${npc.borderColor}15`,
                        boxShadow: `0 0 20px ${npc.borderColor}30`,
                      }}
                    >
                      {celebImg ? (
                        <Image
                          src={celebImg}
                          alt={npc.name}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      ) : (
                        <span className="text-3xl lg:text-4xl">{npc.fallbackEmoji}</span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm lg:text-lg font-bold font-ui" style={{ color: npc.borderColor }}>
                        {npc.name}
                      </p>
                      <p className="text-base sm:text-lg lg:text-xl font-ui text-light-gray mt-1">
                        &quot;{item.message}&quot;
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
              <motion.p
                className="text-2xl sm:text-3xl lg:text-5xl font-title text-gold mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                간식왕국 구출 대작전
              </motion.p>

              <motion.p
                className="text-sm lg:text-lg text-mute-blue font-ui mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                데이터로 레벨업! — 건강을 지키는 간식 생활
              </motion.p>

              {/* NPC credits with images */}
              <div className="flex justify-center gap-8 lg:gap-12 my-8">
                {(['ohbaksa', 'dasom', 'jjanggu'] as const).map((npcId, i) => {
                  const npc = npcs[npcId];
                  return (
                    <motion.div
                      key={npcId}
                      className="flex flex-col items-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1 + i * 0.4 }}
                    >
                      <div
                        className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full overflow-hidden relative flex items-center justify-center mb-2"
                        style={{
                          border: `3px solid ${npc.borderColor}`,
                          background: `${npc.borderColor}15`,
                        }}
                      >
                        {npc.images.default ? (
                          <Image
                            src={npc.images.default}
                            alt={npc.name}
                            fill
                            className="object-cover"
                            sizes="96px"
                          />
                        ) : (
                          <span className="text-3xl">{npc.fallbackEmoji}</span>
                        )}
                      </div>
                      <p className="text-xs lg:text-sm font-bold" style={{ color: npc.borderColor }}>{npc.name}</p>
                      <p className="text-[10px] lg:text-xs text-mute-blue">{npc.role}</p>
                    </motion.div>
                  );
                })}
              </div>

              <motion.p
                className="text-lg lg:text-2xl text-gold font-ui mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5 }}
              >
                그리고 가장 중요한...
              </motion.p>

              <motion.p
                className="text-3xl sm:text-4xl lg:text-6xl font-title text-gold mt-4"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 3.5, duration: 0.6 }}
              >
                ⭐ {studentName} 수호대원 ⭐
              </motion.p>

              <motion.p
                className="text-base lg:text-xl font-ui text-cyan-blue mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 4 }}
              >
                간식왕국의 영웅!
              </motion.p>
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
              <div className="text-5xl lg:text-7xl mb-6">🏆</div>
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-title text-gold mb-4">THE END</h1>
              <p className="text-base lg:text-xl font-ui text-light-gray mb-10">
                {studentName} 수호대원, 정말 수고했어!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={onComplete}
                  className="px-8 py-3 lg:px-10 lg:py-4 rounded-xl bg-gradient-to-r from-cyan-blue to-electric-purple text-white font-title text-lg lg:text-xl hover:brightness-110 active:scale-95 transition-all"
                >
                  🏆 배지 보관함
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="px-8 py-3 lg:px-10 lg:py-4 rounded-xl bg-dark-indigo border border-mute-blue/30 text-light-gray font-title text-lg lg:text-xl hover:border-gold/50 transition-all"
                >
                  작전 지도로
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
