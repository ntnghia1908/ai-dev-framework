# Project Bootstrap Contract

Version: 1.1

## Purpose

A new project is an independent snapshot of ai-dev-framework.

It is not a fork and must not have a runtime dependency on ai-dev-framework.

## Standard user command

For a new empty GitHub repository, the user can say:

> "Đã tạo repo <repo-name>. Làm bước 1."

Bước 1 means Project Bootstrap only.

The assistant must not start Product Agent requirement discovery during bootstrap.

## Bootstrap modes

### Mode A — GitHub-connected bootstrap (preferred)

When the assistant can write to the target GitHub repository, use the one-file bootstrap stub:

1. Verify the target repository is empty except for .git / its initial technical state.
2. Create .github/workflows/framework-bootstrap.yml in the target repository.
3. The workflow clones the framework source and creates the project snapshot in one GitHub Actions run.
4. The workflow removes itself after the snapshot is committed.
5. Verify the resulting tree contains the expected framework files.
6. Run or verify node scripts/framework-check.mjs.
7. Report Bước 1 complete.

This mode minimizes GitHub API operations: the assistant writes only the bootstrap stub, while GitHub Actions performs the bulk copy.

The workflow currently uses main as the framework source. For reproducible releases, replace FRAMEWORK_REF with a framework tag or commit when the project adopts a release.

### Mode B — Local bootstrap

When the framework is already cloned locally, run:

    bash scripts/bootstrap-project.sh /path/to/new-project

The script copies the same project-layer snapshot locally and does not modify the framework repository.

## Bootstrap invariants

During Bước 1:

- Do not create REQ-001 or any product requirement.
- Do not start the Product Agent interview.
- Do not design application architecture.
- Do not change S0/S1/S2 governance.
- Do not introduce a runtime dependency on ai-dev-framework.
- Do not convert the new repository into a fork.
- Preserve the framework snapshot as project-owned files.

After bootstrap is verified, wait for the user's IDEA.

## Expected transition

    empty GitHub repo
          |
    BƯỚC 1 — Project Bootstrap
          |
    framework snapshot verified
          |
         WAIT
          |
         IDEA
          |
    Product Agent interview
          |
        REQ-001
