# FareShare Agent Specification

A conversational AI agent that serves as the primary interface for FareShare — a community rideshare platform for the Ericeira ↔ Lisbon corridor. Users describe ride needs in natural language, and the agent matches them to available rides, handles seat claims, posts rides and requests.

## Approach

Agent-first: build the Mastra agent as a standalone service, test via Mastra Playground, then build the frontend later.

## Stack

| Layer | Technology |
|-------|-----------|
| Agent framework | Mastra 1.0 (`@mastra/core`) |
| LLM | Anthropic Claude Sonnet |
| Database | Supabase (Postgres) |
| Memory | Mastra Observational Memory (`@mastra/memory` + `@mastra/pg`) |
| Deployment | Vercel (`@mastra/deployer-vercel`) |
| Frontend (later) | Next.js + Vercel AI SDK |

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

User identity is passed via Mastra `runtimeContext`. In Playground testing, this is a hardcoded user ID. In production, it comes from Supabase Auth.

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

- Scaffold Mastra project in repo root
- Create Supabase project with schema from project plan
- Add RLS policies and indexes
- Seed mock data (from project plan's TypeScript fixtures)
- Configure environment (Supabase URL, service role key, Anthropic API key)
- Verify: `mastra dev` starts successfully

### Phase 1: Agent Core `← current`

- Write system prompt with labeled sections
- Build 7 tools with Zod input/output schemas querying Supabase
- Define agent with Claude Sonnet, tools, and runtime context
- Test all conversation flows in Mastra Playground:
  - Passenger searching and claiming a ride
  - Driver posting a ride
  - Browsing and matching ride requests
  - Cancelling a seat
  - Viewing upcoming rides

### Phase 2: Memory & Context `future`

- Enable Observational Memory with `@mastra/pg` storage adapter
- Thread-scoped memory (conversation continuity)
- Resource-scoped memory (cross-thread user preferences)
- Context engineering: inject user profile and upcoming rides into system prompt

### Phase 3: Deployment `future`

- Configure `@mastra/deployer-vercel`
- Production storage on Supabase Postgres
- Auth integration (user ID from Supabase Auth headers)
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
