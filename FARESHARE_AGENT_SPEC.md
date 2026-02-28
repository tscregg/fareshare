# FareShare Agent Specification

A conversational AI agent that serves as the primary interface for FareShare — a community rideshare platform for the Ericeira ↔ Lisbon corridor. Users describe ride needs in natural language, and the agent matches them to available rides, handles seat claims, posts rides and requests.

## Approach

Agent-first: build the Mastra agent as a standalone service, test via Mastra Playground, then build the frontend later.

## Stack

| Layer | Technology |
|-------|-----------|
| Agent framework | Mastra 1.0 (`@mastra/core`) |
| LLM (primary) | Moonshot Kimi K2.5 (`moonshotai/kimi-k2.5`) — needs tool calling validation |
| LLM (fallback) | Anthropic Claude Sonnet (`anthropic/claude-sonnet-4-20250514`) |
| Database | Supabase (Postgres) |
| Memory | Mastra Observational Memory (`@mastra/memory` + `@mastra/pg`) |
| Deployment | Vercel (`@mastra/deployer-vercel`) |
| Frontend (later) | Next.js + Vercel AI SDK |

**LLM choice**: Kimi K2.5 is the preferred model (262K context, competitive pricing at $0.60/$3 per 1M tokens). Mastra lists it as a supported provider (`moonshotai/kimi-k2.5`) via OpenAI-compatible endpoint, but the Mastra model directory does not confirm tool calling support. Since FareShare depends on 7 tools, tool calling must be validated in Studio during Phase 1 before committing. If tool calling doesn't work reliably, fall back to Anthropic Claude Sonnet.

## Agent Design

### Identity

- FareShare's community rideshare assistant
- Friendly, casual, helpful — aligned with `VERBAL_IDENTITY.md`
- Bilingual: Portuguese and English
- Knows local geography: Ericeira, Lisbon, Sintra, Mafra, and common routes between them

### Core Capabilities

The agent handles both driver and passenger flows through 7 tools:

| Tool | Purpose | Mutates? |
|------|---------|----------|
| `search-rides` | Find available rides by origin, destination, date, time | No |
| `get-ride-details` | Get full ride details including passenger list | No |
| `search-requests` | Find open ride requests | No |
| `claim-seat` | Reserve a seat on a ride | Yes |
| `post-ride` | Create a new ride as a driver | Yes |
| `post-request` | Create a ride request as a passenger | Yes |
| `cancel-seat` | Cancel user's seat on a ride | Yes |

User identity is passed via Mastra `RequestContext`. In Studio testing, this is a configurable preset. In production, it comes from Supabase Auth via server middleware.

### Key Behaviors

- Always confirms before mutating data (claiming seats, posting rides, cancelling)
- Presents ride options in a scannable, comparable format
- Proactively suggests alternatives when no exact match exists
- Handles ambiguous requests by asking clarifying questions

### Skill-Ready Architecture

The agent is structured for future migration to Mastra Workspaces and Skills (`@mastra/core@1.1.0`):

- System prompt organized in labeled sections (passenger flow, driver flow, request flow, local knowledge) — each maps to a future skill
- Tools organized by domain in separate files
- Agent instructions kept in external files, not inline strings
- `workspace/` directory stubbed in project structure

## Database

Schema defined in `FARESHARE_PROJECT_PLAN.md` (Section 8): 4 tables (`profiles`, `rides`, `seats`, `requests`) with Row Level Security.

Additional indexes and explicit RLS policy SQL will be created during implementation.

## Phases

### Phase 0: Foundation `← current`

#### 0.1 — Create Supabase Project

1. Create new project at supabase.com (name: `fareshare`, region: EU)
2. Save database password
3. Collect `Project URL` and `service_role` key from Settings > API

#### 0.2 — Run Database Schema

Write and execute full SQL migration including:

- 4 tables from project plan (`profiles`, `rides`, `seats`, `requests`)
- Explicit `CREATE POLICY` statements for RLS (project plan describes them in prose only)
- `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` on all tables
- Indexes: `rides(departure_date, status)`, `rides(origin, destination)`, `seats(ride_id)`, `requests(status)`

#### 0.3 — Seed Mock Data

Translate project plan's TypeScript mock data into SQL inserts:

- Test profiles for all mock users (Miguel R., Sara M., Joao P., Tiago L., Toby S., Ana K., Joao L., Luis F., Rita B., Clara S., Pedro T., Marta F.)
- 4 rides with varying statuses and seat counts
- 3 open ride requests
- Seat claims linking passengers to rides

#### 0.4 — Scaffold Mastra Project

Initialize in repo root on `feat/mastra-agent-poc` branch.

**Dependencies:**

```
@mastra/core@latest
@mastra/memory@latest
@mastra/pg@latest
@mastra/deployer-vercel@latest
@supabase/supabase-js
typescript
zod
tsx
```

**Project structure:**

