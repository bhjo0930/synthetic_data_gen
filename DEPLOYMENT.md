# Google Cloud Run 배포 가이드

이 가이드는 Synthetic Data Generator를 Google Cloud Run에 배포하는 방법을 설명합니다.

## 📋 사전 준비사항

### 1. Google Cloud Platform 설정
```bash
# Google Cloud SDK 설치 (없는 경우)
# https://cloud.google.com/sdk/docs/install 참조

# Google Cloud 로그인
gcloud auth login

# Docker 인증 설정
gcloud auth configure-docker
```

### 2. 프로젝트 생성 및 설정
```bash
# 새 프로젝트 생성 (옵션)
gcloud projects create your-project-id --name="Synthetic Data Gen"

# 프로젝트 설정
gcloud config set project your-project-id

# 결제 계정 연결 (Google Cloud Console에서 수행)
```

## 🚀 배포 방법

### 방법 1: 자동 배포 스크립트 사용 (권장)

```bash
# 스크립트에 실행 권한 부여 (이미 설정됨)
chmod +x deploy.sh

# 배포 실행
./deploy.sh your-project-id asia-northeast3
```

### 방법 2: 수동 배포

#### 1단계: 필요한 API 활성화
```bash
gcloud services enable \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    containerregistry.googleapis.com
```

#### 2단계: Docker 이미지 빌드 및 푸시
```bash
# 이미지 빌드
docker build -t gcr.io/your-project-id/synthetic-data-gen .

# Container Registry에 푸시
docker push gcr.io/your-project-id/synthetic-data-gen
```

#### 3단계: Cloud Run에 배포
```bash
gcloud run deploy synthetic-data-gen \
    --image gcr.io/your-project-id/synthetic-data-gen \
    --platform managed \
    --region asia-northeast3 \
    --allow-unauthenticated \
    --memory 2Gi \
    --cpu 2 \
    --concurrency 80 \
    --max-instances 10 \
    --timeout 3600 \
    --port 8080
```

### 방법 3: Cloud Build를 통한 CI/CD

```bash
# Cloud Build 트리거 생성
gcloud builds submit --config cloudbuild.yaml .
```

## 🔧 배포 설정

### 리소스 설정
- **메모리**: 2GB (대용량 데이터 처리용)
- **CPU**: 2 vCPU (성능 최적화)
- **동시 요청**: 최대 80개
- **최대 인스턴스**: 10개
- **타임아웃**: 3600초 (1시간)

### 환경 변수
- `PORT`: 8080 (Cloud Run 기본)
- `FLASK_ENV`: production
- `PYTHONPATH`: /app

## 📱 접속 및 사용

배포 완료 후 다음 URL로 접속할 수 있습니다:

```
https://synthetic-data-gen-[hash]-uc.a.run.app
```

### 주요 엔드포인트
- `/`: 메인 페이지 (페르소나 생성 Playground)
- `/static/search.html`: 검색 및 분석 대시보드
- `/api/personas`: API 엔드포인트
- `/api/personas/search`: 검색 API
- `/api/personas/generate`: 생성 API

## 🛠️ 운영 및 관리

### 로그 확인
```bash
# 최근 로그 50개 확인
gcloud logging read \
  "resource.type=cloud_run_revision AND resource.labels.service_name=synthetic-data-gen" \
  --limit 50 --format json

# 실시간 로그 스트리밍
gcloud logging tail \
  "resource.type=cloud_run_revision AND resource.labels.service_name=synthetic-data-gen"
```

### 서비스 상태 확인
```bash
# 서비스 정보 확인
gcloud run services describe synthetic-data-gen --region asia-northeast3

# 서비스 URL 확인
gcloud run services describe synthetic-data-gen \
  --region asia-northeast3 \
  --format 'value(status.url)'
```

### 서비스 업데이트
```bash
# 새 버전 배포
./deploy.sh your-project-id asia-northeast3

# 트래픽 관리 (점진적 배포)
gcloud run services update-traffic synthetic-data-gen \
  --to-revisions=LATEST=100 \
  --region asia-northeast3
```

### 스케일링 설정 변경
```bash
# 최대 인스턴스 수 변경
gcloud run services update synthetic-data-gen \
  --max-instances 20 \
  --region asia-northeast3

# 메모리 설정 변경
gcloud run services update synthetic-data-gen \
  --memory 4Gi \
  --region asia-northeast3
```

## 💰 비용 최적화

### 요금 구조
- **CPU 요금**: 할당된 CPU 사용량에 따라
- **메모리 요금**: 할당된 메모리 사용량에 따라
- **요청 요금**: 100만 요청당 $0.40
- **대역폭 요금**: 송신 데이터에 따라

### 비용 절약 팁
1. **적절한 리소스 할당**: 필요 이상의 CPU/메모리 할당 피하기
2. **최소 인스턴스 설정**: 0으로 설정하여 사용하지 않을 때 비용 절약
3. **동시성 최적화**: 동시 요청 수를 적절히 설정
4. **타임아웃 최적화**: 불필요하게 긴 타임아웃 피하기

## 🔒 보안 설정

### 인증 설정 (선택사항)
```bash
# IAM 인증 활성화 (필요시)
gcloud run services remove-iam-policy-binding synthetic-data-gen \
  --region asia-northeast3 \
  --member="allUsers" \
  --role="roles/run.invoker"
```

### 환경 변수로 민감 정보 관리
```bash
# 환경 변수 설정
gcloud run services update synthetic-data-gen \
  --set-env-vars="API_KEY=your-api-key" \
  --region asia-northeast3
```

## 🚨 문제 해결

### 일반적인 문제

#### 1. 배포 실패
```bash
# 빌드 로그 확인
gcloud builds log [BUILD_ID]

# 컨테이너 로그 확인
gcloud logging read "resource.type=cloud_run_revision" --limit 20
```

#### 2. 메모리 부족
```bash
# 메모리 증가
gcloud run services update synthetic-data-gen \
  --memory 4Gi \
  --region asia-northeast3
```

#### 3. 타임아웃 오류
```bash
# 타임아웃 시간 증가
gcloud run services update synthetic-data-gen \
  --timeout 1800 \
  --region asia-northeast3
```

#### 4. SQLite 데이터 손실
- Cloud Run은 stateless이므로 데이터베이스 파일이 인스턴스 종료시 삭제됩니다
- 영구 데이터 저장이 필요한 경우 Cloud SQL 또는 Firestore 사용을 권장합니다

## 📚 추가 자료

- [Google Cloud Run 공식 문서](https://cloud.google.com/run/docs)
- [Docker 컨테이너 최적화 가이드](https://cloud.google.com/run/docs/tips/general)
- [Cloud Run 요금 계산기](https://cloud.google.com/products/calculator)

## 🎯 다음 단계

1. **모니터링 설정**: Google Cloud Monitoring을 통한 성능 모니터링
2. **알림 설정**: 오류 발생시 알림 설정
3. **백업 전략**: 중요 데이터의 정기 백업 설정
4. **성능 튜닝**: 실사용 데이터를 바탕으로 리소스 최적화

---

배포 과정에서 문제가 발생하면 위의 문제 해결 섹션을 참조하거나 Google Cloud 지원팀에 문의하세요.