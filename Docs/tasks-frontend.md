# Frontend Tasks — HGM-07

## Phase 1: Project Setup

- [ ] Verify Next.js 14 app structure with App Router (`app/` directory)
- [ ] Install dependencies: tailwindcss, shadcn/ui, @tanstack/react-query, axios, react-hook-form, zod, date-fns
- [ ] Initialize shadcn/ui: `npx shadcn@latest init` with Tailwind config
- [ ] Configure `next.config.ts` — API base URL rewrite or proxy if needed
- [ ] Set up environment variables: `NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1`
- [ ] Create axios instance with base URL, JWT interceptor, error handler
- [ ] Create React Query provider: QueryClient, QueryClientProvider, default staleTime
- [ ] Create app layout: providers wrapper, global font, metadata
- [ ] Set up routing structure: `(auth)/`, `(candidate)/`, `(expert)/`, `(admin)/` route groups

## Phase 2: Auth Infrastructure

- [ ] Create auth context or store: user state, token management, login/logout functions
- [ ] JWT storage: httpOnly cookie via backend or localStorage (coordinate with backend auth flow)
- [ ] Axios interceptor: attach Bearer token to all requests, 401 → redirect to login
- [ ] Create route guards: `AuthGuard`, `RoleGuard` — protect candidate/expert/admin routes
- [ ] Build login page: email + password form, validation via Zod, submit → redirect by role
- [ ] Build registration page: role selector (candidate/expert), form per role, validation
- [ ] Token refresh logic: intercept 401, call /auth/refresh, retry original request
- [ ] Test: login as each role, verify redirect, test expired token, test logout clears state

## Phase 3: Shared Components

- [ ] Install shadcn/ui primitives: button, input, select, dialog, toast, table, badge, card, dropdown-menu, calendar, form, textarea, skeleton, alert, tabs
- [ ] Create file upload component: drag-and-drop or click, PDF icon, filename display, size validation (5MB)
- [ ] Create data table component: reusable, sortable, paginated, with loading state
- [ ] Create score bar component: visual bar showing score 0-1 with color coding (red/yellow/green)
- [ ] Create score breakdown component: expandable row showing all 5 sub-scores with labels
- [ ] Create status badge component: pending/done/failed/suggested/approved/overridden/declined
- [ ] Create availability calendar component: multi-select time slots, weekly recurring toggle
- [ ] Create loading skeleton pages for each portal during data fetch
- [ ] Create error/empty state components: "No data", "No matches found", "Try again" button
- [ ] Test: all components render in Storybook or isolated pages, responsive at mobile/tablet/desktop

## Phase 4: Candidate Portal

- [ ] Route: `(candidate)/register` — registration form (name, email, phone, password)
- [ ] Route: `(candidate)/profile` — profile form with domain dropdown, experience level select, resume upload
- [ ] Route: `(candidate)/availability` — calendar-based slot picker, add/remove slots, save
- [ ] Route: `(candidate)/dashboard` — submission status card: "Processing" or "Matched" with expert name + interview time
- [ ] Wire profile form to POST /candidates/ via React Query mutation
- [ ] Wire status polling: fetch GET /candidates/{id} every 5s while parse_status=pending
- [ ] Wire availability slots to POST /availability
- [ ] Redirect after successful submission → dashboard
- [ ] Form validation: Zod schemas matching backend expectations (email, required fields, file type)
- [ ] Test: full submission flow, file upload, status transitions, validation errors, duplicate email error

## Phase 5: Expert Portal

- [ ] Route: `(expert)/register` — registration form (name, email, designation, password)
- [ ] Route: `(expert)/profile` — profile management: domain, skills (tag input, max 20), experience, bio
- [ ] Route: `(expert)/availability` — slot management: add/remove, weekly recurring vs one-off, view existing
- [ ] Route: `(expert)/assignments` — list of assigned interviews: candidate name, date, time, status, decline button
- [ ] Wire profile form to POST /experts/ and PATCH /experts/{id}
- [ ] Show embedding status indicator: "Indexed" (green) or "Processing" (yellow) — derived from API response
- [ ] Wire availability CRUD to POST /availability, GET /availability/{id}, DELETE /availability/{slot_id}
- [ ] Wire decline assignment: POST /matches/{match_id}/decline (if backend supports) or flag via PATCH
- [ ] Test: profile update triggers re-embed (verify status indicator), slot CRUD, decline flow

## Phase 6: Admin Dashboard — Candidate Queue

