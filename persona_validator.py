"""
페르소나 데이터 유효성 검증 모듈
상식에 어긋나는 데이터 조합을 필터링하여 데이터 품질을 보장합니다.
"""

import logging

class PersonaValidator:
    """페르소나 데이터의 논리적 일관성을 검증하는 클래스"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.validation_rules = self._load_validation_rules()
    
    def _load_validation_rules(self):
        """검증 규칙을 정의합니다."""
        return {
            # 나이 범위 제한
            "age_limits": {
                "min_age": 0,
                "max_age": 99  # 100세 이상 제외
            },
            
            # 연령-직업 관계 규칙
            "age_occupation_rules": {
                "기타 무직": {"min_age": 0, "max_age": 6},
                "무직": {"min_age": 0, "max_age": 6},
                "초등학생": {"min_age": 7, "max_age": 12},
                "중학생": {"min_age": 13, "max_age": 15},
                "고등학생": {"min_age": 16, "max_age": 18},
                "대학생": {"min_age": 18, "max_age": 28},
                "대학원생": {"min_age": 22, "max_age": 35},
                "취업준비생": {"min_age": 18, "max_age": 35},
                "은퇴자": {"min_age": 55, "max_age": 99},
                "전업주부": {"min_age": 20, "max_age": 80},
                "육아휴직중": {"min_age": 20, "max_age": 45}
            },
            
            # 연령-교육수준 관계 규칙
            "age_education_rules": {
                "없음": {"min_age": 0, "max_age": 12},
                "초졸": {"min_age": 13, "max_age": 99},
                "중졸": {"min_age": 16, "max_age": 99},
                "고졸": {"min_age": 18, "max_age": 99},
                "대졸": {"min_age": 22, "max_age": 99},
                "대학원졸": {"min_age": 24, "max_age": 99}
            },
            
            # 연령-소득 관계 규칙
            "age_income_rules": {
                0: {"max_age": 6, "income_brackets": ["하위 20%"]},
                7: {"min_age": 7, "max_age": 12, "income_brackets": ["하위 20%"]},
                13: {"min_age": 13, "max_age": 15, "income_brackets": ["하위 20%"]},
                16: {"min_age": 16, "max_age": 18, "income_brackets": ["하위 20%"]}
            },
            
            # 연령-결혼상태 관계 규칙
            "age_marital_rules": {
                "미혼": {"min_age": 0, "max_age": 99},
                "기혼": {"min_age": 18, "max_age": 99},  # 법적 결혼 가능 연령
                "이혼": {"min_age": 20, "max_age": 99},  # 실질적 이혼 가능 연령
                "사별": {"min_age": 25, "max_age": 99}   # 현실적 사별 발생 연령
            },
            
            # 교육수준-직업 논리적 관계 (선택적 규칙)
            "education_occupation_preferences": {
                "의사": ["대졸", "대학원졸"],
                "변호사": ["대졸", "대학원졸"],
                "교사": ["대졸", "대학원졸"],
                "교수": ["대학원졸"],
                "연구원": ["대졸", "대학원졸"]
            }
        }
    
    def validate_persona(self, persona):
        """
        페르소나 데이터의 유효성을 검증합니다.
        
        Args:
            persona (dict): 검증할 페르소나 데이터
            
        Returns:
            dict: {"is_valid": bool, "errors": list, "warnings": list}
        """
        validation_result = {
            "is_valid": True,
            "errors": [],
            "warnings": []
        }
        
        try:
            demographics = persona.get("demographics", {})
            age = demographics.get("age")
            occupation = demographics.get("occupation", "")
            education = demographics.get("education", "")
            marital_status = demographics.get("marital_status", "")
            income_bracket = demographics.get("income_bracket", "")
            
            # 1. 나이 범위 검증
            if not self._validate_age_range(age):
                validation_result["is_valid"] = False
                validation_result["errors"].append(f"나이가 유효 범위를 벗어남: {age}세")
            
            # 2. 연령-직업 관계 검증
            age_occupation_error = self._validate_age_occupation(age, occupation)
            if age_occupation_error:
                validation_result["is_valid"] = False
                validation_result["errors"].append(age_occupation_error)
            
            # 3. 연령-교육수준 관계 검증
            age_education_error = self._validate_age_education(age, education)
            if age_education_error:
                validation_result["is_valid"] = False
                validation_result["errors"].append(age_education_error)
            
            # 4. 연령-결혼상태 관계 검증
            age_marital_error = self._validate_age_marital_status(age, marital_status)
            if age_marital_error:
                validation_result["is_valid"] = False
                validation_result["errors"].append(age_marital_error)
            
            # 5. 연령-소득 관계 검증 (0~18세는 하위 20%만 허용)
            age_income_error = self._validate_age_income(age, income_bracket)
            if age_income_error:
                validation_result["is_valid"] = False
                validation_result["errors"].append(age_income_error)
            
            # 6. 교육수준-직업 논리성 검증 (경고만, 필터링하지 않음)
            education_occupation_warning = self._validate_education_occupation(education, occupation)
            if education_occupation_warning:
                validation_result["warnings"].append(education_occupation_warning)
            
        except Exception as e:
            validation_result["is_valid"] = False
            validation_result["errors"].append(f"검증 중 오류 발생: {str(e)}")
            self.logger.error(f"Validation error: {e}")
        
        return validation_result
    
    def _validate_age_range(self, age):
        """나이가 유효한 범위 내에 있는지 검증"""
        if age is None:
            return False
        
        limits = self.validation_rules["age_limits"]
        return limits["min_age"] <= age <= limits["max_age"]
    
    def _validate_age_occupation(self, age, occupation):
        """연령과 직업의 논리적 일관성을 검증"""
        if age is None or not occupation:
            return None
        
        rules = self.validation_rules["age_occupation_rules"]
        
        for occupation_key in rules:
            if occupation_key in occupation:
                rule = rules[occupation_key]
                if not (rule["min_age"] <= age <= rule["max_age"]):
                    return f"연령-직업 불일치: {age}세 {occupation} (적정연령: {rule['min_age']}-{rule['max_age']}세)"
        
        return None
    
    def _validate_age_education(self, age, education):
        """연령과 교육수준의 논리적 일관성을 검증"""
        if age is None or not education:
            return None
        
        rules = self.validation_rules["age_education_rules"]
        
        if education in rules:
            rule = rules[education]
            if not (rule["min_age"] <= age <= rule["max_age"]):
                return f"연령-교육수준 불일치: {age}세 {education} (최소연령: {rule['min_age']}세)"
        
        return None
    
    def _validate_age_marital_status(self, age, marital_status):
        """연령과 결혼상태의 논리적 일관성을 검증"""
        if age is None or not marital_status:
            return None
        
        rules = self.validation_rules["age_marital_rules"]
        
        if marital_status in rules:
            rule = rules[marital_status]
            if not (rule["min_age"] <= age <= rule["max_age"]):
                return f"연령-결혼상태 불일치: {age}세 {marital_status} (최소연령: {rule['min_age']}세)"
        
        return None
    
    def _validate_age_income(self, age, income_bracket):
        """연령과 소득의 논리적 일관성을 검증"""
        if age is None or not income_bracket:
            return None
        
        # 0~18세는 하위 20%만 허용
        if age <= 18:
            if income_bracket != "하위 20%":
                return f"연령-소득 불일치: {age}세는 하위 20% 소득만 가능 (현재: {income_bracket})"
        
        return None
    
    def _validate_education_occupation(self, education, occupation):
        """교육수준과 직업의 논리적 일관성을 검증 (경고용)"""
        if not education or not occupation:
            return None
        
        preferences = self.validation_rules["education_occupation_preferences"]
        
        for occupation_key, required_educations in preferences.items():
            if occupation_key in occupation:
                if education not in required_educations:
                    return f"교육수준-직업 권장사항 불일치: {occupation}은 보통 {'/'.join(required_educations)} 수준을 요구함 (현재: {education})"
        
        return None
    
    def get_validation_statistics(self):
        """검증 규칙에 대한 통계 정보를 반환"""
        rules = self.validation_rules
        return {
            "age_range": f"{rules['age_limits']['min_age']}-{rules['age_limits']['max_age']}세",
            "occupation_rules_count": len(rules["age_occupation_rules"]),
            "education_rules_count": len(rules["age_education_rules"]),
            "marital_rules_count": len(rules["age_marital_rules"]),
            "professional_jobs_tracked": len(rules["education_occupation_preferences"])
        }

if __name__ == "__main__":
    # 테스트 예시
    validator = PersonaValidator()
    
    # 테스트 케이스 1: 정상적인 페르소나
    valid_persona = {
        "demographics": {
            "age": 25,
            "occupation": "사무직",
            "education": "대졸",
            "marital_status": "미혼"
        }
    }
    
    # 테스트 케이스 2: 문제가 있는 페르소나
    invalid_persona = {
        "demographics": {
            "age": 105,  # 100세 이상
            "occupation": "초등학생",  # 나이와 맞지 않음
            "education": "대졸",  # 나이와 맞지 않음
            "marital_status": "이혼"  # 나이와 맞지 않음
        }
    }
    
    print("=== 정상 페르소나 검증 ===")
    result1 = validator.validate_persona(valid_persona)
    print(f"유효함: {result1['is_valid']}")
    print(f"오류: {result1['errors']}")
    print(f"경고: {result1['warnings']}")
    
    print("\n=== 문제 페르소나 검증 ===")
    result2 = validator.validate_persona(invalid_persona)
    print(f"유효함: {result2['is_valid']}")
    print(f"오류: {result2['errors']}")
    print(f"경고: {result2['warnings']}")
    
    print("\n=== 검증 규칙 통계 ===")
    stats = validator.get_validation_statistics()
    for key, value in stats.items():
        print(f"{key}: {value}")