# Agent Adapter Architecture v1

| Metadata | Value |
|---|---|
| Status | PROPOSAL |
| Target framework | v4.3 |
| Decision | Pending HUMAN LEAD approval |
| Scope | Agent roles, contracts, provider/tool adapters |

## 1. Purpose

Make the framework agent/provider-agnostic without changing the existing S0/S1/S2 workflow.

The framework must be able to use different AI systems for the same role without changing the normative workflow.

Examples:
- Product Agent: ChatGPT, Gemini, or another supported agent.
- ORCHESTRATOR: Claude Code, Gemini, Codex, or another supported agent.
- IMPLEMENTER: Claude Code, Copilot, Codex, Gemini, or another supported agent.

The choice of model/vendor is configuration and adapter concern, not Core workflow concern.

## 2. Problem found in v4.2

The Core is already largely vendor-neutral. However, provider-specific assumptions remain in Project Layer, Product Layer, installation/bootstrap documentation, checker registration, and some adapter wiring.

Examples found during audit:
- Product documentation explicitly names ChatGPT/GPT.
- Product handoff explicitly names Claude.
- Installation documentation assumes ChatGPT + Claude.
- Bootstrap scripts copy the Claude adapter unconditionally.
- The checker maintains a hard-coded adapter allowlist.
- The README still contains historical references to the removed OpenAI Product Agent runner.
- Claude-specific model/tool details correctly remain inside the Claude adapter.

These inconsistencies make the framework only partially pluggable.

## 3. Design principles

### 3.1 Core knows roles, not vendors

Core may define HUMAN LEAD, PRODUCT / REQUIREMENT AGENT, ORCHESTRATOR, and IMPLEMENTER.

Core must not depend on OpenAI, Anthropic, Google, GitHub, a specific model name, or a specific CLI.

### 3.2 Contracts are provider-neutral

#### Product Agent contract
Input: HUMAN IDEA and repository/project context.
Output: canonical REQ-xxx.md with status NEEDS_CLARIFICATION or READY.
Responsibilities: discovery, current/desired workflow, functional requirements, business rules, edge cases, observable acceptance criteria, scope and readiness.
Forbidden: application implementation and architecture decisions not supplied by HUMAN LEAD.

#### ORCHESTRATOR contract
Input: repository authority, READY requirement, existing project state.
Output: DRAFT task contracts.
Responsibilities: classify S0/S1/S2, detect decision gates, decompose work, select execution profile, select IMPLEMENTER, coordinate implementation/review.

#### IMPLEMENTER contract
Input: APPROVED task contract, base commit/branch, implementation authorization.
Output: implementation, verification evidence, READY report.
Responsibilities: implement inside boundary, run required verification, fix blocking findings, stop at READY or BLOCKED.

### 3.3 Adapters bind contracts to tools

An adapter answers which role(s) a tool can perform, how the role is invoked, required files/configuration, available capabilities, permission constraints, and how the tool is prevented from violating integration boundaries.

The adapter may contain vendor/model names. Core must not.

## 4. Proposed architecture

~~~text
                 AI DEV FRAMEWORK
                        |
             +----------+----------+
             |                     |
       AGENT CONTRACTS       PROJECT CONFIG
             |                     |
       +-----+-----+               |
       |     |     |               |
    PRODUCT ORCH. IMPLEMENTER      |
       |     |     |               |
       +-----+-----+---------------+
                        |
                 ADAPTER REGISTRY
                        |
       +----------------+----------------+
       |                |                |
     Gemini          Claude            Codex
     Adapter          Adapter          Adapter
       |                |                |
   provider/tool     provider/tool    provider/tool
   specifics        specifics         specifics
~~~

The same adapter may expose more than one role when its capabilities support it.

## 5. Adapter descriptor

Each adapter should eventually provide a machine-readable descriptor, for example:

~~~json
{
  "id": "gemini",
  "roles": ["product", "orchestrator", "implementer"],
  "execution": ["interactive", "local", "ci"],
  "capabilities": {
    "readRepository": true,
    "writeRepository": true,
    "shell": true,
    "git": true,
    "pullRequest": true
  }
}
~~~

This is a proposal, not yet an implemented schema. The descriptor should describe capabilities, not prescribe model superiority.

## 6. Project binding

framework.config.json should eventually bind roles to adapters.

