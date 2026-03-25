'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { stages } from '@/data/stages';
import { playSound } from '@/lib/sounds';
import ConfettiEffect from './Confetti';
import { missionNPC, npcs } from '@/data/npcs';

interface BadgeCeremonyProps {
  level: number;
  studentName: string;
  onComplete: () => void;
}

export default function BadgeCeremony({ level, studentName, onComplete }: BadgeCeremonyProps) {
  const stage = stages.find((s) => s.level === level)!;
  const [showStory, setShowStory] = useState(false);

  const completionText = stage.completionStory.replace('{name}', studentName);

  useEffect(() => {
    playSound('fanfare');
    const storyTimer = setTimeout(() => setShowStory(true), 2500);
    const autoClose = setTimeout(onComplete, 12000);
    return () => {
      clearTimeout(storyTimer);
      clearTimeout(autoClose);
    };
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 cursor-pointer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={onComplete}
    >
      <ConfettiEffect />

      {/* Badge animation */}
      <motion.div
        className="text-6xl sm:text-8xl mb-4"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: [0, 1.3, 1], rotate: [-180, 20, 0] }}
        transition={{ duration: 1, ease: 'easeOut' }}
      >
        {stage.emoji}
      </motion.div>

      {/* Glow ring */}
      <motion.div
        className="absolute w-32 h-32 sm:w-40 sm:h-40 rounded-full"
        style={{
          border: `3px solid ${stage.color}`,
          boxShadow: `0 0 40px ${stage.color}60, inset 0 0 40px ${stage.color}20`,
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.5, 1.2], opacity: [0, 1, 0.6] }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      />

      {/* Title text */}
      <motion.div
        className="text-center mt-6 z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <span
          className="text-xs font-bold tracking-widest px-3 py-1 rounded"
          style={{ background: stage.color + '30', color: stage.color }}
        >
          {stage.missionTag} 클리어!
        </span>
        <h2
          className="text-2xl sm:text-3xl font-title mt-3 mb-2"
          style={{ color: stage.color }}
        >
          배지 획득!
        </h2>
        <p className="text-base sm:text-lg font-ui text-light-gray">
          {studentName} 수호대원
        </p>
        <p className="text-sm sm:text-base font-ui mt-1" style={{ color: stage.color }}>
          Lv{stage.level}. {stage.title} 배지를 획득!
        </p>
        <p className="text-xs text-gold mt-2 font-ui">
          {stage.reward}
        </p>
      </motion.div>

      {/* Story progression with mission NPC */}
      {showStory && (() => {
        const npcId = missionNPC[level];
        const npc = npcs[npcId];
        return (
          <motion.div
            className="z-10 mt-4 sm:mt-6 mx-3 sm:mx-4 max-w-md bg-dark-indigo/90 border border-mute-blue/20 rounded-xl p-3 sm:p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{npc.fallbackEmoji}</span>
              <span className="text-xs font-bold" style={{ color: npc.borderColor }}>{npc.name}</span>
            </div>
            <p className="text-sm text-light-gray font-ui leading-relaxed">
              {completionText}
            </p>
          </motion.div>
        );
      })()}

      {/* Click hint */}
      <motion.p
        className="absolute bottom-8 text-mute-blue text-xs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3 }}
      >
        화면을 클릭하면 작전 지도로 돌아갑니다
      </motion.p>
    </motion.div>
  );
}
