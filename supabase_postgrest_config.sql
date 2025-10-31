-- Supabase PostgREST 설정: virtualpeople 스키마 노출
-- 이 SQL을 Supabase 웹 인터페이스의 SQL Editor에서 실행하세요.

-- =============================================================================
-- 1단계: PostgREST 설정 확인 및 업데이트
-- =============================================================================

-- 현재 PostgREST 설정 확인
SELECT name, setting FROM pg_settings 
WHERE name LIKE '%pgrst%' OR name LIKE '%postgrest%'
ORDER BY name;

-- =============================================================================
-- 2단계: virtualpeople 스키마 PostgREST 노출 설정
-- =============================================================================

-- PostgREST가 virtualpeople 스키마에 접근할 수 있도록 설정
-- 주의: 이 설정은 Supabase에서 제한될 수 있습니다. 
-- 대신 pre-request 함수를 사용합니다.

-- =============================================================================
-- 3단계: pre-request 함수 생성 (PostgREST 스키마 확장)
-- =============================================================================

-- PostgREST pre-request 함수 생성
CREATE OR REPLACE FUNCTION public.pgrst_watch()
RETURNS event_trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- PostgREST 설정에 virtualpeople 스키마 추가
  NOTIFY pgrst, 'reload schema';
END;
$$;

-- 이벤트 트리거 생성 (스키마 변경 시 PostgREST 알림)
DROP EVENT TRIGGER IF EXISTS pgrst_watch;
CREATE EVENT TRIGGER pgrst_watch
  ON ddl_command_end
  EXECUTE PROCEDURE public.pgrst_watch();

-- =============================================================================
-- 4단계: 권한 설정 확인 및 수정
-- =============================================================================

-- virtualpeople 스키마 사용 권한 부여
GRANT USAGE ON SCHEMA virtualpeople TO anon, authenticated, service_role;

-- personas 테이블 권한 부여
GRANT SELECT, INSERT, UPDATE, DELETE ON virtualpeople.personas TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON virtualpeople.personas TO service_role;

-- 시퀀스 권한 (ID가 자동 증가하는 경우)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA virtualpeople TO anon, authenticated, service_role;

-- =============================================================================
-- 5단계: PostgREST 스키마 목록 업데이트 함수
-- =============================================================================

-- PostgREST가 스키마를 인식하도록 하는 함수
CREATE OR REPLACE FUNCTION public.refresh_postgrest_schema()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  NOTIFY pgrst, 'reload schema';
$$;

-- 함수 실행 권한 부여
GRANT EXECUTE ON FUNCTION public.refresh_postgrest_schema() TO anon, authenticated, service_role;

-- =============================================================================
-- 6단계: Supabase 특화 설정
-- =============================================================================

-- Supabase의 경우 realtime 권한도 필요할 수 있음
ALTER PUBLICATION supabase_realtime ADD TABLE virtualpeople.personas;

-- =============================================================================
-- 7단계: 스키마 새로고침 실행
-- =============================================================================

-- PostgREST 스키마 새로고침 실행
SELECT public.refresh_postgrest_schema();

-- =============================================================================
-- 8단계: 검증 쿼리
-- =============================================================================

-- 테이블 존재 확인
SELECT schemaname, tablename, tableowner 
FROM pg_tables 
WHERE schemaname = 'virtualpeople' AND tablename = 'personas';

-- 권한 확인
SELECT 
    grantee, 
    table_schema, 
    table_name, 
    privilege_type 
FROM information_schema.table_privileges 
WHERE table_schema = 'virtualpeople' AND table_name = 'personas'
ORDER BY grantee, privilege_type;

-- 데이터 확인
SELECT COUNT(*) as total_personas FROM virtualpeople.personas;

-- =============================================================================
-- 완료 메시지
-- =============================================================================
DO $$
BEGIN
    RAISE NOTICE '✅ virtualpeople 스키마 PostgREST 노출 설정 완료';
    RAISE NOTICE '📋 이제 API에서 virtualpeople.personas에 접근할 수 있습니다';
    RAISE NOTICE '🔄 변경사항이 반영되지 않으면 잠시 기다린 후 다시 시도하세요';
END $$;