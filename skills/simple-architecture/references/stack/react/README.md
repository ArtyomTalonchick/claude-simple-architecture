# React

Stack rules for projects that declare `react`: how the core rules are carried out in React code. They never
contradict the core. Each rule has its own file, named as the core rule it carries out.

- [View and Presenter in React](view-presenter.md) — `MyComponent.tsx` and the `usePresenter` hook in the logic
  folder; a View calls no hook but these and styling hooks.
- [Stateful logic in React is a hook](stateful-logic-and-functions.md) — the `use` prefix only on functions that
  call hooks, and on `usePresenter`.
- [Tasks in React](tasks.md) — a task calls no hook; an event handler calls it, a `useEffect` only on mount.
- [A derived type in TypeScript](types-and-constants.md) — a file that derives a type with `typeof`, `Parameters` or
  `ReturnType` is not a user of that type.
