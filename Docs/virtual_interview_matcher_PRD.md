# Product Requirements Document

## Virtual Interview Matcher — HGM-07

**Classification:** Systems / AI  
**Project Code:** HGM-07  
**Track:** ML Ranking · NLP · Backend Systems  
**Domain:** Gov / HR Tech  
**Version:** 1.0  
**Last Updated:** April 2026

---

## Table of Contents

1. [Overview](#1-overview)
2. [Problem Statement](#2-problem-statement)
3. [Goals & Success Metrics](#3-goals--success-metrics)
4. [Stakeholders & User Roles](#4-stakeholders--user-roles)
5. [System Architecture](#5-system-architecture)
6. [Feature Specifications](#6-feature-specifications)
7. [Data Models](#7-data-models)
8. [API Specification](#8-api-specification)
9. [ML Pipeline Design](#9-ml-pipeline-design)
10. [Scoring Engine](#10-scoring-engine)
11. [Tech Stack](#11-tech-stack)
12. [Team Structure & Ownership](#12-team-structure--ownership)
13. [Week Sprint Plan](#13-week-sprint-plan)
14. [Non-Functional Requirements](#14-non-functional-requirements)
15. [Edge Cases & Risk Register](#15-edge-cases--risk-register)
16. [Deliverables Checklist](#16-deliverables-checklist)

---

## 1. Overview

**Virtual Interview Matcher** is an AI-powered platform that intelligently matches interview candidates to domain experts for evaluation interviews. The system ingests candidate profiles and resumes, parses skills and experience using NLP, embeds both candidates and experts into a shared semantic space, and produces a ranked shortlist of the best expert-candidate pairings using a multi-factor ML scoring model.

The platform targets real-world government and HR workflows — think UPSC panel interviews, PSU hiring boards, public sector technical assessments — where matching the right evaluator to the right candidate is currently done manually, slowly, and inconsistently.

**Core value proposition:** Replace ad-hoc expert assignment with a data-driven, explainable matching system that reduces scheduling overhead, improves evaluation quality, and creates an auditable match record.

---

## 2. Problem Statement

### Current Pain Points

In government and enterprise HR contexts:

- Expert assignment is manual — HR coordinators pick panel members based on familiarity, not structured fit.
- There is no systematic way to measure whether an expert's background aligns with the candidate's domain.
- Scheduling conflicts and last-minute replacements are common because availability is not factored in early.
- There is no scoring trail — post-interview, it's impossible to audit why a particular expert was assigned.
- The process doesn't scale. A hiring board with 500 candidates and 40 experts can't be matched by hand with any reliability.

### What we're solving

Build a system that:

- Ingests structured and unstructured data from both candidates and experts
- Uses NLP + embeddings to understand semantic skill overlap (not just keyword matching)
- Produces a ranked, scored, explainable list of expert-candidate pairings
- Allows HR admins to review, override, and finalize assignments through a clean UI
- Creates an audit log of all match decisions

---

## 3. Goals & Success Metrics

### Primary Goals

| Goal                    | Metric                                                                    | Target                        |
| ----------------------- | ------------------------------------------------------------------------- | ----------------------------- |
| Accurate skill matching | Top-3 expert hit rate (expert chosen by admin is in top 3 ML suggestions) | ≥ 80%                         |
| Low latency matching    | Time to generate ranked list after submission                             | < 5 seconds                   |
| System availability     | Uptime during demo/eval period                                            | ≥ 99%                         |
| Explainability          | Every match score has a breakdown (skills %, exp %, availability %)       | 100% of results               |
| Usability               | Admin can assign an expert without reading docs                           | Task completion in < 3 clicks |

### Secondary Goals

- Full async pipeline — no blocking the UI during ML inference
- Resume parsing handles messy real-world PDFs (not just clean templates)
- Expert profiles can be updated without full re-indexing

---

## 4. Stakeholders & User Roles

### Roles

#### Candidate

- Uploads resume (PDF)
- Fills in a structured profile (domain, experience level, preferred interview slot)
- Can view their match status (which expert is assigned, interview time)
- Cannot see scores or other candidates

#### Expert / Evaluator

- Creates a profile (domain expertise, years of experience, skills, availability slots)
- Receives notifications when assigned to a candidate interview
- Can flag unavailability or request reassignment
- Cannot see other experts' profiles

#### HR Admin

- Uploads batch candidate data or manages individual submissions
- Reviews ML-generated match shortlists
- Approves, overrides, or re-runs matching for any candidate
- Has full visibility into scores and match reasoning
- Manages the expert pool (add, edit, deactivate experts)

#### System (internal)

- Runs async ML jobs triggered by candidate submission
- Maintains embedding index for all experts
- Generates and stores match records with full score breakdowns

---

## 5. System Architecture

### High-Level Layers

```
┌──────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js)                    │
│   Candidate Portal │ Expert Portal │ Admin Dashboard      │
└────────────────────────┬─────────────────────────────────┘
                         │ HTTP / REST
┌────────────────────────▼─────────────────────────────────┐
│                    BACKEND (FastAPI)                       │
│   /auth  │  /candidates  │  /experts  │  /matches         │
│                  Job Queue (Celery + Redis)                │
└─────┬──────────────┬──────────────────┬───────────────────┘
      │              │                  │
┌─────▼──────┐ ┌─────▼──────┐ ┌────────▼────────┐
│ NLP Parser │ │ Embedder   │ │  ML Ranker       │
│ spaCy/HF   │ │ sentence-  │ │  Scoring Engine  │
│            │ │ transformers│ │  (weighted)      │
└─────┬──────┘ └─────┬──────┘ └────────┬─────────┘
      │              │                  │
┌─────▼──────────────▼──────────────────▼─────────────────┐
│                      STORAGE LAYER                        │
│  PostgreSQL │ Redis (cache+queue) │ Qdrant │ S3/Blob      │
└──────────────────────────────────────────────────────────┘
```

### Data Flow — Candidate Submission to Match Result

```
1. Candidate submits resume (PDF) + profile form
2. FastAPI saves raw file to S3, stores profile in Postgres
3. FastAPI enqueues async job → Celery worker picks it up
4. NLP Parser extracts: skills, years_of_experience, domain, education
5. Embedder encodes the parsed profile → 768-dim vector
6. Vector is stored in Qdrant under candidate's ID
7. Qdrant ANN search retrieves top-K expert embeddings by cosine similarity
8. Scoring Engine re-ranks the K candidates using weighted multi-factor formula
9. Top-N matches saved to Postgres with full score breakdown
10. Admin dashboard shows ranked expert shortlist for review
11. Admin approves → notification sent to expert, calendar slot booked
```

---

## 6. Feature Specifications

### F-01 · Candidate Onboarding

**Description:** Candidate creates account and submits their profile.

**Inputs:**

- Resume upload (PDF, max 5MB)
- Name, email, phone
- Target role / domain
- Experience level (fresher / mid / senior)
- Preferred interview slots (multi-select calendar)

**Processing:**

- Resume stored to S3 with UUID filename
- Profile stored to `candidates` table
- Async NLP job triggered immediately on submission

**Output:** Confirmation screen with status "Your profile is being processed"

**Edge cases:**

- Corrupted or image-only PDFs → fallback to form-only data, flag for manual review
- Duplicate email → block with clear error
- No slots selected → allow submission but flag as "schedule pending"

---

### F-02 · Expert Profile Management

**Description:** Experts register with structured domain/skill data.

**Inputs:**

- Name, email, designation
- Primary domain (dropdown: Engineering / Finance / Law / Medicine / Science / Admin / Other)
- Skills (freeform tags, max 20)
- Years of experience (integer)
- Availability slots (weekly recurring or one-off)
- Bio / description (optional, used in embedding)

**Processing:**

- Profile stored to `experts` table
- Embedding computed and stored in Qdrant immediately on save
- On profile update → re-embed and update Qdrant index

**Output:** Profile page with "Embedding status: indexed"

---

### F-03 · NLP Resume Parser

**Description:** Extracts structured data from raw resume text.

**Extracted fields:**

- `skills[]` — list of technical and soft skills
- `experience_years` — total years inferred from work history
- `domain` — primary domain classification
- `education[]` — degrees, institutions
- `raw_text` — full cleaned text (used for embedding)

**Implementation:**

- PDF text extraction: `pdfplumber` or `PyMuPDF`
- NLP: `spaCy` (en_core_web_lg) for NER + custom skill matcher
- Skills dictionary: curated list of ~2000 skills across domains
- Domain classifier: fine-tuned or zero-shot classification using HuggingFace

**Failure modes:**

- Scanned PDF (no text layer) → OCR with `pytesseract`, lower confidence flag
- Non-English resume → detect language, flag for manual review
- Very short resume (< 100 tokens) → flag as "incomplete parse"

---

### F-04 · Embedding & Vector Indexing

**Description:** Converts candidate and expert profiles into semantic vectors.

**Model:** `sentence-transformers/all-mpnet-base-v2` (768 dimensions, strong on professional text)

**What gets embedded:**

- Candidates: concatenation of `domain + skills + experience_summary + raw_resume_text` (truncated to 512 tokens)
- Experts: concatenation of `domain + skills + bio + designation`

**Vector store:** Qdrant (self-hosted or Qdrant Cloud)

- Collection: `experts` (pre-indexed, updated on profile change)
- Collection: `candidates` (added on submission, never queried against — only used for logging)

**Retrieval:** For each candidate, ANN search on `experts` collection → top 20 by cosine similarity

---

### F-05 · ML Matching & Ranking

**Description:** Re-ranks the top-20 retrieved experts using a weighted scoring formula.

See [Section 10](#10-scoring-engine) for full scoring breakdown.

**Output per match:**

```json
{
  "expert_id": "uuid",
  "candidate_id": "uuid",
  "total_score": 0.847,
  "score_breakdown": {
    "semantic_similarity": 0.91,
    "skill_overlap": 0.78,
    "experience_delta": 0.85,
    "domain_match": 1.0,
    "availability_score": 0.72
  },
  "rank": 1,
  "explanation": "Strong domain alignment (Engineering). 6 of 9 candidate skills matched. Expert has 3x candidate experience level."
}
```

---

### F-06 · Admin Dashboard

**Description:** Central interface for HR admins to manage the full matching workflow.

**Views:**

- **Candidate queue** — list of all submitted candidates, their parse status, and match status
- **Match review** — for a selected candidate, shows ranked expert shortlist with score breakdowns
- **Expert pool** — full list of experts, filter by domain/availability
- **Assignment history** — audit log of all finalized assignments with timestamps and admin ID
- **Override panel** — admin can manually assign any expert, with a required reason field

**Actions:**

- Approve match (confirm top-ranked expert)
- Override match (pick a different expert + add reason)
- Re-run matching (re-trigger the ML pipeline for a candidate)
- Export assignments as CSV

---

### F-07 · Notifications

**Description:** Automated emails/alerts on key events.

| Trigger                       | Recipient | Message                                                        |
| ----------------------------- | --------- | -------------------------------------------------------------- |
| Candidate submission received | Candidate | "Profile received, processing..."                              |
| Match ready for review        | Admin     | "New match ready: [Candidate Name]"                            |
| Expert assigned               | Expert    | "You've been assigned to interview [Candidate Name] on [Date]" |
| Expert declines               | Admin     | "Expert [Name] declined — reassignment needed"                 |

**Implementation:** Simple email via `FastAPI-Mail` + SMTP, or webhook-based. Async, non-blocking.

---

## 7. Data Models

### candidates

| Column           | Type                        | Notes            |
| ---------------- | --------------------------- | ---------------- |
| id               | UUID (PK)                   |                  |
| email            | VARCHAR(255) UNIQUE         |                  |
| name             | VARCHAR(255)                |                  |
| domain           | VARCHAR(100)                |                  |
| experience_level | ENUM(fresher, mid, senior)  |                  |
| resume_s3_key    | VARCHAR(500)                |                  |
| parsed_skills    | JSONB                       | array of strings |
| experience_years | INTEGER                     | extracted by NLP |
| embedding_id     | VARCHAR(255)                | Qdrant point ID  |
| parse_status     | ENUM(pending, done, failed) |                  |
| created_at       | TIMESTAMP                   |                  |

### experts

| Column           | Type                | Notes            |
| ---------------- | ------------------- | ---------------- |
| id               | UUID (PK)           |                  |
| email            | VARCHAR(255) UNIQUE |                  |
| name             | VARCHAR(255)        |                  |
| designation      | VARCHAR(255)        |                  |
| domain           | VARCHAR(100)        |                  |
| skills           | JSONB               | array of strings |
| experience_years | INTEGER             |                  |
| bio              | TEXT                |                  |
| embedding_id     | VARCHAR(255)        | Qdrant point ID  |
| is_active        | BOOLEAN             | default true     |
| created_at       | TIMESTAMP           |                  |

### availability_slots

| Column     | Type                    | Notes                            |
| ---------- | ----------------------- | -------------------------------- |
| id         | UUID (PK)               |                                  |
| user_id    | UUID (FK)               | references candidates or experts |
| user_type  | ENUM(candidate, expert) |                                  |
| slot_start | TIMESTAMP               |                                  |
| slot_end   | TIMESTAMP               |                                  |
| is_booked  | BOOLEAN                 | default false                    |

### matches

| Column          | Type                                            | Notes          |
| --------------- | ----------------------------------------------- | -------------- |
| id              | UUID (PK)                                       |                |
| candidate_id    | UUID (FK)                                       |                |
| expert_id       | UUID (FK)                                       |                |
| total_score     | FLOAT                                           | 0.0–1.0        |
| score_breakdown | JSONB                                           | all sub-scores |
| rank            | INTEGER                                         | 1 = best       |
| explanation     | TEXT                                            | auto-generated |
| status          | ENUM(suggested, approved, overridden, declined) |                |
| override_reason | TEXT                                            | nullable       |
| assigned_by     | UUID                                            | admin user ID  |
| created_at      | TIMESTAMP                                       |                |

### users (admins)

| Column          | Type                    | Notes |
| --------------- | ----------------------- | ----- |
| id              | UUID (PK)               |       |
| email           | VARCHAR(255) UNIQUE     |       |
| role            | ENUM(admin, superadmin) |       |
| hashed_password | VARCHAR(500)            |       |
| created_at      | TIMESTAMP               |       |

---

## 8. API Specification

All endpoints are prefixed with `/api/v1`.  
Authentication: JWT Bearer token. Role-based access enforced per endpoint.

### Auth

| Method | Endpoint         | Description                  | Auth   |
| ------ | ---------------- | ---------------------------- | ------ |
| POST   | `/auth/register` | Register candidate or expert | Public |
| POST   | `/auth/login`    | Returns JWT                  | Public |
| POST   | `/auth/refresh`  | Refresh access token         | User   |

### Candidates

| Method | Endpoint           | Description                     | Auth            |
| ------ | ------------------ | ------------------------------- | --------------- |
| POST   | `/candidates/`     | Create profile + upload resume  | Candidate       |
| GET    | `/candidates/{id}` | Get candidate profile           | Admin           |
| GET    | `/candidates/`     | List all candidates (paginated) | Admin           |
| PATCH  | `/candidates/{id}` | Update profile                  | Candidate/Admin |

### Experts

| Method | Endpoint        | Description                        | Auth         |
| ------ | --------------- | ---------------------------------- | ------------ |
| POST   | `/experts/`     | Create expert profile              | Expert/Admin |
| GET    | `/experts/{id}` | Get expert profile                 | Admin        |
| GET    | `/experts/`     | List all experts                   | Admin        |
| PATCH  | `/experts/{id}` | Update profile (triggers re-embed) | Expert/Admin |
| DELETE | `/experts/{id}` | Deactivate expert                  | Admin        |

### Matching

| Method | Endpoint                       | Description                    | Auth  |
| ------ | ------------------------------ | ------------------------------ | ----- |
| POST   | `/matches/run/{candidate_id}`  | Trigger matching pipeline      | Admin |
| GET    | `/matches/{candidate_id}`      | Get ranked match list          | Admin |
| POST   | `/matches/{match_id}/approve`  | Approve top match              | Admin |
| POST   | `/matches/{match_id}/override` | Override with different expert | Admin |
| GET    | `/matches/history`             | Full assignment audit log      | Admin |

### Availability

| Method | Endpoint                  | Description                      | Auth       |
| ------ | ------------------------- | -------------------------------- | ---------- |
| POST   | `/availability/`          | Add slot for candidate or expert | User       |
| GET    | `/availability/{user_id}` | Get user's slots                 | User/Admin |
| DELETE | `/availability/{slot_id}` | Remove slot                      | User       |

---

## 9. ML Pipeline Design

### Pipeline Steps

```
Step 1 — PDF Ingestion
  Input:  S3 resume key
  Action: Download PDF → extract raw text (pdfplumber)
  Output: raw_text string

Step 2 — NLP Parsing
  Input:  raw_text
  Action: spaCy NER + skill matcher + domain classifier
  Output: {skills[], experience_years, domain, education[]}

Step 3 — Profile Serialization
  Input:  parsed fields + expert/candidate profile from DB
  Action: Build embedding input string:
          "[DOMAIN] {domain} [SKILLS] {skills.join(', ')}
           [EXP] {experience_years} years [BIO] {bio/summary}"
  Output: input_text string (max 512 tokens)

Step 4 — Embedding
  Input:  input_text
  Action: sentence-transformers encode → 768-dim vector
  Output: np.ndarray shape (768,)

Step 5 — Vector Storage
  Input:  vector + entity ID
  Action: Qdrant upsert to relevant collection
  Output: Qdrant point ID → saved back to Postgres

Step 6 — ANN Retrieval (candidates only)
  Input:  candidate vector
  Action: Qdrant search on experts collection, top_k=20, cosine similarity
  Output: [(expert_id, similarity_score), ...] × 20

Step 7 — Re-ranking (Scoring Engine)
  Input:  top-20 experts + candidate profile
  Action: Multi-factor weighted scoring (see Section 10)
  Output: Ranked list of top-5 matches with full score breakdown

Step 8 — Persistence
  Input:  ranked matches
  Action: Save to matches table, update candidate parse_status = done
  Output: Match records in DB, visible in admin dashboard
```

### Async Job Design

```python
# Celery task (conceptual)
@celery_app.task(bind=True, max_retries=3)
def run_matching_pipeline(self, candidate_id: str):
    try:
        candidate = db.get_candidate(candidate_id)
        raw_text = s3.download_and_extract(candidate.resume_s3_key)
        parsed = nlp_parser.parse(raw_text)
        vector = embedder.encode(build_input_text(candidate, parsed))
        qdrant.upsert("candidates", candidate_id, vector)
        top_experts = qdrant.search("experts", vector, top_k=20)
        ranked = scoring_engine.rank(candidate, top_experts)
        db.save_matches(candidate_id, ranked)
        db.update_parse_status(candidate_id, "done")
    except Exception as exc:
        self.retry(exc=exc, countdown=30)
```

---

## 10. Scoring Engine

The scoring engine re-ranks the top-20 ANN results using a multi-factor weighted formula. The goal is to go beyond raw semantic similarity and account for real-world assignment quality.

### Formula

```
total_score = (
    w1 × semantic_similarity +
    w2 × skill_overlap_score +
    w3 × experience_fit_score +
    w4 × domain_exact_match +
    w5 × availability_overlap_score
)
```

### Default Weights

| Factor               | Weight | Rationale                                              |
| -------------------- | ------ | ------------------------------------------------------ |
| Semantic similarity  | 0.35   | Core ANN score — overall profile closeness             |
| Skill overlap        | 0.25   | Hard skill intersection matters most in tech/gov roles |
| Experience fit       | 0.20   | Expert should have more experience than candidate      |
| Domain exact match   | 0.15   | Binary — same primary domain = significant boost       |
| Availability overlap | 0.05   | Ensures practical assignability                        |

### Sub-score Definitions

**Semantic similarity (from Qdrant):**  
Raw cosine similarity between candidate and expert embeddings, already normalised to [0, 1].

**Skill overlap score:**

```
skill_overlap = |candidate_skills ∩ expert_skills| / |candidate_skills|
```

Uses fuzzy matching (RapidFuzz, threshold ≥ 85) to catch near-matches like "ML" ↔ "Machine Learning".

**Experience fit score:**

```
# Expert should have meaningfully more experience
delta = expert_years - candidate_years
if delta >= 5:   score = 1.0
elif delta >= 2: score = 0.75
elif delta >= 0: score = 0.5
else:            score = 0.2  # expert has less exp than candidate — penalise
```

**Domain exact match:**

```
score = 1.0 if candidate.domain == expert.domain else 0.0
```

(Can be extended to a domain similarity matrix for related fields.)

**Availability overlap score:**

```
overlap_hours = sum of overlapping slot durations
score = min(overlap_hours / 2.0, 1.0)  # 2 hours overlap = full score
```

### Explanation Generation

For each match, an explanation string is auto-generated:

```python
def generate_explanation(candidate, expert, breakdown):
    parts = []
    if breakdown["domain_match"] == 1.0:
        parts.append(f"Domain match: {expert.domain}")
    n_skills = round(breakdown["skill_overlap"] * len(candidate.skills))
    parts.append(f"{n_skills}/{len(candidate.skills)} skills matched")
    exp_delta = expert.experience_years - candidate.experience_years
    parts.append(f"Expert has {exp_delta} more years of experience")
    return ". ".join(parts)
```

---

## 11. Tech Stack

### Backend

- **FastAPI** — API framework, async, pydantic validation
- **Celery** — async task queue for ML pipeline jobs
- **Redis** — Celery broker + result backend + caching
- **SQLAlchemy** — ORM for Postgres
- **Alembic** — database migrations
- **python-jose** — JWT auth
- **pdfplumber / PyMuPDF** — PDF text extraction
- **pytesseract** — OCR fallback for scanned PDFs

### ML / NLP

- **spaCy** (en_core_web_lg) — NER, tokenization, skill extraction
- **sentence-transformers** (all-mpnet-base-v2) — profile embedding
- **RapidFuzz** — fuzzy skill matching
- **HuggingFace transformers** — domain classification (optional fine-tune)
- **Qdrant** — vector database for ANN search

### Frontend

- **Next.js 14** (App Router) — all three portals
- **TailwindCSS** — styling
- **shadcn/ui** — component library
- **React Query (TanStack)** — API data fetching and caching
- **React Hook Form** — forms
- **Axios** — HTTP client

### Storage

- **PostgreSQL** — primary relational database
- **Redis** — queue + cache
- **Qdrant** — vector embeddings
- **AWS S3 / Cloudflare R2** — resume file storage

### DevOps / Infra (minimal for hackathon)

- **Docker + Docker Compose** — local dev and deployment
- **uvicorn** — ASGI server for FastAPI
- **GitHub** — version control, one repo with monorepo structure

---

## 12. Team Structure & Ownership

With 14 people, split into 4 squads. Each squad owns their layer end-to-end.

### Squad A — Frontend (3 people)

**Owns:** Next.js app, all 3 portals (candidate, expert, admin)

| Person    | Responsibility                                                 |
| --------- | -------------------------------------------------------------- |
| A1 (lead) | Admin dashboard + match review UI                              |
| A2        | Candidate portal (onboarding form, resume upload, status page) |
| A3        | Expert portal (profile form, availability picker)              |

**Deliverable:** Working UI connected to backend APIs, all 3 portals functional.

---

### Squad B — Backend / API (4 people)

**Owns:** FastAPI server, auth, all REST endpoints, Celery job queue, DB schema

| Person    | Responsibility                                                   |
| --------- | ---------------------------------------------------------------- |
| B1 (lead) | FastAPI app structure, routing, Celery setup, Docker Compose     |
| B2        | Auth service (JWT, roles, register/login endpoints)              |
| B3        | Candidate + expert CRUD endpoints, S3 upload                     |
| B4        | Match endpoints, availability endpoints, DB migrations (Alembic) |

**Deliverable:** All API endpoints working, async job queue operational, Postgres schema deployed.

---

### Squad C — ML / NLP (4 people)

**Owns:** NLP parser, embedding pipeline, Qdrant integration, Celery ML tasks

| Person    | Responsibility                                                   |
| --------- | ---------------------------------------------------------------- |
| C1 (lead) | Celery task design, pipeline orchestration, Qdrant setup         |
| C2        | PDF ingestion + NLP parser (pdfplumber + spaCy skill extraction) |
| C3        | Embedding model (sentence-transformers) + Qdrant upsert/search   |
| C4        | Scoring engine + explanation generator + unit tests for scoring  |

**Deliverable:** End-to-end pipeline from PDF → ranked match list, all steps tested independently.

---

### Squad D — Data / QA / Integration (3 people)

**Owns:** Seed data, test cases, end-to-end integration testing, final demo prep

| Person    | Responsibility                                                               |
| --------- | ---------------------------------------------------------------------------- |
| D1 (lead) | Create 20+ realistic candidate + expert seed profiles, test matching quality |
| D2        | Integration testing (full flow: submit → match → admin approves), bug triage |
| D3        | Demo script, slides, system documentation, deployment check                  |

**Deliverable:** 20 seeded profiles, verified end-to-end flow, demo-ready system.

---

## 13. Week Sprint Plan

### Day 1 (Today / Tonight)

**Goal: Everyone knows what to build. Repos up. Dev environment running.**

- [ ] Repo created, monorepo structure agreed (`/backend`, `/frontend`, `/ml`, `/infra`)
- [ ] Docker Compose with Postgres + Redis + Qdrant running locally for everyone
- [ ] DB schema created and migrations run
- [ ] FastAPI skeleton with health check endpoint live
- [ ] Next.js app scaffolded with routing structure
- [ ] Squads break off into their own branches

---

### Day 2

**Goal: Core data layer + auth working. ML pipeline begins.**

- [ ] Backend: Auth endpoints (register, login, JWT) working
- [ ] Backend: Candidate + expert CRUD endpoints working
- [ ] Backend: S3/Blob file upload for resumes working
- [ ] ML: PDF text extraction + spaCy NLP parser returning structured output
- [ ] ML: Qdrant collection created, expert embedding + upsert working
- [ ] Frontend: Candidate onboarding form wired to backend
- [ ] Frontend: Expert profile form wired to backend

---

### Day 3

**Goal: Full async ML pipeline running. Matching produces results.**

- [ ] ML: Celery task running end-to-end (PDF → parsed → embedded → Qdrant)
- [ ] ML: ANN retrieval (top-20 experts) working from Qdrant
- [ ] ML: Scoring engine implemented, returns ranked list with breakdown
- [ ] Backend: `/matches/run/{candidate_id}` endpoint triggers Celery task
- [ ] Backend: `/matches/{candidate_id}` returns ranked results
- [ ] Frontend: Admin dashboard shows candidate queue
- [ ] Data: First 5 seed profiles (candidates + experts) inserted and matchable

---

### Day 4

**Goal: Admin flow complete. Overrides work. Notifications in place.**

- [ ] Frontend: Match review UI shows ranked experts with score breakdown
- [ ] Frontend: Admin can approve / override match with reason
- [ ] Backend: Override logic persisted with audit trail
- [ ] ML: Explanation strings generated for all matches
- [ ] Backend: Email notifications on assignment (async, non-blocking)
- [ ] Data: 20 seed profiles fully inserted, tested for matching quality
- [ ] QA: End-to-end test: candidate submits → match runs → admin approves → expert notified

---

### Day 5

**Goal: Polish, edge cases, demo prep. Ship.**

- [ ] Bug fixes from QA pass
- [ ] Handle edge cases: bad PDF, no availability overlap, duplicate email
- [ ] Frontend: Loading states, error messages, empty states
- [ ] System deployed (Docker Compose on a cloud VM or local demo machine)
- [ ] Demo script written and rehearsed
- [ ] Slides: problem → solution → architecture → live demo → results
- [ ] Final README with setup instructions

---

### Day 6–7 (Buffer / Final Polish)

- [ ] Stretch: Re-run matching button in admin UI
- [ ] Stretch: Export assignments as CSV
- [ ] Stretch: Domain similarity matrix (Engineering ↔ CS = partial match)
- [ ] Stretch: Confidence score threshold — flag low-confidence matches for manual review

---

## 14. Non-Functional Requirements

### Performance

- Match pipeline (PDF → ranked result): target < 30 seconds end-to-end
- API response time for non-ML endpoints: < 300ms p95
- Qdrant ANN search: < 500ms for top-20 over 1000 expert embeddings

### Security

- Passwords hashed with bcrypt (minimum cost factor 12)
- JWT access tokens expire in 30 minutes; refresh tokens in 7 days
- Resume files stored with UUID filenames (no PII in S3 keys)
- Role-based access control enforced at the endpoint level, not just UI
- No candidate can see another candidate's data or matches

### Reliability

- Celery tasks have max 3 retries with 30s backoff on failure
- Failed parse jobs update `parse_status = "failed"` with error logged
- All DB writes are transactional — partial match saves are rolled back

### Scalability (design for, not required for demo)

- Expert embeddings are pre-indexed in Qdrant — re-indexing is incremental
- Celery workers can be horizontally scaled without code changes
- Stateless FastAPI — can run multiple instances behind a load balancer

---

## 15. Edge Cases & Risk Register

| Risk                                                               | Probability | Impact | Mitigation                                                      |
| ------------------------------------------------------------------ | ----------- | ------ | --------------------------------------------------------------- |
| Scanned/image-only PDF                                             | Medium      | High   | OCR fallback with pytesseract, flag low-confidence parse        |
| No availability overlap (0 score)                                  | Medium      | Medium | Still show match, highlight scheduling conflict in UI           |
| Expert pool too small for a domain                                 | Low         | High   | Show "no strong match" state with best available                |
| Duplicate skills in different formats ("ML" vs "machine learning") | High        | Medium | Fuzzy matching (RapidFuzz ≥ 85 threshold)                       |
| Celery task never completes (hung worker)                          | Low         | High   | Task timeout (600s), dead letter queue, admin retry button      |
| Embedding model OOM on low-RAM machine                             | Low         | High   | Batch size = 1 for demo, truncate input to 512 tokens           |
| Admin approves match with no slots                                 | Low         | Medium | UI warning before approval if no slot overlap exists            |
| Two admins simultaneously approving same match                     | Low         | Low    | DB-level unique constraint on (candidate_id, status='approved') |

---

## 16. Deliverables Checklist

### Must-Have (MVP)

- [ ] Candidate can submit resume and profile
- [ ] Expert can create and update profile
- [ ] ML pipeline runs async and returns ranked match list
- [ ] Admin can view, approve, or override matches
- [ ] Full score breakdown visible per match
- [ ] Audit log of all assignments
- [ ] 20 seeded test profiles with verified matching

### Should-Have

- [ ] Email notifications on assignment
- [ ] Availability overlap score factored into ranking
- [ ] OCR fallback for scanned PDFs
- [ ] Admin can re-trigger matching for any candidate

### Nice-to-Have (stretch)

- [ ] CSV export of assignments
- [ ] Domain similarity matrix (partial cross-domain matching)
- [ ] Confidence threshold UI (flag matches below 0.6 score)
- [ ] Expert decline + reassignment workflow

---

_Document maintained by project lead. Update version number on any structural change._
