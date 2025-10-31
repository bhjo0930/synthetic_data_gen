"""
Supabase 데이터베이스 커넥터
virtualpeople 스키마를 사용하여 Supabase와 연동
"""

import os
import json
import logging
from typing import List, Dict, Optional, Any
from datetime import datetime
from supabase import create_client, Client
from database_interface import DatabaseInterface

class SupabaseDatabase(DatabaseInterface):
    """Supabase를 사용한 데이터베이스 구현"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        
        # Supabase 환경변수
        self.url = os.getenv('SUPABASE_URL')
        self.key = os.getenv('SUPABASE_ANON_KEY')
        
        if not self.url or not self.key:
            raise ValueError("SUPABASE_URL과 SUPABASE_ANON_KEY 환경변수가 필요합니다")
        
        try:
            self.supabase: Client = create_client(self.url, self.key)
            self.table_name = 'personas'  # 테이블명
            self.schema = 'virtualpeople'  # virtualpeople 스키마 사용
            self._ensure_table_exists()
        except Exception as e:
            self.logger.error(f"Supabase 연결 실패: {e}")
            raise
    
    def _ensure_table_exists(self):
        """테이블 존재 여부 확인 및 생성"""
        try:
            # 테스트 쿼리로 테이블 존재 여부 확인
            self.supabase.schema(self.schema).table(self.table_name).select("id").limit(1).execute()
        except Exception as e:
            self.logger.warning(f"테이블이 존재하지 않거나 접근할 수 없습니다: {e}")
            self.logger.info("Supabase 대시보드에서 다음 SQL을 실행하여 테이블을 생성하세요:")
            self.logger.info(self._get_create_table_sql())
    
    def _get_create_table_sql(self) -> str:
        """테이블 생성 SQL을 반환합니다"""
        return f"""
-- virtualpeople.personas 테이블을 위한 public 스키마 뷰 생성

-- public 스키마에 뷰 생성 (PostgREST API 접근을 위해)
CREATE OR REPLACE VIEW public.virtualpeople_personas_view AS 
SELECT * FROM virtualpeople.personas;

-- 뷰에 대한 RLS (Row Level Security) 정책 설정
ALTER VIEW public.virtualpeople_personas_view OWNER TO postgres;
GRANT ALL ON public.virtualpeople_personas_view TO anon;
GRANT ALL ON public.virtualpeople_personas_view TO authenticated;

-- 뷰를 통한 INSERT/UPDATE/DELETE 활성화
CREATE OR REPLACE RULE virtualpeople_personas_view_insert AS
ON INSERT TO public.virtualpeople_personas_view
DO INSTEAD INSERT INTO virtualpeople.personas VALUES (NEW.*);

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

CREATE OR REPLACE RULE virtualpeople_personas_view_delete AS
ON DELETE TO public.virtualpeople_personas_view
DO INSTEAD DELETE FROM virtualpeople.personas WHERE id = OLD.id;

