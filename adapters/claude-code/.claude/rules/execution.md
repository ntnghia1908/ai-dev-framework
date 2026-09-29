# Claude Code — execution adapter

Adapter riêng cho Claude Code. Shared workflow nằm ở `AGENTS.md` và `docs/ai/`.

@../../docs/workflow/current-state.md

## Mapping vai trò

- `dual-agent`: main session = ORCHESTRATOR; `.claude/agents/implementer` = IMPLEMENTER.
- `single-agent`: main session đóng cả ORCHESTRATOR + IMPLEMENTER; không delegate implementer.
- Không gọi agent/model/AI CLI ngoài execution profile và field `Implementer` của task.

## Chọn IMPLEMENTER

Task `dual-agent`: ORCHESTRATOR chọn IMPLEMENTER theo Danh sách IMPLEMENTER ở `docs/ai/project-profile.md` §7 lúc viết contract và ghi vào field `Implementer`. Gọi adapter tương ứng: subagent `implementer` (Claude Code), hoặc CLI của adapter khác theo README của adapter đó (`adapters/<tool>/README.md` trong kit). Chỉ gọi IMPLEMENTER ghi trong contract.

## Delegation

Giao task cho implementer kèm task contract, base commit, `Implementation authorized: YES` và plan ngắn.
Cùng task thì resume đúng context; task mới dùng context mới.

## Session

Bootstrap từ repository. Session mới không dùng transcript chat làm authority.

## Kết thúc session

Rule session scope và handoff: `docs/ai/workflow.md` §9. Trong Claude Code, khi đủ scope thì đề xuất `/clear` và đưa handoff prompt trong một code block để dán vào session mới.
