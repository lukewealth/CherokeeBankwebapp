# Cherokee Bank — Full-Stack Technical Guide

> **Version:** 1.0.0 | **Last Updated:** February 15, 2026  
> **Stack:** Next.js 16 · React 19 · TypeScript 5 · TailwindCSS 4 · Prisma 7 · PostgreSQL · Redis · OpenAI GPT-4

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Complete File Structure](#3-complete-file-structure)
4. [Development Setup](#4-development-setup)
5. [Environment Variables Reference](#5-environment-variables-reference)
6. [Database Schema](#6-database-schema)
7. [API Reference](#7-api-reference)
8. [Authentication & Security](#8-authentication--security)
9. [Core Banking Services](#9-core-banking-services)
10. [AI & Machine Learning](#10-ai--machine-learning)
11. [Frontend Architecture](#11-frontend-architecture)
12. [Admin Portal](#12-admin-portal)
13. [Compliance & Risk](#13-compliance--risk)
14. [Testing Strategy](#14-testing-strategy)
15. [Deployment](#15-deployment)
16. [Technical Requirements Checklist](#16-technical-requirements-checklist)
17. [Non-Technical Requirements Checklist](#17-non-technical-requirements-checklist)

---

## 1. Project Overview

Cherokee Bank is a production-grade digital banking platform featuring fiat wallets, crypto trading, merchant POS, AI-powered risk analysis, and a full admin portal. It is built as a monolithic Next.js application using the App Router with a strict server/client separation.

### Key Capabilities

| Domain | Features |
|---|---|
| **Banking** | Multi-currency wallets (USD/EUR/GBP/CHERO), P2P transfers, deposits, withdrawals, currency conversion |
| **Crypto** | Buy/sell BTC/ETH/USDT, crypto wallets, live rate feeds, swap engine |
| **Merchant** | POS terminal, settlement processing, dispute management |
| **AI** | GPT-4 banking assistant, fraud prediction, sentiment analysis, spend tracking, savings recommender, semantic document search |
| **Admin** | User management, KYC review, balance overrides, fraud center, audit logs, risk analysis |
| **Security** | JWT rotation, 2FA/TOTP, CSRF protection, rate limiting, geo-blocking, IP logging, AES-256 encryption |
| **Compliance** | AML screening, KYC verification, fraud engine, risk scoring |

---

## 2. Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                      │
│   Next.js App Router · React 19 · TailwindCSS · Framer Motion│
├──────────────────────────────────────────────────────────────┤
│                     MIDDLEWARE LAYER                          │
│   Rate Limiting · CSRF · Security Headers · Geo-Blocking     │
│   IP Logger · Role-based Access Control                      │
├──────────────────────────────────────────────────────────────┤
│                    API ROUTES (app/api/)                      │
│   Auth · Wallets · Transactions · Crypto · Merchant · Admin  │
│   AI · User                                                  │
├──────────────────────────────────────────────────────────────┤
│                    SERVER SERVICES (src/server/)              │
│   Auth · Banking · Admin · Crypto · Compliance · Notif.      │
├──────────────────────────────────────────────────────────────┤
│                    AI ENGINE (src/ai/)                        │
│   LLM · Automations · Embeddings                             │
├──────────────────────────────────────────────────────────────┤
│                    DATA LAYER                                 │
│   Prisma ORM → PostgreSQL · Redis (cache/rate-limit)         │
└──────────────────────────────────────────────────────────────┘
```

### Design Principles

- **Server-First:** Business logic lives exclusively in `src/server/`. API routes are thin wrappers.
- **Type Safety:** Shared types in `src/types/`, Zod validation at API boundaries.
- **Separation of Concerns:** Components split into `ui/`, `layout/`, and domain-specific folders.
- **Security by Default:** Middleware chain applies rate limiting, CSRF, headers, and geo-blocking before any route handler executes.

---

## 3. Complete File Structure

```
cherokee-bank/
├── .env.example                    # Environment template (67 vars)
├── .dockerignore                   # Docker ignore rules
├── .github/
│   └── workflows/
│       └── ci.yml                  # GitHub Actions CI/CD pipeline
├── Dockerfile                      # Multi-stage production Docker build
├── README.md                       # Project readme
├── guide.md                        # ← THIS FILE
├── middleware.ts                    # Root Next.js middleware (security chain)
├── next.config.ts                  # Next.js configuration
├── package.json                    # Dependencies & scripts
├── tsconfig.json                   # TypeScript configuration
├── postcss.config.mjs              # PostCSS + TailwindCSS
├── eslint.config.mjs               # ESLint configuration
├── prisma/
│   └── schema.prisma               # Full database schema (502 lines, 15+ models)
│
├── public/                         # Static assets
├── styles/                         # Global style overrides
│
├── app/                            # ──── NEXT.JS APP ROUTER ────
│   ├── layout.tsx                  # Root layout (fonts, providers, metadata)
│   ├── page.tsx                    # Landing page (public)
│   ├── globals.css                 # TailwindCSS imports + CSS variables
│   │
│   ├── (auth)/                     # ── Auth Route Group ──
│   │   ├── layout.tsx              # Auth layout (centered card)
│   │   ├── login/page.tsx          # Login page
│   │   ├── register/page.tsx       # Registration page
│   │   ├── verify-otp/page.tsx     # OTP verification page
│   │   ├── reset-password/page.tsx # Password reset page
│   │   └── kyc-upload/page.tsx     # KYC document upload page
│   │
│   ├── (dashboard)/                # ── Dashboard Route Group (authenticated) ──
│   │   ├── layout.tsx              # Dashboard layout (sidebar + header)
│   │   ├── page.tsx                # Dashboard home (overview, stats, charts)
│   │   ├── wallets/page.tsx        # Wallet management
│   │   ├── crypto/page.tsx         # Crypto trading
│   │   ├── transactions/
│   │   │   ├── page.tsx            # Transaction history
│   │   │   └── [id]/page.tsx       # Transaction detail
│   │   ├── send/page.tsx           # Send money
│   │   ├── merchant/pos/page.tsx   # Merchant POS terminal
│   │   ├── ai/page.tsx             # AI banking assistant
│   │   └── settings/
│   │       ├── page.tsx            # Settings overview
│   │       ├── account/page.tsx    # Account settings
│   │       ├── security/page.tsx   # Security settings (2FA, password)
│   │       ├── notifications/page.tsx # Notification preferences
│   │       └── api-keys/page.tsx   # API key management
│   │
│   ├── (public)/                   # ── Public Route Group ──
│   │   ├── layout.tsx              # Public layout (navbar + footer)
│   │   ├── about/page.tsx          # About page
│   │   ├── careers/page.tsx        # Careers page
│   │   ├── legal/page.tsx          # Legal / Terms page
│   │   └── support/page.tsx        # Support / Contact page
│   │
│   ├── admin/                      # ── Admin Portal ──
│   │   ├── layout.tsx              # Admin layout (sidebar + role guard)
│   │   ├── page.tsx                # Admin dashboard (KPIs, charts)
│   │   ├── users/page.tsx          # User management
│   │   ├── wallets/page.tsx        # All wallets overview
│   │   ├── adjust-balance/page.tsx # Balance adjustment tool
│   │   ├── transactions/page.tsx   # All transactions review
│   │   ├── fraud-center/page.tsx   # Fraud detection center
│   │   └── settings/page.tsx       # Admin settings
│   │
│   └── api/                        # ──── API ROUTES ────
│       ├── auth/
│       │   ├── login/route.ts      # POST — email/password login
│       │   ├── register/route.ts   # POST — new user registration
│       │   ├── refresh/route.ts    # POST — refresh token rotation
│       │   ├── logout/route.ts     # POST — invalidate session
│       │   ├── otp/route.ts        # POST — generate/verify OTP
│       │   └── kyc-upload/route.ts # POST — upload KYC documents
│       │
│       ├── wallets/
│       │   ├── balance/route.ts    # GET — wallet balance
│       │   ├── create/route.ts     # POST — create wallet
│       │   ├── deposit/route.ts    # POST — deposit funds
│       │   ├── withdraw/route.ts   # POST — withdraw funds
│       │   ├── convert/route.ts    # POST — currency conversion
│       │   └── details/route.ts    # GET — wallet details
│       │
│       ├── transactions/
│       │   ├── create/route.ts     # POST — create transaction
│       │   ├── list/route.ts       # GET — list user transactions
│       │   └── [id]/route.ts       # GET — single transaction by ID
│       │
│       ├── crypto/
│       │   ├── buy/route.ts        # POST — buy cryptocurrency
│       │   ├── sell/route.ts       # POST — sell cryptocurrency
│       │   ├── rate/route.ts       # GET — live exchange rates
│       │   └── wallets/route.ts    # GET — crypto wallet balances
│       │
│       ├── merchant/
│       │   ├── pos/route.ts        # POST — process POS payment
│       │   ├── settle/route.ts     # POST — settle merchant balance
│       │   └── dispute/route.ts    # POST — file/resolve dispute
│       │
│       ├── admin/
│       │   ├── users/route.ts      # GET — list all users (admin)
│       │   ├── adjust-balance/route.ts  # POST — manual balance adjustment
│       │   ├── freeze-account/route.ts  # POST — freeze user account
│       │   ├── unfreeze-account/route.ts # POST — unfreeze user account
│       │   ├── audit-log/route.ts       # GET — audit trail
│       │   ├── risk-analysis/route.ts   # GET — AI risk analysis
│       │   └── kyc-review/route.ts      # POST — approve/reject KYC
│       │
│       ├── ai/
│       │   ├── chat/route.ts       # POST — AI banking assistant
│       │   ├── risk-engine/route.ts # POST — AI risk assessment
│       │   └── sentiment/route.ts  # POST — sentiment analysis
│       │
│       └── user/
│           ├── profile/route.ts    # GET/PUT — user profile
│           ├── documents/route.ts  # GET — user documents
│           └── update/route.ts     # PUT — update profile
│
├── src/                            # ──── SOURCE MODULES ────
│   ├── config/                     # Configuration & connections
│   │   ├── db.ts                   # Prisma client singleton
│   │   ├── redis.ts                # Redis (ioredis) client
│   │   ├── env.ts                  # Environment validation
│   │   ├── mail.ts                 # Nodemailer transport
│   │   ├── storage.ts              # File storage (S3/GCS/local)
│   │   └── crypto-providers.ts     # CoinGecko/Binance config
│   │
│   ├── server/                     # ── Server-Side Business Logic ──
│   │   ├── auth/
│   │   │   ├── jwt.ts              # JWT sign/verify, token rotation
│   │   │   ├── bcrypt.ts           # Password hashing (12 rounds)
│   │   │   ├── guards.ts           # Auth guards & role checks
│   │   │   └── session.ts          # Session management
│   │   │
│   │   ├── banking/
│   │   │   ├── wallet.service.ts   # Create/query/freeze wallets
│   │   │   ├── transaction.service.ts # Transfer, deposit, withdraw
│   │   │   ├── ledger.ts           # Double-entry ledger
│   │   │   ├── reconciliation.ts   # Account reconciliation
│   │   │   └── currency-engine.ts  # FX rate conversion
│   │   │
│   │   ├── admin/
│   │   │   ├── user-mgmt.ts        # User CRUD, freeze/unfreeze
│   │   │   ├── audit.ts            # Audit log service
│   │   │   └── balance-override.ts # Manual balance adjustments
│   │   │
│   │   ├── crypto/
│   │   │   ├── provider.ts         # Exchange API integration
│   │   │   ├── wallets.ts          # Crypto wallet management
│   │   │   ├── swaps.ts            # Crypto swap engine
│   │   │   └── withdrawals.ts      # Crypto withdrawal processing
│   │   │
│   │   ├── compliance/
│   │   │   ├── aml.ts              # Anti-money laundering screening
│   │   │   ├── kyc.ts              # KYC verification pipeline
│   │   │   ├── fraud-engine.ts     # Fraud detection engine
│   │   │   └── risk-scoring.ts     # User risk score calculator
│   │   │
│   │   └── notifications/
│   │       ├── email.ts            # Email (Nodemailer/SMTP)
│   │       ├── sms.ts              # SMS (Twilio)
│   │       └── push.ts             # Push (Firebase FCM)
│   │
│   ├── ai/                         # ── AI / ML Modules ──
│   │   ├── llm/
│   │   │   ├── bank-assistant.ts   # GPT-4 banking chatbot
│   │   │   ├── fraud-predictor.ts  # AI fraud prediction
│   │   │   └── customer-support.ts # AI customer support
│   │   │
│   │   ├── automations/
│   │   │   ├── spend-tracker.ts    # Automated spend categorization
│   │   │   └── savings-recommender.ts # AI savings goals
│   │   │
│   │   └── embeddings/
│   │       ├── documents.ts        # Document vectorization
│   │       └── semantic-search.ts  # Vector similarity search
│   │
│   ├── middleware/                  # ── Security Middleware ──
│   │   ├── rate-limit.ts           # Sliding-window rate limiter (Redis)
│   │   ├── csrf.ts                 # CSRF token validation
│   │   ├── headers.ts              # Security headers (HSTS, CSP, X-Frame)
│   │   ├── geo-blocking.ts         # OFAC-sanctioned country blocking
│   │   ├── ip-logger.ts            # Request IP audit logging
│   │   └── rac.ts                  # Role-based access control
│   │
│   ├── components/                 # ── React Components ──
│   │   ├── ui/                     # Generic reusable UI
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── card.tsx
│   │   │   ├── modal.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── spinner.tsx
│   │   │   └── index.ts            # Barrel export
│   │   │
│   │   ├── layout/                 # Layout components
│   │   │   ├── sidebar.tsx
│   │   │   ├── header.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── domain/                 # Domain-specific components
│   │   │   └── (transaction-table, wallet-card, etc.)
│   │   │
│   │   ├── dashboard/              # Dashboard widgets
│   │   ├── auth/                   # Auth form components
│   │   ├── admin/                  # Admin-specific components
│   │   ├── wallets/                # Wallet components
│   │   ├── crypto/                 # Crypto components
│   │   ├── transactions/           # Transaction components
│   │   ├── merchant/               # Merchant components
│   │   └── ai/                     # AI chat components
│   │
│   ├── types/                      # ── TypeScript Types ──
│   │   ├── user.ts                 # User, Profile, Session types
│   │   ├── wallet.ts               # Wallet, Balance types
│   │   ├── transaction.ts          # Transaction types & filters
│   │   ├── crypto.ts               # Crypto types & rates
│   │   ├── merchant.ts             # Merchant & POS types
│   │   ├── admin.ts                # Admin action types
│   │   ├── api.ts                  # API response/error types
│   │   └── index.ts                # Barrel export
│   │
│   ├── utils/                      # ── Utility Functions ──
│   │   ├── format.ts               # Date, currency, number formatting
│   │   ├── validators.ts           # Zod schemas + validation helpers
│   │   ├── currency.ts             # Currency codes, symbols, conversion
│   │   ├── api-response.ts         # Standardized API responses
│   │   └── helpers.ts              # General helpers (debounce, etc.)
│   │
│   ├── hooks/                      # ── React Hooks ──
│   │   ├── useAuth.ts              # Auth state & login/logout
│   │   ├── useWallet.ts            # Wallet data & operations
│   │   ├── useTransactions.ts      # Transaction list & filters
│   │   ├── useCrypto.ts            # Crypto rates & trading
│   │   └── index.ts                # Barrel export
│   │
│   └── lib/                        # Third-party wrappers (reserved)
│
└── (generated)
    └── .next/                      # Next.js build output
```

---

## 4. Development Setup

### Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| **Node.js** | ≥ 20.x | Runtime |
| **npm** | ≥ 10.x | Package manager |
| **PostgreSQL** | ≥ 15 | Primary database |
| **Redis** | ≥ 7 | Caching & rate limiting |
| **Git** | ≥ 2.x | Version control |
| **Docker** (optional) | ≥ 24 | Containerized deployment |

### Step-by-Step Setup

```bash
# 1. Clone repository
git clone https://github.com/your-org/cherokee-bank.git
cd cherokee-bank

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your actual database, Redis, and API credentials

# 4. Start PostgreSQL & Redis (if not already running)
# macOS (Homebrew):
brew services start postgresql@15
brew services start redis
# Or use Docker:
docker run -d --name cherokee-pg -p 5432:5432 -e POSTGRES_PASSWORD=password -e POSTGRES_DB=cherokee_bank postgres:15
docker run -d --name cherokee-redis -p 6379:6379 redis:7-alpine

# 5. Create database (if not using Docker)
createdb cherokee_bank

# 6. Run Prisma migrations
npx prisma generate
npx prisma db push
# Or for migration-based workflow:
# npx prisma migrate dev --name init

# 7. (Optional) Seed database
npx prisma db seed

# 8. Start development server
npm run dev
# → http://localhost:3000
```

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Next.js dev server with hot reload |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx prisma studio` | Open Prisma database GUI |
| `npx prisma generate` | Regenerate Prisma Client |
| `npx prisma db push` | Push schema to database |
| `npx prisma migrate dev` | Create and apply migration |

---

## 5. Environment Variables Reference

All variables are defined in `.env.example`. Required variables are marked with ✦.

### Database & Cache

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✦ | PostgreSQL connection string |
| `REDIS_URL` | ✦ | Redis connection string |

### Authentication

| Variable | Required | Description |
|---|---|---|
| `JWT_SECRET` | ✦ | Signing key for access tokens (≥32 chars) |
| `JWT_REFRESH_SECRET` | ✦ | Signing key for refresh tokens (≥32 chars) |
| `JWT_ACCESS_EXPIRY` | | Access token TTL (default: `15m`) |
| `JWT_REFRESH_EXPIRY` | | Refresh token TTL (default: `7d`) |

### Encryption

| Variable | Required | Description |
|---|---|---|
| `ENCRYPTION_KEY` | ✦ | AES-256 encryption key (32 chars) |
| `ENCRYPTION_IV` | ✦ | Initialization vector (16 chars) |

### AI / OpenAI

| Variable | Required | Description |
|---|---|---|
| `OPENAI_API_KEY` | ✦* | GPT-4 API key (*required if AI features enabled) |
| `OPENAI_MODEL` | | Model name (default: `gpt-4`) |

### Email (SMTP)

| Variable | Required | Description |
|---|---|---|
| `SMTP_HOST` | | SMTP server hostname |
| `SMTP_PORT` | | SMTP port (default: `587`) |
| `SMTP_USER` | | SMTP username |
| `SMTP_PASS` | | SMTP password |
| `SMTP_FROM` | | Sender email address |

### SMS (Twilio)

| Variable | Required | Description |
|---|---|---|
| `TWILIO_ACCOUNT_SID` | | Twilio Account SID |
| `TWILIO_AUTH_TOKEN` | | Twilio Auth Token |
| `TWILIO_PHONE_NUMBER` | | Sending phone number |

### File Storage

| Variable | Required | Description |
|---|---|---|
| `STORAGE_PROVIDER` | | `local`, `s3`, or `gcs` |
| `AWS_S3_BUCKET` | | S3 bucket name |
| `AWS_S3_REGION` | | S3 region |
| `AWS_ACCESS_KEY_ID` | | AWS access key |
| `AWS_SECRET_ACCESS_KEY` | | AWS secret key |
| `GCS_BUCKET` | | Google Cloud Storage bucket |
| `GCS_PROJECT_ID` | | GCP project ID |

### Crypto Providers

| Variable | Required | Description |
|---|---|---|
| `COINGECKO_API_KEY` | | CoinGecko API key |
| `BINANCE_API_KEY` | | Binance API key |
| `BINANCE_API_SECRET` | | Binance API secret |

### Push Notifications (Firebase)

| Variable | Required | Description |
|---|---|---|
| `FIREBASE_PROJECT_ID` | | Firebase project ID |
| `FIREBASE_PRIVATE_KEY` | | Firebase private key |
| `FIREBASE_CLIENT_EMAIL` | | Firebase client email |

### Application

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | ✦ | Public-facing app URL |
| `NEXT_PUBLIC_APP_NAME` | | App display name |
| `NODE_ENV` | | `development` / `production` |

---

## 6. Database Schema

### Models Overview

| Model | Description | Key Fields |
|---|---|---|
| **User** | Platform users | email, role, status, kycStatus, 2FA |
| **Wallet** | Fiat currency wallets | currency, balance, availableBalance, limits |
| **CryptoWallet** | Cryptocurrency wallets | crypto, balance, address |
| **Transaction** | All financial transactions | type, status, amount, sender/receiver |
| **KYCDocument** | Identity documents | docType, status, fileUrl |
| **Merchant** | Merchant accounts | businessName, status, webhook |
| **AuditLog** | Admin action trail | action, actor, metadata |
| **FraudReport** | Flagged activities | severity, resolution |
| **SecurityEvent** | Login/security events | eventType, ip, userAgent |
| **OTPCode** | One-time passwords | code, expiresAt, used |
| **Notification** | User notifications | type, title, read status |
| **ApiKey** | Developer API keys | key, scopes, rateLimit |
| **RefreshToken** | JWT refresh tokens | token, expiresAt, revoked |

### Enums

- `UserRole`: USER, ADMIN, SUPERADMIN
- `UserStatus`: ACTIVE, FROZEN, SUSPENDED, PENDING
- `KYCStatus`: NOT_SUBMITTED, PENDING, VERIFIED, REJECTED
- `FiatCurrency`: USD, EUR, GBP, CHERO
- `CryptoCurrency`: BTC, ETH, USDT
- `WalletStatus`: ACTIVE, FROZEN, CLOSED
- `TransactionType`: TRANSFER, DEPOSIT, WITHDRAWAL, CONVERSION, POS_PAYMENT, CRYPTO_BUY, CRYPTO_SELL, FEE, ADJUSTMENT
- `TransactionStatus`: PENDING, PROCESSING, COMPLETED, FAILED, FLAGGED, REVERSED, CANCELLED
- `SecurityEventType`: LOGIN, LOGOUT, PASSWORD_CHANGE, TWO_FACTOR_TOGGLE, ACCOUNT_FROZEN, ACCOUNT_UNFROZEN, etc.

### Key Relationships

```
User ──1:N──▶ Wallet ──1:N──▶ Transaction
User ──1:N──▶ CryptoWallet
User ──1:1──▶ Merchant ──1:N──▶ MerchantTransaction
User ──1:N──▶ KYCDocument
User ──1:N──▶ SecurityEvent
User ──1:N──▶ Notification
User ──1:N──▶ AuditLog (as actor)
User ──1:N──▶ ApiKey
User ──1:N──▶ RefreshToken
```

---

## 7. API Reference

All endpoints return JSON. Authenticated routes require `Authorization: Bearer <token>` header.

### Auth Routes (`/api/auth/`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Register new user (email, password, firstName, lastName) |
| POST | `/api/auth/login` | No | Login with email/password → returns access + refresh tokens |
| POST | `/api/auth/refresh` | No | Exchange refresh token for new token pair |
| POST | `/api/auth/logout` | Yes | Revoke refresh token, end session |
| POST | `/api/auth/otp` | Partial | Generate or verify OTP code |
| POST | `/api/auth/kyc-upload` | Yes | Upload KYC documents (multipart/form-data) |

### Wallet Routes (`/api/wallets/`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/wallets/balance` | Yes | Get balance for user's wallets |
| POST | `/api/wallets/create` | Yes | Create new wallet (specify currency) |
| POST | `/api/wallets/deposit` | Yes | Deposit funds into wallet |
| POST | `/api/wallets/withdraw` | Yes | Withdraw funds from wallet |
| POST | `/api/wallets/convert` | Yes | Convert between fiat currencies |
| GET | `/api/wallets/details` | Yes | Get detailed wallet info |

### Transaction Routes (`/api/transactions/`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/transactions/create` | Yes | Create P2P transfer |
| GET | `/api/transactions/list` | Yes | List transactions (paginated, filterable) |
| GET | `/api/transactions/[id]` | Yes | Get single transaction details |

### Crypto Routes (`/api/crypto/`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/crypto/buy` | Yes | Buy cryptocurrency |
| POST | `/api/crypto/sell` | Yes | Sell cryptocurrency |
| GET | `/api/crypto/rate` | Yes | Get live exchange rates |
| GET | `/api/crypto/wallets` | Yes | Get user's crypto wallets |

### Merchant Routes (`/api/merchant/`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/merchant/pos` | Yes | Process POS payment |
| POST | `/api/merchant/settle` | Yes | Settle merchant balance |
| POST | `/api/merchant/dispute` | Yes | File or resolve payment dispute |

### Admin Routes (`/api/admin/`) — Requires ADMIN or SUPERADMIN role

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/admin/users` | Admin | List all users with filters |
| POST | `/api/admin/adjust-balance` | Admin | Manual balance adjustment |
| POST | `/api/admin/freeze-account` | Admin | Freeze user account |
| POST | `/api/admin/unfreeze-account` | Admin | Unfreeze user account |
| GET | `/api/admin/audit-log` | Admin | View audit trail |
| GET | `/api/admin/risk-analysis` | Admin | AI-powered risk report |
| POST | `/api/admin/kyc-review` | Admin | Approve/reject KYC submissions |

### AI Routes (`/api/ai/`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/ai/chat` | Yes | Banking assistant chat |
| POST | `/api/ai/risk-engine` | Admin | AI risk assessment for user |
| POST | `/api/ai/sentiment` | Admin | Sentiment analysis on text |

### User Routes (`/api/user/`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET / PUT | `/api/user/profile` | Yes | Get or update user profile |
| GET | `/api/user/documents` | Yes | List uploaded documents |
| PUT | `/api/user/update` | Yes | Update profile fields |

### Standard API Response Format

```typescript
// Success
{ "success": true, "data": { ... } }

// Error
{ "error": "Error message", "code": "ERROR_CODE" }
```

---

## 8. Authentication & Security

### Authentication Flow

```
1. User registers → password hashed (bcrypt, 12 rounds) → stored in DB
2. User logs in → credentials verified → JWT access token (15m) + refresh token (7d) issued
3. Client sends access token in Authorization header for API calls
4. On 401/expiry → client calls /api/auth/refresh with refresh token
5. Server rotates: old refresh token revoked, new pair issued
6. Logout revokes all refresh tokens for user
```

### Two-Factor Authentication (2FA)

- TOTP-based (Time-based One-Time Password)
- OTP sent via SMS (Twilio) or email (SMTP)
- Required for sensitive operations (large transfers, settings changes)

### Security Middleware Chain

The root `middleware.ts` runs on every request:

1. **Security Headers** — HSTS, X-Frame-Options: DENY, X-Content-Type-Options: nosniff, CSP
2. **Rate Limiting** — Sliding window via Redis (configurable per-route)
3. **CSRF Protection** — Token validation for state-changing requests
4. **Geo-Blocking** — Blocks requests from OFAC-sanctioned countries
5. **IP Logging** — Records client IP for audit trail
6. **Role-Based Access** — Route-level permission enforcement

### Encryption

- **Passwords:** bcrypt with 12 salt rounds
- **Sensitive Data:** AES-256-CBC encryption (account numbers, SSNs)
- **Tokens:** HS256-signed JWTs
- **Transport:** HTTPS enforced via HSTS

---

## 9. Core Banking Services

### Wallet Service (`src/server/banking/wallet.service.ts`)

- Create multi-currency wallets (USD, EUR, GBP, CHERO)
- Query balances (total vs. available)
- Enforce daily/monthly transaction limits
- Freeze/unfreeze wallets

### Transaction Service (`src/server/banking/transaction.service.ts`)

- P2P transfers with real-time balance updates
- Deposits and withdrawals
- Transaction status lifecycle: PENDING → PROCESSING → COMPLETED/FAILED
- Automatic fraud flagging on suspicious amounts

### Double-Entry Ledger (`src/server/banking/ledger.ts`)

- Every transaction creates debit + credit entries
- Ensures balance integrity
- Supports reconciliation audits

### Currency Engine (`src/server/banking/currency-engine.ts`)

- Real-time FX rate fetching
- Multi-currency conversion (with spread/fee)
- Historical rate caching via Redis

### Reconciliation (`src/server/banking/reconciliation.ts`)

- Scheduled balance verification
- Ledger vs. wallet balance comparison
- Discrepancy reporting

---

## 10. AI & Machine Learning

### Banking Assistant (`src/ai/llm/bank-assistant.ts`)

- GPT-4 powered conversational agent
- Context-aware: has access to user's transaction history and account status
- Handles balance inquiries, transfer assistance, financial advice

### Fraud Predictor (`src/ai/llm/fraud-predictor.ts`)

- Analyzes transaction patterns using GPT-4
- Generates risk scores (0-100) per transaction
- Flags anomalous behavior (unusual amounts, new recipients, off-hours)

### Customer Support (`src/ai/llm/customer-support.ts`)

- AI-powered FAQ resolution
- Ticket categorization and routing
- Sentiment detection for escalation

### Spend Tracker (`src/ai/automations/spend-tracker.ts`)

- Automated transaction categorization
- Monthly spending reports by category
- Budget deviation alerts

### Savings Recommender (`src/ai/automations/savings-recommender.ts`)

- Analyzes income vs. spending patterns
- Generates personalized savings goals
- Suggests optimal savings amounts

### Document Embeddings (`src/ai/embeddings/`)

- Vectorizes banking documents for semantic search
- Uses OpenAI embedding models
- Enables natural-language document queries

---

## 11. Frontend Architecture

### Route Groups

| Group | Purpose | Layout |
|---|---|---|
| `(auth)` | Login, register, OTP, KYC | Centered card, no sidebar |
| `(dashboard)` | All authenticated user pages | Sidebar + header |
| `(public)` | Marketing/info pages | Navbar + footer |
| `admin` | Admin portal | Admin sidebar + role guard |

### Component Library (`src/components/ui/`)

All components support the glassmorphism design system via CSS variables:

| Component | File | Description |
|---|---|---|
| Button | `button.tsx` | Primary, secondary, ghost, danger variants |
| Input | `input.tsx` | Text, email, password with validation |
| Select | `select.tsx` | Dropdown with options |
| Card | `card.tsx` | Glassmorphism card container |
| Modal | `modal.tsx` | Dialog overlay with Portal |
| Badge | `badge.tsx` | Status indicators (success, warning, error) |
| Avatar | `avatar.tsx` | User avatar with fallback initials |
| Spinner | `spinner.tsx` | Loading spinner |

### State Management

- **Server State:** React hooks (`useAuth`, `useWallet`, `useTransactions`, `useCrypto`) wrapping `fetch()` calls
- **Local State:** React `useState`/`useReducer` for form state
- **No external state library** — leverages Next.js server components + client hooks

### Styling

- **TailwindCSS 4** with custom theme via CSS variables
- **Glassmorphism design**: `backdrop-blur`, semi-transparent backgrounds
- **Framer Motion**: Page transitions, card animations, hover effects
- **Dark theme default** with CSS custom properties

---

## 12. Admin Portal

### Pages

| Page | Path | Features |
|---|---|---|
| Dashboard | `/admin` | KPI cards, user/transaction charts, system health |
| Users | `/admin/users` | User table with search, filter, freeze/unfreeze |
| Wallets | `/admin/wallets` | All wallets overview, balance summaries |
| Adjust Balance | `/admin/adjust-balance` | Manual credit/debit with audit trail |
| Transactions | `/admin/transactions` | Review all transactions, flag suspicious |
| Fraud Center | `/admin/fraud-center` | Fraud reports, risk scores, AI analysis |
| Settings | `/admin/settings` | System configuration |

### Access Control

- Routes protected by role guard in admin layout
- API routes check `ADMIN` or `SUPERADMIN` role via JWT claims
- All admin actions logged to AuditLog table

---

## 13. Compliance & Risk

### AML (Anti-Money Laundering) — `src/server/compliance/aml.ts`

- Transaction amount thresholds (auto-flag above configurable limit)
- Velocity checks (rapid successive transactions)
- Sanctions list screening
- Suspicious Activity Report (SAR) generation

### KYC (Know Your Customer) — `src/server/compliance/kyc.ts`

- Multi-document verification pipeline
- Document status tracking (PENDING → VERIFIED/REJECTED)
- Admin review workflow via `/api/admin/kyc-review`
- Tiered access based on KYC level

### Fraud Engine — `src/server/compliance/fraud-engine.ts`

- Real-time transaction scoring
- Pattern detection (location anomalies, amount spikes)
- Auto-freeze on high-risk score
- Integration with AI fraud predictor

### Risk Scoring — `src/server/compliance/risk-scoring.ts`

- User-level risk profile (0-100 scale)
- Factors: transaction history, KYC status, login patterns, geo-data
- Dynamic score updates on each activity

---

## 14. Testing Strategy

### Recommended Test Structure

```
__tests__/
├── unit/
│   ├── server/auth/jwt.test.ts
│   ├── server/banking/wallet.service.test.ts
│   ├── utils/validators.test.ts
│   └── utils/currency.test.ts
├── integration/
│   ├── api/auth/login.test.ts
│   ├── api/wallets/create.test.ts
│   └── api/transactions/create.test.ts
└── e2e/
    ├── auth-flow.spec.ts
    ├── transfer-flow.spec.ts
    └── admin-flow.spec.ts
```

### Testing Tools

| Tool | Purpose |
|---|---|
| **Jest** | Unit & integration testing |
| **React Testing Library** | Component testing |
| **Playwright / Cypress** | E2E testing |
| **Prisma Test Utils** | Database mocking/seeding |
| **MSW** | API mocking |

### Key Test Scenarios

- [ ] User registration → email validation → KYC upload → verification
- [ ] Login → 2FA verification → dashboard access
- [ ] Wallet creation → deposit → transfer → balance verification
- [ ] Crypto buy → sell → profit/loss calculation
- [ ] Merchant POS payment → settlement
- [ ] Admin freeze account → user blocked → unfreeze
- [ ] Rate limiting enforcement
- [ ] JWT expiry → refresh token rotation

---

## 15. Deployment

### Docker

```bash
# Build image
docker build -t cherokee-bank .

# Run container
docker run -p 3000:3000 \
  --env-file .env \
  cherokee-bank
```

The Dockerfile uses a multi-stage build:
1. **deps** — Install node_modules
2. **builder** — Run `next build`
3. **runner** — Minimal production image with standalone output

### Vercel (Recommended for Next.js)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Configure environment variables in Vercel dashboard. Use Vercel Postgres or connect external PostgreSQL.

### GCP Cloud Run

```bash
# Build and push to GCR
gcloud builds submit --tag gcr.io/PROJECT_ID/cherokee-bank

# Deploy
gcloud run deploy cherokee-bank \
  --image gcr.io/PROJECT_ID/cherokee-bank \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### GitHub Actions CI/CD

The pipeline (`.github/workflows/ci.yml`) runs:
1. **Install** — `npm ci`
2. **Lint** — `npm run lint`
3. **Type Check** — `npx tsc --noEmit`
4. **Build** — `npm run build`
5. **Deploy** — Automatic on push to `main`

---

## 16. Technical Requirements Checklist

### Core Infrastructure

- [x] Next.js 16 App Router with TypeScript strict mode
- [x] PostgreSQL database with Prisma ORM
- [x] Redis for caching and rate limiting
- [x] Root middleware security chain
- [x] Environment variable validation
- [x] Docker multi-stage build
- [x] GitHub Actions CI/CD pipeline
- [x] ESLint configuration

### Authentication & Authorization

- [x] Email/password registration with bcrypt hashing
- [x] JWT access + refresh token rotation
- [x] Role-based access control (USER, ADMIN, SUPERADMIN)
- [x] Two-factor authentication (OTP via SMS/email)
- [x] Session management with token revocation
- [x] Auth guards for protected routes

### Security

- [x] CSRF token validation
- [x] Rate limiting (sliding window, Redis-backed)
- [x] Security headers (HSTS, CSP, X-Frame-Options)
- [x] Geo-blocking (OFAC sanctions)
- [x] IP logging for audit trail
- [x] AES-256 encryption for sensitive data
- [x] Password complexity enforcement

### Banking

- [x] Multi-currency fiat wallets (USD, EUR, GBP, CHERO)
- [x] P2P transfers
- [x] Deposits and withdrawals
- [x] Currency conversion with FX engine
- [x] Double-entry ledger
- [x] Daily/monthly transaction limits
- [x] Account reconciliation
- [x] Transaction history with pagination and filters

### Crypto

- [x] Buy/sell BTC, ETH, USDT
- [x] Crypto wallet management
- [x] Live exchange rate feeds
- [x] Crypto swap engine
- [x] Crypto withdrawal processing

### Merchant

- [x] POS terminal interface
- [x] Payment processing
- [x] Settlement engine
- [x] Dispute management

### AI / Machine Learning

- [x] GPT-4 banking assistant (chat)
- [x] AI fraud prediction
- [x] Customer support automation
- [x] Spend tracking & categorization
- [x] Savings recommendation engine
- [x] Document embeddings & semantic search
- [x] Sentiment analysis

### Admin Portal

- [x] Admin dashboard with KPIs
- [x] User management (list, search, freeze/unfreeze)
- [x] Balance adjustment with audit trail
- [x] KYC review workflow
- [x] Fraud center with AI risk analysis
- [x] Audit log viewer
- [x] Admin settings

### Compliance

- [x] AML screening (threshold + velocity checks)
- [x] KYC document verification pipeline
- [x] Fraud detection engine
- [x] Risk scoring (user-level)
- [x] Suspicious Activity Report generation

### Notifications

- [x] Email notifications (Nodemailer/SMTP)
- [x] SMS notifications (Twilio)
- [x] Push notifications (Firebase FCM)

### Frontend

- [x] Responsive glassmorphism design system
- [x] TailwindCSS 4 with CSS variable theme
- [x] Framer Motion animations
- [x] Reusable UI component library (8+ components)
- [x] Layout components (sidebar, header)
- [x] React hooks for data fetching (4 custom hooks)
- [x] TypeScript types for all domains (8 type files)
- [x] Utility functions (formatting, validation, currency)

### API Routes

- [x] Auth: 6 endpoints
- [x] Wallets: 6 endpoints
- [x] Transactions: 3 endpoints
- [x] Crypto: 4 endpoints
- [x] Merchant: 3 endpoints
- [x] Admin: 7 endpoints
- [x] AI: 3 endpoints
- [x] User: 3 endpoints
- **Total: 35 API endpoints**

### DevOps

- [x] Dockerfile (multi-stage)
- [x] .dockerignore
- [x] GitHub Actions CI/CD
- [x] .env.example with all variables documented
- [x] README.md

---

## 17. Non-Technical Requirements Checklist

### Business Requirements

- [x] Multi-currency support with native "CHERO" token
- [x] Cryptocurrency trading capability
- [x] Merchant payment acceptance (POS)
- [x] AI-powered customer assistance
- [x] Admin oversight and controls
- [x] Regulatory compliance (AML/KYC)

### User Experience

- [x] Clean, modern UI with glassmorphism design
- [x] Mobile-responsive layout
- [x] Dark theme by default
- [x] Smooth page transitions (Framer Motion)
- [x] Loading states and error handling
- [x] Intuitive navigation (sidebar + breadcrumbs)
- [x] Settings management (account, security, notifications)

### Legal & Compliance

- [x] Terms of Service / Legal page
- [x] KYC identity verification flow
- [x] AML transaction monitoring
- [x] Audit trail for all admin actions
- [x] Data encryption at rest and in transit
- [x] OFAC sanctions screening (geo-blocking)

### Operations

- [x] Containerized deployment (Docker)
- [x] CI/CD automation (GitHub Actions)
- [x] Multi-cloud support (Vercel, GCP Cloud Run)
- [x] Environment-based configuration
- [x] Database migration support (Prisma)
- [x] Redis-based caching layer

### Documentation

- [x] README.md with project overview
- [x] .env.example with all variables
- [x] guide.md (this file) — full technical reference
- [x] instructions.md — setup instructions
- [x] Inline code comments

### Scalability

- [x] Stateless API design (JWT-based, no server sessions)
- [x] Redis caching for rate limits and frequent queries
- [x] Prisma connection pooling
- [x] Docker-ready for horizontal scaling
- [x] Standalone Next.js output mode for containerization

### Security Posture

- [x] Zero plaintext secrets (environment-variable driven)
- [x] Defense in depth (6-layer middleware chain)
- [x] Principle of least privilege (role-based access)
- [x] Input validation at API boundaries (Zod)
- [x] Rate limiting to prevent abuse
- [x] Token rotation to limit exposure window

---

## Appendix: Quick Reference Commands

```bash
# Development
npm run dev                      # Start dev server
npx prisma studio                # Database GUI
npx prisma db push               # Sync schema to DB
npx prisma generate              # Regenerate client

# Production
npm run build && npm start       # Build and serve
docker build -t cherokee-bank .  # Docker build
docker run -p 3000:3000 --env-file .env cherokee-bank

# Database
npx prisma migrate dev --name <name>  # New migration
npx prisma migrate deploy             # Apply migrations
npx prisma db seed                     # Seed data

# Debugging
npx tsc --noEmit                 # Type check
npm run lint                     # Lint check
npx prisma validate              # Validate schema
```

---

*This guide was generated for Cherokee Bank v1.0.0. For questions or contributions, refer to the project README or open an issue.*
