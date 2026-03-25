import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { name } = await request.json();

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: '이름을 입력해주세요.' }, { status: 400 });
    }

    const trimmedName = name.trim();
    const supabase = createServerClient();

    // Check if student exists
    const { data: existing } = await supabase
      .from('students')
      .select('*, badges(*)')
      .eq('name', trimmedName)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({
        id: existing.id,
        name: existing.name,
        badges: existing.badges || [],
      });
    }

    // Create new student
    const { data: newStudent, error } = await supabase
      .from('students')
      .insert({ name: trimmedName })
      .select()
      .single();

    if (error) {
      console.error('Student creation error:', error);
      return NextResponse.json({ error: '학생 등록에 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json({
      id: newStudent.id,
      name: newStudent.name,
      badges: [],
    });
  } catch {
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