-- 만약 virtualpeople.personas 테이블이 없다면 생성
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

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_virtualpeople_personas_age ON virtualpeople.personas(age);
CREATE INDEX IF NOT EXISTS idx_virtualpeople_personas_gender ON virtualpeople.personas(gender);
CREATE INDEX IF NOT EXISTS idx_virtualpeople_personas_location ON virtualpeople.personas(location);
CREATE INDEX IF NOT EXISTS idx_virtualpeople_personas_occupation ON virtualpeople.personas(occupation);
CREATE INDEX IF NOT EXISTS idx_virtualpeople_personas_education ON virtualpeople.personas(education);
CREATE INDEX IF NOT EXISTS idx_virtualpeople_personas_created_at ON virtualpeople.personas(created_at);
"""
    
    def _flatten_persona(self, persona: Dict[str, Any]) -> Dict[str, Any]:
        """페르소나 데이터를 Supabase 테이블 구조에 맞게 평면화합니다"""
        demographics = persona.get('demographics', {})
        psychological = persona.get('psychological_attributes', {})
        behavioral = persona.get('behavioral_patterns', {})
        
        return {
            'id': persona.get('id'),
            'name': persona.get('name'),
            'age': demographics.get('age'),
            'gender': demographics.get('gender'),
            'location': demographics.get('location'),
            'occupation': demographics.get('occupation'),
            'education': demographics.get('education'),
            'income_bracket': demographics.get('income_bracket'),
            'marital_status': demographics.get('marital_status'),
            'personality_traits': json.dumps(psychological.get('personality_traits', {}), ensure_ascii=False),
            'values': json.dumps(psychological.get('values', []), ensure_ascii=False),
            'lifestyle_attributes': json.dumps(psychological.get('lifestyle_attributes', []), ensure_ascii=False),
            'interests': json.dumps(behavioral.get('interests', []), ensure_ascii=False),
            'media_consumption': behavioral.get('media_consumption'),
            'shopping_habit': behavioral.get('shopping_habit'),
            'social_relations': json.dumps(persona.get('social_relations', []), ensure_ascii=False),
            'created_at': persona.get('created_at'),
            'version': persona.get('version', 1)
        }
    
    def _reconstruct_persona(self, row: Dict[str, Any]) -> Dict[str, Any]:
        """Supabase 행 데이터를 원래 페르소나 구조로 복원합니다"""
        try:
            return {
                'id': row['id'],
                'name': row['name'],
                'demographics': {
                    'age': row['age'],
                    'gender': row['gender'],
                    'location': row['location'],
                    'occupation': row['occupation'],
                    'education': row['education'],
                    'income_bracket': row['income_bracket'],
                    'marital_status': row['marital_status']
                },
                'psychological_attributes': {
                    'personality_traits': json.loads(row['personality_traits']) if row['personality_traits'] else {},
                    'values': json.loads(row['values']) if row['values'] else [],
                    'lifestyle_attributes': json.loads(row['lifestyle_attributes']) if row['lifestyle_attributes'] else []
                },
                'behavioral_patterns': {
                    'interests': json.loads(row['interests']) if row['interests'] else [],
                    'media_consumption': row['media_consumption'],
                    'shopping_habit': row['shopping_habit']
                },
                'social_relations': json.loads(row['social_relations']) if row['social_relations'] else [],
                'created_at': row['created_at'],
                'version': row['version']
            }
        except (json.JSONDecodeError, KeyError) as e:
            self.logger.error(f"페르소나 데이터 복원 실패: {e}")
            return row  # 실패시 원본 반환
    
    def insert_persona(self, persona: Dict[str, Any]) -> bool:
        """페르소나 데이터를 삽입합니다 (RPC 함수 사용)"""
        try:
            # RPC 함수로 삽입
            result = self.supabase.rpc('create_persona', {
                'persona_name': persona.get('name', ''),
                'persona_demographics': json.dumps(persona.get('demographics', {})),
                'persona_psychological': json.dumps(persona.get('psychological_attributes', {})),
                'persona_behavioral': json.dumps(persona.get('behavioral_patterns', {})),
                'persona_social': json.dumps(persona.get('social_relations', []))
            }).execute()
            
            return result.data is not None and len(result.data) > 0
        except Exception as e:
            self.logger.error(f"페르소나 삽입 실패: {e}")
            # 폴백: 직접 스키마 접근
            return self._fallback_insert(persona)
    
    def _fallback_insert(self, persona: Dict[str, Any]) -> bool:
        """폴백: 직접 스키마 접근으로 삽입"""
        try:
            self.logger.warning("RPC 삽입 실패, 직접 스키마 접근 시도")
            flat_persona = self._flatten_persona(persona)
            result = self.supabase.schema(self.schema).table(self.table_name).insert(flat_persona).execute()
            return len(result.data) > 0
        except Exception as e:
            self.logger.error(f"폴백 삽입도 실패: {e}")
            return False
    
    def get_persona(self, persona_id: str) -> Optional[Dict[str, Any]]:
        """특정 ID의 페르소나를 조회합니다"""
        try:
            result = self.supabase.schema(self.schema).table(self.table_name).select("*").eq("id", persona_id).execute()
            if result.data:
                return self._reconstruct_persona(result.data[0])
            return None
        except Exception as e:
            self.logger.error(f"페르소나 조회 실패: {e}")
            return None
    
    def search_personas(self, filters: Dict[str, Any] = None, limit: int = 100, offset: int = 0) -> List[Dict[str, Any]]:
        """필터 조건에 맞는 페르소나들을 검색합니다 (RPC 함수 사용)"""
        try:
            # 기본적으로 모든 페르소나 가져오기 (RPC 함수 사용)
            if not filters or len([f for f in filters.values() if f is not None]) == 0:
                # 필터가 없으면 get_personas RPC 함수 사용
                result = self.supabase.rpc('get_personas', {
                    'limit_count': limit,
                    'offset_count': offset
                }).execute()
            else:
                # 필터가 있으면 search_personas RPC 함수 사용
                # 필터 파라미터 준비
                search_params = {}
                for key, value in filters.items():
                    if value is not None:
                        search_params[key] = value
                
                result = self.supabase.rpc('search_personas', {
                    'search_params': json.dumps(search_params)
                }).execute()
            
            # RPC 함수는 이미 올바른 구조를 반환하므로 직접 반환
            return result.data if result.data else []
            
        except Exception as e:
            self.logger.error(f"페르소나 검색 실패: {e}")
            # RPC 함수 실패 시 폴백: 직접 스키마 접근 시도
            return self._fallback_search(filters, limit, offset)
    
    def _fallback_search(self, filters: Dict[str, Any] = None, limit: int = 100, offset: int = 0) -> List[Dict[str, Any]]:
        """폴백: 직접 스키마 접근 시도"""
        try:
            self.logger.warning("RPC 함수 실패, 직접 스키마 접근 시도")
            query = self.supabase.schema(self.schema).table(self.table_name).select("*")
            
            if filters:
                for key, value in filters.items():
                    if value is not None:
                        if key.endswith('_min'):
                            field = key.replace('_min', '')
                            query = query.gte(field, value)
                        elif key.endswith('_max'):
                            field = key.replace('_max', '')
                            query = query.lte(field, value)
                        else:
                            query = query.eq(key, value)
            
            result = query.range(offset, offset + limit - 1).order('created_at', desc=True).execute()
            return [self._reconstruct_persona(row) for row in result.data]
        except Exception as e:
            self.logger.error(f"폴백 검색도 실패: {e}")
            return []
    
    def update_persona(self, persona_id: str, updates: Dict[str, Any]) -> bool:
        """페르소나 정보를 업데이트합니다"""
        try:
            # 업데이트할 데이터 준비 (중첩 구조 평면화)
            flat_updates = {}
            if 'demographics' in updates:
                flat_updates.update(updates['demographics'])
            if 'psychological_attributes' in updates:
                psych = updates['psychological_attributes']
                if 'personality_traits' in psych:
                    flat_updates['personality_traits'] = json.dumps(psych['personality_traits'], ensure_ascii=False)
                if 'values' in psych:
                    flat_updates['values'] = json.dumps(psych['values'], ensure_ascii=False)
                if 'lifestyle_attributes' in psych:
                    flat_updates['lifestyle_attributes'] = json.dumps(psych['lifestyle_attributes'], ensure_ascii=False)
            if 'behavioral_patterns' in updates:
                behav = updates['behavioral_patterns']
                if 'interests' in behav:
                    flat_updates['interests'] = json.dumps(behav['interests'], ensure_ascii=False)
                flat_updates.update({k: v for k, v in behav.items() if k != 'interests'})
            
            # 직접 필드 업데이트
            for key in ['name', 'version']:
                if key in updates:
                    flat_updates[key] = updates[key]
            
            if flat_updates:
                result = self.supabase.schema(self.schema).table(self.table_name).update(flat_updates).eq("id", persona_id).execute()
                return len(result.data) > 0
            return False
        except Exception as e:
            self.logger.error(f"페르소나 업데이트 실패: {e}")
            return False
    
    def delete_persona(self, persona_id: str) -> bool:
        """특정 페르소나를 삭제합니다"""
        try:
            result = self.supabase.schema(self.schema).table(self.table_name).delete().eq("id", persona_id).execute()
            return len(result.data) > 0
        except Exception as e:
            self.logger.error(f"페르소나 삭제 실패: {e}")
            return False
    
    def delete_all_personas(self) -> bool:
        """모든 페르소나를 삭제합니다 (RPC 함수 사용)"""
        try:
            # RPC 함수로 전체 삭제
            result = self.supabase.rpc('delete_all_personas').execute()
            deleted_count = result.data if result.data else 0
            self.logger.info(f"{deleted_count}개 페르소나 삭제 완료")
            return True
        except Exception as e:
            self.logger.error(f"전체 페르소나 삭제 실패: {e}")
            # 폴백: 직접 스키마 접근
            return self._fallback_delete_all()
    
    def _fallback_delete_all(self) -> bool:
        """폴백: 직접 스키마 접근으로 전체 삭제"""
        try:
            self.logger.warning("RPC 삭제 실패, 직접 스키마 접근 시도")
            while True:
                personas = self.supabase.schema(self.schema).table(self.table_name).select("id").limit(1000).execute()
                if not personas.data:
                    break
                
                ids = [p['id'] for p in personas.data]
                self.supabase.schema(self.schema).table(self.table_name).delete().in_("id", ids).execute()
            
            return True
        except Exception as e:
            self.logger.error(f"폴백 삭제도 실패: {e}")
            return False
    
    def get_total_count(self, filters: Dict[str, Any] = None) -> int:
        """필터 조건에 맞는 총 페르소나 수를 반환합니다"""
        try:
            query = self.supabase.schema(self.schema).table(self.table_name).select("id", count="exact")
            
            if filters:
                for key, value in filters.items():
                    if value is not None:
                        if key.endswith('_min'):
                            field = key.replace('_min', '')
                            query = query.gte(field, value)
                        elif key.endswith('_max'):
                            field = key.replace('_max', '')
                            query = query.lte(field, value)
                        else:
                            query = query.eq(key, value)
            
            result = query.execute()
            return result.count or 0
        except Exception as e:
            self.logger.error(f"총 개수 조회 실패: {e}")
            return 0
    
    def get_statistics(self) -> Dict[str, Any]:
        """데이터베이스 통계 정보를 반환합니다"""
        try:
            total_count = self.get_total_count()
            
            # 연령대별 통계
            age_stats = self.supabase.schema(self.schema).table(self.table_name).select("age").execute()
            ages = [row['age'] for row in age_stats.data if row['age'] is not None]
            
            # 성별 통계
            gender_stats = self.supabase.schema(self.schema).table(self.table_name).select("gender").execute()
            genders = [row['gender'] for row in gender_stats.data if row['gender']]
            
            return {
                'total_personas': total_count,
                'age_stats': {
                    'min': min(ages) if ages else 0,
                    'max': max(ages) if ages else 0,
                    'avg': sum(ages) / len(ages) if ages else 0
                },
                'gender_distribution': {
                    gender: genders.count(gender) for gender in set(genders)
                },
                'database_type': 'supabase',
                'schema': self.schema
            }
        except Exception as e:
            self.logger.error(f"통계 조회 실패: {e}")
            return {'total_personas': 0, 'database_type': 'supabase', 'error': str(e)}
    
    def health_check(self) -> bool:
        """데이터베이스 연결 상태를 확인합니다"""
        try:
            self.supabase.schema(self.schema).table(self.table_name).select("id").limit(1).execute()
            return True
        except Exception as e:
            self.logger.error(f"Supabase 헬스체크 실패: {e}")
            return False