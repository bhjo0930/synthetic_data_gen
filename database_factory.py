"""
데이터베이스 팩토리
환경변수에 따라 SQLite 또는 Supabase 데이터베이스를 선택적으로 사용
"""

import os
import logging
from dotenv import load_dotenv
from database_interface import DatabaseInterface
from database import SQLiteDatabase
from supabase_database import SupabaseDatabase

# .env 파일 로드
load_dotenv()

class DatabaseFactory:
    """데이터베이스 인스턴스를 생성하는 팩토리 클래스"""
    
    @staticmethod
    def create_database() -> DatabaseInterface:
        """
        환경변수에 따라 적절한 데이터베이스 인스턴스를 생성합니다.
        
        환경변수:
        - DATABASE_TYPE: 'supabase' 또는 'sqlite' (기본값: sqlite)
        - SUPABASE_URL: Supabase 프로젝트 URL (supabase 선택시 필요)
        - SUPABASE_ANON_KEY: Supabase 익명 키 (supabase 선택시 필요)
        
        Returns:
            DatabaseInterface: 데이터베이스 인스턴스
        """
        logger = logging.getLogger(__name__)
        
        db_type = os.getenv('DATABASE_TYPE', 'sqlite').lower()
        
        try:
            if db_type == 'supabase':
                logger.info("Supabase 데이터베이스를 초기화합니다.")
                return SupabaseDatabase()
            else:
                logger.info("SQLite 데이터베이스를 초기화합니다.")
                return SQLiteDatabase()
                
        except Exception as e:
            logger.error(f"{db_type} 데이터베이스 초기화 실패: {e}")
            logger.info("SQLite 데이터베이스로 폴백합니다.")
            return SQLiteDatabase()
    
    @staticmethod
    def get_database_info() -> dict:
        """
        현재 데이터베이스 설정 정보를 반환합니다.
        
        Returns:
            dict: 데이터베이스 설정 정보
        """
        db_type = os.getenv('DATABASE_TYPE', 'sqlite').lower()
        
        info = {
            'selected_type': db_type,
            'available_types': ['sqlite', 'supabase'],
            'configuration': {}
        }
        
        if db_type == 'supabase':
            info['configuration'] = {
                'url_configured': bool(os.getenv('SUPABASE_URL')),
                'key_configured': bool(os.getenv('SUPABASE_ANON_KEY')),
                'schema': 'virtualpeople'
            }
        else:
            info['configuration'] = {
                'db_path': os.getenv('PORT') and '/tmp/personas.db' or 'personas.db'
            }
        
        return info


def get_database() -> DatabaseInterface:
    """전역 데이터베이스 인스턴스를 반환하는 편의 함수"""
    return DatabaseFactory.create_database()


# 호환성을 위한 별칭
PersonaDatabase = SQLiteDatabase