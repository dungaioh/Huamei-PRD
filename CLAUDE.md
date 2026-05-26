# CLAUDE.md

This file provides guidance for AI assistants (such as Claude) working in this repository.

## Project Overview

**HelloWorld** is the root repository. It contains a full-stack web application under `product-center/` — a **Product Center Management System** (产品中心管理系统) for managing the complete product lifecycle from proposal to market launch.

## Repository Structure

```
HelloWorld/
├── README.md                  # Root placeholder
├── CLAUDE.md                  # This file
└── product-center/            # Main application (Next.js 16 full-stack)
    ├── prisma/
    │   ├── schema.prisma      # Database schema (PostgreSQL via Prisma 7)
    │   └── prisma.config.ts   # Prisma 7 config (connection URL lives here)
    ├── src/
    │   ├── app/               # Next.js App Router pages and API routes
    │   │   ├── (auth)/login/  # Login page (Supabase Auth)
    │   │   ├── (dashboard)/   # Protected app pages
    │   │   │   ├── products/  # Product list + detail + new
    │   │   │   ├── bi/        # ECharts BI dashboard
    │   │   │   ├── tasks/     # Kanban task board
    │   │   │   ├── cost-sheets/ # Monthly cost sheet management
    │   │   │   └── admin/users/ # User management (admin only)
    │   │   └── api/           # REST API endpoints + Feishu webhook
    │   ├── actions/           # Next.js Server Actions (products, quotes, tasks, cost-sheets)
    │   ├── components/        # Reusable React components
    │   │   ├── ui/            # Base components (Button, Badge, Card, Input, etc.)
    │   │   ├── layout/        # Sidebar navigation
    │   │   └── products/      # StageBadge and product-specific components
    │   ├── lib/               # Shared utilities
    │   │   ├── db.ts          # Prisma client singleton (uses @prisma/adapter-pg)
    │   │   ├── auth.ts        # Supabase session helpers
    │   │   ├── permissions.ts # Role/department permission logic
    │   │   ├── constants.ts   # Stage labels, colors, department names
    │   │   └── utils.ts       # cn(), formatCurrency(), formatDate()
    │   └── generated/prisma/  # Auto-generated Prisma client (gitignored)
    ├── proxy.ts               # Next.js 16 auth proxy (replaces middleware.ts)
    └── .env.local.example     # Environment variable template
```

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | **Next.js 16** (App Router) | See breaking changes below |
| Language | **TypeScript** | Strict mode |
| Database | **PostgreSQL** via Supabase | |
| ORM | **Prisma 7** | Breaking changes vs v5/v6 |
| Auth | **Supabase Auth** (`@supabase/auth-helpers-nextjs`) | |
| UI | **Tailwind CSS v4** + Radix UI primitives | |
| Charts | **ECharts** (`echarts-for-react`) | |
| Validation | **Zod 4** | `import * as z from "zod"` |

## Development Commands

All commands run from `product-center/`:

```bash
# Install dependencies
npm install

# Generate Prisma client (required after schema changes)
npx prisma generate

# Run database migrations
npx prisma migrate dev --name <migration-name>

# Start dev server (Turbopack by default in Next.js 16)
npm run dev

# Type check
npx tsc --noEmit

# Production build
npm run build
```

## Breaking Changes to Know

### Next.js 16

1. **Async Request APIs** — `params`, `searchParams`, `cookies()`, `headers()` must all be `await`-ed:
   ```ts
   const { id } = await props.params;
   const cookieStore = await cookies();
   ```
2. **`middleware.ts` → `proxy.ts`** — File renamed, function exported as `proxy` (not `middleware`)
3. **`revalidateTag`** — Now requires a second `cacheLife` argument: `revalidateTag('tag', 'max')`
4. **Page type helpers** — Use `npx next typegen` or inline types:
   ```ts
   type PageProps = { params: Promise<{ id: string }> }
   ```

### Prisma 7

- **No `url` in `schema.prisma` datasource** — Connection URL lives in `prisma.config.ts` (for Migrate) and is passed via adapter to `PrismaClient`
- **Driver adapter required** — Use `@prisma/adapter-pg` for direct PostgreSQL:
  ```ts
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter });
  ```
- **Import from generated `client.ts`** (not `index.ts`):
  ```ts
  import { PrismaClient } from "../generated/prisma/client";
  ```

### Tailwind CSS v4

- `@import "tailwindcss"` (not `@tailwind base/components/utilities`)
- Custom tokens via `@theme inline { --color-X: ... }` in CSS
- No `tailwind.config.js` needed for most uses

### Zod 4

- Import pattern: `import * as z from "zod"` (not `import { z } from "zod"`)

### `@supabase/auth-helpers-nextjs`

- Browser: `createBrowserClient(url, key)`
- Server: `createServerClient(url, key, { cookies: ... })`

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:
```
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
FEISHU_WEBHOOK_SECRET=...   # optional
```

## Product Workflow Stages

```
PROPOSAL → FILING → INITIAL_QUOTE → REVIEW → PRODUCTION → FINAL_QUOTE → LAUNCH
                                                                       ↘ REJECTED (any stage)
```

## Permission Model

Permissions are enforced in both Server Actions and API routes via `src/lib/permissions.ts`.
Each function takes a `SessionUser` (`{ id, role, department }`) and returns a boolean.

| Function | Who can |
|----------|---------|
| `canAdvanceStage` | ADMIN; stage-specific departments |
| `canManageCostSheets` | ADMIN, FINANCE |
| `canCreateQuote` | ADMIN, PRODUCT, FINANCE |
| `canSeeProduct` | Depends on stage (MARKETING/SALES: LAUNCH only) |
| `canManageUsers` | ADMIN only |

## Feishu Webhook Integration

Endpoint: `POST /api/webhook/feishu`
- Verifies HMAC-SHA256 signature (if `FEISHU_WEBHOOK_SECRET` is set)
- Handles Feishu URL challenge (identity verification)
- Maps `event.form_data.product_name` → creates a `Product` at `PROPOSAL` stage

## Development Workflow

### Branching

- Base branch: `master`
- Feature branches: `claude/<description>-<id>`
- Never push directly to `master`

### Commits

- Imperative mood: "Add cost sheet management page"
- One logical change per commit

### Pushing

```bash
git push -u origin <branch-name>
```

Retry up to 4 times with exponential backoff on network failures.
