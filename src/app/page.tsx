'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Starfield from '@/components/Starfield';

export default function Home() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingSession, setCheckingSession] = useState(true);
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

      <motion.div
        className="relative z-10 text-center px-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Title */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <h1 className="text-5xl font-title text-gold mb-2">
            데이터로 레벨업!
          </h1>
          <p className="text-lg font-ui text-cyan-blue mb-1">
            건강을 지키는 간식 생활
          </p>
          <p className="text-sm text-mute-blue mb-10">
            배지 성장 여정을 시작하세요
          </p>
        </motion.div>

        {/* Name input form */}
        <motion.form
          onSubmit={handleSubmit}
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름을 입력하세요"
              maxLength={20}
              className="w-72 px-6 py-3 rounded-xl bg-dark-indigo border-2 border-mute-blue/30 text-light-gray text-center text-lg font-ui placeholder:text-mute-blue/50 focus:outline-none focus:border-gold transition-all"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-72 py-3 rounded-xl bg-gradient-to-r from-cyan-blue to-electric-purple text-white text-lg font-title hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? '접속 중...' : '모험 시작!'}
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
        </motion.form>

        {/* Footer badges preview */}
        <motion.div
          className="mt-12 flex gap-6 justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <span className="text-3xl opacity-40 hover:opacity-100 transition">🔷</span>
          <span className="text-3xl opacity-40 hover:opacity-100 transition">🔶</span>
          <span className="text-3xl opacity-40 hover:opacity-100 transition">💎</span>
        </motion.div>
      </motion.div>
    </main>
  );
}
