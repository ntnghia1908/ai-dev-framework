# TASK-002: Implement Boundary Authorization & Bounded Parallel Implementers v1

## Status / Approval

- Status: IN_PROGRESS
- Type: CHANGE
- Change class: S2
- Owner: HUMAN LEAD
- Human Lead: HUMAN LEAD
- Execution profile: single-agent
- Authorization mode: boundary
- Authorization source: ADR-002 — Boundary Authorization & Bounded Parallel Implementers v1
- Parallel group: P0
- Owned paths: framework Core, templates, checker, tests and framework documentation
- Dependencies: TASK-001
- Base commit / branch: v4.3 main / feat/v4.4-boundary-authorization-parallel
- Human Lead approval: accepted
- Implementation authorized: YES

Lifecycle: `DRAFT → IN_PROGRESS → READY` for boundary-authorized framework work.

## Goal

Update the Framework Core from v4.3 to v4.4 so a HUMAN LEAD-approved implementation boundary can authorize execution without per-task approval, while allowing bounded parallel IMPLEMENTER instances for independent task slices.

## Scope

- In scope:
  - governance mode `task` / `boundary`;
  - Implementation Authorization Boundary;
  - inherited task authorization evidence;
  - 1–3 bounded parallel IMPLEMENTER instances;
  - task contract metadata for authorization, ownership, dependencies and parallel groups;
  - checker validation;
  - templates and documentation;
  - regression tests.
- Out of scope:
  - vendor/model changes;
  - automatic provider switching;
  - central AI gateway;
  - new REVIEWER role;
  - changing decision-gate authority;
  - changing integration/merge authority.

## Authority / key decisions

- ADR-002 — Boundary Authorization & Bounded Parallel Implementers v1 — ACCEPTED 2026-10-08.
- Existing v4.3 Agent Adapter Architecture remains authoritative for role/adapters.
- Decision gates remain unchanged unless a decision is already covered by the recorded HUMAN LEAD boundary.

## Implementation approach

1. Add governance configuration and task authorization semantics to Core workflow.
2. Extend dual-agent execution profile to permit bounded task-level fan-out.
3. Extend adapter role contract and task template.
4. Update checker and tests.
5. Align mechanism / Product Agent / architecture documentation.
6. Verify framework structure and regression suite.
7. Review diff-first against ADR-002 and report READY.

## Acceptance Criteria

1. Core workflow documents `task` and `boundary` authorization modes.
2. Boundary-authorized tasks do not require a separate `APPROVE TASK` gate.
3. Boundary-authorized tasks record explicit authorization source.
4. Decision gates remain mandatory outside the approved boundary.
5. `dual-agent` supports 1–3 IMPLEMENTER instances with disjoint ownership and separate worktrees.
6. Project configuration validates `maxParallelImplementers` in the range 1–3.
7. The starter template defaults to boundary authorization with maximum parallelism 3.
8. Legacy `task` authorization remains supported.
9. Checker tests cover valid/invalid governance and authorization combinations.
10. Framework version/history/changelog are internally consistent.
11. No vendor-specific authority is introduced into Core.
12. Required verification passes.

## Required verification

- `node --test` — framework tests PASS.
- `node scripts/framework-check.mjs` — structural checker PASS on a representative framework snapshot.
- Diff review against ADR-002 — no scope or authority expansion.

## Manual test checklist (Tech Lead)

- [ ] Confirm boundary mode removes repetitive per-task approval while preserving decision gates.
- [ ] Confirm a 3-task independent graph can be assigned to 3 IMPLEMENTER instances.
- [ ] Confirm overlapping owned paths are serialized.

## Result

- Main changes: pending.
- Tests: pending.
- Review: pending.
- Important findings / decisions: none.
- Known limitations: multi-IMPLEMENTER orchestration remains adapter/execution-surface specific; Core defines governance, not a universal process runner.
- PR: pending.
