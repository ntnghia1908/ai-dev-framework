# OpenAI Product / Requirement Agent

Turns an IDEA into docs/product/requirements/REQ-<number>-<slug>.md and can hand it off to Claude through a GitHub PR.

## One-command usage

Linux / macOS / Git Bash:

    ./product "I want an app to manage thesis"

Windows PowerShell / CMD:

    .\product.cmd "I want an app to manage thesis"

The runner will:

1. Interview you in small question batches.
2. Keep conversation state with Responses API.
3. Return a structured requirement.
4. Run scripts/product-check.mjs.
5. Create product/REQ-xxx-<slug>.
6. Commit and push the branch.
7. Create a GitHub PR.
8. Let the repository's Claude workflow consume the READY requirement and create DRAFT task contracts.

## Environment

Required:

    OPENAI_API_KEY

Optional:

    OPENAI_MODEL=gpt-6-astra
    PRODUCT_MAX_TURNS=12
    PRODUCT_OWNER="HUMAN LEAD"

For automatic PR creation, either:

    GITHUB_TOKEN=<token>

or:

    GH_TOKEN=<token>

Alternatively authenticate GitHub CLI with gh and let the runner call gh pr create.

On Windows PowerShell:

    $env:OPENAI_API_KEY = "sk-..."
    $env:GITHUB_TOKEN = "github_pat_..."

Do not commit API keys or tokens into the repository.

## Safety / gates

The runner requires a clean git working tree. This prevents the Product Agent from mixing its requirement with unrelated work.

READY means ready for development planning. It does not mean implementation authorized.

The Claude requirement-to-task workflow creates DRAFT task contracts only. Existing HUMAN LEAD approval and Implementation authorized: YES rules remain unchanged.

## Options

    ./product "..." --dry-run

Creates the branch and local commit but skips push and PR.

    ./product "..." --no-pr

Pushes the branch but skips PR creation.

## API design

The runner uses the OpenAI Responses API with Structured Outputs via text.format/json_schema. Multi-turn discovery uses previous_response_id and resends the stable system instructions on every turn, as required by the Responses conversation model.

Official references:
- https://developers.openai.com/api/docs/guides/structured-outputs
- https://developers.openai.com/api/docs/guides/conversation-state
- https://developers.openai.com/api/reference/typescript/resources/responses