~~~json
{
  "frameworkVersion": "4.3",
  "adapters": ["claude-code", "gemini"],
  "agents": {
    "product": "gemini",
    "orchestrator": "claude-code"
  }
}
~~~

IMPLEMENTER remains task-level because the existing framework already supports an IMPLEMENTER pool and a task-level Implementer field.

## 7. Execution profile compatibility

The architecture does not replace dual-agent, single-agent, S0/S1/S2, decision gates, task approval, implementation authorization, required verification, review, or integration ownership.

It only changes how a role is bound to a concrete agent/tool.

## 8. Adapter registry

The current checker has a hard-coded KNOWN_ADAPTERS list. v1 should replace this with adapter descriptors discovered from the framework adapter registry.

The checker should validate: adapter id is known; descriptor is structurally valid; required adapter files exist; configured role is supported by the adapter; task-level IMPLEMENTER refers to an enabled adapter.

Unknown adapters should fail closed.

## 9. Product Agent migration

The Product Agent contract should no longer say that it is inherently a ChatGPT agent. Provider-specific wording such as connected ChatGPT session or Claude handoff should become provider-neutral.

The canonical requirement artifact remains docs/product/requirements/REQ-xxx-<slug>.md. No requirement format changes are proposed.

## 10. Bootstrap and installation migration

Bootstrap should copy only adapters explicitly selected by the project. The bootstrap mechanism must not silently make Claude Code mandatory.

The existing GitHub bootstrap design remains useful because it avoids GitHub API write limits. Adapter selection is the part to change.

## 11. Backward compatibility

v4.3 should preserve existing projects as much as practical. A project using adapters: [claude-code] should continue to work.

Initial migration should be additive: introduce adapter descriptors; make checker understand descriptors; add role binding; migrate Product Layer wording; migrate bootstrap/install documentation; add Gemini adapter; keep existing Claude/Copilot/Codex adapters working.

## 12. Explicit non-goals

- Change S0/S1/S2.
- Change task lifecycle.
- Authorize autonomous implementation.
- Introduce a multi-agent swarm.
- Add a central AI gateway/API.
- Require one model family or paid provider.
- Compare model quality.
- Automatically switch models during a task.
- Introduce an independent REVIEWER role.

## 13. Security and governance boundary

Provider/tool capabilities do not override framework authority.

- Product Agent cannot authorize implementation.
- ORCHESTRATOR cannot bypass HUMAN LEAD approval.
- IMPLEMENTER cannot self-authorize a task.
- Adapter capability does not become project authority.
- Model/vendor selection does not become a decision unless explicitly approved as project policy.

## 14. Migration target for v4.3

After HUMAN LEAD approval, implementation should be treated as S2 and proceed through the normal framework process.

Expected implementation areas: adapters/<existing adapters>/adapter.json; templates/framework.config.json; templates/docs/product/; templates/docs/ai/project-profile.md; scripts/framework-check.mjs; docs/install-new-project.md; docs/install-existing-project.md; docs/mechanism.md; docs/product-requirement-agent-v1.md; tests/framework-check.test.mjs; tests/product-layer.test.mjs.

A Gemini adapter should be added only after its invocation, permissions, repository access and verification behavior are explicitly tested.

## 15. Acceptance criteria for v4.3 implementation

1. Core normative documents contain no provider/vendor-specific dependency.
2. Product Agent instructions are provider-neutral.
3. Project config can bind Product Agent and ORCHESTRATOR to enabled adapters.
4. IMPLEMENTER can be selected from the enabled adapter pool at task level.
5. Checker discovers/validates adapter descriptors instead of relying on a hard-coded provider allowlist.
6. Existing Claude Code adapter continues to pass its adapter checks.
7. Existing Copilot and Codex adapters continue to pass their checks.
8. Bootstrap does not install an unselected adapter.
9. A Gemini adapter can be enabled and passes a documented pilot.
10. Existing S0/S1/S2 workflow semantics remain unchanged.
11. Tests cover valid, missing, unknown and role-incompatible adapter configurations.
12. Documentation no longer presents ChatGPT or Claude as mandatory framework components.

## 16. Approval gate

Current status: PROPOSAL — NOT APPROVED.

No v4.3 implementation should begin until HUMAN LEAD explicitly approves this architecture and the associated decision record.