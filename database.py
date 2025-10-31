import sqlite3
import json
import os
import logging
from typing import List, Dict, Optional, Any
from datetime import datetime
from database_interface import DatabaseInterface

class SQLiteDatabase(DatabaseInterface):
    def __init__(self, db_path=None):
        self.logger = logging.getLogger(__name__)
        if db_path is None:
            # Cloud Run 환경에서는 /tmp 디렉토리 사용, 로컬에서는 현재 디렉토리
            if os.environ.get('PORT'):  # Cloud Run 환경 감지
                db_path = '/tmp/personas.db'
            else:
                db_path = 'personas.db'
        self.db_path = db_path
        self._create_tables()
    
    def _reconstruct_persona_structure(self, row_data: Dict[str, Any]) -> Dict[str, Any]:
        """SQLite 행 데이터를 원래 페르소나 구조로 복원"""
        try:
            return {
                'id': row_data['id'],
                'name': row_data['name'],
                'demographics': {
                    'age': row_data['age'],
                    'gender': row_data['gender'],
                    'location': row_data['location'],
                    'occupation': row_data['occupation'],
                    'education': row_data['education'],
                    'income_bracket': row_data['income_bracket'],
                    'marital_status': row_data['marital_status']
                },
                'psychological_attributes': {
                    'personality_traits': json.loads(row_data['personality_traits']) if row_data['personality_traits'] else {},
                    'values': json.loads(row_data['persona_values']) if row_data['persona_values'] else [],
                    'lifestyle_attributes': json.loads(row_data['lifestyle_attributes']) if row_data['lifestyle_attributes'] else []
                },
                'behavioral_patterns': {
                    'interests': json.loads(row_data['interests']) if row_data['interests'] else [],
                    'media_consumption': row_data['media_consumption'],
                    'shopping_habit': row_data['shopping_habit']
                },
                'social_relations': json.loads(row_data['social_relations']) if row_data['social_relations'] else [],
                'created_at': row_data['created_at'],
                'version': row_data['version']
            }
        except (json.JSONDecodeError, KeyError) as e:
            self.logger.error(f"페르소나 데이터 복원 실패: {e}")
            return row_data  # 실패시 원본 반환

    def _create_tables(self):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # personas 테이블 생성 (스키마 업데이트)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS personas (
                id TEXT PRIMARY KEY,
                name TEXT,
                age INTEGER,
                gender TEXT,
                location TEXT,
                occupation TEXT,
                education TEXT,
                income_bracket TEXT,
                marital_status TEXT,
                personality_traits TEXT, -- JSON 저장
                persona_values TEXT,            -- JSON 저장 (컬럼명 변경)
                interests TEXT,         -- JSON 저장
                lifestyle_attributes TEXT, -- JSON 저장
                media_consumption TEXT,
                shopping_habit TEXT,
                social_relations TEXT,  -- JSON 저장
                created_at TIMESTAMP,
                version INTEGER
            )
        """)
        
        # persona_relationships 테이블 생성
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS persona_relationships (
                persona_id TEXT,
                related_persona_id TEXT,
                relationship_type TEXT,
                similarity_score REAL,
                PRIMARY KEY (persona_id, related_persona_id),
                FOREIGN KEY (persona_id) REFERENCES personas(id),
                FOREIGN KEY (related_persona_id) REFERENCES personas(id)
            )
        """)
        
        conn.commit()
        conn.close()

    def insert_persona(self, persona_data: Dict[str, Any]) -> bool:
        """페르소나 데이터를 삽입합니다"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # JSON 필드는 문자열로 변환하여 저장
            personality_traits_json = json.dumps(persona_data["psychological_attributes"]["personality_traits"], ensure_ascii=False)
            persona_values_json = json.dumps(persona_data["psychological_attributes"]["values"], ensure_ascii=False) # 컬럼명 변경
            interests_json = json.dumps(persona_data["behavioral_patterns"]["interests"], ensure_ascii=False)
            lifestyle_attributes_json = json.dumps(persona_data["psychological_attributes"]["lifestyle_attributes"], ensure_ascii=False)
            social_relations_json = json.dumps(persona_data["social_relations"], ensure_ascii=False) # 위치 변경

            cursor.execute("""
            INSERT INTO personas (
                id, name, age, gender, location, occupation, education, income_bracket, marital_status,
                personality_traits, persona_values, interests, lifestyle_attributes, media_consumption, shopping_habit, social_relations,
                created_at, version
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            persona_data["id"],
            persona_data["name"],
            persona_data["demographics"]["age"],
            persona_data["demographics"]["gender"],
            persona_data["demographics"]["location"],
            persona_data["demographics"]["occupation"],
            persona_data["demographics"]["education"],
            persona_data["demographics"]["income_bracket"],
            persona_data["demographics"]["marital_status"],
            personality_traits_json,
            persona_values_json, # 컬럼명 변경
            interests_json,
            lifestyle_attributes_json,
            persona_data["behavioral_patterns"]["media_consumption"],
            persona_data["behavioral_patterns"]["shopping_habit"],
            social_relations_json,
            persona_data["created_at"],
            persona_data["version"]
            ))
            conn.commit()
            conn.close()
            return True
        except Exception as e:
            self.logger.error(f"페르소나 삽입 실패: {e}")
            return False

    def get_persona(self, persona_id: str) -> Optional[Dict[str, Any]]:
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM personas WHERE id = ?", (persona_id,))
            row = cursor.fetchone()
            
            if row:
                # 튜플을 딕셔너리로 변환하고 JSON 필드를 파싱
                columns = [description[0] for description in cursor.description]
                persona_data = dict(zip(columns, row))
                
                # 페르소나 구조로 복원
                persona = self._reconstruct_persona_structure(persona_data)
                conn.close()
                return persona
            
            conn.close()
            return None
        except Exception as e:
            self.logger.error(f"페르소나 조회 실패: {e}")
            return None

    def search_personas(self, filters: Dict[str, Any] = None, limit: int = 100, offset: int = 0) -> List[Dict[str, Any]]:
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        query = "SELECT * FROM personas WHERE 1=1"
        params = []
        
        if filters:
            if "age_min" in filters:
                query += " AND age >= ?"
                params.append(filters["age_min"])
            if "age_max" in filters:
                query += " AND age <= ?"
                params.append(filters["age_max"])
            if "location" in filters:
                query += " AND location = ?"
                params.append(filters["location"])
            if "gender" in filters:
                query += " AND gender = ?"
                params.append(filters["gender"])
            if "occupation" in filters:
                query += " AND occupation = ?"
                params.append(filters["occupation"])
            if "education" in filters:
                query += " AND education = ?"
                params.append(filters["education"])
            if "income_bracket" in filters:
                query += " AND income_bracket = ?"
                params.append(filters["income_bracket"])
            if "marital_status" in filters:
                query += " AND marital_status = ?"
                params.append(filters["marital_status"])
            if "interests" in filters: # JSON 필드 검색 (LIKE 사용)
                query += " AND interests LIKE ?"
                params.append(f'%"{filters["interests"]}"%')
            if "personality_trait" in filters: # JSON 필드 검색 (LIKE 사용)
                query += " AND personality_traits LIKE ?"
                params.append(f'%"{filters["personality_trait"]}"%')
            if "value" in filters: # JSON 필드 검색 (LIKE 사용)
                query += " AND persona_values LIKE ?"
                params.append(f'%"{filters["value"]}"%')
            if "lifestyle_attribute" in filters: # JSON 필드 검색 (LIKE 사용)
                query += " AND lifestyle_attributes LIKE ?"
                params.append(f'%"{filters["lifestyle_attribute"]}"%')
            if "media_consumption" in filters: # 일반 텍스트 필드 검색 (LIKE 사용)
                query += " AND media_consumption LIKE ?"
                params.append(f'%{filters["media_consumption"]}% ')
            if "shopping_habit" in filters: # 일반 텍스트 필드 검색 (LIKE 사용)
                query += " AND shopping_habit LIKE ?"
                params.append(f'%{filters["shopping_habit"]}% ')
            if "social_relations" in filters: # JSON 필드 검색 (LIKE 사용)
                query += " AND social_relations LIKE ?"
                params.append(f'%"{filters["social_relations"]}"%')

        # LIMIT과 OFFSET 추가
        query += f" ORDER BY created_at DESC LIMIT ? OFFSET ?"
        params.extend([limit, offset])
        
        cursor.execute(query, params)
        rows = cursor.fetchall()
        
        personas = []
        if rows:
            columns = [description[0] for description in cursor.description]
            for row in rows:
                row_data = dict(zip(columns, row))
                persona = self._reconstruct_persona_structure(row_data)
                personas.append(persona)
        
        conn.close()
        return personas

    def delete_all_personas(self):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM personas")
        cursor.execute("DELETE FROM persona_relationships")
        conn.commit()
        conn.close()
        print(f"모든 페르소나 데이터가 {self.db_path}에서 삭제되었습니다.")
        return True
    
    def delete_persona(self, persona_id: str) -> bool:
        """특정 페르소나를 삭제합니다"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute("DELETE FROM personas WHERE id = ?", (persona_id,))
            cursor.execute("DELETE FROM persona_relationships WHERE persona_id = ? OR related_persona_id = ?", (persona_id, persona_id))
            conn.commit()
            success = cursor.rowcount > 0
            conn.close()
            return success
        except Exception as e:
            self.logger.error(f"페르소나 삭제 실패: {e}")
            return False
    
    def get_total_count(self, filters: Dict[str, Any] = None) -> int:
        """필터 조건에 맞는 총 페르소나 수를 반환합니다"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            query = "SELECT COUNT(*) FROM personas WHERE 1=1"
            params = []
            
            if filters:
                for key, value in filters.items():
                    if value is not None:
                        if key.endswith('_min'):
                            field = key.replace('_min', '')
                            query += f" AND {field} >= ?"
                            params.append(value)
                        elif key.endswith('_max'):
                            field = key.replace('_max', '')
                            query += f" AND {field} <= ?"
                            params.append(value)
                        else:
                            query += f" AND {key} = ?"
                            params.append(value)
            
            cursor.execute(query, params)
            count = cursor.fetchone()[0]
            conn.close()
            return count
        except Exception as e:
            self.logger.error(f"총 개수 조회 실패: {e}")
            return 0
    
    def get_statistics(self) -> Dict[str, Any]:
        """데이터베이스 통계 정보를 반환합니다"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # 총 개수
            cursor.execute("SELECT COUNT(*) FROM personas")
            total_count = cursor.fetchone()[0]
            
            # 연령 통계
            cursor.execute("SELECT MIN(age), MAX(age), AVG(age) FROM personas WHERE age IS NOT NULL")
            age_stats = cursor.fetchone()
            
            # 성별 분포
            cursor.execute("SELECT gender, COUNT(*) FROM personas WHERE gender IS NOT NULL GROUP BY gender")
            gender_dist = dict(cursor.fetchall())
            
            conn.close()
            
            return {
                'total_personas': total_count,
                'age_stats': {
                    'min': age_stats[0] or 0,
                    'max': age_stats[1] or 0,
                    'avg': age_stats[2] or 0
                },
                'gender_distribution': gender_dist,
                'database_type': 'sqlite',
                'db_path': self.db_path
            }
        except Exception as e:
            self.logger.error(f"통계 조회 실패: {e}")
            return {'total_personas': 0, 'database_type': 'sqlite', 'error': str(e)}
    
    def health_check(self) -> bool:
        """데이터베이스 연결 상태를 확인합니다"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute("SELECT 1")
            conn.close()
            return True
        except Exception as e:
            self.logger.error(f"SQLite 헬스체크 실패: {e}")
            return False
    
    def update_persona(self, persona_id: str, updates: Dict[str, Any]) -> bool:
        """페르소나 정보를 업데이트합니다"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # 업데이트할 필드 준비
            set_clauses = []
            params = []
            
            # 직접 필드 업데이트
            direct_fields = ['name', 'age', 'gender', 'location', 'occupation', 
                           'education', 'income_bracket', 'marital_status', 
                           'media_consumption', 'shopping_habit', 'version']
            
            for field in direct_fields:
                if field in updates:
                    set_clauses.append(f"{field} = ?")
                    params.append(updates[field])
            
            # 중첩 구조 업데이트
            if 'demographics' in updates:
                for key, value in updates['demographics'].items():
                    if key in direct_fields:
                        set_clauses.append(f"{key} = ?")
                        params.append(value)
            
            if 'psychological_attributes' in updates:
                psych = updates['psychological_attributes']
                if 'personality_traits' in psych:
                    set_clauses.append("personality_traits = ?")
                    params.append(json.dumps(psych['personality_traits'], ensure_ascii=False))
                if 'values' in psych:
                    set_clauses.append("persona_values = ?")
                    params.append(json.dumps(psych['values'], ensure_ascii=False))
                if 'lifestyle_attributes' in psych:
                    set_clauses.append("lifestyle_attributes = ?")
                    params.append(json.dumps(psych['lifestyle_attributes'], ensure_ascii=False))
            
            if 'behavioral_patterns' in updates:
                behav = updates['behavioral_patterns']
                if 'interests' in behav:
                    set_clauses.append("interests = ?")
                    params.append(json.dumps(behav['interests'], ensure_ascii=False))
                for key in ['media_consumption', 'shopping_habit']:
                    if key in behav:
                        set_clauses.append(f"{key} = ?")
                        params.append(behav[key])
            
            if 'social_relations' in updates:
                set_clauses.append("social_relations = ?")
                params.append(json.dumps(updates['social_relations'], ensure_ascii=False))
            
            if set_clauses:
                query = f"UPDATE personas SET {', '.join(set_clauses)} WHERE id = ?"
                params.append(persona_id)
                cursor.execute(query, params)
                conn.commit()
                success = cursor.rowcount > 0
                conn.close()
                return success
            
            conn.close()
            return False
        except Exception as e:
            self.logger.error(f"페르소나 업데이트 실패: {e}")
            return False

if __name__ == "__main__":
    db = PersonaDatabase()
    db.delete_all_personas() # 테스트를 위해 기존 데이터 삭제

    from persona_generator import PersonaGenerator
    generator = PersonaGenerator()

    print("--- 페르소나 생성 및 DB 저장 ---")
    for i in range(3):
        persona = generator.generate_persona()
        db.insert_persona(persona)
        print(f"페르소나 {persona['id']} 저장 완료")

    print("\n--- 특정 페르소나 조회 ---")
    # 첫 번째로 저장된 페르소나 ID 가져오기
    conn = sqlite3.connect(db.db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM personas LIMIT 1")
    first_persona_id = cursor.fetchone()[0]
    conn.close()

    if first_persona_id:
        retrieved_persona = db.get_persona(first_persona_id)
        print(json.dumps(retrieved_persona, indent=2, ensure_ascii=False))

    print("\n--- 페르소나 검색 (30세 이상 서울 거주) ---")
    search_results = db.search_personas(filters={"age_min": 30, "location": "서울"})
    for p in search_results:
        print(json.dumps(p, indent=2, ensure_ascii=False))
        print("-" * 30)
