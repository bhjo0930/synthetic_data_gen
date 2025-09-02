#!/bin/bash

# Google Cloud Run 배포 스크립트 (Artifact Registry 버전)
# 사용법: ./deploy-ar.sh [PROJECT_ID] [REGION]

set -e

# 기본값 설정
PROJECT_ID=${1:-"your-project-id"}
REGION=${2:-"asia-northeast3"}
SERVICE_NAME="synthetic-data-gen"
REPOSITORY_NAME="synthetic-data-gen-repo"

echo "🚀 Google Cloud Run 배포 시작 (Artifact Registry)"
echo "프로젝트: $PROJECT_ID"
echo "지역: $REGION"
echo "서비스: $SERVICE_NAME"
echo "저장소: $REPOSITORY_NAME"
echo

# 1. Google Cloud 프로젝트 설정
echo "1. Google Cloud 프로젝트 설정 중..."
gcloud config set project $PROJECT_ID

# 2. 필요한 API 활성화
echo "2. 필요한 API 활성화 중..."
gcloud services enable \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    artifactregistry.googleapis.com

# 3. Artifact Registry 저장소 생성 (이미 존재하면 무시)
echo "3. Artifact Registry 저장소 생성 중..."
gcloud artifacts repositories create $REPOSITORY_NAME \
    --repository-format=docker \
    --location=$REGION \
    --description="Synthetic Data Generator Docker repository" || echo "저장소가 이미 존재합니다."

# 4. Docker 인증 설정
echo "4. Docker 인증 설정 중..."
gcloud auth configure-docker $REGION-docker.pkg.dev --quiet

# 5. Docker 이미지 빌드 및 푸시
echo "5. Docker 이미지 빌드 및 푸시 중..."
IMAGE_NAME="$REGION-docker.pkg.dev/$PROJECT_ID/$REPOSITORY_NAME/$SERVICE_NAME:latest"
docker build -t $IMAGE_NAME .
docker push $IMAGE_NAME

# 6. Cloud Run에 배포
echo "6. Cloud Run에 배포 중..."
gcloud run deploy $SERVICE_NAME \
    --image $IMAGE_NAME \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --memory 2Gi \
    --cpu 2 \
    --concurrency 80 \
    --max-instances 10 \
    --timeout 3600 \
    --port 8080

# 7. 배포 완료 확인
echo
echo "✅ 배포 완료!"
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)')
echo "서비스 URL: $SERVICE_URL"
echo
echo "📱 접속 방법:"
echo "- 메인 페이지: $SERVICE_URL"
echo "- 검색 페이지: $SERVICE_URL/static/search.html"
echo "- API 문서: $SERVICE_URL/api/personas"
echo

# 8. 로그 확인 방법 안내
echo "📋 로그 확인:"
echo "gcloud logging read \"resource.type=cloud_run_revision AND resource.labels.service_name=$SERVICE_NAME\" --limit 50 --format json"
echo

echo "🎉 배포가 성공적으로 완료되었습니다!"