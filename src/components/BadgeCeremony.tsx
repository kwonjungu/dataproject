'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { stages } from '@/data/stages';
import { playSound } from '@/lib/sounds';
import ConfettiEffect from './Confetti';

interface BadgeCeremonyProps {
  level: number;
  studentName: string;
  onComplete: () => void;
}

export default function BadgeCeremony({ level, studentName, onComplete }: BadgeCeremonyProps) {
  const stage = stages.find((s) => s.level === level)!;

  useEffect(() => {
    playSound('fanfare');
    const timer = setTimeout(onComplete, 8000);
    return () => clearTimeout(timer);
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
        className="text-8xl mb-6"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: [0, 1.3, 1], rotate: [-180, 20, 0] }}
        transition={{ duration: 1, ease: 'easeOut' }}
      >
        {stage.emoji}
      </motion.div>

      {/* Glow ring */}
      <motion.div
        className="absolute w-40 h-40 rounded-full"
        style={{
          border: `3px solid ${stage.color}`,
          boxShadow: `0 0 40px ${stage.color}60, inset 0 0 40px ${stage.color}20`,
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.5, 1.2], opacity: [0, 1, 0.6] }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      />

      {/* Text */}
      <motion.div
        className="text-center mt-8 z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <h2
          className="text-3xl font-title mb-3"
          style={{ color: stage.color }}
        >
          배지 획득!
        </h2>
        <p className="text-xl font-ui text-light-gray mb-2">
          {studentName} 학생,
        </p>
        <p className="text-lg font-ui" style={{ color: stage.color }}>
          Lv{stage.level}. {stage.title} 배지를 획득했습니다!
        </p>
      </motion.div>

      {/* Click hint */}
      <motion.p
        className="absolute bottom-10 text-mute-blue text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        화면을 클릭하면 돌아갑니다
      </motion.p>
    </motion.div>
  );
}
