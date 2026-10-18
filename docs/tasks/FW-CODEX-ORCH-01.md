# Task: FW-CODEX-ORCH-01 — Codex orchestrator support, Phase 1B.1

## Status / Approval

- Status: READY
- Type: CHANGE
- Change class: S2
- Owner: HUMAN LEAD
- Human Lead: HUMAN LEAD
- Execution profile: dual-agent
- Orchestrator: Codex
- Implementer: claude-code — Claude Code Sonnet, một writer
- Authorization mode: task
- Authorization source: HUMAN LEAD approval trong “FW-CODEX-ORCH-01 — EXECUTION”, Phase 1B.1
- Parallel group: — (serialized)
- Owned paths:
  - `adapters/codex/adapter.json`
  - `adapters/codex/README.md`
  - `adapters/claude-code/README.md`
  - `adapters/claude-code/.claude/rules/execution.md`
  - `tests/framework-check.test.mjs`
  - `CHANGELOG.md`
  - `templates/docs/ai/framework-history.md`
  - `docs/tasks/FW-CODEX-ORCH-01.md`
- Dependencies: none
- Base commit / branch: 92828b3c0ebfc8b020a9c323d420b41a17effa35 / feat/fw-codex-orchestrator
- Human Lead approval: accepted
- Implementation authorized: YES

Lifecycle: `task` mode = `DRAFT → APPROVED → IN_PROGRESS → READY`. Task này đã qua APPROVED (HUMAN LEAD) và IN_PROGRESS; Codex review ACCEPTED nên ghi READY. DONE suy ra từ Git sau khi merge. Change class S2 vì là mapping vai trò có tính tái sử dụng ở adapter.

## Goal

Mở rộng Codex adapter để hỗ trợ ORCHESTRATOR và trách nhiệm review, gồm delegation được tài liệu hóa sang Claude Code Sonnet. Framework Core v4.4 giữ nguyên.

## Scope

- In scope:
  - Descriptor Codex khai cả `orchestrator` và `implementer`.
  - README Codex mô tả trách nhiệm ORCHESTRATOR và delegation thủ công.
  - README Claude Code và execution rule phân biệt Claude làm ORCHESTRATOR với Claude main session làm IMPLEMENTER cho external Codex ORCHESTRATOR.
  - Phân biệt starter-kit root với adopted project; ví dụ config adopted project.
  - Test positive binding `agents.orchestrator = codex`; negative test dùng adapter không có role orchestrator (copilot).
  - Sửa stale expectation ở test “Version not in history fails”.
  - Changelog và framework-history dưới v4.4.
- Out of scope:
  - `core/`, `scripts/`, version framework, dependency list, mọi file ngoài `Owned paths`.
  - Helper script, gateway, scheduler, automatic model/provider switching.
  - Two-Sonnet concurrency, role reviewer mới.
  - Nâng trạng thái “CHƯA KIỂM CHỨNG” của Codex thành đã pilot.

## Authority / key decisions

- Approval của HUMAN LEAD cho Phase 1B.1 trên local feature branch, trên cùng Framework Core v4.4, ADR-001 và ADR-002.
- ADR-001/ADR-002 không thay thế task authorization; capabilities trong descriptor chỉ là fact, không cấp authorization.
- Không đổi decision gate, quyền integrate hay merge. Không commit, push, tạo PR hoặc merge.

## Implementation approach

1. Baseline `node --test` trước khi sửa.
2. Thêm `orchestrator` vào `roles` của Codex descriptor; giữ nguyên field khác.
3. Cập nhật README Codex, README Claude Code và execution rule bằng tiếng Việt theo văn phong hiện có.
4. Cập nhật test: positive codex orchestrator, negative copilot, sửa stale expectation 4.3 → 4.4.
5. Ghi changelog/history dưới v4.4 tham chiếu task này.
6. Chạy verification, tự kiểm diff, trả Codex review.

## Acceptance Criteria

1. `adapters/codex/adapter.json` có `roles: ["orchestrator", "implementer"]`; các field/capability khác giữ nguyên.
2. Flow IMPLEMENTER hiện có của Codex và Claude giữ nguyên; trạng thái “CHƯA KIỂM CHỨNG” của Codex không bị nâng khi thiếu evidence.
3. README Codex mô tả trách nhiệm ORCHESTRATOR: kiểm authority/base/branch, chuẩn bị contract/plan, delegation thủ công, review contract → diff → AC → verification, bounded fix, READY/BLOCKED.
4. README Claude Code và execution rule phân biệt (a) Claude làm ORCHESTRATOR theo flow hiện có và (b) external Codex ORCHESTRATOR → Claude main session làm IMPLEMENTER; main session không tự nhận ORCHESTRATOR hay delegate tiếp trong flow (b).
5. Tài liệu phân biệt starter-kit root với adopted project, không giả định kit root có `AGENTS.md`, project-profile/current-state hay registered subagent; import current-state trong execution rule được giữ nguyên.
6. Có ví dụ adopted-project config bật `codex` và `claude-code`, `agents.orchestrator = codex`; Implementer `claude-code`/Sonnet ghi ở task; capabilities không cấp authorization.
7. Có positive test binding `agents.orchestrator = codex` (kiểm cả implementer Codex vẫn được giữ); negative test unsupported orchestrator dùng copilot; disabled-binding test và regression checks hiện có giữ nguyên.
8. Test “Version not in history fails” được sửa kỳ vọng 4.3 → 4.4 sau khi baseline xác nhận failure; không sửa production checker.
9. Changelog và framework-history ghi dưới v4.4, tham chiếu task, không claim pilot/review hoàn tất.
10. Chỉ tám file trong Owned paths thay đổi; không có commit mới.

