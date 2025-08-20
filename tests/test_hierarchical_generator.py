#!/usr/bin/env python3
"""
계층적 페르소나 생성기 테스트
============================

HierarchicalPersonaGenerator의 기능과 제약조건 검증을 위한 테스트
"""

import unittest
import sys
import os
from pathlib import Path

# 프로젝트 루트 디렉토리를 Python 경로에 추가
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from src.hierarchical_persona_generator import (
    HierarchicalPersonaGenerator, 
    EducationLevel, 
    MaritalStatus, 
    Gender
)

class TestHierarchicalPersonaGenerator(unittest.TestCase):
    """계층적 페르소나 생성기 테스트"""
    
    def setUp(self):
        """테스트 설정"""
        # 참조 데이터 없이 기본 생성기 생성
        self.generator = HierarchicalPersonaGenerator()
        
        # 참조 데이터가 있는 경우 테스트용 생성기 생성
        reference_path = project_root / "ref" / "2022년_교육정도별인구_성_연령_혼인_행정구역__20250820094542.csv"
        if reference_path.exists():
            self.generator_with_data = HierarchicalPersonaGenerator(str(reference_path))
        else:
            self.generator_with_data = None
    
    def test_age_sampling(self):
        """연령 샘플링 테스트"""
        ages = [self.generator.sample_age() for _ in range(100)]
        
        # 모든 연령이 범위 내에 있는지 확인
        self.assertTrue(all(15 <= age <= 85 for age in ages))
        
        # 연령 분포가 합리적인지 확인 (표준편차가 너무 작지 않은지)
        import numpy as np
        self.assertGreater(np.std(ages), 5)
    
    def test_gender_sampling(self):
        """성별 샘플링 테스트"""
        genders = [self.generator.sample_gender() for _ in range(100)]
        
        # 두 성별이 모두 나타나는지 확인
        gender_values = [g.value for g in genders]
        self.assertIn(Gender.MALE.value, gender_values)
        self.assertIn(Gender.FEMALE.value, gender_values)
        
        # 비율이 극단적이지 않은지 확인 (20-80% 범위)
        male_ratio = gender_values.count(Gender.MALE.value) / len(gender_values)
        self.assertGreater(male_ratio, 0.2)
        self.assertLess(male_ratio, 0.8)
    
    def test_education_sampling_by_age(self):
        """연령별 교육 수준 샘플링 테스트"""
        # 10대는 중고등학교만 가능
        young_educations = [
            self.generator.sample_education_by_age_gender(17, Gender.MALE)
            for _ in range(50)
        ]
        
        for edu in young_educations:
            self.assertIn(edu, [EducationLevel.MIDDLE_SCHOOL, EducationLevel.HIGH_SCHOOL])
        
        # 30대는 더 다양한 교육 수준 가능
        adult_educations = [
            self.generator.sample_education_by_age_gender(35, Gender.FEMALE)
            for _ in range(50)
        ]
        
        # 대학교 이상 교육이 나타나는지 확인
        has_higher_education = any(
            edu in [EducationLevel.UNIVERSITY, EducationLevel.MASTER, EducationLevel.DOCTORATE]
            for edu in adult_educations
        )
        self.assertTrue(has_higher_education)
    
    def test_marital_status_by_age(self):
        """연령별 혼인 상태 샘플링 테스트"""
        # 10대는 미혼만 가능
        young_marital = [
            self.generator.sample_marital_status_by_age_gender(17, Gender.MALE)
            for _ in range(20)
        ]
        
        for status in young_marital:
            self.assertEqual(status, MaritalStatus.SINGLE)
        
        # 40대는 다양한 혼인 상태 가능
        adult_marital = [
            self.generator.sample_marital_status_by_age_gender(45, Gender.FEMALE)
            for _ in range(50)
        ]
        
        # 기혼이 나타나는지 확인
        has_married = any(status == MaritalStatus.MARRIED for status in adult_marital)
        self.assertTrue(has_married)
    
    def test_occupation_education_compatibility(self):
        """직업-교육 호환성 테스트"""
        # 의사는 대학교 이상 교육 필요
        doctor_compatible = self.generator.sample_occupation_by_education_age(
            EducationLevel.DOCTORATE, 35
        )
        
        # 서비스직은 중학교 졸업자도 가능
        service_compatible = self.generator.sample_occupation_by_education_age(
            EducationLevel.MIDDLE_SCHOOL, 25
        )
        
        # 직업이 문자열인지 확인
        self.assertIsInstance(doctor_compatible, str)
        self.assertIsInstance(service_compatible, str)
    
    def test_income_calculation(self):
        """소득 계산 테스트"""
        # 박사 학위 + 의사 + 40세 = 높은 소득
        high_income = self.generator.sample_income_by_education_occupation_age(
            EducationLevel.DOCTORATE, "의사", 40
        )
        
        # 중학교 졸업 + 서비스직 + 20세 = 낮은 소득
        low_income = self.generator.sample_income_by_education_occupation_age(
            EducationLevel.MIDDLE_SCHOOL, "서비스직", 20
        )
        
        # 소득이 양수인지 확인
        self.assertGreater(high_income, 0)
        self.assertGreater(low_income, 0)
        
        # 일반적으로 고학력/전문직이 더 높은 소득을 가져야 함
        self.assertGreater(high_income, low_income)
    
    def test_persona_validation(self):
        """페르소나 유효성 검증 테스트"""
        # 유효한 페르소나
        valid_persona = {
            'age': 30,
            'gender': Gender.MALE.value,
            'education': EducationLevel.UNIVERSITY.value,
            'marital_status': MaritalStatus.MARRIED.value,
            'occupation': '엔지니어',
            'income': 4500000,
            'location': '서울특별시'
        }
        
        is_valid, errors = self.generator.validate_persona(valid_persona)
        self.assertTrue(is_valid)
        self.assertEqual(len(errors), 0)
        
        # 무효한 페르소나 (17세 기혼)
        invalid_persona = {
            'age': 17,
            'gender': Gender.FEMALE.value,
            'education': EducationLevel.HIGH_SCHOOL.value,
            'marital_status': MaritalStatus.MARRIED.value,
            'occupation': '학생',
            'income': 0,
            'location': '부산광역시'
        }
        
        is_valid, errors = self.generator.validate_persona(invalid_persona)
        self.assertFalse(is_valid)
        self.assertGreater(len(errors), 0)
    
    def test_persona_generation(self):
        """페르소나 생성 테스트"""
        persona = self.generator.generate_persona()
        
        # 필수 필드 존재 확인
        required_fields = ['age', 'gender', 'education', 'marital_status', 
                          'occupation', 'income', 'location']
        
        for field in required_fields:
            self.assertIn(field, persona)
        
        # 데이터 타입 확인
        self.assertIsInstance(persona['age'], int)
        self.assertIsInstance(persona['gender'], str)
        self.assertIsInstance(persona['education'], str)
        self.assertIsInstance(persona['marital_status'], str)
        self.assertIsInstance(persona['occupation'], str)
        self.assertIsInstance(persona['income'], int)
        self.assertIsInstance(persona['location'], str)
        
        # 유효성 검증
        is_valid, errors = self.generator.validate_persona(persona)
        if not is_valid:
            print(f"생성된 페르소나가 무효함: {errors}")
            print(f"페르소나: {persona}")
        
        self.assertTrue(is_valid, f"생성된 페르소나가 유효해야 함: {errors}")
    
    def test_multiple_persona_generation(self):
        """다중 페르소나 생성 테스트"""
        personas = self.generator.generate_personas(10)
        
        # 개수 확인
        self.assertEqual(len(personas), 10)
        
        # 모든 페르소나가 유효한지 확인
        for i, persona in enumerate(personas):
            is_valid, errors = self.generator.validate_persona(persona)
            self.assertTrue(is_valid, f"페르소나 {i}가 무효함: {errors}")
    
    def test_age_constraints(self):
        """연령별 제약조건 테스트"""
        # 15-19세 제약조건
        constraints_teen = self.generator.get_age_group_constraints(17)
        self.assertIn(EducationLevel.MIDDLE_SCHOOL, constraints_teen.valid_education_levels)
        self.assertIn(EducationLevel.HIGH_SCHOOL, constraints_teen.valid_education_levels)
        self.assertNotIn(EducationLevel.MASTER, constraints_teen.valid_education_levels)
        
        # 30-39세 제약조건
        constraints_adult = self.generator.get_age_group_constraints(35)
        self.assertIn(EducationLevel.UNIVERSITY, constraints_adult.valid_education_levels)
        self.assertIn(EducationLevel.MASTER, constraints_adult.valid_education_levels)
        self.assertIn(MaritalStatus.MARRIED, constraints_adult.valid_marital_statuses)
        self.assertIn(MaritalStatus.DIVORCED, constraints_adult.valid_marital_statuses)
    
    def test_logical_consistency(self):
        """논리적 일관성 테스트"""
        # 1000개의 페르소나를 생성하여 일관성 검사
        personas = self.generator.generate_personas(100)
        
        inconsistencies = []
        
        for persona in personas:
            age = persona['age']
            education = persona['education']
            marital_status = persona['marital_status']
            occupation = persona['occupation']
            
            # 논리적 불일치 검사
            if age < 18 and marital_status in [MaritalStatus.MARRIED.value, MaritalStatus.DIVORCED.value]:
                inconsistencies.append(f"미성년자 기혼/이혼: {persona}")
            
            if age < 22 and education in [EducationLevel.MASTER.value, EducationLevel.DOCTORATE.value]:
                inconsistencies.append(f"22세 미만 대학원: {persona}")
            
            if occupation == "학생" and age > 30:
                inconsistencies.append(f"30세 초과 학생: {persona}")
            
            if occupation == "의사" and education not in [EducationLevel.UNIVERSITY.value, 
                                                        EducationLevel.MASTER.value, 
                                                        EducationLevel.DOCTORATE.value]:
                inconsistencies.append(f"의사 저학력: {persona}")
        
        # 불일치가 5% 미만이어야 함
        inconsistency_rate = len(inconsistencies) / len(personas)
        self.assertLess(inconsistency_rate, 0.05, 
                       f"논리적 불일치가 너무 많음: {inconsistency_rate:.2%}\n" + 
                       "\n".join(inconsistencies[:5]))
    
    def test_income_distribution(self):
        """소득 분포 테스트"""
        personas = self.generator.generate_personas(100)
        incomes = [p['income'] for p in personas]
        
        # 소득이 모두 양수인지 확인
        self.assertTrue(all(income > 0 for income in incomes))
        
        # 소득 분포가 합리적인지 확인
        import numpy as np
        
        # 평균 소득이 최저임금보다 높아야 함
        mean_income = np.mean(incomes)
        self.assertGreater(mean_income, 2000000)  # 최저임금 수준
        
        # 표준편차가 0이 아니어야 함 (다양성)
        self.assertGreater(np.std(incomes), 0)
    
    def test_generation_quality_analysis(self):
        """생성 품질 분석 테스트"""
        personas = self.generator.generate_personas(50)
        analysis = self.generator.analyze_generation_quality(personas)
        
        # 분석 결과 구조 확인
        self.assertIn('total_count', analysis)
        self.assertIn('age_stats', analysis)
        self.assertIn('income_stats', analysis)
        self.assertIn('distributions', analysis)
        self.assertIn('quality_score', analysis)
        
        # 품질 점수가 80점 이상이어야 함
        self.assertGreaterEqual(analysis['quality_score'], 80)
        
        # 총 개수가 일치해야 함
        self.assertEqual(analysis['total_count'], 50)


