#!/bin/bash
set -e

echo "🚀 Deploying ecom-backend..."

# 1. Đăng nhập Docker Hub
docker login -u "$DOCKERHUB_USERNAME" -p "$DOCKERHUB_PASSWORD"

# 2. Kéo image mới
docker pull plongtran239/ecom-backend:v0

# 3. Gỡ container cũ & orphan
docker compose down --remove-orphans

# 4. Chạy lại
docker compose up -d

# 5. Prisma migrate
docker exec ecom-backend npx prisma migrate deploy

# 6. Dọn rác image
docker image prune -f

echo "✅ Deployment completed!"