```
src/
└── mastra/
    ├── index.ts                    # Mastra instance (agents, storage)
    ├── agents/
    │   └── fareshare-agent.ts      # Agent definition
    ├── instructions/
    │   ├── index.ts                # Composes all sections into final prompt
    │   ├── identity.ts             # Agent persona and tone
    │   ├── passenger-flow.ts       # Search, compare, claim rides
    │   ├── driver-flow.ts          # Post and manage rides
    │   ├── request-flow.ts         # Post and browse requests
    │   └── local-knowledge.ts      # Ericeira corridor geography
    ├── tools/
    │   ├── rides.ts                # search-rides, get-ride-details, post-ride
    │   ├── seats.ts                # claim-seat, cancel-seat
    │   └── requests.ts             # search-requests, post-request
    ├── lib/
    │   └── supabase.ts             # Supabase client initialization
    └── workspace/                  # Stubbed for future skills migration
        └── .gitkeep
request-context-presets.json        # Studio presets for switching test users
.env.example
```

Design decisions:

- **`instructions/` directory**: Each file exports a string. `index.ts` composes them with section headers. When migrating to Skills, each file becomes a `SKILL.md`.
- **Tools split by domain**: `rides.ts`, `seats.ts`, `requests.ts` — maps to future skill boundaries.
- **`workspace/` stubbed**: Empty directory ready for Mastra Workspace/Skills.

**Environment (`.env.example`):**

```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
MOONSHOT_API_KEY=
ANTHROPIC_API_KEY=
```

#### 0.5 — Verify Foundation

- `mastra dev` starts successfully at `http://localhost:4111`
- Supabase connection verified (test query from `lib/supabase.ts`)

Steps 0.2/0.3 (database) and 0.4 (scaffold) can run in parallel.

---

### Phase 1: Agent Core `← current`

#### 1.1 — System Prompt

Written as composable sections in `instructions/`:

**`identity.ts`** — Agent persona:
- FareShare's rideshare assistant for the Ericeira - Lisbon corridor
- Friendly, casual, community-oriented (per `VERBAL_IDENTITY.md`)
- Respond in the language the user writes in (Portuguese or English)
- Always confirm before mutating data

**`passenger-flow.ts`** — Passenger instructions:
- Use `search-rides` when user wants a ride, present results in scannable format
- Help compare multiple results (route, time, seats, donation, driver)
- Suggest posting a request when no rides match
- Confirm ride details before calling `claim-seat`
- Identify correct ride and confirm before calling `cancel-seat`

**`driver-flow.ts`** — Driver instructions:
- Gather origin, destination, date, time, seats, optional donation
- Confirm all details before calling `post-ride`
- Suggest checking `search-requests` for matching demand

**`request-flow.ts`** — Request instructions:
- Suggest posting a request when no rides are available
- Gather origin, destination, preferred date/time, optional note
- Confirm before calling `post-request`
- Drivers can browse requests with `search-requests`

**`local-knowledge.ts`** — Geography context:
- Ericeira - Lisbon: ~40min drive, main corridor
- Ericeira - Sintra: ~20min
- Ericeira - Mafra: ~15min
- Common routes and typical donation ranges
- Understands informal references ("town", "the city", "going into Lisbon")

**`index.ts`** — Concatenates all sections with `## Section` headers, exports final string.

#### 1.2 — Tools

All tools use `createTool` from `@mastra/core/tools` with Zod schemas. User identity comes from `RequestContext`.

| Tool | File | Input | Output | Query |
|------|------|-------|--------|-------|
| `search-rides` | `rides.ts` | `origin?`, `destination?`, `date?`, `timeWindow?` | Array of ride summaries | `rides` filtered by params, join `seats` for count, `WHERE status = 'open'` |
| `get-ride-details` | `rides.ts` | `rideId` | Full ride with passenger list | `rides` + join `seats` + join `profiles` |
| `post-ride` | `rides.ts` | `origin`, `destination`, `departureDate`, `departureTime`, `totalSeats`, `suggestedDonation?`, `note?` | Created ride | `INSERT INTO rides` with `driver_id` from context |
| `search-requests` | `requests.ts` | `origin?`, `destination?`, `date?` | Array of request summaries | `requests` filtered, `WHERE status = 'open'` |
| `post-request` | `requests.ts` | `origin`, `destination`, `preferredDate`, `preferredTime?`, `note?` | Created request | `INSERT INTO requests` with `requester_id` from context |
| `claim-seat` | `seats.ts` | `rideId` | Confirmation + updated seat count | `INSERT INTO seats`, update `rides.status` to `'full'` if seats filled |
| `cancel-seat` | `seats.ts` | `rideId` | Confirmation + updated seat count | `DELETE FROM seats`, update `rides.status` to `'open'` if was `'full'` |

#### 1.3 — Agent Definition

