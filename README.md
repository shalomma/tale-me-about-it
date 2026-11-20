# ספרו לי על זה (Tale Me About It)

A Hebrew (RTL) bibliotherapy site: parents of children aged 3–5 describe what their child is going through and how used to being read to the child is, and the site recommends picture books with a full analysis and questions to ask while reading. Ported from a Gemini Canvas prototype (kept in `reference/gemini-original.html`).

## Stack

- Next.js 16 (App Router, Cache Components), React 19, TypeScript, Tailwind CSS 4
- Catalog: one JSON document validated with Zod (`lib/catalog/schema.ts`)
  - local dev: `data/books.json` (admin edits show up as a git diff)
  - production: a private file in Vercel Blob, seeded from `data/books.json` on first read
- Admin: password-protected `/admin` (signed cookie, checked in `proxy.ts` and again in every page/action)
- Book agent: Claude (`claude-opus-5-5`) with web search, called from `app/api/admin/agent/route.ts`

## Run locally

```bash
cp .env.example .env.local   # set ADMIN_PASSWORD, ADMIN_SESSION_SECRET, optionally ANTHROPIC_API_KEY
npm install
npm run dev                  # http://localhost:3000, admin at /admin
```

## Deploy to Vercel

1. Import the repo in Vercel.
2. Storage → create a **Blob** store and connect it to the project (sets `BLOB_READ_WRITE_TOKEN`).
3. Set `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `ANTHROPIC_API_KEY` in Environment Variables.
4. Deploy. The first admin save copies the catalog into Blob; from then on Blob is the source of truth, and `data/books.json` is only the initial seed.

Deploys run from GitHub Actions (`.github/workflows/ci.yml`), not Vercel's GitHub app: every push and PR is linted and type-checked, pushes to `main` deploy to production, and PRs get a preview URL. The workflow needs a `VERCEL_TOKEN` repository secret plus the `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` repository variables.

## How the pieces fit

| Path | What it does |
|---|---|
| `app/(site)/` | Public site: landing page, smart-match form, library, `/books/[id]` |
| `app/admin/(panel)/` | Dashboard (coverage gaps, review queue), catalog table, book editor |
| `app/admin/actions.ts` | Server Actions: login/logout, save, publish toggle, delete |
| `app/api/admin/agent/route.ts` | Runs the agent, streams progress as NDJSON |
| `lib/agent/book-agent.ts` | Prompt, web search, strict `submit_book_review` tool |
| `lib/catalog/` | Schema, storage (Blob or file), cached public queries, matching |
| `scripts/extract-catalog.mjs` | One-off extraction of the 20 books from the Gemini prototype |

### The agent

- **Fact-check** (existing book): confirms the book and author exist, compares the entry with the real plot, lists issues and sources, and proposes a corrected entry.
- **Research & draft** (new book): researches a title and drafts a full entry.

Nothing the agent writes is saved automatically: the editor shows a field-by-field diff, you apply it to the form, review, and save. The latest review is stored on the book (`agentReview`) so it survives reloads.

### Publishing and caching

Public pages read the catalog through a `"use cache"` function tagged `catalog`. Every admin save calls `updateTag("catalog")`, so changes appear on the site immediately; otherwise the cache refreshes hourly.
