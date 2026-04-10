---
shaping: true
---

# Spike: Agent Response Structure

## Context

The bridge layer (A3.2 in the shaping doc) sits between the Mastra agent and Chat SDK. It needs to inspect the agent's response and choose the right WhatsApp message format:

- Ride search results → WhatsApp list message (tappable items)
- Single ride detail → text message + interactive buttons
- Confirmation prompt → button message (CONFIRM / CANCEL)
- Plain conversational reply → plain text

The agent calls Mastra tools (which return structured data from Supabase), then the LLM composes a text response. By the time we get the agent's final output, the structured data has been "flattened" into natural language. The question: how does the bridge reliably distinguish response types and access the structured data for formatting?

## Goal

Understand what Mastra's `agent.generate()` returns, what data is available at each stage, and identify the cleanest mechanism for the bridge to format WhatsApp-appropriate responses.

## Questions

| # | Question |
|---|----------|
| **S1-Q1** | What does Mastra's `agent.generate()` return? Is it just a string, or a richer object with tool call results, step metadata, etc.? |
| **S1-Q2** | Can we access the raw tool results (structured JSON) from the agent's response, separate from the LLM's composed text? |
| **S1-Q3** | Does Mastra support any middleware/hook that runs after tool execution but before the LLM composes its final text? |
| **S1-Q4** | Could the agent be instructed to return structured output (e.g. JSON with a `type` field) instead of plain text, and would that break the platform-agnostic design (R9)? |

## Acceptance

Spike is complete when we can describe the data flow from tool call → agent response → bridge, and identify which approach gives the bridge reliable access to structured data for formatting decisions.

---

## Findings

### S1-Q1: What does `agent.generate()` return?

A rich object, not just a string. The return type includes:

