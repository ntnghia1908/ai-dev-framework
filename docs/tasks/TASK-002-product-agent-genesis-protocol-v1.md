# TASK-002: Integrate Genesis Protocol into Product Agent v1

## Status / Approval

- Status: DRAFT
- Type: CHANGE
- Change class: S2
- Owner: ORCHESTRATOR
- Execution profile: dual-agent
- Implementer: claude-code — primary framework implementation adapter
- Human Lead: HUMAN LEAD
- Base commit / branch: 691b204a1695b62ebb1d3b349c0451aef3a0b05f / proposal/product-agent-genesis-protocol-v1
- Human Lead approval: pending
- Implementation authorized: NO

## Goal

Integrate Genesis Protocol v0.1 as the standardized operating protocol of the provider-neutral Product Agent, while preserving the existing Product Agent role, REQ handoff, HUMAN LEAD authority, and framework governance.

The implementation must then dogfood the protocol on `faculty-app-platform` using the shared Auth Service idea as the first real discovery case.

## Scope

- In scope:
  - Product Agent operating protocol based on Genesis.
  - Internal Genesis states G0–G6.
  - Adaptive discovery and synthesis loop.
  - Knowledge status: KNOWN / ASSUMED / UNKNOWN / CONFLICT / DECIDED / DEFERRED.
  - Uncertainty impact classification and high-impact rule.
  - Question prioritization and one-question principle.
  - Authority/knowledge routing.
  - Existing decision-gate handling.
  - `docs/ai/project-brief.md` working artifact and its relationship to REQ.
  - READY TO PLAN readiness criteria.
  - Product Agent instructions, templates and deterministic checks needed to enforce the protocol.
  - Dogfood on `faculty-app-platform` with the shared Auth Service idea.
  - Capture dogfood findings as documented evidence for protocol refinement.
- Out of scope:
  - New Genesis framework role or adapter.
  - Architecture design for the Auth Service.
  - Database/API/library/deployment/security implementation decisions for the Auth Service.
  - Application source code.
  - ORCHESTRATOR / IMPLEMENTER workflow changes.
  - Changes to S0/S1/S2 semantics.
  - Automatic model/provider switching.
  - Product Agent local CLI/API runner.
  - Freezing additional protocol details not supported by the Genesis source or dogfood evidence.

## Authority / key decisions

- ADR-002: Product Agent Genesis Protocol v1 — PROPOSED; must be ACCEPTED before implementation.
- `core/docs/ai/workflow.md` remains authoritative for governance and HUMAN LEAD decision gates.
- `core/docs/ai/agent-adapter-contract.md` remains authoritative for the provider-neutral Product Agent role.
- Source basis: `Genesis Protocol v0.1` supplied by HUMAN LEAD.
- Dogfood evidence may refine implementation details, but may not silently change the ADR boundary.

## Implementation approach

1. After ADR-002 acceptance, update the Product Agent contract/instructions to use Genesis as its internal operating protocol.
2. Define the minimum Project Brief artifact needed to persist discovery knowledge without duplicating the formal REQ.
3. Update Product Layer templates/checkers only where required to enforce the accepted protocol.
4. Do not add a new framework role or adapter.
5. Run the Product Agent on `faculty-app-platform` with the shared Auth Service idea.
6. Record each important question as Useful / Unnecessary / Missing and each uncertainty as Ask / Assume / Defer.
7. Identify protocol gaps or unnecessary questioning from dogfood evidence.
8. If dogfood reveals a material change to the approved boundary, stop and return to HUMAN LEAD for a decision.
9. Produce the final dogfood evidence and READY handoff without implementing the Auth Service.

## Acceptance Criteria

1. Product Agent has one provider-neutral Genesis operating protocol that any configured Product Agent adapter must follow.
2. Genesis is documented as an internal Product Agent protocol, not a new framework role.
3. Product Agent performs synthesis after meaningful user answers instead of following a fixed questionnaire.
4. Product Agent explicitly tracks KNOWN / ASSUMED / UNKNOWN / CONFLICT / DECIDED / DEFERRED knowledge states.
5. Product Agent classifies uncertainty by impact and does not ask low-impact questions merely for completeness.
6. Product Agent prioritizes questions by impact, uncertainty, dependency and expected rework avoidance.
7. Product Agent follows the one-question principle except for tightly coupled decisions.
8. Product Agent routes questions according to required domain/technical/product knowledge without creating a new role hierarchy.
9. Existing decision gates remain HUMAN LEAD decisions.
10. `READY TO PLAN` is defined as zero unresolved high-impact uncertainty sufficient for meaningful planning, not 100% requirements or architecture completeness.
11. Project Brief and REQ have distinct, documented roles.
12. Product Agent cannot create application code, tasks, authorize implementation, or bypass HUMAN LEAD.
13. Dogfood on `faculty-app-platform` is completed using the shared Auth Service idea without implementing Auth.
14. Dogfood records Useful / Unnecessary / Missing questions and Ask / Assume / Defer uncertainty handling.
15. Any material protocol change discovered during dogfood is stopped at the appropriate HUMAN LEAD decision gate.
16. Required verification passes before the task reaches READY.

## Required verification

- Framework checker — PASS.
- Product Layer deterministic tests — PASS.
- Any new Project Brief/checker validation tests — PASS.
- Diff review against ADR-002 — no blocking finding.
- Dogfood evidence review — all questions and material uncertainties classified.
- Confirm no application source, Auth architecture, database schema, API design or implementation was introduced by the framework task.

## Manual test checklist (Tech Lead)

- [ ] No database, security model or public API contract change in the framework implementation.
- [ ] Genesis is an internal Product Agent protocol, not a new adapter/role.
- [ ] Low-impact uncertainty can be recorded without forcing a question.
- [ ] High-impact uncertainty triggers a targeted question or HUMAN decision.
- [ ] Decision-gate uncertainty stops for HUMAN decision.
- [ ] READY TO PLAN is distinct from approval.
- [ ] Auth Service dogfood stops before architecture/implementation.

## Result

- Main changes:
- Tests:
- Review:
- Important findings / decisions:
- Known limitations:
- Dogfood evidence:
- PR:
