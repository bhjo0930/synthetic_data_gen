# Python 3.11 슬림 이미지를 베이스로 사용 (x86-64 플랫폼 명시)
FROM --platform=linux/amd64 python:3.11-slim

# 작업 디렉토리 설정
WORKDIR /app

# 시스템 패키지 업데이트 및 필요한 패키지 설치
RUN apt-get update && apt-get install -y \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Python 의존성 파일 복사 및 설치
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# 애플리케이션 코드 복사
COPY . .

# SQLite 데이터베이스 디렉토리 생성 및 권한 설정
RUN mkdir -p /app/data && chmod 777 /app/data

# Python 모듈 import 테스트
RUN python -c "import sys; print('Python version:', sys.version)"
RUN python -c "from persona_generator import PersonaGenerator; print('PersonaGenerator OK')"
RUN python -c "from database_factory import get_database; print('Database factory OK')"
RUN python -c "from api import app; print('Flask app OK')"

# 환경 변수 설정
ENV PYTHONPATH=/app
ENV FLASK_ENV=production
ENV PORT=8080
ENV PYTHONUNBUFFERED=1

# 포트 노출
EXPOSE 8080

# 상세한 시작 스크립트 사용
CMD python start.py