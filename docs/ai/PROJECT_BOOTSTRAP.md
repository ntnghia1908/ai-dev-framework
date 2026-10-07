# Project Bootstrap

## Purpose

Define the standard way to start a new project from this framework.

Each new project is an **independent repository** containing a snapshot/copy of the framework. The new project must not depend on the `ai-dev-framework` repository at runtime.

## Standard flow

```
New IDEA
   ↓
Human creates an empty GitHub repository
   ↓
ChatGPT: "Đã tạo repo <repo-name>. Làm bước 1."
   ↓
Bootstrap framework into the new repository
   ↓
Confirm bootstrap is complete
   ↓
Start Product Agent interview
   ↓
IDEA → REQUIREMENT → TASK → IMPLEMENTATION
```

## Meaning of "Step 1"

**Step 1 = Project Bootstrap.**

When the human says:

> Đã tạo repo <repo-name>. Làm bước 1.

the assistant should interpret this as a request to bootstrap the current framework snapshot into that repository.

The assistant should:

1. Verify that the target repository exists and is accessible.
2. Copy/bootstrap the framework structure and required instructions into the target repository.
3. Preserve the current framework governance and Product Agent workflow.
4. Confirm that the bootstrap is complete.
5. Only after bootstrap is complete, begin the Product Agent workflow when the human provides or confirms the project IDEA.

The assistant must **not**:
- create a new architecture during bootstrap;
- turn the initial IDEA into requirements before the bootstrap is complete;
- modify the framework governance merely because the new project has a different domain;
- create a dependency from the project repository back to `ai-dev-framework`.

## Repository model

```
ai-dev-framework
      │
      │ framework snapshot / copy
      ↓
new-project-repo
      │
      ├── own requirements
      ├── own tasks
      ├── own implementation
      └── own project history
```

A project repository is therefore an **independent copy**, not a fork and not a shared live workspace.

## Human interaction contract

The preferred short command for starting a new project is:

> Đã tạo repo `<repo-name>`. Làm bước 1.

If the repository has not yet been created, the assistant should ask the human to create the empty repository first rather than assuming it exists.

After Step 1 is complete, the assistant should report completion and wait for the project IDEA/interview to begin.

## Scope

This document defines only project bootstrap behavior. It does not replace or modify:

- S0/S1/S2 governance;
- Product Agent requirements;
- requirement validation;
- Claude requirement-to-task handoff;
- task approval or implementation workflow.

Those remain governed by their respective framework documents.