## Required verification

- `node --test` (baseline trước sửa; sau sửa phải PASS) — AC 7, 8 và regression.
- `node scripts/framework-check.mjs --root <temporary adopted-project fixture ngoài repo>` với `agents.orchestrator = codex`, adapters `codex` + `claude-code` — AC 1, 6.
- `git diff --check` — không lỗi whitespace.
- `git diff --name-only <base>`, `git diff <base> -- core/ scripts/`, `git status --short --untracked-files=all`, `git log <base>..HEAD` — AC 10.
- Đọc toàn bộ file untracked mới; review thủ công docs mapping với AC 2–6, 9.

Tất cả required verification phải chạy và PASS trước READY.

## Manual test checklist (Tech Lead)

Task không chạm database, security model hay public API contract; không thay Framework Core. Manual test là điểm danh sau automated verification.

- [ ] Descriptor Codex hợp lệ với schema và `framework-check` fixture PASS.
- [ ] README Codex/Claude nhất quán về hai flow (Codex ORCHESTRATOR / Claude ORCHESTRATOR).
- [ ] Nhãn “CHƯA KIỂM CHỨNG” của Codex còn nguyên.
- [ ] Chỉ tám file trong Owned paths thay đổi; không commit/push/PR.

## Result

- Main changes: Codex descriptor thêm role `orchestrator` (giữ `implementer`); README Codex thêm mục ORCHESTRATOR, delegation prompt, config mẫu, phân biệt kit root / adopted project; README Claude Code và execution rule phân biệt hai flow dual-agent (giữ import current-state); test thêm positive `agents.orchestrator = codex`, negative chuyển sang copilot, sửa kỳ vọng 4.3 → 4.4; changelog và framework-history ghi dưới v4.4.
- Tests summary: Sonnet 42/42 PASS; Codex independent fixture checker 18 PASS.
- Tests (evidence tái lập được, bounded fix vòng 1; branch `feat/fw-codex-orchestrator`, HEAD = base `92828b3c`):
  - Baseline: log còn lưu; tái lập thêm từ snapshot `git archive 92828b3c… | tar -x -C <tmp ngoài repo>` rồi `node --test` trong snapshot (không đụng working tree). Cả hai: `tests 41, pass 40, fail 1`, exit 1. Failure duy nhất `Version not in history fails`: `actual: 'FAIL: framework-history.md missing entry for workflow Version 4.4 (expected heading: ## v4.4)'`, `expected: /…Version 4\.3/` → stale expectation có sẵn tại base, không phải regression.
  - Sau sửa: `node --test` → `tests 42, suites 0, pass 42, fail 0, cancelled 0, skipped 0`, exit 0.
  - Fixture adopted-project (ngoài repo, script tạm không lưu vào repo) dựng như sau: (1) `cp -r` `core/` và `templates/` vào thư mục rỗng; (2) với `codex` và `claude-code`, copy `adapters/<id>` vào `<fixture>/adapters/<id>`, riêng claude-code copy thêm `adapters/claude-code/.claude` → `<fixture>/.claude`; (3) duyệt mọi `*.md`, thay regex `/<!--\s*FILL:[\s\S]*?-->/g` bằng `filled` (còn 0 file chứa `FILL:`); (4) sửa `framework.config.json`: `adapters = ["codex","claude-code"]`, `agents = {"orchestrator":"codex"}`, `governance.taskAuthorization = "task"` (giữ `maxParallelImplementers: 3`); (5) copy `docs/tasks/FW-CODEX-ORCH-01.md` vào `<fixture>/docs/tasks/`. Fixture có `AGENTS.md`, `CLAUDE.md`, `.claude/`, `docs/`, `adapters/`, `FRAMEWORK_ADOPTION.md` từ templates.
  - `node scripts/framework-check.mjs --root <fixture>` → exit 0; 18 dòng PASS gồm `task contract docs/tasks/FW-CODEX-ORCH-01.md`, `adapter descriptor adapters/codex/adapter.json`, `adapters/claude-code/adapter.json`, `.claude/rules/execution.md`, `framework structure`; không có dòng FAIL.
  - `git diff --check` → exit 0. `git log 92828b3c..HEAD` rỗng (0 commit mới). `git diff 92828b3c -- core/ scripts/` rỗng. `git diff --name-only` = CHANGELOG.md, adapters/claude-code/.claude/rules/execution.md, adapters/claude-code/README.md, adapters/codex/README.md, adapters/codex/adapter.json, templates/docs/ai/framework-history.md, tests/framework-check.test.mjs; `git status --short --untracked-files=all` thêm đúng một untracked: `docs/tasks/FW-CODEX-ORCH-01.md`. Tổng 8 file = Owned paths.
- Review: ACCEPTED by Codex.
- Important findings / decisions: stale expectation “Version 4.3” đã được baseline xác nhận và sửa trong test; checker không đổi. Checker yêu cầu giá trị field task thuần (không kèm chú thích).
- Known limitations: Codex không thể tự chạy lại toàn suite do read-only sandbox; chưa live-pilot Codex → Sonnet CLI; Codex ORCHESTRATOR và flow Codex → Claude chưa pilot; delegation thủ công; nhãn “CHƯA KIỂM CHỨNG” của Codex giữ nguyên.
- PR: không được phép trong task này.