- [ ] Route: `(admin)/candidates` — table of all candidates: name, domain, parse_status, match_status, submitted_at
- [ ] Filters: by parse_status (pending/done/failed), by domain, by date range
- [ ] Search: by name or email
- [ ] Click row → navigate to match review page for that candidate
- [ ] Pagination: server-side, configurable page size (10, 25, 50)
- [ ] Loading state: skeleton table rows
- [ ] Empty state: "No candidates submitted yet"
- [ ] Wire to GET /candidates/ with React Query (paginated, filtered)
- [ ] Add "Re-run matching" button per candidate → POST /matches/run/{candidate_id}
- [ ] Test: pagination works, filters apply correctly, re-run triggers toast notification

## Phase 7: Admin Dashboard — Match Review

- [ ] Route: `(admin)/candidates/[id]/matches` — ranked expert list for selected candidate
- [ ] Each row: expert name, designation, domain, total_score, rank badge, expandable breakdown
- [ ] Score breakdown panel: skill overlap %, experience fit, domain match, availability, semantic similarity
- [ ] Auto-generated explanation displayed below each match
- [ ] "Approve" button on top match (primary action)
- [ ] "Override" button on any row → opens dialog: expert selector + reason text (required)
- [ ] Confirm dialog before approve: "Assign {expert} to interview {candidate}?"
- [ ] Wire to GET /matches/{candidate_id} for ranked list
- [ ] Wire approve: POST /matches/{match_id}/approve → refresh, show toast, redirect
- [ ] Wire override: POST /matches/{match_id}/override → refresh, show toast
- [ ] Loading state: skeleton rows
- [ ] Empty state: "No matches yet — matching pipeline still running" with refresh button
- [ ] Test: approve flow, override requires reason, list refreshes after action, explanation renders

## Phase 8: Admin Dashboard — Expert Pool

- [ ] Route: `(admin)/experts` — table of all experts: name, domain, skills (tags), experience, is_active, embedding_status
- [ ] Filters: by domain, by availability (has open slots), by active status
- [ ] Search: by name or skill
- [ ] "Add Expert" button → opens expert creation form (same schema as expert portal)
- [ ] Row actions: edit (opens form), deactivate (confirm dialog)
- [ ] Wire to GET /experts/, POST /experts/, PATCH /experts/{id}, DELETE /experts/{id}
- [ ] Test: add new expert, edit existing, deactivate → disappears from match results

## Phase 9: Admin Dashboard — Assignment History

- [ ] Route: `(admin)/history` — chronological audit log of all finalized assignments
- [ ] Columns: candidate, expert, total_score, status, assigned_by (admin), approved_at, override_reason (if any)
- [ ] Filters: by admin, by date range, by status (approved/overridden/declined)
- [ ] "Export CSV" button → downloads all filtered assignments
- [ ] Wire to GET /matches/history
- [ ] Test: history populates after approvals, filters work, CSV downloads with correct data

## Phase 10: Notifications & UX Polish

- [ ] Toast notifications for all mutations: success, error, loading
- [ ] Form error display: server-side validation errors mapped to fields
- [ ] Loading states on all buttons during mutation (spinner + disabled)
- [ ] Optimistic updates where safe (e.g., deactivate expert → remove from list immediately)
- [ ] Error boundaries around each route group
- [ ] Global error page: `app/error.tsx` with retry button
- [ ] Responsive design: all layouts tested at 320px, 768px, 1024px, 1440px
- [ ] Accessibility: keyboard navigation, focus states, aria labels on form fields
- [ ] Test: all toast types, error boundaries trigger, responsive layouts, keyboard tab order

## Phase 11: API Integration Layer

- [ ] Create React Query hooks:
  - `useCandidateQueue()` — paginated GET /candidates/
  - `useCandidate(candidateId)` — GET /candidates/{id}
  - `useExpertPool()` — GET /experts/
  - `useCandidateMatches(candidateId)` — GET /matches/{candidate_id}
  - `useAssignmentHistory()` — GET /matches/history
  - `useUserAvailability(userId)` — GET /availability/{user_id}
- [ ] Create React Query mutations:
  - `useRegisterCandidate()`
  - `useRegisterExpert()`
  - `useSubmitCandidate()` — multipart form data with file upload
  - `useRunMatching(candidateId)`
  - `useApproveMatch()`
  - `useOverrideMatch()`
  - `useCreateAvailabilitySlot()`
  - `useDeleteAvailabilitySlot()`
- [ ] Error handling in mutations: display backend error messages in toast
- [ ] Refetch strategies: invalidate relevant queries after mutations
- [ ] Test: each hook independently, verify data shapes match schemas
