## View and Presenter in React

**Rule.** A component is a View, `MyComponent/MyComponent.tsx`, named as its folder; its Presenter is the hook
`usePresenter.ts` in the unit's logic folder (default `_logic/`), which declares the props type that the View
re-exports. The only hooks a View calls are its own `usePresenter` and styling hooks.

**Why.** One file name per role makes the pair easy to find, and a short list of allowed hooks is easy to check: any
other hook means logic has leaked into the View. Styling hooks only return styles, the View's concern.

**How to check.**

- In a component file (`.tsx` that returns JSX), a hook call other than `usePresenter(props)` and a styling hook —
  `useState`, `useEffect`, `useMemo`, `useCallback`, a store or a query hook, a custom hook — is a violation.
- A styling hook is one from the project's UI or styling library that only returns style values: a style recipe or
  slot recipe, a theme token, a style value picked by screen size. A hook whose result the View uses for anything
  but a style prop — a condition, text, a handler's argument — is not a styling hook.
- Allowed in JSX: `{flag && <A />}` and `{flag ? <A /> : <B />}` on a value from the Presenter;
  `{pagination && <Pagination {...pagination} />}` on a component's ready props or `null`;
  `{items.map((item) => <Row key={item.id} … />)}` on a ready array; `onClick={onSave}`;
  `onClick={() => onSelect(item.id)}`; style props, `className`, `style`.
- A violation in JSX: `.filter`, `.sort`, `.reduce`, `.find` on data; `.toFixed`, `toLocaleString` or a template
  string built from data; a comparison on raw data (`a > b`, `status === 'paid'`); an arrow with more than one call or
  with a condition; `??`, `||` or `?:` that picks a value (`src={image ?? undefined}`, `title={name || 'Untitled'}`,
  `label={isOpen ? 'Hide' : 'Show'}`); an optional read `a?.b`.
- The same counts anywhere in the component file: a module-level constant built with `.map`, `.flatMap`, `.filter`
  or a template string goes to `usePresenter.ts`. A literal array or object is allowed, a style table read by a
  ready key included.
- A `usePresenter.ts` that calls no hook and only returns its props or their fields (`name: show.name`) is a
  violation.
- The props type is declared in `usePresenter.ts` and re-exported from the component file
  (`export type { ButtonProps, ButtonVariant } from './_logic/usePresenter'`, with the types that are part of it); a
  component without a Presenter declares it in its own file. One that spreads all its props onto one child may alias
  the child's (`export type SaveButtonProps = ButtonProps`); one with no props has no props type and takes no
  parameter.
- A short handler that acts on the DOM — `event.preventDefault()`, `inputRef.current?.focus()` — may stay inline in
  `usePresenter.ts`.
- The start file (`main.tsx`) renders `App` and may wrap it in `StrictMode` and the providers the app mounts around
  it; a component only `main.tsx` uses for that, such as `AppShell`, is a child unit of the root level next to `App`.

**Good.**

```tsx
// OrderList/_logic/usePresenter.ts
export type OrderListProps = { status: OrderStatus };

export const usePresenter = ({ status }: OrderListProps) => {
  const { orders, isLoading } = useOrders(); // stateful logic: reads the orders store, which a task fills
  const navigate = useNavigate();
  const rows = useMemo(
    () => orders.filter((o) => o.status === status).map((o) => ({ ...o, total: formatPrice(o.sum) })),
    [orders, status],
  );
  const { page, total, pageCount, setPage } = useOrderPage(status); // Pagination: a ui-kit component
  const pagination: PaginationProps | null = pageCount > 1 ? { page, total, onPageChange: setPage } : null;
  return { rows, isLoading, pagination, open: (id: string) => navigate(`/orders/${id}`) };
};

// OrderList/OrderList.tsx
import { usePresenter, type OrderListProps } from './_logic/usePresenter';

export type { OrderListProps } from './_logic/usePresenter';

export const OrderList = (props: OrderListProps) => {
  const { rows, isLoading, pagination, open } = usePresenter(props);
  if (isLoading) return <Spinner />;
  return (
    <>
      {rows.map((row) => <OrderRow key={row.id} row={row} onOpen={() => open(row.id)} />)}
      {pagination && <Pagination {...pagination} />}
    </>
  );
};

// UserCard/_logic/usePresenter.ts — even turning null into undefined happens here
export const usePresenter = ({ userId }: UserCardProps) => {
  const { user } = useUser(userId);
  return { name: user?.name ?? 'Guest', imageSrc: user?.image ?? undefined };
};

// Badge/Badge.tsx — usePresenter returns the key ready: tone: props.tone ?? 'info'
const TONE_STYLES = {
  info: { color: 'navy' },
  warning: { color: 'darkorange' },
} satisfies Record<BadgeTone, CSSProperties>;

export const Badge = (props: BadgeProps) => {
  const { tone, label } = usePresenter(props);
  return <span style={TONE_STYLES[tone]}>{label}</span>;
};

// SaveButton/SaveButton.tsx — no Presenter; spreads all its props onto one child
export type SaveButtonProps = ButtonProps;
export const SaveButton = (props: SaveButtonProps) => <Button icon="save" {...props} />;

// EmptyCart/EmptyCart.tsx — no props, no props type
export const EmptyCart = () => <Text>The cart is empty</Text>;

// src/main.tsx — AppShell is a child unit of the root level; its only user is main.tsx
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppShell>
      <App />
    </AppShell>
  </StrictMode>,
);
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

// UserCard/UserCard.tsx
export const UserCard = (props: UserCardProps) => {
  const { user } = usePresenter(props);
  return <Avatar name={user?.name ?? 'Guest'} src={user?.image ?? undefined} />;
};
```

**Stack notes.** Carries out the core rule [View and Presenter](../../core/view-presenter.md).
