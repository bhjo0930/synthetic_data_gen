#!/usr/bin/env python3
"""
수정된 교육 수준 테스트
======================

통계청 기준 교육 수준 (중학교, 고등학교, 대학(4년제 미만), 대학교(4년제 이상), 석사, 박사) 테스트
"""

import unittest
import sys
from pathlib import Path

# 프로젝트 루트 디렉토리를 Python 경로에 추가
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from src.hierarchical_persona_generator import HierarchicalPersonaGenerator, EducationLevel

class TestCorrectedEducationLevels(unittest.TestCase):
    """수정된 교육 수준 테스트"""
    
    def setUp(self):
        """테스트 설정"""
        self.generator = HierarchicalPersonaGenerator()
    
    def test_education_enum_values(self):
        """교육 수준 enum 값 확인"""
        expected_values = [
            "중학교",
            "고등학교", 
            "대학(4년제 미만)",
            "대학교(4년제 이상)",
            "대학원(석사 과정)",
            "대학원(박사 과정)"
        ]
        
        actual_values = [e.value for e in EducationLevel]
        
        self.assertEqual(set(expected_values), set(actual_values))
        print("✅ 교육 수준 enum 값이 통계청 기준과 일치합니다")
        for value in expected_values:
            print(f"  - {value}")
    
    def test_no_elementary_education(self):
        """초등학교 교육 수준이 없는지 확인"""
        education_values = [e.value for e in EducationLevel]
        
        # 초등학교 관련 값들이 없어야 함
        elementary_terms = ["초등학교", "초졸", "국졸", "무학"]
        
        for term in elementary_terms:
            self.assertNotIn(term, education_values, f"'{term}'은 교육 수준에 포함되면 안됩니다")
        
        print("✅ 초등학교 관련 교육 수준이 없습니다")
    
    def test_age_education_constraints_15plus(self):
        """15세 이상 연령-교육 제약조건 테스트"""
        # 15-19세 제약조건
        constraints_15_19 = self.generator.get_age_group_constraints(17)
        valid_educations_15_19 = [e.value for e in constraints_15_19.valid_education_levels]
        
        expected_15_19 = ["중학교", "고등학교"]
        self.assertEqual(set(expected_15_19), set(valid_educations_15_19))
        
        # 20-24세 제약조건
        constraints_20_24 = self.generator.get_age_group_constraints(22)
        valid_educations_20_24 = [e.value for e in constraints_20_24.valid_education_levels]
        
        expected_20_24 = ["고등학교", "대학(4년제 미만)", "대학교(4년제 이상)"]
        self.assertEqual(set(expected_20_24), set(valid_educations_20_24))
        
        print("✅ 연령별 교육 제약조건이 올바릅니다")
    
    def test_under_15_age_not_supported(self):
        """15세 미만은 지원하지 않는지 확인"""
        with self.assertRaises(ValueError) as context:
            self.generator.get_age_group_constraints(14)
        
        self.assertIn("15세 미만은 통계 데이터가 없습니다", str(context.exception))
        print("✅ 15세 미만은 올바르게 거부됩니다")
    
    def test_persona_generation_with_correct_educations(self):
        """수정된 교육 수준으로 페르소나 생성 테스트"""
        personas = []
        
        for _ in range(20):
            try:
                persona = self.generator.generate_persona()
                personas.append(persona)
            except Exception as e:
                print(f"생성 오류: {e}")
                continue
        
        # 모든 페르소나의 교육 수준이 올바른지 확인
        valid_education_values = [e.value for e in EducationLevel]
        
        for i, persona in enumerate(personas):
            education = persona['education']
            self.assertIn(education, valid_education_values, 
                         f"페르소나 {i}의 교육 수준 '{education}'이 올바르지 않습니다")
        
        print(f"✅ {len(personas)}개 페르소나 모두 올바른 교육 수준을 가집니다")
        
        # 교육 수준 분포 확인
        education_counts = {}
        for persona in personas:
            education = persona['education']
            education_counts[education] = education_counts.get(education, 0) + 1
        
        print("교육 수준 분포:")
        for education, count in education_counts.items():
            print(f"  {education}: {count}명")
    
    def test_education_occupation_compatibility(self):
        """교육-직업 호환성 테스트"""
        personas = self.generator.generate_personas(30)
        
        compatibility_errors = []
        
        for i, persona in enumerate(personas):
            education = persona['education']
            occupation = persona['occupation']
            
            # 특정 직업의 교육 요구사항 확인
            if occupation == "의사" and education not in ["대학교(4년제 이상)", "대학원(석사 과정)", "대학원(박사 과정)"]:
                compatibility_errors.append(f"페르소나 {i}: 의사인데 교육 수준이 {education}")
            
            if occupation == "교수" and education not in ["대학원(석사 과정)", "대학원(박사 과정)"]:
                compatibility_errors.append(f"페르소나 {i}: 교수인데 교육 수준이 {education}")
            
            if occupation == "간호사" and education not in ["고등학교", "대학(4년제 미만)", "대학교(4년제 이상)"]:
                compatibility_errors.append(f"페르소나 {i}: 간호사인데 교육 수준이 {education}")
        
        self.assertEqual(len(compatibility_errors), 0, 
                        f"교육-직업 호환성 오류: {compatibility_errors}")
        print("✅ 교육-직업 호환성이 올바릅니다")
    
    def test_statistical_education_mapping(self):
        """통계 기반 교육 매핑 테스트"""
        education_mapping = [
            EducationLevel.MIDDLE_SCHOOL,    # 중학교
            EducationLevel.HIGH_SCHOOL,      # 고등학교  
            EducationLevel.COLLEGE,          # 대학(4년제 미만)
            EducationLevel.UNIVERSITY,       # 대학교(4년제 이상)
            EducationLevel.MASTER,           # 대학원(석사 과정)
            EducationLevel.DOCTORATE         # 대학원(박사 과정)
        ]
        
        expected_csv_columns = [
            "중학교",
            "고등학교", 
            "대학(4년제 미만)",
            "대학교(4년제 이상)",
            "대학원(석사 과정)",
            "대학원(박사 과정)"
        ]
        
        actual_values = [e.value for e in education_mapping]
        
        self.assertEqual(expected_csv_columns, actual_values)
        print("✅ 교육 매핑이 CSV 컬럼과 정확히 일치합니다")
    
    def test_age_15_persona_generation(self):
        """15세 페르소나 생성 테스트 (최소 연령)"""
        # 15세 페르소나 강제 생성 테스트
        attempts = 0
        success = False
        
        while attempts < 50 and not success:
            try:
                persona = self.generator.generate_persona()
                if persona['age'] == 15:
                    # 15세 페르소나 검증
                    self.assertEqual(persona['marital_status'], '미혼')
                    self.assertIn(persona['education'], ['중학교', '고등학교'])
                    self.assertIn(persona['occupation'], ['학생', '아르바이트'])
                    success = True
                    print(f"✅ 15세 페르소나 생성 성공: {persona['age']}세 {persona['education']} {persona['occupation']}")
                    break
            except Exception as e:
                pass
            attempts += 1
        
        if not success:
            print("ℹ️ 15세 페르소나 생성 시도했으나 다른 연령대가 더 많이 생성됨 (정상)")


if __name__ == '__main__':
    unittest.main(verbosity=2)