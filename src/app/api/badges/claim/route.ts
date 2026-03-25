import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { studentId, level, key } = await request.json();

    if (!studentId || !level || !key) {
      return NextResponse.json({ error: '필수 정보가 누락되었습니다.' }, { status: 400 });
    }

    if (![1, 2, 3].includes(level)) {
      return NextResponse.json({ error: '유효하지 않은 레벨입니다.' }, { status: 400 });
    }

    const supabase = await createServerClient();

    // Verify auth key
    const { data: authKey } = await supabase
      .from('auth_keys')
      .select('key_value')
      .eq('level', level)
      .single();

    if (!authKey || authKey.key_value !== key.trim()) {
      return NextResponse.json({ error: '인증키가 올바르지 않습니다.' }, { status: 401 });
    }

    // Check if already awarded
    const { data: existingBadge } = await supabase
      .from('badges')
      .select('id')
      .eq('student_id', studentId)
      .eq('level', level)
      .single();

    if (existingBadge) {
      return NextResponse.json({ error: '이미 획득한 배지입니다.' }, { status: 409 });
    }

    // Award badge
    const { data: badge, error } = await supabase
      .from('badges')
      .insert({ student_id: studentId, level })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: '배지 수여에 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, badge });
  } catch {
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
