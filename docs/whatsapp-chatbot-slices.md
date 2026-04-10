---
shaping: true
---

# WhatsApp Chatbot -- Slices

Vertical implementation slices for the WhatsApp chatbot shape (Shape A). Each slice ends in a demo-able interaction on WhatsApp.

Parent doc: [whatsapp-chatbot-shaping.md](whatsapp-chatbot-shaping.md)

---

## Slice Overview

| Slice | Name | Demo |
|-------|------|------|
| V1 | Hello World | User sends message on WhatsApp, bot replies with static text |
| V2 | Search Rides | User asks for rides, gets a WhatsApp list message back |
| V3 | Ride Detail + Claim | User taps list item, sees detail + buttons, taps CLAIM SEAT |
| V4 | Post Ride | User describes a ride, agent collects fields, posts it |
| V5 | Requests + Cancel | search-requests, post-request, cancel-seat |

---

## V1: Hello World

**Goal:** Prove the full infrastructure chain works. WhatsApp message in → Vercel → Chat SDK → Mastra agent → response → WhatsApp message out.

**Demo:** User sends "hey" on WhatsApp. Bot replies with a greeting in the FareShare voice.

### What gets built

| Component | File | Details |
|-----------|------|---------|
| Supabase schema | SQL migration | `profiles` table (revised: `phone`, nullable `display_name`), `rides`, `seats`, `requests` tables. RLS policies. Indexes. |
| Seed data | SQL inserts | Mock profiles, 4 rides, seats, 3 requests (from existing mock data) |
| Supabase client | `src/lib/supabase.ts` | `createClient()` with `service_role` key |
| Chat SDK bot | `src/lib/bot.ts` | `Chat` instance with `createWhatsAppAdapter()` + `createPostgresState()` pointing at Supabase. `onNewMention` handler: subscribe to thread. `onSubscribedMessage` handler: call bridge. |
| Webhook route | `src/app/api/webhooks/whatsapp/route.ts` | GET (verification challenge) + POST (incoming messages). Delegates to `bot.handler()`. |
| Identity resolution | `src/lib/bridge.ts` | `resolveUser(waId)`: upsert into `profiles` by phone number, return profile. Store userId in thread state on first message. |
| Agent instructions | `src/mastra/instructions/*.ts` | `identity.ts` only for V1. Compose in `index.ts`. FareShare voice, bilingual, no exclamation marks. |
| Agent definition | `src/mastra/agents/fareshare-agent.ts` | Claude Sonnet, identity instructions only, no tools yet. |
| Mastra instance | `src/mastra/index.ts` | Agent registered. Mastra Memory with `@mastra/pg` pointing at Supabase. |
| Bridge | `src/lib/bridge.ts` | `callAgent()`: calls `agent.generate()` with message text and `{ memory: { thread: threadId, resource: userId } }`. `formatResponse()`: returns `response.text` as plain text (no tool results to inspect yet). |
| Environment | `.env.example` | All 7 env vars documented. |
| Dependencies | `package.json` | `chat`, `@chat-adapter/whatsapp`, `@chat-adapter/state-pg`, `@mastra/core`, `@mastra/memory`, `@mastra/pg`, `@supabase/supabase-js`, `zod`, `pg` |

### Verification

1. Deploy to Vercel (or run locally with ngrok)
2. Configure Meta webhook URL
3. Send "hey" from a WhatsApp phone number
4. Expect: greeting in FareShare voice
5. Send "ola" → expect: response in Portuguese
6. Check Supabase: `profiles` row created with the phone number
7. Send a second message → expect: agent remembers the first message (Mastra Memory working)

### Notes

- No tools in V1. Agent is conversational only.
- Identity resolution + memory are included in V1 because they're foundational -- every subsequent slice depends on them.
- The Meta WhatsApp Business app setup (developer dashboard, phone number, webhook config) is a manual prerequisite.

---

## V2: Search Rides

**Goal:** First tool working end-to-end. User asks for rides, agent calls `search-rides`, bridge formats results as a WhatsApp list message.

**Demo:** User sends "any rides to Lisbon tomorrow?" → gets a tappable list of matching rides.

### What gets built

| Component | File | Details |
|-----------|------|---------|
| search-rides tool | `src/mastra/tools/rides.ts` | `createTool({ id: 'search-rides' })`. Input: `origin?`, `destination?`, `date?`, `timeWindow?`. Output: array of ride summaries. Queries `rides` table filtered by params, joins `seats` for count, `WHERE status = 'open'`. |
| get-ride-details tool | `src/mastra/tools/rides.ts` | `createTool({ id: 'get-ride-details' })`. Input: `rideId`. Output: full ride with driver profile + passenger list. Joins `rides` + `seats` + `profiles`. Included in V2 because search-requests won't need it, but ride detail view (V3) will -- and having both read tools together keeps the file coherent. |
| Passenger instructions | `src/mastra/instructions/passenger-flow.ts` | Search behavior: use `search-rides` when user wants a ride, present results in scannable format, suggest posting a request when no rides match. |
| Local knowledge | `src/mastra/instructions/local-knowledge.ts` | Ericeira-Lisbon corridor geography, informal references ("the city" = Lisbon), typical donation ranges. |
| Agent update | `src/mastra/agents/fareshare-agent.ts` | Add `searchRides` and `getRideDetails` to tools. Add passenger-flow and local-knowledge to instructions. |
| Bridge: list formatting | `src/lib/bridge.ts` | `formatResponse()` updated: if last step's `toolName === 'search-rides'`, format as WhatsApp list message. Items from tool results: title = route (truncate to 24 chars), description = date + time + seats (truncate to 72 chars). Body = `response.text` (truncate to 1024 chars). |

### Verification

1. Send "any rides to Lisbon?" → list message with seeded rides
2. Send "rides from Ericeira to Mafra" → filtered results or "no rides found"
3. Send "preciso de boleia para Lisboa amanha" → agent responds in Portuguese, calls search-rides
4. Verify list item titles fit within 24 chars, descriptions within 72 chars
5. When same route appears multiple times, items are distinguishable (driver name or time prefix)

### Notes

- List item taps don't work yet -- that's V3. In V2, tapping a list item will produce a text reply that the agent can interpret conversationally ("tell me about that ride"), but no button-driven detail view.
- `get-ride-details` is built here but the bridge doesn't format it specially yet (that's V3). If the agent calls it, bridge treats it as plain text.

---

## V3: Ride Detail + Claim Seat

**Goal:** Complete the passenger browsing and claiming flow. Tapping a search result shows ride detail with buttons. Tapping CLAIM SEAT executes the tool directly.

**Demo:** User searches → taps a ride → sees detail with `[CLAIM SEAT]` and `[BACK]` buttons → taps CLAIM SEAT → "Seat claimed."

### What gets built

| Component | File | Details |
|-----------|------|---------|
| claim-seat tool | `src/mastra/tools/seats.ts` | `createTool({ id: 'claim-seat' })`. Input: `rideId`. Gets `userId` from `requestContext`. Inserts into `seats`, updates `rides.status` to `'full'` if all seats taken. Returns confirmation with ride summary. |
| cancel-seat tool | `src/mastra/tools/seats.ts` | `createTool({ id: 'cancel-seat' })`. Input: `rideId`. Deletes from `seats`, updates `rides.status` to `'open'` if was full. Built here alongside claim-seat to keep the file complete. |
| Bridge: detail formatting | `src/lib/bridge.ts` | If last step's `toolName === 'get-ride-details'`, format as text + interactive buttons. Text body uses WhatsApp markdown (`*bold*` route, `_italic_` driver). Buttons: `[CLAIM SEAT]` (value = rideId), `[BACK]`. |
| Bridge: static templates | `src/lib/bridge.ts` | Template functions for mutation results: `formatClaimSuccess(result)`, `formatClaimError(error)`, `formatCancelSuccess(result)`, `formatCancelError(error)`. |
| Action: claim-seat | `src/lib/bot.ts` | `onAction('claim-seat')`: resolve userId from thread state, call `claimSeat.execute({ rideId: event.value, userId })` directly, post static template response. |
| Action: cancel-seat | `src/lib/bot.ts` | `onAction('cancel-seat')`: same pattern. |
| Action: back | `src/lib/bot.ts` | `onAction('back')`: static "What are you looking for?" message. |
| Action: list item tap | `src/lib/bot.ts` | Interactive reply handler: call `getRideDetails.execute({ rideId: itemId })` directly, format as text + buttons. |
| Agent update | `src/mastra/agents/fareshare-agent.ts` | Add `claimSeat`, `cancelSeat` to tools. Agent instructions already handle "confirm before claiming" from passenger-flow. |

### Verification

1. Search rides → tap list item → ride detail with buttons
2. Tap CLAIM SEAT → "Seat claimed. {driver}, {route}, {date} {time}."
3. Tap CLAIM SEAT on a full ride → "Could not claim seat. This ride is full."
4. Tap BACK → "What are you looking for?"
5. Conversational claim: "I want to claim a seat on Sara's ride" → agent confirms → calls tool → bridge sends response.text
6. Conversational cancel: "cancel my seat on the Lisbon ride" → agent identifies ride, confirms, calls cancel-seat
7. Check Supabase: `seats` row created/deleted, `rides.status` updated

### Notes

- This slice introduces the two-path pattern: conversational (via agent) and deterministic (via button tap). Both must work.
- The agent can also call `claim-seat` conversationally (user types "book me on that ride"). In that case, the bridge sees the mutation tool result and sends `response.text` as plain text. Both paths produce the correct outcome.

---

## V4: Post Ride

**Goal:** Complete driver flow. User posts a ride through natural language conversation. Agent collects fields, confirms, and calls `post-ride`.

