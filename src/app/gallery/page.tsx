'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Starfield from '@/components/Starfield';
import { stages } from '@/data/stages';
import { Badge } from '@/types';
import { missionNPC, npcs } from '@/data/npcs';

export default function GalleryPage() {
  const [studentName, setStudentName] = useState('');
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBadge, setSelectedBadge] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    const id = localStorage.getItem('studentId');
    const name = localStorage.getItem('studentName');
    if (!id || !name) {
      router.push('/');
      return;
    }
    setStudentName(name);

    fetch(`/api/students/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setBadges(data.badges || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  const unlockedLevels = new Set(badges.map((b) => b.level));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-deep-navy">
        <div className="text-mute-blue animate-pulse text-lg font-ui">로딩 중...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen relative overflow-hidden">
      <Starfield />

      {/* Back button */}
      <button
        onClick={() => router.push('/map')}
        className="fixed top-4 left-4 z-40 px-3 py-1.5 rounded-lg bg-dark-indigo border border-mute-blue/30 text-mute-blue text-sm font-ui hover:text-light-gray hover:border-mute-blue transition"
      >
        ← 작전 지도
      </button>

      <div className="relative z-10 flex flex-col items-center py-10 px-4">
        {/* Header */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-title text-gold mb-2">
            {studentName}의 배지 보관함
          </h1>
          <p className="text-sm lg:text-lg text-mute-blue font-ui">
            {unlockedLevels.size === 3
              ? '모든 배지를 모았어! 진정한 데이터 마스터!'
              : `${unlockedLevels.size}/3 배지 획득`}
          </p>
        </motion.div>

        {/* Badge showcase */}
        <div className="flex flex-wrap justify-center gap-8 lg:gap-16 mb-12">
          {stages.map((stage, index) => {
            const earned = unlockedLevels.has(stage.level);
            const npc = npcs[missionNPC[stage.level]];
            const isSelected = selectedBadge === stage.level;

            return (
              <motion.div
                key={stage.level}
                className="flex flex-col items-center cursor-pointer"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 + 0.3 }}
                onClick={() => setSelectedBadge(isSelected ? null : stage.level)}
              >
                {/* Badge orb */}
                <motion.div
                  className={`relative w-28 h-28 sm:w-36 sm:h-36 lg:w-44 lg:h-44 rounded-full flex items-center justify-center ${
                    earned ? '' : 'grayscale opacity-30'
                  }`}
                  style={{
                    background: earned
                      ? `radial-gradient(circle, ${stage.color}40 0%, ${stage.color}15 50%, transparent 70%)`
                      : 'radial-gradient(circle, #222 0%, #111 70%)',
                    border: `4px solid ${earned ? stage.color : '#333'}`,
                    boxShadow: earned
                      ? `0 0 30px ${stage.color}50, 0 0 60px ${stage.color}25, inset 0 0 30px ${stage.color}20`
                      : 'none',
                  }}
                  animate={
                    earned
                      ? {
                          boxShadow: [
                            `0 0 30px ${stage.color}50, 0 0 60px ${stage.color}25`,
                            `0 0 50px ${stage.color}70, 0 0 100px ${stage.color}40`,
                            `0 0 30px ${stage.color}50, 0 0 60px ${stage.color}25`,
                          ],
                        }
                      : {}
                  }
                  transition={{ duration: 2, repeat: Infinity }}
                  whileHover={{ scale: earned ? 1.1 : 1 }}
                >
                  <span className="text-5xl sm:text-6xl lg:text-7xl">
                    {earned ? stage.emoji : '🔒'}
                  </span>

                  {/* Sparkle particles for earned badges */}
                  {earned && (
                    <>
                      {[...Array(6)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-1.5 h-1.5 rounded-full"
                          style={{
                            background: stage.color,
                            top: `${20 + Math.random() * 60}%`,
                            left: `${20 + Math.random() * 60}%`,
                          }}
                          animate={{
                            opacity: [0, 1, 0],
                            scale: [0, 1.5, 0],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            delay: i * 0.3,
                          }}
                        />
                      ))}
                    </>
                  )}
                </motion.div>

                {/* Badge info */}
                <motion.div className="mt-4 text-center">
                  <p
                    className="text-sm sm:text-base lg:text-lg font-title"
                    style={{ color: earned ? stage.color : '#555' }}
                  >
                    Lv{stage.level}. {stage.title}
                  </p>
                  <p className="text-xs lg:text-sm text-mute-blue font-ui mt-1">
                    {earned ? `${npc.fallbackEmoji} ${npc.name} 미션` : '아직 미획득'}
                  </p>
                  {earned && (
                    <p className="text-[10px] lg:text-xs mt-1" style={{ color: stage.color + '99' }}>
                      {badges.find((b) => b.level === stage.level)
                        ? new Date(badges.find((b) => b.level === stage.level)!.awarded_at).toLocaleDateString('ko-KR')
                        : ''}
                    </p>
                  )}
                </motion.div>

                {/* Expanded detail */}
                {isSelected && earned && (
                  <motion.div
                    className="mt-4 max-w-xs rounded-xl border p-4 text-center"
                    style={{
                      background: `linear-gradient(135deg, ${stage.color}15, transparent)`,
                      borderColor: stage.color + '30',
                    }}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                  >
                    <p className="text-xs lg:text-sm text-light-gray font-ui leading-relaxed">
                      {stage.missionTitle}
                    </p>
                    <p className="text-[10px] lg:text-xs text-mute-blue mt-2">
                      보상: {stage.reward}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* All badges earned celebration */}
        {unlockedLevels.size === 3 && (
          <motion.div
            className="text-center mt-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2 }}
          >
            <div className="text-4xl lg:text-6xl mb-4">🏆</div>
            <p className="text-xl lg:text-2xl font-title text-gold mb-2">
              간식왕국 수호자
            </p>
            <p className="text-sm lg:text-base text-light-gray font-ui">
              {studentName} 수호대원, 모든 미션을 완수했습니다!
            </p>
            <button
              onClick={() => router.push('/ending')}
              className="mt-6 px-8 py-3 rounded-xl bg-gradient-to-r from-gold to-fire-orange text-deep-navy font-title text-lg hover:brightness-110 active:scale-95 transition-all"
            >
              엔딩 보기
            </button>
          </motion.div>
        )}
      </div>
    </main>
  );
}
