# Deployment & Delivery Tasks — HGM-07

## Phase 1: Docker Infrastructure

- [ ] Create `docker-compose.yml` at project root with all services:
  - `postgres` (postgres:16) — named volume for persistence, env vars for credentials
  - `redis` (redis:7-alpine) — default config, exposed on 6379
  - `qdrant` (qdrant/qdrant:latest) — named volume, exposed on 6333/6334
  - `backend` (build from ./backend/Dockerfile) — depends on postgres, redis, qdrant
  - `celery-worker` (build from ./backend/Dockerfile, different command) — depends on postgres, redis, qdrant
  - `frontend` (build from ./frontend/Dockerfile) — depends on backend
- [ ] Create `backend/Dockerfile` — multi-stage: install deps with uv, copy app, run uvicorn
- [ ] Create `frontend/Dockerfile` — multi-stage: npm install, build, run with node
- [ ] Create `.env.example` with all required variables documented
- [ ] Create `.dockerignore` for backend/ and frontend/ to reduce build context
- [ ] Test: `docker-compose up -d` → all services healthy, `docker-compose ps` shows all running

## Phase 2: Environment Configuration

- [ ] Document all required environment variables in `.env.example`:
  - Database: DATABASE_URL (asyncpg connection string)
  - Redis: REDIS_URL
  - Qdrant: QDRANT_URL, QDRANT_COLLECTION
  - S3/R2: S3_ENDPOINT, S3_BUCKET, S3_ACCESS_KEY, S3_SECRET_KEY
  - Auth: JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRE_MINUTES
  - SMTP: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD
  - Frontend: NEXT_PUBLIC_API_URL
- [ ] Create environment-specific configs: `.env.local`, `.env.staging`, `.env.production`
- [ ] Validate config loading on startup — fail fast if required vars missing
- [ ] Test: start with .env.local → all services connect correctly, config validation rejects missing vars

## Phase 3: Database Migrations

- [ ] Verify Alembic configuration points to correct DATABASE_URL in Docker
- [ ] Run `alembic upgrade head` inside backend container → all tables created
- [ ] Create rollback procedure: `alembic downgrade -1` tested and working
- [ ] Add migration check to health endpoint — report current migration version
- [ ] Test: fresh DB → migrations apply cleanly, downgrade → re-upgrade works, migration failure is logged

## Phase 4: Seed Data & Verification

- [ ] Populate `backend/tests/fixtures/seed_data.json` with 20 candidates + 20 experts
- [ ] Create `backend/scripts/seed_db.py` — loads fixtures into Postgres + bulk indexes experts in Qdrant
- [ ] Run seed script → verify:
  - 20 candidate records in Postgres
  - 20 expert records in Postgres (all is_active=true)
  - 20 points in Qdrant "experts" collection
  - All experts have embedding_id set in Postgres
- [ ] Run matching pipeline on 3 test candidates → verify non-empty ranked results
- [ ] Test: re-run seed script (idempotent — upserts, no duplicates)

## Phase 5: Local Development Setup

- [ ] Write `README.md` with step-by-step local setup:
  - Prerequisites (Docker, Python, Node)
  - `docker-compose up -d`
  - Backend: install deps, run migrations, start uvicorn
  - Frontend: npm install, start dev server
  - Seed data
  - Access URLs for each service
- [ ] Create `Makefile` with common commands: `make up`, `make down`, `make migrate`, `make seed`, `make test`
- [ ] Test: fresh clone → follow README → fully working system in < 15 minutes

## Phase 6: CI/CD Pipeline

- [ ] Create `.github/workflows/ci.yml`:
  - Trigger: push to main, pull requests
  - Backend: install deps, run ruff check, run pytest with coverage
  - Frontend: npm install, run lint, run type check, run build
  - Services: start postgres/redis/qdrant via Docker for integration tests
- [ ] Create `.github/workflows/deploy.yml` (manual trigger):
  - Build Docker images
  - Push to registry (GHCR or Docker Hub)
  - Deploy to target environment via SSH or docker-compose pull
- [ ] Add status badges to README
- [ ] Test: push to branch → CI runs, lint fails on bad code, tests pass on good code

## Phase 7: Staging Deployment

