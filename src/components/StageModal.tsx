'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StageData } from '@/types';
import { playSound } from '@/lib/sounds';
import { missionNPC, npcs } from '@/data/npcs';

interface StageModalProps {
  stage: StageData;
  isOpen: boolean;
  onClose: () => void;
  isUnlocked: boolean;
  studentId: string;
  onBadgeClaimed: (level: number) => void;
}

type ModalPhase = 'briefing' | 'quiz' | 'authkey';

export default function StageModal({
  stage,
  isOpen,
  onClose,
  isUnlocked,
  studentId,
  onBadgeClaimed,
}: StageModalProps) {
  const [phase, setPhase] = useState<ModalPhase>('briefing');
  const [currentQuiz, setCurrentQuiz] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizResult, setQuizResult] = useState<'correct' | 'wrong' | null>(null);
  const [quizzesPassed, setQuizzesPassed] = useState(false);
  const [authKey, setAuthKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const quiz = stage.quizzes[currentQuiz];

  const handleAnswer = (index: number) => {
    if (quizResult) return;
    setSelectedAnswer(index);

    if (index === quiz.correctIndex) {
      setQuizResult('correct');
      playSound('success');

      setTimeout(() => {
        if (currentQuiz < stage.quizzes.length - 1) {
          setCurrentQuiz((q) => q + 1);
          setSelectedAnswer(null);
          setQuizResult(null);
        } else {
          setQuizzesPassed(true);
          setPhase('authkey');
        }
      }, 1200);
    } else {
      setQuizResult('wrong');
      setTimeout(() => {
        setSelectedAnswer(null);
        setQuizResult(null);
      }, 1500);
    }
  };

  const handleClaim = async () => {
    if (!authKey.trim()) {
      setError('인증키를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/badges/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, level: stage.level, key: authKey }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || '배지 획득에 실패했습니다.');
        setLoading(false);
        return;
      }

      playSound('success');
      onBadgeClaimed(stage.level);
      handleClose();
    } catch {
      setError('서버 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPhase('briefing');
    setCurrentQuiz(0);
    setSelectedAnswer(null);
    setQuizResult(null);
    setQuizzesPassed(false);
    setAuthKey('');
    setError('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={handleClose}
          />

          <motion.div
            className="relative w-full max-w-[calc(100vw-1.5rem)] sm:max-w-lg rounded-2xl border p-4 sm:p-6 z-10 max-h-[90vh] sm:max-h-[85vh] overflow-y-auto"
            style={{
              background: 'linear-gradient(135deg, #111640 0%, #0a0e27 100%)',
              borderColor: stage.color + '40',
              boxShadow: `0 0 30px ${stage.color}20`,
            }}
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-2 right-2 sm:top-3 sm:right-3 text-mute-blue hover:text-light-gray transition text-xl z-10 w-8 h-8 flex items-center justify-center"
            >
              ✕
            </button>

            {/* Mission Tag */}
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <span
                className="text-[9px] sm:text-[10px] font-bold tracking-widest px-2 py-0.5 rounded"
                style={{ background: stage.color + '30', color: stage.color }}
              >
                {stage.missionTag}
              </span>
              <div className="flex-1 h-px" style={{ background: stage.color + '30' }} />
            </div>

            {/* Header */}
            <div className="text-center mb-3 sm:mb-4">
              <div className="text-3xl sm:text-4xl mb-1 sm:mb-2">{stage.emoji}</div>
              <h2
                className="text-base sm:text-xl font-title"
                style={{ color: stage.color }}
              >
                {stage.missionTitle}
              </h2>
              <p className="text-mute-blue text-[10px] sm:text-xs mt-1">
                {stage.phase} · {stage.sessions}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {/* PHASE 1: Mission Briefing */}
              {phase === 'briefing' && (
                <motion.div
                  key="briefing"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  {(() => {
                    const npcId = missionNPC[stage.level];
                    const npc = npcs[npcId];
                    return (
                      <div className="bg-deep-navy/80 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4 border border-mute-blue/10">
                        <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                          <span className="text-base sm:text-lg">{npc.fallbackEmoji}</span>
                          <div>
                            <p className="text-[10px] sm:text-xs font-bold" style={{ color: npc.borderColor }}>{npc.name}</p>
                            <p className="text-[9px] sm:text-[10px] text-mute-blue">{npc.role}</p>
                          </div>
                        </div>
                        <p className="text-xs sm:text-sm text-light-gray font-ui leading-relaxed">
                          &quot;{stage.npcs[0]?.message}&quot;
                        </p>
                      </div>
                    );
                  })()}

                  <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                    <div className="rounded-lg p-2.5 sm:p-3 border border-mute-blue/10 bg-deep-navy/50">
                      <p className="text-[9px] sm:text-[10px] text-mute-blue font-bold tracking-wider mb-1">작전 설명</p>
                      <p className="text-light-gray leading-relaxed">{stage.missionBriefing}</p>
                    </div>

                    <div className="rounded-lg p-2.5 sm:p-3 border border-mute-blue/10 bg-deep-navy/50">
                      <p className="text-[9px] sm:text-[10px] text-mute-blue font-bold tracking-wider mb-1">미션 목표</p>
                      <p className="text-light-gray">{stage.missionObjective}</p>
                    </div>

                    <div className="rounded-lg p-2.5 sm:p-3 border border-mute-blue/10 bg-deep-navy/50">
                      <p className="text-[9px] sm:text-[10px] text-mute-blue font-bold tracking-wider mb-1.5 sm:mb-2">활동 내용</p>
                      <ul className="space-y-1">
                        {stage.activities.map((act, i) => (
                          <li key={i} className="text-light-gray flex gap-2 text-[11px] sm:text-xs">
                            <span style={{ color: stage.color }}>{'>'}</span>
                            {act}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div
                      className="rounded-lg p-2.5 sm:p-3 text-center italic text-xs sm:text-sm"
                      style={{ background: stage.color + '10', color: stage.color }}
                    >
                      보상: {stage.reward}
                    </div>
                  </div>

                  {!isUnlocked && (
                    <button
                      onClick={() => setPhase('quiz')}
                      className="w-full mt-4 sm:mt-5 py-2.5 sm:py-3 rounded-xl text-white font-title text-sm sm:text-base hover:brightness-110 active:scale-95 transition-all"
                      style={{ background: `linear-gradient(135deg, ${stage.color}, ${stage.color}aa)` }}
                    >
                      미션 도전!
                    </button>
                  )}

                  {isUnlocked && (
                    <div className="mt-4 sm:mt-5 text-center">
                      <span
                        className="inline-block rounded-full px-4 py-2 text-xs sm:text-sm font-bold"
                        style={{ background: stage.color + '20', color: stage.color }}
                      >
                        미션 클리어!
                      </span>
                    </div>
                  )}
                </motion.div>
              )}

              {/* PHASE 2: Quiz */}
              {phase === 'quiz' && (
                <motion.div
                  key="quiz"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <div className="flex items-center gap-2 mb-3 sm:mb-4">
                    <span className="text-[10px] sm:text-xs text-mute-blue font-ui">
                      퀴즈 {currentQuiz + 1} / {stage.quizzes.length}
                    </span>
                    <div className="flex-1 h-1.5 bg-deep-navy rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: stage.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentQuiz + (quizResult === 'correct' ? 1 : 0)) / stage.quizzes.length) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-deep-navy/80 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4 border border-mute-blue/10">
                    <p className="text-xs sm:text-sm text-light-gray font-ui leading-relaxed">
                      {quiz.question}
                    </p>
                  </div>

                  <div className="space-y-2">
                    {quiz.choices.map((choice, i) => {
                      let borderColor = 'border-mute-blue/20';
                      let bg = 'bg-deep-navy/50';

                      if (selectedAnswer === i) {
                        if (quizResult === 'correct') {
                          borderColor = 'border-green-400';
                          bg = 'bg-green-400/10';
                        } else if (quizResult === 'wrong') {
                          borderColor = 'border-red-400';
                          bg = 'bg-red-400/10';
                        }
                      }

                      return (
                        <motion.button
                          key={i}
                          onClick={() => handleAnswer(i)}
                          className={`w-full text-left p-2.5 sm:p-3 rounded-lg border ${borderColor} ${bg} text-xs sm:text-sm text-light-gray font-ui hover:border-mute-blue/50 transition-all`}
                          whileHover={{ scale: quizResult ? 1 : 1.01 }}
                          whileTap={{ scale: quizResult ? 1 : 0.98 }}
                        >
                          <span className="mr-2" style={{ color: stage.color }}>
                            {String.fromCharCode(65 + i)}.
                          </span>
                          {choice}
                        </motion.button>
                      );
                    })}
                  </div>

                  {quizResult === 'correct' && (
                    <motion.p
                      className="text-center text-green-400 text-xs sm:text-sm mt-3 font-ui"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      정답! 잘했어요!
                    </motion.p>
                  )}
                  {quizResult === 'wrong' && (
                    <motion.div
                      className="text-center mt-3"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <p className="text-red-400 text-xs sm:text-sm font-ui">틀렸어요! 다시 도전!</p>
                      <p className="text-mute-blue text-[10px] sm:text-xs mt-1">HINT: {quiz.hint}</p>
                    </motion.div>
                  )}

                  <button
                    onClick={() => {
                      setPhase('briefing');
                      setCurrentQuiz(0);
                      setSelectedAnswer(null);
                      setQuizResult(null);
                    }}
                    className="mt-4 text-[10px] sm:text-xs text-mute-blue hover:text-light-gray transition"
                  >
                    ← 브리핑으로 돌아가기
                  </button>
                </motion.div>
              )}

              {/* PHASE 3: Auth Key */}
              {phase === 'authkey' && quizzesPassed && (
                <motion.div
                  key="authkey"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="text-center"
                >
                  <div className="bg-green-400/10 border border-green-400/30 rounded-lg p-3 sm:p-4 mb-4 sm:mb-5">
                    <p className="text-green-400 font-title text-base sm:text-lg mb-1">
                      미션 퀴즈 통과!
                    </p>
                    <p className="text-xs sm:text-sm text-light-gray font-ui">
                      모든 퀴즈를 통과했어요! 선생님이 알려준 인증키를 입력하면 배지를 받을 수 있어요.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={authKey}
                      onChange={(e) => setAuthKey(e.target.value)}
                      placeholder="인증키를 입력하세요"
                      className="flex-1 rounded-lg bg-deep-navy border border-mute-blue/30 px-3 sm:px-4 py-2 text-sm text-light-gray placeholder:text-mute-blue/50 focus:outline-none focus:border-gold transition"
                      onKeyDown={(e) => e.key === 'Enter' && handleClaim()}
                      autoFocus
                    />
                    <button
                      onClick={handleClaim}
                      disabled={loading}
                      className="rounded-lg px-4 sm:px-5 py-2 font-ui text-sm text-white transition hover:brightness-110 disabled:opacity-50"
                      style={{ background: stage.color }}
                    >
                      {loading ? '...' : '확인'}
                    </button>
                  </div>
                  {error && (
                    <p className="text-red-400 text-xs mt-2">{error}</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
