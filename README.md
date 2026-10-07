# AI Dev Framework — starter kit

Bộ khung quy trình để một người (HUMAN LEAD) và một hoặc hai AI agent làm việc trong cùng repository mà không lệch scope: Product Agent biến IDEA thành REQUIREMENT; repository là source of truth; agent tự thực thi bên trong boundary do người duyệt.

Phiên bản hiện tại: **4.3** (xem `VERSION`, `CHANGELOG.md`). Framework v4 gốc được phát triển trong một project web trước đó; kit này là bản tách ra để dùng lại cho project bất kỳ, đã chạy thật qua nhiều task ở project dùng nó đầu tiên.

Tài liệu bằng tiếng Việt; tên file, field và thuật ngữ canonical giữ English.

## Kit gồm gì

```text
core/                  nguyên văn, project không sửa
  docs/ai/workflow.md              quy trình S0/S1/S2, decision gate, lifecycle, review, integration, session
  docs/ai/execution-profiles.md    vai trò và profile dual-agent / single-agent
templates/             Project Layer, có chỗ trống <!-- FILL: ... -->
  AGENTS.md  CLAUDE.md  FRAMEWORK_ADOPTION.md  framework.config.json
  docs/ai/project-profile.md  docs/ai/framework-history.md
  docs/workflow/current-state.md  docs/tasks/_template.md
  docs/product/                    IDEA → REQUIREMENT layer
adapters/              Tool Adapter, chọn theo tool đang dùng
  chatgpt/             connected Product / Requirement Agent adapter
  claude-code/         ORCHESTRATOR + IMPLEMENTER rules + REQ handoff
  copilot/             pointer + custom agent implementer (đã pilot gói Free 2026-09-29)
  codex/               README: Codex CLI làm IMPLEMENTER (CHƯA KIỂM CHỨNG)
scripts/framework-check.mjs        checker cấu trúc, Node stdlib, đọc framework.config.json
tests/                 kiểm chính checker
docs/                  mechanism, install-new-project, install-existing-project, upgrade
```

Ba lớp: **Framework Core** (làm việc thế nào) → **Project Layer** (project này là gì, đang ở đâu) → **Tool Adapter** (tool cụ thể hiện thực vai trò thế nào). Chi tiết: [`docs/mechanism.md`](docs/mechanism.md).

## Cài nhanh

Project mới (chi tiết: [`docs/install-new-project.md`](docs/install-new-project.md)):

```bash
KIT=/path/to/ai-dev-framework   # bản clone của kit, checkout tag mong muốn
cp -r $KIT/core/docs .          # Core
cp -rn $KIT/templates/. .       # Project Layer (không ghi đè file có sẵn)
mkdir -p adapters/chatgpt adapters/claude-code
cp -a $KIT/adapters/chatgpt/. adapters/chatgpt/
cp -a $KIT/adapters/claude-code/. adapters/claude-code/
cp -a $KIT/adapters/claude-code/.claude .
mkdir -p .github/workflows && cp $KIT/adapters/claude-code/workflows/requirement-to-task.yml .github/workflows/
mkdir -p scripts && cp $KIT/scripts/framework-check.mjs scripts/
# điền mọi <!-- FILL: ... --> rồi
node scripts/framework-check.mjs
```

Project có sẵn: [`docs/install-existing-project.md`](docs/install-existing-project.md). Nâng version: [`docs/upgrade.md`](docs/upgrade.md).

## Kiểm kit

```bash
node --test          # chạy tests/*.test.mjs (Node >= 20)
```

Nếu Node của bạn chấp nhận đường dẫn thư mục, `node --test tests/` cũng được; Node 24 trở lên coi `tests/` là module nên dùng `node --test` không tham số.

## Phiên bản và giới hạn

Core v4.3 là bản rút gọn so với framework v4 gốc; các chỗ còn thiếu được liệt kê ở mục "Giới hạn đã biết" của [`docs/mechanism.md`](docs/mechanism.md).
