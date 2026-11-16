# Passsy 🔐
# Passsy 🔐

> A fast, privacy-focused password generator and zero-knowledge encrypted vault built with Next.js 16, Supabase, Prisma, and Tailwind CSS.

[![Next.js](https://img.shields.io/badge/Next.js-16.4.4-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth_%26_DB-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![Vitest](https://img.shields.io/badge/Tested_with-Vitest-6E9F18?style=flat-square&logo=vitest)](https://vitest.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

---

## 🌟 Overview

**Passsy** combines the speed of an instantaneous password generator with the security of an encrypted cloud vault. Generate cryptographically strong passwords on the fly without logging in, or sign in with Google to securely store, organize, and manage your credentials across all your devices.

All sensitive data is encrypted server-side using **AES-256-GCM** before touching PostgreSQL — ensuring that even with direct database access, your passwords, emails, and usernames remain unreadable without your master encryption key.

---

## ✨ Features

### ⚡ Instant Password Generator

- **Customizable Length**: Sliders supporting 6 to 100 character password lengths.
- **Character Diversity**: Toggle inclusion of numeric digits (`0-9`) and special symbols (`!@#$%^&*...`).
- **Cryptographic Randomness**: Driven by secure random selection with instant entropy scoring.
- **Zero Friction**: Generate and copy passwords without needing an account.

### 🛡️ End-to-End Encrypted Cloud Vault

- **AES-256-GCM Encryption**: Credentials (`password`, `email`, optional `username`) are bundled and encrypted using authenticated Galois/Counter Mode with unique 96-bit IVs and 128-bit authentication tags.
- **Searchable Plaintext Domain**: The website domain is preserved in plaintext for lightning-fast database indexing and client-side search.
- **Google OAuth**: Fast, frictionless authentication powered by Supabase SSR with cross-origin protected Google avatars.
- **Smart Auth Gate**: Guests can test the app freely; attempting to save prompts a non-intrusive sign-in dialog.

### ⭐ Pinned & Favorite Passwords

- **1-Click Card Pinning**: Star your everyday accounts directly beside the website name. Pinned credentials automatically float to the top of your vault.
- **Favorites Header Filter**: Toggle the star button next to Refresh to focus strictly on your favorite passwords with zero clutter.
- **Optimistic UI**: Instant 0ms feedback when starring/unstarring with automatic background sync and error rollbacks.

### 🌐 Smart Favicon Resolution

- **High-Resolution Icons**: Cards automatically detect the website domain and load the official favicon using Google's high-res favicon service (`sz=64`).
- **Graceful Fallback**: Non-domain sites or failed image requests seamlessly render a clean Globe icon.
- **Privacy First**: Favicon requests enforce `referrerPolicy="no-referrer"` to prevent domain leakage.

### 📊 Password Strength Indicators

- **Dynamic Key Icons**: The key icon on every saved card changes color based on strength (Red $\rightarrow$ Orange $\rightarrow$ Amber $\rightarrow$ Lime $\rightarrow$ Emerald).
- **Interactive Strength Meter**: Live progress bar and typography ratings (_Weak_, _Fair_, _Good_, _Strong_, _Very Strong_) update in real-time as you edit passwords in the modal.

### 🎨 Modern Minimalist UX

- **Refined Typography**: Custom _Instrument Serif_ font pairings for elegant editorial headers.
- **Smooth Feedback**: Interactive copy-to-clipboard alerts slide in from the bottom-right.
- **Safe Operations**: Destructive deletions are separated into the modal footer and protected with confirmation dialogs.
- **Animated Counters**: Animated numeric transitions powered by `@number-flow/react`.

---

## 🛠️ Tech Stack

| Category             | Technology                                                                                                                      |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **Framework**        | [Next.js 16.4](https://nextjs.org/) (App Router, Turbopack, Server Actions)                                                     |
| **Frontend**         | [React 19](https://react.dev/), [TypeScript 5](https://www.typescriptlang.org/)                                                 |
| **Styling**          | [Tailwind CSS v4](https://tailwindcss.com/), [Base UI](https://base-ui.com/), [Lucide Icons](https://lucide.dev/)               |
| **Animation**        | [Number Flow](https://number-flow.barvian.me/), [tw-animate-css](https://github.com/)                                           |
| **Database & ORM**   | [PostgreSQL](https://www.postgresql.org/) (hosted on [Supabase](https://supabase.com/)), [Prisma ORM 7](https://www.prisma.io/) |
| **Authentication**   | [Supabase SSR Auth](https://supabase.com/docs/guides/auth/server-side) (Google OAuth)                                           |
| **Cryptography**     | Node.js `crypto` (AES-256-GCM with PBKDF2/hex keys)                                                                             |
| **State Management** | [Zustand](https://zustand.docs.pmnd.rs/)                                                                                        |
| **Testing**          | [Vitest](https://vitest.dev/), [Testing Library](https://testing-library.com/), [JSDOM](https://github.com/jsdom/jsdom)         |

---

## 🔒 Security Architecture

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

1. **Isolation**: Every record is keyed to a `userId` matching the Supabase authenticated session.
2. **Authenticated Encryption**: AES-256 in GCM mode verifies ciphertext integrity via authentication tags — preventing tampering or bit-flipping attacks.
3. **Environment Security**: The master `ENCRYPTION_KEY` lives exclusively in secure server environments and is never sent to the client.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js 20+](https://nodejs.org/) or [Bun](https://bun.sh/)
- A [Supabase](https://supabase.com/) project with Google OAuth enabled
- PostgreSQL connection string (Supabase connection pooler + direct connection)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/harxxhilgg/passsy.git
   cd passsy
   ```

2. **Install dependencies:**

   ```bash
   bun install
   # or
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env.local` file in the root directory:

   ```bash
   cp .env.example .env.local
   ```

   Fill in your configuration:

   ```env
   # Supabase Client Credentials
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key

   # Database Connection (Prisma)
   DATABASE_URL=postgresql://postgres.xxx:xxx@aws-0-xx.pooler.supabase.com:6543/postgres?pgbouncer=true
   DIRECT_URL=postgresql://postgres.xxx:xxx@aws-0-xx.pooler.supabase.com:5432/postgres

   # Google OAuth (configured in Supabase Dashboard)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret

   # AES-256 Master Key (64-character hex string)
   ENCRYPTION_KEY=your_generated_64_char_hex_key
   ```

   > **Tip**: Generate a secure 64-character hex encryption key with:
   >
   > ```bash
   > node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   > ```

4. **Initialize Prisma & Database:**

   ```bash
   bun x prisma generate
   # or npm
   npx prisma generate
   ```

5. **Start the development server:**

   ```bash
   bun dev
   # or
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Quality Assurance

Passsy includes a full suite of unit and integration tests across components, crypto logic, actions, and state management.

```bash
# Run test suite
bun test
# or npm run test

# Run tests in watch mode
npm run test:watch

# Run coverage report
npm run test:coverage

# TypeScript verification
npm run typecheck

# Code linting
npm run lint
```

---

## 📁 Project Structure

```text
passsy/
├── prisma/
│   └── schema.prisma          # Prisma schema definition
├── src/
│   ├── app/
│   │   ├── actions/           # Next.js Server Actions (CRUD & crypto)
│   │   ├── auth/callback/     # Supabase OAuth redirect handler
│   │   ├── stores/            # Zustand state stores
│   │   ├── layout.tsx         # Root layout with fonts & providers
│   │   └── page.tsx           # Main application view
│   ├── components/
│   │   ├── add-pass/          # Modal dialog to save new credentials
│   │   ├── auth/              # Google sign-in & user profile buttons
│   │   ├── password/          # Password display, sliders & options
│   │   ├── saved-passwords/   # Vault list, cards, favicons, pin buttons & filters
│   │   └── ui/                # Base UI primitive components
│   ├── hooks/                 # Custom React hooks (useAuth, etc.)
│   ├── lib/                   # AES-256 crypto, password generator & Prisma client
│   └── utils/                 # Supabase clients & custom font definitions
├── prisma.config.ts           # Prisma configuration
├── vitest.config.ts           # Vitest testing configuration
└── package.json
```

---

## 🌐 Deployment to Vercel

Passsy is optimized for deployment on [Vercel](https://vercel.com):

1. Import your GitHub repository into Vercel.
2. In **Project Settings $\rightarrow$ Environment Variables**, add all 7 keys from `.env.example` for **Production** and **Preview**.
3. Vercel automatically runs `prisma generate` during `bun install` via the `postinstall` script in `package.json`.
4. Deploy! 🚀

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
> A fast, privacy-focused password generator and zero-knowledge encrypted vault built with Next.js 16, Supabase, Prisma, and Tailwind CSS.

[![Next.js](https://img.shields.io/badge/Next.js-16.4.4-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth_%26_DB-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![Vitest](https://img.shields.io/badge/Tested_with-Vitest-6E9F18?style=flat-square&logo=vitest)](https://vitest.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

---

## 🌟 Overview

**Passsy** combines the speed of an instantaneous password generator with the security of an encrypted cloud vault. Generate cryptographically strong passwords on the fly without logging in, or sign in with Google to securely store, organize, and manage your credentials across all your devices.

All sensitive data is encrypted server-side using **AES-256-GCM** before touching PostgreSQL — ensuring that even with direct database access, your passwords, emails, and usernames remain unreadable without your master encryption key.

---

## ✨ Features

### ⚡ Instant Password Generator
- **Customizable Length**: Sliders supporting 6 to 100 character password lengths.
- **Character Diversity**: Toggle inclusion of numeric digits (`0-9`) and special symbols (`!@#$%^&*...`).
- **Cryptographic Randomness**: Driven by secure random selection with instant entropy scoring.
- **Zero Friction**: Generate and copy passwords without needing an account.

### 🛡️ End-to-End Encrypted Cloud Vault
- **AES-256-GCM Encryption**: Credentials (`password`, `email`, optional `username`) are bundled and encrypted using authenticated Galois/Counter Mode with unique 96-bit IVs and 128-bit authentication tags.
- **Searchable Plaintext Domain**: The website domain is preserved in plaintext for lightning-fast database indexing and client-side search.
- **Google OAuth**: Fast, frictionless authentication powered by Supabase SSR with cross-origin protected Google avatars.
- **Smart Auth Gate**: Guests can test the app freely; attempting to save prompts a non-intrusive sign-in dialog.

### ⭐ Pinned & Favorite Passwords
- **1-Click Card Pinning**: Star your everyday accounts directly beside the website name. Pinned credentials automatically float to the top of your vault.
- **Favorites Header Filter**: Toggle the star button next to Refresh to focus strictly on your favorite passwords with zero clutter.
- **Optimistic UI**: Instant 0ms feedback when starring/unstarring with automatic background sync and error rollbacks.

### 🌐 Smart Favicon Resolution
- **High-Resolution Icons**: Cards automatically detect the website domain and load the official favicon using Google's high-res favicon service (`sz=64`).
- **Graceful Fallback**: Non-domain sites or failed image requests seamlessly render a clean Globe icon.
- **Privacy First**: Favicon requests enforce `referrerPolicy="no-referrer"` to prevent domain leakage.

### 📊 Password Strength Indicators
- **Dynamic Key Icons**: The key icon on every saved card changes color based on strength (Red $\rightarrow$ Orange $\rightarrow$ Amber $\rightarrow$ Lime $\rightarrow$ Emerald).
- **Interactive Strength Meter**: Live progress bar and typography ratings (*Weak*, *Fair*, *Good*, *Strong*, *Very Strong*) update in real-time as you edit passwords in the modal.

### 🎨 Modern Minimalist UX
- **Refined Typography**: Custom *Instrument Serif* font pairings for elegant editorial headers.
- **Smooth Feedback**: Interactive copy-to-clipboard alerts slide in from the bottom-right.
- **Safe Operations**: Destructive deletions are separated into the modal footer and protected with confirmation dialogs.
- **Animated Counters**: Animated numeric transitions powered by `@number-flow/react`.

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| **Framework** | [Next.js 16.4](https://nextjs.org/) (App Router, Turbopack, Server Actions) |
| **Frontend** | [React 19](https://react.dev/), [TypeScript 5](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/), [Base UI](https://base-ui.com/), [Lucide Icons](https://lucide.dev/) |
| **Animation** | [Number Flow](https://number-flow.barvian.me/), [tw-animate-css](https://github.com/) |
| **Database & ORM** | [PostgreSQL](https://www.postgresql.org/) (hosted on [Supabase](https://supabase.com/)), [Prisma ORM 7](https://www.prisma.io/) |
| **Authentication** | [Supabase SSR Auth](https://supabase.com/docs/guides/auth/server-side) (Google OAuth) |
| **Cryptography** | Node.js `crypto` (AES-256-GCM with PBKDF2/hex keys) |
| **State Management** | [Zustand](https://zustand.docs.pmnd.rs/) |
| **Testing** | [Vitest](https://vitest.dev/), [Testing Library](https://testing-library.com/), [JSDOM](https://github.com/jsdom/jsdom) |

---

## 🔒 Security Architecture

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

1. **Isolation**: Every record is keyed to a `userId` matching the Supabase authenticated session.
2. **Authenticated Encryption**: AES-256 in GCM mode verifies ciphertext integrity via authentication tags — preventing tampering or bit-flipping attacks.
3. **Environment Security**: The master `ENCRYPTION_KEY` lives exclusively in secure server environments and is never sent to the client.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js 20+](https://nodejs.org/) or [Bun](https://bun.sh/)
- A [Supabase](https://supabase.com/) project with Google OAuth enabled
- PostgreSQL connection string (Supabase connection pooler + direct connection)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/harxxhilgg/passsy.git
   cd passsy
   ```

2. **Install dependencies:**
   ```bash
   bun install
   # or
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env.local` file in the root directory:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your configuration:
   ```env
   # Supabase Client Credentials
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key

   # Database Connection (Prisma)
   DATABASE_URL=postgresql://postgres.xxx:xxx@aws-0-xx.pooler.supabase.com:6543/postgres?pgbouncer=true
   DIRECT_URL=postgresql://postgres.xxx:xxx@aws-0-xx.pooler.supabase.com:5432/postgres

   # Google OAuth (configured in Supabase Dashboard)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret

   # AES-256 Master Key (64-character hex string)
   ENCRYPTION_KEY=your_generated_64_char_hex_key
   ```

   > **Tip**: Generate a secure 64-character hex encryption key with:
   > ```bash
   > node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   > ```

4. **Initialize Prisma & Database:**
   ```bash
   bun x prisma generate
   # or npm
   npx prisma generate
   ```

5. **Start the development server:**
   ```bash
   bun dev
   # or
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Quality Assurance

Passsy includes a full suite of unit and integration tests across components, crypto logic, actions, and state management.

```bash
# Run test suite
bun test
# or npm run test

# Run tests in watch mode
npm run test:watch

# Run coverage report
npm run test:coverage

# TypeScript verification
npm run typecheck

# Code linting
npm run lint
```

---

## 📁 Project Structure

```text
passsy/
├── prisma/
│   └── schema.prisma          # Prisma schema definition
├── src/
│   ├── app/
│   │   ├── actions/           # Next.js Server Actions (CRUD & crypto)
│   │   ├── auth/callback/     # Supabase OAuth redirect handler
│   │   ├── stores/            # Zustand state stores
│   │   ├── layout.tsx         # Root layout with fonts & providers
│   │   └── page.tsx           # Main application view
│   ├── components/
│   │   ├── add-pass/          # Modal dialog to save new credentials
│   │   ├── auth/              # Google sign-in & user profile buttons
│   │   ├── password/          # Password display, sliders & options
│   │   ├── saved-passwords/   # Vault list, cards, favicons, pin buttons & filters
│   │   └── ui/                # Base UI primitive components
│   ├── hooks/                 # Custom React hooks (useAuth, etc.)
│   ├── lib/                   # AES-256 crypto, password generator & Prisma client
│   └── utils/                 # Supabase clients & custom font definitions
├── prisma.config.ts           # Prisma configuration
├── vitest.config.ts           # Vitest testing configuration
└── package.json
```

---

## 🌐 Deployment to Vercel

Passsy is optimized for deployment on [Vercel](https://vercel.com):

1. Import your GitHub repository into Vercel.
2. In **Project Settings $\rightarrow$ Environment Variables**, add all 7 keys from `.env.example` for **Production** and **Preview**.
3. Vercel automatically runs `prisma generate` during `bun install` via the `postinstall` script in `package.json`.
4. Deploy! 🚀

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
