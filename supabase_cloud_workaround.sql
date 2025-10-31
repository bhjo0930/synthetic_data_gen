-- Supabase Cloud에서 virtualpeople 스키마 접근을 위한 우회 방법들
-- 아래 방법 중 하나를 선택해서 실행하세요

-- =============================================================================
-- 방법 1: 스키마 검색 경로 설정 (간단하지만 제한적)
-- =============================================================================

-- anon과 authenticated 역할의 search_path에 virtualpeople 추가
ALTER ROLE anon SET search_path = public, virtualpeople;
ALTER ROLE authenticated SET search_path = public, virtualpeople;

-- 설정 확인
SELECT rolname, rolconfig FROM pg_roles WHERE rolname IN ('anon', 'authenticated');

-- =============================================================================
-- 방법 2: API 프록시 함수 생성 (권장)
-- =============================================================================

-- 1. 모든 personas 조회 함수
CREATE OR REPLACE FUNCTION public.get_personas(limit_count int DEFAULT 100, offset_count int DEFAULT 0)
RETURNS SETOF virtualpeople.personas
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM virtualpeople.personas 
  ORDER BY created_at DESC 
  LIMIT limit_count OFFSET offset_count;
$$;

-- 2. 검색 함수
CREATE OR REPLACE FUNCTION public.search_personas(
  age_min int DEFAULT NULL,
  age_max int DEFAULT NULL,
  gender_filter text DEFAULT NULL,
  location_filter text DEFAULT NULL,
  occupation_filter text DEFAULT NULL,
  education_filter text DEFAULT NULL
)
RETURNS SETOF virtualpeople.personas
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM virtualpeople.personas 
  WHERE 
    (age_min IS NULL OR age >= age_min) AND
    (age_max IS NULL OR age <= age_max) AND
    (gender_filter IS NULL OR gender = gender_filter) AND
    (location_filter IS NULL OR location ILIKE '%' || location_filter || '%') AND
    (occupation_filter IS NULL OR occupation ILIKE '%' || occupation_filter || '%') AND
    (education_filter IS NULL OR education = education_filter)
  ORDER BY created_at DESC;
$$;

-- 3. 단일 persona 조회 함수
CREATE OR REPLACE FUNCTION public.get_persona_by_id(persona_id text)
RETURNS SETOF virtualpeople.personas
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM virtualpeople.personas WHERE id = persona_id;
$$;

-- 4. 삽입 함수
CREATE OR REPLACE FUNCTION public.insert_persona(persona_data jsonb)
RETURNS virtualpeople.personas
LANGUAGE sql
SECURITY DEFINER
AS $$
  INSERT INTO virtualpeople.personas (
    id, name, age, gender, location, occupation, education, 
    income_bracket, marital_status, personality_traits, values, 
    lifestyle_attributes, interests, media_consumption, 
    shopping_habit, social_relations
  )
  VALUES (
    (persona_data->>'id')::text,
    (persona_data->>'name')::text,
    (persona_data->>'age')::int,
    (persona_data->>'gender')::text,
    (persona_data->>'location')::text,
    (persona_data->>'occupation')::text,
    (persona_data->>'education')::text,
    (persona_data->>'income_bracket')::text,
    (persona_data->>'marital_status')::text,
    (persona_data->'personality_traits')::jsonb,
    (persona_data->'values')::jsonb,
    (persona_data->'lifestyle_attributes')::jsonb,
    (persona_data->'interests')::jsonb,
    (persona_data->>'media_consumption')::text,
    (persona_data->>'shopping_habit')::text,
    (persona_data->'social_relations')::jsonb
  )
  RETURNING *;
$$;

-- 5. 업데이트 함수
CREATE OR REPLACE FUNCTION public.update_persona(persona_id text, persona_data jsonb)
RETURNS virtualpeople.personas
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE virtualpeople.personas SET
    name = COALESCE((persona_data->>'name')::text, name),
    age = COALESCE((persona_data->>'age')::int, age),
    gender = COALESCE((persona_data->>'gender')::text, gender),
    location = COALESCE((persona_data->>'location')::text, location),
    occupation = COALESCE((persona_data->>'occupation')::text, occupation),
    education = COALESCE((persona_data->>'education')::text, education),
    income_bracket = COALESCE((persona_data->>'income_bracket')::text, income_bracket),
    marital_status = COALESCE((persona_data->>'marital_status')::text, marital_status),
    personality_traits = COALESCE((persona_data->'personality_traits')::jsonb, personality_traits),
    values = COALESCE((persona_data->'values')::jsonb, values),
    lifestyle_attributes = COALESCE((persona_data->'lifestyle_attributes')::jsonb, lifestyle_attributes),
    interests = COALESCE((persona_data->'interests')::jsonb, interests),
    media_consumption = COALESCE((persona_data->>'media_consumption')::text, media_consumption),
    shopping_habit = COALESCE((persona_data->>'shopping_habit')::text, shopping_habit),
    social_relations = COALESCE((persona_data->'social_relations')::jsonb, social_relations),
    version = COALESCE((persona_data->>'version')::int, version)
  WHERE id = persona_id
  RETURNING *;
