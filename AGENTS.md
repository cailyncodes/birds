# Agentic Development Guide

## 1. Build / Lint / Test

The repository contains **two independent applications**:
* **Backend** – a Sanic API written in Python under `backend/`.
* **Frontend** – a Qwik / Vite app under `frontend/`.

Each stack has its own build, lint, and test tooling and these **cannot** be run together by a single npm script.

### Backend

| Task | Command | Description |
|------|---------|-------------|
| **Install dependencies** | `uv pip install -r pyproject.toml` | Installs Python packages managed by `uv`. Run from `backend/`. |
| **Run the API** | `uv run ./main.py` | Starts Sanic on http://localhost:8000. |
| **Type‑check** | `uv run python -m pyright .` | (Optional – pyright is recommended for large codebases). |
| **Run tests** | `uv run python -m pytest -v` | Executes tests located in `backend/tests`. |
| **Lint** | `uv run ruff check .` | Static linting for Python. |
| **Format check** | `uv run ruff format . --check` | Ensures code formatting. |

### Frontend

| Task | Command | Description |
|------|---------|-------------|
| **Install dependencies** | `npm install` | Installs JS/TS packages. Run from `frontend/`. |
| **Build for production** | `npm run build` | Builds Qwik → `dist/` and Fastify server. |
| **Serve production build** | `node server/entry.fastify` | Serves the built Fastify app. |
| **Start dev server** | `npm run dev` | Vite dev server at http://localhost:5173. |
| **Run tests** | `npm test` | Executes frontend test suite (Jest / AVA). |
| **Lint** | `npm run lint` | ESLint over `src/**/*.ts*`. |
| **Format check** | `npm run fmt.check` | Prettier formatting verification. |

### Cross‑stack

* The frontend Vite config proxies `/api` to `http://localhost:8000`. Ensure the backend is running before starting the frontend dev server.
* The `package.json` at the repo root contains wrapper scripts that run *both* back‑end and front‑end commands sequentially. These only exist to illustrate a unified workflow. For automated CI pipelines, split the jobs per stack.

## 2. Code Style Guidelines

| Area | Recommendation | Rationale |
|------|----------------|-----------|
| **Imports** | Standard‑library imports first, third‑party next, local modules last. Separate groups with a blank line. | Consistent, readable, aligns with PEP‑8 & ESLint. |
| **Formatting** | JavaScript/TypeScript: Prettier with 2‑space indents (Qwik) and 4‑space for backend. Python: `black` & `ruff`. | Ensure a uniform code style across languages. |
| **Type annotations** | Python: explicit signatures, `typing.Protocol` for service interfaces. TypeScript: explicit types or interfaces. | Enables static type checking and documentation. |
| **Naming** | Python modules/functions: `snake_case`. Classes: `PascalCase`. JS/TS variables/functions: `camelCase`. | Matches language idioms. |
| **Error handling** | Never swallow exceptions. Wrap external calls with try/except or try/catch, log via `app.logger` or `console.error`, return proper HTTP status codes. | Avoid silent failures and provide clear diagnostics. |
| **Logging** | `logging` (Python) or `console` (JS) with levels – `debug`, `info`, `warn`, `error`. | Gives traceability. |
| **Docstrings/Comments** | Public Python functions: PEP‑257 docstrings. Public Qwik components: JSDoc. | Improves self‑documentation. |
| **Environment vars** | Keep secrets in `.env`; do not commit. Use `dotenv` or `python-dotenv`. | Security best practices. |
| **Testing** | Tests located in `backend/tests` and `frontend/tests`. Follow unit‑integration balance. Aim for ≥80 % coverage. | Guarantees reliability. |

## 3. Cursor / Copilot Rules

The repo currently does **not** contain `.cursor/rules/` or `.cursorrules`. The following sections are placeholders for future rules.

### Cursor Rules
```markdown
# No cursor rules defined.
```

### Copilot Instructions
```markdown
# No Copilot instructions defined.
```

## 4. Dev Commands Overview

```bash
# Build both stacks (run separately)
cd backend && uv pip install -r pyproject.toml && uv run python -m pytest -v
cd ../frontend && npm install && npm run build && node server/entry.fastify
```

```bash
# Start both stacks concurrently (use a tool like `concurrently`)
cd backend && UV_RUN=uv run ./main.py & cd ../frontend && npm run dev
```

---

**Enjoy coding!**
