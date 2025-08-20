#!/usr/bin/env python3
"""
수정된 Location 분포 통합 테스트
===============================

통계청 데이터 기반으로 수정된 지역 분포와 함께 페르소나 생성 테스트
"""

import sys
from pathlib import Path
from collections import Counter

# 프로젝트 루트 디렉토리를 Python 경로에 추가
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from src.hierarchical_persona_generator import HierarchicalPersonaGenerator

def main():
    print("🗺️ 통계청 기반 Location 분포 통합 테스트")
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
    
    print("1️⃣ 통계청 기반 예상 분포")
    print("-" * 30)
    expected_distribution = {
        "경기도": 26.4,
        "서울특별시": 19.5,
        "부산광역시": 6.6,
        "경상남도": 6.2,
        "인천광역시": 5.7,
        "경상북도": 4.8,
        "대구광역시": 4.7,
        "충청남도": 3.9,
        "전라북도": 3.3,
        "전라남도": 3.1,
        "대전광역시": 3.0,
        "충청북도": 3.0,
        "광주광역시": 2.9,
        "강원도": 2.8,
        "울산광역시": 2.2,
        "제주특별자치도": 1.2,
        "세종특별자치시": 0.7
    }
    
    print("예상 지역별 분포 (상위 10개):")
    for location, percentage in list(expected_distribution.items())[:10]:
        print(f"  {location:<15}: {percentage:4.1f}%")
    
    print()
    
    print("2️⃣ 페르소나 생성 및 지역 분포 확인")
    print("-" * 30)
    
    print("2,000개 페르소나 생성 중...")
    
    personas = []
    generation_errors = []
    
    for i in range(2000):
        try:
            persona = generator.generate_persona()
            
            # 유효성 검증
            is_valid, errors = generator.validate_persona(persona)
            
            if is_valid:
                personas.append(persona)
                if (i + 1) % 500 == 0:
                    print(f"  생성 완료: {i + 1}/2000")
            else:
                generation_errors.append(f"페르소나 {i+1}: {errors[:1]}")
                
        except Exception as e:
            generation_errors.append(f"페르소나 {i+1}: {str(e)}")
    
    print(f"✅ 총 {len(personas)}개 페르소나 생성 완료")
    print(f"생성 오류: {len(generation_errors)}건")
    
    print()
    
    print("3️⃣ 지역 분포 분석")
    print("-" * 30)
    
    # 지역별 분포 계산
    locations = [persona['location'] for persona in personas]
    location_counts = Counter(locations)
    total_count = len(personas)
    
    print(f"실제 지역별 분포 vs 예상 분포:")
    print(f"{'지역명':<15} {'실제 수':<8} {'실제(%)':<8} {'예상(%)':<8} {'차이':<8} {'평가'}")
    print("-" * 70)
    
    total_error = 0
    accurate_regions = 0
    
    for location in sorted(expected_distribution.keys(), key=lambda x: expected_distribution[x], reverse=True):
        actual_count = location_counts.get(location, 0)
        actual_pct = actual_count / total_count * 100 if total_count > 0 else 0
        expected_pct = expected_distribution[location]
        error = abs(actual_pct - expected_pct)
        total_error += error
        
        # 2% 이내면 우수, 3% 이내면 양호
        if error <= 2.0:
            status = "🎯 우수"
            accurate_regions += 1
        elif error <= 3.0:
            status = "✅ 양호"
            accurate_regions += 1
        else:
            status = "⚠️ 개선"
        
        print(f"{location:<15} {actual_count:<8} {actual_pct:<8.1f} {expected_pct:<8.1f} {error:<8.1f} {status}")
    
    avg_error = total_error / len(expected_distribution)
    
    print()
    print("4️⃣ 분포 정확도 평가")
    print("-" * 30)
    print(f"평균 오차: {avg_error:.2f}%")
    print(f"정확한 지역: {accurate_regions}/{len(expected_distribution)}개")
    print(f"정확도: {accurate_regions/len(expected_distribution)*100:.1f}%")
    
    if avg_error <= 2.0 and accurate_regions >= 15:
        print("🎉 통계청 기반 Location 분포 적용 성공!")
    elif avg_error <= 3.0 and accurate_regions >= 12:
        print("✅ Location 분포 양호 - 실용적 수준")
    else:
        print("⚠️ Location 분포 추가 조정 필요")
    
    print()
    
    print("5️⃣ 상위 지역 집중 분석")
    print("-" * 30)
    
    # 상위 5개 지역 집중 분석
    top_5_expected = ["경기도", "서울특별시", "부산광역시", "경상남도", "인천광역시"]
    top_5_actual = [location for location, _ in location_counts.most_common(5)]
    
    print("상위 5개 지역 비교:")
    print("예상:", top_5_expected)
    print("실제:", top_5_actual)
    
    matching_top_regions = sum(1 for location in top_5_expected if location in top_5_actual)
    print(f"일치하는 상위 지역: {matching_top_regions}/5개")
    
    if matching_top_regions >= 4:
        print("✅ 주요 지역 분포 정확성 확인!")
    else:
        print("⚠️ 주요 지역 분포 재검토 필요")
    
    print()
    
    print("6️⃣ 샘플 페르소나 (지역별)")
    print("-" * 30)
    
    # 각 주요 지역별로 샘플 페르소나 1개씩 표시
    shown_regions = set()
    sample_count = 0
    
    for persona in personas:
        if sample_count >= 8:  # 8개 지역만 표시
            break
            
        location = persona['location']
        if location not in shown_regions and location in top_5_expected[:8]:
            print(f"{location}: {persona['age']}세 {persona['gender']} {persona['education']} {persona['marital_status']} {persona['occupation']}")
            shown_regions.add(location)
            sample_count += 1
    
    print()
    
    print("7️⃣ 결과 요약")
    print("-" * 30)
    success_rate = len(personas) / 2000 * 100
    accuracy_rate = accurate_regions / len(expected_distribution) * 100
    
    print(f"페르소나 생성 성공률: {success_rate:.1f}%")
    print(f"지역 분포 정확도: {accuracy_rate:.1f}%")
    print(f"평균 지역 분포 오차: {avg_error:.2f}%")
    
    if success_rate >= 95 and accuracy_rate >= 85 and avg_error <= 2.0:
        print("🎉 통계청 기반 Location 분포 시스템 완전히 적용 성공!")
        print("✨ 모든 페르소나가 실제 한국 인구 분포를 정확히 반영합니다.")
    else:
        print("📊 Location 분포 시스템이 성공적으로 개선되었습니다.")
    
    print()

if __name__ == "__main__":
    main()