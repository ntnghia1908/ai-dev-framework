# ADR-002 — Boundary Authorization & Bounded Parallel Implementers v1

| Metadata | Value |
|---|---|
| Status | ACCEPTED |
| Decision owner | HUMAN LEAD |
| Date | 2026-10-08 |
| Scope | Framework Core governance and execution |
| Target | v4.4 |

## Context

Framework v4.3 requires HUMAN LEAD approval for every S1/S2 task before implementation. This is safe, but becomes unnecessarily serial when a larger requirement, feature, or architecture boundary has already been explicitly accepted by HUMAN LEAD.

The reference project `youtube-auto-short` demonstrates useful bounded execution and multiple IMPLEMENTER support at the Project Layer, but its current v4.2 workflow still retains per-task `APPROVE TASK` and uses one IMPLEMENTER per task. The framework should generalize the faster operating mode without removing the HUMAN LEAD decision boundary.

## Decision

### D1 — Boundary authorization

Framework v4.4 supports two governance modes:

- `task`: backward-compatible per-task approval.
- `boundary`: HUMAN LEAD approves an explicit **Implementation Authorization Boundary** once; ORCHESTRATOR may then create and execute task contracts entirely inside that boundary without another `APPROVE TASK` gate.

Boundary authorization does not authorize any change outside the recorded boundary.

### D2 — Decision gates remain mandatory

The following still require HUMAN LEAD decision before execution when not already covered by the approved boundary:

- scope;
- architecture;
- dependency;
- security model;
- public API;
- breaking change;
- significant shared abstraction;
- project-wide policy/convention;
- database/schema.

An ORCHESTRATOR may not convert an implementation detail into a silent decision or enlarge the boundary.

### D3 — Explicit task authorization evidence

Every boundary-authorized task records:

- `Authorization mode: boundary`;
- `Authorization source`;
- `Implementation authorized: YES`.

This makes inherited authorization inspectable and machine-checkable.

### D4 — Multiple IMPLEMENTER instances

The `dual-agent` profile may use multiple IMPLEMENTER instances concurrently.

Concurrency is controlled by project configuration:

`governance.maxParallelImplementers`

Valid range: 1–3.

Parallelism is task-level fan-out. Each task has:

- one writer;
- its own branch/worktree;
- a disjoint owned-path/subsystem boundary;
- satisfied dependencies;
- independently verifiable acceptance criteria.

Two IMPLEMENTER instances must never write the same task concurrently.

### D5 — Review and integration are unchanged

Each implementation is still reviewed by the ORCHESTRATOR against its task contract and verification evidence.

`READY` remains a stop point before integration. Integration/merge authority remains defined by the Project Layer and HUMAN LEAD policy.

## Consequences

### Positive

- removes repetitive task-by-task approval inside an already approved boundary;
- enables safe parallel delivery of independent task slices;
- keeps decision authority explicit and auditable;
- preserves the existing `task` mode for projects that want the legacy gate.

### Costs / risks

- a boundary must be scoped carefully;
- ORCHESTRATOR receives more execution responsibility;
- parallel branches can increase integration conflicts;
- overly broad boundaries can reduce useful human checkpoints.

## Non-goals

- no autonomous authority outside HUMAN LEAD-approved boundaries;
- no automatic model/provider switching;
- no central AI gateway;
- no new REVIEWER role;
- no removal of required verification, review, circuit breaker, or integration controls.
