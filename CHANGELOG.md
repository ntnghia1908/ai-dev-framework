# Changelog

## v4.4 — 2026-10-08

- 2026-10-19 — Codex IMPLEMENTER practice (adapter / template / script only; Core v4.4, checker, descriptor schema và `VERSION` không đổi): `adapters/codex/README.md` ghi trạng thái kiểm chứng theo vai trò, chuẩn bị máy Linux (bubblewrap + AppArmor userns), lệnh `codex exec` / `resume` / `review` đã chạy thật, giới hạn sandbox (không mạng / loopback → ORCHESTRATOR chạy test web + full suite), quota và số đo pilot từ một adopted project; thêm `scripts/codex-usage.py`; dòng `codex` trong ví dụ Danh sách IMPLEMENTER và pointer trong rule Claude Code.

- 2026-10-18 — FW-ADR003-IMPL-01 (ADR-003, kit/template/adapter only; Core v4.4, checker, descriptor schema and `VERSION` unchanged): new-project template now enables `chatgpt`, `claude-code` and `codex` and binds only `agents.product` (no fixed `agents.orchestrator`; `boundary`/3 unchanged); local and GitHub bootstrap install the Codex adapter descriptor and README (no `.codex/*.toml`); `AGENTS.md`, project-profile §7, task template (optional `Orchestrator` field and `## Handoff`) and Codex README describe native dual-agent as the default, with write concurrency 1 until a separate worktree pilot, and the PR #7 flows as optional; install/upgrade docs state that existing projects are not migrated; tests cover no-binding, legacy-binding and bootstrap cases. Runtime pilots (Claude/Codex native delegation, cross-review, handoff) are not done; this entry claims configuration, documentation and test readiness only.

- Added boundary authorization mode: a HUMAN LEAD-approved implementation boundary can authorize the ORCHESTRATOR to create and execute task contracts inside that boundary without a separate per-task approval gate.
- Kept decision gates mandatory: scope, architecture, dependency, security model, public API, breaking change, significant shared abstraction, project-wide policy/convention and database/schema still require HUMAN LEAD decisions.
- Added bounded task-level fan-out for dual-agent: multiple IMPLEMENTER instances may run concurrently on independent tasks, each with its own branch/worktree; project configuration caps concurrency at 1–3.
- Added governance configuration and task fields for authorization source, parallel group, dependencies and owned paths; checker validates governance shape and boundary authorization references.
- Preserved task governance mode for backward-compatible projects that still require per-task approval.
- FW-CODEX-ORCH-01 (Phase 1B.1, adapter-only, Core v4.4 unchanged): Codex adapter descriptor now lists `orchestrator` and `implementer`; Codex and Claude Code adapter docs describe external Codex ORCHESTRATOR with manual delegation to a Claude Code Sonnet IMPLEMENTER. Codex remains unverified (no pilot) and independent review of this change is pending.


## v4.3 — 2026-10-07

- Accepted and implemented Agent Adapter Architecture v1 (ADR-001): provider-neutral role contracts, adapter descriptors/registry validation, project role bindings and task-level IMPLEMENTER compatibility checks.
- Added ChatGPT Product Agent adapter while preserving the connected-session model; no local Product Agent runner was reintroduced.
- Migrated framework version/configuration to 4.3 and preserved Claude Code, Copilot and Codex adapter compatibility.
- Product Layer and installation/bootstrap documentation now describe roles and adapters separately.


Mỗi version ghi thay đổi ở Core, template, adapter hoặc checker. Rule hiện hành nằm ở `core/`; file này chỉ là lịch sử.

## v4.2 — 2026-09-29

- Adapter Claude Code: subagent `implementer` khai `model: sonnet` (đổi được, xem ghi chú trong file) và hướng dẫn "cách làm việc gọn".
- Project Layer: thêm mục **Test policy** vào `templates/docs/ai/project-profile.md` (§8): chạy test liên quan trong vòng sửa, toàn bộ suite một lần trước READY và một lần sau mỗi vòng fix review.
- Đóng gói thành starter kit: Core tách khỏi chi tiết project (bỏ một câu project-specific ở `workflow.md` §3 và ở `execution-profiles.md`; không đổi rule), checker đọc `framework.config.json`, thêm adapter Copilot, tài liệu cơ chế và hướng dẫn cài / nâng version.
- Nhiều IMPLEMENTER (không đổi Core): mục "Danh sách IMPLEMENTER" trong template project-profile §7, field `Implementer` trong task template, adapter Claude Code ghi cách ORCHESTRATOR chọn.
- Adapter Copilot đã pilot (gói Free, 2026-09-29; số đo trong `adapters/copilot/README.md`); thêm cách ORCHESTRATOR gọi non-interactive.
- Adapter Codex dạng template, CHƯA KIỂM CHỨNG (`adapters/codex/README.md`); checker nhận adapter `codex`.
- Framework Core §1–§9 không đổi nội dung so với v4.1; chỉ đổi metadata.

## v4.1 — 2026-09-26

- Core: thêm `workflow.md` §9 "Session scope và handoff" (mỗi session một scope; khi xong đề xuất session mới kèm handoff prompt ngắn).
- Adapter Claude Code: mục "Kết thúc session" (`/clear` + handoff prompt).
- Project Layer: thêm `docs/ai/framework-history.md`; checker yêu cầu history có entry `## v<Version>` khớp `Version` của workflow.

## v4 — 2026-09-26

- Bản đầu của kit: Framework v4 áp dụng vào một project greenfield (bản rút gọn của framework v4 gốc).
- Kiến trúc ba lớp Core / Project Layer / Tool Adapter; `AGENTS.md` là entry point trung lập, `CLAUDE.md` chỉ là bridge.
- S0/S1/S2, decision gate, task contract và lifecycle, execution profile `dual-agent` / `single-agent`, canonical owner, circuit breaker.
- Checker kiểm cấu trúc tài liệu, task contract và decision record.
