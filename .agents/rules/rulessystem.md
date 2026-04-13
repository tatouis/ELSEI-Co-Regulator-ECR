---
trigger: always_on
---

# ELSEI Co-Regulator (ECR) — Workspace Rules (project-specific)

Project shape (authoritative)
- This repo has two apps:
  - backend/ (NestJS) serves API at http://localhost:4000/api and emits real-time updates via WebSockets.
  - frontend/ (Next.js) serves UI at http://localhost:3000.
- Use npm (not yarn/pnpm). Follow the repository README commands.

Non-negotiable constraints
- Do not break Simulation Mode. Any change must keep the simulated learner stream running.
- Preserve real-time updates: do not remove existing WebSocket events; extend them compatibly.
- Do not add heavy new frameworks or rewrite architecture unless explicitly requested.

Engineering conventions
- Prefer incremental PR-style changes:
  1) implement backend contract (DTOs, endpoints, socket events),
  2) then implement frontend consumption,
  3) then polish UI,
  4) then add docs.
- When you introduce a new environment variable, update README and provide an .env.example entry (never commit real .env secrets).

Verification (minimum)
- When backend changes: start backend in dev mode and ensure the API boots cleanly.
- When frontend changes: start frontend in dev mode and ensure pages load.
- If scripts exist, prefer running lint/build; if not present, do not invent commands—ask first.

UX consistency
- Maintain the existing “academic + glassmorphism + subtle animation” UI direction.
- Avoid disruptive UX: overlays must be dismissible and non-blocking (especially for intervention cards).
