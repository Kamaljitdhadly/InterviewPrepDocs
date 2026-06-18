# Interview Prep Knowledge Base

Markdown interview Q&A for **C#**, **.NET**, **JavaScript**, **TypeScript**, **SQL Server**, **Angular**, **React**, **Docker**, **Kubernetes**, **Azure**, **Microservices**, **System Design**, and more.

**Start here:** [`STUDY.md`](STUDY.md) — learning paths and topic index.

## Folder layout

| Folder | What it is |
|--------|------------|
| [`study/`](study/) | **Primary study notes** — condensed answers, all code kept |
| [`full/`](full/) | Full normalized answers (more detail) |
| [`extracted/`](extracted/) | Raw Pandoc output from `docx/` (includes `media/`) |
| [`docx/`](docx/) | Source Word files (read-only input) |
| [`scripts/`](scripts/) | Normalize, format, and audit pipeline |

## Quick commands

```bash
# Normalize a topic from extracted → full
node scripts/normalize.mjs --topic "MongoDB"

# Refresh the master index
node scripts/build-study-guide.mjs

# Check study vs full parity
node scripts/audit-study-full.mjs
```

## How to study

1. Pick a path in `STUDY.md` for your role.
2. Read files under `study/{Topic}/`.
3. Use **Questions Covered** at the top of each file as a drill list.
4. Open `full/{Topic}/` when you want longer explanations.
