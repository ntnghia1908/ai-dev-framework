# ADR-001: Agent Adapter Architecture v1

| Metadata | Value |
|---|---|
| Status | PROPOSED |
| Date | 2026-10-07 |
| Decision owner | HUMAN LEAD |
| Scope | Framework architecture |
| Target version | v4.3 |

## Context

AI Dev Framework v4.2 intentionally separates Framework Core, Project Layer and Tool Adapters. The Core is already designed to avoid hard-coding model/vendor names.

An audit found remaining provider-specific coupling in Product Layer documentation, installation/bootstrap behavior, checker registration and historical documentation. In particular, ChatGPT/GPT and Claude are currently treated as implicit/default implementations in several places.

This prevents the framework from being genuinely agent-agnostic even though its execution profiles and task contracts are mostly neutral.

The framework now has multiple implementation adapters (Claude Code, Copilot and Codex), and there is a practical requirement to allow Gemini or other agents to occupy the same roles without redesigning the workflow.

## Problem

How should the framework allow different AI agents/tools to perform the same framework role while preserving the existing governance and execution workflow?

## Options

### Option A — Keep provider-specific integrations

Keep Product Agent tied to ChatGPT and Engineering Agent tied to Claude Code, adding other tools only as special cases.

**Pros:** Minimal change; existing setup remains familiar.

**Cons:** Provider lock-in; every new agent requires special-case framework changes; Core/project documentation continues to mix role and provider concepts; difficult to reason about capability and permissions consistently.

### Option B — Model/Provider Adapter Architecture

Define provider-neutral agent contracts and bind them to provider/tool-specific adapters through project configuration and adapter descriptors.

**Pros:** Preserves current Core workflow; allows multiple agents to fill the same role where capable; isolates provider-specific permissions and invocation details; enables machine-readable adapter validation; supports per-project and per-task selection.

**Cons:** Requires migration of current documentation/configuration; requires adapter descriptor/registry design; adds initial framework complexity.

### Option C — Central AI gateway

Introduce one internal API/gateway that hides all model providers.

**Pros:** Single runtime interface; centralized provider routing.

**Cons:** Adds infrastructure and operational dependency; unnecessary for the current repository-driven workflow; does not solve tool-specific capabilities by itself.

## Recommendation

**Recommend Option B — Model/Provider Adapter Architecture.**

The framework should separate:

~~~text
ROLE / CONTRACT
      ↓
PROJECT BINDING
      ↓
ADAPTER
      ↓
PROVIDER / TOOL / MODEL
~~~

The existing S0/S1/S2 workflow, decision gates, task approval, verification and integration ownership remain unchanged.

## Proposed decision

If approved:
1. Agent roles become provider-neutral contracts.
2. Provider/tool details remain inside adapters.
3. Adapters expose a machine-readable descriptor.
4. framework.config.json binds roles to enabled adapters.
5. IMPLEMENTER remains selectable per task from the enabled adapter pool.
6. The checker validates adapter descriptors and role compatibility.
7. Product Layer and installation/bootstrap documentation become provider-neutral.
8. Existing Claude Code, Copilot and Codex adapters remain supported.
9. A Gemini adapter may be added and piloted without changing Core workflow.
10. No automatic model switching or autonomous authorization is introduced.

## Consequences

### Positive
- Reduced vendor lock-in.
- Easier experimentation with Gemini and future agents.
- Clear separation between role behavior and tool implementation.
- Better machine validation of adapter compatibility.
- Existing governance remains intact.

### Negative
- v4.3 migration touches checker, templates, documentation and adapters.
- Adapter descriptors add configuration surface.
- Each new adapter still requires capability/permission testing.

### Neutral
The framework does not claim one model/vendor is universally better. Selection remains a project/task decision based on capability, cost, availability and policy.

## Security / governance

Adapter capabilities do not override framework authority.

- Product Agent cannot authorize implementation.
- ORCHESTRATOR cannot bypass HUMAN LEAD approval.
- IMPLEMENTER cannot self-authorize.
- Required verification remains mandatory.
- Integration authority remains with HUMAN LEAD/project mechanism.

## Rejected alternatives

- Hard-code Gemini alongside Claude as another special case.
- Replace Claude with Gemini globally.
- Introduce a central AI gateway for v1.
- Add an independent REVIEWER role in v1.

## Implementation gate

This ADR is **PROPOSED**.

No implementation of the architecture should begin until HUMAN LEAD changes this ADR to ACCEPTED.

After acceptance, implementation is an S2 framework change and should proceed through a task contract with explicit acceptance criteria and verification.