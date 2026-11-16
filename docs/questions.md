# Questions

Questions that come up while turning architecture ideas into rules for AI. Writing a rule down often shows a gap:
a case the idea does not cover, two rules that pull in different directions, or a word that means different
things. Each such gap is logged here — the log is a result of its own.

## Format

Add new questions at the end. Number them in order; a number is never reused.

```markdown
## Q<N>. <Short question>

**Question.** The question in one or two sentences.

**Context.** Where it came up: the rule or the issue (#N), and why it matters.

**Status.** open | answered | dropped

**Answer.** The answer and where it went (a rule, a change to a rule, nothing). Empty while open; for a dropped
question, why it was dropped.
```

## Log

## Q1. Is a Presenter with no hook call a violation of the `use` prefix rule?

**Question.** A `usePresenter` that only computes from its props calls no hook. Does "Stateful logic in React is a hook" make it a violation?

**Context.** Found by the architecture-reviewer in the first real use of the plugin (#13); the React rules for the Presenter and for hooks pulled in different directions.

**Status.** answered

**Answer.** No: `usePresenter` is a hook by convention, whether or not it calls one. Written into "Stateful logic in React is a hook".

## Q2. Where does the design-system theme live, and does a dependency by key count?

**Question.** Ui-kit components looked up styles by key in a theme under the app root, and used an icon sprite outside the root. Is that an app dependency of the pure zone?

**Context.** Found by the architecture-reviewer in the first real use of the plugin (#13); the Pure zone check looked only at imports, and Levels had no place for a theme.

**Status.** answered

**Answer.** The theme is pure and lives in the lib folder. A dependency by key counts as an import of the place that registers the key. Files outside the root that are not app code (design assets) are allowed. Written into "Pure zone".

## Q3. Is a constant computed at module level in a View file allowed?

**Question.** A View file built a static list with a map and template strings outside its markup. Is that a computation in the View?

**Context.** Found by the architecture-reviewer in the first real use of the plugin (#13); the rules listed forbidden patterns only in markup.

**Status.** answered

**Answer.** No: the whole View file counts. A plain literal stays; a computed constant goes to the Presenter. Written into "View and Presenter" and its React side.

## Q4. May a View call styling hooks?

**Question.** A style recipe is read through a hook, and a View may call only its Presenter. Must styles go through the Presenter?

**Context.** Found by the architecture-reviewer in the first real use of the plugin (#13).

**Status.** answered

**Answer.** Yes, a View may read styles from the design system: styles are markup. Written into "View and Presenter"; the React side allows styling hooks that only return styles.

## Q5. Where do tests live, and what may they import?

**Question.** The rules said nothing of tests: a tests folder is not part of the level shape, and a test importing its code from one folder up looks like an import from a parent.

**Context.** Found by the architecture-reviewer in the first real use of the plugin (#13).

**Status.** answered

**Answer.** Tests live next to the code they test, are not part of the shape and do not count as users; a test may import the code it tests and what that code may import. Written into "Levels and placement" and "Imports".

## Q6. Relative paths or a path alias?

**Question.** Imports is written in terms of targets. Should it recommend a path style?

**Context.** Found by the architecture-reviewer in the first real use of the plugin (#13).

**Status.** answered

**Answer.** A one-line recommendation: own children and the code a test tests by a relative path, everything else through the root alias. Written into "Imports".

## Q7. Should stateful logic be split by concern?

**Question.** One piece of stateful logic held both a field and the request made with its value. Should the rules ask for two?

**Context.** Found by the architecture-reviewer in the first real use of the plugin (#13).

**Status.** answered

**Answer.** Yes: one concern per piece of stateful logic, joined in the Presenter. Written into "Stateful logic and helpers".

## Q8. Must a component always have a block body?

**Question.** Should components be written as `=> { return (…); }` rather than `=> (…)`, so that adding a Presenter call changes one line?

**Context.** Found by the architecture-reviewer in the first real use of the plugin (#13).

**Status.** dropped

**Answer.** A project style choice, not architecture: it belongs in the project linter, not in these rules.

## Q9. Should a View with several screens only choose between them?

**Question.** Should "one component per state or screen; the parent only chooses" be a rule?

**Context.** Found by the architecture-reviewer in the first real use of the plugin (#13).

**Status.** answered

**Answer.** An example, not a rule: the rules already allow it. Added as a second Good example to "View and Presenter".

## Q10. Is choosing a value by a condition in a View a computation?

**Question.** A View passed `src={image ?? undefined}`: it only turns `null` into the `undefined` a prop expects.
The rule forbids computations in a View but did not name a fallback, a default or an optional read.

**Context.** Found by the architecture-reviewer in a project that follows the plugin (#16); it called the case
borderline, so the same line could be judged two ways.

**Status.** answered

**Answer.** Yes: a fallback, a default, a value picked by a condition, an optional read and turning one kind of
"no value" into another are computations, and the Presenter returns the ready value. Choosing markup by a ready
flag stays allowed. Written into "View and Presenter"; the React side names `??`, `||`, `?:` on values and `?.`.

## Q11. Should a Presenter return a child's props as one value?

**Question.** A Presenter returned separate values (`hasPagination`, `page`, `total`, `changePage`) and the View
put them back together into a child's props. Should the Presenter return the child's props ready instead?

**Context.** Found in a project that follows the plugin (#15); "View and Presenter" said nothing about a child's
props.

**Status.** answered

**Answer.** A pattern, not a check: a Presenter may return a child's props as one ready value, typed by the child's
props type, or nothing when the child is hidden, and the View passes it on whole. A View that passes separate ready
values is not reported: that is not a computation. Written into "View and Presenter" with a React example; the
type-only import of the props type was already allowed by "Imports".

## Q12. Does a level's own unit count as a unit for its shared files?

**Question.** Shared folders, the types file and the constants file of a level are for code used by "two or more
units of this level". Does the level's own unit count as one of them, next to a child unit?

**Context.** Found in a project that follows the plugin (#17): a type used by a helper of the parent's own unit and
by one child unit. The reviewer accepted it in the parent's types file, but the other reading left the type with no
valid place.

**Status.** answered

**Answer.** Yes: the own unit counts. Code used by the own unit and by one child unit goes to a shared folder, the
types file or the constants file of the level, and the child imports it from there as code of a level above. The
same holds for all shared files of a level, not only types. Written into "Levels and placement" with an example.

## Q13. Does a derived value form a group of its own in the two-concerns test?

**Question.** The test calls stateful logic two concerns when "its state and results fall into two groups". A
filter returned options computed only from its input, the selected option and the filtered list; the options do not
read the selection. Are they a second group?

**Context.** Found in a project that follows the plugin (#18); the reviewer passed the filter as one concern but
noted that one could argue otherwise.

**Status.** answered

**Answer.** No: the groups are formed by state and lifecycle, not by results. A value computed only from the input,
memoized or not, has no state of its own and stays with the state it is returned next to. A value with state or
lifecycle of its own, such as a request, can form a second group. Written into "Stateful logic and helpers" with an
example.

## Q14. How can a level's folder show what is the own unit's, what is shared and what is a child?

**Question.** A level's folder mixes three kinds of entries: the own unit (View, Presenter, its stateful logic and
helpers), the level's shared code (shared folders, types and constants files) and the child units. They look the
same, so a large level is hard to read, and a child importing `../types` looks like a child importing from its
parent, though the rules allow it. Should the shape of a level make the three kinds visible?

**Context.** Found in a project that follows the plugin: one level held 9 own-unit files, another 6 files next to 7
child unit folders. The idea comes from Next.js App Router: a `(group)/` folder organises files and adds no route
segment. Options discussed, none agreed:

- `(children)/` — a fixed group that holds every child unit of the level, whenever there is one. Not a level of its
  own. Child units are not grouped by meaning: a free split would differ from one author to the next.
- Groups for stateful logic, by a fixed test: stateful logic with helpers that only it uses goes, with them and their
  tests, into a group named after it without `use` (`useOrderFilters` → `(orderFilters)/`). No private helpers — no
  group. The Presenter is not grouped: its own helpers stay loose. Rejected: one fixed `(logic)/` group (it only moves
  the crowd) and free groups by meaning (not checkable).
- `(children)/index.ts` — re-exports only the children's entries (the View and its props type), so a View imports
  all its children from `./(children)`. Rejected: an `index` file in every unit (more files, not fewer) and in logic
  groups (saves one word). Path aliases do not help: they are fixed prefixes and cannot drop a `(children)` segment.
- `(shared)/` — a fixed group for the level's shared code: shared folders, types and constants files. Then a
  descendant may import from an ancestor only what lies in its `(shared)/`; anything loose at an ancestor is that
  ancestor's own unit. The import check becomes a check of the path.
- A sub-option: inside `(shared)/` drop the folders by kind (`components/`, `hooks/`, `helpers/`) and tell the kind
  by name. It removes config keys and raises the question of `lib/`; to be settled separately.

The cost of the groups: one more folder segment per level, longer import paths, and `(children)/` holding a single
child. The leaning was `(shared)/` + `(children)/` + `(children)/index.ts` + logic groups by the fixed test, as one
rule for the shape of a level, changing "Levels and placement" and "Imports".

**Status.** open

**Answer.**

## Q15. Is a file over the line limit a violation, and which files does the limit cover?

**Question.** A file longer than `maxFileLines` only got a warning, which is easy to wave away, so files kept
growing past it. Should it be a violation, and does the limit cover files nobody writes by hand?

**Context.** #26: the default of 150 lines is more than fits on a screen with room to read it, and a warning did not
stop the growth.

**Status.** answered

**Answer.** Yes: the default is 120 lines and a longer file is a violation; the value stays configurable. A file
written by a tool is not checked, since nobody edits it by hand; a type declaration file written by hand is. Written
into "One thing per file". Test files are settled separately (Q16).

## Q16. Does the file limit apply to test files?

**Question.** A test file of one hook grows by one scenario per bug fix and passes the limit, though splitting it by
scenario would spread the tests of one hook over several files. Is a test file checked against `maxFileLines`?

**Context.** #20, found by the architecture-reviewer in a project that follows the plugin. "Levels and placement"
already says tests are not part of the shape, while "One thing per file" named no exception.

**Status.** answered

**Answer.** No: a test file is not checked against the limit. Its cases are independent and read one at a time, and
a split by case makes the tests of one thing harder to find. A separate limit for tests was rejected as one more
number with no ground, and a rule for how to split a test file as a constraint nobody asked for. Written into "One
thing per file".
