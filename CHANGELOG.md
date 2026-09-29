# Changelog

Mỗi version ghi thay đổi ở Core, template, adapter hoặc checker. Rule hiện hành nằm ở `core/`; file này chỉ là lịch sử.

## v4.2 — 2026-09-29

- Adapter Claude Code: subagent `implementer` khai `model: sonnet` (đổi được, xem ghi chú trong file) và hướng dẫn "cách làm việc gọn".
- Project Layer: thêm mục **Test policy** vào `templates/docs/ai/project-profile.md` (§8): chạy test liên quan trong vòng sửa, toàn bộ suite một lần trước READY và một lần sau mỗi vòng fix review.
- Đóng gói thành starter kit: Core tách khỏi chi tiết project (bỏ một câu project-specific ở `workflow.md` §3 và ở `execution-profiles.md`; không đổi rule), checker đọc `framework.config.json`, thêm adapter Copilot (chưa kiểm chứng), tài liệu cơ chế và hướng dẫn cài / nâng version.
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
