# Agent Adapter Contract

| Metadata | Value |
|---|---|
| Status | CURRENT |
| Version | 4.3 |
| Canonical owner | Framework Core |

## Purpose

Framework Core defines **roles and contracts**, not AI vendors or models.

The supported role identifiers are:

- `product` — PRODUCT / REQUIREMENT AGENT.
- `orchestrator` — ORCHESTRATOR.
- `implementer` — IMPLEMENTER.

An adapter may implement one or more roles. A project enables adapters in `framework.config.json`, and role bindings select an enabled adapter.

## Role contracts

### Product Agent

Input: human IDEA plus repository context.

Output: requirement artifact `docs/product/requirements/REQ-<number>-<slug>.md` and the repository handoff required by the Product Layer.

Must:

- interview the human;
- distinguish FACT / ASSUMPTION / UNKNOWN;
- define observable product requirements and acceptance criteria;
- stop at READY for development planning.

Must not:

- choose architecture, database, API, library, deployment or security design;
- authorize implementation.

### ORCHESTRATOR

Input: READY requirement or approved task context.

Output: task contracts, execution plan, delegation and review state.

Must:

- classify S0/S1/S2;
- detect decision gates;
- create task contracts;
- keep implementation unauthorized until HUMAN LEAD approval;
- review implementation against task contract and verification.

Must not bypass HUMAN LEAD authority.

### IMPLEMENTER

Input: approved task contract, matching base commit/branch and `Implementation authorized: YES`.

Output: implementation, verification evidence and READY report.

Must:

- work only inside task scope;
- run required verification;
- stop at READY after review convergence.

Must not self-authorize, merge, or silently expand scope.

## Adapter descriptor

Each adapter exposes `adapter.json` with this minimum contract:

```json
{
  "schemaVersion": "1",
  "id": "adapter-id",
  "displayName": "Human readable name",
  "roles": ["product", "orchestrator", "implementer"],
  "execution": ["interactive", "local", "ci"],
  "capabilities": {
    "readRepository": true,
    "writeRepository": false,
    "shell": false,
    "git": false,
    "pullRequest": false
  }
}
```

The descriptor declares capability facts only. It does not grant authority. Framework workflow, project policy and task contracts remain authoritative.

## Project binding

`framework.config.json` may contain:

```json
{
  "adapters": ["chatgpt", "claude-code"],
  "agents": {
    "product": "chatgpt",
    "orchestrator": "claude-code"
  }
}
```

Every configured role binding must point to an enabled adapter whose descriptor lists that role.

IMPLEMENTER remains task-level: the task contract records the selected adapter and HUMAN LEAD approval covers that choice.

## Compatibility

Omitting `agents` preserves v4.2 configuration compatibility. In that case no role binding is inferred by Core. Adapters remain selectable according to the existing project profile and task contract.

No automatic provider/model switching is defined by this contract.
