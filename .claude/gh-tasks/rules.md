# gh-tasks rules

Project additions to the gh-tasks skills. Each heading is read at a fixed moment; an empty or missing
heading is skipped. Content may be in any language.

## Pick
<!-- next-task, before taking a task: what to skip, locks, size limits -->

## Plan
<!-- next-task, after reading the issue: where to look, notes to read -->
- Always show the plan and wait for «ok» before writing code, even when there are no open questions.

## Implement
<!-- next-task, before coding: project rules, schema or migration conventions -->
- A core rule names no technology — no library, framework or tool. A rule that needs such a name goes to a
  stack file.
- The plugin mentions no specific project: examples are generic.

## Verify
<!-- next-task, after checks and before showing: manual checks, reviewers, local URLs -->

## Commit
<!-- commit, before committing: anything beyond config.commit -->
- A user-visible change gets a line under `## [Unreleased]` in `CHANGELOG.md`, in the same commit.

## After commit
<!-- next-task, after each commit: syncs, merges -->

## Close
<!-- next-task, after closing: notes to update, knowledge to capture -->

## Triage
<!-- triage, while rewriting a body: markers to keep, comment conventions, extra line semantics -->

## Plan version
<!-- plan-version, while choosing scope: release size, themes, groups -->

## Release
<!-- release, before the gate: checks, version bump, changelog, steps after the commit -->
- Set `version` in `.claude-plugin/plugin.json` to X.Y.Z of the milestone; the file goes into the release commit.
- In `CHANGELOG.md`, add `## [X.Y.Z] — YYYY-MM-DD` right under `## [Unreleased]` and move its entries there;
  `[Unreleased]` stays empty. The file goes into the release commit.

## Release notes
<!-- release, while writing the GitHub Release notes: format, sections, links -->

## Ship
<!-- release, after the tag and the draft: push, deploy trigger -->

## After release
<!-- release, once the release is out: deploy checks, notes to prune, announcements -->
