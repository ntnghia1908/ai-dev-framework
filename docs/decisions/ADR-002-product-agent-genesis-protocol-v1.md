# ADR-002: Product Agent Genesis Protocol v1

| Metadata | Value |
|---|---|
| Status | PROPOSED |
| Date | 2026-10-07 |
| Decision owner | HUMAN LEAD |
| Scope | Product / Requirement Agent operating protocol |
| Target version | v4.4 |

## Context

Framework v4.3 defines a provider-neutral Product Agent role, but its interview guidance is still comparatively procedural: identify users/problem/workflow, ask small batches, maintain FACT / ASSUMPTION / UNKNOWN, then produce a READY requirement.

The project now has the Genesis Protocol v0.1 proposal, whose purpose is to transform an initial idea into shared engineering knowledge sufficient for planning without requiring requirements or architecture to be 100% complete.

Genesis introduces a stronger adaptive discovery loop:

```text
IDEA
  ↓
INTAKE
  ↓
DISCOVERY
  ↓
SYNTHESIS
  ↓
UNCERTAINTY ANALYSIS
  ↓
ASK / ASSUME / DEFER / HUMAN DECISION
  ↓
READINESS CHECK
  ↓
READY TO PLAN
```

The proposal also establishes a critical boundary:

```text
GENESIS  → What should we build and what must we know?
PLAN     → How should we build it?
DELIVERY → Who builds each approved piece and how do we verify it?
```

Source proposal: `Genesis Protocol v0.1` supplied by HUMAN LEAD.

## Problem

How should the framework standardize Product Agent behavior so that different Product Agent adapters perform the same adaptive discovery process, avoid unnecessary questions, explicitly manage uncertainty, route questions to the right knowledge/decision owner, and stop at a defensible READY TO PLAN boundary?

## Options

### Option A — Keep current Product Agent interview guidance

Continue using the existing interview checklist and FACT / ASSUMPTION / UNKNOWN model.

**Pros:** Minimal change; simple.

**Cons:** Does not provide a repeatable uncertainty-analysis loop, question prioritization, authority routing, or a formal readiness model. Different adapters may conduct materially different discovery.

### Option B — Integrate Genesis as the Product Agent operating protocol

Keep the existing Product Agent role contract and REQ artifact, but make Genesis the internal discovery protocol.

**Pros:** Preserves the v4.3 role boundary; makes discovery adaptive rather than questionnaire-driven; explicitly separates discovery knowledge from engineering planning; gives adapters a common behavioral contract; supports dogfooding before implementation details are frozen.

**Cons:** Adds a Project Brief working artifact and internal state model; requires migration of Product Agent instructions and tests.

### Option C — Create a separate Genesis Agent role

Add a new framework role and adapter contract alongside Product Agent.

**Pros:** Explicit separation of discovery from requirement formalization.

**Cons:** Duplicates role boundaries; complicates handoff and adapter selection; risks turning a Product Agent behavior protocol into unnecessary framework architecture.

## Proposed Decision

Adopt **Option B — Genesis as the Product Agent operating protocol**, subject to HUMAN LEAD approval.

The Product Agent remains the same framework role. Genesis is an internal protocol/state machine, not a new framework role.

### 1. Internal Genesis states

```text
G0 IDEA
 ↓
G1 INTAKE
 ↓
G2 DISCOVERY
 ↓
G3 SYNTHESIS
 ↓
G4 UNCERTAINTY ANALYSIS
 ↓
G5 READINESS CHECK
 ↓
G6 READY TO PLAN
```

G2 → G3 → G4 → G5 may repeat.

These are internal Product Agent states and do not replace the framework requirement lifecycle:

```text
DRAFT → NEEDS_CLARIFICATION → READY
```

### 2. Adaptive discovery

Default discovery order:

```text
Problem
 ↓
Users
 ↓
Current workflow
 ↓
Desired workflow
 ↓
Core behavior
 ↓
Scope
 ↓
Constraints
 ↓
Technical implications
```

Technical discovery is triggered when domain/product discovery creates a technical uncertainty that can materially affect planning.

### 3. Synthesis loop

After each meaningful answer or tightly coupled answer group, Product Agent updates:

- Known
- Assumptions
- Unknowns
- Conflicts
- Implications

The conversation is not the source of truth; relevant shared knowledge must be represented in repository artifacts.

