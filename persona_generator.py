import random
import json
from datetime import datetime
from timeseries_data import TimeSeriesDataManager
from persona_validator import PersonaValidator

class PersonaGenerator:
    def __init__(self, config=None):
        self.config = config if config else self._load_default_config()
        self.ts_manager = TimeSeriesDataManager()
        self.validator = PersonaValidator()
        self.current_year = 2024  # 기본 생성 연도

    def _load_default_config(self):
        # 한국 인구통계 및 문화적 특성을 반영한 기본 설정 (근사치)
        return {
            "age_distribution": { # 2023년 통계청 인구총조사 기반 근사치
                "0-9": 0.08, "10-19": 0.09, "20-29": 0.13, "30-39": 0.14,
                "40-49": 0.16, "50-59": 0.16, "60-69": 0.12, "70-79": 0.07,
                "80+": 0.05
            },
            "gender_ratio": {"남성": 0.50, "여성": 0.50}, # 거의 1:1
            "regional_distribution": { # 2023년 행정안전부 주민등록인구현황 기반 근사치
                "서울": 0.18, "부산": 0.06, "대구": 0.05, "인천": 0.06, "광주": 0.03,
                "대전": 0.03, "울산": 0.02, "세종": 0.007, "경기": 0.26, "강원": 0.03,
                "충북": 0.03, "충남": 0.04, "전북": 0.03, "전남": 0.03, "경북": 0.05,
                "경남": 0.06, "제주": 0.01
            },
            "occupations": { # 연령 및 교육 수준과 연계
                "학생": ["초등학생", "중학생", "고등학생", "대학생", "대학원생"],
                "직장인": ["사무직", "기술직", "영업/마케팅", "전문직(의사, 변호사 등)", "공무원", "교사"],
                "자영업자": ["소상공인", "프리랜서", "중소기업 대표"],
                "주부": ["전업주부", "육아휴직중"],
                "무직": ["취업준비생", "은퇴자", "기타 무직"],
                "농림어업": ["농업", "어업", "임업"]
            },
            "education_levels": { # 연령과 연계된 분포
                "없음": 0.05, "초졸": 0.05, "중졸": 0.10, "고졸": 0.30, "대졸": 0.40, "대학원졸": 0.10
            },
            "income_brackets": { # 소득 5분위 기준 근사치
                "하위 20%": 0.20, "20-40%": 0.20, "40-60%": 0.20, "60-80%": 0.20, "상위 20%": 0.20
            },
            "marital_statuses": {"미혼": 0.40, "기혼": 0.50, "이혼": 0.07, "사별": 0.03},
            "personality_traits": { # Big Five 모델 기반 (더 상세한 특성)
                "개방성": ["호기심 많음", "상상력 풍부", "예술적", "틀에 얽매이지 않음", "전통적", "실용적"],
                "성실성": ["계획적", "조직적", "책임감 강함", "끈기 있음", "충동적", "게으름", "무책임"],
                "외향성": ["사교적", "활동적", "낙천적", "주도적", "내향적", "조용함", "수동적"],
                "친화성": ["협조적", "친절함", "공감 능력 뛰어남", "이타적", "비판적", "냉담함", "경쟁적"],
                "신경증": ["침착함", "안정적", "스트레스에 강함", "불안정", "예민함", "변덕스러움", "우울함"]
            },
            "values": ["가족", "성공", "안정", "자유", "사회적 기여", "개인 성장", "명예", "재물", "건강", "환경 보호"],
            "interests": ["여행", "요리", "운동", "독서", "영화/드라마", "음악", "게임", "패션/뷰티", "IT/기술", "재테크", "봉사활동", "반려동물"],
            "lifestyle_attributes": ["미니멀리스트", "욜로족", "워라밸 중시", "건강 중시", "친환경 지향", "디지털 노마드", "가성비 추구", "자기계발 중시", "소확행 추구"],
            "korean_cultural_nuances": { # 한국적 특성 반영 (더 상세하게)
                "세대별 가치관": {
                    "Z세대": ["디지털 네이티브", "개인주의", "다양성 존중", "공정성 중시", "가치소비"], # 10대 후반 ~ 20대 중반
                    "밀레니얼": ["워라밸", "경험 중시", "사회적 가치", "개성 표현", "재테크 관심"], # 20대 중반 ~ 40대 초반
                    "X세대": ["개성", "합리성", "자기계발", "가족과 개인의 균형", "문화적 개방성"], # 40대 초반 ~ 50대 중반
                    "베이비부머": ["가족 중시", "희생", "공동체 의식", "안정 추구", "전통 존중"] # 50대 중반 이상
                },
                "지역별 특색": { # 주요 도시 위주로 상세화
                    "서울": ["트렌디", "바쁜", "문화생활", "경쟁적", "다양한 인구"],
                    "부산": ["활기찬", "개방적", "해양문화", "정 많음", "사투리 사용"],
                    "대구": ["보수적", "열정적", "패션", "자부심 강함"],
                    "인천": ["실용적", "국제적", "교통 요충지"],
                    "경기": ["실용적", "교외생활", "다양한 인구", "서울 접근성 중시"],
                    "제주": ["자연친화적", "여유로운", "관광", "이주민 증가"]
                },
                "사회적 관계": ["선후배 관계 중시", "체면 중시", "정 문화", "집단주의적 성향", "가족 중심 문화"],
                "소비_행태": ["온라인 쇼핑 선호", "배달 앱 사용 빈번", "해외 직구", "중고거래 활발"],
                "미디어_소비": ["유튜브/OTT 시청", "뉴스 앱/포털 이용", "SNS 활발", "웹툰/웹소설 소비"]
            }
        }

    def _weighted_choice(self, choices_dict):
        items = list(choices_dict.keys())
        weights = list(choices_dict.values())
        return random.choices(items, weights=weights, k=1)[0]

    def _generate_demographics(self, constraints):
        # 연도별 인구통계 데이터 가져오기
        year = constraints.get("year", self.current_year)
        year_data = self.ts_manager.get_year_data(year)
        
        # 연도별 연령 분포 적용
        age_distribution = year_data.get("demographic_trends", {}).get("age_distribution", self.config["age_distribution"])
        regional_distribution = year_data.get("demographic_trends", {}).get("regional_distribution", self.config["regional_distribution"])
        
        # 연령 생성 (constraints의 age_range를 우선 적용)
        if "age_range" in constraints:
            age_min, age_max = constraints["age_range"]
            age = random.randint(age_min, age_max)
        else:
            age_group = self._weighted_choice(age_distribution)
            age_min, age_max = map(int, age_group.split('-')) if '-' in age_group else (int(age_group.replace('+', '')), 100)
            age = random.randint(age_min, age_max)
        
        gender = constraints.get("gender", self._weighted_choice(self.config["gender_ratio"]))
        location = constraints.get("location", self._weighted_choice(regional_distribution))
        
        # 교육 수준 (연령에 따라 가중치 조정)
        education_weights = self.config["education_levels"].copy()
        if age <= 6: education_weights = {"없음": 1.0}
        elif age <= 12: education_weights = {"없음": 0.6, "초졸": 0.4}
        elif age <= 15: education_weights = {"초졸": 0.8, "중졸": 0.2}
        elif age <= 18: education_weights = {"중졸": 0.7, "고졸": 0.3}
        elif age < 23: education_weights = {"고졸": 0.6, "대졸": 0.4}
        education = constraints.get("education", self._weighted_choice(education_weights))

        # 직업 (연령에 따라 구체적으로 조정)
        if age <= 6:
            occupation = "기타 무직"
        elif age <= 12:
            occupation = "초등학생"
        elif age <= 15:
            occupation = "중학생"
        elif age <= 18:
            occupation = "고등학생"
        elif age < 20:
            occupation = random.choice(["대학생", "고등학생"])  # 18-19세는 대학생 또는 고등학생
        elif age >= 60:
            occupation_category = random.choices(["무직", "자영업자", "직장인", "농림어업"], weights=[0.5, 0.2, 0.2, 0.1], k=1)[0]
            occupation = random.choice(self.config["occupations"].get(occupation_category, ["기타 직업"]))
        else:
            occupation_category = random.choices(["직장인", "자영업자", "무직", "주부", "농림어업"], weights=[0.6, 0.15, 0.1, 0.1, 0.05], k=1)[0]
            occupation = random.choice(self.config["occupations"].get(occupation_category, ["기타 직업"]))
        
        # 소득 분위 (연령 및 직업에 따라 조정)
        income_bracket = constraints.get("income_bracket")
        if not income_bracket:
            if age <= 18:
                income_bracket = "하위 20%"  # 0~18세는 하위 20%로 고정
            else:
                income_bracket = self._weighted_choice(self.config["income_brackets"])
        
        marital_status = constraints.get("marital_status", self._weighted_choice(self.config["marital_statuses"]))

        return {
            "age": age,
            "gender": gender,
            "location": location,
            "occupation": occupation,
            "education": education,
            "income_bracket": income_bracket,
            "marital_status": marital_status
        }

    def _generate_psychological_attributes(self):
        personality_traits = {
            trait: random.choice(self.config["personality_traits"][trait])
            for trait in self.config["personality_traits"]
        }
        values = random.sample(self.config["values"], k=random.randint(2, 5))
        lifestyle_attributes = random.sample(self.config["lifestyle_attributes"], k=random.randint(1, 3))
        return {
            "personality_traits": personality_traits,
            "values": values,
            "lifestyle_attributes": lifestyle_attributes
        }

    def _generate_behavioral_patterns(self):
        interests = random.sample(self.config["interests"], k=random.randint(3, 6))
        media_consumption = random.choice(self.config["korean_cultural_nuances"].get("미디어_소비", ["기타 미디어"]))
        shopping_habit = random.choice(self.config["korean_cultural_nuances"].get("소비_행태", ["기타 소비"]))
        
        return {
            "interests": interests,
            "media_consumption": media_consumption,
            "shopping_habit": shopping_habit
        }

    def _apply_cultural_nuances(self, persona):
        # 세대별 가치관 적용
        age = persona["demographics"].get("age")
        if age is not None:
            if 10 <= age <= 24: # Z세대
                persona["psychological_attributes"].setdefault("values", []).extend(self.config["korean_cultural_nuances"].get("세대별 가치관", {}).get("Z세대", []))
            elif 25 <= age <= 44: # 밀레니얼
                persona["psychological_attributes"].setdefault("values", []).extend(self.config["korean_cultural_nuances"].get("세대별 가치관", {}).get("밀레니얼", []))
            elif 45 <= age <= 59: # X세대
                persona["psychological_attributes"].setdefault("values", []).extend(self.config["korean_cultural_nuances"].get("세대별 가치관", {}).get("X세대", []))
            elif age >= 60: # 베이비부머
                persona["psychological_attributes"].setdefault("values", []).extend(self.config["korean_cultural_nuances"].get("세대별 가치관", {}).get("베이비부머", []))
        
        # 지역별 특색 적용
        location = persona["demographics"].get("location")
        if location:
            persona["psychological_attributes"].setdefault("lifestyle_attributes", []).extend(self.config["korean_cultural_nuances"].get("지역별 특색", {}).get(location, []))
        
        # 한국 특유의 사회적 관계 반영
        persona["social_relations"] = random.sample(self.config["korean_cultural_nuances"].get("사회적 관계", []), k=random.randint(1, 3))
        
        # 중복 제거
        persona["psychological_attributes"]["values"] = list(set(persona["psychological_attributes"].get("values", [])))
        persona["psychological_attributes"]["lifestyle_attributes"] = list(set(persona["psychological_attributes"].get("lifestyle_attributes", [])))
        return persona

    def generate_persona(self, constraints={}, max_retries=10):
        """
        유효한 페르소나를 생성합니다. 유효성 검증에 실패한 경우 재시도합니다.
        
        Args:
            constraints (dict): 생성 제약 조건
            max_retries (int): 최대 재시도 횟수
            
        Returns:
            dict: 검증된 유효한 페르소나 데이터
        """
        for attempt in range(max_retries):
            persona = {}
            persona["demographics"] = self._generate_demographics(constraints)
            persona["psychological_attributes"] = self._generate_psychological_attributes()
            persona["behavioral_patterns"] = self._generate_behavioral_patterns()
            
            persona = self._apply_cultural_nuances(persona)

            persona["id"] = str(random.randint(100000000, 999999999)) # 9자리 ID
            persona["name"] = f"가상인물_{persona['id']}" # 임시 이름
            persona["created_at"] = datetime.now().isoformat()
            persona["version"] = 1

            # 유효성 검증
            validation_result = self.validator.validate_persona(persona)
            
            if validation_result["is_valid"]:
                # 경고가 있으면 로그에 기록하지만 페르소나는 반환
                if validation_result["warnings"]:
                    print(f"페르소나 {persona['id']} 경고: {validation_result['warnings']}")
                return persona
            else:
                # 검증 실패 시 재시도
                print(f"페르소나 생성 시도 {attempt + 1}/{max_retries} 실패: {validation_result['errors']}")
        
        # 최대 재시도 횟수 초과 시 예외 발생
        raise ValueError(f"유효한 페르소나 생성에 {max_retries}번 시도했지만 실패했습니다. 제약 조건을 확인해주세요.")

    def generate_persona_without_validation(self, constraints={}):
        """
        기존의 검증 없는 페르소나 생성 메서드 (호환성을 위해 유지)
        """
        persona = {}
        persona["demographics"] = self._generate_demographics(constraints)
        persona["psychological_attributes"] = self._generate_psychological_attributes()
        persona["behavioral_patterns"] = self._generate_behavioral_patterns()
        
        persona = self._apply_cultural_nuances(persona)

        persona["id"] = str(random.randint(100000000, 999999999)) # 9자리 ID
        persona["name"] = f"가상인물_{persona['id']}" # 임시 이름
        persona["created_at"] = datetime.now().isoformat()
        persona["version"] = 1

        return persona

    def generate_personas(self, count=1, demographics_constraints=None, diversity_constraints=None):
        """
        여러 페르소나를 생성합니다. 유효성 검증 통계를 포함합니다.
        
        Args:
            count (int): 생성할 페르소나 수
            demographics_constraints (dict): 인구통계학적 제약 조건
            diversity_constraints (dict): 다양성 제약 조건
            
        Returns:
            dict: 생성된 페르소나 목록과 생성 통계
        """
        personas = []
        validation_stats = {
            "total_attempts": 0,
            "successful_generations": 0,
            "validation_failures": 0,
            "warnings_count": 0
        }
        
        for i in range(count):
            try:
                # diversity_constraints는 현재 단순화된 모델에서는 직접적으로 사용되지 않음.
                # 향후 LLM 연동 시, LLM 프롬프트에 제약 조건으로 활용 가능.
                persona = self.generate_persona(demographics_constraints if demographics_constraints else {})
                personas.append(persona)
                validation_stats["successful_generations"] += 1
                
                # 경고가 있는지 확인
                validation_result = self.validator.validate_persona(persona)
                if validation_result["warnings"]:
                    validation_stats["warnings_count"] += 1
                    
            except ValueError as e:
                validation_stats["validation_failures"] += 1
                print(f"페르소나 {i+1} 생성 실패: {str(e)}")
                continue
        
        validation_stats["total_attempts"] = validation_stats["successful_generations"] + validation_stats["validation_failures"]
        
        return {
            "personas": personas,
            "generation_stats": validation_stats,
            "success_rate": validation_stats["successful_generations"] / max(validation_stats["total_attempts"], 1) * 100
        }