- [ ] Provision staging environment: cloud VM (minimum 4 CPU, 8GB RAM) or PaaS (Railway, Render, Fly.io)
- [ ] Deploy via docker-compose on VM or platform-specific config
- [ ] Set up reverse proxy (nginx) with TLS (Let's Encrypt / certbot)
- [ ] Configure domain/subdomain: staging.vim.example.com
- [ ] Seed staging with test data
- [ ] Run full end-to-end test on staging: candidate submits → match → admin approves → expert notified
- [ ] Document staging URL, admin credentials, reset procedure
- [ ] Test: access all 3 portals on staging, API responds over HTTPS, Celery tasks execute

## Phase 8: Production Deployment

- [ ] Provision production infrastructure:
  - Compute: VM or container orchestration (minimum 2 backend replicas)
  - Database: managed PostgreSQL (automated backups, point-in-time recovery)
  - Redis: managed Redis or self-hosted with persistence
  - Vector DB: Qdrant with persistent volume, regular backups
  - Storage: S3 or Cloudflare R2 bucket with lifecycle policies
- [ ] Configure production env vars (secrets via secret manager, not env files)
- [ ] Set up domain and TLS: vim.example.com
- [ ] Configure nginx: rate limiting, gzip, security headers, request size limits
- [ ] Deploy backend with zero-downtime strategy: new container healthy before old one removed
- [ ] Deploy frontend: static build behind nginx or CDN
- [ ] Smoke test: all endpoints, all portals, matching pipeline, notifications
- [ ] Document runbook: deploy procedure, rollback procedure, incident response

## Phase 9: Monitoring & Alerting

- [ ] Application logging: structured JSON logs from all services (backend, celery, frontend SSR)
- [ ] Log aggregation: ship logs to central store (ELK, Loki, or cloud provider)
- [ ] Health check endpoint: GET /health — returns status of DB, Redis, Qdrant, S3
- [ ] Readiness probe: Celery worker connected, Qdrant collections exist, DB migrations current
- [ ] Set up uptime monitoring: HTTP health check every 60s, alert on 3 consecutive failures
- [ ] Set up error alerting: unhandled exceptions → alert (email, Slack, PagerDuty)
- [ ] Set up performance alerting: pipeline duration > 60s, API p95 > 500ms
- [ ] Dashboard: service status, active matches, pipeline success rate, average scores
- [ ] Test: kill a service → alert fires within 3 minutes, health endpoint returns degraded status

## Phase 10: Backup & Recovery

- [ ] PostgreSQL: automated daily backups, 7-day retention, tested restore procedure
- [ ] Qdrant: periodic snapshot of vector collections, stored to S3
- [ ] S3/R2: versioning enabled, lifecycle policy for old resume files
- [ ] Document recovery procedures:
  - DB restore from backup: steps, estimated time, data loss window
  - Qdrant rebuild from Postgres: re-index all experts from DB data
  - Full disaster recovery: order of service restoration
- [ ] Test: restore DB from backup → all data intact, re-index Qdrant → match quality unchanged

## Phase 11: Security Hardening

- [ ] All secrets stored in secret manager or CI secrets — none in code or .env committed
- [ ] Database: restrict network access to backend/Celery containers only, no public port
- [ ] Redis: require password authentication, disable dangerous commands (FLUSHALL, CONFIG)
- [ ] Qdrant: enable API key authentication, restrict to backend network
- [ ] HTTPS everywhere: TLS on all external endpoints, HSTS header
- [ ] CSRF protection on state-changing endpoints (if using cookie auth)
- [ ] Input validation: all endpoints use Pydantic schemas, no raw SQL
- [ ] File upload: validate content-type, max size, UUID filenames, no directory traversal
- [ ] Rate limiting: auth endpoints (10 req/min), matching trigger (5 req/min per candidate)
- [ ] Security headers: X-Content-Type-Options, X-Frame-Options, Referrer-Policy, CSP
- [ ] Dependency audit: `pip-audit`, `npm audit` — fix critical vulnerabilities
- [ ] Test: penetration test with OWASP Top 10 checklist, verify all mitigations

## Phase 12: Demo Preparation

- [ ] Prepare demo script:
  1. Show candidate portal → submit a resume (pre-selected clean PDF)
  2. Show processing → match results appear (~10-30 seconds)
  3. Switch to admin dashboard → review match, show score breakdown
  4. Approve match → expert receives notification
  5. Show expert portal → assignment visible, accept/decline
  6. Show assignment history audit log
  7. Demonstrate override: pick different expert, add reason, verify audit trail
- [ ] Pre-seed demo environment with 5 candidates + 10 experts for instant match results
- [ ] Prepare fallback recordings in case live demo fails
- [ ] Prepare slides: problem → solution → architecture → live demo → results → Q&A
- [ ] Test: full demo run-through on staging environment, time it to < 10 minutes

## Phase 13: Documentation

- [ ] Update README with final setup instructions and architecture overview
- [ ] Ensure all Docs/ files are current and cross-referenced
- [ ] Create runbook for common operations:
  - How to add a new expert to the pool
  - How to re-run matching for a specific candidate
  - How to investigate a failed pipeline job
  - How to export assignment data
- [ ] Create troubleshooting guide:
  - "Match results not appearing" → check Celery, check Qdrant, check logs
  - "Expert not in search results" → verify is_active, verify embedding_id, re-index
  - "Emails not sending" → check SMTP config, check notification service logs
- [ ] Final documentation review: all links work, all commands tested, all screenshots current

## Dependencies

| Task | Depends On |
|------|-----------|
| Phase 1 | Phase 2 (env vars defined first) |
| Phase 2 | — (can start immediately) |
| Phase 3 | Phase 1, Backend Phase 2 (models ready) |
| Phase 4 | Phase 3, ML Phase 9 (expert indexing) |
| Phase 5 | Phase 1, Phase 4 |
| Phase 6 | Phase 5, all backend/frontend/ML tests passing |
| Phase 7 | Phase 6, Phase 11 (security basics) |
| Phase 8 | Phase 7, Phase 11 |
| Phase 9 | Phase 8 |
| Phase 10 | Phase 8 |
| Phase 11 | Phase 7 (can run in parallel with Phase 8-10) |
| Phase 12 | Phase 7 (staging ready for demo) |
| Phase 13 | All phases complete |
