'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { stages } from '@/data/stages';
import { Badge } from '@/types';
import StageNode from './StageNode';
import StageModal from './StageModal';
import PathLine from './PathLine';

interface GameMapProps {
  studentId: string;
  studentName: string;
  badges: Badge[];
  onBadgeClaimed: (level: number) => void;
}

export default function GameMap({ studentId, studentName, badges, onBadgeClaimed }: GameMapProps) {
  const [selectedStage, setSelectedStage] = useState<number | null>(null);

  const unlockedLevels = new Set(badges.map((b) => b.level));
  const badgeCount = unlockedLevels.size;

  // Determine player rank
  const getRank = () => {
    if (badgeCount === 3) return { title: '간식왕국 수호자', color: '#ffd700' };
    if (badgeCount === 2) return { title: '데이터 전사', color: '#c850ff' };
    if (badgeCount === 1) return { title: '신입 수호대원', color: '#00c9ff' };
    return { title: '수호대 훈련병', color: '#8890b5' };
  };
  const rank = getRank();

  return (
    <div className="flex flex-col items-center py-8 px-4">
      {/* Player status bar */}
      <motion.div
        className="w-full max-w-sm bg-dark-indigo/80 border border-mute-blue/20 rounded-xl p-4 mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-deep-navy border-2 border-gold/40 flex items-center justify-center text-2xl">
            🛡️
          </div>
          <div className="flex-1">
            <p className="text-light-gray font-title text-sm">{studentName}</p>
            <p className="text-xs font-ui" style={{ color: rank.color }}>{rank.title}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-mute-blue">배지</p>
            <p className="text-lg font-title text-gold">{badgeCount}/3</p>
          </div>
        </div>
        {/* XP bar */}
        <div className="mt-2 h-1.5 bg-deep-navy rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-cyan-blue via-fire-orange to-electric-purple"
            initial={{ width: 0 }}
            animate={{ width: `${(badgeCount / 3) * 100}%` }}
            transition={{ delay: 0.5, duration: 0.8 }}
          />
        </div>
      </motion.div>

      {/* Map title */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h1 className="text-2xl font-title text-gold mb-1">
          간식왕국 작전 지도
        </h1>
        <p className="text-xs text-mute-blue font-ui">
          {badgeCount === 3
            ? '모든 미션 완료! 왕국이 평화를 되찾았습니다!'
            : '미션을 수행하고 왕국을 구하세요!'}
        </p>
      </motion.div>

      {/* Map nodes */}
      <div className="flex flex-col items-center">
        {stages.map((stage, index) => (
          <div key={stage.level}>
            <StageNode
              stage={stage}
              isUnlocked={unlockedLevels.has(stage.level)}
              index={index}
              onClick={() => setSelectedStage(stage.level)}
            />
            {index < stages.length - 1 && (
              <PathLine
                color={stage.color}
                isActive={unlockedLevels.has(stage.level)}
                index={index}
              />
            )}
          </div>
        ))}
      </div>

      {/* Mission progress */}
      <motion.div
        className="mt-8 flex gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        {stages.map((stage) => {
          const done = unlockedLevels.has(stage.level);
          return (
            <div key={stage.level} className="flex flex-col items-center gap-1">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm border-2 transition-all ${
                  done
                    ? 'border-gold bg-gold/20 text-gold'
                    : 'border-mute-blue/20 bg-mute-blue/5 text-mute-blue/40'
                }`}
              >
                {done ? '★' : '?'}
              </div>
              <span className="text-[10px] text-mute-blue">M{stage.level}</span>
            </div>
          );
        })}
      </motion.div>

      {/* Stage modal */}
      {selectedStage && (
        <StageModal
          stage={stages.find((s) => s.level === selectedStage)!}
          isOpen={!!selectedStage}
          onClose={() => setSelectedStage(null)}
          isUnlocked={unlockedLevels.has(selectedStage)}
          studentId={studentId}
          onBadgeClaimed={onBadgeClaimed}
        />
      )}
    </div>
  );
}
