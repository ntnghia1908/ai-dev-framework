# Cài kit vào project có sẵn

Dành cho repository đã có code và có thể đã có tài liệu / quy ước làm việc. Nguyên tắc: **adopt không đổi code, không đổi test**; tài liệu có sẵn được map vào Project Layer, không chép vào Core.

## 1. Inventory

Lập danh sách những gì project đã có: README, CONTRIBUTING, hướng dẫn cho agent (`CLAUDE.md`, `.github/copilot-instructions.md`, ...), quy ước code / test / branch, tài liệu kiến trúc, CI, thư mục quyết định. Với mỗi mục ghi: giữ nguyên / map vào Project Layer / bỏ.

## 2. Chép Core + checker + template

Như các bước 1–4 của [`install-new-project.md`](install-new-project.md). Nếu đã có `AGENTS.md`, `CLAUDE.md` hoặc `.github/copilot-instructions.md`, **không ghi đè**: dùng `cp -n` và hợp nhất thủ công (bước 3).

## 3. Map tài liệu có sẵn

| Đang có | Đặt ở |
|---|---|
| Mô tả project, kiến trúc, module | `docs/ai/project-profile.md` (§1, §3) — hoặc pointer tới tài liệu hiện có, nếu đó là authority |
| Thứ tự tài liệu nào thắng khi mâu thuẫn | `docs/ai/project-profile.md` §2 |
| Quy ước branch / commit / PR / review | `docs/ai/project-profile.md` §5 |
| Cách cài / chạy / test | `docs/ai/project-profile.md` §8 (Setup, Test policy) |
| Rule riêng một module | `<module>/AGENTS.md` |
| Quyết định kiến trúc đã có (ADR, ...) | giữ nguyên; đặt `decisionDir` trỏ tới đó (checker yêu cầu metadata `Status` bắt đầu bằng PROPOSED / ACCEPTED / SUPERSEDED — kiểm trước, nếu không khớp thì để `decisionDir` trỏ thư mục không tồn tại và ghi vào Not adopted) |
| Hướng dẫn agent cũ | rule chung → đã có canonical owner trong Core / `AGENTS.md`, chỉ giữ pointer; phần riêng tool → adapter |

Một normative rule chỉ có một canonical owner: khi map, chuyển nội dung sang owner mới và để pointer ở chỗ cũ, không giữ hai bản.

## 4. Adapter

Chép adapter cần dùng; nếu file đích đã có, hợp nhất tay (giữ phần riêng của project, đảm bảo `CLAUDE.md` chỉ là bridge `@AGENTS.md` khi dùng adapter `claude-code`).

## 5. Ghi adoption

`FRAMEWORK_ADOPTION.md`: kit + tag + commit; **Adopted** (dùng nguyên), **Adapted** (chỉnh cho project), **Not adopted** (cố ý bỏ, kèm lý do). Điền `framework-history.md` (entry `## v4.3`) và `framework.config.json`.

## 6. Kiểm tra và pilot

```bash
node scripts/framework-check.mjs
```

Sau đó làm một task S0 hoặc S1 đầu tiên làm pilot. Không thay đổi code / test trong PR adoption; nếu inventory cho thấy cần sửa code, tách thành task riêng.

## Lưu ý

- Adoption là thay đổi project-wide policy: cần HUMAN LEAD duyệt (`core/docs/ai/workflow.md` §1, §3).
- Nếu project đã có quy trình khác mâu thuẫn với Core, ghi rõ ở Adapted / Not adopted thay vì sửa Core.
