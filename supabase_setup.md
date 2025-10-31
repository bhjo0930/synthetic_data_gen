# Supabase 설정 가이드

## 1. Supabase 프로젝트 생성

1. [Supabase 웹사이트](https://supabase.com/) 접속
2. "Start your project" 클릭
3. GitHub 계정으로 로그인
4. "New Project" 클릭
5. 프로젝트 이름 입력 (예: synthetic-data-gen)
6. 데이터베이스 비밀번호 설정
7. 리전 선택 (Asia - Seoul 권장)
8. "Create new project" 클릭

## 2. 데이터베이스 스키마 및 테이블 생성

1. Supabase 대시보드에서 "SQL Editor" 선택
2. 다음 SQL 실행:

```sql
-- virtualpeople 스키마 생성
CREATE SCHEMA IF NOT EXISTS virtualpeople;

-- personas 테이블 생성
CREATE TABLE IF NOT EXISTS virtualpeople.personas (
    id TEXT PRIMARY KEY,
    name TEXT,
    age INTEGER,
    gender TEXT,
    location TEXT,
    occupation TEXT,
    education TEXT,
    income_bracket TEXT,
    marital_status TEXT,
    personality_traits JSONB,
    values JSONB,
    lifestyle_attributes JSONB,
    interests JSONB,
    media_consumption TEXT,
    shopping_habit TEXT,
    social_relations JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    version INTEGER DEFAULT 1
);

-- 인덱스 생성 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_personas_age ON virtualpeople.personas(age);
CREATE INDEX IF NOT EXISTS idx_personas_gender ON virtualpeople.personas(gender);
CREATE INDEX IF NOT EXISTS idx_personas_location ON virtualpeople.personas(location);
CREATE INDEX IF NOT EXISTS idx_personas_occupation ON virtualpeople.personas(occupation);
CREATE INDEX IF NOT EXISTS idx_personas_created_at ON virtualpeople.personas(created_at);
```

## 3. API 키 확인

1. Supabase 대시보드에서 "Settings" → "API" 선택
2. 다음 정보 복사:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 4. 환경변수 설정

### 로컬 개발환경 (.env 파일)
```env
DATABASE_TYPE=supabase
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Cloud Run 배포 (deploy.sh 수정)
`deploy.sh` 파일의 54번째 줄에서 실제 값으로 변경:
```bash
--set-env-vars="FLASK_ENV=production,PYTHONUNBUFFERED=1,DATABASE_TYPE=supabase,SUPABASE_URL=https://실제-프로젝트-id.supabase.co,SUPABASE_ANON_KEY=실제-anon-key" \
```

## 5. 배포 및 테스트

1. 로컬 테스트:
```bash
python start.py
```

2. Cloud Run 배포:
```bash
./deploy.sh ferrous-amphora-466402-i9 asia-northeast3
```

## 6. 데이터베이스 확인

배포 후 헬스체크 엔드포인트로 확인:
```
https://your-service-url/health
```

응답 예시:
```json
{
  "status": "healthy",
  "database": {
    "type": "supabase",
    "healthy": true,
    "configuration": {
      "schema": "virtualpeople",
      "table": "personas"
    }
  }
}
```