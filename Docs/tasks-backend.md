# Backend Tasks — HGM-07

## Phase 1: Project Setup

- [x] Initialize `pyproject.toml` with all dependencies (FastAPI, SQLAlchemy, Celery, etc.)
- [ ] Create `alembic.ini` and configure database URL from env
- [ ] Set up `app/database.py` — engine, session factory, Base class
- [ ] Set up `app/config.py` — Pydantic BaseSettings for all env vars (DB, Redis, S3, JWT, SMTP)
- [ ] Create `app/dependencies.py` — `get_db`, `get_current_user`, `require_role` DI
- [ ] Create `app/exceptions.py` — custom exceptions + exception handlers
- [ ] Create `app/security.py` — bcrypt password hashing, JWT encode/decode
- [ ] Wire `main.py` — FastAPI app with lifespan, include api router, CORS middleware

## Phase 2: Database Models & Migrations

- [ ] Create `app/models/base.py` — Base mixin with UUID PK, created_at, updated_at
- [ ] Create `app/models/user.py` — admin user model (email, role, hashed_password)
- [ ] Create `app/models/candidate.py` — all columns per PRD schema
- [ ] Create `app/models/expert.py` — all columns per PRD schema
- [ ] Create `app/models/availability.py` — slots with polymorphic FK (user_id, user_type)
- [ ] Create `app/models/match.py` — all columns with JSONB score_breakdown, status enum
- [ ] Generate initial Alembic migration: `alembic revision --autogenerate -m "init schema"`
- [ ] Apply migration and verify all tables exist with correct types
- [ ] Add unique constraint on `(candidate_id, status='approved')` in match model
- [ ] Add indexes on FK columns and frequently queried fields (email, domain, parse_status)

## Phase 3: Pydantic Schemas

- [ ] `app/schemas/auth.py` — RegisterRequest, LoginRequest, TokenResponse, RefreshRequest
- [ ] `app/schemas/candidate.py` — CandidateCreate, CandidateUpdate, CandidateOut, ParsedSkills
- [ ] `app/schemas/expert.py` — ExpertCreate, ExpertUpdate, ExpertOut
- [ ] `app/schemas/match.py` — MatchOut, ScoreBreakdown, MatchRankedList
- [ ] `app/schemas/availability.py` — SlotCreate, SlotOut, SlotOverlapResponse
- [ ] Validate all schemas match the data models exactly (field types, enums, nullable)
- [ ] Add field-level validators (email format, max 20 skills, experience_years >= 0)

## Phase 4: Auth Service & Endpoints

- [ ] `app/services/auth_service.py` — register_user, authenticate_user, create_tokens, refresh_token
- [ ] `app/api/auth.py` — POST /auth/register, POST /auth/login, POST /auth/refresh
- [ ] Implement password hashing with bcrypt (cost factor >= 12)
- [ ] Implement JWT access (30 min) and refresh (7 day) tokens with python-jose
- [ ] Role-based access: embed role claim in JWT, check via `require_role` DI
- [ ] Test: register candidate/expert, login, get valid token, refresh, expired token handling

## Phase 5: Storage Service (S3/R2)

- [ ] `app/services/storage_service.py` — upload_resume, download_resume, delete_resume
- [ ] Configure boto3 or equivalent for S3-compatible storage
- [ ] UUID filename generation on upload (no PII in keys)
- [ ] File size validation (max 5MB) before upload
- [ ] Content-type validation (application/pdf only)
- [ ] Test: upload, retrieve URL, verify file integrity

## Phase 6: Candidate CRUD + Endpoints

- [ ] `app/services/candidate_service.py` — create_candidate, get_candidate, list_candidates, update_candidate
- [ ] `app/api/candidates.py` — POST /candidates, GET /candidates, GET /candidates/{id}, PATCH /candidates/{id}
- [ ] POST /candidates: validate input → upload resume to S3 → create DB record → trigger Celery matching task
- [ ] Duplicate email check with clear error message
- [ ] GET /candidates: paginated, filterable by parse_status
- [ ] PATCH /candidates: role-based (candidate can update own, admin can update any)
- [ ] Test: full CRUD flow, resume upload, duplicate rejection, pagination

## Phase 7: Expert CRUD + Endpoints

