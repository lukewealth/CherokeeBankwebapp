# Cherokee Bank Web App

**Digital banking web application for Cherokee Bank — secure account, transaction, and customer experience flows built with Next.js.**

TypeScript / Next.js fintech frontend (with Prisma and supporting backend patterns) focused on institution-grade UX, auth boundaries, and transaction-oriented UI.

> **Honesty note:** Describes repository capabilities. Does not claim regulated bank charter status, production transaction volume, or certifications unless independently verified.

## Problem

Retail and digital banking experiences need secure, clear interfaces for accounts, transfers, and customer workflows. Building those flows requires careful auth, data modeling, and UI reliability — not only visual polish.

## Solution

CherokeeBankwebapp implements a modern Next.js application structure for digital banking experiences: app routes, middleware, Prisma data layer, Docker support, and documentation under `docs/`.

## Architecture

```
Browser
   │
Next.js App (app/ + src/)
   │
middleware.ts (auth / edge concerns)
   │
Prisma · API routes / server logic
   │
Database (via Prisma)
```

Supporting: Docker, GitHub workflows, scripts, static assets.

## Features

- Next.js App Router structure
- TypeScript throughout
- Prisma schema / data access patterns
- Middleware for request-level concerns
- Dockerized deployment path
- Fintech-oriented UI and flows (verify against `app/` and `src/`)

## Tech stack

| Area | Technology |
|------|------------|
| Framework | Next.js |
| Language | TypeScript |
| Data | Prisma |
| Styling | Project CSS / PostCSS setup |
| Packaging | yarn |
| Containers | Docker |
| CI | GitHub Actions (`.github/`) |

## Repository structure

```
app/           # Next.js app routes
src/           # Shared application code
prisma/        # Schema and migrations
middleware.ts
docs/
scripts/
Dockerfile
package.json / yarn.lock
```

## Installation

```bash
git clone https://github.com/lukewealth/CherokeeBankwebapp.git
cd CherokeeBankwebapp
yarn install
cp .env.example .env
# Configure database and secrets
yarn dev
```

## Environment variables

See `.env.example` for required variables (database URL, auth secrets, etc.). Never commit real credentials.

## Usage

```bash
yarn dev      # local development
yarn build    # production build
yarn start    # production server
```

Exact scripts: check `package.json`.

## Testing

Confirm test scripts in `package.json` and CI workflows. Expand coverage for auth and critical money-movement paths before any production claim.

## Deployment

Docker image and GitHub workflows support deployment. Use staging environments and least-privilege secrets for any shared host.

## Security

- Secrets only via environment / secret manager
- Treat auth middleware and session handling as critical path
- No real customer PII in fixtures or logs
- Fintech UIs are not a substitute for licensed banking compliance

## Limitations

- Portfolio / product engineering artifact unless otherwise evidenced
- Not a claim of banking license, PCI certification, or live production volume
- Backend completeness varies by route — verify in code

## Current status

**Active codebase** (Next.js + Prisma + Docker). Suitable as backend/frontend engineering evidence for fintech systems work. Pair with architecture notes in interviews rather than marketing claims.

## Roadmap

- Stronger automated tests around auth and transactions
- Clearer API and domain documentation in `docs/`
- Hardened security headers and audit logging as needed

## Keywords

`typescript` `nextjs` `react` `backend` `api` `fintech` `prisma` `software-architecture` `docker`

## License

See repository license if present; otherwise all rights reserved by the author.
