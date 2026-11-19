## View and Presenter

**Rule.** Split a UI unit into a View and a Presenter. The View holds only markup and styles and takes every
value and handler from its Presenter; all logic — state, effects, data access, computations, handlers — lives in
the Presenter. A UI unit with no logic has no Presenter.

**Why.** Markup and logic change for different reasons and at different times. Mixed in one place, a change to
either means reading both, and the logic cannot be found, reused or tested apart from the markup. Kept apart, a
layout change touches only the View, a behaviour change only the Presenter, and a View reads as a plain picture
of the screen.

**How to check.**

- The rule covers UI units. A unit of an app with no UI has an entry in place of a View
  ([Levels and placement](levels.md)); the entry is not a View, and this rule does not check it.
- A View may: call its own Presenter once and read values from the result; hold markup and styles, including
  reading styles from the design system (a style by its name, a theme value, a value per screen size); show or
  hide a part by a ready flag from the Presenter (an "if" or a two-way choice on that flag) or by a ready value
  that is there or not; repeat a part for each item of a ready list; pass a ready handler; wrap a Presenter
  handler only to pass it an argument (`select(item.id)`); keep a constant written out as a plain value (a list
  of labels, a size).
- A violation in a View: state, effects or lifecycle code; reading data or a store directly; a computation or
  formatting of raw data (filtering, sorting, comparing, rounding, joining text); a handler that does more than
  call one Presenter handler.
- Choosing a value by a condition is a computation too: a fallback or a default for a missing value, a value
  picked by a condition, a read of a field that may be missing, turning one kind of "no value" into another. The
  Presenter returns the ready value. Choosing which markup to show by a ready flag stays allowed.
- The whole View file counts, not only its markup: a constant built by a computation outside the markup (a list
  mapped from another list, text joined from parts) is a computation in the View. It goes to the Presenter: a
  unit that needs it has logic, so it has a Presenter. Reading styles from the design system is not stateful
  logic and is not a violation of [Stateful logic and plain functions](stateful-logic-and-functions.md).
- A business action is a task the Presenter calls ([Tasks](tasks.md)): the Presenter awaits it, keeps the state
  of the call — loading, error — and decides what follows, navigation included. The steps of the action itself do
  not belong in the Presenter. A change of UI state — which screen is shown, a flag for an animation — is not a
  business action: the Presenter may make it itself or hand it to a plain function
  ([Stateful logic and plain functions](stateful-logic-and-functions.md)).
- A violation: a Presenter file with no logic in it (an empty or pass-through Presenter).
- A **warning**, not a violation: a Presenter whose own state and lifecycle fall into two or more groups by the
  two-concerns test of [Stateful logic and plain functions](stateful-logic-and-functions.md). Name the groups and
  say which could move out as stateful logic, so the Presenter only joins it. Not counted: the stateful logic it
  calls, the values it computes from props or from that logic, and the loading and error of a task kept by the
  handler that calls it. A Presenter with one group of its own stays whole: splitting it would add a file for
  nothing. The moved-out logic goes to the unit's own logic folder ([Levels and placement](levels.md)). Which jobs
  are simple enough to stay is a judgement, so it is not a violation.
- A short handler that acts on the screen — prevent the default action, move the focus — may stay inline in the
  Presenter. It moves to a plain function in the logic folder when it grows or another file needs it too
  ([Stateful logic and plain functions](stateful-logic-and-functions.md)). Where that line lies is a judgement, not
  a check: an inline handler of this kind is not a violation.
- The props type lives in the Presenter, and the View passes it on to its users, so they import it from the
  View; a View without a Presenter declares its own props type. A type that is part of the props type — the type
  of one prop, such as an icon name or a variant — goes the same way: declared with it, passed on by the View,
  imported from the View ([Levels and placement](levels.md)).
- A View without a Presenter that passes all its props on to one child may declare its props type as an alias of
  the child's props type: that is declaring its own. A unit with no props has no props type — not an empty one.

**Good.**

```
OrderList/
  OrderList   (View)       p = presenter(props)
                           if p.isLoading: Spinner
                           for row in p.rows: OrderRow(row, onOpen = () => p.open(row.id))
  _logic/
    presenter (Presenter)  orders = load orders
                           isLoading = orders are not loaded yet
                           rows = orders with status == props.status, each with total = round(sum * 1.2, 2)
                           open(id) = go to the order page
                           cancel(id) = await the task cancelOrder(id); keep its loading and error
                           clearSearch() = empty the search field; move the focus back to it — short, acts on the
                           screen, so it may stay inline
```

A View without a Presenter that passes all its props on to one child, and a unit with no props:

```
SaveButton/
  SaveButton  (View)       SaveButtonProps = ButtonProps — an alias of its child's props type
                           Button(props as they are, variant = primary)
EmptyCart/
  EmptyCart   (View)       no props, so no props type
                           Text("The cart is empty")
```

A pattern, not a check: a View with several screens or states may only choose which one to show, with each
screen or state its own child unit. A change to one state then touches one unit.

```
OrderPage/
  OrderPage   (View)       p = presenter(props)
                           p.isEmpty ? OrderStart : OrderResults
  _logic/
    presenter (Presenter)  isEmpty = no filter is set
  OrderStart/
  OrderResults/
    OrderResults (View)    p = presenter(props)
                           if p.isLoading: ResultsLoading
                           if p.isError:   ResultsError(onRetry = p.retry)
                           if p.isEmpty:   ResultsEmpty
                           if p.hasRows:   ResultsList(p.rows)
    _logic/
      presenter            isLoading, isError, isEmpty, hasRows — one is true at a time
    ResultsLoading/
    ResultsError/
    ResultsEmpty/
    ResultsList/
```

A pattern, not a check: a Presenter may return a child's props as one ready value, typed by the props type the
child passes on ([Imports](imports.md) allows that type-only import), or nothing when the child is hidden. The View
shows the child when the value is there and passes it on whole. The View then does not list the child's props, and
a new prop of the child touches only the Presenter. A View that passes separate ready values instead is not a
violation: passing a ready value is not a computation.

```
OrderList/
  OrderList   (View)       p = presenter(props)
                           if p.pagination: Pagination(p.pagination as its props)
  _logic/
    presenter (Presenter)  pagination = page count > 1 ? { page, total, onPageChange = go to page } : nothing
  Pagination/
```

A large Presenter only joins: each group of its own state moves out as stateful logic, and the Presenter calls it,
joins the results and hands out props. A presenter of SearchPage that kept the screen state itself next to the
field and the request would get a warning; with the screen state moved out it only joins:

```
SearchPage/
  SearchPage   (View)      p = presenter(props)
  _logic/
    presenter  (Presenter) field = searchField(); results = searchRequest(field.value); screen = searchScreen()
    searchField            the field: value, change, clear
    searchRequest          the request for a value: calls the task search
    searchScreen           which screen is shown, and the switch between them with a transition
```

**Bad.**

```
OrderList/
  OrderList   (View)       orders = load orders
                           for order in orders where order.status == props.status:
                             OrderRow(order, total = round(order.sum * 1.2, 2))
```

**Stack notes.** [react/view-presenter.md](../stack/react/view-presenter.md) — View and Presenter in React.
