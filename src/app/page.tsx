'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Starfield from '@/components/Starfield';
import DialogueBox from '@/components/DialogueBox';
import { worldSetting } from '@/data/stages';

export default function Home() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingSession, setCheckingSession] = useState(true);
  const [showIntro, setShowIntro] = useState(true);
  const [introLine, setIntroLine] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const storedId = localStorage.getItem('studentId');
    const storedName = localStorage.getItem('studentName');
    if (storedId && storedName) {
      router.push('/map');
    } else {
      setCheckingSession(false);
    }
  }, [router]);

  // Typewriter effect for intro
  useEffect(() => {
    if (!showIntro || checkingSession) return;
    if (introLine < worldSetting.intro.length) {
      const timer = setTimeout(() => setIntroLine((l) => l + 1), 600);
      return () => clearTimeout(timer);
    }
  }, [introLine, showIntro, checkingSession]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('이름을 입력해주세요!');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/students/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || '오류가 발생했습니다.');
        setLoading(false);
        return;
      }

      localStorage.setItem('studentId', data.id);
      localStorage.setItem('studentName', data.name);
      router.push('/map');
    } catch {
      setError('서버에 연결할 수 없습니다.');
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-deep-navy">
        <div className="text-mute-blue animate-pulse text-lg font-ui">
          로딩 중...
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      <Starfield />

      <div className="relative z-10 text-center px-6 max-w-lg">
        <AnimatePresence mode="wait">
          {showIntro ? (
            <motion.div
              key="intro"
              className="flex flex-col items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Game title */}
              <motion.h1
                className="text-4xl font-title text-gold mb-8"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                {worldSetting.title}
              </motion.h1>

              {/* Dasom worried dialogue */}
              <div className="w-full mb-4">
                <DialogueBox
                  expression="worried"
                  message="큰일이야! 간식왕국에 정크 바이러스가 퍼지고 있어... 빨리 수호대원을 모집해야 해!"
                  color="#ff6b35"
                />
              </div>

              {/* Story text - typewriter style */}
              <div className="bg-dark-indigo/80 border border-mute-blue/20 rounded-xl p-6 mb-8 min-h-[200px] w-full text-left">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-gold bg-gold/20 px-2 py-0.5 rounded font-ui">STORY</span>
                  <div className="flex-1 h-px bg-mute-blue/20" />
                </div>
                {worldSetting.intro.slice(0, introLine).map((line, i) => (
                  <motion.p
                    key={i}
                    className={`font-ui text-sm leading-relaxed ${
                      line === '' ? 'h-3' : i < 3 ? 'text-fire-orange' : 'text-light-gray'
                    }`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {line}
                  </motion.p>
                ))}
                {introLine < worldSetting.intro.length && (
                  <span className="inline-block w-2 h-4 bg-cyan-blue animate-pulse ml-1" />
                )}
              </div>

              {/* Skip / Continue button */}
              <motion.button
                onClick={() => setShowIntro(false)}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-fire-orange to-electric-purple text-white font-title text-lg hover:brightness-110 active:scale-95 transition-all"
                initial={{ opacity: 0 }}
                animate={{ opacity: introLine >= worldSetting.intro.length ? 1 : 0.5 }}
                whileHover={{ scale: 1.05 }}
              >
                {introLine >= worldSetting.intro.length ? '작전 시작!' : '건너뛰기 >>'}
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="register"
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Recruit screen */}
              <div className="mb-6">
                <span className="text-xs text-cyan-blue bg-cyan-blue/20 px-2 py-0.5 rounded font-ui">RECRUIT</span>
              </div>

              <h2 className="text-3xl font-title text-gold mb-2">
                데이터 수호대
              </h2>
              <p className="text-sm text-mute-blue mb-2 font-ui">
                간식왕국이 당신을 기다리고 있습니다
              </p>

              {/* Dasom default dialogue */}
              <div className="w-full mb-6">
                <DialogueBox
                  expression="default"
                  message={worldSetting.recruitMessage}
                  color="#00c9ff"
                />
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 w-full">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="수호대원 이름"
                  maxLength={20}
                  className="w-72 px-6 py-3 rounded-xl bg-dark-indigo border-2 border-mute-blue/30 text-light-gray text-center text-lg font-ui placeholder:text-mute-blue/50 focus:outline-none focus:border-gold transition-all"
                  autoFocus
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-72 py-3 rounded-xl bg-gradient-to-r from-cyan-blue to-electric-purple text-white text-lg font-title hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                >
                  {loading ? '등록 중...' : worldSetting.buttonText}
                </button>

                {error && (
                  <motion.p
                    className="text-red-400 text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {error}
                  </motion.p>
                )}
              </form>

              <button
                onClick={() => setShowIntro(true)}
                className="mt-6 text-xs text-mute-blue hover:text-light-gray transition"
              >
                스토리 다시 보기
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
