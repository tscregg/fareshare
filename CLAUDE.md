# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FareShare is a community rideshare platform for the **Ericeira ↔ Lisbon corridor** in Portugal. Not a taxi service or ride-hailing app — it's a bulletin board where drivers share existing journeys and passengers claim seats with a suggested fuel donation.

**Status:** Design complete (10 screens in `carshare.pen`), planning docs finalized, no code written yet.

## Two Development Tracks

### Track 1: Frontend (Next.js)
Static mobile-first UI (390×844px) with mock data. 10 screens. No backend in v1.

```bash
npx create-next-app@latest fareshare --typescript --tailwind --eslint --app --src-dir --no-import-alias
npm install lucide-react
npm run dev
```

**Tech:** Next.js 14+ App Router, TypeScript, Tailwind CSS, Lucide React icons, Google Fonts (Bebas Neue + Space Grotesk)

### Track 2: Agent (Mastra)
Conversational AI agent as primary interface. Separate from the frontend build.

```bash
mastra dev                                    # Start Mastra Studio at localhost:4111
mastra dev --request-context-presets ./request-context-presets.json  # With test user presets
```

**Tech:** Mastra 1.0 (`@mastra/core`), Supabase Postgres, Zod, primary LLM Kimi K2.5 with Claude Sonnet fallback

## Architecture

### Frontend Structure
```
src/app/          — 10 routes: /login, /signup, /rides, /rides/[id], /requests,
                    /post/ride, /post/request, /edit/ride/[id], /dashboard
src/components/   — ui/ (Button, Input, Badge, Avatar, Card),
                    layout/ (MobileShell, Header, BackHeader, BottomNav, TabBar),
                    rides/, requests/, dashboard/, forms/
src/lib/          — types.ts, mock-data.ts, utils.ts
```

Key routing logic: `/rides/[id]` renders passenger view or driver view based on `ride.driverId === currentUser.id`.

### Agent Structure
```
src/mastra/
  agents/fareshare-agent.ts     — Agent definition
  instructions/                 — Composable system prompt sections (identity, passenger-flow,
                                  driver-flow, request-flow, local-knowledge)
  tools/                        — 7 tools split by domain: rides.ts, seats.ts, requests.ts
  lib/supabase.ts               — Supabase client
  workspace/                    — Stubbed for future Mastra Skills migration
```

Instructions are in separate files (not inline strings) so each can become a Mastra Skill later. Tools are split by domain for the same reason.

### Database (Supabase)
4 tables: `profiles`, `rides`, `seats`, `requests`. Schema with RLS policies defined in `FARESHARE_PROJECT_PLAN.md` Section 8. The agent uses `service_role` key; frontend will use Supabase Auth.

## Design System: Stencil Punk Lavender

**Critical rules:**
- `border-radius: 0px` everywhere (only exception: notification dot uses `9999px`)
- Headings always use **Bebas Neue**, always **UPPERCASE**
- Body text uses **Space Grotesk**
- Dark theme: bg `#141414`, card `#1E1E1E`, accent `#B898D0`

**Key tokens:** See `FARESHARE_PROJECT_PLAN.md` Section 5 for complete design token table, typography specs, and spatial rules.

**Designs:** All 10 screens are in `carshare.pen` with frame IDs listed in Section 9 of the project plan.

## Verbal Identity

FareShare sounds direct, honest, slightly rough — like a local, not a startup. Key rules:
- **No exclamation marks.** Ever.
- Use "ride" not "journey", "donation" not "fee", "claim a seat" not "book", "community" not "platform"
- Short sentences. One idea at a time.
- No corporate padding ("we're excited to", "seamless experience")
- See `VERBAL_IDENTITY.md` for full tone guide

## Environment Variables

```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
MOONSHOT_API_KEY=
ANTHROPIC_API_KEY=
```

## Key Files

| File | Purpose |
|------|---------|
| `FARESHARE_PROJECT_PLAN.md` | Complete project plan: screens, components, mock data, DB schema, build order |
| `FARESHARE_AGENT_SPEC.md` | Agent architecture, tools, phases, test matrix |
| `VERBAL_IDENTITY.md` | Brand voice, tone, vocabulary |
| `carshare.pen` | All 10 screen designs (Stencil Punk Lavender) |
| `fareshare.pen` | Additional design explorations |

## Important Constraints

- V1 frontend is **static mock data only** — no backend, no auth, no form submission
- The agent track uses Mastra, not Vercel AI SDK directly (that comes in Phase 4 frontend integration)
- Agent must **always confirm before mutating data** (claiming seats, posting rides, cancelling)
- Agent is **bilingual** (Portuguese and English) — responds in the user's language
- Mock user for frontend: `currentUser = { id: 'user-ts', displayName: 'Toby S.', initials: 'TS' }`
