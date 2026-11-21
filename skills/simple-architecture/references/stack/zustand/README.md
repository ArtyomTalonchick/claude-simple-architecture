# Zustand

Stack rules for projects that declare `zustand`: how the core rules are carried out with Zustand stores. They never
contradict the core. Each rule has its own file, named as the core rule it carries out.

- [A Zustand store](stateful-logic-and-functions.md) — a store holds its state and actions only; its hook is
  called only from a Presenter or stateful logic, and a task or a plain function reaches it through `getState()` /
  `setState()`.
