# ADR-003 — Adaptive Native Dual-Agent & Optional Cross-Agent Review

| Metadata | Value |
|---|---|
| Status | ACCEPTED |
| Date | 2026-10-18 |
| Decision owner | HUMAN LEAD (accepted 2026-10-18) |
| Scope | `ai-dev-framework` starter kit: Project Layer, Tool Adapters, bootstrap, tests |
| Source baseline | `ntnghia1908/ai-dev-framework`, `main` at `932a9416782b8e9fb439c1b2e6dc9870ca33ecf3` |
| Protocol | Framework Core v4.4, **unchanged** |
| Related | ADR-001, ADR-002, merged PR #7 (`FW-CODEX-ORCH-01`) |
| Implementation authorization | **NO.** Accepting the ADR does not authorize implementation, commit, push, PR, merge, or project migration. |

## 1. Context and objective

The HUMAN LEAD uses both Claude Code and Codex. A live Codex→Claude subprocess pilot encountered network and CLI permission blockers without completing implementation. The chosen direction is **Hybrid A+B**:

- **A: Native dual-agent by default.** Opening Claude Code or Codex selects the currently opened tool as the *proposed* ORCHESTRATOR and delegates to a **native subagent of that same tool**. This is a tool-specific operational convention, not a new implicit Framework Core role binding.
- **B: Optional cross-provider read-only review.** When useful, the other tool independently reviews local diffs or a PR, asynchronously, without taking ownership as a second writer.
- **Auto-adapt and ask only when necessary.** No routine tool-choice form; ask only for genuine authorization, task ownership, binding, profile, permission, or integration decisions.

Keep the existing `single-agent` profile available. No central gateway, background router, nested cross-provider CLI by default, daemon, new `reviewer` descriptor role, or autonomous model switching.

## 2. Verified baseline versus runtime hypotheses

At the source baseline above:

1. Core v4.4 already defines `single-agent`/`dual-agent`, `task`/`boundary`, S0–S2, HUMAN LEAD decision gates, one writer per task, independent ORCHESTRATOR review, tests, worktree rules for parallelism, and short session handoff (§9).
2. Both Claude Code and Codex adapter descriptors have `roles: ["orchestrator", "implementer"]`. **PR #7 already resolved** the earlier review finding that Codex lacked `orchestrator`; the negative test uses `copilot` instead.
3. The checker accepts a missing `agents.orchestrator`; it validates a binding when present. It accepts optional additional task fields, but **does not verify real delegation, permissions, worktree separation, authorization semantics, or handoff safety**.
4. Claude's kit subagent exists at `.claude/agents/implementer.md`, with `model: sonnet`. The actual model selected for a main Claude session (e.g. Opus) is a runtime/user setting.
5. The default template **already uses** `governance.taskAuthorization = "boundary"` and `governance.maxParallelImplementers = 3`, with `agents.product = "chatgpt"` and `agents.orchestrator = "claude-code"`.
6. Codex native subagents (including a built-in worker) and project-scoped custom agents are documented features, but **this user's exact CLI behavior, model availability, permissions, and delegated execution remain unpiloted**. Multiple threads share workspace context unless isolation is explicitly established; a subagent thread is not a Git worktree.

The proposed **Sol → Sol** mapping is conditional on runtime availability and evidence; a lighter **Luna** implementer is *future experimental work*. Neither model string nor account entitlement is treated as verified in this ADR.

## 3. Accepted architectural decisions

### D1 — Default `dual-agent`, adaptive active CLI

New projects *prefer* `dual-agent` in their Project Profile. On opening Claude Code or Codex, the tool uses its existing project bootstrap and proposes itself as the active ORCHESTRATOR **only if** its adapter is enabled, supports `orchestrator` and `implementer`, and the project/task policy allows it. The IMPLEMENTER is a native subagent of the same tool.

- No fixed `agents.orchestrator` is set for **new projects**. Existing fixed bindings are authoritative: opening a different CLI must **STOP for HUMAN LEAD decision**, not silently override the binding.
- The execution profile of an existing approved task never changes solely because another CLI opens. If native delegation is unavailable, request authorization for `single-agent` or another permitted execution path; never silently downgrade.
- A `dual-agent` task requires actual delegated execution and a distinct ORCHESTRATOR review, even when parent and worker use the same model.

### D2 — Native delegation is default; preserve PR #7 flows as optional

