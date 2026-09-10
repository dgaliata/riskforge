# AWS Deployment Guide (ECS Fargate + RDS + Secrets Manager)

This guide deploys RiskForge to AWS using Fargate services (frontend + backend)
with an RDS PostgreSQL instance and the database connection string stored in AWS Secrets Manager.

## 1. Prerequisites

- AWS CLI v2 installed and configured (`aws configure`)
- Docker running locally

## 2. Build and push images to Amazon ECR

```bash
cd deploy
./build-and-push.sh
```

This creates `risk-register/backend` and `risk-register/frontend` repositories in ECR
and pushes a `latest` image to each. Note the two image URIs printed at the end.

## 3. Create the RDS PostgreSQL database

```bash
REGION=us-east-1
DB_USER=riskuser
DB_PASS="$(openssl rand -base64 24)"

aws rds create-db-instance \
  --db-instance-identifier risk-register-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username "$DB_USER" \
  --master-user-password "$DB_PASS" \
  --allocated-storage 20 \
  --multi-az false \
  --publicly-accessible false \
  --backup-retention-period 7
```

Wait for availability:

```bash
aws rds wait db-instance-available --db-instance-identifier risk-register-db
RDS_ENDPOINT=$(aws rds describe-db-instances \
  --db-instance-identifier risk-register-db \
  --query 'DBInstances[0].Endpoint.Address' --output text)
```

## 4. Create the Postgres database and store the connection string

Once the instance is reachable (from a jump host or the Fargate task's security group
allows 5432 from itself), create the database:

```bash
psql "host=$RDS_ENDPOINT user=$DB_USER password=$DB_PASS dbname=postgres" -c "CREATE DATABASE riskregister;"
```

Store the SQLAlchemy connection string in Secrets Manager:

```bash
DATABASE_URL="postgresql+psycopg2://$DB_USER:$DB_PASS@$RDS_ENDPOINT:5432/riskregister"
aws secretsmanager create-secret \
  --name risk-register-db-secret \
  --secret-string "{\"DATABASE_URL\":\"$DATABASE_URL\"}"
```

> Note: `DATABASE_URL` is read via the task definition's `secrets` block, so the JSON
> key must match the name in `task-definition-backend.json`.

## 5. Create the ECS cluster, services, and load balancer

1. Create a cluster:
   ```bash
   aws ecs create-cluster --cluster-name risk-register
   ```
2. Create an Application Load Balancer and two target groups (HTTP:80 for frontend,
   HTTP:8000 health-check target `/api/health`). Attach them to an internet-facing
   listener for the frontend.
3. Create an ECS execution role with `AmazonECSTaskExecutionRolePolicy` plus policy to
   read `risk-register-db-secret`.

## 6. Register task definitions

Substitute your placeholders (image URIs, account ID, region, secret ARN), then:

```bash
sed -e "s|REPLACE_ME_ECR_BACKEND|<backend image URI>|" \
    -e "s|REGION|$REGION|g" \
    -e "s|ACCOUNT_ID|<account id>|" \
    -e "s|arn:aws:secretsmanager:REGION:ACCOUNT_ID|<secret ARN>|" \
    task-definition-backend.json > td-backend.json

sed -e "s|REPLACE_ME_ECR_FRONTEND|<frontend image URI>|" \
    -e "s|REGION|$REGION|g" \
    task-definition-frontend.json > td-frontend.json

aws ecs register-task-definition --cli-input-json file://td-backend.json
aws ecs register-task-definition --cli-input-json file://td-frontend.json
```

## 7. Create services

```bash
aws ecs create-service \
  --cluster risk-register \
  --service-name backend \
  --task-definition risk-register-backend \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration \
    "awsvpcConfiguration={subnets=[<private subnet>],securityGroups=[<backend sg>],assignPublicIp=DISABLED}" \
  --health-check-grace-period-seconds 60

aws ecs create-service \
  --cluster risk-register \
  --service-name frontend \
  --task-definition risk-register-frontend \
  --desired-count 1 \
  --launch-type FARGATE \
  --load-balancers "targetGroupArn=<frontend tg arn>,containerName=frontend,containerPort=80" \
  --network-configuration \
    "awsvpcConfiguration={subnets=[<public subnet>],securityGroups=[<frontend sg>],assignPublicIp=ENABLED}"
```

> DNS: In `task-definition-frontend.json` no `BACKEND_HOST` environment variable is set,
> so the nginx entrypoint defaults to `backend`. For Fargate awsvpc networking, register
> the backend service in an ECS Service Connect / Cloud Map namespace named `backend` so
> the frontend can resolve it. Alternatively deploy both containers in a single task and
> set `BACKEND_HOST=127.0.0.1`.

## 8. Security groups (hardening)

- Backend SG: allow TCP 8000 only from the frontend SG.
- Frontend SG: allow TCP 80 from the ALB.
- DB SG: allow TCP 5432 only from the backend SG.
- Secrets in Secrets Manager are encrypted with KMS; use `aws:kms` on the secret.

## 9. Open the app

```
http://<ALB-DNS-NAME>/
```

The backend seeds the NIST 800-53 control catalog and the NIST AI RMF 1.0 framework
automatically on first startup (`SEED_ON_STARTUP=true`). The register starts empty so
you can begin entering risks.

## 10. Notes / next steps

- Use **Amazon CloudWatch** for logs (`awslogs-group` already configured in task definitions).
- Add **authentication** before exposing publicly: ALB OIDC (Cognito), WAF, or an API gateway.
- Point `SEED_ON_STARTUP=false` after bootstrap to avoid rescoping.
- The control catalog lives in `backend/app/nist_controls_data.py` — edit it to customize
  baselines, priorities, or statements without touching the schema or UI.