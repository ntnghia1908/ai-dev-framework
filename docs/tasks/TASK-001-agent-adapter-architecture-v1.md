# TASK-001: Implement Agent Adapter Architecture v1 (v4.3)

| Field | Value |
|---|---|
| Status | APPROVED |
| Type | Framework architecture |
| Change class | S2 |
| Owner | ORCHESTRATOR |
| Execution profile | dual-agent |
| Implementer | claude-code |
| Human Lead | HUMAN LEAD |
| Base commit | 2ac6e20d82fe60e0984f0234f4747bfb1edd933f |
| Base branch | proposal/agent-adapter-architecture-v1 |
| Implementation authorized | YES |
| Decision | ADR-001 — ACCEPTED |

## Objective

Implement the approved Agent Adapter Architecture v1 as Framework v4.3 while preserving the existing governance and execution workflow.

## Scope

- Introduce provider-neutral agent role contracts.
- Define and validate machine-readable adapter descriptors.
- Add project-level role-to-adapter binding in `framework.config.json`.
- Keep IMPLEMENTER selectable per task from the enabled adapter pool.
- Migrate Product Layer and installation/bootstrap documentation away from provider assumptions.
- Update checker/validation for adapter descriptors and role compatibility.
- Preserve compatibility of Claude Code, Copilot and Codex adapters.
- Keep existing S0/S1/S2 rules, decision gates, task lifecycle, verification and integration ownership unchanged.
- Do not add automatic model switching, autonomous authorization, a central AI gateway, or an independent REVIEWER role.

## Acceptance Criteria

1. Core workflow remains provider-neutral and does not hard-code vendor/model names.
2. Agent role contracts are explicitly separated from provider/tool adapters.
3. Adapter descriptors have a defined schema and are machine-validatable.
4. `framework.config.json` can bind Product Agent and ORCHESTRATOR roles to enabled adapters.
5. IMPLEMENTER selection remains task-level and constrained by the project's enabled adapters.
6. Product Layer, installation and bootstrap documentation no longer treat ChatGPT/Claude as implicit framework requirements.
7. Claude Code, Copilot and Codex adapters continue to pass framework validation.
8. Checker tests cover valid/invalid adapter descriptors and role compatibility.
9. Existing Product Agent governance remains intact.
10. No implementation bypasses HUMAN LEAD approval or changes S0/S1/S2 semantics.
11. Framework version/history/changelog are updated consistently for v4.3.
12. Required verification passes before the task can reach READY.

## Constraints

- ADR-001 is the governing architectural decision.
- No unrelated refactor.
- No provider replacement or global default switch unless separately approved.
- Implementation is authorized by HUMAN LEAD.

## Verification

At minimum:

- Run framework checker.
- Run existing framework and Product Layer tests.
- Add/update tests for adapter registry/configuration validation.
- Review diff for accidental provider hard-coding in Core.
- Verify documentation references and migration consistency.

## Implementation gate

HUMAN LEAD approved TASK-001 and authorized implementation:

`Implementation authorized: YES`

The IMPLEMENTER may now begin implementation within the approved scope.