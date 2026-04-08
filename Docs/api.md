# API Specification

## Overview

```
API Endpoints Map:

/auth          /candidates        /experts             /matches            /availability
───────        ──────────         ────────             ────────            ─────────────
POST /register POST /             POST /               POST /run/{id}      POST /
POST /login    GET  /{id}         GET  /{id}           GET  /{id}          GET  /{user_id}
POST /refresh  GET  / (paginated) GET  / (list)        POST /{id}/approve  DELETE /{slot_id}
               PATCH /{id}        PATCH /{id}          POST /{id}/override
                                  DELETE /{id}         GET  /history
```

Base path: `/api/v1`. Auth via JWT Bearer token. Role-based access enforced per endpoint.

## Auth

| Method | Endpoint         | Description              | Auth   |
| ------ | ---------------- | ------------------------ | ------ |
| POST   | `/auth/register` | Register candidate/expert| Public |
| POST   | `/auth/login`    | Returns JWT              | Public |
| POST   | `/auth/refresh`  | Refresh access token     | User   |

## Candidates

| Method | Endpoint           | Description                     | Auth            |
| ------ | ------------------ | ------------------------------- | --------------- |
| POST   | `/candidates/`     | Create profile + upload resume  | Candidate       |
| GET    | `/candidates/{id}` | Get candidate profile           | Admin           |
| GET    | `/candidates/`     | List all candidates (paginated) | Admin           |
| PATCH  | `/candidates/{id}` | Update profile                  | Candidate/Admin |

## Experts

| Method | Endpoint        | Description                        | Auth         |
| ------ | --------------- | ---------------------------------- | ------------ |
| POST   | `/experts/`     | Create expert profile              | Expert/Admin |
| GET    | `/experts/{id}` | Get expert profile                 | Admin        |
| GET    | `/experts/`     | List all experts                   | Admin        |
| PATCH  | `/experts/{id}` | Update profile (triggers re-embed) | Expert/Admin |
| DELETE | `/experts/{id}` | Deactivate expert                  | Admin        |

## Matching

| Method | Endpoint                       | Description                    | Auth  |
| ------ | ------------------------------ | ------------------------------ | ----- |
| POST   | `/matches/run/{candidate_id}`  | Trigger matching pipeline      | Admin |
| GET    | `/matches/{candidate_id}`      | Get ranked match list          | Admin |
| POST   | `/matches/{match_id}/approve`  | Approve top match              | Admin |
| POST   | `/matches/{match_id}/override` | Override with different expert | Admin |
| GET    | `/matches/history`             | Full assignment audit log      | Admin |

## Availability

| Method | Endpoint                  | Description                      | Auth       |
| ------ | ------------------------- | -------------------------------- | ---------- |
| POST   | `/availability/`          | Add slot for candidate or expert | User       |
| GET    | `/availability/{user_id}` | Get user's slots                 | User/Admin |
| DELETE | `/availability/{slot_id}` | Remove slot                      | User       |

## Match Response Format

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
  "explanation": "Strong domain alignment (Engineering). 6 of 9 candidate skills matched."
}
```
