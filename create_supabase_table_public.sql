-- public 스키마에 virtualpeople_personas 테이블 생성
CREATE TABLE IF NOT EXISTS public.virtualpeople_personas (
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
CREATE INDEX IF NOT EXISTS idx_virtualpeople_personas_age ON public.virtualpeople_personas(age);
CREATE INDEX IF NOT EXISTS idx_virtualpeople_personas_gender ON public.virtualpeople_personas(gender);
CREATE INDEX IF NOT EXISTS idx_virtualpeople_personas_location ON public.virtualpeople_personas(location);
CREATE INDEX IF NOT EXISTS idx_virtualpeople_personas_occupation ON public.virtualpeople_personas(occupation);
CREATE INDEX IF NOT EXISTS idx_virtualpeople_personas_education ON public.virtualpeople_personas(education);
CREATE INDEX IF NOT EXISTS idx_virtualpeople_personas_created_at ON public.virtualpeople_personas(created_at);

-- 테이블 생성 확인
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'virtualpeople_personas' 
  AND table_schema = 'public'
ORDER BY ordinal_position;