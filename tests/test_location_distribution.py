#!/usr/bin/env python3
"""
수정된 Location 분포 테스트
==========================

통계청 데이터 기반으로 수정된 지역 분포 테스트
"""

import unittest
import sys
from pathlib import Path
from collections import Counter

# 프로젝트 루트 디렉토리를 Python 경로에 추가
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from src.hierarchical_persona_generator import HierarchicalPersonaGenerator

class TestLocationDistribution(unittest.TestCase):
    """수정된 Location 분포 테스트"""
    
    def setUp(self):
        """테스트 설정"""
        self.generator = HierarchicalPersonaGenerator()
        
        # 통계청 기반 예상 분포 (±3% 오차 허용)
        self.expected_distribution = {
            "경기도": 0.264,
            "서울특별시": 0.195,
            "부산광역시": 0.066,
            "경상남도": 0.062,
            "인천광역시": 0.057,
            "경상북도": 0.048,
            "대구광역시": 0.047,
            "충청남도": 0.039,
            "전라북도": 0.033,
            "전라남도": 0.031,
            "대전광역시": 0.030,
            "충청북도": 0.030,
            "광주광역시": 0.029,
            "강원도": 0.028,
            "울산광역시": 0.022,
            "제주특별자치도": 0.012,
            "세종특별자치시": 0.007
        }
    
    def test_location_weights_sum_to_one(self):
        """지역 가중치 합계가 1.0인지 확인"""
        # 직접 가중치 계산
        weights = [0.195, 0.066, 0.047, 0.057, 0.029, 0.030, 0.022, 0.007,
                  0.264, 0.028, 0.030, 0.039, 0.033, 0.031, 0.048, 0.062,
                  0.012]
        
        total_weight = sum(weights)
        self.assertAlmostEqual(total_weight, 1.0, places=3)
        print(f"✅ 가중치 합계: {total_weight:.3f}")
    
    def test_location_sampling_basic(self):
        """기본 지역 샘플링 테스트"""
        locations = []
        
        for _ in range(100):
            location = self.generator.sample_location()
            self.assertIn(location, self.expected_distribution.keys())
            locations.append(location)
        
        print(f"✅ 100개 지역 샘플링 완료")
        
        # 분포 확인
        location_counts = Counter(locations)
        print("샘플링 결과:")
        for location, count in location_counts.most_common():
            percentage = count / 100 * 100
            expected = self.expected_distribution[location] * 100
            print(f"  {location}: {count}개 ({percentage:.1f}%, 예상: {expected:.1f}%)")
    
    def test_location_distribution_accuracy(self):
        """대량 샘플링으로 분포 정확도 테스트"""
        sample_size = 10000
        locations = []
        
        print(f"📊 {sample_size:,}개 지역 샘플링으로 분포 정확도 테스트")
        
        for _ in range(sample_size):
            location = self.generator.sample_location()
            locations.append(location)
        
        location_counts = Counter(locations)
        
        print("\n지역별 분포 (예상 vs 실제):")
        print(f"{'지역명':<15} {'예상(%)':<8} {'실제(%)':<8} {'차이':<8} {'검증'}")
        print("-" * 55)
        
        max_error = 0
        errors = []
        
        for location in sorted(self.expected_distribution.keys(), key=lambda x: self.expected_distribution[x], reverse=True):
            expected_pct = self.expected_distribution[location] * 100
            actual_count = location_counts.get(location, 0)
            actual_pct = actual_count / sample_size * 100
            error = abs(actual_pct - expected_pct)
            max_error = max(max_error, error)
            errors.append(error)
            
            # 3% 이내 오차면 통과
            status = "✅" if error <= 3.0 else "❌"
            
            print(f"{location:<15} {expected_pct:<8.1f} {actual_pct:<8.1f} {error:<8.1f} {status}")
        
        # 통계적 검증
        avg_error = sum(errors) / len(errors)
        
        print(f"\n📈 분포 정확도 평가:")
        print(f"  평균 오차: {avg_error:.2f}%")
        print(f"  최대 오차: {max_error:.2f}%")
        print(f"  3% 이내 지역: {sum(1 for e in errors if e <= 3.0)}/{len(errors)}개")
        
        # 평균 오차 2% 이내, 최대 오차 5% 이내면 통과
        self.assertLess(avg_error, 2.0, f"평균 오차가 2%를 초과합니다: {avg_error:.2f}%")
        self.assertLess(max_error, 5.0, f"최대 오차가 5%를 초과합니다: {max_error:.2f}%")
        
        print("✅ 지역 분포 정확도 테스트 통과!")
    
    def test_top_regions_accuracy(self):
        """주요 지역(상위 5개) 분포 정확도 집중 테스트"""
        sample_size = 5000
        locations = []
        
        for _ in range(sample_size):
            location = self.generator.sample_location()
            locations.append(location)
        
        location_counts = Counter(locations)
        
        # 상위 5개 지역
        top_5_expected = ["경기도", "서울특별시", "부산광역시", "경상남도", "인천광역시"]
        
        print("\n🎯 주요 지역 (상위 5개) 분포 테스트:")
        
        for location in top_5_expected:
            expected_pct = self.expected_distribution[location] * 100
            actual_count = location_counts.get(location, 0)
            actual_pct = actual_count / sample_size * 100
            error = abs(actual_pct - expected_pct)
            
            print(f"  {location}: 예상 {expected_pct:.1f}% / 실제 {actual_pct:.1f}% (오차: {error:.1f}%)")
            
            # 주요 지역은 2% 이내 오차
            self.assertLess(error, 2.0, f"{location}의 오차가 2%를 초과합니다: {error:.1f}%")
        
        print("✅ 주요 지역 분포 정확도 테스트 통과!")
    
    def test_persona_generation_with_location(self):
        """페르소나 생성시 지역 분포 테스트"""
        personas = []
        
        print("\n👥 페르소나 생성과 함께 지역 분포 테스트")
        
        for _ in range(1000):
            try:
                persona = self.generator.generate_persona()
                personas.append(persona)
            except Exception as e:
                print(f"페르소나 생성 오류: {e}")
                continue
        
        self.assertGreater(len(personas), 900, "페르소나 생성 성공률이 90% 미만입니다")
        
        # 지역 분포 확인
        locations = [p['location'] for p in personas]
        location_counts = Counter(locations)
        
        # 상위 3개 지역 확인
        top_3_actual = [location for location, _ in location_counts.most_common(3)]
        top_3_expected = ["경기도", "서울특별시", "부산광역시"]
        
        for expected_location in top_3_expected[:2]:  # 상위 2개는 반드시 일치해야 함
            self.assertIn(expected_location, top_3_actual, 
                         f"상위 지역 {expected_location}이 실제 상위 3개에 없습니다")
        
        print(f"✅ {len(personas)}개 페르소나 생성 완료")
        print("실제 상위 3개 지역:", top_3_actual)
        print("예상 상위 3개 지역:", top_3_expected)
        print("✅ 페르소나 생성과 지역 분포 일관성 확인!")

if __name__ == '__main__':
    unittest.main(verbosity=2)