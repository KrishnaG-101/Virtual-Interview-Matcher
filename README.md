# Virtual Interview Matcher — HGM-07

AI platform that matches interview candidates to domain experts for evaluation panels. Replaces manual expert assignment with data-driven, explainable matching.

**Project Code:** HGM-07 · **Track:** ML Ranking · NLP · Backend Systems · **Domain:** Gov / HR Tech

---

## What & Why

Government and HR teams assign interview panel members manually — based on familiarity, not structured fit. There is no way to measure domain alignment, no audit trail, and the process does not scale past a few dozen candidates.

This system ingests candidate resumes and expert profiles, parses skills and experience via NLP, embeds both into a shared semantic space, and produces a ranked, scored shortlist of expert-candidate pairings. Every match is explainable with a full score breakdown.

## How It Works

1. Candidate uploads resume + profile form
2. Async ML pipeline extracts skills, experience, and domain via spaCy
3. Profile is embedded into a 768-dim vector (`all-mpnet-base-v2`) and stored in Qdrant
4. Approximate nearest neighbor search retrieves the top-20 most similar experts
5. A multi-factor scoring engine re-ranks results using weighted semantic similarity (0.35), skill overlap (0.25), experience fit (0.20), domain match (0.15), and availability overlap (0.05)
6. Admin reviews ranked shortlist, approves or overrides with an audit trail
7. Assigned expert receives notification

## System Architecture

![System Architecture](./Docs/virtual_interview_matcher_arch.svg)

| Layer    | Stack                                           |
| -------- | ----------------------------------------------- |
| Frontend | Next.js 14, TailwindCSS, shadcn/ui              |
| API      | FastAPI, JWT auth, Celery + Redis job queue     |
| ML       | spaCy, sentence-transformers, RapidFuzz, Qdrant |
| Storage  | PostgreSQL, Redis, Qdrant, S3                   |

## Reference

Full specifications, sprint plan, and data models are in [the PRD](./Docs/virtual_interview_matcher_PRD.md).

## Related Documentation

| Document                                             | Description                                   |
| ---------------------------------------------------- | --------------------------------------------- |
| [System Architecture](./Docs/system-architecture.md) | Layer diagram, components, data flow          |
| [API Specification](./Docs/api.md)                   | All REST endpoints, auth, response formats    |
| [Database Schema](./Docs/database.md)                | Table definitions, constraints, relationships |
| [ML Pipeline](./Docs/ml-pipeline.md)                 | NLP, embedding, scoring, Celery tasks         |
| [Data Seeding](./Docs/data-seeding.md)               | Seed data templates, validation strategy      |
| [Usage Guide](./Docs/usage.md)                       | Candidate, expert, and admin workflows        |
| [Deployment](./Docs/deployment.md)                   | Docker Compose, env vars, production notes    |
| [Frontend](./Docs/frontend.md)                       | Portals, API integration, forms               |

---
