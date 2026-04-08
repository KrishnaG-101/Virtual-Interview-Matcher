# Product Requirements Document

## Virtual Interview Matcher — HGM-07

**Classification:** Systems / AI
**Project Code:** HGM-07
**Track:** ML Ranking · NLP · Backend Systems
**Domain:** Gov / HR Tech
**Version:** 1.1
**Last Updated:** April 2026

## Table of Contents

1. [Overview](#1-overview)
2. [Problem Statement](#2-problem-statement)
3. [Goals & Success Metrics](#3-goals--success-metrics)
4. [Stakeholders & User Roles](#4-stakeholders--user-roles)
5. [Feature Specifications](#5-feature-specifications)
6. [Scoring Engine](#6-scoring-engine)
7. [Tech Stack](#7-tech-stack)
8. [Team Structure & Ownership](#8-team-structure--ownership)
9. [Week Sprint Plan](#9-week-sprint-plan)
10. [Non-Functional Requirements](#10-non-functional-requirements)
11. [Edge Cases & Risk Register](#11-edge-cases--risk-register)
12. [Deliverables Checklist](#12-deliverables-checklist)

## Related Documentation

| Document | Description |
|----------|-------------|
| [System Architecture](./system-architecture.md) | Layer diagram, components, data flow |
| [API Specification](./api.md) | All REST endpoints, auth, response formats |
| [Database Schema](./database.md) | Table definitions, constraints, relationships |
| [ML Pipeline](./ml-pipeline.md) | NLP, embedding, scoring, Celery tasks |
| [Data Seeding](./data-seeding.md) | Seed data templates, validation strategy |
| [Usage Guide](./usage.md) | Candidate, expert, and admin workflows |
| [Deployment](./deployment.md) | Docker Compose, env vars, production notes |
| [Frontend](./frontend.md) | Portals, API integration, forms |

---

## 1. Overview

**Virtual Interview Matcher** is an AI-powered platform that intelligently matches interview candidates to domain experts for evaluation interviews. The system ingests candidate profiles and resumes, parses skills and experience using NLP, embeds both candidates and experts into a shared semantic space, and produces a ranked shortlist of the best expert-candidate pairings using a multi-factor ML scoring model.

The platform targets real-world government and HR workflows — think UPSC panel interviews, PSU hiring boards, public sector technical assessments — where matching the right evaluator to the right candidate is currently done manually, slowly, and inconsistently.

**Core value proposition:** Replace ad-hoc expert assignment with a data-driven, explainable matching system that reduces scheduling overhead, improves evaluation quality, and creates an auditable match record.

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Candidate  │     │    Expert   │     │    Admin    │
│   Uploads   │     │   Creates   │     │   Reviews   │
│  Resume     │     │   Profile   │     │   & Assigns │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       └───────────────────┼───────────────────┘
                           │
                    ┌──────▼──────┐
                    │  ML Engine  │
                    │  NLP + Rank│
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │   Matches   │
                    │  (Ranked)   │
                    └─────────────┘
```

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

```
Metrics at a Glance:

Hit Rate:  ≥80%  ━━━━━━━━━━━━━━━━━━━━▊  (target)
Latency:   <5s   ━━━━━▊               (target)
Uptime:    ≥99%  ━━━━━━━━━━━━━━━━━━━━▉  (target)
Explain:   100%  ━━━━━━━━━━━━━━━━━━━━━  (target)
Clicks:    <3    ━━▊                   (target)
```

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

## 5. Feature Specifications

```
Feature Map:

F-01 Candidate Onboarding  →  Resume + Profile  →  NLP Queue
F-02 Expert Profile Mgmt   →  Skills + Avail    →  Qdrant Index
F-03 NLP Resume Parser     →  Raw PDF           →  Structured Fields
F-04 Embedding & Indexing  →  Profile Text       →  768-dim Vector
F-05 ML Matching           →  Top-20 ANN         →  Ranked Top-5
F-06 Admin Dashboard       →  Match Review       →  Approve/Override
F-07 Notifications         →  Events             →  Email/Webhook
```

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

---

## 6. Scoring Engine

The scoring engine re-ranks the top-20 ANN results using a multi-factor weighted formula. The goal is to go beyond raw semantic similarity and account for real-world assignment quality.

### Formula

```
total_score = (
    0.35 × semantic_similarity  ━━━━━━━━━━
    0.25 × skill_overlap_score  ━━━━━━
    0.20 × experience_fit_score ━━━━
    0.15 × domain_exact_match   ━━━
    0.05 × availability_overlap ━
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

## 7. Tech Stack

```
┌─────────────────────────────────────────────────────┐
│                  TECH STACK                          │
├──────────────┬──────────────┬──────────────┬────────┤
│   Backend    │   ML / NLP   │  Frontend    │  Ops   │
├──────────────┼──────────────┼──────────────┼────────┤
│ FastAPI      │ spaCy        │ Next.js 14   │ Docker │
│ Celery       │ sentence-    │ TailwindCSS  │ uvicorn│
│ Redis        │ transformers │ shadcn/ui    │ GitHub │
│ SQLAlchemy   │ RapidFuzz    │ React Query  │        │
│ Alembic      │ Qdrant       │ Axios        │        │
│ python-jose  │              │ RHF + Zod    │        │
└──────────────┴──────────────┴──────────────┴────────┘
```

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

## 8. Team Structure & Ownership

With 14 people, split into 4 squads. Each squad owns their layer end-to-end.

```
Team Structure:

Squad A (3)          Squad B (4)          Squad C (4)          Squad D (3)
Frontend             Backend / API        ML / NLP             Data / QA
┌─────────┐          ┌─────────┐          ┌─────────┐          ┌─────────┐
│Next.js  │          │FastAPI  │          │spaCy    │          │Seed Data│
│Portals  │◄────────►│REST API │◄────────►│Embedder │◄────────►│Testing  │
│Dashboard│          │Celery   │          │Scoring  │          │Demo     │
└─────────┘          └─────────┘          └─────────┘          └─────────┘
```

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

## 9. Week Sprint Plan

```
Sprint Gantt:

Day 1    Day 2    Day 3    Day 4    Day 5    Day 6-7
███████  ███████  ███████  ███████  ███████  ███
Setup    APIs     ML       Admin    Polish   Buffer
         Auth     Pipeline Dashboard Demo
         ML start
```

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

## 10. Non-Functional Requirements

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

## 11. Edge Cases & Risk Register

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

## 12. Deliverables Checklist

### Must-Have (MVP)

```
MVP Progress:

[ ] Candidate can submit resume and profile
[ ] Expert can create and update profile
[ ] ML pipeline runs async and returns ranked match list
[ ] Admin can view, approve, or override matches
[ ] Full score breakdown visible per match
[ ] Audit log of all assignments
[ ] 20 seeded test profiles with verified matching
```

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
