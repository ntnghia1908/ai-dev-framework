# TASK-001: Implement Agent Adapter Architecture v1 (v4.3)

## Status / Approval

- Status: READY
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

- node --test — PASS on GitHub Actions run 37611511126 (36/36 tests).
- Framework checker paths are exercised by the test suite across Claude Code, Copilot, Codex, ChatGPT bindings, invalid descriptors and invalid role bindings.
- Review provider-specific references: Core role/adapter contract remains provider-neutral; provider-specific invocation remains in adapters.
- Diff review against ADR-001 and task boundary: no unrelated application changes.

## Manual test checklist (Tech Lead)

- [x] No database, security model or public API contract change.
- [x] Minimal project with Claude Code enabled passes checker.
- [x] Claude Code + Copilot + Codex enabled passes checker.
- [x] Invalid role binding and invalid IMPLEMENTER are rejected.

## Result

- Main changes: provider-neutral role contract; descriptor schema; ChatGPT/Claude/Copilot/Codex descriptors; config role bindings; checker validation; Product Layer/bootstrap/install migration; v4.3 metadata; CI test workflow.
- Tests: GitHub Actions Framework Tests run 22 — 36/36 PASS.
- Review: diff-first review completed; scope aligned with ADR-001; no blocking finding.
- Important findings / decisions: implementation remains adapter-driven; no automatic switching or authority changes.
- Known limitations: Codex remains an unverified operational adapter as documented; adapter capability descriptors do not replace tool-specific security controls.
- PR: https://github.com/ntnghia1908/ai-dev-framework/pull/4
