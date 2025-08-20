#!/usr/bin/env python3
"""
행정구역별 인구 분포 분석 스크립트
==================================

CSV 데이터를 기반으로 정확한 행정구역별 인구 분포를 계산합니다.
"""

import pandas as pd
import sys
from pathlib import Path

# 프로젝트 루트 디렉토리를 Python 경로에 추가
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

def analyze_location_distribution():
    """CSV 데이터에서 행정구역별 인구 분포 분석"""
    
    print("📊 행정구역별 인구 분포 분석")
    print("=" * 50)
    
    try:
        # CSV 파일 로드
        csv_path = project_root / "ref" / "2022년_교육정도별인구_성_연령_혼인_행정구역__20250820094542.csv"
        df = pd.read_csv(csv_path, encoding='euc-kr')
        
        print(f"✅ CSV 파일 로드: {csv_path.name}")
        print(f"데이터 크기: {df.shape}")
        
        # 교육 수준 컬럼들 (숫자 데이터)
        education_cols = ['2020', '2020.1', '2020.2', '2020.3', '2020.4', '2020.5']
        education_names = ['중학교', '고등학교', '대학(4년제 미만)', '대학교(4년제 이상)', '대학원(석사 과정)', '대학원(박사 과정)']
        
        # '-' 값을 NaN으로 변환 후 0으로 처리
        for col in education_cols:
            df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)
        
        # 헤더 행 제거
        df_clean = df[df['행정구역별'] != '행정구역별']
        
        print("\n1️⃣ 행정구역별 총 인구 계산")
        print("-" * 30)
        
        # 행정구역별 총 인구 계산
        region_totals = df_clean.groupby('행정구역별')[education_cols].sum().sum(axis=1).sort_values(ascending=False)
        total_population = region_totals.sum()
        
        print(f"전체 인구: {total_population:,.0f}명\n")
        
        # 현재 코드에서 사용하는 지역 순서
        code_locations = [
            "서울특별시", "부산광역시", "대구광역시", "인천광역시", 
            "광주광역시", "대전광역시", "울산광역시", "세종특별자치시",
            "경기도", "강원도", "충청북도", "충청남도", 
            "전라북도", "전라남도", "경상북도", "경상남도", "제주특별자치도"
        ]
        
        # 현재 코드의 가중치
        current_weights = [0.19, 0.07, 0.05, 0.06, 0.03, 0.03, 0.02, 0.01,
                          0.25, 0.03, 0.03, 0.04, 0.04, 0.04, 0.05, 0.06, 0.01]
        
        print("2️⃣ 현재 코드 vs 실제 데이터 비교")
        print("-" * 30)
        print(f"{'지역명':<15} {'현재 가중치':<12} {'실제 비율':<12} {'실제 인구':<15} {'차이':<8}")
        print("-" * 70)
        
        # 실제 데이터 기반 가중치 계산
        actual_weights = []
        for i, location in enumerate(code_locations):
            if location in region_totals.index:
                actual_population = region_totals[location]
                actual_ratio = actual_population / total_population
                actual_weights.append(actual_ratio)
                
                current_weight = current_weights[i]
                difference = actual_ratio - current_weight
                
                print(f"{location:<15} {current_weight:<12.3f} {actual_ratio:<12.3f} {actual_population:<15,.0f} {difference:+.3f}")
            else:
                print(f"{location:<15} {'N/A':<12} {'N/A':<12} {'N/A':<15} {'N/A':<8}")
                actual_weights.append(0.0)
        
        print(f"\n현재 가중치 합계: {sum(current_weights):.3f}")
        print(f"실제 가중치 합계: {sum(actual_weights):.3f}")
        
        print("\n3️⃣ 수정된 Location 샘플링 코드 생성")
        print("-" * 30)
        
        # 정규화된 가중치 (소수점 3자리)
        normalized_weights = [round(w, 3) for w in actual_weights]
        
        # 합계가 1.0이 되도록 미세 조정
        weight_sum = sum(normalized_weights)
        if weight_sum != 1.0:
            # 가장 큰 가중치에 차이를 더해서 1.0으로 맞춤
            max_idx = normalized_weights.index(max(normalized_weights))
            normalized_weights[max_idx] += 1.0 - weight_sum
            normalized_weights[max_idx] = round(normalized_weights[max_idx], 3)
        
        print("수정된 sample_location() 메서드:")
        print("```python")
        print("def sample_location(self) -> str:")
        print('    """지역 샘플링 (2022년 통계청 인구 분포 기반)"""')
        print("    locations = [")
        for i in range(0, len(code_locations), 4):
            line_locations = code_locations[i:i+4]
            formatted_locations = ', '.join(f'"{loc}"' for loc in line_locations)
            if i + 4 < len(code_locations):
                formatted_locations += ","
            print(f"        {formatted_locations}")
        print("    ]")
        print("    ")
        print("    # 2022년 통계청 실제 인구 분포 기반 가중치")
        print("    weights = [", end="")
        for i in range(0, len(normalized_weights), 8):
            if i > 0:
                print("              ", end="")
            line_weights = normalized_weights[i:i+8]
            formatted_weights = ", ".join(f"{w:.3f}" for w in line_weights)
            if i + 8 < len(normalized_weights):
                formatted_weights += ","
            print(formatted_weights)
        print("    ]")
        print("    ")
        print("    # 가중치 정규화 (안전장치)")
        print("    total_weight = sum(weights)")
        print("    if total_weight != 1.0:")
        print("        weights = [w / total_weight for w in weights]")
        print("    ")
        print("    return np.random.choice(locations, p=weights)")
        print("```")
        
        print("\n4️⃣ 가중치 변경 요약")
        print("-" * 30)
        
        significant_changes = []
        for i, location in enumerate(code_locations):
            if i < len(current_weights) and i < len(actual_weights):
                current = current_weights[i]
                actual = actual_weights[i]
                change = actual - current
                if abs(change) > 0.01:  # 1% 이상 변화
                    significant_changes.append((location, current, actual, change))
        
        if significant_changes:
            print("주요 변경사항 (1% 이상 차이):")
            for location, current, actual, change in significant_changes:
                direction = "증가" if change > 0 else "감소"
                print(f"  {location}: {current:.3f} → {actual:.3f} ({change:+.3f}, {direction})")
        else:
            print("✅ 현재 가중치가 실제 데이터와 크게 다르지 않습니다.")
        
        print(f"\n5️⃣ 검증")
        print("-" * 30)
        print(f"정규화된 가중치 합계: {sum(normalized_weights):.3f}")
        print(f"모든 가중치 양수: {all(w >= 0 for w in normalized_weights)}")
        print(f"지역 수: {len(code_locations)}개")
        print(f"가중치 수: {len(normalized_weights)}개")
        
        return {
            'locations': code_locations,
            'current_weights': current_weights,
            'actual_weights': actual_weights,
            'normalized_weights': normalized_weights,
            'region_totals': region_totals,
            'total_population': total_population
        }
        
    except Exception as e:
        print(f"❌ 오류 발생: {e}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    result = analyze_location_distribution()
    
    if result:
        print("\n🎉 분석 완료!")
        print("위 코드를 hierarchical_persona_generator.py에 적용하세요.")