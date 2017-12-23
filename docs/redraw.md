[*Up*](./api.md)

# mithril-helpers/redraw

A utility to prevent unnecessary redraws and avoid buggy behavior when linking streams/stores to `m.redraw`.

- `redraw = makeRedraw()` - Make an async redraw wrapper around the global redraw system.

- `redraw = makeRedraw(state)` - Make an async redraw wrapper around a `SelfSufficient` instance.

- `redraw()` - Invoke the redraw wrapper.

- `redraw.ready()` - Open the redraw wrapper, so it may start scheduling redraws.

Now, you're probably wondering *what* buggy behavior I'm referring to. Consider this example, which would result in a nasty surprise:

```js
const Comp = {
    oninit({state}) {
        // ...
        state.foo.map(m.redraw)
    },

    oncreate({dom, state}) {
        state.plugin = $(dom).somePlugin()
        state.plugin.setFoo("initial")
    },

    onupdate({dom, state}) {
        state.plugin.setFoo(state.foo() ? "foo" : "bar")
    },

    view({attrs, state}) {
        // ...
    }
}
```

If `state.foo` is a stream that already has a value, you've just called `m.redraw` *inside* `oninit`. In v1, this will likely *not* do what you want, instead most likely causing `onupdate` to be called *inside* `oninit`. This would look like a Mithril problem, except it's because when you called `m.redraw`, it just rendered the same tree recursively. Here's what it's really doing:

- Render `m(Comp)`:
    - Call `oninit`:
        - Render `m(Comp)`:
            - Try to update existing children
            - No children found
            - Error!

Moving the `state.foo.map(m.redraw)` to `oncreate` could fix it, but we can't simply move it to the beginning, either:

```js
const Comp = {
    oninit({state}) {
        // ...
    },

    oncreate({dom, state}) {
        state.foo.map(m.redraw)

        state.plugin = $(dom).somePlugin()
        state.plugin.setFoo("initial")
    },

    onupdate({dom, state}) {
        state.plugin.setFoo(state.foo() ? "foo" : "bar")
    },

    view({attrs, state}) {
        // ...
    }
}
```

Now, it at least looks like it might work, except:

- Render `m(Comp)`:
    - Call `oninit`
    - Render children
    - Call `oncreate`:
        - Render `m(Comp)`:
            - Update children
            - Call `onupdate`
            - `state.plugin` is `undefined`, so you can't call `state.plugin.setFoo`
            - Error!

Moving the `state.foo.map(m.redraw)` to the bottom of `oncreate` could fix it mostly, but it's a very ugly hack, and only works for one stream/property (and it doesn't work with stores from here, either).

```js
const Comp = {
    oninit({state}) {
        // ...
    },

    oncreate({dom, state}) {
        state.plugin = $(dom).somePlugin()
        state.plugin.setFoo("initial")

        state.foo.map(m.redraw)
    },

    onupdate({dom, state}) {
        state.plugin.setFoo(state.foo() ? "foo" : "bar")
    },

    view({attrs, state}) {
        // ...
    }
}
```

Alternatively, you could use `Promise.resolve` or `setTimeout`, but those are just as ugly and hackish.

```js
const Comp = {
    oninit({state}) {
        // ...
    },

    oncreate({dom, state}) {
        state.foo.map(() => { Promise.resolve().then(m.redraw) })

        state.plugin = $(dom).somePlugin()
        state.plugin.setFoo("initial")
    },

    onupdate({dom, state}) {
        state.plugin.setFoo(state.foo() ? "foo" : "bar")
    },

    view({attrs, state}) {
        // ...
    }
}
```

Here's what this utility lets you do:

```js
const Comp = {
    oninit({state}) {
        // ...
        state.redraw = m.helpers.makeRedraw()

        // Right where it belongs, and nothing is scheduled until `oncreate` is
        // called
        state.foo.map(state.redraw)
    },

    oncreate({dom, state}) {
        // And now everything is scheduled asynchronously
        state.redraw.ready()

        state.plugin = $(dom).somePlugin()
        state.plugin.setFoo("initial")
    },

    onupdate({dom, state}) {
        state.plugin.setFoo(state.foo() ? "foo" : "bar")
    },

    view({attrs, state}) {
        // ...
    }
}
```

It also optionally takes a `state` parameter (a `SelfSufficient` instance), in which it will proxy calls to.

```js
const Comp = {
    __proto__: new m.helpers.SelfSufficient(),

    oninit({state}) {
        // ...
    },

    view({attrs}) {
        return m(m.helpers.SelfSufficient, {
            oninit: ({state}) => {
                state.redrawWrap = m.helpers.makeRedraw(state)

                // Right where it belongs, and nothing is scheduled until
                // `oncreate` is called
                state.foo.map(state.redrawWrap)
            },

            oncreate: ({dom, state}) => {
                // And now everything is scheduled asynchronously
                state.redrawWrap.ready()

                state.plugin = $(dom).somePlugin()
                state.plugin.setFoo("initial")
            },

            onupdate: ({state}) => {
                state.plugin.setFoo(this.foo() ? "foo" : "bar")
            },

            view: ({state}) => {
                // ...
            },
        })
    }
}
```

## Usage

- `m.helpers.makeRedraw() -> redraw`

    - Returns a new redraw wrapper around the global redraw system (i.e. `m.redraw`).

- `m.helpers.makeRedraw(state) -> redraw`

    - Returns a new redraw wrapper around `state`.
    - `state` should be a `SelfSufficient` component's `vnode.state`.

- `redraw() -> void`

    - If ready, schedules an async redraw with the underlying instance (i.e. `SelfSufficient` state or `m.redraw`).
    - Returns `undefined`.

- `redraw.ready() -> void`

    - Opens the redraw wrapper so it can begin scheduling redraws.
    - Returns `undefined`
