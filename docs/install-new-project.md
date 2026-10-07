# Cài kit vào project mới

Dành cho repository mới (greenfield). Project đã có tài liệu / quy ước: xem [`install-existing-project.md`](install-existing-project.md). Hiểu cơ chế trước: [`mechanism.md`](mechanism.md).

## Chuẩn bị

- Clone kit, checkout tag muốn dùng (ghi tag + commit để điền vào `FRAMEWORK_ADOPTION.md`).
- Node >= 20 (checker chỉ dùng stdlib).
- Project là git repository; quyết trước: tên project, integration mechanism (branch / PR / ai merge), execution profile được phép.

## Các bước (thứ tự adoption)

Biến `KIT` là đường dẫn tới bản clone của kit; chạy trong root project.

1. **Core** (nguyên văn, không sửa sau khi chép):

   ```bash
   cp -r "$KIT/core/docs" .
   ```

2. **Project Layer** (template có chỗ trống):

   ```bash
   cp -rn "$KIT/templates/." .
   ```

3. **Product layer + adapters**:

   Chọn các adapter cần dùng và copy đúng adapter vào project. Adapter là implementation của role; không suy luận role từ tên model/vendor.

   ChatGPT Product Agent adapter:
   ```bash
   mkdir -p adapters/chatgpt
   cp -a "$KIT/adapters/chatgpt/." adapters/chatgpt/
   ```

   Claude Code ORCHESTRATOR / IMPLEMENTER adapter:
   ```bash
   mkdir -p adapters/claude-code
   cp -a "$KIT/adapters/claude-code/." adapters/claude-code/
   cp -a "$KIT/adapters/claude-code/.claude" .
   mkdir -p .github/workflows
   cp "$KIT/adapters/claude-code/workflows/requirement-to-task.yml" .github/workflows/
   ```

   Copilot / Codex: cài theo adapter tương ứng nếu project cần.

   Product / Requirement layer đã nằm trong Project Layer:
   - `docs/product/PRODUCT_AGENT.md`
   - `docs/product/requirements/_template.md`

   Chỉ chép adapter bạn dùng, rồi chỉnh `adapters` và `agents` trong `framework.config.json` cho khớp.

4. **Checker**:

   ```bash
   mkdir -p scripts && cp "$KIT/scripts/framework-check.mjs" scripts/
   ```

5. **Điền chỗ trống.** Tìm mọi marker:

   ```bash
   grep -rn "<!-- FILL:" . --include='*.md'
   ```

   Điền lần lượt: `docs/ai/project-profile.md` (project là gì, authority order, module map — phân biệt planned / implemented, integration mechanism, execution profile được phép, setup, lệnh test trong Test policy), `AGENTS.md` (mục Project boundary: điền hoặc xóa), `docs/workflow/current-state.md`, `FRAMEWORK_ADOPTION.md` (kit + tag + commit; Adopted / Adapted / Not adopted), `docs/ai/framework-history.md` (entry adoption dưới `## v4.2`). Xóa dấu `<!-- FILL: ... -->` khi đã điền.

6. **Cấu hình checker** (`framework.config.json`):

   - `frameworkVersion`: khớp `Version` trong `docs/ai/workflow.md`.
   - `adapters`: danh sách adapter đã chép vào `adapters/`.
   - `agents.product` / `agents.orchestrator`: role binding phải trỏ tới adapter enabled và adapter đó phải hỗ trợ role.
   - `requiredFiles` / `requiredTokens`: file / chuỗi riêng project muốn checker giữ (vd `README.md`, một decision record, một cụm chữ trong project profile). Có thể để trống.
   - `taskDir`, `decisionDir`: thư mục task contract và decision record (mặc định `docs/tasks`, `docs/decisions`; thư mục không tồn tại thì bỏ qua).

7. **Kiểm tra:**

   ```bash
   node scripts/framework-check.mjs   # kỳ vọng: toàn PASS, exit 0
   ```

   Lỗi in dạng `FAIL: <file>: <lý do>`; `unfilled template marker` nghĩa là còn `<!-- FILL:` ở file đó.

8. **Pilot S1.** Làm một task S1 nhỏ đầu tiên đúng quy trình (contract → approve → thực thi → review → READY) để kiểm adapter và integration mechanism thật sự chạy. Không tuyên bố adoption hoàn tất trước bước này (ghi vào mục Verification status của `FRAMEWORK_ADOPTION.md`).

9. **Commit** theo integration mechanism vừa chọn.

## Tùy chọn

- Module có convention riêng đủ rõ: thêm `<module>/AGENTS.md` (project profile ghi pointer).
- Rule mới của project: đặt ở `docs/ai/project-profile.md` hoặc decision record, không sửa `docs/ai/workflow.md`.
