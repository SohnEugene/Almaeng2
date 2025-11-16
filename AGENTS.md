# Repository Guidelines

## Project Structure & Module Organization

Almaeng2 is split by runtime: `backend/` (FastAPI entry `main.py`, routers under `app/routes`, Firebase and payment services in `app/services`), `frontend-kiosk/` and `frontend-kiosk-v2/` (Vite React kiosks with UI under `src/components`, `pages`, `contexts`), `frontend-shop/` (CRA merchant console), and `bluetooth/` (Python helpers such as `scan.py`). Assets live beside each frontend inside `public/` or `src/assets`; avoid cross-package imports and share features through documented APIs.

## Build, Test, and Development Commands

Backend: `cd backend && pip install -r requirements.txt && uvicorn main:app --reload --port 8000` mirrors the Railway command. Frontend kiosk: `cd frontend-kiosk && npm install && npm run dev`; run `npm run build` for Vercel and `npm run lint` before committing. Kiosk v2 mirrors those scripts until it replaces the current UI. Frontend shop: `cd frontend-shop && npm install && npm start`; `npm run build` emits static assets and `npm test` invokes CRA/Jest.

## Coding Style & Naming Conventions

ESLint enforces 2-space indentation, semicolons, and React best practices. Keep components/pages in `PascalCase.jsx`, hooks and services in `camelCase.js`, and constants/config in `UPPER_SNAKE_CASE` (`src/constants/bluetooth.js`). Co-locate CSS modules under `src/styles` or next to the component. Python modules use 4-space indent, snake_case functions, and typed Pydantic models; keep routers minimal and place external integrations in `app/services`.

## Testing Guidelines

`frontend-shop` already exposes Jest via `npm test`; place suites in `src/__tests__` or alongside the feature as `*.test.jsx`. Vite kiosks should add Vitest and publish an `npm run test` script before merging logic-heavy hooks. The backend has no automated coverage yet—add `pytest` with `httpx.AsyncClient` for router tests, mock Firebase/payment clients, and prioritize kiosk provision, payment, and product flows. Document manual Bluetooth checks in PRs until scripted.

## Commit & Pull Request Guidelines

Git history favors short imperative subjects (`fix: only easy pay`) with optional scopes (`feat(kiosk): summary`). Keep lines under 72 characters, group related files, and reference issues in commit bodies when applicable. Pull requests must identify affected apps (backend/kiosk/shop), describe behavioral changes, attach screenshots or API traces for UI/API work, and confirm lint/tests were run locally; include Railway or Vercel preview links when available.

## Configuration & Environment Notes

Copy `backend/.env.example` to `.env` and supply Firebase plus payment secrets; never check them in. Vite frontends require `VITE_` prefixes, while the shop uses `REACT_APP_`. Document new variables in the relevant README, sync them with Railway/Vercel dashboards, and note any Bluetooth driver or permission needs in PRs.

## Style Guidelines

Before writing new styles, maximize the reuse of already defined class names (from `components.css` or Tailwind CSS utility classes) to prevent style duplication. All design token values (colors, spacing, font-weights, etc.) must use CSS variables defined in global.css in the format var(--variable-name). Avoid hardcoding px values or HEX color codes.
