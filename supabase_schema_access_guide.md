# Supabase virtualpeople 스키마 접근 방법

## 🎯 목표
`virtualpeople.personas` 테이블을 PostgREST API를 통해 직접 접근 가능하게 만들기

## 🔧 방법 1: PostgREST 스키마 설정 변경 (권장)

### 1단계: 스키마를 PostgREST에 노출
```sql
-- Supabase 대시보드 > SQL Editor에서 실행

-- 현재 설정 확인
SELECT name, setting FROM pg_settings WHERE name LIKE '%pgrst%';

-- virtualpeople 스키마를 PostgREST에 노출
ALTER DATABASE postgres SET "pgrst.db_schemas" = 'public,virtualpeople';

-- 설정 적용을 위해 PostgREST 재시작 (Supabase가 자동 처리)
SELECT pg_reload_conf();
```

### 2단계: 권한 설정
```sql
-- anon 역할에 스키마 사용 권한 부여
GRANT USAGE ON SCHEMA virtualpeople TO anon;
GRANT USAGE ON SCHEMA virtualpeople TO authenticated;

-- personas 테이블 권한 부여
GRANT ALL ON TABLE virtualpeople.personas TO anon;
GRANT ALL ON TABLE virtualpeople.personas TO authenticated;

-- 시퀀스 권한 부여 (AUTO INCREMENT가 있는 경우)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA virtualpeople TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA virtualpeople TO authenticated;
```

### 3단계: RLS (Row Level Security) 정책 설정
```sql
-- RLS 활성화
ALTER TABLE virtualpeople.personas ENABLE ROW LEVEL SECURITY;

-- 모든 접근 허용 정책 (개발/테스트용)
CREATE POLICY "Allow all operations on personas" ON virtualpeople.personas
FOR ALL 
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- 또는 더 세분화된 정책
CREATE POLICY "Allow read access to personas" ON virtualpeople.personas
FOR SELECT TO anon, authenticated
USING (true);

CREATE POLICY "Allow insert access to personas" ON virtualpeople.personas
FOR INSERT TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Allow update access to personas" ON virtualpeople.personas
FOR UPDATE TO anon, authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow delete access to personas" ON virtualpeople.personas
FOR DELETE TO anon, authenticated
USING (true);
```

### 4단계: 설정 확인
```sql
-- 스키마 권한 확인
SELECT 
    schema_name,
    grantee,
    privilege_type
FROM information_schema.schema_privileges 
WHERE schema_name = 'virtualpeople';

-- 테이블 권한 확인  
SELECT 
    table_schema,
    table_name,
    grantee,
    privilege_type
FROM information_schema.table_privileges 
WHERE table_schema = 'virtualpeople' AND table_name = 'personas';

-- RLS 정책 확인
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'virtualpeople' AND tablename = 'personas';
```

## 📱 클라이언트 코드 수정

### Python (supabase-py)
```python
# 기존 코드
self.supabase.schema(self.schema).table(self.table_name)

# 또는 직접 스키마 지정
self.supabase.schema('virtualpeople').table('personas')
```

### JavaScript
```javascript
// 스키마 지정해서 접근
const { data, error } = await supabase
  .schema('virtualpeople')
  .from('personas')
  .select('*');

// 또는 URL에 직접 지정
const response = await fetch(`${SUPABASE_URL}/rest/v1/virtualpeople.personas`, {
  headers: {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json'
  }
});
```

## 🔍 문제 해결

### 설정이 적용되지 않는 경우
```sql
-- PostgREST 서비스 재시작이 필요한 경우
-- Supabase Cloud에서는 자동으로 처리되지만, 몇 분 정도 기다려야 할 수 있음

-- 현재 활성화된 스키마 확인
SELECT current_setting('pgrst.db_schemas');

-- 데이터베이스 재연결
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = current_database();
```

### 권한 오류가 계속 발생하는 경우
```sql
-- 모든 권한을 명시적으로 부여
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA virtualpeople TO anon;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA virtualpeople TO authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA virtualpeople TO anon;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA virtualpeople TO authenticated;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA virtualpeople TO anon;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA virtualpeople TO authenticated;
```

## 📋 방법 2: 현재 사용 중인 뷰 방식 (Fallback)

만약 위 방법이 작동하지 않으면 현재 구현된 뷰 방식을 계속 사용:

```sql
-- public 스키마에 뷰 생성
CREATE OR REPLACE VIEW public.virtualpeople_personas_view AS 
SELECT * FROM virtualpeople.personas;

-- 뷰를 통한 CRUD 작업을 위한 규칙들
-- (create_supabase_view.sql 참조)
```

## ✅ 테스트 방법

### 1. SQL로 직접 테스트
```sql
-- PostgREST API를 통한 접근 테스트
SELECT * FROM virtualpeople.personas LIMIT 1;
```

### 2. API 엔드포인트 테스트
```bash
# 직접 스키마 접근
curl "https://your-project-id.supabase.co/rest/v1/virtualpeople.personas" \
  -H "apikey: your-anon-key" \
  -H "Authorization: Bearer your-anon-key"
```

### 3. 애플리케이션에서 테스트
- 서버 재시작 후 헬스체크 API 호출
- 페르소나 생성 및 조회 테스트

## 🚨 주의사항

1. **Supabase Cloud 제한**: 일부 PostgREST 설정은 Self-hosted에서만 가능
2. **권한 관리**: 프로덕션에서는 적절한 RLS 정책 설정 필요
3. **성능**: 스키마가 많아질수록 PostgREST 성능에 영향 가능
4. **캐싱**: 설정 변경 후 몇 분 정도 대기 필요