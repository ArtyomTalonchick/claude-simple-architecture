## One thing per file

**Rule.** A file holds one thing: one View, one Presenter, one piece of stateful logic or one helper. Types and
constants that only this thing uses belong to it and stay in its file. A file longer than the configured limit
(`maxFileLines`, default 150) is a signal to split it, not a violation.

**Why.** A file that holds one thing is found by its name, read in one go and changed without touching anything
else. Once a second thing moves in, the file grows by habit: the next piece of logic lands there because it is
near, and the file turns into a place where everything happens. Size alone does not prove this — a long but
plain View can be fine — so it is a signal to look, not a rule to break.

**How to check.**

- A file that defines two or more things — two Views, a View and stateful logic, two helpers — is a violation,
  whether the second one is exported or not: the second thing gets its own file, placed by
  [Levels and placement](levels.md).
- Not a second thing: a type or a constant used only in this file, the props type of a View or a Presenter, and
  a View passing on its Presenter's props type.
- A file over `maxFileLines` lines is a **warning**, not a violation: name the file and its size, and say what
  could move out — stateful logic, a helper, a child unit.

**Good.**

```
OrderForm/
  OrderForm           View, 90 lines
  presenter           Presenter
  validateOrder       helper
  OrderTotals/        child unit
```

**Bad.**

```
OrderForm/
  OrderForm           View + a Totals View + validateOrder helper, 260 lines
```

**Stack notes.** None.
