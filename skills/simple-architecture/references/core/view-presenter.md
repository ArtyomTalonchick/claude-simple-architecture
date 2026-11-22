## View and Presenter

**Rule.** Split a UI unit into a View, which holds only markup and styles and takes every value and handler from
its Presenter, and a Presenter, which holds all its logic — state, effects, data access, computations, handlers. A
UI unit with no logic has no Presenter.

**Why.** Markup and logic change for different reasons and at different times. Mixed in one place, a change to
either means reading both, and the logic cannot be found, reused or tested apart from the markup. Kept apart, a
layout change touches only the View, a behaviour change only the Presenter, and a View reads as a plain picture of
the screen. The View, the caller, sets the interface — values and handlers ready to render — so when a field is
disabled, or what a handler does, can change without it.

**How to check.**

- The rule covers UI units. The entry of a unit in an app with no UI is not a View and is not checked by it.
- A View may: call its own Presenter once and read values from the result; hold markup and styles, reading styles
  from the design system included (a style by its name, a theme value, a value per screen size); show or hide a part
  by a ready flag (an "if" or a two-way choice on it) or by a ready value that is there or not; repeat a part for each
  item of a ready list; pass a ready handler; wrap a Presenter handler only to pass it an argument
  (`select(item.id)`); keep a constant written out as a plain value (a list of labels, a size).
- A violation in a View: state, effects or lifecycle code; reading data or a store directly; a computation or
  formatting of raw data (filtering, sorting, comparing, rounding, joining text); a handler that does more than call
  one Presenter handler.
- Choosing a value by a condition is a computation too: a fallback or a default for a missing value, a value picked
  by a condition, a read of a field that may be missing, turning one kind of "no value" into another. Choosing which
  markup to show by a ready flag is not.
- The whole View file counts: a constant built by a computation outside the markup (a list mapped from another list,
  text joined from parts) is a computation in the View, and the unit then needs a Presenter. Reading styles from the
  design system is not stateful logic.
- How a Presenter calls a business action — from a handler or an effect on start, with no steps of the action or
  conditions on the app's data of its own — is set by [Tasks](tasks.md).
- A Presenter file with no logic in it (an empty or pass-through Presenter) is a violation.
- A **warning**, not a violation: a Presenter whose own state and lifecycle fall into two or more groups by the
  two-concerns test of [Stateful logic and plain functions](stateful-logic-and-functions.md). Name the groups and
  which could move out as stateful logic to the unit's logic folder. Not counted: the stateful logic it calls, the
  values it computes from props or from that logic, and the loading and error of a task kept by the handler that
  calls it. A Presenter with one group of its own stays whole.
- A short handler that acts on the screen — prevent the default action, move the focus — may stay inline in the
  Presenter; it moves to a plain function when it grows or another file needs it. Where that line lies is a
  judgement: an inline handler of this kind is not a violation.
- The props type lives in the Presenter, and the View passes it on to its users, who import it from the View; a View
  without a Presenter declares its own. A type that is part of the props type — the type of one prop, such as an icon
  name or a variant — goes the same way, however many files use it, and never moves to a types file.
- A View without a Presenter that passes all its props on to one child may declare its props type as an alias of the
  child's. A unit with no props has no props type — not an empty one.

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
unit; and a Presenter may return a child's props as one ready value, typed by the child's props type (a type-only
import, [Imports](imports.md)), or nothing when the child is hidden. A View that passes separate ready values
instead is not a violation.

```
OrderPage/
  OrderPage   (View)       p = presenter(props)
                           p.isEmpty ? OrderStart : OrderResults
                           if p.pagination: Pagination(p.pagination as its props)
  _logic/
    presenter (Presenter)  isEmpty = no filter is set
                           pagination = page count > 1 ? { page, total, onPageChange = go to page } : nothing
  OrderStart/
  OrderResults/
  Pagination/
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
```

**Stack notes.** [react/view-presenter.md](../stack/react/view-presenter.md) — View and Presenter in React.
