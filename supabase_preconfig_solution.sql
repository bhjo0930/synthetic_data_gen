-- Supabase Cloud에서 virtualpeople 스키마 접근을 위한 pre_config 함수 설정
-- 이 방법은 슈퍼유저 권한 없이도 PostgREST 스키마 설정을 변경할 수 있습니다.

-- =============================================================================
-- 1단계: postgrest 스키마 생성 및 권한 설정
-- =============================================================================

-- postgrest 전용 스키마 생성
CREATE SCHEMA IF NOT EXISTS postgrest;

-- authenticator 역할에 postgrest 스키마 사용 권한 부여
-- authenticator는 PostgREST가 사용하는 특별한 역할입니다
GRANT USAGE ON SCHEMA postgrest TO authenticator;

-- anon과 authenticated 역할에도 권한 부여
GRANT USAGE ON SCHEMA postgrest TO anon, authenticated;

-- =============================================================================
-- 2단계: pre_config 함수 생성
-- =============================================================================

-- PostgREST가 시작할 때 자동으로 호출하는 pre_config 함수 생성
CREATE OR REPLACE FUNCTION postgrest.pre_config()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  -- PostgREST 스키마 설정을 public과 virtualpeople로 확장
  SELECT set_config('pgrst.db_schemas', 'public,virtualpeople', true);
  
  -- 추가 PostgREST 설정들 (선택사항)
  SELECT set_config('pgrst.db_anon_role', 'anon', true);
  SELECT set_config('pgrst.db_use_legacy_gucs', 'false', true);
$$;

-- authenticator 역할에 함수 실행 권한 부여
GRANT EXECUTE ON FUNCTION postgrest.pre_config() TO authenticator;

-- =============================================================================
-- 3단계: virtualpeople 스키마 권한 설정
-- =============================================================================

-- virtualpeople 스키마가 존재하는지 확인
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'virtualpeople') THEN
        CREATE SCHEMA virtualpeople;
    END IF;
END
$$;

-- authenticator 역할에 virtualpeople 스키마 사용 권한 부여
GRANT USAGE ON SCHEMA virtualpeople TO authenticator;
GRANT USAGE ON SCHEMA virtualpeople TO anon, authenticated;

-- virtualpeople.personas 테이블 권한 부여
-- (테이블이 이미 존재한다고 가정)
GRANT SELECT, INSERT, UPDATE, DELETE ON virtualpeople.personas TO anon, authenticated;
GRANT ALL ON virtualpeople.personas TO authenticator;

-- 시퀀스 권한도 부여 (AUTO INCREMENT 컬럼이 있는 경우)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA virtualpeople TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA virtualpeople TO authenticator;

-- =============================================================================
-- 4단계: RLS (Row Level Security) 정책 설정
-- =============================================================================

-- personas 테이블에 RLS 활성화
ALTER TABLE virtualpeople.personas ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 모든 작업을 수행할 수 있는 정책 (개발/테스트용)
CREATE POLICY "Allow all operations on personas" ON virtualpeople.personas
FOR ALL 
TO anon, authenticated, authenticator
USING (true)
WITH CHECK (true);

-- =============================================================================
-- 5단계: 설정 확인 및 테스트 함수
-- =============================================================================

-- PostgREST 설정 확인 함수
CREATE OR REPLACE FUNCTION public.check_postgrest_config()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT jsonb_build_object(
    'db_schemas', current_setting('pgrst.db_schemas', true),
    'db_anon_role', current_setting('pgrst.db_anon_role', true),
    'postgrest_schema_exists', (
      SELECT EXISTS (
        SELECT 1 FROM information_schema.schemata 
        WHERE schema_name = 'postgrest'
      )
    ),
    'virtualpeople_schema_exists', (
      SELECT EXISTS (
        SELECT 1 FROM information_schema.schemata 
        WHERE schema_name = 'virtualpeople'
      )
    ),
    'personas_table_exists', (
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'virtualpeople' AND table_name = 'personas'
      )
    ),
    'pre_config_function_exists', (
      SELECT EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_schema = 'postgrest' AND routine_name = 'pre_config'
      )
    )
  );
$$;

-- 테스트 함수 권한
GRANT EXECUTE ON FUNCTION public.check_postgrest_config() TO anon, authenticated;

-- =============================================================================
-- 6단계: 스키마 권한 상세 확인 함수
-- =============================================================================

CREATE OR REPLACE FUNCTION public.check_schema_permissions()
RETURNS TABLE (
  schema_name text,
  grantee_role text,
  privilege_type text,
  is_grantable boolean
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    s.schema_name::text,
    s.grantee::text as grantee_role,
    s.privilege_type::text,
    s.is_grantable::boolean
  FROM information_schema.schema_privileges s
  WHERE s.schema_name IN ('postgrest', 'virtualpeople')
  ORDER BY s.schema_name, s.grantee, s.privilege_type;
$$;

-- 테이블 권한 확인 함수
CREATE OR REPLACE FUNCTION public.check_table_permissions()
RETURNS TABLE (
  table_schema text,
  table_name text,
  grantee_role text,
  privilege_type text,
  is_grantable boolean
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    t.table_schema::text,
    t.table_name::text,
    t.grantee::text as grantee_role,
    t.privilege_type::text,
    t.is_grantable::boolean
  FROM information_schema.table_privileges t
  WHERE t.table_schema = 'virtualpeople' AND t.table_name = 'personas'
  ORDER BY t.table_schema, t.table_name, t.grantee, t.privilege_type;
$$;

-- 권한 확인 함수들 실행 권한
GRANT EXECUTE ON FUNCTION public.check_schema_permissions() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_table_permissions() TO anon, authenticated;

-- =============================================================================
-- 7단계: PostgREST 재시작 트리거 (Supabase에서 자동 처리)
-- =============================================================================

-- Supabase Cloud에서는 PostgREST가 자동으로 pre_config 함수를 감지하고 재시작합니다.
-- 몇 분 정도 기다린 후 설정이 적용됩니다.

-- 수동으로 pre_config 함수 테스트 (개발용)
-- SELECT postgrest.pre_config();

-- =============================================================================
-- 8단계: 테스트 쿼리들
-- =============================================================================

-- 설정 확인
-- SELECT * FROM public.check_postgrest_config();

-- 스키마 권한 확인
-- SELECT * FROM public.check_schema_permissions();

-- 테이블 권한 확인
-- SELECT * FROM public.check_table_permissions();

-- 직접 스키마 접근 테스트 (설정 적용 후)
-- SELECT COUNT(*) FROM virtualpeople.personas;

-- PostgREST API를 통한 접근 테스트 (설정 적용 후)
-- curl "https://your-project.supabase.co/rest/v1/virtualpeople.personas"

-- =============================================================================
-- 추가 정보
-- =============================================================================

/*
이 설정이 완료되면:

1. PostgREST가 pre_config 함수를 자동으로 실행
2. pgrst.db_schemas가 'public,virtualpeople'로 설정됨
3. virtualpeople 스키마의 테이블들이 PostgREST API를 통해 직접 접근 가능

API 엔드포인트 예시:
- GET  /rest/v1/virtualpeople.personas
- POST /rest/v1/virtualpeople.personas
- PATCH /rest/v1/virtualpeople.personas?id=eq.123
- DELETE /rest/v1/virtualpeople.personas?id=eq.123

Python 클라이언트 코드:
supabase.schema('virtualpeople').table('personas').select('*')

주의사항:
- Supabase Cloud에서 설정이 적용되기까지 5-10분 소요될 수 있음
- RLS 정책이 활성화되어 있으므로 적절한 보안 정책 설정 필요
*/