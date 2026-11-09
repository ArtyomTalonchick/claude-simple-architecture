## View and Presenter in React

**Rule.** A component is a View: `MyComponent/MyComponent.tsx`, named as its folder. Its Presenter is the hook
`usePresenter.ts` next to it, which declares the props type; the View re-exports that type for its users. The
only hooks a View calls are its own `usePresenter` and styling hooks.

**Why.** One file name per role makes the pair easy to find, and a short list of allowed hooks is easy to check:
any other hook in a component means logic has leaked into the View. Styling hooks only return styles, and styles
are the View's concern.

**How to check.**

- In a component file (`.tsx` that returns JSX): any hook call other than `usePresenter(props)` and a styling
  hook — `useState`, `useEffect`, `useMemo`, `useCallback`, a store or a query hook, a custom hook — is a
  violation.
- A styling hook is one from the project's UI or styling library that only returns style values: a style recipe
  or slot recipe, a theme token, a style value picked by screen size. It reads the design system, not app state,
  so it is not stateful logic. A hook whose result the View uses for anything but a style prop — in a condition,
  as text, passed to a handler — is not a styling hook.
- Allowed in JSX: `{flag && <A />}` and `{flag ? <A /> : <B />}` on a value from the Presenter;
  `{items.map((item) => <Row key={item.id} … />)}` on a ready array; `onClick={onSave}`;
  `onClick={() => onSelect(item.id)}`; style props, `className`, `style`.
- A violation in JSX: `.filter`, `.sort`, `.reduce`, `.find` on data; formatting such as `.toFixed`,
  `toLocaleString` or a template string built from data; a comparison on raw data (`a > b`, `status === 'paid'`);
  an arrow with more than one call or with a condition.
- A violation in JSX: a value chosen by a condition — `??`, `||` or `?:` that picks a value
  (`src={image ?? undefined}`, `title={name || 'Untitled'}`, `label={isOpen ? 'Hide' : 'Show'}`) — and an optional
  read `a?.b`. The Presenter returns the ready value (`imageSrc: image ?? undefined`). `&&` and `?:` stay allowed
  when they choose markup by a ready flag, as above.
- The same violations count anywhere in the component file, not only in JSX: a module-level constant built with
  `.map`, `.flatMap`, `.filter` or a template string is a computation in the View and goes to `usePresenter.ts`.
  A literal array or object is allowed.
- `usePresenter.ts` with no hook call and no computation — it only returns its props — is a violation.
- The props type is declared in `usePresenter.ts` and re-exported from the component file
  (`export type { OrderListProps } from './usePresenter'`), so users import it from the View; a component without
  a Presenter declares its props type in its own file.

**Good.**

```tsx
// OrderList/usePresenter.ts
export type OrderListProps = { status: OrderStatus };

export const usePresenter = ({ status }: OrderListProps) => {
  const { orders, isLoading } = useOrders();
  const navigate = useNavigate();
  const rows = useMemo(
    () => orders.filter((o) => o.status === status).map((o) => ({ ...o, total: formatPrice(o.sum) })),
    [orders, status],
  );
  const open = (id: string) => navigate(`/orders/${id}`);
  return { rows, isLoading, open };
};

// OrderList/OrderList.tsx
import { usePresenter, type OrderListProps } from './usePresenter';

export type { OrderListProps } from './usePresenter';

export const OrderList = (props: OrderListProps) => {
  const { rows, isLoading, open } = usePresenter(props);
  if (isLoading) return <Spinner />;
  return rows.map((row) => <OrderRow key={row.id} row={row} onOpen={() => open(row.id)} />);
};
```

A value the View passes to a prop is ready too, even when it only turns `null` into `undefined`:

```tsx
// UserCard/usePresenter.ts
export const usePresenter = ({ userId }: UserCardProps) => {
  const { user } = useUser(userId);
  return { name: user?.name ?? 'Guest', imageSrc: user?.image ?? undefined };
};

// UserCard/UserCard.tsx
export const UserCard = (props: UserCardProps) => {
  const { name, imageSrc } = usePresenter(props);
  return <Avatar name={name} src={imageSrc} />;
};
```

**Bad.**

```tsx
// OrderList/OrderList.tsx
export const OrderList = ({ status }: { status: OrderStatus }) => {
  const { orders, isLoading } = useOrders();
  if (isLoading) return <Spinner />;
  return orders
    .filter((o) => o.status === status)
    .map((o) => <OrderRow key={o.id} row={{ ...o, total: o.sum.toFixed(2) }} />);
};
```

```tsx
// UserCard/UserCard.tsx
export const UserCard = (props: UserCardProps) => {
  const { user } = usePresenter(props);
  return <Avatar name={user?.name ?? 'Guest'} src={user?.image ?? undefined} />;
};
```

**Stack notes.** Carries out the core rule [View and Presenter](../../core/view-presenter.md).
