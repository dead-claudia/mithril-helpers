[*Up*](./api.md)

# mithril-helpers/self-sufficient

Exposes a `SelfSufficient` component, for making self-sufficient (i.e. no dependency on `m.redraw`) object/closure and class components, respectively. It's also useful if you're using `m.render` directly, since you don't have to worry about implementing batching and all the other annoying crap.

- `m(m.helpers.SelfSufficient, {root: vnode, view: (state) -> children})` - Create a new instance to do subtree management.
    - `root` is a static DOM vnode.
    - `view` is what you want your subtree to look like. It's a function called on each redraw.
    - Lifecycle methods work as you would expect, with the caveat that `onbeforeremove` can't block removal.
    - `state.safe()` - Whether it's safe to invoke `redrawSync`.
    - `state.redraw()` - Schedule a redraw for this subtree.
    - `state.redrawSync()` - Force a synchronous redraw for this vnode.

Here's a few examples of how it's used:

```js
// Objects
const Comp = {
    oninit() { this.clicked = false },
    view(vnode) {
        return m(m.helpers.SelfSufficient, {root: m("div"), view: state => [
            m(".foo", "What is this?"),
            this.clicked
                ? m(".bar.fail", "Why did you click me?!?")
                : m(".bar", {
                    onclick: () => { this.clicked = true },
                }, "Just kidding, nothing to see here..."),
        ]})
    }
}

// Closures
function Comp() {
    var clicked = false

    return {
        view(vnode) {
            return m(m.helpers.SelfSufficient, {root: m("div"), view: state => [
                m(".foo", "What is this?"),
                this.clicked
                    ? m(".bar.fail", "Why did you click me?!?")
                    : m(".bar", {
                        onclick: state.link(() => { this.clicked = true }),
                    }, "Just kidding, nothing to see here..."),
            ]})
        }
    })
}

// Classes
class Comp {
    constructor() {
        this.clicked = false
    }

    view(vnode) {
        return m(m.helpers.SelfSufficient, {root: m("div"), view: state => [
            m(".foo", "What is this?"),
            this.clicked
                ? m(".bar.fail", "Why did you click me?!?")
                : m(".bar", {
                    onclick: state.link(() => { this.clicked = true }),
                }, "Just kidding, nothing to see here..."),
        ]})
    }
}
```

## Usage

- `m(m.helpers.SelfSufficient, {root, view})`

    - `root` is the vnode whose dom is to be bound to.
    - `view` is a `(state) -> vnode` function used to generate the tree.
    - Note: this does *not* register a global redraw handler, but instead handles the batching logic itself and performs its own redraws independently (with a custom redraw handler for events, too).

- `state.safe() -> boolean`

    - Returns `true` if you are able to redraw synchronously (i.e. no other redraw is occurring and the component is live), `false` otherwise.

- `state.redraw() -> undefined`

    - Schedules an async redraw, batching the call if necessary.

- `state.redrawSync() -> undefined`

    - Performs an immediate redraw, cancelling any scheduled async redraw if necessary.
    - Throws if any redraw is occurring known to the helper. (This prevents accidental sync redraw loops.)
