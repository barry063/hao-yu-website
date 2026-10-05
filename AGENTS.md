# Hao Yu academic website — agent instructions

## Working plan

For website updates, read `docs/WEBSITE_UPDATE_PLAN.md` before editing. It is the
durable task list, acceptance contract and progress record. Follow the latest user
instruction when it changes scope; record that change in the plan.

At the start of each implementation session:

1. Inspect `git status --short` and preserve existing user changes.
2. Read the plan's decisions, task tracker and latest session entry.
3. Recheck the relevant canonical sources; a previous review is a dated snapshot.
4. Select the next incomplete task whose dependencies are satisfied.
5. Implement it and verify its acceptance criteria before updating its status.

Complete independent work when another task needs evidence or a user decision.
Ask only for information necessary for the affected work. Do not manufacture a
pause merely because an optional preference is unresolved.

## Factual sources

The separate `0 Core CV Infra` workspace owns the academic evidence. Read its
`AGENTS.md` before working with its files. Use the source hierarchy and source map
in the website plan. Treat the website as a curated derivative of that evidence.

Do not infer an awarded doctorate from thesis submission. Distinguish published,
under-review and in-preparation work, and distinguish personal measurements from
collaborator-acquired data. Preserve contribution boundaries.

Hold unsupported claims in the working record; omit them or use supported wording
in the public page. Never publish `[VERIFY]` markers, internal review CVs, referee
records, confidential company details or application archives. Avoid copying the
private evidence bank into this repository: GitHub Pages may serve repository
files, and public Git history remains accessible even for files not linked in the
page. Check the exposure of any proposed working records before committing them.

Use professional UK English. Keep historical facts, scientific interpretations
and future interests distinct.

## Implementation and verification

Preserve the static HTML/CSS/JS approach unless the user requests another stack.
Keep relative assets compatible with a GitHub Pages project URL. Implement the
initial content refresh before introducing the content generator.

For every completed task, record the acceptance IDs checked, commands or manual
checks used, actual results and evidence location in the plan. A checkbox alone is
not proof. Mark unavailable checks as `NOT RUN`; do not report them as passing.

Keep `READY_TO_PUBLISH` and `LIVE_VERIFIED` distinct. Deployment requires the
authority supplied by the current conversation; the existence of this plan alone
does not authorise a commit, push or publication. Follow any existing authorisation
without requesting it again.

At handoff, report completed task IDs, verification results, remaining tasks and
any specific dependency preventing progress. Update the plan so another agent can
resume without reconstructing the conversation.
