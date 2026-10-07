# TASK-001: Implement Agent Adapter Architecture v1 (v4.3)

## Status / Approval

- Status: IN_PROGRESS
- Type: CHANGE
- Change class: S2
- Owner: ORCHESTRATOR
- Execution profile: dual-agent
- Implementer: claude-code — primary framework implementation adapter
- Human Lead: HUMAN LEAD
- Base commit / branch: 2ac6e20d82fe60e0984f0234f4747bfb1edd933f / proposal/agent-adapter-architecture-v1
- Human Lead approval: accepted
- Implementation authorized: YES

## Goal

Implement the approved Agent Adapter Architecture v1 as Framework v4.3 while preserving the existing governance and execution workflow.

## Scope

- In scope:
  - Provider-neutral role contracts.
  - Machine-readable adapter descriptors and validation.
  - Project-level Product Agent / ORCHESTRATOR bindings.
  - Task-level IMPLEMENTER adapter validation.
  - Product Layer, installation and bootstrap migration.
  - Claude Code, Copilot and Codex compatibility.
  - v4.3 version/history/changelog updates and tests.
- Out of scope:
  - Changes to S0/S1/S2 semantics.
  - Automatic model/provider switching.
  - Autonomous authorization.
  - Central AI gateway.
  - Independent REVIEWER role.
  - Unrelated refactors.

## Authority / key decisions

- ADR-001: Agent Adapter Architecture v1 — ACCEPTED by HUMAN LEAD.
- core/docs/ai/workflow.md remains authoritative for governance and approval.
- Adapter descriptors declare capabilities; they do not grant authority.

## Implementation approach

1. Add provider-neutral role/adapter contract and descriptor schema.
2. Add descriptors for supported adapters, including the connected ChatGPT Product Agent adapter.
3. Update project config and checker to validate enabled adapters, role bindings and task-level IMPLEMENTER compatibility.
4. Migrate Product Layer and bootstrap/install documentation.
5. Update tests and v4.3 metadata.
6. Run full verification and review the diff against ADR-001.

## Acceptance Criteria

1. Core workflow remains provider-neutral and does not hard-code vendor/model names.
2. Agent role contracts are explicitly separated from provider/tool adapters.
3. Adapter descriptors have a defined schema and are machine-validatable.
4. framework.config.json can bind Product Agent and ORCHESTRATOR roles to enabled adapters.
5. IMPLEMENTER selection remains task-level and constrained by the project's enabled adapters.
6. Product Layer, installation and bootstrap documentation no longer treat ChatGPT/Claude as implicit framework requirements.
7. Claude Code, Copilot and Codex adapters continue to pass framework validation.
8. Checker tests cover valid/invalid adapter descriptors and role compatibility.
9. Existing Product Agent governance remains intact.
10. No implementation bypasses HUMAN LEAD approval or changes S0/S1/S2 semantics.
11. Framework version/history/changelog are updated consistently for v4.3.
12. Required verification passes before the task can reach READY.

## Required verification

- node --test — framework and Product Layer tests pass.
- node scripts/framework-check.mjs — framework structure and adapter contracts pass.
- Review provider-specific references and confirm they are confined to adapters/project documentation.
- Review diff against ADR-001 and this task boundary.

## Manual test checklist (Tech Lead)

- [ ] No database, security model or public API contract change.
- [ ] Verify a minimal project with Claude Code enabled passes checker.
- [ ] Verify Claude Code + Copilot + Codex enabled passes checker.
- [ ] Verify invalid role binding and invalid IMPLEMENTER are rejected.

## Result

- Main changes:
- Tests:
- Review:
- Important findings / decisions:
- Known limitations:
- PR:
