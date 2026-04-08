# Database

## Overview

```
Entity Relationships:

users (admin)        candidates                experts
─────────            ──────────                ───────
id ────────────────► id                        id
email                email                     email
role                 domain                    domain
hashed_password      experience_level          skills (JSONB)
                     resume_s3_key             experience_years
                     parsed_skills (JSONB)     bio
                     experience_years          embedding_id ────┐
                     embedding_id ────┐        is_active        │
                     parse_status     │                         │
                     created_at       │                         │
                                      │       availability_slots│
                                      │       ──────────────────│
                    matches           │       id                │
                    ───────           │       user_id ──────────┘
                    id                │       user_type (candidate|expert)
                    candidate_id ─────┘       slot_start
                    expert_id ───────────────►slot_end
                    total_score               is_booked
                    score_breakdown (JSONB)
                    rank
                    explanation
                    status
                    override_reason
                    assigned_by ──────► users.id
                    created_at
```

## Engine

PostgreSQL with SQLAlchemy ORM. Migrations via Alembic.

## Tables

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
| total_score     | FLOAT                                           | 0.0-1.0        |
| score_breakdown | JSONB                                           | all sub-scores |
| rank            | INTEGER                                         | 1 = best       |
| explanation     | TEXT                                            | auto-generated |
| status          | ENUM(suggested, approved, overridden, declined) |                |
| override_reason | TEXT                                            | nullable       |
| assigned_by     | UUID                                            | admin user ID  |
| created_at      | TIMESTAMP                                       |                |

### users

| Column          | Type                    | Notes |
| --------------- | ----------------------- | ----- |
| id              | UUID (PK)               |       |
| email           | VARCHAR(255) UNIQUE     |       |
| role            | ENUM(admin, superadmin) |       |
| hashed_password | VARCHAR(500)            |       |
| created_at      | TIMESTAMP               |       |

## Constraints

- Unique constraint on `(candidate_id, status='approved')` to prevent double approval
- All FK deletes cascade or restrict based on audit requirements
- Passwords hashed with bcrypt (cost factor >= 12)
