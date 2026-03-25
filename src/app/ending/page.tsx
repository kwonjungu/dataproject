'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Starfield from '@/components/Starfield';
import EndingSequence from '@/components/EndingSequence';

export default function EndingPage() {
  const [studentName, setStudentName] = useState('');
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const name = localStorage.getItem('studentName') || '수호대원';
    setStudentName(name);
    setReady(true);
  }, []);

  if (!ready) return null;

  return (
    <main className="min-h-screen relative bg-deep-navy">
      <Starfield />
      <EndingSequence
        studentName={studentName}
        onComplete={() => router.push('/gallery')}
      />
    </main>
  );
}