$$;

-- 6. 삭제 함수
CREATE OR REPLACE FUNCTION public.delete_persona(persona_id text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  DELETE FROM virtualpeople.personas WHERE id = persona_id;
  SELECT FOUND;
$$;

-- 7. 통계 함수
CREATE OR REPLACE FUNCTION public.get_personas_stats()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT jsonb_build_object(
    'total_count', COUNT(*),
    'avg_age', ROUND(AVG(age), 1),
    'gender_distribution', (
      SELECT jsonb_object_agg(gender, cnt)
      FROM (
        SELECT gender, COUNT(*) as cnt 
        FROM virtualpeople.personas 
        GROUP BY gender
      ) gender_stats
    ),
    'location_distribution', (
      SELECT jsonb_object_agg(location, cnt)
      FROM (
        SELECT location, COUNT(*) as cnt 
        FROM virtualpeople.personas 
        GROUP BY location 
        ORDER BY cnt DESC 
        LIMIT 10
      ) location_stats
    )
  )
  FROM virtualpeople.personas;
$$;

-- 8. 모든 데이터 삭제 함수
CREATE OR REPLACE FUNCTION public.delete_all_personas()
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
AS $$
  DELETE FROM virtualpeople.personas;
  SELECT ROW_COUNT();
$$;

-- 함수 권한 부여
GRANT EXECUTE ON FUNCTION public.get_personas(int, int) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.search_personas(int, int, text, text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_persona_by_id(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.insert_persona(jsonb) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_persona(text, jsonb) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.delete_persona(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_personas_stats() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.delete_all_personas() TO anon, authenticated;

-- =============================================================================
-- 방법 3: 업데이트된 뷰 방식 (INSTEAD OF 트리거)
-- =============================================================================

-- 기존 뷰 삭제 (있다면)
DROP VIEW IF EXISTS public.virtualpeople_personas_view CASCADE;

-- 업데이트된 뷰 생성
CREATE OR REPLACE VIEW public.virtualpeople_personas_view AS 
SELECT 
    id, name, age, gender, location, occupation, education,
    income_bracket, marital_status, personality_traits, values,
    lifestyle_attributes, interests, media_consumption, shopping_habit,
    social_relations, created_at, version
FROM virtualpeople.personas;

-- INSTEAD OF 트리거 함수
CREATE OR REPLACE FUNCTION public.virtualpeople_personas_view_trigger()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO virtualpeople.personas (
      id, name, age, gender, location, occupation, education,
      income_bracket, marital_status, personality_traits, values,
      lifestyle_attributes, interests, media_consumption, shopping_habit,
      social_relations, version
    ) VALUES (
      NEW.id, NEW.name, NEW.age, NEW.gender, NEW.location, NEW.occupation, NEW.education,
      NEW.income_bracket, NEW.marital_status, NEW.personality_traits, NEW.values,
      NEW.lifestyle_attributes, NEW.interests, NEW.media_consumption, NEW.shopping_habit,
      NEW.social_relations, NEW.version
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE virtualpeople.personas SET
      name = NEW.name,
      age = NEW.age,
      gender = NEW.gender,
      location = NEW.location,
      occupation = NEW.occupation,
      education = NEW.education,
      income_bracket = NEW.income_bracket,
      marital_status = NEW.marital_status,
      personality_traits = NEW.personality_traits,
      values = NEW.values,
      lifestyle_attributes = NEW.lifestyle_attributes,
      interests = NEW.interests,
      media_consumption = NEW.media_consumption,
      shopping_habit = NEW.shopping_habit,
      social_relations = NEW.social_relations,
      version = NEW.version
    WHERE id = OLD.id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM virtualpeople.personas WHERE id = OLD.id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- INSTEAD OF 트리거 생성
CREATE TRIGGER virtualpeople_personas_view_instead_of_trigger
    INSTEAD OF INSERT OR UPDATE OR DELETE ON public.virtualpeople_personas_view
    FOR EACH ROW EXECUTE FUNCTION public.virtualpeople_personas_view_trigger();

-- 뷰 권한 부여
GRANT ALL ON public.virtualpeople_personas_view TO anon, authenticated;

-- =============================================================================
-- 테스트 쿼리
-- =============================================================================

-- 방법 1 테스트 (search_path)
-- SELECT * FROM personas LIMIT 1; -- virtualpeople.personas가 검색 경로에 있으면 작동

-- 방법 2 테스트 (함수)
-- SELECT * FROM public.get_personas(10, 0);
-- SELECT * FROM public.search_personas(20, 30, '남성', NULL, NULL, NULL);

-- 방법 3 테스트 (뷰)
-- SELECT * FROM public.virtualpeople_personas_view LIMIT 1;

-- 통계 확인
-- SELECT * FROM public.get_personas_stats();