### 4. Knowledge status

Use:

- `KNOWN`
- `ASSUMED`
- `UNKNOWN`
- `CONFLICT`
- `DECIDED`
- `DEFERRED`

An UNKNOWN is not automatically a blocker.

### 5. Uncertainty classification

Classify unresolved uncertainty by impact:

```text
LOW     → ASSUME + RECORD
MEDIUM  → RECORD / DEFER
HIGH    → ASK / HUMAN DECISION
```

High-impact means that a different answer could materially change one or more of:

- project scope;
- core user workflow;
- core requirements;
- acceptance criteria;
- data model;
- architecture;
- security model;
- external integration;
- cost model;
- deployment / operations.

### 6. Question selection

Product Agent selects the highest-value unresolved question rather than following a fixed questionnaire.

Internal heuristic:

```text
Question Priority =
    Impact
  × Uncertainty
  × Dependency
  × Expected Rework Avoidance
```

Default rule: one question per turn, except tightly coupled questions that resolve one decision/uncertainty together.

### 7. Authority routing

Questions are routed by required knowledge/decision authority:

- domain knowledge → user / domain owner;
- technical knowledge → technical lead;
- product/scope decision → decision owner;
- mixed uncertainty → relevant stakeholders.

This is knowledge routing, not a new framework role hierarchy.

### 8. Decision gates

When an uncertainty touches an existing framework decision gate, Product Agent must not decide it. It presents:

```text
DECISION REQUIRED

Issue
Evidence
Options
Recommendation
Impact
Decision owner

→ HUMAN DECISION REQUIRED
```

Existing HUMAN LEAD authority and S0/S1/S2 semantics remain unchanged.

### 9. Project Brief and REQ boundary

Genesis uses a working discovery artifact:

`docs/ai/project-brief.md`

The Project Brief captures shared discovery knowledge and readiness state.

The formal handoff remains:

`docs/product/requirements/REQ-<number>-<slug>.md`

Therefore:

```text
IDEA
 ↓
GENESIS / Project Brief
 ↓
READY TO PLAN
 ↓
REQ
 ↓
HUMAN review / acceptance
 ↓
ORCHESTRATOR
```

The Project Brief does not authorize planning or implementation.

### 10. Readiness

READY TO PLAN means:

> A meaningful implementation plan can be created without unresolved high-impact uncertainty.

Minimum readiness dimensions:

1. Problem
2. Users / stakeholders
3. Current workflow
4. Desired outcome / workflow
5. Core requirements
6. Scope
7. Critical constraints
8. Architecture-impacting risks
9. High-impact unknowns

The target condition is zero unresolved high-impact unknowns. Complete architecture, all edge cases and implementation details are not required.

### 11. HUMAN gate

`READY TO PLAN` is not approval.

After Product Agent reaches readiness:

```text
READY TO PLAN
      ↓
HUMAN reviews Project Brief / REQ
      ├── CHANGE → Genesis continues
      └── ACCEPT → handoff to planning
```

The Product Agent does not automatically authorize planning, task approval or implementation.

## Consequences

### Positive

- Product Agent behavior becomes consistent across adapters.
- Discovery becomes adaptive rather than a questionnaire.
- High-impact uncertainty is surfaced before planning.
- Safe assumptions are recorded instead of silently invented.
- Product and engineering boundaries remain explicit.
- Genesis can be dogfooded before freezing implementation details.

### Negative

- Adds a working Project Brief artifact.
- Product Agent instructions and tests become more sophisticated.
- The framework must distinguish internal Genesis state from formal REQ status.

### Explicit non-goals

- No new framework role named Genesis.
- No architecture design during Genesis.
- No implementation or task creation before READY TO PLAN.
- No automatic technology/library selection.
- No automatic HUMAN decision.
- No change to S0/S1/S2 semantics.
- No change to ORCHESTRATOR or IMPLEMENTER authority.

## Implementation gate

This ADR is **PROPOSED**.

If accepted, implementation requires a separate S2 task contract. The first implementation activity should be a dogfood run on `faculty-app-platform` using the planned shared Auth Service as the real Product Agent case.

The dogfood should evaluate each discovery question as:

```text
Useful / Unnecessary / Missing
```

and each uncertainty as:

```text
Ask / Assume / Defer
```

before freezing the final Product Agent protocol/schema details.
