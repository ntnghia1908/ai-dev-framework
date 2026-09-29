# Adapter Copilot — IMPLEMENTER

> **CHƯA KIỂM CHỨNG.** Adapter này được viết theo tài liệu GitHub, chưa chạy pilot thật. Chỉ dùng cho task S1 nhỏ cho tới khi checklist pilot bên dưới hoàn tất. Tool và tên tính năng của Copilot thay đổi nhanh: kiểm lại tài liệu nguồn trước khi dùng.

Adapter thực hiện vai trò IMPLEMENTER của profile `dual-agent` (định nghĩa ở `core/docs/ai/execution-profiles.md`) bằng GitHub Copilot chạy **local**. ORCHESTRATOR (một agent khác, vd Claude Code) vẫn review diff.

## Cài đặt

Copy vào project (giữ đường dẫn):

- `.github/copilot-instructions.md` — pointer về `AGENTS.md`, không định nghĩa rule riêng.
- `.github/agents/implementer.agent.md` — custom agent IMPLEMENTER.

Bật trong `framework.config.json`: thêm `"copilot"` vào `adapters` (checker sẽ yêu cầu hai file trên).

## Sự kiện đã xác minh (tra 2026-09-29)

Nguồn: https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/create-custom-agents

- Custom agent là file `.github/agents/<name>.agent.md`.
- Frontmatter: `name` (tùy chọn, mặc định = tên file), `description` (bắt buộc), `tools` (tùy chọn; bỏ = mọi tool), `target` (`vscode` hoặc `github-copilot`), `model`.
- `model` chỉ có hiệu lực ở IDE (VS Code, JetBrains, Eclipse, Xcode). Vì vậy file mẫu **không đặt `model`**; chọn model ở IDE nếu cần.
- Copilot CLI dùng custom agent qua lệnh `/agent`.

Nguồn: https://docs.github.com/en/copilot/get-started/plans

- Mọi gói có Copilot CLI; gói Free có giới hạn hạn mức.

Không suy diễn thêm ngoài các điểm trên.

## Cách chạy (hướng local)

1. ORCHESTRATOR tạo worktree / branch cho task và viết task contract (`Implementation authorized: YES`).
2. Mở Copilot trong **worktree của task**: Copilot CLI (`/agent` → chọn `implementer`) hoặc agent mode trong IDE.
3. HUMAN LEAD chuyển delegation prompt (mẫu bên dưới) cho Copilot.
4. Copilot làm việc, chạy required verification, trả READY report. **Không commit / push / tạo PR.**
5. ORCHESTRATOR review diff trên cùng branch (`core/docs/ai/workflow.md` §7) và điều phối fix.

**Không dùng coding agent chạy trên cloud** (giao issue cho Copilot): nó tự tạo branch và draft PR, lệch integration mechanism của workflow (`core/docs/ai/workflow.md` §8; commit / push / PR do HUMAN LEAD kiểm soát).

## Mẫu delegation prompt

```text
Bạn là IMPLEMENTER (agent `implementer`) cho task <ID>.

Task contract (APPROVED): <đường dẫn tới docs/tasks/<ID>.md>
Base commit: <sha>   Branch: <branch>   Worktree: <đường dẫn>
Implementation authorized: YES
Plan ngắn:
1. ...
2. ...

Làm theo AGENTS.md và task contract. Chạy required verification theo Test policy.
Không commit, không push, không tạo PR. Dừng ở READY và trả READY report:
thay đổi chính, verification (lệnh + kết quả), finding ngoài scope, giới hạn.
```

## Checklist pilot (khi có gói Copilot phù hợp)

Chạy trên một task S1 nhỏ, ít rủi ro.

- [ ] Copilot CLI hoặc IDE nhận `implementer` từ `.github/agents/implementer.agent.md` (`/agent` liệt kê được).
- [ ] Copilot đọc `AGENTS.md`, project profile, current-state và task contract trước khi sửa.
- [ ] Dừng BLOCKED khi prompt thiếu contract / base / `Implementation authorized: YES`.
- [ ] Không commit / push / tạo PR; không sửa ngoài scope.
- [ ] Chạy required verification và báo kết quả thật (không claim PASS chưa chạy).
- [ ] READY report đủ 4 mục.
- [ ] Số blocking finding ở review không cao bất thường so với IMPLEMENTER khác.
- [ ] Ghi kết quả pilot (ngày, gói Copilot, task, vấn đề) vào `docs/ai/framework-history.md` của project; nếu đạt, gỡ nhãn "CHƯA KIỂM CHỨNG" trong bản adapter của project.
