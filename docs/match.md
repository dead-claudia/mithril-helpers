[*Up*](./api.md)

# mithril-helpers/match

Exposes a `when(cond, then, orElse)` utility, a `cond(...cases)` utility, and a `match(value, ...cases)` utility.

Ordinarily, you'd do things like this:

```js
return showViewOne
    ? m(".view-one", ...)
    : m(".view-two", ...)
```

Thing is, that doesn't actually reset the lifecycle. The `doSomeMagicalThingTwo` doesn't get called if you flip that boolean, and that's bound to result in unwanted behavior if you treat it naïvely.

```js
return showViewOne
    ? m(".view-one", {oncreate() { doSomeMagicalThingOne() }}, ...)
    : m(".view-two", {oncreate() { doSomeMagicalThingTwo() }}, ...)
```

This lets you instead do this, with everything automagically tracked and lifecycle hooks precisely as you'd expect:

```js
return when(showViewOne,
    () => m(".view-one", {oncreate() { doSomeMagicalThingOne() }}, ...)},
    () => m(".view-two", {oncreate() { doSomeMagicalThingTwo() }}, ...)},
)
```

If you wanted to add more in a chain, you could use `cond`:

```js
return cond(
    {if: view === "one", then: () => m(".view-one", {oncreate() { doSomeMagicalThingOne() }}, ...)},
    {if: view === "two", then: () => m(".view-two", {oncreate() { doSomeMagicalThingTwo() }}, ...)},
    // ...
)
```

This common case can itself be simplified with `match`.

```js
return match(view,
    {if: "one", then: () => m(".view-one", {oncreate() { doSomeMagicalThingOne() }}, ...)},
    {if: "two", then: () => m(".view-two", {oncreate() { doSomeMagicalThingTwo() }}, ...)},
)
```

## Usage

- `m.helpers.when(cond, then, orElse)`

    - `cond` is the condition to test.
    - `then` returns the result you want to render if `cond` is truthy.
    - `orElse` returns the result you want to render if `cond` is falsy.
    - Returns a fragment vnode that ensures that when the condition changes, the tree is torn down and rebuilt between cases.

- `m.helpers.cond(case1, case2, ...)`

    - `case1.if`, `case2.if`, and so on are the conditions to test.
    - `case1.then`, `case2.then`, and so on are the views to render, rendered if their corresponding `if` is truthy.
    - Returns a fragment vnode that when rendered, renders as if each rendered case was keyed by argument position. (For optimization reasons, this uses an unkeyed fragment internally, but this is an implementation detail.)

- `m.helpers.match(value, case1, case2, ...)`

    - `value` is the value to compare against, via the ES SameValueZero algorithm (basically `===`, but with `NaN`s considered equal)
    - `case1.if`, `case2.if`, and so on are the conditions to compare against `value`.
    - `case1.then`, `case2.then`, and so on are the views to render, rendered if their corresponding `if` is truthy.
    - Returns a fragment vnode that when rendered, renders as if each rendered case was keyed by argument position. (For optimization reasons, this uses an unkeyed fragment internally, but this is an implementation detail.)
