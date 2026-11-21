## Stateful logic in React is a hook

**Rule.** Stateful logic is a hook: a function named `use…` that calls at least one React hook — `useState`,
`useEffect`, a context, a store or a query hook, a custom hook — or that a hook library creates; any other function
is a task or a plain function, and its name does not start with `use`. The Presenter, `usePresenter`, is a hook by
convention whether or not it calls one, and a store a store library makes is named `use…` but is a store.

**Why.** React enforces its rules of hooks by the `use` prefix. A `use` name on a plain function puts those limits on
code that does not need them, and a plain function that calls a hook breaks at run time.

**How to check.**

- A function named `use…` that calls no hook and is not created by a hook library is a violation: rename it, and
  decide its kind by meaning ([Stateful logic and plain functions](../../core/stateful-logic-and-functions.md)) — a
  business action or a function that reaches the server is a task ([Tasks in React](tasks.md)); anything else is a
  plain function, even when it reaches a store.
- A function whose name does not start with `use` and that calls a hook is a violation.
- A function that uses the DOM outside React — `document.activeElement`, `focus()`, `setSelectionRange`,
  `document.startViewTransition` — or the part of React DOM that is not a hook, such as `flushSync`, and calls no
  hook is a plain function of the UI side, not `use…`. One that keeps a ref, a listener or other state between calls
  is a hook.
- An async function that waits once for the window's `resize` or an element's `transitionend` — it resolves on the
  first event or after a timeout and removes its listener before it resolves — is a plain function, not `use…`; one
  that adds a listener and returns with it still in place is a hook.
- A hook calls a task from a handler it returns, or in `useEffect` with an empty dependency list. A hook whose
  `useEffect` has dependencies and calls a task — `useRequest(fn, params)`, `useShows(genre)` — is a violation.
- `debounce` and `throttle` that keep their timer in the closure of the function they return call no hook: plain
  functions. The Presenter or a hook makes the wrapped function once — `useMemo(() => debounce(fn, 300), [])` or a
  ref. `useDebouncedValue(text)` is a hook; feeding its result to an effect that calls a task is a violation.
- A `usePresenter` that calls no hook but computes something from its props is not a violation of this rule; one
  with no computation at all is judged by [View and Presenter in React](view-presenter.md).

**Good.**

```ts
// _logic/useCurrentUser.ts
export const useCurrentUser = () => useUserStore((s) => s.user);

// _logic/formatPrice.ts
export const formatPrice = (sum: number) => sum.toFixed(2);

// _logic/openResults/openResults.ts — a plain function of the UI side: UI state in two stores inside a screen
// transition, flushSync from react-dom, then redrawCaret, its part; no hook. Called by the Presenter.
export const openResults = (query: string) => {
  document.startViewTransition(() => {
    flushSync(() => {
      useSearchStore.getState().setQuery(query);
      useScreenStore.getState().setScreen('results');
    });
    redrawCaret();
  });
};

// _logic/waitForResize.ts — the listener is removed before the promise resolves: nothing is kept between calls
export const waitForResize = (timeout: number) =>
  new Promise<void>((resolve) => {
    const done = () => {
      window.removeEventListener('resize', done);
      clearTimeout(timer);
      resolve();
    };
    const timer = setTimeout(done, timeout);
    window.addEventListener('resize', done);
  });
```

**Bad.**

```ts
// _logic/getCurrentUser.ts — calls a hook
export const getCurrentUser = () => useUserStore((s) => s.user);

// _logic/useFormatPrice.ts — calls no hook: a plain function, formatPrice
export const useFormatPrice = (sum: number) => sum.toFixed(2);

// _logic/useCancelOrder.ts — calls no hook and reaches the server: a task, _logic/_tasks/cancelOrder
export const useCancelOrder = async (id: string) => {
  await api.cancelOrder(id);
};

// _logic/useShowDetails.ts — calls no hook; changes UI state: a plain function, _logic/showDetails
export const useShowDetails = () => useScreenStore.getState().setScreen('details');

// _logic/watchResize.ts — the listener stays after the call: a hook, useWindowSize
export const watchResize = (onResize: () => void) => window.addEventListener('resize', onResize);

// _logic/useOrdersSearch.ts — calls the task when the query changes: the change handler calls it
export const useOrdersSearch = (query: string) => {
  useEffect(() => {
    searchOrders(query);
  }, [query]);
};
```

**Stack notes.** Carries out the core rule
[Stateful logic and plain functions](../../core/stateful-logic-and-functions.md).
