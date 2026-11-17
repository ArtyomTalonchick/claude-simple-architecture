# React

Stack rules for projects that declare `react`: how the core rules are carried out in React code — components,
hooks, and where each kind of code lives. They never contradict the core.

Each rule has its own file, named as the core rule it carries out.

- [View and Presenter in React](view-presenter.md) — `MyComponent.tsx` and the `usePresenter` hook in
  the logic folder.
- [Stateful logic in React is a hook](stateful-logic-and-functions.md) — the `use` prefix only on functions that
  call hooks, and on `usePresenter`; a plain function may use the DOM and `flushSync`, but only the UI side
  calls it.
- [Tasks in React](tasks.md) — a task calls no hook; the Presenter awaits it, keeps loading and error, and
  navigates.
