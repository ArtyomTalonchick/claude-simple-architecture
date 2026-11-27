## Entry folders

**Rule.** Put an entry of a logic folder, or a store, that has parts only it uses in a folder named as it, holding
the entry and those parts, and nest a part with parts of its own the same way, at any depth; in a tasks folder such
a folder is allowed, not required. From outside the folder, import only its entry.

**Why.** The parts of one function, kept in its folder, are not mistaken for other code of the unit, and a reader
sees which files belong together. With only the entry used from outside, the parts can change without checking
anyone else.

**How to check.**

- An entry folder is a folder in a logic folder, a tasks folder, a stores folder or another entry folder that holds
  a file named as the folder: its entry — stateful logic, a plain function, a task or a store, never the Presenter.
  It is not a level and not a unit; it belongs to the level that holds that logic folder or stores folder, or to no
  level in the app's tasks folder and stores folder.
- A part is code that only this entry uses, directly or through other parts: stateful logic or a plain function of
  stateful logic; a plain function or a task of a task; a plain function of a plain function; the type of a store's
  API, its implementations and the plain functions only it uses; a types file or a constants file used only inside
  the folder. A part keeps its own kind and is checked as that kind.
- A task is never a part of stateful logic or of a plain function: it lies in a tasks folder, and a part of either
  that does I/O or is a step of a business action is a task. A part that calls a task and decides what the screen
  shows — a toast's Undo — is not a step of the business action: it keeps its kind. A task that only one other task
  calls may be a part of that task's entry folder or a task of its own in the tasks folder: both are fine.
- The parts decide, not the line count: an entry with parts only it uses is a folder at any size.
- The folder holds its entry, its parts as files — one thing each — the entry folders of parts with parts of their
  own, and its tests (a tests folder or files beside the code, by the project's convention). Any other folder in it
  is a violation.
- The users of the folder are the users of its entry: it counts as one file of the folder that holds it. Imports
  into and inside it: [Imports](imports.md).
- The entry of a store entry folder is the store its users reach: it gives the API and, when the store has several
  implementations, picks one by the environment (in memory locally, a database where the app is deployed). An
  implementation is a part, not a store, so the entry importing it is not one store importing another.
- A closed store's folder is not an entry folder: [Closed store access](closed-store-access.md).
- In a unit's logic folder outside its tasks folder, and in a stores folder, an entry whose parts lie next to it —
  in the same folder, or in the folder of the entry it is a part of — is a violation: the parts move into its entry
  folder. In a tasks folder, a unit's or the app's, parts lying flat are fine, inside a task's entry folder too.
- A part used by anything outside its entry's folder, tests aside, is a violation: it is not a part. It moves out to
  the nearest folder that covers all its users — the outer entry folder when all of them are there, else the logic
  folder, or the tasks folder when only tasks use it — or, with users in other units, where
  [Placement by users](placement.md) says.
- An entry folder that holds only its entry, or its entry and its tests, is a violation: it is a file.

**Good.**

```
ProductSearch/
  _logic/
    presenter           Presenter: search = productSearch()
    productSearch/      productSearch is used only by the presenter
      productSearch     the entry: stateful logic, joins productParams and productRequest
      productParams     a part: the query and the filters kept in the address
      productRequest/   a part with a part only it uses — an entry folder inside productSearch/
        productRequest  keeps loading and error of the task searchProducts, called from its search handler
        toSearchView    a plain function: response -> the list to show
        tests/
      tests/
    _tasks/
      searchProducts    a task is never a part of stateful logic
      exportResults/    a task with a plain function only it uses — a folder, allowed, not required
        exportResults
        toCsvRow
      printResults      a task lying flat with toPrintRow, the plain function only it uses — as fine
      toPrintRow
  _stores/
    resultsTable/       a store with parts only it uses
      resultsTable      the entry: the API; picks the database where the app is deployed, memory otherwise
      types             ResultsTable — the type of the API
      memoryResults     a part: the API over a map
      databaseResults   a part: the API over the app's own database
```

**Bad.**

```
ProductSearch/
  _logic/
    presenter           imports productQuery/queryParams
    productSearch       its parts lie next to it — it is an entry folder: productSearch/
    productRequest      used only by productSearch — a part: it belongs in productSearch/
    toSearchView        used only by productRequest — it belongs in productSearch/productRequest/
    filters/
      filters           holds only its entry — it is a file
    productQuery/
      productQuery
      queryParams       the presenter uses it too — not a part: it moves out to _logic/
  _stores/
    resultsTable        the store's entry with its parts next to it — a store entry folder: resultsTable/
    memoryResults
```

**Stack notes.** None.
