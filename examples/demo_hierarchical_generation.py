#!/usr/bin/env python3
"""
계층적 페르소나 생성기 데모
============================

현실적 제약조건과 의존관계가 적용된 페르소나 생성 예제
"""

import sys
from pathlib import Path

# 프로젝트 루트 디렉토리를 Python 경로에 추가
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from src.hierarchical_persona_generator import HierarchicalPersonaGenerator
import json

def main():
    """메인 데모 함수"""
    print("🚀 계층적 규칙 기반 페르소나 생성기 데모")
    print("=" * 50)
    
    # 참조 데이터 경로 설정
    reference_path = project_root / "ref" / "2022년_교육정도별인구_성_연령_혼인_행정구역__20250820094542.csv"
    
    # 생성기 초기화
    if reference_path.exists():
        print(f"✅ 참조 통계 데이터 로드: {reference_path.name}")
        generator = HierarchicalPersonaGenerator(str(reference_path))
    else:
        print("⚠️ 참조 데이터 없음 - 기본 규칙 사용")
        generator = HierarchicalPersonaGenerator()
    
    print()
    
    # 1. 단일 페르소나 생성 예제
    print("1️⃣ 단일 페르소나 생성")
    print("-" * 30)
    
    persona = generator.generate_persona()
    
    print(f"연령: {persona['age']}세")
    print(f"성별: {persona['gender']}")
    print(f"교육: {persona['education']}")
    print(f"혼인상태: {persona['marital_status']}")
    print(f"직업: {persona['occupation']}")
    print(f"소득: {persona['income']:,}원")
    print(f"거주지: {persona['location']}")
    
    # 유효성 검증
    is_valid, errors = generator.validate_persona(persona)
    print(f"유효성: {'✅ 유효' if is_valid else '❌ 무효'}")
    if errors:
        print(f"오류: {errors}")
    
    print()
    
    # 2. 연령대별 제약조건 비교
    print("2️⃣ 연령대별 제약조건 비교")
    print("-" * 30)
    
    age_groups = [17, 25, 35, 50]
    
    for age in age_groups:
        constraints = generator.get_age_group_constraints(age)
        print(f"\n{age}세 제약조건:")
        print(f"  교육: {[e.value for e in constraints.valid_education_levels]}")
        print(f"  혼인: {[m.value for m in constraints.valid_marital_statuses]}")
        print(f"  소득: {constraints.min_income:,}~{constraints.max_income:,}원")
        print(f"  직업: {constraints.occupation_categories}")
    
    print()
    
    # 3. 다양한 페르소나 생성 (제약조건 확인)
    print("3️⃣ 제약조건 검증 예제")
    print("-" * 30)
    
    print("🔍 100개 페르소나 생성하여 제약조건 위반 검사...")
    
    personas = generator.generate_personas(100)
    
    # 제약조건 위반 검사
    violations = {
        "미성년_기혼": 0,
        "22세미만_대학원": 0,
        "30세초과_학생": 0,
        "의사_저학력": 0,
        "기타": 0
    }
    
    for persona in personas:
        age = persona['age']
        education = persona['education']
        marital_status = persona['marital_status']
        occupation = persona['occupation']
        
        # 위반 사례 카운트
        if age < 18 and marital_status in ["기혼", "이혼"]:
            violations["미성년_기혼"] += 1
        
        if age < 22 and education in ["석사", "박사"]:
            violations["22세미만_대학원"] += 1
        
        if age > 30 and occupation == "학생":
            violations["30세초과_학생"] += 1
        
        if occupation == "의사" and education not in ["대학교", "석사", "박사"]:
            violations["의사_저학력"] += 1
        
        # 전체 유효성 검증
        is_valid, errors = generator.validate_persona(persona)
        if not is_valid:
            violations["기타"] += 1
    
    print("제약조건 위반 결과:")
    total_violations = sum(violations.values())
    
    for violation_type, count in violations.items():
        if count > 0:
            print(f"  {violation_type}: {count}건")
    
    success_rate = (100 - total_violations) / 100 * 100
    print(f"\n✅ 제약조건 준수율: {success_rate:.1f}%")
    
    print()
    
    # 4. 품질 분석
    print("4️⃣ 생성 품질 분석")
    print("-" * 30)
    
    analysis = generator.analyze_generation_quality(personas)
    
    print(f"품질 점수: {analysis['quality_score']:.1f}/100")
    print(f"평균 연령: {analysis['age_stats']['mean']:.1f}세")
    print(f"평균 소득: {analysis['income_stats']['mean']:,.0f}원")
    
    print("\n성별 분포:")
    for gender, count in analysis['distributions']['gender'].items():
        percentage = count / analysis['total_count'] * 100
        print(f"  {gender}: {count}명 ({percentage:.1f}%)")
    
    print("\n교육 분포:")
    for education, count in analysis['distributions']['education'].items():
        percentage = count / analysis['total_count'] * 100
        print(f"  {education}: {count}명 ({percentage:.1f}%)")
    
    print("\n혼인 분포:")
    for marital, count in analysis['distributions']['marital_status'].items():
        percentage = count / analysis['total_count'] * 100
        print(f"  {marital}: {count}명 ({percentage:.1f}%)")
    
    print()
    
    # 5. 특정 조건 페르소나 생성 예제
    print("5️⃣ 현실성 검증 예제")
    print("-" * 30)
    
    print("🎯 10살 의사 생성 시도 (불가능한 조합):")
    
    # 강제로 잘못된 페르소나 생성 시도
    invalid_persona = {
        'age': 10,
        'gender': '남성',
        'education': '중학교',
        'marital_status': '기혼',
        'occupation': '의사',
        'income': 10000000,
        'location': '서울특별시'
    }
    
    is_valid, errors = generator.validate_persona(invalid_persona)
    print(f"유효성: {'✅ 유효' if is_valid else '❌ 무효'}")
    print("검증 오류:")
    for error in errors:
        print(f"  - {error}")
    
    print()
    
    # 6. 계층적 의존관계 예제
    print("6️⃣ 계층적 의존관계 예제")
    print("-" * 30)
    
    print("연령 → 교육 → 직업 → 소득 의존관계:")
    
    # 다양한 연령의 페르소나 생성
    age_samples = [20, 25, 30, 40, 55]
    
    for age in age_samples:
        print(f"\n{age}세 샘플:")
        
        # 해당 연령의 페르소나 5개 생성
        age_personas = []
        attempts = 0
        while len(age_personas) < 3 and attempts < 20:
            persona = generator.generate_persona()
            if abs(persona['age'] - age) <= 2:  # ±2세 오차 허용
                age_personas.append(persona)
            attempts += 1
        
        for i, persona in enumerate(age_personas[:3]):
            print(f"  샘플{i+1}: {persona['education']} → {persona['occupation']} → {persona['income']:,}원")
    
    print()
    print("🎉 데모 완료!")
    print("=" * 50)
    
    # 결과 저장
    output_dir = project_root / "output"
    output_dir.mkdir(exist_ok=True)
    
    # JSON 저장
    with open(output_dir / "demo_personas.json", 'w', encoding='utf-8') as f:
        json.dump(personas, f, ensure_ascii=False, indent=2)
    
    # 분석 결과 저장
    with open(output_dir / "demo_analysis.json", 'w', encoding='utf-8') as f:
        json.dump(analysis, f, ensure_ascii=False, indent=2)
    
    print(f"📁 결과 저장: {output_dir}")
    print(f"  - demo_personas.json (100개 페르소나)")
    print(f"  - demo_analysis.json (품질 분석)")


if __name__ == "__main__":
    main()