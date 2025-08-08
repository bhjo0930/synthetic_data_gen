# -*- coding: utf-8 -*-
"""
시계열 데이터 모듈: 연도별 한국 사회 트렌드 변화 반영
Korean Time-Series Data Module for Demographic and Cultural Trends
"""

from datetime import datetime
from typing import Dict, Any, Optional
import random

class TimeSeriesDataManager:
    """한국 사회의 연도별 트렌드 변화를 반영하는 시계열 데이터 관리자"""
    
    def __init__(self):
        self.base_year = 2024
        self.data_range = (2020, 2030)  # 2020-2030년 데이터 범위
        self._load_timeseries_data()
    
    def _load_timeseries_data(self):
        """연도별 트렌드 데이터 로드"""
        self.timeseries_data = {
            # 인구통계학적 변화 트렌드
            "demographic_trends": {
                2020: {
                    "age_distribution": {
                        "0-9": 0.089, "10-19": 0.095, "20-29": 0.135, "30-39": 0.145,
                        "40-49": 0.168, "50-59": 0.163, "60-69": 0.118, "70-79": 0.065,
                        "80+": 0.042
                    },
                    "regional_distribution": {
                        "서울": 0.188, "부산": 0.067, "대구": 0.048, "인천": 0.058, "광주": 0.029,
                        "대전": 0.030, "울산": 0.023, "세종": 0.006, "경기": 0.250, "강원": 0.030,
                        "충북": 0.031, "충남": 0.042, "전북": 0.036, "전남": 0.037, "경북": 0.053,
                        "경남": 0.067, "제주": 0.013
                    },
                    "birth_rate": 0.84,  # 합계출산율 (2020년)
                    "urbanization_rate": 0.813  # 도시화율
                },
                2021: {
                    "age_distribution": {
                        "0-9": 0.087, "10-19": 0.093, "20-29": 0.133, "30-39": 0.144,
                        "40-49": 0.167, "50-59": 0.164, "60-69": 0.120, "70-79": 0.067,
                        "80+": 0.045
                    },
                    "regional_distribution": {
                        "서울": 0.185, "부산": 0.066, "대구": 0.047, "인천": 0.059, "광주": 0.029,
                        "대전": 0.030, "울산": 0.022, "세종": 0.007, "경기": 0.254, "강원": 0.029,
                        "충북": 0.031, "충남": 0.043, "전북": 0.035, "전남": 0.036, "경북": 0.052,
                        "경남": 0.066, "제주": 0.014
                    },
                    "birth_rate": 0.81,
                    "urbanization_rate": 0.816
                },
                2022: {
                    "age_distribution": {
                        "0-9": 0.085, "10-19": 0.091, "20-29": 0.131, "30-39": 0.143,
                        "40-49": 0.166, "50-59": 0.165, "60-69": 0.122, "70-79": 0.069,
                        "80+": 0.048
                    },
                    "regional_distribution": {
                        "서울": 0.182, "부산": 0.065, "대구": 0.046, "인천": 0.060, "광주": 0.028,
                        "대전": 0.029, "울산": 0.021, "세종": 0.008, "경기": 0.258, "강원": 0.029,
                        "충북": 0.031, "충남": 0.044, "전북": 0.034, "전남": 0.035, "경북": 0.051,
                        "경남": 0.065, "제주": 0.015
                    },
                    "birth_rate": 0.78,
                    "urbanization_rate": 0.819
                },
                2023: {
                    "age_distribution": {
                        "0-9": 0.083, "10-19": 0.089, "20-29": 0.129, "30-39": 0.142,
                        "40-49": 0.165, "50-59": 0.166, "60-69": 0.124, "70-79": 0.071,
                        "80+": 0.051
                    },
                    "regional_distribution": {
                        "서울": 0.179, "부산": 0.064, "대구": 0.045, "인천": 0.061, "광주": 0.028,
                        "대전": 0.029, "울산": 0.020, "세종": 0.009, "경기": 0.262, "강원": 0.028,
                        "충북": 0.031, "충남": 0.045, "전북": 0.033, "전남": 0.034, "경북": 0.050,
                        "경남": 0.064, "제주": 0.016
                    },
                    "birth_rate": 0.72,
                    "urbanization_rate": 0.822
                },
                2024: {
                    "age_distribution": {
                        "0-9": 0.081, "10-19": 0.087, "20-29": 0.127, "30-39": 0.141,
                        "40-49": 0.164, "50-59": 0.167, "60-69": 0.126, "70-79": 0.073,
                        "80+": 0.054
                    },
                    "regional_distribution": {
                        "서울": 0.176, "부산": 0.063, "대구": 0.044, "인천": 0.062, "광주": 0.027,
                        "대전": 0.028, "울산": 0.019, "세종": 0.010, "경기": 0.266, "강원": 0.027,
                        "충북": 0.031, "충남": 0.046, "전북": 0.032, "전남": 0.033, "경북": 0.049,
                        "경남": 0.063, "제주": 0.017
                    },
                    "birth_rate": 0.70,
                    "urbanization_rate": 0.825
                }
            },
            
            # 기술 채택 및 디지털 트렌드
            "technology_adoption": {
                2020: {
                    "smartphone_penetration": 0.945,
                    "internet_usage": 0.914,
                    "social_media_users": 0.756,
                    "online_shopping_adoption": 0.678,
                    "streaming_service_usage": 0.423,
                    "digital_payment_usage": 0.567
                },
                2021: {
                    "smartphone_penetration": 0.951,
                    "internet_usage": 0.923,
                    "social_media_users": 0.784,
                    "online_shopping_adoption": 0.721,
                    "streaming_service_usage": 0.489,
                    "digital_payment_usage": 0.634
                },
                2022: {
                    "smartphone_penetration": 0.957,
                    "internet_usage": 0.932,
                    "social_media_users": 0.812,
                    "online_shopping_adoption": 0.764,
                    "streaming_service_usage": 0.555,
                    "digital_payment_usage": 0.701
                },
                2023: {
                    "smartphone_penetration": 0.963,
                    "internet_usage": 0.941,
                    "social_media_users": 0.840,
                    "online_shopping_adoption": 0.807,
                    "streaming_service_usage": 0.621,
                    "digital_payment_usage": 0.768
                },
                2024: {
                    "smartphone_penetration": 0.969,
                    "internet_usage": 0.950,
                    "social_media_users": 0.868,
                    "online_shopping_adoption": 0.850,
                    "streaming_service_usage": 0.687,
                    "digital_payment_usage": 0.835
                }
            },
            
            # 사회문화적 트렌드 변화
            "cultural_trends": {
                2020: {
                    "work_life_balance_importance": 0.623,
                    "environmental_consciousness": 0.445,
                    "health_consciousness": 0.678,
                    "individual_vs_collective": 0.534,  # 개인주의 성향 (0=집단주의, 1=개인주의)
                    "gender_equality_awareness": 0.612,
                    "mental_health_awareness": 0.456
                },
                2021: {
                    "work_life_balance_importance": 0.651,
                    "environmental_consciousness": 0.478,
                    "health_consciousness": 0.712,
                    "individual_vs_collective": 0.548,
                    "gender_equality_awareness": 0.634,
                    "mental_health_awareness": 0.489
                },
                2022: {
                    "work_life_balance_importance": 0.679,
                    "environmental_consciousness": 0.511,
                    "health_consciousness": 0.746,
                    "individual_vs_collective": 0.562,
                    "gender_equality_awareness": 0.656,
                    "mental_health_awareness": 0.522
                },
                2023: {
                    "work_life_balance_importance": 0.707,
                    "environmental_consciousness": 0.544,
                    "health_consciousness": 0.780,
                    "individual_vs_collective": 0.576,
                    "gender_equality_awareness": 0.678,
                    "mental_health_awareness": 0.555
                },
                2024: {
                    "work_life_balance_importance": 0.735,
                    "environmental_consciousness": 0.577,
                    "health_consciousness": 0.814,
                    "individual_vs_collective": 0.590,
                    "gender_equality_awareness": 0.700,
                    "mental_health_awareness": 0.588
                }
            },
            
            # 소비 행태 변화
            "consumption_patterns": {
                2020: {
                    "online_vs_offline_shopping": 0.468,  # 온라인 비중
                    "delivery_service_usage": 0.534,
                    "subscription_economy": 0.234,
                    "secondhand_market": 0.345,
                    "local_business_preference": 0.423,
                    "premium_vs_cost_effective": 0.456,  # 프리미엄 선호도
                    "experiential_vs_material": 0.512   # 경험 소비 선호도
                },
                2021: {
                    "online_vs_offline_shopping": 0.521,
                    "delivery_service_usage": 0.587,
                    "subscription_economy": 0.278,
                    "secondhand_market": 0.378,
                    "local_business_preference": 0.445,
                    "premium_vs_cost_effective": 0.443,
                    "experiential_vs_material": 0.498
                },
                2022: {
                    "online_vs_offline_shopping": 0.574,
                    "delivery_service_usage": 0.640,
                    "subscription_economy": 0.322,
                    "secondhand_market": 0.411,
                    "local_business_preference": 0.467,
                    "premium_vs_cost_effective": 0.430,
                    "experiential_vs_material": 0.484
                },
                2023: {
                    "online_vs_offline_shopping": 0.627,
                    "delivery_service_usage": 0.693,
                    "subscription_economy": 0.366,
                    "secondhand_market": 0.444,
                    "local_business_preference": 0.489,
                    "premium_vs_cost_effective": 0.417,
                    "experiential_vs_material": 0.470
                },
                2024: {
                    "online_vs_offline_shopping": 0.680,
                    "delivery_service_usage": 0.746,
                    "subscription_economy": 0.410,
                    "secondhand_market": 0.477,
                    "local_business_preference": 0.511,
                    "premium_vs_cost_effective": 0.404,
                    "experiential_vs_material": 0.456
                }
            },
            
            # 미디어 소비 트렌드
            "media_consumption": {
                2020: {
                    "traditional_tv": 0.623,
                    "streaming_services": 0.434,
                    "youtube_usage": 0.812,
                    "social_media_time": 0.567,
                    "podcast_usage": 0.234,
                    "news_source_digital": 0.678,
                    "short_form_content": 0.445
                },
                2021: {
                    "traditional_tv": 0.589,
                    "streaming_services": 0.487,
                    "youtube_usage": 0.834,
                    "social_media_time": 0.591,
                    "podcast_usage": 0.267,
                    "news_source_digital": 0.712,
                    "short_form_content": 0.512
                },
                2022: {
                    "traditional_tv": 0.555,
                    "streaming_services": 0.540,
                    "youtube_usage": 0.856,
                    "social_media_time": 0.615,
                    "podcast_usage": 0.300,
                    "news_source_digital": 0.746,
                    "short_form_content": 0.579
                },
                2023: {
                    "traditional_tv": 0.521,
                    "streaming_services": 0.593,
                    "youtube_usage": 0.878,
                    "social_media_time": 0.639,
                    "podcast_usage": 0.333,
                    "news_source_digital": 0.780,
                    "short_form_content": 0.646
                },
                2024: {
                    "traditional_tv": 0.487,
                    "streaming_services": 0.646,
                    "youtube_usage": 0.900,
                    "social_media_time": 0.663,
                    "podcast_usage": 0.366,
                    "news_source_digital": 0.814,
                    "short_form_content": 0.713
                }
            }
        }
        
        # 미래 트렌드 예측 (2025-2030)
        self._generate_future_projections()
    
    def _generate_future_projections(self):
        """2025-2030년 미래 트렌드 예측 생성"""
        # 저출산 고령화 지속
        for year in range(2025, 2031):
            if year not in self.timeseries_data["demographic_trends"]:
                prev_year = year - 1
                prev_data = self.timeseries_data["demographic_trends"][prev_year]
                
                # 연령 분포 변화 (고령화 가속)
                new_age_dist = prev_data["age_distribution"].copy()
                new_age_dist["0-9"] = max(0.05, new_age_dist["0-9"] - 0.002)
                new_age_dist["10-19"] = max(0.06, new_age_dist["10-19"] - 0.002)
                new_age_dist["60-69"] = min(0.15, new_age_dist["60-69"] + 0.002)
                new_age_dist["70-79"] = min(0.10, new_age_dist["70-79"] + 0.002)
                new_age_dist["80+"] = min(0.08, new_age_dist["80+"] + 0.003)
                
                # 지역 분포 변화 (수도권 집중 지속)
                new_regional_dist = prev_data["regional_distribution"].copy()
                new_regional_dist["경기"] = min(0.28, new_regional_dist["경기"] + 0.002)
                new_regional_dist["세종"] = min(0.015, new_regional_dist["세종"] + 0.001)
                
                self.timeseries_data["demographic_trends"][year] = {
                    "age_distribution": new_age_dist,
                    "regional_distribution": new_regional_dist,
                    "birth_rate": max(0.5, prev_data["birth_rate"] - 0.02),
                    "urbanization_rate": min(0.85, prev_data["urbanization_rate"] + 0.003)
                }
        
        # 기술 채택률 증가
        for year in range(2025, 2031):
            if year not in self.timeseries_data["technology_adoption"]:
                prev_year = year - 1
                prev_data = self.timeseries_data["technology_adoption"][prev_year]
                
                self.timeseries_data["technology_adoption"][year] = {
                    "smartphone_penetration": min(0.99, prev_data["smartphone_penetration"] + 0.006),
                    "internet_usage": min(0.99, prev_data["internet_usage"] + 0.009),
                    "social_media_users": min(0.95, prev_data["social_media_users"] + 0.028),
                    "online_shopping_adoption": min(0.95, prev_data["online_shopping_adoption"] + 0.043),
                    "streaming_service_usage": min(0.90, prev_data["streaming_service_usage"] + 0.066),
                    "digital_payment_usage": min(0.95, prev_data["digital_payment_usage"] + 0.067)
                }
        
        # 문화적 트렌드 진화
        for year in range(2025, 2031):
            if year not in self.timeseries_data["cultural_trends"]:
                prev_year = year - 1
                prev_data = self.timeseries_data["cultural_trends"][prev_year]
                
                self.timeseries_data["cultural_trends"][year] = {
                    "work_life_balance_importance": min(0.85, prev_data["work_life_balance_importance"] + 0.028),
                    "environmental_consciousness": min(0.80, prev_data["environmental_consciousness"] + 0.033),
                    "health_consciousness": min(0.90, prev_data["health_consciousness"] + 0.034),
                    "individual_vs_collective": min(0.70, prev_data["individual_vs_collective"] + 0.014),
                    "gender_equality_awareness": min(0.85, prev_data["gender_equality_awareness"] + 0.022),
                    "mental_health_awareness": min(0.80, prev_data["mental_health_awareness"] + 0.033)
                }
    
    def get_year_data(self, year: int) -> Dict[str, Any]:
        """특정 연도의 모든 트렌드 데이터 반환"""
        if not (self.data_range[0] <= year <= self.data_range[1]):
            year = self.base_year
            
        return {
            "demographic_trends": self.timeseries_data["demographic_trends"].get(year, {}),
            "technology_adoption": self.timeseries_data["technology_adoption"].get(year, {}),
            "cultural_trends": self.timeseries_data["cultural_trends"].get(year, {}),
            "consumption_patterns": self.timeseries_data["consumption_patterns"].get(year, {}),
            "media_consumption": self.timeseries_data["media_consumption"].get(year, {})
        }
    
    def get_trend_factor(self, category: str, metric: str, year: int) -> float:
        """특정 메트릭의 연도별 트렌드 팩터 반환 (0.0 ~ 1.0)"""
        if not (self.data_range[0] <= year <= self.data_range[1]):
            year = self.base_year
            
        try:
            return self.timeseries_data[category][year][metric]
        except KeyError:
            return 0.5  # 기본값
    
    def interpolate_trend(self, category: str, metric: str, start_year: int, end_year: int, target_year: int) -> float:
        """두 연도 사이의 트렌드 보간"""
        if target_year <= start_year:
            return self.get_trend_factor(category, metric, start_year)
        if target_year >= end_year:
            return self.get_trend_factor(category, metric, end_year)
        
        start_value = self.get_trend_factor(category, metric, start_year)
        end_value = self.get_trend_factor(category, metric, end_year)
        
        # 선형 보간
        ratio = (target_year - start_year) / (end_year - start_year)
        return start_value + (end_value - start_value) * ratio
    
    def get_generational_trends(self, year: int) -> Dict[str, Dict[str, float]]:
        """연도별 세대 특성 트렌드 반환"""
        cultural_data = self.get_year_data(year)["cultural_trends"]
        tech_data = self.get_year_data(year)["technology_adoption"]
        
        # 기본 세대별 특성에 연도별 트렌드 반영
        return {
            "Z세대": {
                "digital_nativity": min(1.0, 0.9 + tech_data.get("social_media_users", 0.5) * 0.1),
                "individualism": cultural_data.get("individual_vs_collective", 0.5),
                "environmental_consciousness": cultural_data.get("environmental_consciousness", 0.5),
                "work_life_balance": cultural_data.get("work_life_balance_importance", 0.5),
                "mental_health_awareness": cultural_data.get("mental_health_awareness", 0.5)
            },
            "밀레니얼": {
                "digital_adoption": tech_data.get("smartphone_penetration", 0.8),
                "experience_priority": cultural_data.get("work_life_balance_importance", 0.6),
                "social_consciousness": cultural_data.get("gender_equality_awareness", 0.6),
                "health_consciousness": cultural_data.get("health_consciousness", 0.7),
                "financial_tech_usage": tech_data.get("digital_payment_usage", 0.6)
            },
            "X세대": {
                "pragmatism": 0.7,
                "technology_adaptation": tech_data.get("internet_usage", 0.7),
                "work_life_balance": cultural_data.get("work_life_balance_importance", 0.5),
                "health_consciousness": cultural_data.get("health_consciousness", 0.6),
                "individualism": cultural_data.get("individual_vs_collective", 0.4)
            },
            "베이비부머": {
                "traditional_values": max(0.3, 1.0 - cultural_data.get("individual_vs_collective", 0.5)),
                "family_centrism": max(0.6, 1.0 - cultural_data.get("individual_vs_collective", 0.5) * 0.5),
                "technology_adoption": tech_data.get("internet_usage", 0.5) * 0.7,
                "stability_preference": max(0.7, 1.0 - cultural_data.get("work_life_balance_importance", 0.5) * 0.3),
                "community_orientation": max(0.5, 1.0 - cultural_data.get("individual_vs_collective", 0.5))
            }
        }
    
    def get_regional_trends(self, year: int) -> Dict[str, Dict[str, float]]:
        """연도별 지역 특성 트렌드 반환"""
        tech_data = self.get_year_data(year)["technology_adoption"]
        cultural_data = self.get_year_data(year)["cultural_trends"]
        
        return {
            "서울": {
                "tech_adoption": tech_data.get("smartphone_penetration", 0.9),
                "work_life_balance": cultural_data.get("work_life_balance_importance", 0.7),
                "individualism": cultural_data.get("individual_vs_collective", 0.6),
                "cultural_diversity": min(1.0, 0.7 + (year - 2020) * 0.02)
            },
            "부산": {
                "tech_adoption": tech_data.get("smartphone_penetration", 0.8) * 0.9,
                "community_spirit": max(0.5, 1.0 - cultural_data.get("individual_vs_collective", 0.5)),
                "openness": 0.8,
                "traditional_values": max(0.4, 1.0 - (year - 2020) * 0.01)
            },
            "경기": {
                "tech_adoption": tech_data.get("smartphone_penetration", 0.85),
                "pragmatism": 0.75,
                "work_life_balance": cultural_data.get("work_life_balance_importance", 0.65),
                "seoul_connectivity": min(1.0, 0.8 + (year - 2020) * 0.01)
            }
            # 다른 지역들도 유사하게 정의 가능
        }

if __name__ == "__main__":
    # 테스트 코드
    ts_manager = TimeSeriesDataManager()
    
    print("=== 2024년 데이터 ===")
    data_2024 = ts_manager.get_year_data(2024)
    print(f"스마트폰 보급률: {data_2024['technology_adoption']['smartphone_penetration']:.1%}")
    print(f"워라밸 중요도: {data_2024['cultural_trends']['work_life_balance_importance']:.1%}")
    
    print("\n=== 세대별 트렌드 (2024년) ===")
    gen_trends = ts_manager.get_generational_trends(2024)
    for generation, trends in gen_trends.items():
        print(f"{generation}: {trends}")
    
    print("\n=== 트렌드 변화 비교 (2020 vs 2024) ===")
    online_2020 = ts_manager.get_trend_factor("consumption_patterns", "online_vs_offline_shopping", 2020)
    online_2024 = ts_manager.get_trend_factor("consumption_patterns", "online_vs_offline_shopping", 2024)
    print(f"온라인 쇼핑 비중: {online_2020:.1%} (2020) → {online_2024:.1%} (2024)")