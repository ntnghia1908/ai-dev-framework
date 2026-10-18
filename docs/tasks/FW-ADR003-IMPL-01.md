# FW-ADR003-IMPL-01 — Adaptive Native Dual-Agent kit implementation

| Metadata | Value |
|---|---|
| Status | APPROVED — HUMAN LEAD 2026-10-18 |
| Change class | S2 |
| Baseline | `ntnghia1908/ai-dev-framework` / `main` / `932a9416782b8e9fb439c1b2e6dc9870ca33ecf3` (verify again before execution) |
| Authority | ADR-003 (HUMAN LEAD ACCEPTED 2026-10-18), ADR-001, ADR-002, Core v4.4 |
| Repository changes | S2 implementation authorized within owned paths; one documentation-only setup commit/push on feature branch approved; no implementation commit/push, PR or merge authorization |

## Status / Approval

- Status: APPROVED
- Type: CHANGE
- Change class: S2
- Owner: HUMAN LEAD
- Human Lead: HUMAN LEAD
- Execution profile: dual-agent
- Orchestrator: claude-code — main session; Opus preferred if available
- Implementer: claude-code — native Sonnet subagent, one writer
- Authorization mode: task
- Authorization source: HUMAN LEAD explicitly APPROVED task FW-ADR003-IMPL-01 and authorized setup document commit/push on 2026-10-18; ADR-003 remains architectural authority only
- Human Lead approval: accepted 2026-10-18 — task implementation within listed owned paths; doc-only setup commit/push to feature branch
- Implementation authorized: YES
- Parallel group: —
- Dependencies: ADR-003 accepted; pinned base `932a9416782b8e9fb439c1b2e6dc9870ca33ecf3`; verify approved setup branch state before implementation
- Base commit / branch: `932a9416782b8e9fb439c1b2e6dc9870ca33ecf3` / `feat/fw-adr003-native-dual-agent`

This S2 task is **task-authorized individually** because the kit repository has no adopted-project governance config; it does not change the ADR-003 **new-project default** of `boundary/3`. HUMAN LEAD has now approved this task and its precise owned paths separately from accepting ADR-003. One documentation-only setup commit/push to the feature branch is explicitly authorized to hand the contract to Claude Code. Claude may implement and verify within the task boundary but must stop at READY; subsequent implementation commits/pushes, PR creation and merge still require separate HUMAN LEAD authorization.

## Goal

Make a newly bootstrapped Framework v4.4 project open naturally in **Claude Code or Codex**, prefer the native `dual-agent` implementation/review path, preserve optional single-agent and cross-review, and leave existing projects untouched. Do not introduce CLI-to-CLI orchestration or new runtime infrastructure.

## Scope

### Owned paths (exclusive allowlist)

1. `docs/decisions/ADR-003-adaptive-native-dual-agent.md` — record accepted text without creating new decisions.
2. `docs/tasks/FW-ADR003-IMPL-01.md` — task contract and actual evidence.
3. `templates/framework.config.json` — add `codex`, remove fixed `agents.orchestrator`; retain `product=chatgpt`, existing governance and other keys.
4. `templates/AGENTS.md` — minimal auto-adapt bootstrap pointer; no duplicate normative policy.
5. `templates/docs/ai/project-profile.md` — native dual-agent preference, handoff policy pointers, operational write concurrency=1 until separately piloted.
6. `templates/docs/tasks/_template.md` — optional `Orchestrator` field, short optional `## Handoff` pointer to Core §9.
7. `adapters/codex/README.md` — native built-in worker first; clearly label PR #7 manual alternatives and unsupported/unverified runtime features.
8. `scripts/bootstrap-project.sh` — copy Codex adapter in fresh-project bootstrap, retain Product Agent and Claude native files.
9. `bootstrap/github/framework-bootstrap.yml` — same fresh-project adapter set, retain existing safety semantics.
10. `tests/framework-check.test.mjs` — ensure fixtures can omit `agents.orchestrator`, add new/legacy cases; preserve negative tests.
11. `tests/bootstrap-project.test.mjs` — OPTIONAL new isolated bootstrap test file, only if easier/cleaner than extending an existing test.
12. `docs/install-new-project.md` — document three enabled adapters and auto-adapt default.
13. `docs/install-existing-project.md` — existing projects are not silently migrated.
14. `docs/upgrade.md` — explain adoption boundary and Core/version compatibility.
15. `CHANGELOG.md` — dated entry under v4.4, no claim of successful runtime pilots.
16. `adapters/claude-code/README.md` — OPTIONAL: up to a few lines for native/review-only handoff if needed.
17. `adapters/claude-code/.claude/rules/execution.md` — OPTIONAL: up to a few lines, keep current-state import/mapping intact.

Optional paths are *permitted but not required*. Avoid touching them unless necessary for an explicit acceptance criterion. **Any other path is out of scope**, including `core/`, `scripts/framework-check.mjs`, descriptor schema, `VERSION`, `templates/CLAUDE.md`, `adapters/codex/adapter.json`, `.codex/*.toml`, `adapters/claude-code/.claude/agents/implementer.md`, Product Layer, Copilot/ChatGPT adapters, prior ADRs and `youtube-auto-short`.

## Authority / key decisions

