# Frontend

## Overview

```
Portal Structure:

┌─────────────────────────────────────────────────────────┐
│                    Next.js 14 App                        │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│ │  Candidate   │  │   Expert     │  │    Admin     │  │
│ │  Portal      │  │   Portal     │  │  Dashboard   │  │
│ ├──────────────┤  ├──────────────┤  ├──────────────┤  │
│ │ • Register   │  │ • Register   │  │ • Candidate  │  │
│ │ • Profile    │  │ • Profile    │  │   Queue      │  │
│ │ • Upload     │  │ • Skills     │  │ • Match      │  │
│ │ • Slots      │  │ • Availability│ │   Review     │  │
│ │ • Status     │  │ • Assigned   │  │ • Expert     │  │
│ │              │  │ • Decline    │  │   Pool       │  │
│ │              │  │              │  │ • Audit Log  │  │
│ │              │  │              │  │ • Override   │  │
│ └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│        │                 │                 │           │
│        └─────────────────┼─────────────────┘           │
│                          │                             │
│                   ┌──────▼──────┐                      │
│                   │  API Layer  │                      │
│                   │  React Q.   │                      │
│                   │  Axios      │                      │
│                   └─────────────┘                      │
└─────────────────────────────────────────────────────────┘
```

## Stack

Next.js 14 (App Router), TailwindCSS, shadcn/ui, React Query, Axios, React Hook Form.

## Portals

### Candidate Portal

- Registration / login
- Profile form: name, email, domain, experience level
- Resume upload (PDF, drag-and-drop or file picker)
- Interview slot picker (multi-select calendar)
- Status page: "Processing" → "Matched" with expert name and interview time
- No access to scores, other candidates, or expert details

### Expert Portal

- Registration / login
- Profile management: domain, skills (tag input, max 20), experience, designation, bio
- Availability calendar: add/remove recurring or one-off slots
- Assignment notifications
- Decline assignment with reason
- Cannot view other experts or candidate data

### Admin Dashboard

- **Candidate queue** — table of all submissions, filterable by parse/match status
- **Match review** — for selected candidate, ranked expert list with score bars and breakdown
- **Expert pool** — full list, filter by domain/availability, add/edit/deactivate
- **Assignment history** — chronological audit log with timestamps and admin ID
- **Override panel** — pick any expert, required reason text field

## API Integration

All data fetching via React Query + Axios. Base URL configured via environment variable:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

Key queries:
- `useCandidateQueue()` — paginated candidate list
- `useCandidateMatches(candidateId)` — ranked matches for a candidate
- `useExpertPool()` — filterable expert list
- `useAssignmentHistory()` — audit log

Mutations:
- `submitCandidate()` — profile + resume upload
- `runMatching(candidateId)` — trigger ML pipeline
- `approveMatch(matchId)` — confirm assignment
- `overrideMatch(matchId, {expertId, reason})` — manual override

## Forms

All forms use React Hook Form + Zod validation. File uploads use multipart form data via Axios.

## Styling

TailwindCSS with shadcn/ui component primitives. No custom CSS files — all styling via utility classes.
