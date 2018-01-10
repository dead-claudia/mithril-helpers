[*Up*](./api.md)

# mithril-helpers/self-sufficient

Exposes a `SelfSufficient` component, for making self-sufficient (i.e. no dependency on `m.redraw`) object/closure and class components, respectively. It's also useful if you're using `m.render` directly, since you don't have to worry about implementing batching and all the other annoying crap.

- `m(m.helpers.SelfSufficient, {view: (state) -> vnode})` - Create a new instance to do subtree management.
    - `view` is what you want your subtree to look like. It's a function called on each redraw. Note that you *must* return an actual DOM node.
    - All the lifecycle methods work just as they normally would and just as you would expect. In particular, `onbeforeupdate` and `onupdate` are called on internal redraws as well as external ones.
    - The returned vnode is what's used to redraw with, and is what's ultimately returned.

- `state.safe()` - Whether it's safe to invoke `redrawSync`.

- `state.redraw()` - Schedule a redraw for this subtree.

- `state.redrawSync()` - Force a synchronous redraw for this vnode.

- `state.link(handler)` - Wrap an event handler to implicitly redraw iff `e.redraw !== false`, much like how Mithril normally does implicitly when you use `m.mount`.

Here's a few examples of how it's used:

```js
// Objects
const Comp = {
    oninit() { this.clicked = false },
    view(vnode) {
        return m(m.helpers.SelfSufficient, {view: state => m("div", [
            m(".foo", "What is this?"),
            this.clicked
                ? m(".bar.fail", "Why did you click me?!?")
                : m(".bar", {
                    onclick: state.link(() => { this.clicked = true }),
                }, "Just kidding, nothing to see here..."),
        ])})
    }
}

// Closures
function Comp() {
    var clicked = false

    return {
        view(vnode) {
            return m(m.helpers.SelfSufficient, {view: state => m("div", [
                m(".foo", "What is this?"),
                this.clicked
                    ? m(".bar.fail", "Why did you click me?!?")
                    : m(".bar", {
                        onclick: state.link(() => { this.clicked = true }),
                    }, "Just kidding, nothing to see here..."),
            ])})
        }
    })
}

// Classes
class Comp {
    constructor() {
        this.clicked = false
    }

    view(vnode) {
        return m(m.helpers.SelfSufficient, {view: state => m("div", [
            m(".foo", "What is this?"),
            this.clicked
                ? m(".bar.fail", "Why did you click me?!?")
                : m(".bar", {
                    onclick: state.link(() => { this.clicked = true }),
                }, "Just kidding, nothing to see here..."),
        ])})
    }
}
```

## Usage

- `m(m.helpers.selfSufficient, {view: (state) -> vnode})`

    - `view` is the function used to generate the tree. It must return a DOM vnode, it must return the *same* DOM node type, and it *must not* include a `key`. (If you violate these invariants, it will know, and it will complain very loudly at you and mock you endlessly for it. :wink:)
        - If you need to use a different DOM node, you'll need to return a `SelfSufficient` vnode with a different `key` on the `SelfSufficient` component.
        - If you need to use a `key`, put it on the `SelfSufficient` vnode, not the `view`'s result.
    - Throws on render and redraw if any invariant is not upheld.

- `state.safe() -> boolean`

    - Returns `true` if you are able to redraw synchronously (i.e. no other redraw is occurring), `false` otherwise.

- `state.redraw() -> void`

    - Schedules an async redraw, batching the call if necessary.
    - Returns `undefined`.

- `state.redrawSync() -> void`

    - Performs an immediate redraw, cancelling any scheduled async redraw if necessary.
    - Returns `undefined`.
    - Throws if any redraw is occurring known to the helper.

- `state.link(handler) -> handler`

    - Accepts either a function or event listener object.
    - Returns a function that when called with an event:
        - Invokes the handler with the event.
        - If `ev.redraw` (where `ev` is the event) is not `false`, schedules an async redraw, batching the call if necessary.
        - Returns `undefined`
