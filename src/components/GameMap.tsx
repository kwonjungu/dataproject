'use client';

import { useState } from 'react';
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

  return (
    <div className="flex flex-col items-center py-10 px-4">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-title text-gold mb-2">
          데이터로 레벨업!
        </h1>
        <p className="text-mute-blue font-ui">
          {studentName} 학생의 배지 여정
        </p>
      </div>

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

      {/* Badge progress */}
      <div className="mt-10 flex gap-4">
        {stages.map((stage) => (
          <div
            key={stage.level}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm border-2 transition-all ${
              unlockedLevels.has(stage.level)
                ? 'border-gold bg-gold/20 text-gold'
                : 'border-mute-blue/30 bg-mute-blue/10 text-mute-blue/50'
            }`}
          >
            {unlockedLevels.has(stage.level) ? '★' : stage.level}
          </div>
        ))}
      </div>

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
