#!/usr/bin/env bash
#
# Build and push backend + frontend images to Amazon ECR.
#
# Prerequisites:
#   - AWS CLI v2 (aws configure)
#   - ECR repositories created (or let this script create them)
#
# Usage:
#   AWS_REGION=us-east-1 AWS_ACCOUNT_ID=123456789012 ./build-and-push.sh
#
set -euo pipefail

REGION="${AWS_REGION:-us-east-1}"
ACCOUNT_ID="${AWS_ACCOUNT_ID:-}"
ECR="$( [ -n "$ACCOUNT_ID" ] && echo "${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com" )"

if [ -z "${ACCOUNT_ID:-}" ]; then
  ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
  ECR="${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com"
fi

REPO_BACKEND="risk-register/backend"
REPO_FRONTEND="risk-register/frontend"

echo "Logging into ECR (${REGION})..."
aws ecr get-login-password --region "${REGION}" \
  | docker login --username AWS --password-stdin "${ECR}"

for repo in "${REPO_BACKEND}" "${REPO_FRONTEND}"; do
  if ! aws ecr describe-repositories --repository-names "${repo}" --region "${REGION}" >/dev/null 2>&1; then
    echo "Creating repository ${repo}..."
    aws ecr create-repository --repository-name "${repo}" --region "${REGION}" >/dev/null
  fi
done

echo "Building backend image..."
docker build -t "${ECR}/${REPO_BACKEND}:latest" ../backend
docker push "${ECR}/${REPO_BACKEND}:latest"

echo "Building frontend image..."
docker build -t "${ECR}/${REPO_FRONTEND}:latest" ../frontend
docker push "${ECR}/${REPO_FRONTEND}:latest"

echo ""
echo "Done. Image URIs:"
echo "  Backend:  ${ECR}/${REPO_BACKEND}:latest"
echo "  Frontend: ${ECR}/${REPO_FRONTEND}:latest"
echo ""
echo "Next: create the ECS cluster + RDS (see ../docs/aws-deployment.md) and"
echo "register task definitions, pointing them at these image URIs."