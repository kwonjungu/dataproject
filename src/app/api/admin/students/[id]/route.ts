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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAdmin(request)) {
    return NextResponse.json({ error: '관리자 인증이 필요합니다.' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const supabase = await createServerClient();

    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: '학생 삭제에 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
