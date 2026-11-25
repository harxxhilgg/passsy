# Passsy

A privacy-focused password generator and zero-knowledge encrypted vault built with Next.js, Supabase, Prisma, and Tailwind CSS.

[![Next.js](https://img.shields.io/badge/Next.js-16.4.6-black?style=flat-square&logo=next.js)](https://nextjs.org/) [![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/) [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/) [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/) [![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/) [![Supabase](https://img.shields.io/badge/Supabase-Auth_%26_DB-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

---

## Overview

Passsy combines an instant password generator with an encrypted cloud vault. Generate cryptographically strong passwords locally without an account, or authenticate with Google to store and manage credentials across devices.

Sensitive fields (`password`, `email`, `username`) are encrypted server-side using **AES-256-GCM** before persistence in PostgreSQL. Even with direct database access, credentials remain unreadable without the master encryption key.

---

## Features

- **Password Generator**: Configurable length (6–100 characters) with options for numbers and symbols, live strength scoring, and one-click copy.
- **Encrypted Vault**: Server-side AES-256-GCM authenticated encryption (96-bit IV, 128-bit auth tag). Website domains remain in plaintext for indexing and fast client search.
- **Authentication**: Google OAuth powered by Supabase SSR with guarded guest flows.
- **Record Management**: Card options menu to pin/unpin, edit credentials, or delete with confirmation dialogs. Pinned records automatically float to the top.
- **Direct Site Launch**: Launch stored URLs directly in a new tab from the credential card.
- **Extended Search**: Search saved records by site name, email, or username with bolded match highlighting.
- **Import & Export (`/import-export`)**: Auto-detecting CSV/JSON import (including browser CSV exports) with duplicate skipping, plus **Export as** CSV or JSON (`Passy_Passwords_YYYYMMDD_XXXXXX`) for all or manually selected records.
- **Activity History (`/activity`)**: Searchable audit log of vault activities (`saved`, `updated`, `deleted`) with relative timestamps and clear history options.
- **Bot Protection**: Cloudflare Turnstile verification.
- **Favicon Resolution**: Automatic high-resolution domain favicon resolution with fallback icons.
- **Theme Support**: Claude-inspired Light, Dark, and System theme switching via `next-themes`.

---

## Tech Stack

| Category             | Technology                                                     |
| -------------------- | -------------------------------------------------------------- |
| **Framework**        | Next.js 16 (App Router, Turbopack, Server Actions)             |
| **Frontend**         | React 19, TypeScript 5, Tailwind CSS v4, Base UI, Lucide Icons |
| **Database & ORM**   | PostgreSQL (Supabase), Prisma ORM 7                            |
| **Authentication**   | Supabase SSR (Google OAuth), Cloudflare Turnstile              |
| **Cryptography**     | Node.js `crypto` (AES-256-GCM)                                 |
| **State Management** | Zustand                                                        |
| **Testing**          | Vitest, React Testing Library                                  |

---

## Security Architecture

```
                 CLIENT (Browser)
                        │
                        │ HTTPS (Server Action)
                        ▼
                 NEXT.JS SERVER
                        │
         ┌──────────────┴──────────────┐
         ▼                             ▼
   Plaintext Site               Sensitive Data
 ("github.com")          ("email", "username", "password")
         │                             │
         │                  AES-256-GCM Encryption
         │                  (Unique 96-bit IV + Key)
         │                             │
         │                             ▼
         │                  { ciphertext, iv, tag }
         │                             │
         └──────────────┬──────────────┘
                        ▼
                POSTGRESQL DATABASE
           (Zero plaintext credentials)
```

1. **User Isolation**: Records are keyed to authenticated Supabase user sessions.
2. **Authenticated Encryption**: AES-256-GCM tags verify ciphertext integrity and prevent tampering.
3. **Key Isolation**: Master encryption key resides strictly in server environment variables.

---

## Getting Started

### Prerequisites

- Node.js 20+ or Bun
- Supabase project with Google OAuth enabled
- PostgreSQL connection string (Transaction pooler + direct URL)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/harxxhilgg/passsy.git
   cd passsy
   ```

2. **Install dependencies:**

   ```bash
   npm install
   # or
   bun install
   ```

3. **Configure environment variables:**

   ```bash
   cp .env.example .env.local
   ```

   Required variables in `.env.local`:

   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key

   # Database (Prisma)
   DATABASE_URL=postgresql://postgres.xxx:xxx@aws-0-xx.pooler.supabase.com:6543/postgres?pgbouncer=true
   DIRECT_URL=postgresql://postgres.xxx:xxx@aws-0-xx.pooler.supabase.com:5432/postgres

   # Google OAuth (Supabase)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret

   # AES-256 Master Key (64-character hex string)
   ENCRYPTION_KEY=your_generated_64_char_hex_key

   # Cloudflare Turnstile
   NEXT_PUBLIC_TURNSTILE_SITE_KEY=your-turnstile-site-key
   TURNSTILE_SECRET_KEY=your-turnstile-secret-key
   ```

   Generate a 64-character hex encryption key:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

4. **Initialize database:**

   ```bash
   npx prisma generate
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

---

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm test             # Run Vitest test suite
npm run typecheck    # Run TypeScript checks
npm run lint         # Run ESLint
```

---

## License

This project is licensed under the [MIT License](LICENSE).
