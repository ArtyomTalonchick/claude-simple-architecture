## View and Presenter

**Rule.** Split a UI unit into a View and a Presenter. The View holds only markup and styles and takes every
value and handler from its Presenter; all logic — state, effects, data access, computations, handlers — lives in
the Presenter. A UI unit with no logic has no Presenter.

**Why.** Markup and logic change for different reasons and at different times. Mixed in one place, a change to
either means reading both, and the logic cannot be found, reused or tested apart from the markup. Kept apart, a
layout change touches only the View, a behaviour change only the Presenter, and a View reads as a plain picture
of the screen.

**How to check.**

- A View may: call its own Presenter once and read values from the result; hold markup and styles, including
  reading styles from the design system (a style by its name, a theme value, a value per screen size); show or
  hide a part by a ready flag from the Presenter (an "if" or a two-way choice on that flag); repeat a part for
  each item of a ready list; pass a ready handler; wrap a Presenter handler only to pass it an argument
  (`select(item.id)`); keep a constant written out as a plain value (a list of labels, a size).
- A violation in a View: state, effects or lifecycle code; reading data or a store directly; a computation or
  formatting of raw data (filtering, sorting, comparing, rounding, joining text); a handler that does more than
  call one Presenter handler.
- The whole View file counts, not only its markup: a constant built by a computation outside the markup (a list
  mapped from another list, text joined from parts) is a computation in the View. It goes to the Presenter: a
  unit that needs it has logic, so it has a Presenter. Reading styles from the design system is not stateful
  logic and is not a violation of [Stateful logic and helpers](stateful-logic-and-helpers.md).
- A violation: a Presenter file with no logic in it (an empty or pass-through Presenter).
- The props type lives in the Presenter, and the View passes it on to its users, so they import it from the
  View; a View without a Presenter declares its own props type.

**Good.**

```
OrderList/
  OrderList   (View)       p = presenter(props)
                           if p.isLoading: Spinner
                           for row in p.rows: OrderRow(row, onOpen = () => p.open(row.id))

  presenter   (Presenter)  orders = load orders
                           isLoading = orders are not loaded yet
                           rows = orders with status == props.status, each with total = round(sum * 1.2, 2)
                           open(id) = go to the order page
```

A pattern, not a check: a View with several screens or states may only choose which one to show, with each
screen or state its own child unit. A change to one state then touches one unit.

```
OrderPage/
  OrderPage   (View)       p = presenter(props)
                           p.isEmpty ? OrderStart : OrderResults
  presenter   (Presenter)  isEmpty = no filter is set
  OrderStart/
  OrderResults/
    OrderResults (View)    p = presenter(props)
                           if p.isLoading: ResultsLoading
                           if p.isError:   ResultsError(onRetry = p.retry)
                           if p.isEmpty:   ResultsEmpty
                           if p.hasRows:   ResultsList(p.rows)
    presenter              isLoading, isError, isEmpty, hasRows — one is true at a time
    ResultsLoading/
    ResultsError/
    ResultsEmpty/
    ResultsList/
```

**Bad.**

```
OrderList/
  OrderList   (View)       orders = load orders
                           for order in orders where order.status == props.status:
                             OrderRow(order, total = round(order.sum * 1.2, 2))
```

**Stack notes.** [react/view-presenter.md](../stack/react/view-presenter.md) — View and Presenter in React.
