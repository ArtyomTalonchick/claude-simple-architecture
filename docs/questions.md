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

**Answer.** Tests live next to the code they test, are not part of the shape and do not count as users; a test may import the code it tests and what that code may import. Written into "Levels and placement" and "Imports". Later relaxed (#47): a test may import whatever it needs to set up, reset and check state, and its imports are not checked.

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

**Answer.** Partly: the own unit's logic goes to a `logic/` folder next to its View (Q19). The child units and the
level's shared code stay as they were; whether they get groups of their own is still open.

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

## Q17. Where does business logic live, and how does it reach a store?

**Question.** The rules knew stateful logic and helpers. A user action — log in, log out, place an order — ended up
in a hook, tied to the UI framework and to a component's life, or in a helper, where touching a store is a
violation. Where does it go, and may it reach a store without a hook? Three points followed: may stateful logic
call it, how does it report an error, and where is the line between it and stateful logic that reads a store?

**Context.** #24. A user action means the same in any UI, so the code that describes it should survive a change of
the UI layer.

**Status.** answered

**Answer.** A third kind of code, the task: a plain function named with a verb, with nothing from the UI framework,
that reaches stores through their own API and may call other tasks. A Presenter or stateful logic may call it: a
hook that keeps the state of a request calls the task that makes it. A task returns its result and throws on
failure; the caller keeps the error. A task reads or changes a store once, when it is called; code that follows a
store's changes to show them is stateful logic. The Presenter keeps loading and error and navigates. Shared tasks
go to the tasks folder (`folders.tasks`, default `tasks/`). Written into a new core rule "Tasks", into "Stateful
logic and helpers", "Imports", "Levels and placement", "View and Presenter", "One thing per file", the React rule
"Tasks in React" and the Zustand rule "A store is stateful logic".

## Q18. Is a function that acts on the screen a helper?

**Question.** A function reads the focused field and resets its selection so a mobile browser redraws its caret. It
uses no state, lifecycle or store, so the rules called it a helper, yet it returns nothing and depends on the state
of the page — against the helper's «Why», which said a helper takes input and returns output.

**Context.** #21, found by the architecture-reviewer, which passed the file and noted that the rule does not
describe it. A wrapper around a screen transition is a similar case.

**Status.** answered

**Answer.** A helper, when it keeps nothing between calls: it can still be moved and tested anywhere a screen
exists. It is part of the UI, so a task never calls it; one that keeps state between calls or follows the screen's
changes is stateful logic. A kind of its own was rejected: it would differ from a helper only in who may call it.
Written into "Stateful logic and helpers" (the «Why» included), "Tasks" and the React rule "Stateful logic in React
is a hook".

## Q19. Where does a unit's own logic live?

**Question.** A unit folder held its View, Presenter, stateful logic and helpers, child units and shared folders side
by side. With tasks (Q17) and a 120-line limit (Q15), a unit easily holds a dozen files of different kinds, and the
View gets lost among them. Should the unit's own logic get a folder of its own, may that folder have subfolders,
and is its name configurable?

**Context.** #25. Q14 had rejected one fixed `(logic)/` group because it only moved the crowd; with tasks and smaller
files the crowd is now the unit's own logic, and the View is the file people look for.

**Status.** answered

**Answer.** Yes: the View stays at the unit root, and everything else of the unit's own — the Presenter, its
stateful logic, its helpers and a `tasks/` folder with its own tasks — lives in the logic folder next to it. A unit
without logic has none. The folder is flat apart from `tasks/`: kinds in subfolders would add depth to every
import for a handful of files. The level's shared folders, types and constants files stay at the level root, next
to the child units. The logic folder is inside the unit: only its View and its own files import from it. Its name
is configurable like the other folders (`folders.logic`, default `logic`). Written into "Levels and placement",
"Imports", "View and Presenter", the examples of the other core rules, and the React rule "View and Presenter in
React".

## Q20. When is a Presenter split into stateful logic it joins?

**Question.** One concern per piece of stateful logic is checked on hooks, but a Presenter may keep any amount of
state, effects and handlers of its own, so it can grow into the place where everything happens. When is it split,
how is "large" told from "a few simple jobs", and is that a violation?

**Context.** #22: a page Presenter joined two hooks and kept the screen state itself; the reviewer passed it, and
moving the screen state out was the preferred shape.

**Status.** answered

**Answer.** By the two-concerns test, not by size: a Presenter whose own state and lifecycle fall into two or more
groups should move them out as stateful logic and only join it. The stateful logic it calls, values computed from
props or from that logic, and the loading and error of a task kept by the handler that calls it do not count. One
group of its own stays. It is a warning, not a violation: which jobs are simple enough to stay is a judgement, and
a violation would make the reviewer's verdict depend on the run. The moved-out logic goes to the unit's logic
folder while the Presenter is its only user. Written into "View and Presenter".

## Q21. Where does a type shared by several files of one unit live?

**Question.** "A type used by one file lives in that file" covers one file, and the level's types file is for types
shared by two or more units. Where does a type go when several files of the same unit use it — its stateful logic,
a helper next to it and its Presenter?

**Context.** #19, found in a project that follows the plugin: the reviewer accepted such a type in the level's
types file only because that file already had other users, which judged the file, not the type.

**Status.** answered

**Answer.** In the types file or the constants file of the unit's level, as before: those files are for types and
constants used by two or more files of the level, of one unit or of several. A types file in the logic folder was
tried first and dropped: the logic folder holds only the unit's own code, and what is reused stays where it was.
The file of the main user was rejected because "main" cannot be checked and the export makes one user look like the
owner. Written into "Levels and placement".

## Q22. How does the config describe a repository with several apps and a shared types package?

**Question.** The config described one app: one `root` and one `stack`. A repository with a client, a server and a
package of types they share could not be described, so the rules either missed two of the three parts or judged
the server by the client's stack. What shape does the config take, do the folder names stay global, and may the
shared package hold more than types?

**Context.** #27.

**Status.** answered

**Answer.** An `apps` map — each app by name, with its own `root` and `stack` — next to a top-level `shared` folder.
A map gives every app a name for messages and reports; without `apps` the config works as before. `folders` and
`maxFileLines` stay global: one naming for the whole repository, with `lib` and `uiKit` relative to each app's
root. Each app is checked on its own: its levels start at its root and only its stacks apply. An app never imports
from another app; every app may import the shared package; the package imports no app and holds types only —
runtime code there, constants included, would tie the apps' builds and runtimes together. Written into "Imports",
"Levels and placement", `SKILL.md`, the session-start hook and the architecture-reviewer agent.

## Q23. May an entry folder hold the entry folders of its parts?

**Question.** An entry folder held no folder but its tests. When one of its parts has parts only it uses, do those
lie flat in the outer folder, or does the part become an entry folder of its own inside it?

**Context.** #48. Entry folders became required for an entry with parts only it uses; with no nesting, a part's own
parts would lie flat one level down, and the grouping would be lost again there.

**Status.** answered

**Answer.** A part with parts only it uses is an entry folder of its own, inside its entry's folder, at any depth.
The same rules hold at each depth: others import only an entry folder's entry, and a part used from outside its
folder moves out to the nearest folder that covers all its users. Written into "Levels and placement", "Imports",
"Tasks", "Stateful logic and plain functions" and the architecture-reviewer agent.

## Q24. Where does shared UI behaviour live when it cannot be a component?

**Question.** A level shares no logic: behaviour two units need is a component that holds it. What about a function
that acts on the screen and is called from two units that have no visual element in common, so no component can
hold it?

**Context.** #56. In the project that led to the issue no such code was left once the rules were applied, so the
case was not decided. A candidate answer, if a case appears: an app-wide `logic/` folder next to `tasks/`, which may
import tasks and which tasks may not import.

**Status.** open

**Answer.**

## Q25. Where does "the latest call wins" live?

**Question.** A task is called again before its last call has ended — a search typed letter by letter, a page
switched twice. Where is the earlier call dropped or cancelled: in the task, or in generic I/O?

**Context.** #57. An event now calls the task directly, with a debounce at most around the call, so a request that
follows its params no longer cancels the old request for free.

**Status.** answered

**Answer.** In the task. It may keep the handle that cancels its ongoing call in a store, next to the call's
status, and cancel the earlier call through it when it starts a new one; only tasks use the handle (#59). Written
into "Tasks", "Stateful logic and plain functions", the Zustand note and the architecture-reviewer agent.

## Q26. Which unit loads data that several independent units need?

**Question.** Units that know nothing of each other show the same data. Does the unit that mounts them all call the
load once, or does each call the task, and the task returns early when the store says the data is loading or
loaded?

**Context.** #57. Both work, and with the status of a call in a store the second needs nothing more; the rules do not
yet say which to recommend.

**Status.** open

**Answer.**

## Q27. Are events from outside the UI handlers?

**Question.** A timer fires, a socket message arrives. Is the code that reacts to them an event handler that may call
a task, by the rule that an event calls the task, or a case of its own?

**Context.** #57. The rule names user actions, requests to a unit with no UI and start or mount; it says nothing of
events that do not come from the UI.

**Status.** open

**Answer.**

## Q28. Is a query hook keyed by state a request that follows its params?

**Question.** A query hook from a data-fetching library takes a key built from state or props and refetches when the
key changes. By the rule that an effect which watches data does not call a task, it is the same chain, done by a
library. Is it a violation, allowed as a library's cache, or allowed only for reads?

**Context.** Came up while writing #57: the React note names query hooks among the hooks stateful logic may call,
and #57 forbids "request follows its params" hooks of the project's own.

**Status.** open

**Answer.**

## Q29. May a store be a folder with parts?

**Question.** A store has parts only it uses — the type of its API, two implementations. The stores folder was flat,
and as files next to it the entry would be a store importing other stores. Where do the parts go?

**Context.** #55. A server's in-memory store got a second implementation over a database.

**Status.** answered

**Answer.** A store with parts only it uses is a store entry folder in its stores folder, a level's or the app's,
with the rules of any entry folder. Its implementations are parts, not stores, so the entry importing them is not
one store importing another. Written into "Levels and placement", "Imports", "Stateful logic and plain functions",
`SKILL.md` and the architecture-reviewer agent.

## Q30. May a server store read and write its own database?

**Question.** A store "can be replaced — data kept in memory by a database", but a function that does I/O is a task.
Is a store whose API talks to its database a violation? And may one store have several implementations, picked by
the environment?

**Context.** #55. The rules said both, and the reviewer read it as allowed only by reading between the lines.

**Status.** answered

**Answer.** On a server, a store whose API reads and writes its own database through the database's client is
fine: it is the store's own reading and changing of its data, not a step of a business action. Generic I/O, another
service or another store's database is still a task. Several implementations behind one API, picked by the
environment, are fine, laid out as a store entry folder. Written into "Stateful logic and plain functions",
"Tasks", "Imports" and the architecture-reviewer agent.

## Q31. May a root level have more than one start file?

**Question.** A server runs locally and as a cloud function, each with its own start file around the same entry.
The root level allowed one start file, and a start file is not logic.

**Context.** #55, a comment on it.

**Status.** answered

**Answer.** A root level holds one start file per runtime the app runs in, each running the same entry in its own
way; a second start file for one runtime is a violation. Written into "Levels and placement", "Imports" and the
architecture-reviewer agent.

## Q32. May a task be a part of another task?

**Question.** A large task is split into smaller tasks that only it uses. A task was never a part, so each smaller
task had to lie in the tasks folder as a task of its own. Does it?

**Context.** #59. A task that fetches from an outside service and one that reads the platform's storage were each
used by one larger task only.

**Status.** answered

**Answer.** A task that only one other task calls may be a part of that task's entry folder, or a task of its own in
the tasks folder; both are fine. It moves out when a second caller appears, as any part does. A task is still never
a part of stateful logic or of a plain function. Reading or writing a storage directly is I/O, so a function that
does it is a task. Written into "Levels and placement", "Tasks", "Stateful logic and plain functions" and the
architecture-reviewer agent.

## Q33. Where does a store live that two units' tasks share but that holds no UI state?

**Question.** A level shared only stores with UI state. A server cache that the tasks of two units reach, and that no
task of the app's tasks folder reaches, had no place.

**Context.** #59.

**Status.** answered

**Answer.** A level shares any store that no task of the app's tasks folder reaches — UI state, or data the tasks of
its units reach — in the stores folder of the lowest level that covers its users. Written into "Levels and
placement", `SKILL.md` and the architecture-reviewer agent.

## Q34. How does a task run inside a screen transition a plain function plays?

**Question.** A plain function of the UI side swaps the screen inside a transition and has to clear data a task
owns, at the same moment. A plain function may not call a task.

**Context.** #59. Without an allowed way, the plain function redid the task's store change itself.

**Status.** answered

**Answer.** The plain function takes what to run inside the transition as a callback, and the Presenter passes the
task's call: `goHome(() => clearSearch())`. Running a callback is not calling a task. Redoing the task's store
changes in the plain function is a violation. Written into "Tasks", "Stateful logic and plain functions" and the
architecture-reviewer agent.

## Q35. Must a task that writes its failure to a store rethrow when it has nothing to roll back?

**Question.** Not rethrowing was excused for a task that rolls back its change and writes the error to a store. A task
that changed nothing before failing writes the failure the same way.

**Context.** #59.

**Status.** answered

**Answer.** No. A task that writes its own failure to a store where the UI reads it need not rethrow; it rolls back
first only if it changed something. Written into "Tasks", the Zustand note and the architecture-reviewer agent.

## Q36. May a store hold a handle, not plain data?

**Question.** A store keeps the controller of the ongoing request, and tasks cancel it through the store so that the
latest call wins.

**Context.** #59, and Q25.

**Status.** answered

**Answer.** Yes: a store may keep the handle that cancels an ongoing call, next to that call's status. Only tasks
read and use it; a Presenter, stateful logic or a View that does is a violation. Written into "Tasks", "Stateful
logic and plain functions", the Zustand note and the architecture-reviewer agent.

## Q37. May an entry folder in a logic folder hold a constants file?

**Question.** A types or constants file in the logic folder is a violation, while a constants file used only inside
an entry folder is a part. Read together the file is allowed, but the texts clash.

**Context.** #59.

**Status.** answered

**Answer.** The check covers only files outside an entry folder; one inside it, used only there, is a part. Written
into "Levels and placement" and the architecture-reviewer agent.
