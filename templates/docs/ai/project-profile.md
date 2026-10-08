# Project Profile — <!-- FILL: tên project -->

| Metadata | Value |
|---|---|
| Status | CURRENT |
| Project stage | <!-- FILL: giai đoạn hiện tại -->  |

Canonical owner cho: project là gì, authority order, module map, project policy, integration mechanism, execution profile được phép, setup và Test policy.

## 1. Project

<!-- FILL: mục tiêu, phạm vi, ngoài phạm vi, tham chiếu bên ngoài (nếu có, ghi rõ chúng KHÔNG phải source of truth). -->

## 2. Authority order

<!-- FILL: liệt kê từ cao xuống thấp. Gợi ý:
1. HUMAN LEAD decisions / approved task contracts / accepted decision records;
2. docs/ai/workflow.md, docs/ai/execution-profiles.md và file này;
3. source code và tests hiện hành;
4. docs/workflow/current-state.md chỉ là operational state, không phải authority;
5. README và tài liệu onboarding chỉ mô tả / cross-link.
Ghi rõ boundary chưa có authority (database, security, public API...) nếu có. -->

## 3. Module map

<!-- FILL: bảng module. Phân biệt rõ *planned* (chưa implement) và *implemented*; không mô tả thành phần chỉ mới lên kế hoạch như đã có. Mẫu:

| Path | Vai trò | Trạng thái | Rule riêng |
|---|---|---|---|
| `src/...` | ... | planned / implemented | pointer tới authority |

Chỉ tạo `<module>/AGENTS.md` khi module có convention riêng đủ rõ. -->

## 4. Project policy

<!-- FILL: policy riêng project (ngôn ngữ tài liệu, quy ước đặt tên, dependency, ...). Dependency mới là decision gate theo `docs/ai/workflow.md` §3. -->

## 5. Integration mechanism

<!-- FILL: branch → commit → push → PR → merge; ai được làm bước nào; target branch. Với `governance.taskAuthorization=boundary`, task nằm hoàn toàn trong boundary đã được HUMAN LEAD chấp thuận không cần APPROVE TASK riêng. -->

## 6. Ownership

<!-- FILL: HUMAN LEAD giữ những gì; ai là owner từng khu vực nếu cần. -->

## 7. Execution profiles

<!-- FILL: profile được phép (`single-agent`, `dual-agent`). Profile của từng task là source of truth; không suy đoán profile từ tool/model. -->

### Governance mode

Project chọn `task` (cần APPROVE TASK) hoặc `boundary` (HUMAN LEAD cấp Implementation Authorization Boundary một lần). Ghi lựa chọn trong `framework.config.json` và không tự đổi giữa phiên.

### Danh sách IMPLEMENTER

Canonical owner cho việc tool nào được làm IMPLEMENTER của task `dual-agent`; HUMAN LEAD duyệt danh sách adapter được phép. Tên model / vendor chỉ ghi ở đây và ở adapter, không ghi vào Core.

<!-- FILL: bảng dưới, mỗi dòng một adapter được phép. Ví dụ trung tính:

| Adapter | Điểm mạnh | Giới hạn | Dùng khi | Dự phòng |
|---|---|---|---|---|
| `claude-code` (subagent `implementer`) | tích hợp sẵn với ORCHESTRATOR, không cần CLI riêng | tốn hạn mức của session chính | task cần ngữ cảnh dài | `copilot` |
| `copilot` (CLI, `--agent implementer`) | chạy nhanh, chi phí thấp cho việc nhỏ | hạn mức gói; allowlist lệnh phải cấu hình | task nhỏ, ít rủi ro, file rõ ràng | `claude-code` |
| `codex` (`codex exec`) | vendor khác → review chéo | cần gói / API key; chưa kiểm chứng | task cần cách nhìn độc lập | `claude-code` |
-->

| Adapter | Điểm mạnh | Giới hạn | Dùng khi | Dự phòng |
|---|---|---|---|---|

Cách chọn:

- ORCHESTRATOR chọn IMPLEMENTER lúc viết task contract và ghi vào field `Implementer`. Trong `boundary` mode, lựa chọn này không cần APPROVE TASK riêng; vẫn phải nằm trong danh sách adapter được phép.
- Không đổi IMPLEMENTER giữa task (một writer trên một branch), trừ dự phòng đã khai ở bảng (hạn mức, auth, lỗi tool, circuit breaker); ghi việc đổi vào Result.
- Nhiều IMPLEMENTER chạy song song chỉ khi task graph chứng minh độc lập, mỗi người một branch/worktree, ownership không giao nhau và không vượt `governance.maxParallelImplementers` (`docs/ai/workflow.md` §5). Khuyến nghị 2–3 khi thực sự có thể song song; không tạo parallelism giả.

## 9. Setup / tools

<!-- FILL: runtime, cách cài, cách chạy, dependency được duyệt (hoặc pointer tới nơi ghi). -->

Framework checker: `node scripts/framework-check.mjs`.

### Test policy

Canonical owner; áp dụng cho mọi IMPLEMENTER bất kể tool.

- Trong vòng sửa: chạy test liên quan tới thay đổi (file hoặc bộ lọc theo tên), ưu tiên dừng ở lỗi đầu tiên với traceback ngắn.
- Toàn bộ suite: một lần trước khi báo READY và một lần sau mỗi vòng fix review; không chạy toàn bộ sau từng lần sửa.
- Lệnh chuẩn chạy toàn bộ suite: <!-- FILL: lệnh test của project, kèm cách chạy song song nếu có -->
- Không nới `docs/ai/workflow.md` §7: required verification trong task contract vẫn phải chạy và PASS trước READY.
