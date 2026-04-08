# ML Pipeline Tasks — HGM-07

## Phase 1: Infrastructure Setup

- [ ] Install ML dependencies: spacy, sentence-transformers, rapidfuzz, pdfplumber, PyMuPDF, pytesseract, Pillow, qdrant-client, celery, numpy
- [ ] Download spaCy model: `python -m spacy download en_core_web_lg`
- [ ] Set up `ml/celery_app.py` — Celery instance with Redis broker/result backend, JSON serializer, task timezone
- [ ] Create `ml/__init__.py` — expose celery_app, pipeline functions
- [ ] Verify Celery worker connects to Redis and can execute a test task
- [ ] Set up Qdrant: create `experts` and `candidates` collections with cosine distance, 768 dimensions
- [ ] Configure Qdrant client in `ml/vector_store/client.py` — singleton, init from env vars
- [ ] Test: end-to-end Celery task → Qdrant connection verified

## Phase 2: PDF Ingestion (F-03, Step 1)

- [ ] `ml/parser/pdf_extractor.py` — `extract_text(pdf_bytes) -> str` using pdfplumber
- [ ] Handle multi-page PDFs: concatenate all page text with page separators
- [ ] Clean extracted text: remove excessive whitespace, normalize line endings
- [ ] Detect if PDF has text layer: if zero text extracted, flag as scanned
- [ ] Scanned PDF fallback: use pytesseract OCR on each page (converted to image via pdf2image)
- [ ] OCR confidence scoring: if average confidence < 60%, flag as low-confidence parse
- [ ] Language detection: use langdetect or fasttext — if not English, flag for manual review
- [ ] Handle errors: corrupted PDF, encrypted PDF, zero-byte file — raise specific exceptions
- [ ] Test: clean PDF → full text extraction, scanned PDF → OCR text, corrupted PDF → error, mixed content PDF

## Phase 3: NLP Resume Parser (F-03, Step 2)

- [ ] `ml/parser/nlp_parser.py` — `parse_resume(raw_text) -> ParsedResume`
- [ ] Load spaCy model (en_core_web_lg) with NER pipeline
- [ ] Skill extraction: custom rule-based matcher against `skills_dictionary.json`
  - Match skills as phrases (multi-token: "Machine Learning", "Natural Language Processing")
  - Handle abbreviations: "ML" → "Machine Learning" via alias mapping
  - Deduplicate near-duplicates using RapidFuzz (threshold >= 85)
- [ ] Experience extraction: regex + spaCy NER for work history patterns
  - Parse date ranges: "2019-2023", "Jan 2020 - Present", "3 years"
  - Sum total years across all positions
  - Handle overlapping roles without double-counting
- [ ] Domain classification: zero-shot classifier (HuggingFace) with labels: Engineering, Finance, Law, Medicine, Science, Admin, Other
  - Input: extracted skills + work history summary
  - Output: top domain with confidence score
  - If confidence < 0.5, flag for manual review
- [ ] Education extraction: spaCy NER for degree patterns ("BSc", "Master of", "PhD in") + institution names
- [ ] Output: `ParsedResume(skills[], experience_years, domain, domain_confidence, education[], raw_text, flags[])`
- [ ] Handle short resumes (< 100 tokens): flag as "incomplete parse"
- [ ] Test: 5 sample resumes across domains → verify correct skills, experience, domain, education

## Phase 4: Skills Dictionary (F-03)

- [ ] `ml/parser/skills_dictionary.json` — curated list of ~2000 skills
- [ ] Organize by domain: Engineering, Finance, Law, Medicine, Science, Admin
- [ ] Include aliases for each skill: `"machine_learning": ["ML", "Machine Learning", "MachineLearning"]`
- [ ] Include common misspellings and variations
- [ ] Test: verify coverage across all 7 domains, spot-check alias matching

## Phase 5: Embedding Model (F-04, Step 3-4)

