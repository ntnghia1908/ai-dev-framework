# Adapter Codex — IMPLEMENTER

> **CHƯA KIỂM CHỨNG.** Viết theo tài liệu công khai, chưa chạy pilot. Chỉ dùng cho task S1 nhỏ sau khi hoàn tất checklist pilot bên dưới. Tool thay đổi nhanh: kiểm lại nguồn trước khi dùng.

Adapter thực hiện vai trò IMPLEMENTER của profile `dual-agent` (`core/docs/ai/execution-profiles.md`) bằng Codex CLI chạy **local** trong worktree của task. ORCHESTRATOR (agent khác) vẫn review diff.

## Sự kiện đã tra (2026-09-29)

- Codex CLI đọc `AGENTS.md` và có `codex exec` chạy non-interactive. Nguồn: https://learn.chatgpt.com/docs/codex/cli
- Codex CLI có từ gói Plus trở lên, hoặc dùng API key tính theo token. Nguồn: https://learn.chatgpt.com/docs/pricing
- Cài theo trang CLI ở trên: `curl -fsSL https://chatgpt.com/codex/install.sh | sh`. Ngoài ra trên registry npm có gói `@openai/codex` (`npm view @openai/codex version` trả 0.159.0 lúc tra); đây là thông tin tham khảo, không bắt buộc và chưa cài thử.
- Cờ sandbox / approval của `codex exec`: **chưa xác minh được từ nguồn chính thức** → cần xác minh khi pilot (`codex exec --help`). Không đoán tên cờ.

## Cài đặt vào project

Không cần file adapter riêng: Codex đọc `AGENTS.md` (đã luôn bắt buộc). Thêm `"codex"` vào `adapters` trong `framework.config.json` và khai adapter trong Danh sách IMPLEMENTER (`docs/ai/project-profile.md` §7).

## Cách chạy (hướng local)

1. ORCHESTRATOR tạo worktree / branch, viết task contract (`Implementer: codex — <lý do>`, `Implementation authorized: YES`).
2. Chạy `codex exec` trong worktree với delegation prompt (mẫu dưới). Yêu cầu khi chọn cờ (cần xác minh cờ cụ thể): được ghi file trong worktree; không commit / push / tạo PR; không truy cập mạng nếu task không cần.
3. Codex chạy required verification, trả READY report.
4. ORCHESTRATOR review diff trên cùng branch (`core/docs/ai/workflow.md` §7).

Chặn commit / push không chỉ bằng prompt: dùng cơ chế sandbox / approval của Codex khi đã xác minh, hoặc kiểm `git status` / `git log` sau khi chạy.

## Mẫu delegation prompt

```text
Bạn là IMPLEMENTER cho task <ID>.

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

## Checklist pilot

Chạy trên một task S1 nhỏ, ít rủi ro.

- [ ] Xác minh cờ sandbox / approval của `codex exec`; ghi vào README này.
- [ ] Codex đọc `AGENTS.md`, project profile, current-state và task contract trước khi sửa.
- [ ] Dừng BLOCKED khi prompt thiếu contract / base / `Implementation authorized: YES`.
- [ ] Không commit / push / tạo PR; không sửa ngoài scope.
- [ ] Chạy required verification và báo kết quả thật.
- [ ] READY report đủ 4 mục.
- [ ] Số blocking finding ở review không cao bất thường.
- [ ] Ghi số đo (thời gian, chi phí / hạn mức) và cập nhật tiêu chí trong Danh sách IMPLEMENTER; gỡ nhãn "CHƯA KIỂM CHỨNG".
