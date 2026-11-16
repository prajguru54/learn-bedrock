# Bedrock Learning Repo — Agent Instructions

This repo contains multiple independent projects for learning Amazon Bedrock and
preparing for the AWS Certified Generative AI Developer - Professional (AIP-C01) certification.

## Repo Structure

```
bedrock/
├── README.md
├── AGENTS.md                   ← this file
├── CLAUDE.md                   ← imports AGENTS.md
├── .claude/                    ← shared agent artifacts (skills, commands, rules, agents)
│   └── skills/, rules/, agents/, commands/
├── .kiro/                      ← same, for Kiro-based tooling
│   └── skills/, rules/, agents/, commands/
├── <project-name>/             ← one folder per project (deployment unit)
│   ├── pyproject.toml
│   ├── uv.lock
│   ├── .python-version
│   ├── .venv/
│   ├── src/
│   ├── tests/
│   ├── infra/                  ← Terraform or CDK for this project
│   ├── Dockerfile
│   └── README.md
└── labs/                       ← throwaway learning scripts, not deployable
    └── *.py
```

## Developer Background

See [`my_background.md`](my_background.md) for the developer profile, learning objectives,
preferred teaching style, and technology preferences.

Read this file before teaching a concept or writing code. It tells you:
- What the developer already knows (Python, FastAPI, LangChain, RAG, AI agents)
- What is new to them (AWS, cloud infrastructure, Bedrock-specific architecture)
- How they prefer to learn (by building, incrementally, Boto3 before abstractions)
- How to pitch explanations (experienced GenAI dev, AWS beginner)

## Exam Alignment

This repo targets the **AWS Certified Generative AI Developer - Professional (AIP-C01)** certification.
The official exam guide is at [`aip_01_exam_guide.md`](aip_01_exam_guide.md).

When teaching concepts or scoping a project, consult the exam guide to:
- Confirm the concept appears in the exam domains
- Frame explanations and exercises around what the exam tests
- Flag topics the exam emphasises that the current project doesn't yet cover

## Decisions

### Each project is fully independent
Every project has its own `pyproject.toml`, `uv.lock`, `.python-version`, and `.venv`.
There is no root-level uv workspace. Projects are not coupled through a shared lock file.

**Why:** Each project is independently deployable to AWS. Strict isolation at the
dev environment level matches the deployment model.

### No shared utilities folder
Do not create a `shared/` or `common/` package preemptively.
If two projects genuinely duplicate code, extract it at that point — not before.

**Why:** Shared code between independently deployable projects creates coupling.
It is a premature abstraction until there is real duplication.

### labs/ for learning spikes only
Single-file scripts go in `labs/`. No project structure, no deployment, no lock file.
When a lab concept matures into a real project, it gets its own top-level folder.

### Infrastructure lives inside each project
Each project's `infra/` folder contains its own Terraform or CDK code.
There is no shared infrastructure layer.

### Agent artifacts live at the repo root, not inside projects
Skills, commands, rules, and agent definitions live in root `.claude/` and `.kiro/`.
They are shared across all projects during development and excluded from deployment.

**Why:** Agent artifacts are dev-time tooling, not application code. Projects are
independently deployable — their folders contain only what gets shipped to AWS.
Keeping agent config at the root avoids duplicating it across every project.

### Python tooling
- Package manager: `uv`
- Run `uv sync` inside the project folder before working on it
- Python version pinned per project in `.python-version`

## Adding a New Project

1. Create a top-level folder with a short, descriptive name (e.g. `rag-document-search`)
2. Inside it, run: `uv init && uv add boto3`
3. Add `src/`, `tests/`, `infra/`, `Dockerfile`, `README.md`
4. Work only within that folder — do not reference other projects
