# claude-simple-architecture

Tasks live in GitHub Issues; the workflow is run by the gh-tasks plugin (`/gh-tasks:triage`,
`/gh-tasks:plan-version`, `/gh-tasks:next-task`). Config and project rules: `.claude/gh-tasks/`. A task
created from chat gets the `status:inbox` label and is created through the `scripts/gh.mjs` of the installed
gh-tasks plugin (under `~/.claude/plugins/cache/gh-tasks/`):
`node <plugin>/scripts/gh.mjs --project <project root> issue create --label status:inbox …`, so it is written as
the project's gh account.
