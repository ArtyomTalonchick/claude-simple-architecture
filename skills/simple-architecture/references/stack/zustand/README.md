# Zustand

Stack rules for projects that declare `zustand`: how the core rules are carried out with Zustand stores — where
state lives, how it is split and who may use it. They never contradict the core.

Each rule has its own file, named as the core rule it carries out.

- [A store is stateful logic](stateful-logic-and-helpers.md) — a store hook is used only from a Presenter or
  stateful logic; a task reaches the store through `getState()` / `setState()`.