| CLI opened | ORCHESTRATOR | Native IMPLEMENTER | Pilot requirement |
|---|---|---|---|
| Claude Code | Main session, preferred **Opus** when available | Existing native `implementer` subagent, preferred **Sonnet** | Verify actual main/subagent model and delegation evidence |
| Codex | Main session, preferred **Sol** when available | **Built-in native worker**, initially inheriting main-session model | Verify CLI/version, actual worker thread, model, permissions and review |

**Phase 1 excludes creating `.codex/config.toml` or `.codex/agents/*.toml`.** For Codex Pilot P3 use its built-in worker and a bounded delegation prompt described in the Codex README. No hard-coded Sol model ID until the runtime supports and reports it. A custom Codex implementer configuration, Sol→Luna routing, or lower-cost model trial requires a **separate approved task after P3**.

Existing PR #7 alternatives remain documented but are **not the default**:

- Codex ORCHESTRATOR → Claude Sonnet via **manual human-mediated handoff**: optional cross-provider execution mode; it is **not** recursive CLI invocation.
- Codex as IMPLEMENTER via `codex exec`: optional adapter execution mode, subject to its own permission/runtime verification.
- Codex launching `claude -p` (or Claude launching `codex exec`) as a nested subprocess: prior experimental route, **not promoted for production use** by ADR-003.

Place the **native dual-agent path first** in adapter guidance and label the optional/unpiloted paths accurately. Preserve existing Claude ORCHESTRATOR and external Claude IMPLEMENTER mappings in PR #7.

### D3 — One writer per task; concurrency ceiling 3, operational parallelism 1

The new template retains `maxParallelImplementers = 3` as the **configured upper bound**, not a spawn count. **Actual write concurrency is 1 until a separate pilot proves** each IMPLEMENTER uses its *own* branch/worktree, disjoint owned paths, satisfied dependencies and independent verification, as required by Core §5.

- Add this operational restriction to `templates/docs/ai/project-profile.md` §7. Record the verification and permission evidence there (or link an approved pilot task); HUMAN LEAD authorizes increasing actual concurrency.
- Native subagents share parent process permissions; prompts, model labels and `/subagents` thread separation alone do not enforce filesystem boundaries.
- **No parallel-writing pilot in ADR-003's initial implementation.** Worktree-isolated parallel execution requires a later authorized task.

### D4 — Portable task state and approved handoff

- `AGENTS.md` is the vendor-neutral authority entry point. Preserve `CLAUDE.md` exactly as the minimal `@AGENTS.md` bridge. Use project profile, task contract, Git and tests as state; do not depend on transcripts or a lock service.
- Add the **optional** task field `Orchestrator: claude-code` or `Orchestrator: codex`; **do not introduce `Active adapter`**. Keep `Implementer: claude-code — native subagent implementer` or `Implementer: codex — native worker` for `dual-agent` tasks. For an approved `single-agent` task, the optional `Orchestrator` field may still identify the active CLI; do not require an `Implementer` field. `Owner` stays a human/organizational owner, not a model.
- Add an optional short `## Handoff` note with outgoing/incoming ORCHESTRATOR, approved transfer source, phase, blocker and next action; reuse the handoff prompt of Core workflow §9 (≤ ~10 lines). No independent handoff protocol or mandatory checker field. Older contracts remain valid.
- Switching CLI **between independent tasks** uses repository bootstrap and the new task's authorization. Switching **mid-task** requires an explicit HUMAN LEAD approval or an approved transfer policy. The approved boundary remains valid **regardless of tool** unless that boundary explicitly limits the agent/tool; changing tool does not create new authority.
- Before takeover verify approved boundary, task status/assignment, branch/base/HEAD, `git status --short --untracked-files=all`, `git worktree list`, tracked/untracked changes and verification evidence. HUMAN LEAD (or other reliable operating evidence) must confirm **the outgoing session has stopped**; Git cannot prove session termination. Record HEAD and working-tree state at handoff and ensure they have not unexpectedly changed before takeover. Ambiguous writer or conflicting ownership ⇒ STOP/BLOCKED.

### D5 — Optional read-only cross-agent review

Mandatory review remains with the task's native ORCHESTRATOR: **contract → diff (including untracked) → AC → independently rerun required verification → bounded fixes → READY/BLOCKED**. If the ORCHESTRATOR cannot run verification, record that limitation and do not claim independent PASS.

An optional second provider may review a local diff or PR **in a tool-enforced read-only session**. The reviewer has no write ownership and should report findings with evidence/severity, not edit files. When possible compare HEAD, Git status and hashes of tracked **and untracked** files before/after review. A prompt saying “do not edit” is not a sandbox. **Initial pilot must not post GitHub comments, create/update PRs, commit, push or merge**; GitHub interaction beyond a read-only review requires separate authorization. Pilot both directions (Claude→Codex and Codex→Claude).

