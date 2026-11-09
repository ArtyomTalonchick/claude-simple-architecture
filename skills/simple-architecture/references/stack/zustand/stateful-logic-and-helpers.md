## A store is stateful logic

**Rule.** A Zustand store hook (`useOrdersStore`) is stateful logic: call it only from a Presenter or other
stateful logic — never from a View or a helper. Do not reach the store outside hooks through `getState()` or
`setState()` to get around this.

**Why.** A store is shared data with a life of its own. When every read goes through a Presenter or a hook, a
reader can see from the Presenter what data a unit depends on, and a View or a helper stays free of hidden
dependencies on app state.

**How to check.**

- A store hook called in a component file (a View) is a violation — also of
  [View and Presenter](../../core/view-presenter.md).
- A store hook, `getState()` or `setState()` used in a helper is a violation: the function is stateful logic and
  belongs in a stateful logic folder.
- A store file itself — `create(...)` and its actions — lives in the stateful logic folder of the lowest level
  that covers all its users ([Levels and placement](../../core/levels.md)).

**Good.**

```ts
// OrderList/usePresenter.ts
export const usePresenter = () => {
  const orders = useOrdersStore((s) => s.orders);
  const remove = useOrdersStore((s) => s.remove);
  return { orders, remove };
};
```

**Bad.**

```ts
// OrderList/OrderList.tsx — a View reads the store
export const OrderList = () => {
  const orders = useOrdersStore((s) => s.orders);
  return orders.map((o) => <OrderRow key={o.id} row={o} />);
};

// helpers/orderCount.ts — a helper reads the store
export const orderCount = () => useOrdersStore.getState().orders.length;
```

**Stack notes.** Carries out the core rule [Stateful logic and helpers](../../core/stateful-logic-and-helpers.md).
