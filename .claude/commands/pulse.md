---
description: Regular check-in for this project: status, what changed since the last pulse, what's next. "/pulse deep" adds a deeper review.
---

# /pulse (nekometrics)

The one check-in command every project shares (Jordy's rule, 2026-10-23). Read-only unless he asks for a fix.

1. **Context.** Read CLAUDE.md (and the project memory if any). Find the previous run: `grep "| nekometrics |" ~/.claude/pulse-runs.log | tail -1`.
2. **What changed since then.** `git log --oneline --since=<last run>` (or the last 10 commits), uncommitted work, open TODO/ROADMAP items.
3. **Health.** Whatever CLAUDE.md names as this project's live checks (site up, store/Play state, builds, errors, stats). Skip what needs credentials you don't have; say so.
4. **Report** to Jordy, short: one status line (OK / needs attention), what changed, anything broken or waiting on him, the next 1 to 3 steps. Ask decisions with AskUserQuestion.
5. **Improve this file** when the run shows a better check for this project (it starts generic on purpose).

## `/pulse deep`
Called with `deep`: after the normal pulse, also do the deeper review (strategy, risks, what to stop, 1 to 3 proposals with value and size).

## Run log (shared, keep last)
Last step of every run, even a failed one: `~/.local/bin/pulse-log "nekometrics" ok "<one-line summary>"` (or `failed "<why>"`). Common reads `~/.claude/pulse-runs.log` to list overdue checks each week.
