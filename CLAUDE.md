# CLAUDE.md

This file provides guidance for AI assistants (such as Claude) working in this repository.

## Project Overview

**HelloWorld** is a minimal demonstration/test repository. It contains no application source code, no dependencies, no build system, and no tests. It exists primarily as a baseline git repository for experimentation and onboarding.

## Repository Structure

```
HelloWorld/
├── README.md      # Project title and placeholder text
└── CLAUDE.md      # This file — AI assistant guidance
```

## Development Workflow

### Branching

- Base branch: `master`
- Feature/task branches follow the pattern: `claude/<description>-<id>` (e.g. `claude/claude-md-docs-1ACFC`)
- Always develop on the designated feature branch; never push directly to `master`

### Commits

- Write clear, descriptive commit messages in the imperative mood (e.g. "Add CLAUDE.md with codebase guidance")
- Keep commits focused on a single logical change

### Pushing

```bash
git push -u origin <branch-name>
```

If a push fails due to a network error, retry up to 4 times with exponential backoff (2s, 4s, 8s, 16s).

## Build, Test, and Lint Commands

None. This repository has no source code, build system, test framework, or linter. There is nothing to build, test, or lint.

## Conventions for AI Assistants

- **Do not add source code** unless the user explicitly requests it.
- **Do not add dependencies** (package.json, requirements.txt, etc.) unless explicitly requested.
- **Keep changes minimal** — this repo is intentionally sparse.
- **Commit and push** completed work to the active feature branch.
- **Do not open pull requests** unless the user explicitly asks for one.
