#!/usr/bin/env python3
"""
계층적 규칙 기반 페르소나 생성기
===================================

현실적 제약조건과 의존관계를 고려한 계층적 샘플링을 통해
논리적으로 일관된 페르소나 데이터를 생성합니다.

주요 기능:
- 연령-교육-혼인 상태간 계층적 의존관계 적용
- 현실적 제약조건 검증 시스템
- 통계 기반 확률 분포 적용
- 규칙 위반 데이터 자동 수정
"""

import random
import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Optional, Any
from dataclasses import dataclass
from enum import Enum
import json
import logging
from pathlib import Path

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EducationLevel(Enum):
    """교육 수준 열거형 (통계청 기준)"""
    MIDDLE_SCHOOL = "중학교"
    HIGH_SCHOOL = "고등학교"
    COLLEGE = "대학(4년제 미만)"          # 전문대학
    UNIVERSITY = "대학교(4년제 이상)"     # 일반 대학교
    MASTER = "대학원(석사 과정)"          # 석사
    DOCTORATE = "대학원(박사 과정)"       # 박사

class MaritalStatus(Enum):
    """혼인 상태 열거형"""
    SINGLE = "미혼"
    MARRIED = "기혼"
    DIVORCED = "이혼"
    WIDOWED = "사별"

class Gender(Enum):
    """성별 열거형"""
    MALE = "남성"
    FEMALE = "여성"

@dataclass
class PersonaConstraints:
    """페르소나 제약조건 정의"""
    min_age: int
    max_age: int
    valid_education_levels: List[EducationLevel]
    valid_marital_statuses: List[MaritalStatus]
    min_income: int
    max_income: int
    occupation_categories: List[str]

