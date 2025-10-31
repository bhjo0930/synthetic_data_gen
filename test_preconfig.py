#!/usr/bin/env python3
"""
Supabase pre_config 설정 테스트 스크립트
"""

import os
from dotenv import load_dotenv
from supabase import create_client

def test_preconfig():
    load_dotenv()
    
    url = os.getenv('SUPABASE_URL')
    key = os.getenv('SUPABASE_ANON_KEY')
    
    print("=== Supabase pre_config 테스트 ===")
    print(f"URL: {url}")
    print(f"Key: {key[:20]}...")
    
    try:
        supabase = create_client(url, key)
        print("✅ Supabase 클라이언트 생성 성공")
        
        # 1. 설정 확인 함수 호출
        print("\n1. PostgREST 설정 확인:")
        try:
            result = supabase.rpc('check_postgrest_config').execute()
            config = result.data
            print(f"   - db_schemas: {config.get('db_schemas')}")
            print(f"   - postgrest 스키마 존재: {config.get('postgrest_schema_exists')}")
            print(f"   - virtualpeople 스키마 존재: {config.get('virtualpeople_schema_exists')}")
            print(f"   - pre_config 함수 존재: {config.get('pre_config_function_exists')}")
            print(f"   - personas 테이블 존재: {config.get('personas_table_exists')}")
        except Exception as e:
            print(f"   ❌ 설정 확인 실패: {e}")
        
        # 2. 스키마 권한 확인
        print("\n2. 스키마 권한 확인:")
        try:
            result = supabase.rpc('check_schema_permissions').execute()
            permissions = result.data
            for perm in permissions:
                print(f"   - {perm['schema_name']}.{perm['grantee_role']}: {perm['privilege_type']}")
        except Exception as e:
            print(f"   ❌ 스키마 권한 확인 실패: {e}")
        
        # 3. virtualpeople.personas 직접 접근 테스트
        print("\n3. virtualpeople.personas 직접 접근 테스트:")
        try:
            result = supabase.schema('virtualpeople').table('personas').select('id').limit(1).execute()
            print(f"   ✅ 직접 접근 성공! 데이터 개수: {len(result.data)}")
        except Exception as e:
            print(f"   ❌ 직접 접근 실패: {e}")
        
        # 4. public 스키마를 통한 접근 테스트 (비교용)
        print("\n4. public 스키마 접근 테스트 (비교):")
        try:
            result = supabase.table('virtualpeople_personas_view').select('id').limit(1).execute()
            print(f"   ✅ 뷰 접근 성공! 데이터 개수: {len(result.data)}")
        except Exception as e:
            print(f"   ❌ 뷰 접근 실패: {e}")
        
        # 5. 데이터베이스 팩토리 테스트
        print("\n5. 데이터베이스 팩토리 테스트:")
        try:
            from database_factory import get_database
            db = get_database()
            health = db.health_check()
            print(f"   데이터베이스 타입: {type(db).__name__}")
            print(f"   헬스체크: {'✅ 정상' if health else '❌ 실패'}")
        except Exception as e:
            print(f"   ❌ 데이터베이스 팩토리 테스트 실패: {e}")
            
    except Exception as e:
        print(f"❌ 전체 테스트 실패: {e}")

if __name__ == "__main__":
    test_preconfig()