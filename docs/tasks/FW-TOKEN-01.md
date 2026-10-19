# Task: FW-TOKEN-01 — Quy tắc tiết kiệm token trong core framework

## Status / Approval

- Status: READY
- Type: CHANGE
- Change class: S2
- Owner: HUMAN LEAD
- Human Lead: HUMAN LEAD
- Execution profile: dual-agent
- Orchestrator: claude-code
- Implementer: codex — thay đổi tài liệu / script độc lập, không tốn quota Claude
- Authorization mode: task
- Authorization source: HUMAN LEAD duyệt nội dung trong phiên đo token 2026-10-19 (youtube-auto-short); HUMAN LEAD duyệt contract 2026-10-19 (kèm base commit, canonical owner, token-audit không mặc định theo dự án)
- Parallel group: —
- Owned paths:
  - `core/docs/ai/workflow.md`
  - `adapters/claude-code/.claude/rules/execution.md`
  - `adapters/claude-code/.claude/agents/implementer.md`
  - `templates/docs/workflow/current-state.md`
  - `scripts/token-audit.py`
  - `tests/framework-check.test.mjs`
  - `CHANGELOG.md`
  - `templates/docs/ai/framework-history.md`
  - `docs/tasks/FW-TOKEN-01.md`
- Dependencies: none
- Base commit / branch: 8645b98 / docs/token-efficiency-rules
- Human Lead approval: APPROVED 2026-10-19
- Implementation authorized: YES

## Goal

Framework có quy tắc tiết kiệm token đo được, áp dụng cho mọi dự án dùng kit, dựa trên số đo thật của dự án youtube-auto-short (26/9–19/10).

## Bằng chứng (youtube-auto-short, giá API quy đổi)

- Tổng $824; subagent 42 %. Subagent dùng prompt cache 5 phút: 190 lần ghi lại toàn bộ context sau khi chờ 7–30 phút (34M token, ≈ $60–120).
- Phiên chính: 23 % token đầu vào nằm trên 250k context; 43 lần quay lại phiên đã nguội > 1 giờ (9,7M token ghi lại ở giá 2×).
- $/PR merge: 7,8 cả kỳ; 4,6 khi Codex làm IMPLEMENTER.
- Context cố định ≈ 38k; file trạng thái nạp mỗi phiên lớn nhất 4,4k.
- Hook lọc output test: lợi gần 0 (output pytest trung bình 727 ký tự) — không đưa vào.
- Script đo: `scripts/token-audit.py` của youtube-auto-short (contract FW-token-audit).

## Scope

- In scope (quy tắc, mỗi rule một canonical owner):
  1. `workflow.md` §9 (owner): ngưỡng context để handoff (mặc định 250k, cấu hình được); không resume phiên dài sau khi cache hết hạn — mở phiên mới từ repository + handoff.
  2. `workflow.md` §5 (owner): IMPLEMENTER không chờ một lệnh quá thời hạn cache của subagent (Claude Code: 5 phút); verification dài (full suite, render, chạy thật) do ORCHESTRATOR chạy.
  3. `workflow.md` §5 (owner): chọn IMPLEMENTER theo chi phí trên mỗi task merge; ưu tiên adapter không tiêu quota của ORCHESTRATOR khi còn quota.
  4. `workflow.md` §4 (owner): contract có mục "Phải giữ nguyên" (hành vi / action hiện có) để giảm vòng sửa sau review.
  5. `workflow.md` §10 mới "Ngân sách context" (owner): ngân sách file nạp mỗi phiên: AGENTS.md + rules + current-state; quy trình lặp lại đưa vào skill / doc đọc khi cần; current-state ≤ ~1,5k token.
  6. `workflow.md` §10 (owner): agent tra cứu bằng grep / script nhỏ, không nạp tài liệu lớn để lấy một chi tiết.
  7. `scripts/token-audit.py` trong kit + hướng dẫn đo định kỳ (cost per merged task); không có giá trị mặc định riêng của dự án nào (`--project`, `--repo` do người chạy truyền vào).
- Out of scope: cấu hình Claude Code cá nhân; hook lọc output; đổi effort mặc định.

## Acceptance Criteria

1. Mỗi quy tắc 1–6 có đúng một canonical owner; adapter / template chỉ pointer.
2. `implementer.md` và delegation prompt mẫu nêu giới hạn thời gian chờ (quy tắc 2).
3. Template `current-state.md` có ghi chú ngân sách token.
4. `scripts/token-audit.py` chạy trên transcript thật và in đủ chỉ số ở mục Bằng chứng.
5. `node scripts/framework-check.mjs` và test của kit PASS.

## Required verification

- `node --test tests/*.test.mjs` — AC5 (`node --test tests/` không chạy đúng trên Node hiện tại; `scripts/framework-check.mjs` chỉ chạy trong project đã adopt, test bao phủ).
- `python3 scripts/token-audit.py --since <d1> --until <d2> --project <substr> --repo <path>` trên máy có transcript — AC4.

## Manual test checklist (Tech Lead)

Không chạm database, security model hay public API contract.

- [ ] Sau 10 ngày áp dụng ở youtube-auto-short (đo lại 2026-10-29), so mốc trước khi tag phiên bản kit.

## Result

- Status: READY 2026-10-19. IMPLEMENTER: Codex (`gpt-6.1-sol`, effort high → vòng sửa medium); 2 vòng, ≈ 129k + 206k tokens Codex.
- Canonical owner: rule 1 → `core/docs/ai/workflow.md` §9; rule 2–3 → §5; rule 4 → §4; rule 5–6 → §10. Adapter / template chỉ pointer (kèm giá trị 5 phút cho Claude Code subagent) — AC1–AC3.
- AC5: `node --test tests/*.test.mjs` PASS 55/55 (ORCHESTRATOR, ngoài sandbox; baseline 52/52). Trong sandbox Codex fail vì `spawnSync` EPERM (lỗi môi trường, tái hiện tại HEAD gốc).
- AC4: `python3 scripts/token-audit.py --since 2026-09-26 --until 2026-10-19 --project youtube-auto-short --repo ~/projects/youtube-auto-short` trên transcript thật: $790,77; subagent 42 %; main input > 250k 24,3 %; cold resume main 46 (9,0M), subagent 205 (32,7M); 106 merge → $7,46/PR; Codex 50,7M token. Chênh nhỏ so với Bằng chứng do chuỗi lọc dự án hẹp hơn.
- Review vòng 1: Codex lọc theo `cwd` dưới `--repo` → 0 token (worktree anh em, repo đã chuyển thư mục). Sửa: lọc `cwd` theo `--project`, `--repo` chỉ đếm merge; thêm test. Resume không giữ `-C` nên Codex trả patch, ORCHESTRATOR áp dụng.
- Follow-up ngoài Owned paths: thêm mục "Phải giữ nguyên" vào `templates/docs/tasks/_template.md`.
- PR: #10