**Demo:** User sends "I'm driving to Lisbon tomorrow at 4pm, 3 seats" → agent confirms details → user says "yes" → ride posted.

### What gets built

| Component | File | Details |
|-----------|------|---------|
| post-ride tool | `src/mastra/tools/rides.ts` | `createTool({ id: 'post-ride' })`. Input: `origin`, `destination`, `departureDate`, `departureTime`, `totalSeats`, `suggestedDonation?`, `note?`. Gets `driver_id` from `requestContext`. Inserts into `rides`. Returns created ride. |
| Driver instructions | `src/mastra/instructions/driver-flow.ts` | Gather fields (origin, destination, date, time, seats, donation), confirm all details before calling tool, suggest checking requests for matching demand. |
| Agent update | `src/mastra/agents/fareshare-agent.ts` | Add `postRide` to tools. Add driver-flow to instructions. |
| Bridge: mutation plain text | `src/lib/bridge.ts` | When last step's `toolName === 'post-ride'`, send `response.text` as plain text. Agent composes the success message naturally. |

### Verification

1. "I'm driving to Lisbon tomorrow at 4pm, 3 seats" → agent confirms → "yes" → ride posted
2. "Vou para Lisboa amanha" → agent asks for missing fields (time, seats) in Portuguese → collects → posts
3. "I'm driving to Lisbon Friday 5pm, 2 seats, 8 euro donation" → agent parses all fields at once → confirms → posts
4. User says "no" at confirmation → agent acknowledges, doesn't post
5. Check Supabase: `rides` row created with correct `driver_id`, fields match
6. After posting, search rides → new ride appears in results

### Notes

- This is the first fully conversational multi-turn slice. No buttons involved for posting -- the agent handles the full flow via natural language, including confirmation.
- Mastra Memory is critical here: the agent needs context from previous turns to remember the fields it already collected.

---

## V5: Requests + Cancel

**Goal:** Complete remaining capabilities: search-requests, post-request, cancel-seat via agent. All 7 tools working.

**Demo:** User posts a ride request. Another user (driver) searches requests. User cancels a seat.

### What gets built

| Component | File | Details |
|-----------|------|---------|
| search-requests tool | `src/mastra/tools/requests.ts` | `createTool({ id: 'search-requests' })`. Input: `origin?`, `destination?`, `date?`. Output: array of request summaries. Queries `requests` WHERE `status = 'open'`. |
| post-request tool | `src/mastra/tools/requests.ts` | `createTool({ id: 'post-request' })`. Input: `origin`, `destination`, `preferredDate`, `preferredTime?`, `note?`. Gets `requester_id` from `requestContext`. Inserts into `requests`. |
| Request instructions | `src/mastra/instructions/request-flow.ts` | Suggest posting a request when no rides match, gather fields, confirm before posting. Drivers can browse requests. |
| Agent update | `src/mastra/agents/fareshare-agent.ts` | Add `searchRequests`, `postRequest` to tools. Add request-flow to instructions. |
| Bridge: request list | `src/lib/bridge.ts` | If last step's `toolName === 'search-requests'`, format as WhatsApp list message (same pattern as ride list, different item content). |

### Verification

1. "Anyone need a ride to Mafra?" → agent calls search-requests → list of matching requests
2. "I need a ride to Sintra on Wednesday" → agent collects fields → posts request
3. "Cancel my seat on the ride to Lisbon" → agent identifies ride → confirms → cancels
4. Full flow: search rides → no results → agent suggests posting request → user agrees → request posted
5. All 7 tools verified working through WhatsApp
6. Portuguese and English for all new flows

### Notes

- V5 is lighter than the previous slices -- the patterns are all established. It's mostly new tool implementations following existing patterns and adding the request-flow instructions.
- Cancel-seat was built in V3 (tool + button action), but this slice verifies the conversational cancel path works too.

---

## Slice Dependency Graph

```
V1: Hello World
 │
 ├── Supabase schema + seed
 ├── Chat SDK + webhook
 ├── Identity resolution
 ├── Mastra Memory
 └── Agent (identity only, no tools)
      │
      ▼
V2: Search Rides
 │
 ├── search-rides tool
 ├── get-ride-details tool
 ├── Bridge list formatting
 └── Passenger + local instructions
      │
      ▼
V3: Ride Detail + Claim
 │
 ├── claim-seat + cancel-seat tools
 ├── Bridge detail + button formatting
 ├── onAction handlers (claim, cancel, back)
 └── List item tap → direct tool execution
      │
      ▼
V4: Post Ride
 │
 ├── post-ride tool
 ├── Driver instructions
 └── Conversational multi-turn mutation
      │
      ▼
V5: Requests + Cancel
 │
 ├── search-requests + post-request tools
 ├── Request instructions
 └── Bridge request list formatting
```

Each slice is strictly additive -- no refactoring of previous slices required.
