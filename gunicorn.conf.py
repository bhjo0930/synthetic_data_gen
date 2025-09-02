# Gunicorn 설정 파일
import os

# 바인드 주소 및 포트
bind = f"0.0.0.0:{os.environ.get('PORT', '8080')}"

# Worker 설정
workers = 1  # Cloud Run에서는 단일 worker 권장
worker_class = "gthread"
threads = 8  # I/O 집약적 작업을 위한 멀티 스레딩

# 타임아웃 설정
timeout = 3600  # 1시간 (대용량 데이터 생성 고려)
keepalive = 2

# 메모리 관리
max_requests = 100
max_requests_jitter = 10
preload_app = True

# 로깅 설정
loglevel = "info"
accesslog = "-"  # stdout으로 출력
errorlog = "-"   # stderr으로 출력
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" %(D)s'

# 프로세스 이름
proc_name = "synthetic-data-gen"

# 보안 설정
forwarded_allow_ips = "*"
secure_scheme_headers = {
    'X-FORWARDED-PROTO': 'https',
}

# 스타트업 최적화
worker_connections = 1000
worker_tmp_dir = "/dev/shm"  # 메모리 기반 임시 디렉토리

# 환경별 설정
if os.environ.get('FLASK_ENV') == 'development':
    reload = True
    loglevel = "debug"