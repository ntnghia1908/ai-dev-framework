# Project Bootstrap

## Purpose

Define the standard, session-independent protocol for starting a new project from this framework.

Each new project is an **independent repository** containing a snapshot/copy of the framework. The new project must not depend on the `ai-dev-framework` repository at runtime.

## Canonical source

The canonical framework source for Step 1 is:

- Repository: `ntnghia1908/ai-dev-framework`
- URL: https://github.com/ntnghia1908/ai-dev-framework
- Branch: `main`

When a human explicitly provides a different framework source, use that source instead.

**Important:** A new ChatGPT session must treat this document as the bootstrap protocol. The assistant must read this document from the source framework repository before performing Step 1 whenever the source repository is accessible.

## Standard flow

```
New IDEA
   ↓
Human creates an empty GitHub repository
   ↓
Human tells assistant:
"Đã tạo repo <repo-name>. Dựa vào ai-dev-framework, làm bước 1."
   ↓
Assistant reads PROJECT_BOOTSTRAP.md
   ↓
Bootstrap framework snapshot into target repository
   ↓
Verify bootstrap
   ↓
Report: BOOTSTRAP COMPLETE
   ↓
STOP
   ↓
Later: Product Agent interview
   ↓
IDEA → REQUIREMENT → TASK → IMPLEMENTATION
```

## Meaning of "Step 1"

**Step 1 = Project Bootstrap.**

Step 1 is a repository setup operation. It is **not** a requirements-analysis operation.

The preferred human command is:

> Đã tạo `<repo-url>`. Dựa vào `ai-dev-framework`, làm bước 1.

Equivalent wording such as:

> Đã tạo repo `<repo-name>` dựa vào `ai-dev-framework`, làm bước 1.

should be understood as the same command.

The assistant should infer:

- the explicitly supplied repository is the **TARGET**;
- `ai-dev-framework` is the **SOURCE FRAMEWORK**;
- Step 1 means **bootstrap the source framework into the target**.

## Step 1 procedure

### 1. Identify TARGET

Use the repository URL or repository name explicitly supplied by the human.

Verify that:

- the repository exists;
- the assistant has access;
- the repository is suitable for bootstrap.

If the repository does not exist or cannot be accessed, stop and report the blocker.

### 2. Identify SOURCE

Unless the human explicitly supplies another framework source, use:

`ntnghia1908/ai-dev-framework`, branch `main`.

Read `docs/ai/PROJECT_BOOTSTRAP.md` from the source before executing the bootstrap.

### 3. Bootstrap mode

Use an **independent snapshot copy**.

The target repository is:

- **not a fork**;
- **not a submodule**;
- **not a runtime dependency** on the framework repository;
- **not a shared live workspace**.

Copy the framework's project-ready structure and instructions into the target repository.

The target should contain the framework's usable project-layer files at the appropriate project paths, including the required:

- `AGENTS.md`
- `CLAUDE.md`
- `docs/ai/`
- `docs/product/`
- `docs/tasks/`
- `docs/workflow/`
- `scripts/`
- required tool adapters
- framework configuration
- applicable tests/checkers

Do not blindly preserve a framework-only `templates/` wrapper when the source file is intended to become a project-root file. Follow the source framework's installation/bootstrap conventions.

### 4. Preserve governance

Do not redesign or reinterpret the framework during Step 1.

Preserve:

- S0/S1/S2 governance;
- decision gates;
- task contract;
- Product Agent workflow;
- requirement validation;
- Claude requirement-to-task handoff;
- implementation authorization rules;
- execution profiles;
- circuit-breaker rules.

Do not introduce domain-specific architecture during bootstrap.

### 5. Project-specific initialization

Only initialize repository metadata that is explicitly part of the framework bootstrap contract.

Do **not**:

- analyze the project IDEA;
- interview the human about requirements;
- create `REQ-001`;
- create task contracts;
- design architecture;
- select databases, APIs, libraries, deployment technologies, or authentication systems;
- implement application code.

If the human included an IDEA in the same message, preserve it as context but do not turn it into requirements during Step 1.

### 6. Verify

After copying the framework:

1. Verify the expected project-layer structure exists.
2. Verify the core Product Agent instructions are present.
3. Verify the Claude requirement-to-task adapter is present when included by the source snapshot.
4. Run the applicable deterministic framework/product checker when the target has enough files to run it.
5. Check that no unintended application/domain files were created.

If verification fails, report the failure; do not claim bootstrap completion.

### 7. Completion boundary

When Step 1 succeeds, report:

> **BOOTSTRAP COMPLETE**

Include:

- target repository;
- source framework and source branch;
- framework snapshot/version if available;
- verification result.

Then **STOP**.

Do not automatically start the Product Agent interview in the same turn unless the human explicitly asks to continue.

The next human message can be as simple as:

> Bắt đầu Product Agent.

or provide the project IDEA.

## Repository model

```
ai-dev-framework/main
      │
      │ independent snapshot
      ▼
faculty-app-platform
      │
      ├── own requirements
      ├── own tasks
      ├── own implementation
      └── own project history
```

Changes made later to `ai-dev-framework` do not automatically change an existing project. A future framework upgrade is a separate, explicit operation.

## Human interaction contract

### Minimal command

The recommended command is:

> Đã tạo `https://github.com/<owner>/<repo>`. Dựa vào `ai-dev-framework`, làm bước 1.

### If the target is not ready

If the target repository has not been created, ask the human to create it first.

If the target contains existing project content, do not overwrite it blindly. Inspect the repository and ask before performing a destructive bootstrap.

## Scope

This document defines only project bootstrap behavior. It does not replace or modify:

- S0/S1/S2 governance;
- Product Agent requirements;
- requirement validation;
- Claude requirement-to-task handoff;
- task approval or implementation workflow.

Those remain governed by their respective framework documents.
