# React

Stack rules for projects that declare `react`: how the core rules are carried out in React code — components,
hooks, and where each kind of code lives. They never contradict the core.

Each rule has its own file, named as the core rule it carries out.

- [View and Presenter in React](view-presenter.md) — `MyComponent.tsx` and the `usePresenter` hook.
- [Stateful logic in React is a hook](stateful-logic-and-helpers.md) — the `use` prefix only on functions that
  call hooks.
