# Contributing

## Setup

1. Fork the repository and create a feature branch
2. Install dependencies:
   - Backend: `cd backend && pip install -e .`
   - Frontend: `cd frontend && npm install`
3. Start infrastructure: `docker-compose up -d`
4. Run migrations: `alembic upgrade head`

## Development

- Backend: `uvicorn main:app --reload` (port 8000)
- Frontend: `npm run dev` (port 3000)
- Run backend tests: `pytest`
- Run frontend lint: `npm run lint`

## Commit Conventions

Use conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`.

Keep messages concise. Reference issue numbers if applicable.

## Pull Requests

- One logical change per PR
- Include a description of what changed and why
- Update documentation if APIs or data models changed
- All tests must pass before requesting review

## Code Style

- Python: follow PEP 8, use type hints, run `ruff check` before committing
- TypeScript: follow project conventions, run `npm run lint` before committing
- No commented-out code in commits
- No secrets or credentials in code or documentation

## Issues

- Use the issue tracker for bugs and feature requests
- Include reproduction steps for bugs
- Reference the PRD for feature request context
