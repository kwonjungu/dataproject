# 배지 스토리텔링 웹 (Badge Storytelling Web)

디지털새싹 프로그램 "데이터로 레벨업! 건강을 지키는 간식 생활"의 3단계 배지 성장 서사를 게임 맵 스타일 인터랙티브 웹으로 구현한 프로젝트입니다.

## 기술 스택

- **프론트엔드**: Next.js 16 (App Router, TypeScript)
- **스타일링**: Tailwind CSS + Framer Motion
- **DB**: Supabase (PostgreSQL)
- **호스팅**: Vercel

## 시작하기

### 1. 환경변수 설정

`.env.local` 파일을 생성하고 아래 값을 입력하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_PASSWORD=your-admin-password
```

### 2. Supabase DB 테이블 생성

```sql
CREATE TABLE students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  level INTEGER NOT NULL CHECK (level IN (1, 2, 3)),
  awarded_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, level)
);

CREATE TABLE auth_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  level INTEGER NOT NULL UNIQUE CHECK (level IN (1, 2, 3)),
  key_value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3. 개발 서버 실행

```bash
npm install
npm run dev
```

http://localhost:3000 에서 확인하세요.

## 페이지 구조

- `/` — 랜딩 (이름 입력)
- `/map` — 게임 맵 (배지 성장 여정)
- `/admin` — 관리자 페이지 (학생 관리, 인증키 관리, 배지 현황)

## 효과음

`public/sounds/` 폴더에 아래 파일을 넣으세요:
- `fanfare.mp3` — 배지 획득 팡파레
- `click.mp3` — 노드 클릭음
- `success.mp3` — 인증 성공음

파일이 없어도 에러 없이 동작합니다.
