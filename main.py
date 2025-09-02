import os
from api import app
from database import PersonaDatabase

if __name__ == '__main__':
    # 애플리케이션 시작 시 데이터베이스 초기화 (선택 사항)
    # db = PersonaDatabase()
    # db.delete_all_personas()
    
    # Cloud Run에서는 PORT 환경변수를 사용
    port = int(os.environ.get('PORT', 5050))
    
    print("페르소나 생성 API 서버를 시작합니다...")
    print(f"포트 {port}에서 서버를 시작합니다.")
    print("/ 로 접속하여 페르소나 생성 Playground를 이용하세요.")
    print("/static/search.html 로 접속하여 페르소나 검색 Playground를 이용하세요.")
    print("\n주의: 5천만 페르소나 생성은 현재 SQLite 및 단일 프로세스 환경에서는 매우 오랜 시간이 소요되며, 시스템 리소스 제약으로 인해 실제 실행이 어렵습니다.")
    print("이를 위해서는 다음과 같은 확장성 전략이 필요합니다:")
    print("1. 분산 데이터베이스 시스템 (예: PostgreSQL, Cassandra) 사용")
    print("2. 배치 처리 및 비동기 처리 도입")
    print("3. 클라우드 기반의 분산 컴퓨팅 환경 (예: AWS Lambda, Kubernetes) 활용")
    print("4. LLM 연동 시, LLM API 호출 비용 및 속도 고려")
    print("현재 구현은 한국 인구통계 및 문화적 특성을 반영한 페르소나 생성 로직에 중점을 둡니다.")
    
    # 프로덕션에서는 debug=False 사용
    debug_mode = os.environ.get('FLASK_ENV', 'production') == 'development'
    app.run(debug=debug_mode, host='0.0.0.0', port=port)