- ADR-003 architectural decisions D1–D7 are accepted, **not reopened** in implementation.
- New-project default: `dual-agent` via tool-native subagent; auto-adapt to current CLI only when no authoritative fixed binding and task policy permits.
- `boundary/3` remains the configuration default. **No approved boundary means STOP before writing application source.** Max configured 3 is not permission to run >1 writer concurrently.
- Preserve `single-agent`, optional tool-enforced read-only cross-review and manual PR #7 flows; do not call one provider's CLI from inside the other by default.
- No model-ID hard-coding, no custom `.codex` agents/config in this task; Codex built-in worker must be piloted later.
- Existing projects and their configurations/task contracts must remain valid. No automatic migration.
- HUMAN LEAD controls architecture, approvals and integration.

## Approach — approved implementation by Claude Code

1. Re-check `origin/main`, pinned base, setup feature branch, clean working tree and approved task contract. Expect the feature branch HEAD to include the approved two-document setup commit after pinned base; reject unrelated modifications. Run baseline `node --test` and record any pre-existing failure.
2. Read the already committed accepted ADR-003 and task record. Adapt template configuration and bootstrap paths; preserve ChatGPT Product Agent and Claude Code.
3. Update minimal bootstrap pointers, Codex adapter README and task/project templates. Do not add service/router or copy-paste duplicated rules.
4. Update structural tests and safe, isolated bootstrap fixture checks; preserve legacy binding cases.
5. Verify, inspect changed and untracked files, and report to ORCHESTRATOR for diff-first review. Stop at READY or BLOCKED, pending separate integration authorization.

## Acceptance Criteria

1. Starter-kit `core/`, checker, descriptor schema and `VERSION` are byte-for-byte unchanged from pinned base.
2. New project template enables `chatgpt`, `claude-code`, `codex`, binds `agents.product=chatgpt` only, preserves `boundary/3` and other fields.
3. Local bootstrap installs these three adapters and `.claude` correctly; GitHub bootstrap manifests match the intended adapter set, verified **without running destructive bootstrap in any real repository**.
4. Project/agent/task templates state native `dual-agent` as preferred default, permit an optional `Orchestrator` field, and avoid unsupported mandatory checker fields. `CLAUDE.md` bridge remains unchanged.
5. Codex README describes built-in-worker native delegation as default, with PR #7 paths labeled optional, and **no claim** of successful live native worker/model routing without evidence.
6. Legacy v4.4 project config with fixed Claude orchestrator in `task` mode and separately with `boundary/3` passes checker *unchanged*. Project templates do not silently change pre-existing project policy.
7. New fixture with no orchestrator binding passes checker; invalid/disabled binding still fails. Test helper does not auto-insert a Claude binding for the no-binding fixture.
8. Required verification is run, scope is restricted to owned paths including untracked files, and ORCHESTRATOR independently reviews evidence. No runtime dual-agent or cross-provider review pilot is claimed complete.
9. No framework version bump or new dependency. The initial two-document setup commit/push is explicitly authorized on 2026-10-18; any implementation commit/push, PR or merge requires separate HUMAN LEAD authorization.

## Required verification

- `node --test` — entire suite, with actual counts, exit code and baseline comparison.
- `node scripts/framework-check.mjs --root <valid-new-adopted-fixture>` — project with three enabled adapters, product-only binding, boundary/3, zero FILL markers.
- Legacy fixture checker tests: fixed Claude binding in task governance and separately in boundary/3. Negative invalid/disabled binding remains failing by design.
- Local bootstrap smoke test only in a **temporary empty Git repository**. Verify generated files and no .codex runtime config.
- GitHub bootstrap: static/isolated fixture validation of copy operations, **never invoke destructive workflow on user repos as a test**.
- `git diff --check`; `git status --short --untracked-files=all`; `git diff --name-only <base>`; inspect new untracked file contents; `git diff <base> -- core/ scripts/framework-check.mjs VERSION` should be empty; `git log <base>..HEAD` should show no unexpected commits.
- Manual matrix: Claude native and Codex native execution are **out-of-scope runtime pilots** P2/P3. This implementation can only claim configuration/documentation/test readiness, not production operation.

## Manual test checklist (Tech Lead)

- [ ] Verify no database, security model or public API change.
- [ ] Verify no new model-specific config or cross-provider subprocess automation.
- [ ] Verify `maxParallelImplementers=3` remains a *ceiling*, with operational write concurrency restricted to 1.
- [ ] Verify no change to Auto Short or other adopted repositories.
- [ ] Verify accepted ADR-003 is recorded accurately, with no scope expansion.

## Result

- Main changes: not implemented.
- Tests: not run for this task.
- Review: pending.
- Important findings / decisions: ADR-003 ACCEPTED; FW-ADR003-IMPL-01 APPROVED for implementation within owned paths; documentation-only setup commit/push authorized for Claude handoff.
- Known limitations: native Codex worker/model and cross-review require separate P2–P6 pilots.
- PR: not authorized.

## Integration gate

Documentation-only setup commit/push to `feat/fw-adr003-native-dual-agent` was explicitly authorized by HUMAN LEAD on 2026-10-18 to make the accepted ADR and task contract available to Claude. After Claude reaches READY, HUMAN LEAD separately approves implementation commit/push/PR and then merge. ADR acceptance alone does not authorize any integration.