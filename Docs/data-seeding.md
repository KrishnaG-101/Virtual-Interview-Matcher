# Data & Seeding

## Overview

```
Seed Data Distribution:

Domain       Experts    Candidates    Match Density
───────────  ─────────  ──────────    ─────────────
Engineering  ████████ 8 ██████ 6      HIGH
Finance      ████ 4    ████ 4        MEDIUM
Science      ████ 4    ████ 4        MEDIUM
Law          ██ 2      ███ 3         LOW (sparse)
Medicine     ██ 2      ███ 3         LOW (sparse)
             ─────────  ─────────
             20 total   20 total
```

Minimum 20 candidate + 20 expert profiles for meaningful matching and demo.

## Expert Profile Template

```json
{
  "name": "Dr. Jane Smith",
  "email": "jane.smith@example.com",
  "designation": "Senior Systems Architect",
  "domain": "Engineering",
  "skills": ["Python", "System Design", "Distributed Systems", "PostgreSQL", "Redis"],
  "experience_years": 12,
  "bio": "Lead architect for distributed systems at scale."
}
```

## Candidate Profile Template

```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "domain": "Engineering",
  "experience_level": "mid",
  "resume_pdf": "path/to/resume.pdf"
}
```

## Domains

Engineering, Finance, Law, Medicine, Science, Admin, Other

## Seeding Strategy

1. Write seed data as JSON fixtures in `backend/tests/fixtures/seed_data.json`
2. Create a seeding script: `backend/scripts/seed_db.py`
3. Script loads fixtures, upserts into Postgres, triggers expert embedding
4. Run via: `python -m backend.scripts.seed_db`

## Distribution for Demo Quality

| Domain       | Experts | Candidates | Purpose                           |
| ------------ | ------- | ---------- | --------------------------------- |
| Engineering  | 8       | 6          | Primary test case, dense matching |
| Finance      | 4       | 4          | Cross-domain testing              |
| Science      | 4       | 4          | Moderate overlap testing          |
| Law          | 2       | 3          | Sparse pool, tests weak matches   |
| Medicine     | 2       | 3          | Sparse pool, tests weak matches   |

## Validation

After seeding, verify:
- All experts have `embedding_id` set in Postgres
- Qdrant `experts` collection has matching point count
- Running matching pipeline on any candidate returns non-empty ranked list
- Score breakdowns are populated and explainable
