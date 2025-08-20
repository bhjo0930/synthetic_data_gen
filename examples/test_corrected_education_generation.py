#!/usr/bin/env python3
"""
수정된 교육 수준 기반 페르소나 생성 테스트
========================================

통계청 기준 교육 수준으로 수정 후 페르소나 생성 테스트
"""

import sys
from pathlib import Path

# 프로젝트 루트 디렉토리를 Python 경로에 추가
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from src.hierarchical_persona_generator import HierarchicalPersonaGenerator, EducationLevel

def main():
    print("🎓 통계청 기준 교육 수준 페르소나 생성 테스트")
    print("=" * 60)
    
    # 참조 데이터와 함께 생성기 초기화
    reference_path = project_root / "ref" / "2022년_교육정도별인구_성_연령_혼인_행정구역__20250820094542.csv"
    
    if reference_path.exists():
        print(f"✅ 참조 데이터 로드: {reference_path.name}")
        generator = HierarchicalPersonaGenerator(str(reference_path))
    else:
        print("⚠️ 참조 데이터 없음 - 기본 규칙 사용")
        generator = HierarchicalPersonaGenerator()
    
    print()
    
    print("1️⃣ 교육 수준 확인")
    print("-" * 30)
    education_levels = [e.value for e in EducationLevel]
    print("지원되는 교육 수준:")
    for i, level in enumerate(education_levels, 1):
        print(f"  {i}. {level}")
    
    # 초졸이 없는지 확인
    if any("초" in level for level in education_levels):
        print("❌ 초등학교 관련 교육 수준이 발견됨!")
    else:
        print("✅ 초등학교 관련 교육 수준 없음 (올바름)")
    
    print()
    
    print("2️⃣ 페르소나 생성 테스트")
    print("-" * 30)
    
    print("20개 페르소나 생성 중...")
    
    personas = []
    generation_errors = []
    
    for i in range(20):
        try:
            persona = generator.generate_persona()
            
            # 유효성 검증
            is_valid, errors = generator.validate_persona(persona)
            
            if is_valid:
                personas.append(persona)
                print(f"✅ 페르소나 {i+1:2d}: {persona['age']:2d}세 {persona['gender']} "
                      f"{persona['education']:<15} {persona['marital_status']} {persona['occupation']}")
            else:
                generation_errors.append(f"페르소나 {i+1}: {errors[:2]}")
                print(f"❌ 페르소나 {i+1:2d}: 검증 실패")
                
        except Exception as e:
            generation_errors.append(f"페르소나 {i+1}: {str(e)}")
            print(f"💥 페르소나 {i+1:2d}: 생성 오류 - {e}")
    
    print()
    
    print("3️⃣ 교육 수준 분포 분석")
    print("-" * 30)
    
    if personas:
        education_counts = {}
        for persona in personas:
            education = persona['education']
            education_counts[education] = education_counts.get(education, 0) + 1
        
        print("교육 수준별 분포:")
        total = len(personas)
        for education, count in sorted(education_counts.items()):
            percentage = count / total * 100
            print(f"  {education:<20}: {count:2d}명 ({percentage:4.1f}%)")
        
        # 통계청 기준 교육 수준이 모두 사용되는지 확인
        used_educations = set(education_counts.keys())
        all_educations = set(education_levels)
        
        if used_educations.issubset(all_educations):
            print("✅ 모든 교육 수준이 통계청 기준에 부합합니다")
        else:
            invalid_educations = used_educations - all_educations
            print(f"❌ 잘못된 교육 수준 발견: {invalid_educations}")
    
    print()
    
    print("4️⃣ 연령-교육 일관성 검증")
    print("-" * 30)
    
    consistency_errors = []
    
    for i, persona in enumerate(personas):
        age = persona['age']
        education = persona['education']
        
        # 15세 미만 체크 (있으면 안됨)
        if age < 15:
            consistency_errors.append(f"페르소나 {i+1}: {age}세 (15세 미만)")
        
        # 18세 미만 대학교 체크
        if age < 18 and education in ["대학교(4년제 이상)", "대학원(석사 과정)", "대학원(박사 과정)"]:
            consistency_errors.append(f"페르소나 {i+1}: {age}세인데 {education}")
        
        # 22세 미만 대학원 체크
        if age < 22 and education in ["대학원(석사 과정)", "대학원(박사 과정)"]:
            consistency_errors.append(f"페르소나 {i+1}: {age}세인데 {education}")
    
    if consistency_errors:
        print("❌ 연령-교육 일관성 오류 발견:")
        for error in consistency_errors:
            print(f"  - {error}")
    else:
        print("✅ 모든 페르소나가 연령-교육 일관성을 만족합니다")
    
    print()
    
    print("5️⃣ 결과 요약")
    print("-" * 30)
    print(f"성공적 생성: {len(personas)}/20")
    print(f"생성 오류: {len(generation_errors)}건")
    print(f"일관성 오류: {len(consistency_errors)}건")
    
    if generation_errors:
        print("\n생성 오류 목록:")
        for error in generation_errors[:3]:  # 상위 3개만
            print(f"  - {error}")
    
    # 전체적인 성공 평가
    success_rate = len(personas) / 20 * 100
    consistency_rate = (len(personas) - len(consistency_errors)) / len(personas) * 100 if personas else 0
    
    print(f"\n📊 성능 평가:")
    print(f"  생성 성공률: {success_rate:.1f}%")
    if personas:
        print(f"  일관성 준수율: {consistency_rate:.1f}%")
    
    if success_rate >= 90 and consistency_rate >= 95:
        print("🎉 통계청 기준 교육 수준 적용 성공!")
    elif success_rate >= 70:
        print("⚠️ 부분적 성공 - 일부 개선 필요")
    else:
        print("❌ 추가 수정이 필요합니다")
    
    print()


if __name__ == "__main__":
    main()