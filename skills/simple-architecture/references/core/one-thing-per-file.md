## One thing per file

**Rule.** A file holds one thing: one View, one Presenter, one piece of stateful logic, one task, one helper, one
piece of generic I/O or one store.
Types and constants that only this thing uses belong to it and stay in its file. A file other than a test or a
file written by a tool is no longer than the configured limit (`maxFileLines`, default 120).

**Why.** A file that holds one thing is found by its name, read in one go and changed without touching anything
else. Once a second thing moves in, the file grows by habit: the next piece of logic lands there because it is
near, and the file turns into a place where everything happens. The limit keeps a file short enough to read in one
go; code that does not fit is a sign that it holds more than one thing, and splitting it is the fix. A limit that
is only a signal gets waved away, so it is a rule.

**How to check.**

- A file that defines two or more things — two Views, a View and stateful logic, two helpers — is a violation,
  whether the second one is exported or not: the second thing gets its own file, placed by
  [Levels and placement](levels.md).
- Not a second thing: a type or a constant used only in this file, the props type of a View or a Presenter, and
  a View passing on its Presenter's props type.
- A file over `maxFileLines` lines is a violation: name the file, its size and the limit, and say what could move
  out — stateful logic, a task, a helper, a store, a child unit. A long View is split into child units.
- Not checked against the limit:
  - a test file: it grows by one case per behavior, and the cases are read one at a time; splitting it by case
    would spread the tests of one thing over several files. Tests are not part of the shape ([Levels and
    placement](levels.md));
  - a file written by a tool — marked as generated, or in a folder a tool writes: nobody edits it by hand. A type
    declaration file written by hand is checked like any other file.

**Good.**

```
OrderForm/
  OrderForm           View, 90 lines
  logic/
    presenter         Presenter
    validateOrder     helper
  OrderTotals/        child unit
```

**Bad.**

```
OrderForm/
  OrderForm           View + a Totals View + validateOrder helper, 260 lines
```

**Stack notes.** None.