| Field | Type | Description |
|-------|------|-------------|
| `text` | `string` | The LLM's final composed natural language response |
| `toolCalls` | `ToolCall[]` | All tool calls made during generation |
| `toolResults` | `ToolResult[]` | All tool execution results (structured JSON from each tool's `execute()`) |
| `steps` | `Step[]` | Array of execution steps -- each step has its own `toolCalls`, `toolResults`, `text` |
| `finishReason` | `string` | `'stop'` (normal), `'tool-calls'`, `'suspended'`, `'error'` |
| `usage` | `TokenUsage` | Token consumption stats |
| `response` | `object` | Provider metadata (headers, model ID, timestamps) |

Source: [Mastra `agent.generate()` reference](https://mastra.ai/reference/agents/generate)

### S1-Q2: Can we access raw tool results separately from the text?

**Yes.** `response.toolResults` contains the structured JSON returned by each tool's `execute()` function. These are the raw Supabase query results -- ride objects, request objects, confirmation payloads -- typed via Zod output schemas. They are available *alongside* `response.text`, not flattened into it.

Each `ToolResult` includes a `toolName` field, so `response.toolResults[0].toolName === 'search-rides'` tells the bridge exactly which tool produced the result.

### S1-Q3: Middleware/hook between tool execution and final text?

**Partially.** `onStepFinish` fires after each step completes, providing `{ text, toolCalls, toolResults, finishReason }` for that step. But it's observational -- you can log or track, not intercept or modify the flow.

Mastra also supports `structuredOutput` with a separate structuring model (see S1-Q4), but that's a different mechanism, not middleware.

There is no pre-response hook that lets you transform or redirect before the LLM composes its final text.

### S1-Q4: Structured output instead of plain text?

**Possible, with caveats.** Mastra supports `structuredOutput` via Zod schema on `generate()`. Three sub-options:

1. **Native `response_format`** -- passes schema to the model API. Claude Sonnet supports this. But Mastra docs warn: *"When an agent has both tools and structured output configured, some models may not support using both features together."* Risk for a one-shot build.

2. **Separate structuring model** -- `structuredOutput: { schema, model: 'anthropic/claude-sonnet' }` makes two LLM calls: one for tool calling + reasoning, one to extract structured data. Clean contract but doubles cost and latency.

3. **`prepareStep` multi-step** -- handle tools in step 0, structured output in step 1. Most control, most complexity.

---

## Options

### Option 1: Inspect `toolResults` post-generation

```
User message
    │
    ▼
agent.generate(message)
    │
    ▼
response = { text, toolCalls, toolResults, steps }
    │
    ▼
Bridge decision tree:
    │
    ├── toolResults has search-rides result?
    │   → WhatsApp list message
    │     body: response.text (truncated to 1024 chars)
    │     items: from toolResults[].result (ride objects)
    │
    ├── toolResults has get-ride-details result?
    │   → Text message + buttons
    │     body: response.text
    │     buttons: [CLAIM SEAT] [BACK]
    │
    ├── toolResults has claim-seat/post-ride/cancel-seat result?
    │   → Plain text (action already completed after confirmation)
    │     body: response.text
    │
    ├── No toolResults?
    │   → Plain text message
    │     body: response.text
    │
    └── Multiple tool calls in one generation?
        → Use the LAST tool result to determine format
```

**Pros:**
- Zero extra LLM calls
- Uses data Mastra already provides
- Agent stays fully platform-agnostic -- no knowledge of WhatsApp
- Deterministic decision tree based on `toolName`
- Tool results are Zod-typed, so the bridge gets reliable field access

**Cons:**
- The agent also composes a text summary of the data. For list messages, `response.text` includes a text version of the ride results, while the list items show the same data in structured form. Need to either: (a) use `response.text` as the list body (it becomes the intro text above the list), or (b) suppress it and write a static body.
- If the agent makes multiple tool calls in one generation (e.g., search then get-details), the bridge needs to decide which one drives the format. Last tool call is the safest heuristic.

**Design detail:** For the confirmation flow (R2), the agent is instructed to confirm *before* mutation. So the flow is:

1. User: "claim that seat" → agent calls NO tools, responds with confirmation text
2. Bridge: no toolResults → sends as button message with [CONFIRM] [CANCEL]
3. User taps CONFIRM → agent calls `claim-seat` tool → bridge sees toolResult → sends plain text success

Wait -- step 2 is the problem. How does the bridge know this plain text response is a confirmation prompt (needs buttons) vs. a regular conversational reply (no buttons)?

**Resolution:** The agent's instructions tell it to always end confirmation prompts with a specific phrase pattern. But that's fragile (Option 3 territory). Better approach: **use the `onStepFinish` callback** to detect when the agent *wanted* to call a mutation tool but was held back by its instructions. Actually, that doesn't work either -- the agent simply doesn't call the tool.

**Actual resolution:** Handle confirmations via Chat SDK actions, not agent text parsing. When the bridge sends a ride detail (from `get-ride-details` tool result), it attaches a `[CLAIM SEAT]` button with the ride ID as the button `value`. When the user taps it, Chat SDK fires an `onAction("claim-seat")` handler. That handler calls the agent with a synthetic message like "Confirm: claim seat on ride {rideId}" -- which the agent processes and calls the `claim-seat` tool. The confirmation is mechanical, not conversational.

This sidesteps the parsing problem entirely. Confirmations are button-driven, not text-driven.

### Option 2: Structured output with separate model

```
agent.generate(message, {
  structuredOutput: {
    schema: z.object({
      responseType: z.enum(['ride_list', 'ride_detail', 'confirmation', 'text']),
      text: z.string(),
      rides: z.array(RideSchema).optional(),
      ride: RideSchema.optional(),
    }),
    model: 'anthropic/claude-sonnet-4-20250514'
  }
})
```

**Pros:**
- Clean, typed contract between agent and bridge
- Bridge logic is trivial: `switch (response.object.responseType)`
- No ambiguity about response type

**Cons:**
- Two LLM calls per message (doubles cost and latency)
- The structuring model needs to understand the agent's intent from text alone
- More moving parts -- the structuring schema becomes a maintenance surface
- Overkill when `toolResults` already provides the structured data

### Option 3: Agent instructions with markers

Instruct the agent to wrap responses: `[RIDE_LIST]...[/RIDE_LIST]`, `[CONFIRM action=claim-seat ride=xxx]...[/CONFIRM]`.

**Pros:**
- Single LLM call
- Explicit intent signaling

**Cons:**
- LLMs are unreliable at consistently following formatting rules
- Will break in production
- Not suitable for a one-shot build
- Mixes platform concerns into the agent (violates R9)

---

## Recommendation

**Option 1 (inspect `toolResults`) with direct tool execution for button actions.**

After evaluating Option 1's risks (see below), the final design splits into two paths:

- **Conversational messages** → full agent call, bridge inspects `toolResults` for formatting
- **Button taps** → direct Mastra tool execution, no LLM, static response templates

### Option 1 risks and mitigations

**Risk 1: Multi-tool-call ambiguity.**

The agent might chain tools in one `generate()` call. Example: user says "Any rides to Lisbon tomorrow? Book me on the cheapest one." Agent calls `search-rides` → `get-ride-details` → `claim-seat` across three steps. The bridge sees three tool results. Which drives the format?

*Mitigation:* Use the **last step's** tool results (`response.steps[response.steps.length - 1].toolResults`), not the flat `response.toolResults` array. The last step represents what the agent concluded with. In the example above, the last step is `claim-seat` → plain text success. The agent's `response.text` will naturally summarize the whole sequence ("Found 3 rides, the cheapest was Sara M's at EUR 10, and I've claimed your seat.").

**Risk 2: Synthetic messages to the agent are unreliable.**

The original design had `onAction('claim-seat')` sending a synthetic message like "Confirm: claim seat on ride {rideId}" to the agent. But the agent is an LLM -- it might ask a follow-up instead of calling the tool, or call `get-ride-details` first to "verify" before claiming. You're relying on prompt engineering for deterministic behavior.

*Mitigation:* **Skip the agent entirely for button actions.** Call the Mastra tool directly. The `claim-seat` tool already has all the logic (Supabase insert, status update). The bridge formats the tool's return value into a static success/error template. No LLM call, no ambiguity, faster, cheaper. The tradeoff: success messages are templates, not natural language. For mutations, that's a feature not a bug -- "Seat claimed. Sara M, Ericeira → Lisbon, Mon 14 Apr 16:00." is more trustworthy than an LLM improvisation.

### Final data flow

```
CONVERSATIONAL MESSAGES (natural language)
==========================================
User sends WhatsApp message
    │
    ▼
Chat SDK onSubscribedMessage
    │
    ▼
Bridge: resolveUser(waId) → userId
    │
    ▼
Bridge: agent.generate(message, { requestContext: { userId } })
    │
    ▼
Bridge: get last step's toolResults from response.steps
    │
    ├── toolName === 'search-rides'
    │   → WhatsApp list message
    │     body = response.text (intro, max 1024 chars)
    │     items = toolResults.result.map(ride => list item)
    │
    ├── toolName === 'search-requests'
    │   → WhatsApp list message (same pattern, request items)
    │
    ├── toolName === 'get-ride-details'
    │   → Text + buttons
    │     body = response.text
    │     buttons = [CLAIM SEAT (value=rideId)] [BACK]
    │
    ├── mutation tool (claim-seat, post-ride, etc.)
    │   → Plain text
    │     body = response.text
    │
    └── no toolResults
        → Plain text
          body = response.text


BUTTON TAPS (deterministic, no LLM)
====================================
User taps [CLAIM SEAT]
    │
    ▼
Chat SDK onAction('claim-seat')
    │
    ▼
Bridge: resolveUser from thread state
    │
    ▼
Bridge: execute claim-seat tool directly
        claimSeat.execute({ rideId: event.value, userId })
    │
    ├── success
    │   → Static template: "Seat claimed. {driver}, {route}, {date} {time}."
    │
    └── error (ride full, already claimed, etc.)
        → Static template: "Could not claim seat. {reason}"


User taps [BACK]
    │
    ▼
Chat SDK onAction('back')
    │
    ▼
Bridge: static message "What are you looking for?"
        (no agent call, no tool call)


User taps list item (ride from search results)
    │
    ▼
Chat SDK interactive reply handler
    │
    ▼
Bridge: execute get-ride-details tool directly
        getRideDetails.execute({ rideId: itemId })
    │
    ▼
Bridge: format as text + buttons using tool result
        (no agent call -- structured data is sufficient)
```

### Why this works for a one-shot build

1. **Two clear paths** -- conversational messages go through the agent, button taps bypass it. No hybrid ambiguity.
2. **Zero LLM calls for actions** -- button taps execute tools directly. Faster, cheaper, deterministic.
3. **Multi-step handled** -- bridge reads last step's tool results, agent's text summarizes the full sequence naturally.
4. **Platform-agnostic agent** -- agent has no WhatsApp knowledge, no synthetic messages to parse.
5. **Typed data** -- tool results are Zod-validated, bridge has reliable field access for both paths.
6. **Testable** -- conversational path tested with mock agent responses, action path tested with mock tool results. No LLM in the loop for action tests.
7. **Static templates for mutations are safer** -- "Seat claimed." is more trustworthy than LLM-generated confirmation text.

### Mastra Workflows / Skills: not for V1

Evaluated and rejected for V1:

- **Workflows** could enforce step-by-step flows (post-ride: collect origin → destination → date → etc.). But the agent already handles multi-turn field collection well via natural language. A workflow would force rigid sequencing that fights the conversational advantage. It also adds a second state orchestration layer alongside Chat SDK thread state -- debugging nightmare.
- **Skills** are an organizational pattern. The instructions are already split into composable files (`identity.ts`, `passenger-flow.ts`, etc.). Migrating to formal Mastra Skills is renaming + metadata. Zero behavior change at runtime. Do it when you need dynamic skill loading or cross-agent sharing.
- **Workspaces** are for multi-agent coordination. FareShare has one agent. No benefit.

Revisit when: (a) a second agent is added (e.g., donation calculator), or (b) flows get complex enough that LLM reasoning becomes unreliable (e.g., payment processing with strict validation).

### What changed in the shaping doc

- **A3.2**: bridge reads `response.steps[last].toolResults` (not flat `response.toolResults`) for format decision
- **A3.3**: reversed "drop Mastra Memory" decision. WhatsApp Cloud API can't fetch message history, so Chat SDK's `thread.messages` / `toAiMessages()` is not viable. Mastra Memory (`@mastra/memory` + `@mastra/pg`) provides thread-scoped persistence using Chat SDK thread ID as the key.
- **A5.3**: button taps execute Mastra tools directly, no LLM. Applies to single-parameter actions only (claim-seat, cancel-seat, view detail).
- **A5.4**: post-ride and post-request are fully conversational. Agent collects fields across turns and calls the tool when user confirms in natural language. No button-driven confirmation for multi-field mutations.
- **A7**: action handlers call tools directly, not the agent. A7.3 (post-confirm) removed. List item taps call `get-ride-details` directly and format from tool result.
- **Decisions table**: added entries for direct tool execution on actions, skipping Workflows/Skills for V1, and reversing the Mastra Memory decision.
