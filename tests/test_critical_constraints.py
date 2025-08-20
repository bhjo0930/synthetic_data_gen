#!/usr/bin/env python3
"""
치명적 제약조건 위반 테스트
==========================

13세 초졸 기혼 대학생 같은 절대 불가능한 조합 방지 테스트
"""

import unittest
import sys
from pathlib import Path

# 프로젝트 루트 디렉토리를 Python 경로에 추가
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from src.hierarchical_persona_generator import HierarchicalPersonaGenerator

class TestCriticalConstraints(unittest.TestCase):
    """치명적 제약조건 테스트"""
    
    def setUp(self):
        """테스트 설정"""
        self.generator = HierarchicalPersonaGenerator()
    
    def test_impossible_age_education_combinations(self):
        """불가능한 연령-교육 조합 테스트"""
        impossible_cases = [
            {"age": 13, "education": "고등학교", "description": "13세 고등학교 (중학교만 가능)"},
            {"age": 15, "education": "대학교", "description": "15세 대학교"},
            {"age": 16, "education": "석사", "description": "16세 석사"},
            {"age": 20, "education": "박사", "description": "20세 박사"},
        ]
        
        for case in impossible_cases:
            with self.subTest(case=case["description"]):
                # 강제로 불가능한 페르소나 생성 시도
                invalid_persona = {
                    'age': case["age"],
                    'gender': '남성',
                    'education': case["education"],
                    'marital_status': '미혼',
                    'occupation': '학생',
                    'income': 0,
                    'location': '서울특별시'
                }
                
                is_valid, errors = self.generator.validate_persona(invalid_persona)
                self.assertFalse(is_valid, f"{case['description']}는 무효해야 함")
                self.assertGreater(len(errors), 0, f"{case['description']}에 대한 오류가 있어야 함")
    
    def test_impossible_age_marital_combinations(self):
        """불가능한 연령-혼인 조합 테스트"""
        impossible_cases = [
            {"age": 13, "marital": "기혼", "description": "13세 기혼"},
            {"age": 15, "marital": "이혼", "description": "15세 이혼"},
            {"age": 16, "marital": "사별", "description": "16세 사별"},
        ]
        
        for case in impossible_cases:
            with self.subTest(case=case["description"]):
                invalid_persona = {
                    'age': case["age"],
                    'gender': '여성',
                    'education': '중학교',
                    'marital_status': case["marital"],
                    'occupation': '학생',
                    'income': 0,
                    'location': '부산광역시'
                }
                
                is_valid, errors = self.generator.validate_persona(invalid_persona)
                self.assertFalse(is_valid, f"{case['description']}는 무효해야 함")
                self.assertGreater(len(errors), 0)
    
    def test_impossible_age_occupation_combinations(self):
        """불가능한 연령-직업 조합 테스트"""
        impossible_cases = [
            {"age": 12, "occupation": "의사", "description": "12세 의사"},
            {"age": 14, "occupation": "변호사", "description": "14세 변호사"},
            {"age": 16, "occupation": "교수", "description": "16세 교수"},
            {"age": 13, "occupation": "대학생", "description": "13세 대학생"},
        ]
        
        for case in impossible_cases:
            with self.subTest(case=case["description"]):
                invalid_persona = {
                    'age': case["age"],
                    'gender': '남성',
                    'education': '중학교',
                    'marital_status': '미혼',
                    'occupation': case["occupation"],
                    'income': 0,
                    'location': '서울특별시'
                }
                
                is_valid, errors = self.generator.validate_persona(invalid_persona)
                self.assertFalse(is_valid, f"{case['description']}는 무효해야 함")
                self.assertGreater(len(errors), 0)
    
    def test_reported_error_case(self):
        """보고된 오류 케이스 직접 테스트"""
        # 실제 보고된 문제: 13세 초졸 기혼 대학생 (수정된 버전)
        problematic_persona = {
            'age': 13,
            'gender': '남성',
            'education': '중학교',  # 올바른 EducationLevel.MIDDLE_SCHOOL.value
            'marital_status': '기혼',
            'occupation': '대학생',
            'income': 2500000,  # 40-60% 소득대
            'location': '경기도'
        }
        
        is_valid, errors = self.generator.validate_persona(problematic_persona)
        
        # 무효해야 함
        self.assertFalse(is_valid, "13세 초졸 기혼 대학생은 절대 유효하면 안됨")
        
        # 예상되는 오류들
        expected_error_patterns = [
            "13세는 중학교 교육 수준만 가능",  # 교육 오류
            "13세 미성년자는 혼인 상태를 가질 수 없습니다",  # 혼인 오류  
            "13세는 학생이어야 합니다",  # 직업 오류
            "13세의 소득",  # 소득 오류
        ]
        
        error_text = " ".join(errors)
        found_errors = []
        
        for pattern in expected_error_patterns:
            if any(pattern in error for error in errors):
                found_errors.append(pattern)
        
        self.assertGreater(len(found_errors), 2, 
                          f"최소 3개 이상의 오류가 검출되어야 함. 발견된 오류: {errors}")
    
    def test_generation_prevents_impossible_combinations(self):
        """생성 과정에서 불가능한 조합 방지 테스트"""
        # 100개의 페르소나 생성하여 모두 유효한지 확인
        personas = self.generator.generate_personas(100)
        
        critical_violations = []
        
        for i, persona in enumerate(personas):
            age = persona['age']
            education = persona['education']
            marital_status = persona['marital_status']
            occupation = persona['occupation']
            
            # 치명적 위반 검사
            violations = []
            
            # 13세인데 중학교가 아닌 교육 수준
            if age <= 14 and education != '중학교':
                violations.append(f"ID {i}: {age}세인데 교육수준이 {education}")
            
            if age < 18 and marital_status != '미혼':
                violations.append(f"ID {i}: {age}세 미성년자인데 {marital_status}")
            
            if age <= 14 and occupation != '학생':
                violations.append(f"ID {i}: {age}세인데 직업이 {occupation}")
            
            if age <= 19 and occupation not in ['학생', '아르바이트']:
                violations.append(f"ID {i}: {age}세인데 직업이 {occupation}")
            
            if violations:
                critical_violations.extend(violations)
        
        # 치명적 위반이 전혀 없어야 함
        self.assertEqual(len(critical_violations), 0, 
                        f"치명적 제약조건 위반이 발견됨: {critical_violations[:5]}")
    
    def test_age_distribution_realistic(self):
        """연령 분포가 현실적인지 테스트"""
        personas = self.generator.generate_personas(200)
        ages = [p['age'] for p in personas]
        
        # 18세 미만은 매우 적어야 함 (성인 중심)
        minors = [age for age in ages if age < 18]
        minor_ratio = len(minors) / len(ages)
        
        self.assertLess(minor_ratio, 0.1, 
                       f"미성년자 비율이 너무 높음: {minor_ratio:.2%} (10% 미만이어야 함)")
        
        # 평균 연령이 합리적이어야 함
        import numpy as np
        mean_age = np.mean(ages)
        self.assertGreater(mean_age, 25, "평균 연령이 너무 낮음")
        self.assertLess(mean_age, 50, "평균 연령이 너무 높음")
    
    def test_education_occupation_consistency(self):
        """교육-직업 일관성 대규모 테스트"""
        personas = self.generator.generate_personas(100)
        
        inconsistencies = []
        
        for i, persona in enumerate(personas):
            education = persona['education']
            occupation = persona['occupation']
            
            # 치명적 불일치 검사
            if occupation == '의사' and education in ['중학교', '고등학교']:
                inconsistencies.append(f"ID {i}: {education} 학력으로 의사")
            
            if occupation == '교수' and education not in ['석사', '박사']:
                inconsistencies.append(f"ID {i}: {education} 학력으로 교수")
            
            if occupation == '변호사' and education in ['중학교', '고등학교']:
                inconsistencies.append(f"ID {i}: {education} 학력으로 변호사")
        
        self.assertEqual(len(inconsistencies), 0,
                        f"교육-직업 불일치 발견: {inconsistencies[:3]}")
    
    def test_fallback_persona_safety(self):
        """fallback 페르소나의 안전성 테스트"""
        # fallback 페르소나를 여러 번 생성하여 모두 안전한지 확인
        fallback_personas = []
        
        for _ in range(20):
            fallback = self.generator._generate_fallback_persona()
            fallback_personas.append(fallback)
        
        for i, persona in enumerate(fallback_personas):
            is_valid, errors = self.generator.validate_persona(persona)
            
            self.assertTrue(is_valid, 
                           f"Fallback 페르소나 {i}가 무효함: {errors}")
            
            # 연령이 안전한 범위인지 확인
            self.assertGreaterEqual(persona['age'], 25)
            self.assertLessEqual(persona['age'], 45)


if __name__ == '__main__':
    unittest.main(verbosity=2)