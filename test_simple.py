#!/usr/bin/env python3
"""
간단한 Supabase 연결 및 접근 테스트
"""

import os
from dotenv import load_dotenv
from supabase import create_client

def test_simple():
    load_dotenv()
    
    url = os.getenv('SUPABASE_URL')
    key = os.getenv('SUPABASE_ANON_KEY')
    
    print("=== 간단한 Supabase 테스트 ===")
    
    try:
        supabase = create_client(url, key)
        print("✅ Supabase 클라이언트 생성 성공")
        
        # 1. 진단 함수 호출
        print("\n1. 진단 함수 테스트:")
        try:
            result = supabase.rpc('diagnose_supabase').execute()
            print(f"   📋 진단 결과: {result.data}")
        except Exception as e:
            print(f"   ❌ 진단 함수 실패: {e}")
        
        # 2. 임시 뷰 접근 테스트
        print("\n2. 임시 뷰 접근 테스트:")
        try:
            result = supabase.table('personas_temp').select('id').limit(1).execute()
            print(f"   ✅ 임시 뷰 접근 성공! 데이터 개수: {len(result.data)}")
        except Exception as e:
            print(f"   ❌ 임시 뷰 접근 실패: {e}")
        
        # 3. 직접 SQL 실행 테스트
        print("\n3. 직접 SQL 실행 테스트:")
        try:
            # Supabase에서는 직접 SQL 실행이 제한적이므로 RPC 함수 사용
            result = supabase.rpc('diagnose_supabase').execute()  # 이미 위에서 테스트했지만 재확인
            print(f"   ✅ RPC 함수 호출 성공")
        except Exception as e:
            print(f"   ❌ RPC 함수 호출 실패: {e}")
        
        # 4. pre_config 함수 호출 테스트
        print("\n4. pre_config 함수 호출 테스트:")
        try:
            result = supabase.rpc('pre_config').execute()
            print(f"   ✅ pre_config 함수 호출 성공")
        except Exception as e:
            print(f"   ❌ pre_config 함수 호출 실패: {e}")
        
        # 5. virtualpeople 스키마 접근 재시도
        print("\n5. virtualpeople 스키마 접근 재시도:")
        try:
            result = supabase.schema('virtualpeople').table('personas').select('id').limit(1).execute()
            print(f"   ✅ virtualpeople 스키마 접근 성공! 데이터 개수: {len(result.data)}")
        except Exception as e:
            print(f"   ❌ virtualpeople 스키마 접근 실패: {e}")
            print(f"      (이는 PostgREST 재시작이 필요할 수 있습니다)")
        
    except Exception as e:
        print(f"❌ 전체 테스트 실패: {e}")

if __name__ == "__main__":
    test_simple()