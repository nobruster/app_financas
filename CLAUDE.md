# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Always activate Node 20 before running any command
export NVM_DIR="$HOME/.nvm" && source "$NVM_DIR/nvm.sh" && nvm use 20

npm run dev      # Development server (http://localhost:3000)
npm run build    # Production build
npm run lint     # ESLint
```

## Architecture

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS · shadcn/ui · Supabase (PostgreSQL + Auth) · Recharts · next-themes

### Route structure

| Route | Access |
|---|---|
| `/login`, `/signup` | Public |
| `/pending` | Authenticated, status=pending |
| `/rejected` | Authenticated, status=rejected |
| `/dashboard`, `/dashboard/transactions` | Authenticated + approved |
| `/admin` | Authenticated + role=admin |

### Auth & access control — two-layer approach

1. **`src/proxy.ts`** (Next.js 16 proxy, replaces middleware) — gates unauthenticated requests and, when `SUPABASE_SERVICE_ROLE_KEY` is set, checks `profiles.status` via the admin client (bypasses RLS). If the key is absent it falls through to layer 2.

2. **`src/app/dashboard/layout.tsx`** — Server Component that always re-checks `profiles.status` and `profiles.role` via the regular server client (RLS applies). This is the authoritative gate for dashboard routes.

### Supabase clients — use the right one

| File | When to use |
|---|---|
| `src/lib/supabase/client.ts` | Client Components (`'use client'`) |
| `src/lib/supabase/server.ts` | Server Components & Server Actions |
| `src/lib/supabase/admin.ts` | Server-only operations that need to bypass RLS (admin actions, proxy) |

### User approval flow

New signups get `profiles.status = 'pending'` via a Postgres trigger (`handle_new_user`). The first user ever becomes `role = 'admin', status = 'approved'` automatically. Admins approve/reject via `/admin`. The `profiles` table schema and trigger are in `supabase/profiles.sql`.

### Server Actions

All mutations go through Server Actions in `src/actions/`:
- `auth.ts` — login, signup, logout
- `transactions.ts` — CRUD for transactions (uses regular server client, RLS enforced)
- `profiles.ts` — `getAllProfiles` and approval actions use `createAdminClient()` to bypass RLS

### Environment variables

```
NEXT_PUBLIC_SUPABASE_URL        # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY   # Supabase anon/public key
SUPABASE_SERVICE_ROLE_KEY       # Service role key — never expose to browser
RESEND_API_KEY                  # Email notifications for new signups
WEBHOOK_SECRET                  # Shared secret for /api/notify-admin webhook
NEXT_PUBLIC_APP_URL             # Full app URL (used in email links)
ADMIN_EMAIL                     # Email that receives new-signup notifications
```

### Theming

Dark/light mode via `next-themes`. All colors must use shadcn/ui CSS tokens (`bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`) — never hardcode Tailwind color utilities like `bg-white` or `text-gray-900`, which break in dark mode.
