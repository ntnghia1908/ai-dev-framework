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

<!-- FILL: branch → commit → push → PR → merge; ai được làm bước nào; target branch. Mặc định gợi ý: commit sau khi task được approve; push / PR sau READY + HUMAN LEAD approval; merge do HUMAN LEAD. -->

## 6. Ownership

<!-- FILL: HUMAN LEAD giữ những gì; ai là owner từng khu vực nếu cần. -->

## 7. Execution profiles

<!-- FILL: profile được phép (`single-agent`, `dual-agent`). Profile của từng task là source of truth; không suy đoán profile từ tool/model. -->

## 8. Setup / tools

<!-- FILL: runtime, cách cài, cách chạy, dependency được duyệt (hoặc pointer tới nơi ghi). -->

Framework checker: `node scripts/framework-check.mjs`.

### Test policy

Canonical owner; áp dụng cho mọi IMPLEMENTER bất kể tool.

- Trong vòng sửa: chạy test liên quan tới thay đổi (file hoặc bộ lọc theo tên), ưu tiên dừng ở lỗi đầu tiên với traceback ngắn.
- Toàn bộ suite: một lần trước khi báo READY và một lần sau mỗi vòng fix review; không chạy toàn bộ sau từng lần sửa.
- Lệnh chuẩn chạy toàn bộ suite: <!-- FILL: lệnh test của project, kèm cách chạy song song nếu có -->
- Không nới `docs/ai/workflow.md` §7: required verification trong task contract vẫn phải chạy và PASS trước READY.
