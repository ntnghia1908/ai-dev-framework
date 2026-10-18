# Nâng version kit

Kit dùng version + tag (`VERSION`, `CHANGELOG.md`). Project chép (copy) Core và checker, không submodule; nâng version là thay các bản chép đó.

## Các bước

For v4.4, read the boundary-authorization and bounded-parallelism changes in the v4.4 changelog before upgrading. Existing projects may remain on `task` authorization; new projects from the template default to `boundary` with up to 3 parallel IMPLEMENTER instances.

1. Đọc `CHANGELOG.md` từ version project đang dùng tới version đích; ghi lại thay đổi ảnh hưởng adapter, template và rule Core.
2. Thay bản chép của kit: `docs/ai/workflow.md`, `docs/ai/execution-profiles.md` (từ `core/`) và `scripts/framework-check.mjs`, từ tag đích. Project không sửa Core nên đây là chép đè; nếu `git diff` cho thấy project từng sửa Core, tách phần đó sang `docs/ai/project-profile.md` trước.
3. Với adapter đang dùng: so `adapters/<tool>/` của tag đích với bản của project và hợp nhất thay đổi (giữ chỉnh sửa riêng của project).
4. So `templates/` để biết mục mới cần thêm vào Project Layer (vd một mục mới ở `project-profile.md`); mục có `FILL` trong template mới thì điền cho project.
5. Cập nhật `frameworkVersion` trong `framework.config.json` cho khớp `Version` mới của `docs/ai/workflow.md`.
6. Thêm entry vào `docs/ai/framework-history.md` với heading `## v<Version mới>` (checker yêu cầu khớp `Version`); cập nhật tag + commit kit trong `FRAMEWORK_ADOPTION.md`.
7. Chạy `node scripts/framework-check.mjs`, sửa tới khi exit 0.
8. Đi qua integration mechanism của project; HUMAN LEAD duyệt (đổi Core là project-wide policy).

## ADR-003: native dual-agent (ranh giới adoption)

- Core v4.4 và `VERSION` **không đổi**; thay đổi ADR-003 nằm ở template, adapter Codex, bootstrap và test, ghi thành entry có ngày dưới v4.4 trong `CHANGELOG.md`.
- Default mới (ba adapter, không cố định `agents.orchestrator`) chỉ áp dụng cho project mới bootstrap. Nâng kit **không** tự đổi `framework.config.json`, binding, governance mode hay task contract của project đang có; checker v4.4 vẫn chấp nhận cả cấu hình có binding cố định lẫn không binding.
- Field `Orchestrator` và mục `## Handoff` trong task template là tùy chọn, checker không bắt buộc; task cũ không cần migrate. Muốn áp dụng default mới cho project cũ: quyết định của HUMAN LEAD, xem [`install-existing-project.md`](install-existing-project.md).
- Native Codex worker, cross-review và handoff giữa CLI chưa có evidence pilot; không coi là đã kiểm chứng.

## Ghi chú

- Nâng version không tự đổi tài liệu authority của project; chỉ thay Core, adapter, checker và mục template mới.
- Tag mới có thể đổi tên field mà checker kiểm; `CHANGELOG.md` sẽ nói rõ.
