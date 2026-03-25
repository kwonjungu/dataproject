import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

function checkAdmin(request: Request) {
  const authHeader = request.headers.get('Authorization');
  const password = process.env.ADMIN_PASSWORD;
  if (!password || authHeader !== `Bearer ${password}`) {
    return false;
  }
  return true;
}

export async function GET(request: Request) {
  if (!checkAdmin(request)) {
    return NextResponse.json({ error: '관리자 인증이 필요합니다.' }, { status: 401 });
  }

  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('auth_keys')
      .select('*')
      .order('level', { ascending: true });

    if (error) {
      return NextResponse.json({ error: '데이터 조회에 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch {
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!checkAdmin(request)) {
    return NextResponse.json({ error: '관리자 인증이 필요합니다.' }, { status: 401 });
  }

  try {
    const { level, keyValue } = await request.json();

    if (!level || !keyValue || ![1, 2, 3].includes(level)) {
      return NextResponse.json({ error: '유효하지 않은 입력입니다.' }, { status: 400 });
    }

    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('auth_keys')
      .upsert(
        { level, key_value: keyValue.trim(), updated_at: new Date().toISOString() },
        { onConflict: 'level' }
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: '인증키 저장에 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
