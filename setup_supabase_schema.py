#!/usr/bin/env python3
"""
Supabase 스키마 및 테이블 설정 스크립트
"""

import os
from dotenv import load_dotenv
from supabase import create_client, Client

def setup_supabase_schema():
    # 환경변수 로드
    load_dotenv()
    
    url = os.getenv('SUPABASE_URL')
    key = os.getenv('SUPABASE_ANON_KEY')
    
    if not url or not key:
        print("❌ SUPABASE_URL 또는 SUPABASE_ANON_KEY가 설정되지 않았습니다.")
        return False
    
    try:
        # Supabase 클라이언트 생성
        supabase = create_client(url, key)
        print("✅ Supabase 클라이언트 연결 성공")
        
        # 스키마 및 테이블 생성 SQL
        schema_sql = """
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
        """
        
        # SQL 실행
        result = supabase.rpc('exec_sql', {'sql': schema_sql}).execute()
        print("✅ 스키마 및 테이블 생성 완료")
        
        # 테이블 존재 확인
        try:
            result = supabase.table('personas').select('id').from_('virtualpeople.personas').limit(1).execute()
            print("✅ virtualpeople.personas 테이블 접근 확인")
        except Exception as e:
            print(f"⚠️  테이블 접근 테스트: {e}")
        
        return True
        
    except Exception as e:
        print(f"❌ 스키마 설정 실패: {e}")
        return False

if __name__ == "__main__":
    print("=== Supabase 스키마 설정 시작 ===")
    success = setup_supabase_schema()
    if success:
        print("✅ 스키마 설정 완료!")
    else:
        print("❌ 스키마 설정 실패!")