- [ ] `app/services/expert_service.py` — create_expert, get_expert, list_experts, update_expert, deactivate_expert
- [ ] `app/api/experts.py` — POST /experts, GET /experts, GET /experts/{id}, PATCH /experts/{id}, DELETE /experts/{id}
- [ ] PATCH /experts/{id}: trigger Celery re-embedding task on any profile field change
- [ ] DELETE: soft delete via `is_active = False` (never hard delete — audit trail)
- [ ] Test: full CRUD, profile update triggers re-embed, soft delete doesn't break existing matches

## Phase 8: Match Service & Endpoints

- [ ] `app/services/match_service.py` — get_matches, approve_match, override_match, get_assignment_history
- [ ] `app/api/matches.py` — POST /matches/run/{candidate_id}, GET /matches/{candidate_id}, POST /matches/{match_id}/approve, POST /matches/{match_id}/override, GET /matches/history
- [ ] POST /matches/run/{candidate_id}: manual re-trigger (admin only), return task ID for polling
- [ ] GET /matches/{candidate_id}: return ranked list sorted by total_score ascending
- [ ] POST /matches/{match_id}/approve: set status='approved', send notification, book slot
- [ ] POST /matches/{match_id}/override: require reason field, set status='overridden', log admin_id
- [ ] GET /matches/history: full audit log, paginated, filterable by admin_id and date range
- [ ] Test: approve flow, override requires reason, audit log records all changes, concurrent approval prevention

## Phase 9: Availability Service & Endpoints

- [ ] `app/services/availability_service.py` — create_slot, get_slots, delete_slot, calculate_overlap
- [ ] `app/api/availability.py` — POST /availability, GET /availability/{user_id}, DELETE /availability/{slot_id}
- [ ] Overlap calculation: return total overlapping hours between candidate and expert slot sets
- [ ] Validation: slot_end > slot_start, no duplicate overlapping slots for same user
- [ ] Test: slot CRUD, overlap calculation edge cases (adjacent, partial, full overlap, none)

## Phase 10: Notification Service

- [ ] `app/services/notification_service.py` — send_candidate_confirmation, send_match_alert, send_expert_assignment, send_expert_decline_alert
- [ ] Integrate FastAPI-Mail or aiosmtplib for async email
- [ ] SMTP config from environment variables
- [ ] Email templates: plain text for MVP, HTML later
- [ ] Non-blocking: send via Celery task or asyncio.create_task
- [ ] Test: mock SMTP, verify correct template, recipient, subject per trigger
- [ ] Test: email failure doesn't crash the main pipeline (log and continue)

## Phase 11: Celery Task Orchestration

- [ ] `ml/celery_app.py` — configure Celery with Redis broker/result backend
- [ ] `ml/tasks/matching.py` — run_matching_pipeline(candidate_id) with max_retries=3, countdown=30
- [ ] `ml/tasks/embedding.py` — embed_expert(expert_id) for initial indexing, re-embed on update
- [ ] Task timeout: 600 seconds for matching pipeline
- [ ] Dead letter queue: log failed tasks with full traceback for admin investigation
- [ ] Idempotency: safe to retry — check parse_status before re-running, delete old matches first
- [ ] Test: trigger task from API, verify it picks up, inspect result, test retry behavior

## Phase 12: API Cross-Cutting Concerns

- [ ] CORS middleware configured for frontend origin(s)
- [ ] Global exception handlers: 400, 401, 403, 404, 409, 422, 500
- [ ] Request logging: method, path, status code, duration
- [ ] Rate limiting on auth endpoints (simple token bucket or Redis counter)
- [ ] Health check endpoint: GET /health (public) — returns DB, Redis, Qdrant connectivity status
- [ ] OpenAPI docs: ensure all endpoints have summary, description, response examples
- [ ] Test: health endpoint, CORS preflight, 401 on missing token, 403 on wrong role

## Phase 13: Integration Testing

- [ ] Full candidate flow: register → upload resume → Celery task → matches appear → admin approves → notification sent
- [ ] Full expert flow: register → set availability → profile update → re-embed → appears in match results
- [ ] Override flow: approve match → override with different expert → audit log has both entries
- [ ] Availability overlap: create candidate + expert slots → verify overlap score in match result
- [ ] Error recovery: submit corrupted PDF → parse fails → status='failed' → admin can re-trigger
- [ ] Test database: use separate test DB, truncate between tests, use fixtures for seed data
