'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { StudentWithBadges, AuthKey } from '@/types';
import { stages } from '@/data/stages';

type Tab = 'students' | 'keys' | 'dashboard';

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [students, setStudents] = useState<StudentWithBadges[]>([]);
  const [authKeys, setAuthKeys] = useState<AuthKey[]>([]);
  const [keyInputs, setKeyInputs] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);

  const headers = useCallback(
    () => ({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminPassword}`,
    }),
    [adminPassword]
  );

  const fetchStudents = useCallback(async () => {
    const res = await fetch('/api/admin/students', { headers: headers() });
    if (res.ok) {
      const data = await res.json();
      setStudents(data);
    }
  }, [headers]);

  const fetchAuthKeys = useCallback(async () => {
    const res = await fetch('/api/admin/auth-keys', { headers: headers() });
    if (res.ok) {
      const data = await res.json();
      setAuthKeys(data);
      const inputs: Record<number, string> = {};
      data.forEach((k: AuthKey) => {
        inputs[k.level] = k.key_value;
      });
      setKeyInputs(inputs);
    }
  }, [headers]);

  useEffect(() => {
    if (authenticated) {
      fetchStudents();
      fetchAuthKeys();
    }
  }, [authenticated, fetchStudents, fetchAuthKeys]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // We'll verify by making a test API call
    setLoading(true);
    setAdminPassword(password);
  };

  // Verify admin password by making API call
  useEffect(() => {
    if (!adminPassword) return;

    fetch('/api/admin/students', {
      headers: {
        Authorization: `Bearer ${adminPassword}`,
      },
    })
      .then((res) => {
        if (res.ok) {
          setAuthenticated(true);
        } else {
          setAuthError('비밀번호가 올바르지 않습니다.');
          setAdminPassword('');
        }
        setLoading(false);
      })
      .catch(() => {
        setAuthError('서버에 연결할 수 없습니다.');
        setAdminPassword('');
        setLoading(false);
      });
  }, [adminPassword]);

  const deleteStudent = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    await fetch(`/api/admin/students/${id}`, {
      method: 'DELETE',
      headers: headers(),
    });
    fetchStudents();
  };

  const [savedLevel, setSavedLevel] = useState<number | null>(null);
  const [saveError, setSaveError] = useState<string>('');

  const saveAuthKey = async (level: number) => {
    const keyValue = keyInputs[level];
    if (!keyValue?.trim()) return;

    setSavedLevel(null);
    setSaveError('');

    try {
      const res = await fetch('/api/admin/auth-keys', {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ level, keyValue: keyValue.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        setSaveError(data.error || '저장 실패');
        return;
      }

      setSavedLevel(level);
      fetchAuthKeys();
      setTimeout(() => setSavedLevel(null), 2000);
    } catch {
      setSaveError('서버 연결 오류');
    }
  };

  // Login screen
  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-deep-navy">
        <motion.div
          className="w-full max-w-sm p-8 rounded-2xl bg-dark-indigo border border-mute-blue/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-title text-gold text-center mb-6">
            관리자 로그인
          </h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="관리자 비밀번호"
              className="w-full px-4 py-3 rounded-lg bg-deep-navy border border-mute-blue/30 text-light-gray placeholder:text-mute-blue/50 focus:outline-none focus:border-gold transition"
              autoFocus
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-gold text-deep-navy font-title hover:brightness-110 transition disabled:opacity-50"
            >
              {loading ? '확인 중...' : '로그인'}
            </button>
            {authError && (
              <p className="text-red-400 text-sm text-center">{authError}</p>
            )}
          </form>
        </motion.div>
      </div>
    );
  }

  // Admin dashboard
  return (
    <div className="min-h-screen bg-deep-navy p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-title text-gold">
            관리자 대시보드
          </h1>
          <button
            onClick={() => {
              setAuthenticated(false);
              setAdminPassword('');
              setPassword('');
            }}
            className="px-4 py-2 rounded-lg bg-dark-indigo border border-mute-blue/30 text-mute-blue text-sm hover:text-light-gray transition"
          >
            로그아웃
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'dashboard' as Tab, label: '배지 현황' },
            { id: 'students' as Tab, label: '학생 관리' },
            { id: 'keys' as Tab, label: '인증키 관리' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 rounded-lg font-ui transition ${
                activeTab === tab.id
                  ? 'bg-gold text-deep-navy'
                  : 'bg-dark-indigo text-mute-blue hover:text-light-gray border border-mute-blue/20'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="rounded-xl bg-dark-indigo border border-mute-blue/20 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-mute-blue/20">
                  <th className="text-left p-4 text-mute-blue font-ui">이름</th>
                  {stages.map((s) => (
                    <th
                      key={s.level}
                      className="text-center p-4 font-ui"
                      style={{ color: s.color }}
                    >
                      Lv{s.level} {s.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-mute-blue">
                      등록된 학생이 없습니다.
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr key={student.id} className="border-b border-mute-blue/10">
                      <td className="p-4 text-light-gray">{student.name}</td>
                      {stages.map((s) => {
                        const hasBadge = student.badges?.some(
                          (b) => b.level === s.level
                        );
                        return (
                          <td key={s.level} className="text-center p-4 text-lg">
                            {hasBadge ? '✅' : '❌'}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="p-4 border-t border-mute-blue/20 text-mute-blue text-sm">
              총 {students.length}명 · 새로고침:{' '}
              <button onClick={fetchStudents} className="text-cyan-blue hover:underline">
                클릭
              </button>
            </div>
          </div>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div className="rounded-xl bg-dark-indigo border border-mute-blue/20 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-mute-blue/20">
                  <th className="text-left p-4 text-mute-blue font-ui">이름</th>
                  <th className="text-left p-4 text-mute-blue font-ui">등록일</th>
                  <th className="text-center p-4 text-mute-blue font-ui">배지</th>
                  <th className="text-center p-4 text-mute-blue font-ui">관리</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="border-b border-mute-blue/10">
                    <td className="p-4 text-light-gray">{student.name}</td>
                    <td className="p-4 text-mute-blue">
                      {new Date(student.created_at).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="p-4 text-center">
                      {student.badges?.map((b) => stages[b.level - 1]?.emoji).join(' ') || '-'}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => deleteStudent(student.id)}
                        className="px-3 py-1 rounded bg-red-500/20 text-red-400 text-xs hover:bg-red-500/30 transition"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Auth Keys Tab */}
        {activeTab === 'keys' && (
          <div className="space-y-4">
            {stages.map((stage) => {
              const existing = authKeys.find((k) => k.level === stage.level);
              return (
                <div
                  key={stage.level}
                  className="rounded-xl bg-dark-indigo border border-mute-blue/20 p-5"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{stage.emoji}</span>
                    <h3
                      className="text-lg font-title"
                      style={{ color: stage.color }}
                    >
                      Lv{stage.level}. {stage.title}
                    </h3>
                  </div>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={keyInputs[stage.level] || ''}
                      onChange={(e) =>
                        setKeyInputs((prev) => ({
                          ...prev,
                          [stage.level]: e.target.value,
                        }))
                      }
                      placeholder="인증키 입력"
                      className="flex-1 px-4 py-2 rounded-lg bg-deep-navy border border-mute-blue/30 text-light-gray placeholder:text-mute-blue/50 focus:outline-none focus:border-gold transition"
                    />
                    <button
                      onClick={() => saveAuthKey(stage.level)}
                      className="px-5 py-2 rounded-lg text-white font-ui hover:brightness-110 transition"
                      style={{ background: savedLevel === stage.level ? '#22c55e' : stage.color }}
                    >
                      {savedLevel === stage.level ? '저장됨!' : '저장'}
                    </button>
                  </div>
                  {saveError && (
                    <p className="mt-2 text-xs text-red-400">{saveError}</p>
                  )}
                  {existing && (
                    <p className="mt-2 text-xs text-mute-blue">
                      마지막 수정: {new Date(existing.updated_at).toLocaleString('ko-KR')}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
