# Changelog

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
