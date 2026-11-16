## A store is stateful logic

**Rule.** A Zustand store hook (`useOrdersStore`, made by `create`) is stateful logic: call it only from a
Presenter or other stateful logic — never from a View, a task or a helper. A task reaches the store outside hooks
through `getState()` and `setState()`; a View and a helper never do.

**Why.** A store is shared data with a life of its own. When every subscription goes through a Presenter or a hook,
a reader can see from the Presenter what data a unit depends on, and a View or a helper stays free of hidden
dependencies on app state. A task carries out an action at one moment: it needs the current value and a way to
change it, not a subscription, and `getState()` / `setState()` give exactly that without React.

**How to check.**

- A store hook called in a component file (a View) is a violation — also of
  [View and Presenter](../../core/view-presenter.md).
- A store hook, `getState()` or `setState()` used in a helper is a violation: a function that reads or changes the
  store once is a task ([Tasks](../../core/tasks.md)), one that subscribes is stateful logic.
- `getState()` or `setState()` in a View is a violation; a store hook called as a hook in a task is a violation.
- In a task, `useOrdersStore.getState()` and `useOrdersStore.setState()`, or an action read through `getState()`,
  are allowed. No middleware such as thunks is needed for that.
- A store file — `create(...)` and its actions — is stateful logic and is placed by
  [Levels and placement](../../core/levels.md): next to its one user, or in the stateful logic folder of the
  lowest level that covers all its users. Its `use…` name is right even though its own code calls no hook.

**Good.**

```ts
// OrderList/OrderList.tsx — the View takes data from its Presenter
export const OrderList = (props: OrderListProps) => {
  const { orders } = usePresenter(props);
  return orders.map((o) => <OrderRow key={o.id} row={o} />);
};

// hooks/useOrderCount.ts — stateful logic subscribes to the store
export const useOrderCount = () => useOrdersStore((s) => s.orders.length);

// tasks/cancelOrder.ts — a task changes the store once
export const cancelOrder = async (id: string) => {
  await api.cancelOrder(id);
  useOrdersStore.setState((s) => ({ orders: s.orders.filter((o) => o.id !== id) }));
};
```

**Bad.**

```tsx
// OrderList/OrderList.tsx — a View reads the store
export const OrderList = () => {
  const orders = useOrdersStore((s) => s.orders);
  return orders.map((o) => <OrderRow key={o.id} row={o} />);
};

// helpers/orderCount.ts — a helper reads the store
export const orderCount = () => useOrdersStore.getState().orders.length;
```

**Stack notes.** Carries out the core rules [Stateful logic and helpers](../../core/stateful-logic-and-helpers.md)
and [Tasks](../../core/tasks.md).