class HierarchicalPersonaGenerator:
    """계층적 규칙 기반 페르소나 생성기"""
    
    def __init__(self, reference_data_path: Optional[str] = None):
        """
        초기화
        
        Args:
            reference_data_path: 참조 통계 데이터 경로
        """
        self.reference_data_path = reference_data_path
        self.education_stats = {}
        self.marital_stats = {}
        self.income_stats = {}
        self.occupation_stats = {}
        
        # 기본 제약조건 정의
        self._define_base_constraints()
        
        # 참조 데이터 로드
        if reference_data_path:
            self._load_reference_data()
    
    def _define_base_constraints(self):
        """기본 제약조건 정의"""
        
        # 연령대별 제약조건 (통계청 데이터 기준)
        self.age_constraints = {
            (15, 19): PersonaConstraints(
                min_age=15, max_age=19,
                valid_education_levels=[EducationLevel.MIDDLE_SCHOOL, EducationLevel.HIGH_SCHOOL],
                valid_marital_statuses=[MaritalStatus.SINGLE],
                min_income=0, max_income=1000000,
                occupation_categories=["학생", "아르바이트"]
            ),
            (20, 24): PersonaConstraints(
                min_age=20, max_age=24,
                valid_education_levels=[EducationLevel.HIGH_SCHOOL, EducationLevel.COLLEGE, EducationLevel.UNIVERSITY],
                valid_marital_statuses=[MaritalStatus.SINGLE, MaritalStatus.MARRIED],
                min_income=0, max_income=3000000,
                occupation_categories=["학생", "사원", "인턴", "프리랜서"]
            ),
            (25, 29): PersonaConstraints(
                min_age=25, max_age=29,
                valid_education_levels=[EducationLevel.HIGH_SCHOOL, EducationLevel.COLLEGE, 
                                      EducationLevel.UNIVERSITY, EducationLevel.MASTER],
                valid_marital_statuses=[MaritalStatus.SINGLE, MaritalStatus.MARRIED],
                min_income=1500000, max_income=5000000,
                occupation_categories=["사원", "대리", "연구원", "전문직", "프리랜서"]
            ),
            (30, 39): PersonaConstraints(
                min_age=30, max_age=39,
                valid_education_levels=[EducationLevel.HIGH_SCHOOL, EducationLevel.COLLEGE,
                                      EducationLevel.UNIVERSITY, EducationLevel.MASTER, EducationLevel.DOCTORATE],
                valid_marital_statuses=[MaritalStatus.SINGLE, MaritalStatus.MARRIED, MaritalStatus.DIVORCED],
                min_income=2000000, max_income=8000000,
                occupation_categories=["과장", "차장", "팀장", "전문직", "관리직", "자영업"]
            ),
            (40, 49): PersonaConstraints(
                min_age=40, max_age=49,
                valid_education_levels=[EducationLevel.HIGH_SCHOOL, EducationLevel.COLLEGE,
                                      EducationLevel.UNIVERSITY, EducationLevel.MASTER, EducationLevel.DOCTORATE],
                valid_marital_statuses=[MaritalStatus.MARRIED, MaritalStatus.DIVORCED, MaritalStatus.SINGLE],
                min_income=2500000, max_income=12000000,
                occupation_categories=["부장", "이사", "임원", "전문직", "자영업", "프리랜서"]
            ),
            (50, 64): PersonaConstraints(
                min_age=50, max_age=64,
                valid_education_levels=[EducationLevel.HIGH_SCHOOL, EducationLevel.COLLEGE,
                                      EducationLevel.UNIVERSITY, EducationLevel.MASTER, EducationLevel.DOCTORATE],
                valid_marital_statuses=[MaritalStatus.MARRIED, MaritalStatus.DIVORCED, MaritalStatus.WIDOWED],
                min_income=2000000, max_income=15000000,
                occupation_categories=["임원", "전문직", "자영업", "컨설턴트", "무직"]
            )
        }
        
        # 교육 수준별 소득 범위 (통계 기반 추정)
        self.education_income_mapping = {
            EducationLevel.MIDDLE_SCHOOL: (1200000, 3000000),
            EducationLevel.HIGH_SCHOOL: (1500000, 4000000),
            EducationLevel.COLLEGE: (2000000, 5000000),        # 대학(4년제 미만)
            EducationLevel.UNIVERSITY: (2500000, 8000000),     # 대학교(4년제 이상)
            EducationLevel.MASTER: (3500000, 12000000),        # 석사
            EducationLevel.DOCTORATE: (4500000, 20000000)      # 박사
        }
        
        # 직업별 교육 요구사항 (통계청 기준 수정)
        self.occupation_education_requirements = {
            "의사": [EducationLevel.UNIVERSITY, EducationLevel.MASTER, EducationLevel.DOCTORATE],
            "변호사": [EducationLevel.UNIVERSITY, EducationLevel.MASTER, EducationLevel.DOCTORATE],
            "교수": [EducationLevel.MASTER, EducationLevel.DOCTORATE],
            "연구원": [EducationLevel.UNIVERSITY, EducationLevel.MASTER, EducationLevel.DOCTORATE],
            "엔지니어": [EducationLevel.COLLEGE, EducationLevel.UNIVERSITY, EducationLevel.MASTER],
            "간호사": [EducationLevel.HIGH_SCHOOL, EducationLevel.COLLEGE, EducationLevel.UNIVERSITY],
            "교사": [EducationLevel.UNIVERSITY, EducationLevel.MASTER],
            "회계사": [EducationLevel.UNIVERSITY, EducationLevel.MASTER],
            "디자이너": [EducationLevel.COLLEGE, EducationLevel.UNIVERSITY, EducationLevel.MASTER],
            "프로그래머": [EducationLevel.COLLEGE, EducationLevel.UNIVERSITY, EducationLevel.MASTER],
            "마케터": [EducationLevel.UNIVERSITY, EducationLevel.MASTER],
            "영업사원": [EducationLevel.HIGH_SCHOOL, EducationLevel.COLLEGE, EducationLevel.UNIVERSITY],
            "사무직": [EducationLevel.HIGH_SCHOOL, EducationLevel.COLLEGE, EducationLevel.UNIVERSITY],
            "서비스직": [EducationLevel.MIDDLE_SCHOOL, EducationLevel.HIGH_SCHOOL, EducationLevel.COLLEGE],
            "자영업": [EducationLevel.MIDDLE_SCHOOL, EducationLevel.HIGH_SCHOOL, 
                      EducationLevel.COLLEGE, EducationLevel.UNIVERSITY],
            "학생": [EducationLevel.MIDDLE_SCHOOL, EducationLevel.HIGH_SCHOOL, 
                    EducationLevel.COLLEGE, EducationLevel.UNIVERSITY, EducationLevel.MASTER],
            "무직": [EducationLevel.MIDDLE_SCHOOL, EducationLevel.HIGH_SCHOOL, 
                    EducationLevel.COLLEGE, EducationLevel.UNIVERSITY, 
                    EducationLevel.MASTER, EducationLevel.DOCTORATE]
        }
    
    def _load_reference_data(self):
        """참조 통계 데이터 로드"""
        try:
            # EUC-KR 인코딩으로 파일 읽기
            with open(self.reference_data_path, 'r', encoding='euc-kr') as f:
                df = pd.read_csv(f, skiprows=1)
            
            logger.info(f"참조 데이터 로드 완료: {df.shape}")
            
            # 연령별 교육 수준 통계 계산
            self._calculate_education_stats(df)
            
            # 연령별 혼인 상태 통계 계산
            self._calculate_marital_stats(df)
            
        except Exception as e:
            logger.warning(f"참조 데이터 로드 실패: {e}")
            logger.info("기본 통계를 사용합니다.")
    
    def _calculate_education_stats(self, df: pd.DataFrame):
        """교육 수준 통계 계산"""
        education_cols = ['중학교', '고등학교', '대학(4년제 미만)', 
                         '대학교(4년제 이상)', '대학원(석사 과정)', '대학원(박사 과정)']
        
        for _, row in df.iterrows():
            age_group = row['연령별'].strip()
            gender = row['성별']
            marital = row['혼인상태별']
            
            # 연령 그룹 파싱
            if '~' in age_group:
                try:
                    age_range = age_group.replace('　', '').split('~')
                    min_age = int(age_range[0])
                    max_age = int(age_range[1])
                    age_key = (min_age, max_age)
                    
                    if age_key not in self.education_stats:
                        self.education_stats[age_key] = {}
                    
                    key = (gender, marital)
                    if key not in self.education_stats[age_key]:
                        self.education_stats[age_key][key] = {}
                    
                    # 교육 수준별 인구수 저장
                    for i, col in enumerate(education_cols):
                        value = row[col]
                        if pd.notna(value) and str(value) != '-':
                            self.education_stats[age_key][key][i] = int(value)
                    
                except (ValueError, IndexError) as e:
                    continue
    
    def _calculate_marital_stats(self, df: pd.DataFrame):
        """혼인 상태 통계 계산"""
        for _, row in df.iterrows():
            age_group = row['연령별'].strip()
            gender = row['성별']
            marital = row['혼인상태별']
            
            if '~' in age_group:
                try:
                    age_range = age_group.replace('　', '').split('~')
                    min_age = int(age_range[0])
                    max_age = int(age_range[1])
                    age_key = (min_age, max_age)
                    
                    if age_key not in self.marital_stats:
                        self.marital_stats[age_key] = {}
                    
                    if gender not in self.marital_stats[age_key]:
                        self.marital_stats[age_key][gender] = {}
                    
                    # 혼인 상태별 총합 계산
                    education_cols = ['중학교', '고등학교', '대학(4년제 미만)', 
                                    '대학교(4년제 이상)', '대학원(석사 과정)', '대학원(박사 과정)']
                    total = 0
                    for col in education_cols:
                        value = row[col]
                        if pd.notna(value) and str(value) != '-':
                            total += int(value)
                    
                    if total > 0:
                        self.marital_stats[age_key][gender][marital] = total
                        
                except (ValueError, IndexError):
                    continue
    
    def get_age_group_constraints(self, age: int) -> PersonaConstraints:
        """연령에 해당하는 제약조건 반환"""
        for (min_age, max_age), constraints in self.age_constraints.items():
            if min_age <= age <= max_age:
                return constraints
        
        # 15세 미만은 통계 데이터 없음
        if age < 15:
            raise ValueError(f"15세 미만은 통계 데이터가 없습니다: {age}세")
        
        # 기본값 반환 (65세 이상)
        return PersonaConstraints(
            min_age=65, max_age=100,
            valid_education_levels=[EducationLevel.HIGH_SCHOOL, EducationLevel.COLLEGE, 
                                  EducationLevel.UNIVERSITY, EducationLevel.MASTER, EducationLevel.DOCTORATE],
            valid_marital_statuses=[MaritalStatus.MARRIED, MaritalStatus.DIVORCED, MaritalStatus.WIDOWED],
            min_income=1500000, max_income=5000000,
            occupation_categories=["은퇴", "무직", "자영업"]
        )
    
    def sample_age(self, min_age: int = 15, max_age: int = 65) -> int:
        """연령 샘플링 (현실적 분포 기반)"""
        # 더 현실적인 연령 분포 (18-65세 중심)
        mean_age = 35
        std_age = 12
        
        attempt = 0
        while attempt < 50:  # 무한루프 방지
            age = int(np.random.normal(mean_age, std_age))
            if min_age <= age <= max_age:
                return age
            attempt += 1
        
        # 실패시 안전한 범위에서 균등분포
        return random.randint(max(min_age, 20), min(max_age, 60))
    
    def sample_gender(self) -> Gender:
        """성별 샘플링 (50:50 비율)"""
        return random.choice([Gender.MALE, Gender.FEMALE])
    
    def sample_education_by_age_gender(self, age: int, gender: Gender) -> EducationLevel:
        """연령과 성별에 기반한 교육 수준 샘플링"""
        constraints = self.get_age_group_constraints(age)
        valid_educations = constraints.valid_education_levels
        
        # 통계 데이터가 있으면 사용, 없으면 기본 분포
        age_group = self._get_age_group_key(age)
        
        if (age_group in self.education_stats and 
            self.education_stats[age_group]):
            
            # 통계 기반 샘플링 (유효한 교육 수준만)
            education_mapping = [
                EducationLevel.MIDDLE_SCHOOL,    # 중학교
                EducationLevel.HIGH_SCHOOL,      # 고등학교  
                EducationLevel.COLLEGE,          # 대학(4년제 미만)
                EducationLevel.UNIVERSITY,       # 대학교(4년제 이상)
                EducationLevel.MASTER,           # 대학원(석사 과정)
                EducationLevel.DOCTORATE         # 대학원(박사 과정)
            ]
            
            # 유효한 교육 수준에 대해서만 가중치 계산
            valid_education_weights = []
            valid_education_levels = []
            
            for i, edu_level in enumerate(education_mapping):
                if edu_level in valid_educations:
                    # 통계에서 가중치 추출
                    weight = 0
                    for key, stats in self.education_stats[age_group].items():
                        if key[0] == gender.value:  # 성별 매칭
                            weight += stats.get(i, 0)
                    
                    if weight > 0:  # 가중치가 0보다 큰 경우만 포함
                        valid_education_weights.append(weight)
                        valid_education_levels.append(edu_level)
            
            if len(valid_education_levels) > 0 and sum(valid_education_weights) > 0:
                # 가중치 정규화 및 선택
                total_weight = sum(valid_education_weights)
                probabilities = [w/total_weight for w in valid_education_weights]
                
                try:
                    return np.random.choice(valid_education_levels, p=probabilities)
                except ValueError:
                    # 확률 합계 문제 발생시 기본 분포 사용
                    logger.debug("통계 기반 샘플링 실패, 기본 분포 사용")
                    pass
        
        # 기본값: 연령별 일반적 패턴
        if age < 20:
            return random.choice([EducationLevel.MIDDLE_SCHOOL, EducationLevel.HIGH_SCHOOL])
        elif age < 25:
            return random.choice([EducationLevel.HIGH_SCHOOL, EducationLevel.COLLEGE, EducationLevel.UNIVERSITY])
        else:
            # 유효한 교육 수준에 대해서만 가중치 생성
            education_levels = list(valid_educations)
            if len(education_levels) == 1:
                return education_levels[0]
            
            # 연령별 기본 선호도
            preferences = {
                EducationLevel.MIDDLE_SCHOOL: 0.05 if age < 50 else 0.15,
                EducationLevel.HIGH_SCHOOL: 0.30 if age < 50 else 0.45,
                EducationLevel.COLLEGE: 0.20,
                EducationLevel.UNIVERSITY: 0.35 if age < 50 else 0.25,
                EducationLevel.MASTER: 0.08 if age < 50 else 0.10,
                EducationLevel.DOCTORATE: 0.02 if age < 50 else 0.05
            }
            
            # 유효한 교육 수준에 대한 가중치만 추출
            weights = [preferences.get(edu, 0.1) for edu in education_levels]
            
            # 가중치 정규화
            total_weight = sum(weights)
            if total_weight > 0:
                weights = [w / total_weight for w in weights]
                return np.random.choice(education_levels, p=weights)
            else:
                return random.choice(education_levels)
    
    def sample_marital_status_by_age_gender(self, age: int, gender: Gender) -> MaritalStatus:
        """연령과 성별에 기반한 혼인 상태 샘플링"""
        constraints = self.get_age_group_constraints(age)
        valid_statuses = constraints.valid_marital_statuses
        
        # 통계 데이터 활용
        age_group = self._get_age_group_key(age)
        
        if (age_group in self.marital_stats and 
            gender.value in self.marital_stats[age_group]):
            
            stats = self.marital_stats[age_group][gender.value]
            weights = []
            status_mapping = []
            
            for status in valid_statuses:
                if status == MaritalStatus.SINGLE:
                    weight = stats.get("미혼", 0)
                elif status == MaritalStatus.MARRIED:
                    weight = stats.get("유배우", 0)
                else:
                    weight = 0  # 이혼, 사별은 별도 처리 필요
                
                weights.append(weight)
                status_mapping.append(status)
            
            if sum(weights) > 0:
                total_weight = sum(weights)
                probabilities = [w/total_weight for w in weights]
                return np.random.choice(status_mapping, p=probabilities)
        
        # 기본값: 연령별 일반적 패턴
        if age < 25:
            return MaritalStatus.SINGLE
        elif age < 30:
            return random.choices([MaritalStatus.SINGLE, MaritalStatus.MARRIED], weights=[0.6, 0.4])[0]
        elif age < 35:
            return random.choices([MaritalStatus.SINGLE, MaritalStatus.MARRIED], weights=[0.3, 0.7])[0]
        else:
            return random.choices(valid_statuses, weights=[0.1, 0.8, 0.08, 0.02][:len(valid_statuses)])[0]
    
    def _get_age_group_key(self, age: int) -> Tuple[int, int]:
        """연령을 연령 그룹 키로 변환"""
        for (min_age, max_age) in self.age_constraints.keys():
            if min_age <= age <= max_age:
                return (min_age, max_age)
        return (65, 100)  # 기본값
    
    def sample_occupation_by_education_age(self, education: EducationLevel, age: int) -> str:
        """교육 수준과 연령에 기반한 직업 샘플링 (엄격한 검증)"""
        constraints = self.get_age_group_constraints(age)
        valid_occupations = constraints.occupation_categories
        
        # 연령대별 강제 직업 할당
        if age <= 19:
            if education == EducationLevel.HIGH_SCHOOL and age >= 18:
                return random.choice(["학생", "아르바이트"])
            else:
                return "학생"
        elif age <= 22 and education in [EducationLevel.UNIVERSITY, EducationLevel.COLLEGE]:
            return random.choice(["학생", "인턴"])  # 대학생 연령
        
        # 교육 요구사항에 맞는 직업 필터링
        compatible_occupations = []
        for occupation, required_educations in self.occupation_education_requirements.items():
            if education in required_educations:
                # 연령대 직업 카테고리와 매칭 확인
                job_matches_age = any(
                    category in occupation or occupation in category 
                    for category in valid_occupations
                )
                if job_matches_age or occupation in valid_occupations:
                    compatible_occupations.append(occupation)
        
        # 연령대별 추가 조정
        if age >= 60:
            return random.choice(["은퇴", "무직", "자영업"])
        
        # 호환되는 직업이 있으면 선택
        if compatible_occupations:
            return random.choice(compatible_occupations)
        
        # 기본 안전한 직업 (교육 수준 고려)
        safe_jobs = {
            EducationLevel.MIDDLE_SCHOOL: ["서비스직", "자영업"],
            EducationLevel.HIGH_SCHOOL: ["사무직", "서비스직", "영업사원"],
            EducationLevel.COLLEGE: ["사무직", "엔지니어", "간호사"],        # 대학(4년제 미만)
            EducationLevel.UNIVERSITY: ["사무직", "엔지니어", "교사"],     # 대학교(4년제 이상)
            EducationLevel.MASTER: ["연구원", "교사", "전문직"],          # 석사
            EducationLevel.DOCTORATE: ["교수", "연구원", "전문직"]       # 박사
        }
        
        return random.choice(safe_jobs.get(education, ["사무직"]))
    
    def sample_income_by_education_occupation_age(self, education: EducationLevel, 
                                                occupation: str, age: int) -> int:
        """교육, 직업, 연령에 기반한 소득 샘플링"""
        # 기본 소득 범위 (교육 수준 기반)
        base_min, base_max = self.education_income_mapping.get(education, (2000000, 5000000))
        
        # 연령별 조정 계수
        age_multiplier = 1.0
        if age < 25:
            age_multiplier = 0.6
        elif age < 30:
            age_multiplier = 0.8
        elif age < 40:
            age_multiplier = 1.2
        elif age < 50:
            age_multiplier = 1.5
        elif age < 60:
            age_multiplier = 1.3
        else:
            age_multiplier = 0.8
        
        # 직업별 조정 계수
        occupation_multipliers = {
            "의사": 3.0, "변호사": 2.5, "교수": 2.0, "임원": 2.8,
            "연구원": 1.5, "엔지니어": 1.3, "프로그래머": 1.4,
            "교사": 1.1, "간호사": 1.2, "회계사": 1.3,
            "사원": 0.8, "사무직": 0.9, "서비스직": 0.7,
            "학생": 0.1, "무직": 0.2, "아르바이트": 0.3
        }
        
        occupation_multiplier = occupation_multipliers.get(occupation, 1.0)
        
        # 최종 소득 계산
        adjusted_min = int(base_min * age_multiplier * occupation_multiplier)
        adjusted_max = int(base_max * age_multiplier * occupation_multiplier)
        
        # 제약조건 적용
        constraints = self.get_age_group_constraints(age)
        final_min = max(adjusted_min, constraints.min_income)
        final_max = min(adjusted_max, constraints.max_income)
        
        if final_min >= final_max:
            return final_min
        
        # 로그 정규분포 기반 샘플링 (소득 분포의 특성)
        log_min = np.log(final_min)
        log_max = np.log(final_max)
        log_mean = (log_min + log_max) / 2
        log_std = (log_max - log_min) / 6  # 99.7%가 범위 내에 있도록
        
        log_income = np.random.normal(log_mean, log_std)
        income = int(np.exp(log_income))
        
        return max(final_min, min(final_max, income))
    
    def sample_location(self) -> str:
        """지역 샘플링 (2022년 통계청 인구 분포 기반)"""
        locations = [
            "서울특별시", "부산광역시", "대구광역시", "인천광역시",
            "광주광역시", "대전광역시", "울산광역시", "세종특별자치시",
            "경기도", "강원도", "충청북도", "충청남도",
            "전라북도", "전라남도", "경상북도", "경상남도", "제주특별자치도"
        ]
        
        # 2022년 통계청 실제 인구 분포 기반 가중치
        weights = [0.195, 0.066, 0.047, 0.057, 0.029, 0.030, 0.022, 0.007,
                  0.264, 0.028, 0.030, 0.039, 0.033, 0.031, 0.048, 0.062,
                  0.012]
        
        # 가중치 정규화 (안전장치)
        total_weight = sum(weights)
        if total_weight != 1.0:
            weights = [w / total_weight for w in weights]
        
        return np.random.choice(locations, p=weights)
    
    def validate_persona(self, persona: Dict[str, Any]) -> Tuple[bool, List[str]]:
        """페르소나 유효성 검증"""
        errors = []
        
        # 기본 속성 존재 확인
        required_fields = ['age', 'gender', 'education', 'marital_status', 
                          'occupation', 'income', 'location']
        
        for field in required_fields:
            if field not in persona:
                errors.append(f"필수 필드 누락: {field}")
        
        if errors:
            return False, errors
        
        age = persona['age']
        education = persona['education']
        marital_status = persona['marital_status']
        occupation = persona['occupation']
        income = persona['income']
        
        # 연령별 제약조건 검증
        constraints = self.get_age_group_constraints(age)
        
        # 교육 수준 검증
        if education not in [e.value for e in constraints.valid_education_levels]:
            errors.append(f"연령 {age}세에 부적절한 교육 수준: {education}")
        
        # 혼인 상태 검증
        if marital_status not in [m.value for m in constraints.valid_marital_statuses]:
            errors.append(f"연령 {age}세에 부적절한 혼인 상태: {marital_status}")
        
        # 소득 범위 검증
        if not (constraints.min_income <= income <= constraints.max_income):
            errors.append(f"연령 {age}세에 부적절한 소득: {income:,}원")
        
        # 직업-교육 호환성 검증
        if occupation in self.occupation_education_requirements:
            required_educations = self.occupation_education_requirements[occupation]
            education_enum = EducationLevel(education)
            if education_enum not in required_educations:
                errors.append(f"직업 {occupation}에 부적절한 교육 수준: {education}")
        
        # 강화된 논리적 일관성 검증 (통계청 기준)
        
        # 1. 연령-교육 일관성
        if age < 18 and education in [EducationLevel.UNIVERSITY.value, EducationLevel.MASTER.value, EducationLevel.DOCTORATE.value]:
            errors.append(f"{age}세는 대학교 이상 교육을 받을 수 없습니다")
        
        if age < 22 and education in [EducationLevel.MASTER.value, EducationLevel.DOCTORATE.value]:
            errors.append(f"{age}세는 대학원 학위를 가질 수 없습니다")
        
        if age < 26 and education == EducationLevel.DOCTORATE.value:
            errors.append(f"{age}세는 박사 학위를 가질 수 없습니다")
        
        # 2. 연령-혼인 일관성
        if age < 18 and marital_status in [MaritalStatus.MARRIED.value, MaritalStatus.DIVORCED.value, MaritalStatus.WIDOWED.value]:
            errors.append(f"{age}세 미성년자는 혼인 상태를 가질 수 없습니다")
        
        # 3. 연령-직업 일관성  
        if age <= 19 and occupation not in ["학생", "아르바이트"]:
            errors.append(f"{age}세는 학생 또는 아르바이트만 가능합니다")
        
        if occupation == "학생" and age > 30:
            errors.append(f"{age}세는 일반적으로 학생이 아닙니다")
        
        # 4. 교육-직업 호환성 (더 엄격하게)
        critical_jobs = ["의사", "변호사", "교수", "판사", "검사"]
        if occupation in critical_jobs and education not in [EducationLevel.UNIVERSITY.value, EducationLevel.MASTER.value, EducationLevel.DOCTORATE.value]:
            errors.append(f"직업 '{occupation}'은 대학교 이상 교육이 필요합니다")
        
        # 5. 소득 현실성 검증
        if age <= 19 and income > 2000000:
            errors.append(f"{age}세의 소득 {income:,}원은 비현실적입니다")
        
        if occupation == "학생" and income > 1000000:
            errors.append(f"학생의 소득 {income:,}원은 비현실적입니다")
        
        return len(errors) == 0, errors
    
    def generate_persona(self) -> Dict[str, Any]:
        """단일 페르소나 생성"""
        max_attempts = 10
        
        for attempt in range(max_attempts):
            try:
                # 1단계: 기본 속성 생성 (연령, 성별)
                age = self.sample_age()
                gender = self.sample_gender()
                
                # 2단계: 계층적 의존 속성 생성
                education = self.sample_education_by_age_gender(age, gender)
                marital_status = self.sample_marital_status_by_age_gender(age, gender)
                
                # 3단계: 파생 속성 생성
                occupation = self.sample_occupation_by_education_age(education, age)
                income = self.sample_income_by_education_occupation_age(education, occupation, age)
                location = self.sample_location()
                
                # 페르소나 구성
                persona = {
                    'age': age,
                    'gender': gender.value,
                    'education': education.value,
                    'marital_status': marital_status.value,
                    'occupation': occupation,
                    'income': income,
                    'location': location,
                    'generation_attempt': attempt + 1
                }
                
                # 유효성 검증
                is_valid, errors = self.validate_persona(persona)
                
                if is_valid:
                    logger.debug(f"유효한 페르소나 생성 완료 (시도 {attempt + 1}회)")
                    return persona
                else:
                    logger.debug(f"시도 {attempt + 1}: 검증 실패 - {errors}")
                    
            except Exception as e:
                logger.warning(f"시도 {attempt + 1} 중 오류 발생: {e}")
                continue
        
        # 최대 시도 횟수 초과시 기본값 반환
        logger.warning("최대 시도 횟수 초과, 기본 페르소나 반환")
        return self._generate_fallback_persona()
    
    def _generate_fallback_persona(self) -> Dict[str, Any]:
        """기본 페르소나 생성 (검증 실패시) - 무작위 안전한 조합"""
        # 안전한 연령대 선택 (20-45세)  
        age = random.randint(20, 45)
        gender = random.choice([Gender.MALE, Gender.FEMALE])
        
        # 해당 연령의 제약조건 가져오기
        constraints = self.get_age_group_constraints(age)
        
        # 안전한 교육 수준 (대학교/고등학교)
        safe_educations = [EducationLevel.HIGH_SCHOOL, EducationLevel.UNIVERSITY]
        education = random.choice([e for e in safe_educations if e in constraints.valid_education_levels])
        
        # 안전한 혼인 상태
        marital_status = random.choice(constraints.valid_marital_statuses)
        
        # 안전한 직업 (사무직/엔지니어)
        safe_occupations = ['사무직', '엔지니어', '교사', '간호사']
        occupation = random.choice(safe_occupations)
        
        # 교육과 직업에 맞는 소득 계산
        income = self.sample_income_by_education_occupation_age(education, occupation, age)
        
        # 지역
        location = self.sample_location()
        
        return {
            'age': age,
            'gender': gender.value,
            'education': education.value,
            'marital_status': marital_status.value,
            'occupation': occupation,
            'income': income,
            'location': location,
            'generation_attempt': 'fallback'
        }
    
    def generate_personas(self, count: int) -> List[Dict[str, Any]]:
        """다중 페르소나 생성"""
        personas = []
        
        logger.info(f"{count}개의 페르소나 생성 시작")
        
        for i in range(count):
            if i % 100 == 0:
                logger.info(f"진행상황: {i}/{count}")
            
            persona = self.generate_persona()
            personas.append(persona)
        
        logger.info(f"페르소나 생성 완료: {len(personas)}개")
        return personas
    
    def save_personas(self, personas: List[Dict[str, Any]], 
                     output_path: str, format: str = 'json'):
        """페르소나 데이터 저장"""
        output_path = Path(output_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        if format.lower() == 'json':
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(personas, f, ensure_ascii=False, indent=2)
        
        elif format.lower() == 'csv':
            df = pd.DataFrame(personas)
            df.to_csv(output_path, index=False, encoding='utf-8-sig')
        
        else:
            raise ValueError(f"지원되지 않는 형식: {format}")
        
        logger.info(f"페르소나 데이터 저장 완료: {output_path}")
    
    def analyze_generation_quality(self, personas: List[Dict[str, Any]]) -> Dict[str, Any]:
        """생성된 페르소나의 품질 분석"""
        total_count = len(personas)
        
        # 기본 통계
        ages = [p['age'] for p in personas]
        incomes = [p['income'] for p in personas]
        
        # 분포 분석
        gender_dist = {}
        education_dist = {}
        marital_dist = {}
        occupation_dist = {}
        location_dist = {}
        
        for persona in personas:
            # 성별 분포
            gender = persona['gender']
            gender_dist[gender] = gender_dist.get(gender, 0) + 1
            
            # 교육 분포
            education = persona['education']
            education_dist[education] = education_dist.get(education, 0) + 1
            
            # 혼인 상태 분포
            marital = persona['marital_status']
            marital_dist[marital] = marital_dist.get(marital, 0) + 1
            
            # 직업 분포
            occupation = persona['occupation']
            occupation_dist[occupation] = occupation_dist.get(occupation, 0) + 1
            
            # 지역 분포
            location = persona['location']
            location_dist[location] = location_dist.get(location, 0) + 1
        
        # 검증 오류 분석
        validation_errors = []
        for persona in personas:
            is_valid, errors = self.validate_persona(persona)
            if not is_valid:
                validation_errors.extend(errors)
        
        return {
            'total_count': total_count,
            'age_stats': {
                'mean': np.mean(ages),
                'std': np.std(ages),
                'min': min(ages),
                'max': max(ages)
            },
            'income_stats': {
                'mean': np.mean(incomes),
                'std': np.std(incomes),
                'min': min(incomes),
                'max': max(incomes)
            },
            'distributions': {
                'gender': gender_dist,
                'education': education_dist,
                'marital_status': marital_dist,
                'occupation': occupation_dist,
                'location': location_dist
            },
            'validation_error_count': len(validation_errors),
            'validation_errors': validation_errors[:10],  # 상위 10개만
            'quality_score': max(0, 100 - len(validation_errors) / total_count * 100)
        }


def main():
    """메인 실행 함수"""
    import argparse
    
    parser = argparse.ArgumentParser(description='계층적 규칙 기반 페르소나 생성기')
    parser.add_argument('--count', type=int, default=100, help='생성할 페르소나 수')
    parser.add_argument('--reference-data', type=str, 
                       default='ref/2022년_교육정도별인구_성_연령_혼인_행정구역__20250820094542.csv',
                       help='참조 통계 데이터 경로')
    parser.add_argument('--output', type=str, default='output/hierarchical_personas.json',
                       help='출력 파일 경로')
    parser.add_argument('--format', type=str, default='json', choices=['json', 'csv'],
                       help='출력 형식')
    parser.add_argument('--analyze', action='store_true', help='품질 분석 수행')
    
    args = parser.parse_args()
    
    # 생성기 초기화
    generator = HierarchicalPersonaGenerator(args.reference_data)
    
    # 페르소나 생성
    personas = generator.generate_personas(args.count)
    
    # 저장
    generator.save_personas(personas, args.output, args.format)
    
    # 품질 분석
    if args.analyze:
        analysis = generator.analyze_generation_quality(personas)
        
        print("\n=== 생성 품질 분석 ===")
        print(f"총 페르소나 수: {analysis['total_count']:,}개")
        print(f"품질 점수: {analysis['quality_score']:.1f}/100")
        print(f"검증 오류 수: {analysis['validation_error_count']:,}개")
        
        print(f"\n연령 통계:")
        print(f"  평균: {analysis['age_stats']['mean']:.1f}세")
        print(f"  표준편차: {analysis['age_stats']['std']:.1f}")
        print(f"  범위: {analysis['age_stats']['min']}-{analysis['age_stats']['max']}세")
        
        print(f"\n소득 통계:")
        print(f"  평균: {analysis['income_stats']['mean']:,.0f}원")
        print(f"  표준편차: {analysis['income_stats']['std']:,.0f}")
        print(f"  범위: {analysis['income_stats']['min']:,}-{analysis['income_stats']['max']:,}원")
        
        print(f"\n성별 분포:")
        for gender, count in analysis['distributions']['gender'].items():
            print(f"  {gender}: {count:,}명 ({count/analysis['total_count']*100:.1f}%)")


if __name__ == "__main__":
    main()