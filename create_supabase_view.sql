-- Supabase virtualpeople.personas 테이블을 위한 public 스키마 뷰 생성
-- PostgREST API는 public 스키마만 접근 가능하므로 뷰로 우회

-- 1. public 스키마에 뷰 생성
CREATE OR REPLACE VIEW public.virtualpeople_personas_view AS 
SELECT * FROM virtualpeople.personas;

-- 2. 뷰에 대한 권한 설정
ALTER VIEW public.virtualpeople_personas_view OWNER TO postgres;
GRANT ALL ON public.virtualpeople_personas_view TO anon;
GRANT ALL ON public.virtualpeople_personas_view TO authenticated;

-- 3. 뷰를 통한 INSERT 활성화
CREATE OR REPLACE RULE virtualpeople_personas_view_insert AS
ON INSERT TO public.virtualpeople_personas_view
DO INSTEAD INSERT INTO virtualpeople.personas VALUES (NEW.*);

-- 4. 뷰를 통한 UPDATE 활성화
CREATE OR REPLACE RULE virtualpeople_personas_view_update AS
ON UPDATE TO public.virtualpeople_personas_view
DO INSTEAD UPDATE virtualpeople.personas SET
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

-- 5. 뷰를 통한 DELETE 활성화
CREATE OR REPLACE RULE virtualpeople_personas_view_delete AS
ON DELETE TO public.virtualpeople_personas_view
DO INSTEAD DELETE FROM virtualpeople.personas WHERE id = OLD.id;

-- 6. 뷰 생성 확인
SELECT 
    schemaname, 
    viewname, 
    viewowner,
    definition
FROM pg_views 
WHERE viewname = 'virtualpeople_personas_view';

-- 7. 뷰를 통한 테스트 쿼리
SELECT COUNT(*) as total_personas FROM public.virtualpeople_personas_view;