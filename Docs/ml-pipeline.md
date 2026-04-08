# ML Pipeline

## Overview

```
Pipeline Flow:

┌─────────┐    ┌──────────┐    ┌───────────┐    ┌──────────┐
│  PDF    │───►│   NLP    │───►│ Serialize │───►│ Embed    │
│  S3     │    │  spaCy   │    │  Build    │    │ 768-dim  │
└─────────┘    └──────────┘    └───────────┘    └────┬─────┘
                                                     │
                    ┌────────────────────────────────┘
                    │
              ┌─────▼─────┐    ┌───────────┐    ┌──────────┐
              │  Qdrant   │───►│  Score    │───►│ Persist  │
              │  ANN k=20 │    │  Re-rank  │    │ Postgres │
              └───────────┘    └───────────┘    └──────────┘

Step:   1-2          3            4           5         6-7           8
Time:   ~2s          ~3s          ~0.5s       ~1s       ~0.5s         ~1s
```

Async Celery task pipeline: PDF resume → parsed profile → ranked expert matches. Max 3 retries with 30s backoff.

## Pipeline Steps

| Step | Stage              | Input                    | Output                              |
| ---- | ------------------ | ------------------------ | ----------------------------------- |
| 1    | PDF Ingestion      | S3 resume key            | Raw text string                     |
| 2    | NLP Parsing        | Raw text                 | `{skills[], experience_years, domain, education[]}` |
| 3    | Profile Serialization | Parsed fields + DB profile | Input text (max 512 tokens)     |
| 4    | Embedding          | Input text               | 768-dim vector (`all-mpnet-base-v2`) |
| 5    | Vector Storage     | Vector + entity ID       | Qdrant point, ID saved to Postgres  |
| 6    | ANN Retrieval      | Candidate vector         | Top-20 experts by cosine similarity |
| 7    | Re-ranking         | Top-20 + candidate profile | Ranked list with score breakdowns |
| 8    | Persistence        | Ranked matches           | Match records in Postgres           |

## NLP Parser

- PDF extraction: `pdfplumber` / `PyMuPDF`
- OCR fallback (scanned PDFs): `pytesseract`
- Skill extraction: `spaCy` (en_core_web_lg) with ~2000 skill dictionary
- Domain classification: zero-shot via HuggingFace transformers
- Failure modes: corrupted PDF → form-only data with manual review flag

## Embedding

- Model: `sentence-transformers/all-mpnet-base-v2` (768 dimensions)
- Candidate input: `"[DOMAIN] {domain} [SKILLS] {skills} [EXP] {years} years [BIO] {resume_text}"` (truncated to 512 tokens)
- Expert input: `"[DOMAIN] {domain} [SKILLS] {skills} [EXP] {years} years [BIO] {bio}"`
- Vector store: Qdrant collections `experts` and `candidates`

## Scoring Engine

Weighted formula re-ranks top-20 ANN results:

```
total_score = (0.35 * semantic_similarity) +
              (0.25 * skill_overlap) +
              (0.20 * experience_fit) +
              (0.15 * domain_match) +
              (0.05 * availability_overlap)
```

| Factor               | Weight | Calculation                                          |
| -------------------- | ------ | ---------------------------------------------------- |
| Semantic similarity  | 0.35   | Cosine similarity from Qdrant, [0,1]                 |
| Skill overlap        | 0.25   | `|candidate ∩ expert| / |candidate|` with fuzzy matching (RapidFuzz >= 85) |
| Experience fit       | 0.20   | delta >= 5y → 1.0, >= 2y → 0.75, >= 0 → 0.5, < 0 → 0.2 |
| Domain match         | 0.15   | 1.0 if exact match, 0.0 otherwise                    |
| Availability overlap | 0.05   | `min(overlap_hours / 2.0, 1.0)`                     |

## Celery Task

```python
@celery_app.task(bind=True, max_retries=3)
def run_matching_pipeline(self, candidate_id: str):
    try:
        candidate = db.get_candidate(candidate_id)
        raw_text = s3.download_and_extract(candidate.resume_s3_key)
        parsed = nlp_parser.parse(raw_text)
        vector = embedder.encode(build_input_text(candidate, parsed))
        qdrant.upsert("candidates", candidate_id, vector)
        top_experts = qdrant.search("experts", vector, top_k=20)
        ranked = scoring_engine.rank(candidate, top_experts)
        db.save_matches(candidate_id, ranked)
        db.update_parse_status(candidate_id, "done")
    except Exception as exc:
        self.retry(exc=exc, countdown=30)
```