### D6 — New-project defaults; no automatic legacy migration

**Target defaults** (other existing `framework.config.json` keys remain unchanged):

```json
{
  "frameworkVersion": "4.4",
  "adapters": ["chatgpt", "claude-code", "codex"],
  "agents": { "product": "chatgpt" },
  "governance": {
    "taskAuthorization": "boundary",
    "maxParallelImplementers": 3
  }
}
```

**Relative to the current template, change only `adapters` and `agents`**: add `codex` and omit the fixed `agents.orchestrator`. `boundary/3` is **already the default**, so do not rewrite it unnecessarily. Preserve ChatGPT Product Agent and `requiredFiles`, `requiredTokens`, `taskDir`, `decisionDir`.

`boundary` is a *governance mode*, **not** an authorization grant. A newly bootstrapped project has **no approved implementation boundary** until HUMAN LEAD explicitly defines and authorizes one; it must **STOP before modifying project source**. HUMAN LEAD may switch to `task` through a separately approved policy change and authorization audit. Neither switching CLI nor bootstrap can silently alter mode or authority.

Local/bootstrap GitHub new-project paths must install descriptors for `chatgpt`, `claude-code`, `codex` and Claude native files. No `.codex/*.toml` files in Phase 1. Existing v4.4 projects retaining fixed Claude binding or `task`/`boundary` and their task contracts remain valid without migration. `youtube-auto-short` v4.2 migration requires its own ADR/task and approval.

### D7 — Preserve Core v4.4 and VERSION

Do **not** modify `core/docs/ai/*`, `scripts/framework-check.mjs`, descriptor schema, `VERSION`, `templates/CLAUDE.md`, ADR-001/ADR-002. Record kit/template/adapter changes as a **dated entry under v4.4** in `CHANGELOG.md`. New release numbering or metadata-only Core changes need a separate version-policy decision. Checker need not validate the optional `Orchestrator` / `## Handoff` fields in this phase.

## 4. Minimal implementation impact — PROPOSAL ONLY

| In scope of a later separately approved S2 task | Minimal modification |
|---|---|
| `templates/framework.config.json` | Add `codex` adapter, remove fixed `orchestrator` binding only |
| `templates/AGENTS.md` | Few lines pointing to adaptive native bootstrap and existing authority |
| `templates/docs/ai/project-profile.md` | §7 preferred dual-agent/native mapping, handoff and operational parallel=1 rule |
| `templates/docs/tasks/_template.md` | Optional `Orchestrator` field and small `## Handoff` pointer to §9 |
| `adapters/codex/README.md` | Native default at top; built-in worker delegation; retain/manual-label PR #7 alternatives; runtime evidence limitations |
| `scripts/bootstrap-project.sh`, `bootstrap/github/framework-bootstrap.yml` | Install Codex descriptor alongside existing ChatGPT/Claude; preserve new-project/bootstrap consistency |
| `tests/framework-check.test.mjs` and minimal bootstrap test | Adapt fixture helper to allow **no** orchestrator binding; assert new defaults and legacy bindings both PASS; test bootstrap artifacts safely |
| `docs/install-new-project.md`, `docs/install-existing-project.md`, `docs/upgrade.md` | Explain native default, no silent legacy migration and versions |
| `CHANGELOG.md` | Dated v4.4 entry |
| `adapters/claude-code/README.md`, `.claude/rules/execution.md` (**optional**) | At most 1–2 lines each for review-only/handoff if needed; preserve all existing mapping and current-state import |
| `docs/decisions/ADR-003-*.md`, later task contract | Only under separate approved repository write |

**Explicitly out:** Core, checker implementation, schema, VERSION, `.codex/*.toml`, Codex descriptor, `.claude/agents/implementer.md`, `templates/CLAUDE.md`, Copilot/ChatGPT/Product Layer, ADR-001/002, `youtube-auto-short`, gateway/runner, model fallback, and parallel writing. The pre-existing boundary/task exception mismatch in `framework-check.mjs` is a **separate bug**, not in this scope.

## 5. Verification and pilots

