-- Supabase RPC 함수: virtualpeople 스키마 접근용
-- 이 SQL을 Supabase 웹 인터페이스의 SQL Editor에서 실행하세요.

-- =============================================================================
-- 1. 페르소나 조회 RPC 함수
-- =============================================================================

CREATE OR REPLACE FUNCTION public.get_personas(
    limit_count INT DEFAULT 100,
    offset_count INT DEFAULT 0
)
RETURNS TABLE(
    id TEXT,
    name TEXT,
    demographics JSONB,
    psychological_attributes JSONB,
    behavioral_patterns JSONB,
    social_relations JSONB,
    created_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT 
        p.id,
        p.name,
        -- 플랫 구조를 중첩 구조로 변환
        jsonb_build_object(
            'age', p.age,
            'gender', p.gender,
            'location', p.location,
            'occupation', p.occupation,
            'education', p.education,
            'income_bracket', p.income_bracket,
            'marital_status', p.marital_status
        ) as demographics,
        jsonb_build_object(
            'personality_traits', p.personality_traits,
            'values', p.values,
            'lifestyle_attributes', p.lifestyle_attributes
        ) as psychological_attributes,
        jsonb_build_object(
            'interests', p.interests,
            'media_consumption', p.media_consumption,
            'shopping_habit', p.shopping_habit
        ) as behavioral_patterns,
        p.social_relations,
        p.created_at
    FROM virtualpeople.personas p
    ORDER BY p.created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
$$;

-- =============================================================================
-- 2. 페르소나 검색 RPC 함수 (필터링 지원)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.search_personas(
    search_params JSONB DEFAULT '{}'::JSONB
)
RETURNS TABLE(
    id TEXT,
    name TEXT,
    demographics JSONB,
    psychological_attributes JSONB,
    behavioral_patterns JSONB,
    social_relations JSONB,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    query_text TEXT;
    where_conditions TEXT[] := '{}';
    param_value TEXT;
BEGIN
    -- 기본 쿼리 (플랫 구조를 중첩 구조로 변환)
    query_text := 'SELECT 
        id,
        name,
        jsonb_build_object(
            ''age'', age,
            ''gender'', gender,
            ''location'', location,
            ''occupation'', occupation,
            ''education'', education,
            ''income_bracket'', income_bracket,
            ''marital_status'', marital_status
        ) as demographics,
        jsonb_build_object(
            ''personality_traits'', personality_traits,
            ''values'', values,
            ''lifestyle_attributes'', lifestyle_attributes
        ) as psychological_attributes,
        jsonb_build_object(
            ''interests'', interests,
            ''media_consumption'', media_consumption,
            ''shopping_habit'', shopping_habit
        ) as behavioral_patterns,
        social_relations,
        created_at
    FROM virtualpeople.personas';
    
    -- 조건 추가 (실제 컨럼명 사용)
    IF search_params ? 'age_min' THEN
        where_conditions := array_append(where_conditions, 
            format('age >= %s', search_params->>'age_min'));
    END IF;
    
    IF search_params ? 'age_max' THEN
        where_conditions := array_append(where_conditions, 
            format('age <= %s', search_params->>'age_max'));
    END IF;
    
    IF search_params ? 'gender' THEN
        where_conditions := array_append(where_conditions, 
            format('gender = %L', search_params->>'gender'));
    END IF;
    
    IF search_params ? 'location' THEN
        param_value := search_params->>'location';
        where_conditions := array_append(where_conditions, 
            format('location ILIKE %L', '%' || param_value || '%'));
    END IF;
    
    -- WHERE 절 추가
    IF array_length(where_conditions, 1) > 0 THEN
        query_text := query_text || ' WHERE ' || array_to_string(where_conditions, ' AND ');
    END IF;
    
    -- 정렬 및 제한
    query_text := query_text || ' ORDER BY created_at DESC LIMIT 1000';
    
    -- 동적 쿼리 실행
    RETURN QUERY EXECUTE query_text;
END;
$$;

-- =============================================================================
-- 3. 페르소나 생성 RPC 함수
-- =============================================================================

CREATE OR REPLACE FUNCTION public.create_persona(
    persona_name TEXT,
    persona_demographics JSONB,
    persona_psychological JSONB,
    persona_behavioral JSONB,
    persona_social JSONB
)
RETURNS TABLE(
    id TEXT,
    name TEXT,
    demographics JSONB,
    psychological_attributes JSONB,
    behavioral_patterns JSONB,
    social_relations JSONB,
    created_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    WITH inserted AS (
        INSERT INTO virtualpeople.personas (
            name,
            age,
            gender,
            location,
            occupation,
            education,
            income_bracket,
            marital_status,
            personality_traits,
            values,
            lifestyle_attributes,
            interests,
            media_consumption,
            shopping_habit,
            social_relations
        ) VALUES (
            persona_name,
            (persona_demographics->>'age')::integer,
            persona_demographics->>'gender',
            persona_demographics->>'location',
            persona_demographics->>'occupation',
            persona_demographics->>'education',
            persona_demographics->>'income_bracket',
            persona_demographics->>'marital_status',
            persona_psychological->'personality_traits',
            persona_psychological->'values',
            persona_psychological->'lifestyle_attributes',
            persona_behavioral->'interests',
            persona_behavioral->>'media_consumption',
            persona_behavioral->>'shopping_habit',
            persona_social
        )
        RETURNING *
    )
    SELECT 
        id,
        name,
        jsonb_build_object(
            'age', age,
            'gender', gender,
            'location', location,
            'occupation', occupation,
            'education', education,
            'income_bracket', income_bracket,
            'marital_status', marital_status
        ) as demographics,
        jsonb_build_object(
            'personality_traits', personality_traits,
            'values', values,
            'lifestyle_attributes', lifestyle_attributes
        ) as psychological_attributes,
        jsonb_build_object(
            'interests', interests,
            'media_consumption', media_consumption,
            'shopping_habit', shopping_habit
        ) as behavioral_patterns,
        social_relations,
        created_at
    FROM inserted;
$$;

-- =============================================================================
-- 4. 페르소나 삭제 RPC 함수
-- =============================================================================

CREATE OR REPLACE FUNCTION public.delete_all_personas()
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
AS $$
    WITH deleted AS (
        DELETE FROM virtualpeople.personas
        RETURNING id
    )
    SELECT COUNT(*)::INTEGER FROM deleted;
$$;

-- =============================================================================
-- 5. 페르소나 통계 RPC 함수
-- =============================================================================

CREATE OR REPLACE FUNCTION public.get_personas_stats()
RETURNS TABLE(
    total_count BIGINT,
    avg_age NUMERIC,
    gender_stats JSONB,
    location_stats JSONB
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT 
        COUNT(*) as total_count,
        AVG((demographics->>'age')::int) as avg_age,
        jsonb_object_agg(
            demographics->>'gender', 
            count
        ) as gender_stats,
        jsonb_object_agg(
            demographics->>'location',
            location_count
        ) as location_stats
    FROM (
        SELECT 
            demographics,
            COUNT(*) as count
        FROM virtualpeople.personas 
        GROUP BY demographics->>'gender'
    ) gender_counts,
    (
        SELECT 
            demographics->>'location' as location,
            COUNT(*) as location_count
        FROM virtualpeople.personas 
        GROUP BY demographics->>'location'
    ) location_counts;
$$;

-- =============================================================================
-- 6. 권한 설정
-- =============================================================================

-- RPC 함수들에 대한 실행 권한 부여
GRANT EXECUTE ON FUNCTION public.get_personas(INT, INT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.search_personas(JSONB) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_persona(TEXT, JSONB, JSONB, JSONB, JSONB) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.delete_all_personas() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_personas_stats() TO anon, authenticated;

-- =============================================================================
-- 7. 테스트 쿼리
-- =============================================================================

-- 함수 테스트
SELECT * FROM public.get_personas(5, 0);
SELECT * FROM public.search_personas('{"gender": "여성"}'::jsonb);

-- =============================================================================
-- 완료 메시지
-- =============================================================================
DO $$
BEGIN
    RAISE NOTICE '✅ virtualpeople 스키마용 RPC 함수 생성 완료';
    RAISE NOTICE '📋 다음 함수들을 사용할 수 있습니다:';
    RAISE NOTICE '   - public.get_personas(limit, offset)';
    RAISE NOTICE '   - public.search_personas(search_params)';
    RAISE NOTICE '   - public.create_persona(...)';
    RAISE NOTICE '   - public.delete_all_personas()';
    RAISE NOTICE '   - public.get_personas_stats()';
END $$;