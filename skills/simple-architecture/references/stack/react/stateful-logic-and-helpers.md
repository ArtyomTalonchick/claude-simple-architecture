## Stateful logic in React is a hook

**Rule.** Stateful logic is a hook: a function whose name starts with `use` and that calls at least one React
hook — `useState`, `useEffect`, a context, a store or a query hook, or a custom hook — or that a hook library
creates for you (a store made by a store library). A function that is neither is a task ([Tasks in React](tasks.md))
or a helper: its name does not start with `use`. The one exception is the Presenter, `usePresenter`: it is a hook
by convention, whether or not it calls one.

**Why.** React enforces its rules of hooks by the `use` prefix. A `use` name on a plain function puts those
limits on code that does not need them, and a helper that calls a hook breaks at run time.

**How to check.**

- A function named `use…` that calls no hook and is not created by a hook library is a violation: rename it and
  move it to a helpers folder.
- A function whose name does not start with `use` and that calls a hook is a violation.
- A function that uses the DOM outside React — `document.activeElement`, `focus()`, `setSelectionRange`,
  `document.startViewTransition` — and calls no hook is a helper, not `use…`. One that keeps a ref, a listener or
  other state between calls is a hook.
- The Presenter, `usePresenter`, is a hook: it may call hooks and helpers. A `usePresenter` that calls no hook
  but computes something from its props is not a violation of this rule — the View always calls its Presenter
  the same way, so a hook added later changes nothing for the View. A Presenter with no computation at all is
  judged by [View and Presenter in React](view-presenter.md).

**Good.**

```ts
// hooks/useOrderFilters.ts
export const useOrderFilters = () => {
  const [status, setStatus] = useState<OrderStatus>('new');
  return { status, setStatus };
};

// hooks/useCurrentUser.ts
export const useCurrentUser = () => useUserStore((s) => s.user);

// helpers/formatPrice.ts
export const formatPrice = (sum: number) => sum.toFixed(2);

// helpers/redrawCaret.ts — acts on the page, keeps nothing between calls
export const redrawCaret = () => {
  const field = document.activeElement;
  if (field instanceof HTMLInputElement) field.setSelectionRange(field.selectionStart, field.selectionEnd);
};
```

**Bad.**

```ts
// hooks/useOrderFilters.ts
export const useOrderFilters = () => {
  const [status, setStatus] = useState<OrderStatus>('new');
  return { status, setStatus };
};

// helpers/getCurrentUser.ts — calls a hook
export const getCurrentUser = () => useUserStore((s) => s.user);

// hooks/useFormatPrice.ts — calls no hook
export const useFormatPrice = (sum: number) => sum.toFixed(2);
```

**Stack notes.** Carries out the core rule [Stateful logic and helpers](../../core/stateful-logic-and-helpers.md).
