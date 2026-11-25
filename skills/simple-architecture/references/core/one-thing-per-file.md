## One thing per file

**Rule.** A file holds one thing — one View, Presenter, piece of stateful logic, task, plain function, piece of
generic I/O or store — with the types and constants only it uses. A file is no longer than the configured limit
(`maxFileLines`, default 120).

**Why.** A file that holds one thing is found by its name, read in one go and changed without touching anything
else. Once a second thing moves in, the next piece of logic lands there because it is near, and the file turns into
a place where everything happens. Code that does not fit the limit is a sign that the file holds more than one
thing; a limit that is only a signal gets waved away, so it is a rule.

**How to check.**

- A file that defines two or more things — two Views, a View and stateful logic, two plain functions, a task and
  a function it is split into — is a violation, whether the second is exported or not: it gets its own file, placed
  by [Placement by users](placement.md).
- Not a second thing: a type or a constant used only in this file, the props type of a View or a Presenter and the
  types that are part of it, a View passing them on, and a store's own readings in the store file
  ([Stateful logic and plain functions](stateful-logic-and-functions.md)).
- A file over `maxFileLines` lines is a violation: name the file, its size and the limit, and say what could move
  out — stateful logic, a task, a plain function, a store, a child unit. A long View is split into child units.
- Not checked against the limit: a test file, and a file written by a tool — marked as generated, or in a folder a
  tool writes. A type declaration file written by hand is checked.

**Good.**

```
OrderForm/
  OrderForm           View, 90 lines
  _logic/
    presenter         Presenter
    validateOrder     plain function
  OrderTotals/        child unit
```

**Bad.**

```
OrderForm/
  OrderForm           View + a Totals View + validateOrder plain function, 260 lines
```

**Stack notes.** None.
