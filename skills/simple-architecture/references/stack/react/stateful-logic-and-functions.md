## Stateful logic in React is a hook

**Rule.** Stateful logic is a hook: a function whose name starts with `use` and that calls at least one React
hook — `useState`, `useEffect`, a context, a store or a query hook, or a custom hook — or that a hook library
creates for you. A function that is neither is a task ([Tasks in React](tasks.md)) or a plain function: its name
does not start with `use`. The one exception is the Presenter, `usePresenter`: it is a hook by convention, whether
or not it calls one. A store made by a store library is a hook too, named `use…`, but it is a store, not stateful
logic, and lives in the stores folder
([Stateful logic and plain functions](../../core/stateful-logic-and-functions.md)).

**Why.** React enforces its rules of hooks by the `use` prefix. A `use` name on a plain function puts those
limits on code that does not need them, and a plain function that calls a hook breaks at run time.

**How to check.**

- A function named `use…` that calls no hook and is not created by a hook library is a violation: rename it, and
  decide its kind by meaning, not by what it touches. A business action, or a step of one, is a task and moves to
  the tasks folder (default `_logic/_tasks/`, [Tasks in React](tasks.md)) — so does any function that reaches the
  server. Anything else is a plain function, even when it reaches a store: it stays in the logic folder, or moves
  to the tasks folder when only tasks use it.
- A function whose name does not start with `use` and that calls a hook is a violation.
- A function that uses the DOM outside React — `document.activeElement`, `focus()`, `setSelectionRange`,
  `document.startViewTransition` — or the part of React DOM that is not a hook, such as `flushSync`, and calls no
  hook is a plain function, not `use…`. Only the UI side — a Presenter, a hook, other such plain functions — may
  call it; a task never does, directly or through other plain functions ([Tasks in React](tasks.md)). One that keeps
  a ref, a listener or other state between calls is a hook.
- A listener added and removed within one call does not count: it is not kept between calls. An async function
  that waits once for the window's `resize` or an element's `transitionend` — it resolves on the first event or
  after a timeout, and removes its listener before it resolves — is a plain function of the UI side, not `use…`.
  One that adds a listener and returns with it still in place is a hook.
- The Presenter, `usePresenter`, is a hook: it may call hooks and plain functions. A `usePresenter` that calls no
  hook but computes something from its props is not a violation of this rule — the View always calls its Presenter
  the same way, so a hook added later changes nothing for the View. A Presenter with no computation at all is
  judged by [View and Presenter in React](view-presenter.md).

**Good.**

```ts
// _logic/useOrderFilters.ts
export const useOrderFilters = () => {
  const [status, setStatus] = useState<OrderStatus>('new');
  return { status, setStatus };
};

// _logic/useCurrentUser.ts
export const useCurrentUser = () => useUserStore((s) => s.user);

// _logic/formatPrice.ts
export const formatPrice = (sum: number) => sum.toFixed(2);

// _logic/redrawCaret.ts — acts on the page, keeps nothing between calls
export const redrawCaret = () => {
  const field = document.activeElement;
  if (field instanceof HTMLInputElement) field.setSelectionRange(field.selectionStart, field.selectionEnd);
};

// _logic/openResults.ts — a plain function of the UI side: UI state in two stores inside a screen transition,
// flushSync from react-dom, then the caret; no hook. Called by the Presenter.
export const openResults = (query: string) => {
  document.startViewTransition(() => {
    flushSync(() => {
      useSearchStore.getState().setQuery(query);
      useScreenStore.getState().setScreen('results');
    });
    redrawCaret();
  });
};

// _logic/waitForResize.ts — waits once inside one call: the listener is removed before the promise resolves, so
// nothing is kept between calls. A plain function of the UI side, called by the Presenter.
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
// _logic/useOrderFilters.ts
export const useOrderFilters = () => {
  const [status, setStatus] = useState<OrderStatus>('new');
  return { status, setStatus };
};

// _logic/getCurrentUser.ts — calls a hook
export const getCurrentUser = () => useUserStore((s) => s.user);

// _logic/useFormatPrice.ts — calls no hook: a plain function, formatPrice
export const useFormatPrice = (sum: number) => sum.toFixed(2);

// _logic/useCancelOrder.ts — calls no hook and reaches the server: a task, _logic/_tasks/cancelOrder
export const useCancelOrder = async (id: string) => {
  await api.cancelOrder(id);
};

// _logic/useShowDetails.ts — calls no hook; changes UI state in a store, not a business action:
// a plain function, _logic/showDetails
export const useShowDetails = () => useScreenStore.getState().setScreen('details');

// _logic/watchResize.ts — the listener stays after the call and follows the window: a hook, useWindowSize
export const watchResize = (onResize: () => void) => window.addEventListener('resize', onResize);
```

**Stack notes.** Carries out the core rule
[Stateful logic and plain functions](../../core/stateful-logic-and-functions.md).