class TestIntegrationWithReferenceData(unittest.TestCase):
    """참조 데이터 통합 테스트"""
    
    def setUp(self):
        """테스트 설정"""
        reference_path = Path(__file__).parent.parent / "ref" / "2022년_교육정도별인구_성_연령_혼인_행정구역__20250820094542.csv"
        
        if reference_path.exists():
            self.generator = HierarchicalPersonaGenerator(str(reference_path))
            self.has_reference_data = True
        else:
            self.generator = HierarchicalPersonaGenerator()
            self.has_reference_data = False
    
    def test_reference_data_loading(self):
        """참조 데이터 로딩 테스트"""
        if not self.has_reference_data:
            self.skipTest("참조 데이터가 없음")
        
        # 교육 통계 데이터가 로드되었는지 확인
        self.assertGreater(len(self.generator.education_stats), 0)
        
        # 혼인 통계 데이터가 로드되었는지 확인
        self.assertGreater(len(self.generator.marital_stats), 0)
    
    def test_statistical_sampling(self):
        """통계 기반 샘플링 테스트"""
        if not self.has_reference_data:
            self.skipTest("참조 데이터가 없음")
        
        # 통계 기반 교육 수준 샘플링
        educations = [
            self.generator.sample_education_by_age_gender(25, Gender.FEMALE)
            for _ in range(100)
        ]
        
        # 다양한 교육 수준이 나타나는지 확인
        unique_educations = set(educations)
        self.assertGreater(len(unique_educations), 1)
        
        # 통계 기반 혼인 상태 샘플링
        marital_statuses = [
            self.generator.sample_marital_status_by_age_gender(30, Gender.MALE)
            for _ in range(100)
        ]
        
        # 다양한 혼인 상태가 나타나는지 확인
        unique_marital = set(marital_statuses)
        self.assertGreater(len(unique_marital), 1)


if __name__ == '__main__':
    # 테스트 실행
    unittest.main(verbosity=2)