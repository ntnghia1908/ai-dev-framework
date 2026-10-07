# Product / Requirement Layer

Canonical path: docs/product/requirements/REQ-<number>-<slug>.md

Purpose: convert an IDEA into a requirement that is ready for development planning.

Flow:
IDEA → DISCOVERY → REQUIREMENT → READINESS → READY → Claude ORCHESTRATOR → TASK CONTRACT

Requirement READY does not authorize implementation.

See adapters/openai-product-agent/SYSTEM.md for the Product Agent instructions and templates/docs/product/requirements/_template.md for the canonical artifact.

Claude consumes READY requirements through adapters/claude-code/REQUIREMENT_HANDOFF.md.

Status:
- DRAFT
- NEEDS_CLARIFICATION
- READY
- OBSOLETE