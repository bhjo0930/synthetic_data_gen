"""
데이터베이스 추상화 인터페이스
SQLite와 Supabase를 선택적으로 사용할 수 있도록 하는 추상화 레이어
"""

from abc import ABC, abstractmethod
from typing import List, Dict, Optional, Any

class DatabaseInterface(ABC):
    """데이터베이스 공통 인터페이스"""
    
    @abstractmethod
    def insert_persona(self, persona: Dict[str, Any]) -> bool:
        """페르소나 데이터를 삽입합니다."""
        pass
    
    @abstractmethod
    def get_persona(self, persona_id: str) -> Optional[Dict[str, Any]]:
        """특정 ID의 페르소나를 조회합니다."""
        pass
    
    @abstractmethod
    def search_personas(self, filters: Dict[str, Any] = None, limit: int = 100, offset: int = 0) -> List[Dict[str, Any]]:
        """필터 조건에 맞는 페르소나들을 검색합니다."""
        pass
    
    @abstractmethod
    def update_persona(self, persona_id: str, updates: Dict[str, Any]) -> bool:
        """페르소나 정보를 업데이트합니다."""
        pass
    
    @abstractmethod
    def delete_persona(self, persona_id: str) -> bool:
        """특정 페르소나를 삭제합니다."""
        pass
    
    @abstractmethod
    def delete_all_personas(self) -> bool:
        """모든 페르소나를 삭제합니다."""
        pass
    
    @abstractmethod
    def get_total_count(self, filters: Dict[str, Any] = None) -> int:
        """필터 조건에 맞는 총 페르소나 수를 반환합니다."""
        pass
    
    @abstractmethod
    def get_statistics(self) -> Dict[str, Any]:
        """데이터베이스 통계 정보를 반환합니다."""
        pass
    
    @abstractmethod
    def health_check(self) -> bool:
        """데이터베이스 연결 상태를 확인합니다."""
        pass