if __name__ == "__main__":
    generator = PersonaGenerator()
    
    print("--- 단일 페르소나 생성 (한국 인구통계 및 문화 반영) ---")
    single_persona = generator.generate_persona()
    print(json.dumps(single_persona, indent=2, ensure_ascii=False))

    print("\n--- 특정 조건의 페르소나 생성 (30대 서울 거주 남성 직장인) ---")
    constrained_persona = generator.generate_persona({
        "age_range": [30, 39],
        "gender": "남성",
        "location": "서울",
        "occupation_category": "직장인"
    })
    print(json.dumps(constrained_persona, indent=2, ensure_ascii=False))

    print("\n--- 여러 페르소나 생성 (5명) ---")
    multiple_personas = generator.generate_personas(count=5)
    for p in multiple_personas:
        print(json.dumps(p, indent=2, ensure_ascii=False))
        print("-" * 30)

    print("""\
--- 5천만 페르소나 생성 (개념적 설명) ---
5천만 페르소나를 생성하는 것은 현재 SQLite 및 단일 프로세스 환경에서는 매우 오랜 시간이 소요되며, 시스템 리소스 제약으로 인해 실제 실행이 어렵습니다.
이를 위해서는 다음과 같은 확장성 전략이 필요합니다:
1. 분산 데이터베이스 시스템 (예: PostgreSQL, Cassandra) 사용
2. 배치 처리 및 비동기 처리 도입
3. 클라우드 기반의 분산 컴퓨팅 환경 (예: AWS Lambda, Kubernetes) 활용
4. LLM 연동 시, LLM API 호출 비용 및 속도 고려
현재 구현은 한국 인구통계 및 문화적 특성을 반영한 페르소나 생성 로직에 중점을 둡니다.
""")
