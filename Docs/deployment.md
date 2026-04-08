# Deployment

## Overview

```
Infrastructure Layout:

                    ┌─────────────────────────────────────┐
                    │         Cloud VM / Server            │
                    │                                      │
                    │  ┌─────────────────────────────┐    │
                    │  │      nginx (TLS)            │    │
                    │  └──────────┬──────────────────┘    │
                    │             │                        │
                    │  ┌──────────▼──────────────────┐    │
                    │  │      Next.js (3000)         │    │
                    │  │      FastAPI (8000)         │    │
                    │  │      Celery Worker          │    │
                    │  └──────────┬──────────────────┘    │
                    │             │                        │
                    │  ┌──────────▼──────────────────┐    │
                    │  │      PostgreSQL (5432)      │    │
                    │  │      Redis (6379)           │    │
                    │  │      Qdrant (6333)          │    │
                    │  └─────────────────────────────┘    │
                    │                                      │
                    └─────────────────────────────────────┘
                               │
                    ┌──────────▼──────────────────┐
                    │      S3 / R2 (external)     │
                    └─────────────────────────────┘
```

## Prerequisites

- Docker + Docker Compose
- Cloud VM or any Linux machine with SSH access
- Domain name (optional, for TLS)

## Services

| Service      | Port  | Purpose                    |
| ------------ | ----- | -------------------------- |
| PostgreSQL   | 5432  | Primary database           |
| Redis        | 6379  | Cache + Celery broker      |
| Qdrant       | 6333  | Vector embeddings          |
| FastAPI      | 8000  | REST API                   |
| Celery Worker| —     | ML pipeline execution      |
| Next.js      | 3000  | Frontend (SSR)             |

## Docker Compose

```yaml
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: vim
      POSTGRES_USER: vim_user
      POSTGRES_PASSWORD: <password>
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine

  qdrant:
    image: qdrant/qdrant:latest
    volumes:
      - qdrant_data:/qdrant/storage

  backend:
    build: ./backend
    command: uvicorn main:app --host 0.0.0.0 --port 8000
    depends_on: [postgres, redis, qdrant]
    env_file: .env

  celery-worker:
    build: ./backend
    command: celery -A main.celery_app worker --loglevel=info
    depends_on: [postgres, redis, qdrant]
    env_file: .env

  frontend:
    build: ./frontend
    depends_on: [backend]
    env_file: .env

volumes:
  pgdata:
  qdrant_data:
```

## Environment Variables

```env
# Database
DATABASE_URL=postgresql+asyncpg://vim_user:<password>@postgres:5432/vim

# Redis
REDIS_URL=redis://redis:6379/0

# Qdrant
QDRANT_URL=http://qdrant:6333
QDRANT_COLLECTION=experts

# S3 / R2
S3_ENDPOINT=
S3_BUCKET=
S3_ACCESS_KEY=
S3_SECRET_KEY=

# Auth
JWT_SECRET=<random-secret>
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=30

# SMTP (notifications)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
```

## Steps

```bash
# 1. Clone and set up .env
git clone <repo>
cp .env.example .env

# 2. Build and start all services
docker-compose up -d --build

# 3. Run migrations
docker-compose exec backend alembic upgrade head

# 4. Seed data (optional, for testing)
docker-compose exec backend python -m backend.scripts.seed_db

# 5. Verify
curl http://localhost:8000/health
```

## Production Notes

- Run FastAPI behind nginx with TLS (Let's Encrypt)
- Use managed PostgreSQL and Redis for reliability
- Set Celery worker replicas based on load
- Enable Qdrant authentication for remote access
- Rotate JWT_SECRET and store in secrets manager
