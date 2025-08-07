import sqlite3
import json
from datetime import datetime

class PersonaDatabase:
    def __init__(self, db_path='personas.db'):
        self.db_path = db_path
        self._create_tables()

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

    def insert_persona(self, persona_data):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # JSON 필드는 문자열로 변환하여 저장
        personality_traits_json = json.dumps(persona_data["psychological_attributes"]["personality_traits"], ensure_ascii=False)
        persona_values_json = json.dumps(persona_data["psychological_attributes"]["values"], ensure_ascii=False) # 컬럼명 변경
        interests_json = json.dumps(persona_data["behavioral_patterns"]["interests"], ensure_ascii=False)
        lifestyle_attributes_json = json.dumps(persona_data["psychological_attributes"]["lifestyle_attributes"], ensure_ascii=False)
        social_relations_json = json.dumps(persona_data["social_relations"], ensure_ascii=False)

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

    def get_persona(self, persona_id):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM personas WHERE id = ?", (persona_id,))
        row = cursor.fetchone()
        conn.close()
        if row:
            # 튜플을 딕셔너리로 변환하고 JSON 필드를 파싱
            columns = [description[0] for description in cursor.description]
            persona = dict(zip(columns, row))
            persona["personality_traits"] = json.loads(persona["personality_traits"])
            persona["values"] = json.loads(persona["persona_values"]) # 컬럼명 변경
            persona["interests"] = json.loads(persona["interests"])
            persona["lifestyle_attributes"] = json.loads(persona["lifestyle_attributes"])
            persona["social_relations"] = json.loads(persona["social_relations"])
            return persona
        return None

    def search_personas(self, filters=None):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        query = "SELECT * FROM personas WHERE 1=1"
        params = []
        
        if filters:
            for key, value in filters.items():
                if key == "age_min":
                    query += " AND age >= ?"
                    params.append(value)
                elif key == "age_max":
                    query += " AND age <= ?"
                    params.append(value)
                elif key == "location":
                    query += " AND location = ?"
                    params.append(value)
                elif key == "gender":
                    query += " AND gender = ?"
                    params.append(value)
                elif key == "occupation":
                    query += " AND occupation = ?"
                    params.append(value)
                elif key == "interests": # JSON 필드 검색 (LIKE 사용)
                    query += " AND interests LIKE ?"
                    params.append(f"%\"{value}\"%" ) # JSON 배열 내 값 검색
                # TODO: 다른 필터 조건 추가
        
        cursor.execute(query, params)
        rows = cursor.fetchall()
        conn.close()
        
        personas = []
        columns = [description[0] for description in cursor.description]
        for row in rows:
            persona = dict(zip(columns, row))
            # JSON 필드 파싱
            persona["personality_traits"] = json.loads(persona["personality_traits"])
            persona["values"] = json.loads(persona["persona_values"]) # 컬럼명 변경
            persona["interests"] = json.loads(persona["interests"])
            persona["lifestyle_attributes"] = json.loads(persona["lifestyle_attributes"])
            persona["social_relations"] = json.loads(persona["social_relations"])
            personas.append(persona)
        return personas

    def delete_all_personas(self):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM personas")
        cursor.execute("DELETE FROM persona_relationships")
        conn.commit()
        conn.close()
        print(f"모든 페르소나 데이터가 {self.db_path}에서 삭제되었습니다.")

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
