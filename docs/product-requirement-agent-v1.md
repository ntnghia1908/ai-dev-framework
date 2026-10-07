# Product / Requirement Agent v1

Status: DESIGN PROPOSAL
Target framework: AI Dev Framework v4.2
Goal: add IDEA → REQUIREMENT without changing the existing S0/S1/S2 execution core.

## 1. Design principle

The new layer owns discovery and requirement quality. It does not own architecture or implementation.

IDEA → DISCOVERY → REQUIREMENT → READINESS GATE → Claude ORCHESTRATOR → TASK CONTRACT → existing approval/execution flow

READY means ready for development planning. READY never means implementation authorized.

## 2. Canonical files

Project layer:

docs/product/requirements/REQ-<number>-<slug>.md

Kit template:

templates/docs/product/README.md
templates/docs/product/requirements/_template.md

Product Agent:

templates/docs/product/PRODUCT_AGENT.md

Claude handoff adapter:

adapters/claude-code/REQUIREMENT_HANDOFF.md
adapters/claude-code/workflows/requirement-to-task.yml

Deterministic gate:

scripts/product-check.mjs

## 3. Product / Requirement Agent

Role: PRODUCT / REQUIREMENT AGENT.

Responsibilities:
1. Understand the real user problem.
2. Identify actors and current workflow.
3. Define the desired outcome and user flow.
4. Capture functional requirements, business rules and edge cases.
5. Write observable acceptance criteria.
6. Make scope explicit.
7. Return NEEDS_CLARIFICATION or READY.

Forbidden:
1. Writing application code.
2. Choosing architecture or libraries.
3. Inventing database design or API design.
4. Treating assumptions as facts.
5. Marking READY while material questions remain.

## 4. Two-layer interview

Layer 1: end user discovery
- What are you trying to accomplish?
- What do you do today?
- What is painful or slow?
- What would the ideal workflow look like?

Layer 2: product-owner clarification
- Who is in scope?
- What business rules matter?
- What must not happen?
- What is explicitly out of scope?
- Which unknowns are blocking?

The agent should ask small batches of high-value questions, normally 2–5 at a time.

## 5. Requirement contract

Frontmatter:

id: REQ-001
title: short title
status: DRAFT | NEEDS_CLARIFICATION | READY | OBSOLETE
version: 1
owner: person or team
created: YYYY-MM-DD
updated: YYYY-MM-DD

Required sections:
1. Problem
2. Goal
3. Actors
4. Current workflow / context
5. Desired workflow / outcome
6. Functional requirements
7. Non-functional requirements
8. Business rules / constraints
9. Edge cases / failure behavior
10. Acceptance criteria
11. Out of scope
12. Assumptions
13. Open questions
14. Readiness
15. Traceability

Functional requirements use FR-001, FR-002, etc.
Acceptance criteria use AC-001, AC-002, etc.

Acceptance criteria should prefer Given / When / Then and must describe observable results.

## 6. Readiness gate

A requirement can be READY only when:
1. Problem is understandable.
2. Goal is observable and non-technical.
3. Actors are identified.
4. Current context is sufficient.
5. Desired workflow is clear.
6. Functional requirements are explicit.
7. Relevant business rules are recorded.
8. Relevant edge cases are recorded.
9. Acceptance criteria are testable.
10. Out-of-scope is explicit.
11. Open questions are empty, or only contain explicitly deferred non-blocking assumptions accepted by HUMAN LEAD.

Otherwise status is NEEDS_CLARIFICATION.

The deterministic checker should validate the document structure and the READY conditions. Model judgment is still required for semantics, so the checker is a gate, not a replacement for review.

## 7. GPT output strategy

For ChatGPT use, the Product Agent instructions live in `docs/product/PRODUCT_AGENT.md`. In a ChatGPT session with repository write access, ChatGPT reads the connected repository, interviews HUMAN LEAD, then creates the canonical requirement file, branch, commit and GitHub PR directly.

No local CLI, OpenAI API key, or local Git wrapper is required.

The Markdown requirement remains the repository source of truth.

## 8. Claude handoff

When a READY requirement is committed to a project PR, the Claude workflow is triggered by a path filter for docs/product/requirements/REQ-*.md.

Claude acts as ORCHESTRATOR only.

Claude must:
1. Read AGENTS.md.
2. Read project profile and current state.
3. Read the READY requirement.
4. Classify resulting work as S0/S1/S2.
5. Detect decision gates.
6. Split the requirement into vertical task slices.
7. Create task contracts from the existing task template.
8. Add Requirement and Requirement elements traceability to each task.
9. Keep generated tasks at Status DRAFT.
10. Keep Implementation authorized: NO.
11. Stop and report what HUMAN LEAD must approve.

Claude must not implement code during the handoff step.

## 9. GitHub automation

Recommended trigger:

pull_request: opened, synchronize, reopened
paths: docs/product/requirements/REQ-*.md

Why pull_request instead of push to main:
- GPT can create or update a requirement branch/PR.
- Claude can add generated task contracts to that same PR.
- No product automation needs permission to push product changes directly to main.
- The generated task contracts remain DRAFT.

The workflow should fail closed when the deterministic requirement checker is missing or when no READY requirement is found.

The Claude Code GitHub Action currently supports a prompt, prompt file, CLI arguments, GitHub permissions and additional permissions. Its documentation also states that it runs on the GitHub runner and can modify repository content according to the workflow permissions.

## 10. Existing framework compatibility

No new task lifecycle is introduced.

Requirement lifecycle:
DRAFT → NEEDS_CLARIFICATION → READY

Task lifecycle remains:
DRAFT → APPROVED → IN_PROGRESS → READY

The existing task contract remains the canonical owner for:
- Change class
- Scope
- Execution profile
- Required verification
- Implementation authorization
- Integration state

## 11. Traceability

Recommended task fields:

Requirement: REQ-001
Requirement elements:
- FR-001
- FR-002
- AC-001
- AC-002

This creates the chain:

IDEA → REQ-001 → FR/AC → TASK-001 → verification → implementation

## 12. v1 scope

Included:
- Product / Requirement Agent behavior.
- Canonical REQ template.
- Readiness gate.
- Claude requirement-to-task handoff.
- Deterministic requirement checker.
- GitHub Action example.

Not included:
- Automatic implementation without task approval.
- Automatic architecture decisions.
- Changes to Core v4.2 normative workflow.
- Multi-agent product discovery.

## 13. Future v4.3 decision

After a real pilot, HUMAN LEAD can decide whether this Product / Requirement flow belongs in Framework Core.

Until then it should remain a Project Layer / adapter capability so v4.2 stays stable.