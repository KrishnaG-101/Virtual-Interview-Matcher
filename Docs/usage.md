# Usage

## Overview

```
User Workflow:

Candidate                System                  Expert                 Admin
────────                 ──────                  ──────                 ─────
Upload Resume ─────────► PDF Parse (async)                              │
Fill Profile  ─────────► Embed + Index ────────► Indexed               │
Select Slots  ─────────► ANN Search (top-20)                           │
Submit        ─────────► Score + Rank (top-5) ──────────────────────► Review
                                                ◄── Notification ──── Approve/Override
                                                Accept/Decline ──────► Log
```

## User Roles

### Candidate

1. Register account
2. Fill profile: name, email, domain, experience level
3. Upload resume (PDF, max 5MB)
4. Select preferred interview slots
5. Submit — profile enters async processing
6. View status: "Processing" → "Matched" with assigned expert and interview time

### Expert

1. Register account
2. Create profile: domain, skills (max 20 tags), experience years, designation, bio
3. Set availability slots (weekly recurring or one-off)
4. Profile is immediately embedded and indexed
5. Receive notification when assigned to a candidate

### HR Admin

1. View candidate queue — all submissions with parse/match status
2. For each candidate, review ranked expert shortlist with score breakdowns
3. Actions:
   - **Approve** — confirm top-ranked expert
   - **Override** — pick different expert (reason required)
   - **Re-run matching** — re-trigger ML pipeline
4. Filter expert pool by domain/availability
5. View full assignment history audit log
6. Export assignments as CSV

## Typical Workflow

```
Candidate submits resume
        ↓
NLP pipeline runs (async, ~5-30s)
        ↓
Match results appear in admin queue
        ↓
Admin reviews top match + score breakdown
        ↓
Admin approves (or overrides with reason)
        ↓
Expert receives assignment notification
        ↓
Calendar slot booked, interview scheduled
```
