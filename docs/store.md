[*Up*](./api.md)

# mithril-helpers/store

Exposes `store = makeStore(initial?, onchange?)`, which is very much like a spiritial successor to Mithril v0.2's `m.prop()`, just without all the magic promise wrapping stuff, and with a more useful API.

- When you call `store()`, you get the value.
- When you call `store(newValue)`, it invokes `onchange(newValue, oldValue)` if it exists, for easy observation.

I also threw in a couple niceities to make it even better.

1. I optimized the case of no `onchange`, so it is faster and takes less memory.
2. Changing the value from an `onchange` doesn't call the function recursively.

```js
// Simple example
function TextBox() {
    var title = m.helpers.makeStore("")

    return {
        view: ({attrs}) => m("input", {
            value: title(),
            onchange: e => title(e.target.value),
            onkeydown: function (e) {
                if (e.keyCode === 13) {
                    attrs.onsubmit(title())
                    return false
                } else if (e.keyCode === 27) {
                    title("")
                    attrs.oncancel()
                    return false
                }
            },
        }),
    }
}
```

## Usage

- `m.helpers.makeStore(initial?, onchange?) -> store`

    - Accepts an optional initial value, defaulting to `undefined`.
    - Accepts an optional `(old, new) -> any` change listener, defaulting to a no-op.
    - Returns a new store.

- `store() -> value`

    - Returns the currently stored value.

- `store(newValue) -> newValue`

    - Accepts a new value to set the store to.
    - Returns the newly stored value.
    - Calls `onchange` if not set recursively within it.
