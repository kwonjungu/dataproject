'use client';

import { motion } from 'framer-motion';
import { StageData } from '@/types';
import { playSound } from '@/lib/sounds';

interface StageNodeProps {
  stage: StageData;
  isUnlocked: boolean;
  index: number;
  onClick: () => void;
}

export default function StageNode({ stage, isUnlocked, index, onClick }: StageNodeProps) {
  const handleClick = () => {
    playSound('click');
    onClick();
  };

  return (
    <motion.div
      className="flex flex-col items-center cursor-pointer group"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.3, duration: 0.6 }}
      onClick={handleClick}
    >
      {/* Mission tag */}
      <motion.span
        className="text-[10px] font-bold tracking-widest mb-2 px-2 py-0.5 rounded"
        style={{
          background: isUnlocked ? stage.color + '25' : '#333355' + '40',
          color: isUnlocked ? stage.color : '#555577',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: index * 0.3 + 0.2 }}
      >
        {stage.missionTag}
      </motion.span>

      {/* Node circle */}
      <motion.div
        className={`relative w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 ${
          isUnlocked ? 'node-glow-hover' : 'node-locked'
        }`}
        style={{
          '--glow-color': stage.color,
          background: isUnlocked
            ? `radial-gradient(circle, ${stage.color}30 0%, ${stage.color}10 70%)`
            : 'radial-gradient(circle, #1a1a3a 0%, #0d0d2a 70%)',
          border: `3px solid ${isUnlocked ? stage.color : '#333355'}`,
        } as React.CSSProperties}
        whileHover={{ scale: isUnlocked ? 1.1 : 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Badge emoji */}
        <span className={`text-4xl ${isUnlocked ? '' : 'opacity-40'}`}>
          {stage.emoji}
        </span>

        {/* Lock overlay */}
        {!isUnlocked && (
          <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/30">
            <span className="text-2xl">🔒</span>
          </div>
        )}

        {/* Glow ring animation for unlocked */}
        {isUnlocked && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              border: `2px solid ${stage.color}`,
              '--glow-color': stage.color,
            } as React.CSSProperties}
            animate={{
              boxShadow: [
                `0 0 10px ${stage.color}40`,
                `0 0 25px ${stage.color}60`,
                `0 0 10px ${stage.color}40`,
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}

        {/* Complete check */}
        {isUnlocked && (
          <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-green-500 border-2 border-deep-navy flex items-center justify-center text-white text-xs font-bold">
            ✓
          </div>
        )}
      </motion.div>

      {/* Level label */}
      <motion.div
        className="mt-2 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: index * 0.3 + 0.3 }}
      >
        <p
          className="text-xs font-title"
          style={{ color: isUnlocked ? stage.color : '#555577' }}
        >
          Lv{stage.level}. {stage.title}
        </p>
        <p
          className="text-[11px] font-ui mt-0.5 max-w-[160px]"
          style={{ color: isUnlocked ? '#e8eaf6' : '#555577' }}
        >
          {stage.missionTitle}
        </p>
      </motion.div>
    </motion.div>
  );
}
