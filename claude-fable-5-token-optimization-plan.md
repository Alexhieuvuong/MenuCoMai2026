# Claude Fable 5 — Performance & Token Optimization Plan

**Goal:** Cut token spend and latency when working with Claude Fable 5 (`claude-fable-5`), with a focus on eliminating unnecessary loops in agentic and multi-step workflows.

**Why it matters:** Fable 5 is Anthropic's most capable model, and output tokens are the most expensive part of the bill. A single multi-step session — research, drafting, tool-calling — can quietly burn hundreds of thousands of tokens if the loop logic is loose.

---

## Phase 1 — Audit the current loop behavior (Week 1)

Before optimizing, measure. Log every API call in your workflow and record for each one: input tokens, output tokens, cache read/write tokens, the tool(s) called, and whether the step actually changed the final outcome.

Look for these loop smells:

1. **Repeated identical or near-identical tool calls** — the model searching the same query twice, re-reading a file it already has in context.
2. **Retry loops without a cap** — error handling that re-sends the full conversation on every retry.
3. **Full-history resend growth** — each turn appends to the message list, so turn 20 costs 20× turn 1 in input tokens if nothing is cached or trimmed.
4. **"Verification" passes that never change anything** — extra model calls to double-check output that is already deterministic.
5. **Polling loops** — calling the model on a timer instead of on an event.

Deliverable: a spreadsheet of token cost per step, sorted by cost. The top 3 rows are your targets.

---

## Phase 2 — Eliminate unnecessary loops (Week 2)

**2.1 Cap and deduplicate tool calls.** Set a hard `max_iterations` on the agent loop (typically 5–10). Keep a set of already-executed tool calls (tool name + hashed arguments); if the model requests a duplicate, return the cached result instead of re-executing and re-billing.

**2.2 Make the exit condition explicit.** Loops run long when the model doesn't know what "done" looks like. In the system prompt, define a concrete stop signal, e.g. "When you have the final answer, respond with the answer only and no further tool calls." Vague goals produce extra reasoning turns.

**2.3 Collapse multi-call patterns into one call.** If the loop does plan → execute → summarize as three API calls, test whether one well-structured prompt with a required output schema does the same job. Each removed round trip saves the entire conversation prefix in input tokens.

**2.4 Move deterministic work out of the model.** Formatting, filtering, sorting, regex extraction, and arithmetic should happen in code, not in a model turn. Every model call you replace with a function is ~100% token savings on that step.

**2.5 Bound retries.** Maximum 2 retries, with exponential backoff, and on retry send only what is needed to fix the error — not the entire history plus an apology.

---

## Phase 3 — Cut the cost of the loops you keep (Week 3)

**3.1 Prompt caching.** Mark the stable prefix — tool definitions, system prompt, long reference documents — with `cache_control`, so repeated requests resume from the cached prefix instead of reprocessing it. This can cut input costs by up to 90% and latency by up to 85% on long prompts. Use the 5-minute cache for high-frequency loops; use the 1-hour cache when iterations are slower (e.g., a long-running side-agent or a user who replies infrequently).

**3.2 Context trimming / compaction.** Don't resend the full transcript forever. After N turns, summarize older turns into a short state block and drop the raw history. Keep tool results only as long as they're needed; replace stale large tool outputs with a one-line note ("file X read, key findings: …").

**3.3 Right-size the model per step.** Reserve Fable 5 for the steps that genuinely need deep reasoning. Route cheap steps — routing, extraction, simple summarization, formatting — to Haiku 4.5 or Sonnet 4.6. A two-tier pipeline often cuts total cost by more than half with no quality loss on the final output.

**3.4 Constrain output length.** Set `max_tokens` per step to a realistic ceiling and ask for terse outputs (JSON, bullet states) in intermediate steps. Output tokens are the priciest tokens; verbose intermediate reasoning that no one reads is pure waste.

**3.5 Batch what isn't interactive.** Anything that doesn't need a real-time answer goes through the Batch API at 50% lower cost.

---

## Phase 4 — Monitor and lock it in (ongoing)

Track these metrics per workflow run and alert on regressions:

- Total tokens per completed task (target: ↓ 40–60% vs. Phase 1 baseline)
- Average iterations per agent loop (target: ≤ 5)
- Cache hit rate on input tokens (target: ≥ 70% for loops with stable prefixes)
- Duplicate-tool-call rate (target: ~0%)
- Cost per task in USD

Re-run the Phase 1 audit monthly. New features tend to re-introduce loose loops.

---

## Quick checklist

- [ ] Hard iteration cap on every agent loop
- [ ] Tool-call deduplication with result cache
- [ ] Explicit "done" condition in the system prompt
- [ ] `cache_control` on system prompt + tool definitions + long docs
- [ ] History compaction after N turns
- [ ] Cheaper model for routing/extraction/formatting steps
- [ ] `max_tokens` set per step; terse intermediate formats
- [ ] Retry limit of 2 with minimal payload
- [ ] Batch API for non-interactive jobs
- [ ] Monthly token audit

---

*References: Anthropic prompt caching docs (platform.claude.com/docs/en/build-with-claude/prompt-caching), Anthropic token-saving updates (claude.com/blog/token-saving-updates).*
