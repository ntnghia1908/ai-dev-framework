# Task: FW-GROWTH-01 — Quy tắc chống phình code (tái dùng, xóa code bị thay, test theo AC)

## Status / Approval

- Status: READY
- Type: CHANGE
- Change class: S2
- Owner: HUMAN LEAD
- Human Lead: HUMAN LEAD
- Execution profile: single-agent — phiên Claude Code cloud không có Codex; thay đổi chỉ là tài liệu + test, nhỏ
- Orchestrator: claude-code
- Authorization mode: task
- Authorization source: HUMAN LEAD duyệt "làm như đề xuất" 2026-10-19 cho báo cáo audit youtube-auto-short (`docs/audit/code-growth-report.md` §5.1: thử F1 + F2 + F3 trước)
- Parallel group: —
- Owned paths:
  - `core/docs/ai/workflow.md`
  - `templates/docs/tasks/_template.md`
  - `adapters/claude-code/.claude/rules/execution.md`
  - `adapters/claude-code/.claude/agents/implementer.md`
  - `adapters/codex/README.md`
  - `tests/framework-check.test.mjs`
  - `CHANGELOG.md`
  - `templates/docs/ai/framework-history.md`
  - `docs/tasks/FW-GROWTH-01.md`
- Dependencies: FW-TOKEN-01 (PR #10, đã merge)
- Base commit / branch: `d790240` / `claude/vigilant-faraday-y4vgxc`
- Human Lead approval: APPROVED 2026-10-19 (chấp nhận đề xuất F1–F3 của audit)
- Implementation authorized: YES

## Goal

Framework có quy tắc đo được để agent không viết lại code có sẵn, xóa code bị thay và giới hạn test theo AC. Mỗi quy tắc có một canonical owner trong `core/docs/ai/workflow.md`.

## Bằng chứng (audit youtube-auto-short, 2026-09-26 → 2026-10-19)

- Helper bị viết lại thay vì tái dùng:
  - `utc_now` có sẵn ở `workspace.py`, bị viết lại 7 lần.
  - Phân tích URL YouTube bị chép 2 lần.
  - `_read_json` có 7 bản.
  - Bug CP8.15 B1 do viết lại `clip_text` sai.
- Tỉ lệ xóa / thêm của code ứng dụng: FEATURE 3 %, CHANGE 34 %.
- Test ≈ 1 : 1 code ứng dụng; 2,3–7,6 test / AC trên 8 PR đào sâu; 0/73 prompt delegation giới hạn test.
- Prompt nhắc tái dùng 15/73, nhắc xóa 21/73. Phiên có nhắc tái dùng / xóa: 17,9 dòng viết / dòng thay; không nhắc: 522,8 (chỉ là tương quan).
- Trùng lặp khối (jscpd) chỉ 0,53 %; code chết ≈ 35 dòng. Vấn đề nằm ở trùng *ngữ nghĩa* helper nhỏ và lượng test, không phải clone lớn.

## Scope

- In scope:
  1. F2: `workflow.md` §4 (owner) — contract có mục **Code bị thay / xóa**.
  2. F1: `workflow.md` §5 (owner) — tái dùng trước khi viết. ORCHESTRATOR ghi helper có sẵn vào delegation prompt; READY report liệt kê helper mới + lệnh đã tìm; code bị thay được xóa trong task.
  3. F3: `workflow.md` §7 (owner) — READY report có bảng AC → test (≤ ~3 hàm test / AC, parametrize, fixture chung), dòng thêm / xóa và helper mới; review kiểm; cách đo.
  4. Template task: thêm mục "Phải giữ nguyên" (follow-up ghi trong Result của FW-TOKEN-01) và "Code bị thay / xóa"; thêm field trong Result.
  5. Adapter Claude Code / Codex: chỉ pointer tới §5 / §7 trong delegation prompt và READY report.
- Out of scope:
  - F4 (ngân sách diff / PR), F5 (checklist công cụ trùng lặp đầy đủ), F6 (script bench).
  - Checker bắt buộc mục mới trong task contract.
  - Nâng version Core.
  - Upgrade adopted project.

## Phải giữ nguyên

- Quy tắc FW-TOKEN-01 ở §4 / §5 / §9 / §10 và test hiện có của chúng.
- Checker (`scripts/framework-check.mjs`), descriptor schema, `VERSION`.

## Code bị thay / xóa

- Không có (chỉ thêm quy tắc).

## Acceptance Criteria

1. F1–F3 mỗi quy tắc có đúng một canonical owner trong `workflow.md` (§5 / §4 / §7); adapter / template chỉ pointer.
2. Template task có "Phải giữ nguyên", "Code bị thay / xóa" và field Result cho AC → test, dòng + / −, helper mới.
3. Delegation prompt mẫu (Claude Code, Codex) và `implementer.md` nhắc tái dùng / xóa và các mục READY report mới.
4. Test mới kiểm owner + pointer; toàn bộ test của kit PASS.

## Required verification

- `node --test tests/*.test.mjs` — AC4 (AC1–AC3 qua test mới).

## Manual test checklist (Tech Lead)

Không chạm database, security model hay public API contract.

- [ ] Áp dụng ở youtube-auto-short (upgrade riêng). Sau 3–5 task, đo lại theo `docs/audit/code-growth-report.md` phụ lục A: tỉ lệ xóa / thêm theo Type, test / AC, bản copy helper mới.

## Result

- Main changes: §4 "Code bị thay / xóa"; §5 "Tái dùng trước khi viết"; §7 nội dung READY report + review + đo; template thêm 2 mục + 3 field Result; pointer trong `execution.md`, `implementer.md`, 3 mẫu prompt của `adapters/codex/README.md`; CHANGELOG + framework-history.
- Tests:
  - Thêm `code growth rules have workflow owners and adapter/template pointers`.
  - `node --test tests/*.test.mjs` PASS 56/56 (baseline 55 + 1 test mới), chạy 2026-10-19 sau khi HUMAN LEAD cho phép.
- Diff + / − (app, test): chỉ tài liệu; test +18 / −0.
- Helper mới: không có.
- Review: tự review single-agent (diff → AC).
- PR:
