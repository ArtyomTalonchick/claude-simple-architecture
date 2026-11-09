## Stateful logic and helpers

**Rule.** Split non-UI logic into stateful logic and helpers. Stateful logic uses state, lifecycle or a store, or
calls other stateful logic; a helper is a plain function that does none of this. Stateful logic goes to the
stateful logic folder (default `hooks/`) and helpers to the helpers folder (default `helpers/`). A helper may be
called from anywhere; stateful logic only from a Presenter or other stateful logic.

**Why.** A helper takes input and returns output, so it can be moved, reused and tested anywhere. Stateful logic
is tied to the life of a UI unit and works only inside it. When the two are mixed, a plain function picks up a
hidden dependency on that life cycle, and a reader cannot tell from where a function lies what it needs to run.

**How to check.**

- A file in a helpers folder that uses state, lifecycle or a store, or calls stateful logic, is a violation: it
  is stateful logic.
- A file in a stateful logic folder that uses none of these and calls no stateful logic is a violation: it is a
  helper.
- Stateful logic called from a helper is a violation. Stateful logic called from a View is a violation of
  [View and Presenter](view-presenter.md).
- The same split holds for stateful logic or a helper that sits next to its only user, outside a shared folder:
  what it is decides what it may call and who may call it.

**Good.**

```
OrdersPage/
  hooks/
    orderFilters        keeps the filter state, reads the current user from the store
  helpers/
    formatPrice         number -> text, no state
```

**Bad.**

```
OrdersPage/
  hooks/
    priceFormat         number -> text, no state — a helper
  helpers/
    currentUser         reads the store — stateful logic
```

**Stack notes.**

- [react/stateful-logic-and-helpers.md](../stack/react/stateful-logic-and-helpers.md) — stateful logic in React
  is a hook.
- [zustand/stateful-logic-and-helpers.md](../stack/zustand/stateful-logic-and-helpers.md) — a store is stateful
  logic.
