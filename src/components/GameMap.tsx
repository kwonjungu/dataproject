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
  onLockedClick: () => void;
  onMissionDialogue: (level: number) => void;
}

export default function GameMap({
  studentId,
  studentName,
  badges,
  onBadgeClaimed,
  onLockedClick,
  onMissionDialogue,
}: GameMapProps) {
  const [selectedStage, setSelectedStage] = useState<number | null>(null);

  const unlockedLevels = new Set(badges.map((b) => b.level));
  const badgeCount = unlockedLevels.size;

  // Mission locking: M1 always open, M2 needs Lv1, M3 needs Lv2
  const isMissionAccessible = (level: number) => {
    if (level === 1) return true;
    if (level === 2) return unlockedLevels.has(1);
    if (level === 3) return unlockedLevels.has(2);
    return false;
  };

  const getRank = () => {
    if (badgeCount === 3) return { title: '간식왕국 수호자', color: '#ffd700' };
    if (badgeCount === 2) return { title: '데이터 전사', color: '#c850ff' };
    if (badgeCount === 1) return { title: '신입 수호대원', color: '#00c9ff' };
    return { title: '수호대 훈련병', color: '#8890b5' };
  };
  const rank = getRank();

  const handleNodeClick = (level: number) => {
    if (!isMissionAccessible(level)) {
      onLockedClick();
      return;
    }
    setSelectedStage(level);
    // Trigger mission NPC dialogue if not already completed
    if (!unlockedLevels.has(level)) {
      onMissionDialogue(level);
    }
  };

  return (
    <div className="flex flex-col items-center py-6 sm:py-8 px-4 min-h-screen pb-28">
      {/* Player status bar */}
      <motion.div
        className="w-full max-w-sm lg:max-w-md bg-dark-indigo/80 border border-mute-blue/20 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-deep-navy border-2 border-gold/40 flex items-center justify-center text-xl sm:text-2xl shrink-0">
            🛡️
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-light-gray font-title text-sm truncate">{studentName}</p>
            <p className="text-xs font-ui" style={{ color: rank.color }}>{rank.title}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-mute-blue">배지</p>
            <p className="text-lg font-title text-gold">{badgeCount}/3</p>
          </div>
        </div>
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
        className="text-center mb-6 sm:mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-title text-gold mb-1">
          간식왕국 작전 지도
        </h1>
        <p className="text-xs sm:text-sm text-mute-blue font-ui">
          미션을 수행하고 왕국을 구하세요!
        </p>
      </motion.div>

      {/* Map nodes */}
      <div className="flex flex-col lg:flex-row items-center lg:justify-center lg:gap-0 flex-1">
        {stages.map((stage, index) => (
          <div key={stage.level} className="flex flex-col lg:flex-row items-center">
            <StageNode
              stage={stage}
              isUnlocked={unlockedLevels.has(stage.level)}
              isAccessible={isMissionAccessible(stage.level)}
              index={index}
              onClick={() => handleNodeClick(stage.level)}
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
        className="mt-6 sm:mt-8 flex gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        {stages.map((stage) => {
          const done = unlockedLevels.has(stage.level);
          const accessible = isMissionAccessible(stage.level);
          return (
            <div key={stage.level} className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-xs sm:text-sm border-2 transition-all ${
                  done
                    ? 'border-gold bg-gold/20 text-gold'
                    : accessible
                    ? 'border-mute-blue/40 bg-mute-blue/10 text-mute-blue'
                    : 'border-mute-blue/20 bg-mute-blue/5 text-mute-blue/30'
                }`}
              >
                {done ? '★' : accessible ? '!' : '🔒'}
              </div>
              <span className="text-[10px] text-mute-blue">M{stage.level}</span>
            </div>
          );
        })}
      </motion.div>

      {/* Stage modal */}
      {selectedStage && isMissionAccessible(selectedStage) && (
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