| Step | Required evidence / acceptance |
|---|---|
| **P0 — Authorization** | Pin an up-to-date baseline SHA; accept this ADR; separately approve S2 task and exact owned paths. No repository changes before authorization. |
| **P1 — Tests/config** | `node --test` PASS. New adopted fixture with 3 descriptors, product-only binding, `boundary/3` passes checker; legacy v4.4 fixtures (Claude-bound with `task` mode **and** Claude-bound with `boundary/3`) pass unchanged; invalid binding still fails. Test helper must **not** auto-insert Claude orchestrator for no-binding fixture. |
| **P1b — Bootstrap** | Local bootstrap in isolated empty fixture produces required three adapters/native Claude files. GitHub bootstrap equivalence verified safely in an isolated test; never run its deletion/commit sequence on a real user repository without explicit authorization. |
| **P2 — Claude native** | Approved S1: evidence of actual Claude native subagent invocation (session ID/transcript/tool records), actual main/subagent model, authorized owned paths, required verification PASS **rerun independently by ORCHESTRATOR**, diff/untracked in scope, no unauthorized changes. Self-claim is insufficient. |
| **P3 — Codex native** | Separate clean equivalent S1: built-in Codex worker thread visible in `/subagents` or run evidence, actual model ID and version, authorization/permissions, independent ORCHESTRATOR verification, diff/untracked in scope, no nested CLI. No `.codex/*.toml` yet. |
| **P4 — Negative gates** | In new project, `boundary` mode but **no approved boundary** ⇒ STOP before writes. Also fixed binding to other tool, unapproved handoff, stale base, or unexplained untracked changes ⇒ STOP/BLOCKED; record unchanged workspace. |
| **P5 — Cross-tool handoff** | Explicit approved Claude→Codex mid-task transfer; outgoing session confirmed closed by HUMAN LEAD/operational evidence; same boundary, profile, branch/base; HEAD and working-tree snapshot recorded at handoff and matched at takeover; no overlapping writers. |
| **P6 — Cross-review** | Both directions, first on local diff with actual tool **read-only** permission confirmed at runtime. No GitHub comments/PR mutations in pilot. Independent findings vs self-review; tracked/untracked hashes, HEAD and Git status unchanged. |
| **P7 — HUMAN LEAD decision** | Evaluate time-to-READY, manual interventions, extra findings, fix rounds, verified models, usage/quota and permission limitations. Decide later tasks/release/migration separately. |

**Post-P7 follow-up tasks, each independently authorized:** custom `.codex/agents/implementer.toml`, Sol→Luna S1 quality/cost trial, worktree-isolated parallel subagent writing, optional GitHub review automation, `youtube-auto-short` migration. The configuration cap of 3 is not evidence that parallel execution is ready.

## 6. Compatibility and non-goals

- Existing project-level role bindings, governance mode, tasks and profiles remain authoritative; new defaults affect *new* adopted projects only.
- The optional `Orchestrator`/`## Handoff` additions do not impose checker-required metadata on legacy task contracts. Existing accepted tasks may be continued without retroactive migration.
- An unavailable model, unsupported native worker or denied permission must produce a truthful BLOCKED result or an approved alternative. No silent profile/agent switch and no fictitious verification PASS.
- Review remains diff-first; `node --test` returning exit 0 with **zero functional tests** is not evidence of functional acceptance.
- No communication daemon, unrestricted security permissions, implicit cross-provider child-process calls, autonomous Git integration or production use claims before pilot evidence.

## 7. Disposition of final Opus review (DRAFT v3 → v4)

| Finding / requested change | Resolution in v4 |
|---|---|
| **B1 — conflicting `Active adapter` vs `Orchestrator`** | Removed `Active adapter`; standardized optional `Orchestrator` plus existing `Implementer`; see D4 |
| **B2 — status of PR #7 flows** | Native default; manual Codex→Claude and Codex-implementer CLI remain optional; nested CLI non-default; see D2 |
| **B3 — parallelism/worktree gap** | Actual concurrent writers remain **1**; require independent worktree pilot/task before increase; see D3, P7 follow-ups |
| **B4 — premature `.codex/*.toml` packaging** | Removed all `.codex` additions from Phase 1; built-in worker only; see D2, §4 and P3 |
| D6 — governance and boundary semantics | `boundary/3` already default; only adapters/agents changes; approved boundary is tool-neutral unless expressly scoped; missing boundary stops writes |
| P2–P6 evidence and negative gates | Runtime delegation proof, independent verification, untracked scope, blocked missing authorization, terminated old session, and tool-enforced read-only review |

**Decision:** HUMAN LEAD accepted ADR-003 v4 on 2026-10-18. Acceptance is architectural only. A separately approved S2 task contract is required before repository implementation, commit, push, PR or merge.