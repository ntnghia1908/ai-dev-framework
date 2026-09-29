# Nâng version kit

Kit dùng version + tag (`VERSION`, `CHANGELOG.md`). Project chép (copy) Core và checker, không submodule; nâng version là thay các bản chép đó.

## Các bước

1. Đọc `CHANGELOG.md` từ version project đang dùng tới version đích; ghi lại thay đổi ảnh hưởng adapter, template và rule Core.
2. Thay bản chép của kit: `docs/ai/workflow.md`, `docs/ai/execution-profiles.md` (từ `core/`) và `scripts/framework-check.mjs`, từ tag đích. Project không sửa Core nên đây là chép đè; nếu `git diff` cho thấy project từng sửa Core, tách phần đó sang `docs/ai/project-profile.md` trước.
3. Với adapter đang dùng: so `adapters/<tool>/` của tag đích với bản của project và hợp nhất thay đổi (giữ chỉnh sửa riêng của project).
4. So `templates/` để biết mục mới cần thêm vào Project Layer (vd một mục mới ở `project-profile.md`); mục có `FILL` trong template mới thì điền cho project.
5. Cập nhật `frameworkVersion` trong `framework.config.json` cho khớp `Version` mới của `docs/ai/workflow.md`.
6. Thêm entry vào `docs/ai/framework-history.md` với heading `## v<Version mới>` (checker yêu cầu khớp `Version`); cập nhật tag + commit kit trong `FRAMEWORK_ADOPTION.md`.
7. Chạy `node scripts/framework-check.mjs`, sửa tới khi exit 0.
8. Đi qua integration mechanism của project; HUMAN LEAD duyệt (đổi Core là project-wide policy).

## Ghi chú

- Nâng version không tự đổi tài liệu authority của project; chỉ thay Core, adapter, checker và mục template mới.
- Tag mới có thể đổi tên field mà checker kiểm; `CHANGELOG.md` sẽ nói rõ.