- [ ] `ml/embedding/model.py` — `EmbeddingModel` wrapper around sentence-transformers
  - Load `all-mpnet-base-v2` on startup (cache to disk)
  - `encode(text: str) -> np.ndarray` — returns 768-dim vector, L2 normalized
  - Truncate input to 512 tokens (model's max context)
  - Batch encode support for future bulk indexing
- [ ] `ml/embedding/input_builder.py` — `build_candidate_text(candidate, parsed) -> str` and `build_expert_text(expert) -> str`
  - Candidate format: `"[DOMAIN] {domain} [SKILLS] {skills_joined} [EXP] {experience_years} years [TEXT] {parsed.raw_text[:2000]}"`
  - Expert format: `"[DOMAIN] {domain} [SKILLS] {skills_joined} [EXP] {experience_years} years [BIO] {bio}"`
  - Handle missing fields gracefully (skip section if empty)
  - Token count logging for monitoring
- [ ] Test: encode known text pairs → verify cosine similarity is reasonable (similar profiles > 0.7, different < 0.3)

## Phase 6: Vector Store Operations (F-04, Step 5)

- [ ] `ml/vector_store/operations.py` — `upsert_point(collection, point_id, vector, payload) -> bool`
- [ ] `search(collection, vector, top_k=20) -> list[(point_id, score, payload)]`
- [ ] `delete_point(collection, point_id) -> bool`
- [ ] `count_points(collection) -> int`
- [ ] Collection management: `create_collection(name, dim=768, distance="Cosine")`
- [ ] Payload storage: store domain, skills, name in Qdrant payload for retrieval alongside scores
- [ ] Connection retry logic: if Qdrant unavailable, retry with exponential backoff (3 attempts)
- [ ] Test: upsert → search → correct results, delete → search excludes deleted, count accurate, collection creation idempotent

## Phase 7: Scoring Engine (F-05, Steps 6-7)

- [ ] `ml/scoring/sub_scores.py` — individual score calculators:
  - `calc_semantic_similarity(qdrant_score) -> float` — pass through, already [0,1]
  - `calc_skill_overlap(candidate_skills, expert_skills) -> float` — intersection / candidate count with RapidFuzz fuzzy matching
  - `calc_experience_fit(candidate_years, expert_years) -> float` — delta-based scoring per PRD formula
  - `calc_domain_match(candidate_domain, expert_domain) -> float` — 1.0 or 0.0
  - `calc_availability_overlap(candidate_slots, expert_slots) -> float` — total overlapping hours / 2.0, capped at 1.0
- [ ] `ml/scoring/engine.py` — `rank_matches(candidate, top_experts) -> list[MatchResult]`
  - Apply weights: 0.35, 0.25, 0.20, 0.15, 0.05
  - Sort by total_score descending
  - Return top-5 with full score_breakdown dict
  - Handle edge case: zero availability overlap → still include, score=0
- [ ] `ml/scoring/explanation.py` — `generate_explanation(candidate, expert, breakdown) -> str`
  - Format: domain match statement + skill match count + experience delta
  - Handle low scores: if total < 0.4, add "Low overall match — manual review recommended"
- [ ] Test scoring engine with known data:
  - Perfect match (same domain, all skills, 5+ years delta) → score > 0.9
  - Partial match (same domain, half skills, 2 years delta) → score ~0.6
  - Poor match (different domain, no skills, negative delta) → score < 0.3
- [ ] Test weight sensitivity: change weights → verify ranking changes accordingly

## Phase 8: Celery Tasks — Matching Pipeline

- [ ] `ml/tasks/matching.py` — `run_matching_pipeline(candidate_id: str) -> dict`
  - Step 1: Fetch candidate from DB (via service or direct query)
  - Step 2: Download resume from S3 → extract text via pdf_extractor
  - Step 3: Parse resume via nlp_parser → get skills, experience, domain
  - Step 4: Build embedding input → encode → 768-dim vector
  - Step 5: Upsert candidate vector to Qdrant "candidates" collection
  - Step 6: ANN search on "experts" collection → top-20
  - Step 7: Score and rank via scoring engine → top-5 with breakdowns
  - Step 8: Save matches to Postgres via match_service
  - Step 9: Update candidate parse_status = "done"
  - Error handling: each step can raise, caught by Celery retry decorator
  - Return: `{"candidate_id": "...", "matches_found": 5, "status": "done"}`
- [ ] `@celery_app.task(bind=True, max_retries=3)` — retry with 30s countdown
- [ ] Task timeout: 600 seconds (soft limit), 900 seconds (hard limit)
- [ ] Idempotency: check parse_status == "pending" before running, delete old matches if re-run
- [ ] Logging: log each step completion with timing info
- [ ] Test: run pipeline with real candidate → verify all steps complete, matches saved, parse_status updated
- [ ] Test: force failure at step 4 → verify retry triggers, doesn't leave partial state

## Phase 9: Celery Tasks — Expert Embedding

- [ ] `ml/tasks/embedding.py` — `embed_expert(expert_id: str) -> bool`
  - Fetch expert from DB → build embedding input → encode → upsert to Qdrant "experts"
  - Update expert's embedding_id in Postgres
  - Idempotent: safe to call multiple times (upsert, not insert)
- [ ] `re_embed_expert(expert_id: str) -> bool` — alias for profile update trigger (same logic)
- [ ] Bulk indexing task: `index_all_experts() -> int` — for initial setup or recovery
  - Fetch all active experts → batch encode → bulk upsert to Qdrant
  - Return count of indexed experts
- [ ] Test: single expert embed → verify in Qdrant, update → re-embed → vector changes, bulk index → count matches active experts

## Phase 10: Unit Tests — ML Modules

- [ ] Test `pdf_extractor.py`: clean PDF, scanned PDF, corrupted PDF, encrypted PDF, empty file, multi-page PDF
- [ ] Test `nlp_parser.py`: engineering resume, finance resume, short resume (< 100 tokens), non-English resume
- [ ] Test `embedding/model.py`: encode single text, encode batch, truncate at 512 tokens, normalized output
- [ ] Test `embedding/input_builder.py`: missing fields handled, token count within limits, format matches expected
- [ ] Test `vector_store/operations.py`: upsert, search, delete, count, collection creation, connection failure
- [ ] Test `scoring/sub_scores.py`: each sub-score with edge cases (empty skills, zero experience, same domain, no overlap)
- [ ] Test `scoring/engine.py`: ranking order, weight changes, top-5 truncation, empty expert list
- [ ] Test `scoring/explanation.py`: all score levels, missing data, low-confidence warning
- [ ] Target: 80%+ coverage on ml/ package

## Phase 11: Integration Tests — End-to-End Pipeline

- [ ] Full pipeline: submit candidate resume → wait for Celery task → verify matches in DB
  - Check: parse_status transitions pending → done
  - Check: 5 matches saved with valid score_breakdowns
  - Check: all scores in [0, 1], total_score is weighted sum of breakdown
  - Check: explanation string is non-empty and readable
- [ ] Expert update → re-embed → new embedding produces different match scores
- [ ] Delete expert from Qdrant → search still works (fewer results)
- [ ] Celery worker down → task queues, resumes when worker restarts
- [ ] Qdrant down → task retries 3 times, then fails with clear error, parse_status = "failed"
- [ ] Performance: pipeline completes in < 30 seconds with 20 seeded experts
- [ ] Performance: ANN search over 1000 experts completes in < 500ms

## Phase 12: Monitoring & Observability

- [ ] Add timing metrics to each pipeline step (log duration per step)
- [ ] Add match quality metrics: average total_score per candidate, distribution of scores
- [ ] Log parse failures with root cause (step that failed, exception type)
- [ ] Log Qdrant collection sizes periodically
- [ ] Expose pipeline metrics via a simple endpoint or log file for dashboard consumption
- [ ] Test: trigger pipeline → verify timing logs, trigger failure → verify error log with context
