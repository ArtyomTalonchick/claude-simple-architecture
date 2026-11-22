## View and Presenter

**Rule.** Split a UI unit into a View, which holds only markup and styles and takes every value and handler from
its Presenter, and a Presenter, which holds all its logic — state, effects, data access, computations, handlers. A
UI unit with no logic has no Presenter.

**Why.** Markup and logic change for different reasons. Mixed in one place, a change to either means reading
both, and the logic cannot be found, reused or tested apart from the markup. Kept apart, a layout change touches
only the View, a behaviour change only the Presenter, and a View reads as a plain picture of the screen. The View,
the caller, sets the interface — values and handlers ready to render — so when a field is disabled, or what a
handler does, can change without it.

**How to check.**

- The entry of a unit in an app with no UI is not a View.
- A View may: call its own Presenter once and read values from the result; hold markup and styles — of the design
  system (a style by name, a theme value, a value per screen size) or a row of its own literal style table by a
  ready key (`STYLES[p.size]`); read a resource text by a literal key, with ready values as parameters; show or
  hide a part by a ready flag (an "if" or a two-way choice on it) or by a ready value that is there or not; repeat
  a part for each item of a ready list; pass a ready handler; wrap a Presenter handler only to pass it an argument
  (`select(item.id)`); keep a constant written out as a plain value (a list of labels, a size).
- A violation in a View: state, effects or lifecycle code; reading data or a store directly; a computation or
  formatting of raw data (filtering, sorting, comparing, rounding, joining text); a handler that does more than call
  one Presenter handler.
- A text's plural forms and formats are the resource's: a View may pass them a ready raw value. A violation: a key
  built from data (`"status." + p.status`), a computation in the parameters, a text chosen by a condition, reading
  or changing the language.
- Choosing a value by a condition is a computation too: a fallback or a default for a missing value, a value picked
  by a condition, a read of a field that may be missing, turning one "no value" into another, for a style key too;
  choosing markup by a ready flag, or a style row by a ready key, is not.
- The whole View file counts: a constant computed outside the markup (a list mapped from another, text joined from
  parts) is a computation in the View.
- How a Presenter calls a task is set by [Tasks](tasks.md).
- A Presenter file with no logic in it (an empty or pass-through Presenter) is a violation. A plain read of a prop's
  field is not logic: a Presenter that only returns its props or their fields (`name = props.show.name`) is one.
- A child unit reads the store and calls the task in its own Presenter: handing it a value read from a store or
  computed from one, or a handler that only calls a task, is a violation. Props carry the item a list repeats the
  child for — whole, its id or a ready row — and options of the look (a size, a variant); a component, of the
  ui-kit or a components folder, takes all as props. What several units read is a store, in the shape they read
  it; what one unit shows stays in its Presenter ([Tasks](tasks.md)).
- A **warning**, not a violation: a Presenter whose own state and lifecycle fall into two or more groups by the
  two-concerns test of [Stateful logic and plain functions](stateful-logic-and-functions.md). Name the groups and
  which could move out as stateful logic. Not counted: the stateful logic it calls, values computed from props or
  from it, and a task's loading and error kept by the handler that calls it.
- A short handler that acts on the screen — prevent the default action, move the focus — may stay inline in the
  Presenter; it moves to a plain function when it grows or another file needs it.
- The props type lives in the Presenter, and the View passes it on to its users, who import it from the View; a View
  without a Presenter declares its own. A type that is part of it — the type of one prop, such as a variant — goes
  the same way, however many files use it, never to a types file.
- A View without a Presenter that passes all its props on to one child may alias the child's props type. A unit
  with no props has none, not an empty one.

**Good.**

```
OrderList/
  OrderList   (View)       p = presenter(props)
                           if p.isLoading: Spinner
                           for row in p.rows: OrderRow(row, onOpen = () => p.open(row.id))
  _logic/
    presenter (Presenter)  on mount: the task loadOrders; orders = read from the orders store
                           isLoading = orders are not loaded yet
                           rows = orders with status == props.status, each with total = round(sum * 1.2, 2)
                           open(id) = go to the order page
                           clearSearch() = empty the search field; move the focus back to it — short, inline
SaveButton/
  SaveButton  (View)       SaveButtonProps = ButtonProps — an alias of its child's props type
                           Button(props as they are, variant = primary)
EmptyCart/
  EmptyCart   (View)       no props, so no props type
                           Text("The cart is empty")
```

A pattern, not a check: a View with several screens or states only chooses which one to show, each its own child
unit; and a Presenter may return a component's props as one ready value, typed by its props type (a type-only
import, [Imports](imports.md)), or nothing when it is hidden.

```
OrderPage/
  OrderPage   (View)       p = presenter(props)
                           p.isEmpty ? OrderStart : OrderResults
                           if p.pagination: Pagination(p.pagination as its props) — a ui-kit component
  _logic/
    presenter (Presenter)  isEmpty = no filter is set
                           pagination = page count > 1 ? { page, total, onPageChange = go to page } : nothing
  OrderStart/
  OrderResults/            its own Presenter reads the orders store
```

A large Presenter only joins: each group of its own state moves out as stateful logic.

```
SearchPage/
  _logic/
    presenter  (Presenter) field = searchField(); results = searchRequest(); screen = searchScreen()
                           onChange(text): field.change(text); results.search(text)
    searchField            the field: value, change, clear
    searchRequest          the request: calls the task search, keeps its loading and result
    searchScreen           which screen is shown, and the switch between them
```

**Bad.**

```
OrderList/
  OrderList   (View)       orders = load orders
                           for order in orders where order.status == props.status:
                             OrderRow(order, total = round(order.sum * 1.2, 2), title = order.name or "Untitled")
OrderPage/
  OrderPage   (View)       OrderResults(count = p.count, onRetry = p.onRetry)
  _logic/
    presenter (Presenter)  count from the orders store, onRetry calls loadOrders — handed down
```

**Stack notes.** [react/view-presenter.md](../stack/react/view-presenter.md) — View and Presenter in React.
