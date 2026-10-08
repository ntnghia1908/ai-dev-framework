# Framework History

| Metadata | Value |
|---|---|
| Status | CURRENT |
| Scope | Lịch sử thay đổi framework (core, adapter, checker) của project này sau adoption |

File này chỉ ghi lịch sử; rule hiện hành nằm ở canonical owner của nó (`docs/ai/workflow.md`, `docs/ai/execution-profiles.md`, adapter, checker).

## Quy ước

- Mỗi thay đổi framework (core, adapter, checker) thêm một entry mới: ngày, thay đổi, lý do, PR/commit.
- Version tăng khi rule trong Framework Core thay đổi, hoặc khi HUMAN LEAD quyết một đợt thay đổi adapter / project policy đủ lớn để đánh version mới. Thay đổi nhỏ chỉ ở adapter hoặc checker ghi entry dưới version hiện tại, không tăng version.
- Heading version có dạng `## v<Version>`, khớp giá trị `Version` trong metadata của `docs/ai/workflow.md`; `scripts/framework-check.mjs` kiểm tra điều này.

## v4.4

- Ngày: 2026-10-08
- Thay đổi: thêm boundary authorization mode và bounded task-level parallelism cho multiple IMPLEMENTER instances (1–3). Boundary-authorized task không cần APPROVE TASK riêng; decision gates vẫn thuộc HUMAN LEAD.
- Lý do: giảm bottleneck do per-task approval sau khi một implementation boundary đã được HUMAN LEAD chấp thuận, đồng thời cho phép fan-out các task độc lập.
- Decision: HUMAN LEAD 2026-10-08.
- Task: TASK-002-boundary-authorization-parallel.

## v4.3

- Agent Adapter Architecture v1: provider-neutral role contracts, machine-readable adapter descriptors, project role bindings and task-level IMPLEMENTER selection.
- Existing S0/S1/S2 governance, approval gates, verification and integration ownership remain unchanged.

## v4.2

- Ngày: <!-- FILL: ngày adopt -->
- Thay đổi: adopt Framework kit v4.2 (<!-- FILL: repo kit + tag + commit -->). Chi tiết: `FRAMEWORK_ADOPTION.md`.
- Lý do: <!-- FILL: lý do adopt -->
- PR: <!-- FILL: PR/commit adoption -->
