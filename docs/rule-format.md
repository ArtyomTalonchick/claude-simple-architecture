# Rule format

Every rule in the plugin has the same shape, so the agent reads each one the same way and a review can check
each one the same way.

## Where rules live

- Core rules: `skills/simple-architecture/references/core/<rule>.md`. They name no technology — no library,
  framework or tool.
- Stack rules: `skills/simple-architecture/references/stack/<tech>/<rule>.md`, named as the core rule they carry
  out, next to the stack's `README.md` with its list of rules. They say how a core rule is carried out with one
  technology and never contradict the core.

A rule that needs a technology's name to make sense is a stack rule, not a core rule.

## Template

Copy this block and fill in every section. A section with nothing to say gets "None." — it is not removed.

````markdown
## <Rule name>

**Rule.** One or two sentences in the imperative: what the code must do or must not do.

**Why.** The problem the rule prevents, in one short paragraph.

**How to check.** Concrete steps the agent can follow on a diff or a file:

- what to look for (imports, file locations, names);
- what counts as a violation.

**Good.**

```
<short generic example that follows the rule>
```

**Bad.**

```
<the same example, broken in the way the rule forbids>
```

**Stack notes.** For a core rule: links to the stack files that refine it, or "None." For a stack rule: the core
rule it carries out.
````

## Writing a rule

- Plain, short English. One rule, one idea; split a rule that needs "and also".
- Examples are generic: names like `orders`, `user-profile`, `PriceLabel` — never a real project.
- Good and Bad show the same case, so the difference is the rule itself.
- "How to check" must be something the agent can actually do from code, not a matter of taste.

## How a rule is added

1. **Ideas.** The ideas are discussed until each one is either a rule (core or stack), a principle, or dropped.
2. **Issue.** The agreed ideas go into a GitHub issue: what each rule is about and whether it is core or stack.
   One issue may cover a set of related rules; the details are settled while the rules are written.
3. **Rule.** Each rule is written by the template above, in the right file, one commit per rule. Questions that
   come up while writing it go to [questions.md](questions.md). The change gets a line under `## [Unreleased]` in
   [CHANGELOG.md](../CHANGELOG.md).
4. **Release.** The rule ships with the next version: the changelog entries move under the new version and the
   plugin version is bumped.
