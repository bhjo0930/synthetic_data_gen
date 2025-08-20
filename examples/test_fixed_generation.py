#!/usr/bin/env python3
"""
수정된 계층적 페르소나 생성기 테스트
===================================

13세 초졸 기혼 대학생 같은 오류 수정 후 테스트
"""

import sys
from pathlib import Path

# 프로젝트 루트 디렉토리를 Python 경로에 추가
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from src.hierarchical_persona_generator import HierarchicalPersonaGenerator

def main():
    print("🔧 수정된 계층적 페르소나 생성기 테스트")
    print("=" * 50)
    
    # 생성기 초기화 (참조 데이터 없이)
    generator = HierarchicalPersonaGenerator()
    
    print("1️⃣ 기본 제약조건 확인")
    print("-" * 30)
    
    # 10-14세 제약조건 확인
    constraints_teen = generator.get_age_group_constraints(13)
    print(f"13세 제약조건:")
    print(f"  교육: {[e.value for e in constraints_teen.valid_education_levels]}")
    print(f"  혼인: {[m.value for m in constraints_teen.valid_marital_statuses]}")
    print(f"  직업: {constraints_teen.occupation_categories}")
    print(f"  소득: {constraints_teen.min_income:,}~{constraints_teen.max_income:,}원")
    
    print()
    
    print("2️⃣ 불가능한 조합 검증 테스트")
    print("-" * 30)
    
    # 문제가 되었던 조합 테스트
    invalid_persona = {
        'age': 13,
        'gender': '남성',
        'education': '중학교',
        'marital_status': '기혼',  # 🚨 문제
        'occupation': '대학생',    # 🚨 문제
        'income': 2500000,        # 🚨 문제
        'location': '경기도'
    }
    
    is_valid, errors = generator.validate_persona(invalid_persona)
    print(f"13세 중학교 기혼 대학생 검증 결과:")
    print(f"  유효성: {'✅ 유효' if is_valid else '❌ 무효'}")
    if errors:
        print("  검출된 오류:")
        for i, error in enumerate(errors, 1):
            print(f"    {i}. {error}")
    
    print()
    
    print("3️⃣ 안전한 페르소나 생성 테스트")
    print("-" * 30)
    
    print("10개의 페르소나 생성 중...")
    
    successful_generations = 0
    critical_violations = []
    
    for i in range(10):
        try:
            persona = generator.generate_persona()
            
            # 유효성 검증
            is_valid, errors = generator.validate_persona(persona)
            
            if is_valid:
                successful_generations += 1
                print(f"✅ 페르소나 {i+1}: {persona['age']}세 {persona['gender']} {persona['education']} {persona['marital_status']} {persona['occupation']}")
            else:
                print(f"❌ 페르소나 {i+1}: 검증 실패 - {errors[:2]}")
                
            # 치명적 위반 검사
            age = persona['age']
            education = persona['education']
            marital_status = persona['marital_status']
            occupation = persona['occupation']
            
            violations = []
            if age <= 14 and education != '중학교':
                violations.append(f"{age}세인데 교육수준이 {education}")
            if age < 18 and marital_status != '미혼':
                violations.append(f"{age}세 미성년자인데 {marital_status}")
            if age <= 14 and occupation != '학생':
                violations.append(f"{age}세인데 직업이 {occupation}")
            
            if violations:
                critical_violations.extend(violations)
                print(f"  🚨 치명적 위반: {violations}")
                
        except Exception as e:
            print(f"❌ 페르소나 {i+1}: 생성 오류 - {e}")
    
    print()
    print("4️⃣ 결과 요약")
    print("-" * 30)
    print(f"성공적 생성: {successful_generations}/10")
    print(f"치명적 위반: {len(critical_violations)}건")
    
    if critical_violations:
        print("🚨 발견된 치명적 위반:")
        for violation in critical_violations:
            print(f"  - {violation}")
    else:
        print("✅ 치명적 위반 없음!")
    
    print()
    
    print("5️⃣ 연령 분포 확인")
    print("-" * 30)
    
    # 100개 생성하여 연령 분포 확인
    print("100개 페르소나 생성하여 연령 분포 확인...")
    ages = []
    
    for _ in range(100):
        try:
            persona = generator.generate_persona()
            ages.append(persona['age'])
        except:
            continue
    
    if ages:
        import numpy as np
        minors = [age for age in ages if age < 18]
        young_adults = [age for age in ages if 18 <= age < 30]
        adults = [age for age in ages if 30 <= age < 50]
        seniors = [age for age in ages if age >= 50]
        
        print(f"  미성년자 (18세 미만): {len(minors)}명 ({len(minors)/len(ages)*100:.1f}%)")
        print(f"  청년층 (18-29세): {len(young_adults)}명 ({len(young_adults)/len(ages)*100:.1f}%)")
        print(f"  중년층 (30-49세): {len(adults)}명 ({len(adults)/len(ages)*100:.1f}%)")
        print(f"  장년층 (50세 이상): {len(seniors)}명 ({len(seniors)/len(ages)*100:.1f}%)")
        print(f"  평균 연령: {np.mean(ages):.1f}세")
        
        # 미성년자 비율이 10% 미만이어야 함
        minor_ratio = len(minors) / len(ages)
        if minor_ratio < 0.1:
            print(f"✅ 미성년자 비율 적절: {minor_ratio:.1%}")
        else:
            print(f"⚠️ 미성년자 비율 높음: {minor_ratio:.1%}")
    
    print()
    print("🎉 테스트 완료!")
    

if __name__ == "__main__":
    main()