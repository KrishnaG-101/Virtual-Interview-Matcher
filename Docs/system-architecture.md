# System Architecture

![Detailed Architecture](./virtual_interview_matcher_arch.svg)

## Components

| Layer      | Component             | Responsibility                                      |
| ---------- | --------------------- | --------------------------------------------------- |
| Frontend   | Next.js 14            | Candidate portal, expert portal, admin dashboard    |
| API        | FastAPI               | REST endpoints, auth, validation, job orchestration |
| Queue      | Celery + Redis        | Async ML pipeline execution with retry logic        |
| NLP        | spaCy                 | Skill extraction, NER, domain classification        |
| Embedder   | sentence-transformers | Profile encoding to 768-dim vectors                 |
| Ranker     | Scoring engine        | Multi-factor weighted re-ranking of ANN results     |
| Vector     | Qdrant                | ANN search over expert embeddings                   |
| Relational | PostgreSQL            | Users, profiles, matches, audit log                 |
| Cache      | Redis                 | Celery broker, result backend, API caching          |
| Storage    | S3 / R2               | Resume file storage with UUID filenames             |

## Data Flow

1. Candidate submits resume + profile → FastAPI saves to S3, profile to Postgres
2. FastAPI enqueues Celery job with candidate ID
3. Worker downloads PDF → extracts text → parses with spaCy → builds embedding input
4. Embedder produces 768-dim vector → upserted to Qdrant
5. Qdrant ANN search on `experts` collection → top-20 by cosine similarity
6. Scoring engine re-ranks → saves top-5 matches to Postgres with breakdowns
7. Admin reviews, approves, or overrides in dashboard
