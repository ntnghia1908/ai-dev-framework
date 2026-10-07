# OpenAI Product / Requirement Agent

Turns IDEA into docs/product/requirements/REQ-<number>-<slug>.md.

Responsibilities:
1. Interview the human.
2. Synthesize requirements.
3. Run the readiness gate.
4. Return NEEDS_CLARIFICATION or READY.

Non-responsibilities:
1. No code.
2. No architecture decision.
3. No dependency selection.
4. No silent scope expansion.

ChatGPT mode:
Use SYSTEM.md as operating instructions, give the raw idea, answer the small question batches, then save the READY artifact with the canonical template.

API mode:
Use the same system instructions with a structured response contract, render Markdown, run scripts/product-check.mjs, then commit the requirement. Keep the OpenAI model configurable through OPENAI_MODEL.

Recommended structured fields:
id, status, title, problem, goal, actors, current_workflow, desired_workflow, functional_requirements, non_functional_requirements, business_rules, edge_cases, acceptance_criteria, out_of_scope, assumptions, open_questions.

The Markdown requirement is the repository source of truth.

See docs/product-requirement-agent-v1.md for the end-to-end design.