```typescript
export const fareshareAgent = new Agent({
  id: 'fareshare-agent',
  name: 'FareShare Agent',
  instructions,                          // from instructions/index.ts
  model: [
    { model: 'moonshotai/kimi-k2.5', maxRetries: 2 },
    { model: 'anthropic/claude-sonnet-4-20250514', maxRetries: 2 },
  ],
  tools: { searchRides, getRideDetails, postRide,
           searchRequests, postRequest,
           claimSeat, cancelSeat },
})
```

> **Note**: Model fallback is configured so that if Kimi K2.5 fails (rate limit, timeout, tool calling issues), requests automatically fall through to Claude Sonnet. During Phase 1 Studio testing, validate Kimi's tool calling reliability. If it works well, the fallback can be kept as insurance or removed.

#### 1.4 — Mastra Instance

```typescript
export const mastra = new Mastra({
  agents: { fareshareAgent },
  storage: new PostgresStore({
    connectionString: process.env.DATABASE_URL,
  }),
})
```

#### 1.5 — Studio Testing

Run with `mastra dev --request-context-presets ./request-context-presets.json`

**Request context presets** for switching test users in Studio:

```json
{
  "toby": { "userId": "user-ts" },
  "miguel": { "userId": "user-mr" },
  "sara": { "userId": "user-sm" }
}
```

**Test matrix:**

| Test | User Preset | Message | Expected Tool | Expected Behavior |
|------|-------------|---------|---------------|-------------------|
| Search | toby | "I need a ride to Lisbon tomorrow" | `search-rides` | Returns matching rides |
| Details | toby | "Tell me more about Sara's ride" | `get-ride-details` | Shows passengers, seats, donation |
| Claim | toby | "Book me on that ride" | Confirms, then `claim-seat` | Seat claimed, count updated |
| Post ride | miguel | "Driving to Ericeira Friday 3pm, 3 seats, 10 euro" | Confirms, then `post-ride` | New ride created |
| Browse requests | miguel | "Anyone need a ride to Mafra?" | `search-requests` | Returns Pedro's request |
| Post request | toby | "I need a ride to Sintra on Wednesday evening" | Confirms, then `post-request` | New request created |
| Cancel | toby | "Cancel my seat on the ride to Sintra" | Identifies ride, confirms, `cancel-seat` | Seat removed |
| No results | toby | "Any rides to Porto?" | `search-rides` | No results, suggests posting request |
| Portuguese | toby | "Preciso de boleia para Lisboa" | `search-rides` | Responds in Portuguese |

**Model validation (first priority in 1.5):**

Run the Search and Claim tests above with Kimi K2.5 as the sole model (temporarily remove fallback). Confirm:
1. The model correctly invokes tools (not hallucinating tool responses)
2. Tool input schemas are respected (correct parameter names and types)
3. Multi-step flows work (search → user picks → claim requires two sequential tool calls)

If any of these fail, switch primary model to `anthropic/claude-sonnet-4-20250514` and revisit Kimi in a future iteration.

#### Dependency Order

| Step | Deliverable | Depends On |
|------|------------|------------|
| 0.1 | Supabase project | — |
| 0.2 | Schema + RLS + indexes | 0.1 |
| 0.3 | Mock data seeded | 0.2 |
| 0.4 | Mastra project scaffolded | — |
| 0.5 | Supabase connection verified | 0.1 + 0.4 |
| 1.1 | System prompt | 0.4 |
| 1.2 | 7 tools | 0.4 + 0.5 |
| 1.3 | Agent definition | 1.1 + 1.2 |
| 1.4 | Mastra instance | 1.3 |
| 1.5 | All flows tested in Studio | Everything |

---

### Phase 2: Memory & Context `future`

- Enable Observational Memory with `@mastra/pg` storage adapter
- Thread-scoped memory (conversation continuity)
- Resource-scoped memory (cross-thread user preferences)
- Context engineering: inject user profile and upcoming rides into system prompt

### Phase 3: Deployment `future`

- Configure `@mastra/deployer-vercel`
- Production storage on Supabase Postgres
- Auth integration (user ID from Supabase Auth via `RequestContext` middleware)
- API endpoints: `/api/agents/fareshare-agent/generate`, `/api/agents/fareshare-agent/stream`

### Phase 4: Frontend `future`

- Next.js app with chat UI using Vercel AI SDK
- Integrate with the 10 screen designs from `FARESHARE_PROJECT_PLAN.md`
- Connect to deployed Mastra agent API

## Future Considerations

- **Workspace/Skills refactor**: Extract agent sections into proper Mastra Skills when capabilities grow
- **Donation calculation agent**: Separate agent/tool for suggesting donation amounts based on distance, fuel costs, etc.
- **Calendar integration**: Professional drivers adding availability schedules, getting notified of matching requests
- **Ride type templates**: Quick-post presets for common use cases (surf spot runs, gig/party rides, daily commutes)
- **Notification system**: Alert drivers when a new request matches their usual routes
