## A Zustand store

**Rule.** A Zustand store (`useOrdersStore`, made by `create`) is a store: its file holds `create(...)` with the
state and its actions, its read hooks and selectors, and nothing else, and its hooks are called only from a
Presenter or other stateful logic. A task or a plain function reaches the store through `getState()` and
`setState()`; a View never reaches it.

**Why.** When every subscription goes through a Presenter or a hook, a reader sees from the Presenter what data a
unit depends on, and a View stays free of hidden dependencies on app state. A task or a plain function does not
subscribe: `getState()` / `setState()` give the current value and a way to change it, without React.

**How to check.**

- A store file lies in a stores folder, a level's or the app's ([Levels](../../core/levels.md),
  [The app's tasks and stores folders](../../core/app-folders.md)); its `use…` name is right even though its own
  code calls no hook.
- A read hook or a selector in the store file is the store's own when it means the same to every user
  (`useHasOrders`), called as the store hook is. One that computes for one user is a violation: that unit's
  stateful logic.
- An action of the store that calls the server, calls a task, or does more than read and change the store's state is
  a violation: that part is a task, and the action only sets the result.
- A store hook called in a component file (a View), a task or a plain function is a violation; so is `getState()` or
  `setState()` in a View.
- In a task or a plain function, `getState()`, `setState()` and an action read through `getState()` are allowed, with
  no middleware such as thunks. Using them does not make a function a task: its kind is decided by meaning.
- In a Presenter or other stateful logic, a store hook with a selector, and an action taken from it and called once
  in a handler, are allowed. A selected value watched by a `useEffect` that calls a task is a violation
  ([Tasks](../../core/tasks.md)).
- A task may write the status of its call to the store with `setState` when units that did not call it show it.
- The store may keep the `AbortController` of the ongoing call next to its status. Only tasks read it and call
  `abort()`, through `getState()`; a Presenter, stateful logic or a View that selects it or aborts it is a violation.

**Good.**

```ts
// _stores/useOrdersStore.ts — the store and its read hook
export const useOrdersStore = create<OrdersState>()((set) => ({
  orders: [],
  setOrders: (orders) => set({ orders }),
}));
export const useHasOrders = () => useOrdersStore((s) => s.orders.length > 0);

// _logic/useOrderCount.ts — stateful logic subscribes to the store
export const useOrderCount = () => useOrdersStore((s) => s.orders.length);

// _logic/_tasks/cancelOrder.ts — a task changes the store
export const cancelOrder = async (id: string) => {
  await api.cancelOrder(id);
  useOrdersStore.setState((s) => ({ orders: s.orders.filter((o) => o.id !== id) }));
};

// tasks/search/searchShows.ts — the latest call wins through the controller in the store; the failure is
// written where the results show it, so the task does not rethrow
export const searchShows = async (query: string) => {
  useSearchStore.getState().request?.abort();
  const request = new AbortController();
  useSearchStore.setState({ request, status: 'loading' });
  try {
    const shows = await api.searchShows(query, request.signal);
    useSearchStore.setState({ shows, status: 'done', request: null });
  } catch {
    if (!request.signal.aborted) useSearchStore.setState({ status: 'failed', request: null });
  }
};

// _logic/showResults.ts — a plain function: UI state in two stores, not a business action
export const showResults = (query: string) => {
  useSearchStore.getState().setQuery(query);
  useScreenStore.getState().setScreen('results');
};
```

**Bad.**

```tsx
// _logic/useOrdersStore.ts — a store in _logic/, and an action that calls the server
export const useOrdersStore = create<OrdersState>()((set) => ({
  orders: [],
  load: async () => set({ orders: await api.getOrders() }),
}));

// _stores/useOrdersStore.ts — a hook for one page: that page's stateful logic
export const useOrdersPageTitle = () => useOrdersStore((s) => `Orders (${s.orders.length})`);

// OrderList/OrderList.tsx — a View reads the store
export const OrderList = () => {
  const orders = useOrdersStore((s) => s.orders);
  return orders.map((o) => <OrderRow key={o.id} row={o} />);
};

// SearchBar/_logic/usePresenter.ts — the Presenter selects the controller and aborts it
export const usePresenter = () => {
  const request = useSearchStore((s) => s.request);
  return { onCancel: () => request?.abort() };
};

// _logic/refreshOrders.ts — a plain function that calls the server: a task, _logic/_tasks/refreshOrders
export const refreshOrders = async () => useOrdersStore.getState().setOrders(await api.getOrders());
```

**Stack notes.** Carries out the core rules
[Stateful logic and plain functions](../../core/stateful-logic-and-functions.md) and [Tasks](../../core/tasks.md).
