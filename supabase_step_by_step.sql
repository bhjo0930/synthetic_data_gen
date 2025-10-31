-- Supabase 단계별 설정 및 진단
-- 각 단계를 순서대로 실행하고 결과를 확인하세요

-- =============================================================================
-- 1단계: 현재 상태 확인
-- =============================================================================

-- 현재 스키마 목록 확인
SELECT schema_name FROM information_schema.schemata 
WHERE schema_name IN ('public', 'virtualpeople', 'postgrest')
ORDER BY schema_name;

-- 현재 PostgREST 설정 확인 (가능한 경우)
SELECT name, setting FROM pg_settings 
WHERE name LIKE '%pgrst%' OR name LIKE '%postgrest%';

-- virtualpeople.personas 테이블 존재 확인
SELECT 
    table_schema, 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'virtualpeople' AND table_name = 'personas';

-- =============================================================================
-- 2단계: 기본 스키마 및 권한 설정 (안전한 방법)
-- =============================================================================

-- postgrest 스키마 생성
CREATE SCHEMA IF NOT EXISTS postgrest;

-- virtualpeople 스키마 확인 (이미 존재한다고 가정)
-- CREATE SCHEMA IF NOT EXISTS virtualpeople; -- 필요한 경우만 주석 해제

-- 기본 권한 설정
GRANT USAGE ON SCHEMA postgrest TO postgres;
GRANT USAGE ON SCHEMA virtualpeople TO postgres;

-- anon, authenticated 역할에 기본 권한
GRANT USAGE ON SCHEMA virtualpeople TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON virtualpeople.personas TO anon, authenticated;

-- =============================================================================
-- 3단계: 진단 함수 생성 (public 스키마에)
-- =============================================================================

-- 간단한 진단 함수
CREATE OR REPLACE FUNCTION public.diagnose_supabase()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    'Schemas: ' || 
    COALESCE(
      (SELECT string_agg(schema_name, ', ') 
       FROM information_schema.schemata 
       WHERE schema_name IN ('public', 'virtualpeople', 'postgrest')), 
      'none'
    ) ||
    ' | Tables: ' ||
    COALESCE(
      (SELECT string_agg(table_name, ', ')
       FROM information_schema.tables 
       WHERE table_schema = 'virtualpeople'),
      'none'
    );
$$;

-- 권한 부여
GRANT EXECUTE ON FUNCTION public.diagnose_supabase() TO anon, authenticated;

-- =============================================================================
-- 4단계: pre_config 함수 생성 (단순 버전)
-- =============================================================================

-- 단순한 pre_config 함수 (오류 방지)
CREATE OR REPLACE FUNCTION postgrest.pre_config()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- PostgREST 스키마 설정 시도
  BEGIN
    PERFORM set_config('pgrst.db_schemas', 'public,virtualpeople', true);
  EXCEPTION WHEN OTHERS THEN
    -- 오류가 발생해도 함수는 성공적으로 완료
    NULL;
  END;
END;
$$;

-- authenticator 역할 확인 및 권한 부여
DO $$
BEGIN
  -- authenticator 역할이 존재하는 경우만 권한 부여
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticator') THEN
    GRANT EXECUTE ON FUNCTION postgrest.pre_config() TO authenticator;
  END IF;
END;
$$;

-- =============================================================================
-- 5단계: 임시 뷰 생성 (Fallback)
-- =============================================================================

-- 임시로 사용할 수 있는 간단한 뷰
CREATE OR REPLACE VIEW public.personas_temp AS 
SELECT * FROM virtualpeople.personas;

-- 뷰 권한
GRANT SELECT ON public.personas_temp TO anon, authenticated;

-- =============================================================================
-- 6단계: 테스트 쿼리
-- =============================================================================

-- 진단 함수 테스트
-- SELECT public.diagnose_supabase();

-- 직접 테이블 접근 테스트
-- SELECT COUNT(*) FROM virtualpeople.personas;

-- 뷰를 통한 접근 테스트
-- SELECT COUNT(*) FROM public.personas_temp;

-- pre_config 함수 수동 실행 테스트
-- SELECT postgrest.pre_config();