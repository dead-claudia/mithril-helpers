[*Up*](./api.md)

# mithril-helpers/self-sufficient

Exposes a `SelfSufficient` component, for making self-sufficient (i.e. no dependency on `m.redraw`) object/closure and class components, respectively. It's also useful if you're using `m.render` directly, since you don't have to worry about implementing batching and all the other annoying crap.

- `m(SelfSufficient, {tag?, attrs?, oncreate?, ..., view})` - Create a new instance to do subtree management.
    - `tag` is what you want the tag to be for your wrapper element. Any Mithril selector will work.
    - `attrs` is what you want the attributes to be for your wrapper element.
    - `view` is what you want your subtree to look like. It's a function rather than a raw tree, because we can't reuse Mithril nodes safely. Note that you *must* return an actual DOM node.
    - You can use lifecycle attributes like `oncreate`, `onbeforeupdate`, and `onupdate` to update vnodes at the right time.
    - You can use `vnode.dom` within callbacks.
    - Any hooks and underscore-prefixed properties are reserved.

- `vnode.state.safe()` - Whether it's safe to invoke `redrawSync`.

- `vnode.state.redraw()` - Schedule a redraw for this subtree.

- `vnode.state.redrawSync()` - Force a synchronous redraw for this vnode.

- `vnode.state.link(handler)` - Wrap an event handler to implicitly redraw iff `e.redraw !== false`, much like how Mithril normally does implicitly when you use `m.mount`.

When you call `vnode.state.redraw(vnode)`, when it redraws, it also invokes a few of Mithril's lifecycle methods:

- Before it attempts to redraw locally, it calls `vnode.state.onbeforeupdate(vnode, vnode)` if it exists. If this method exists and returns `false`, then no redraw is attempted.
- After it redraws, it calls `vnode.state.onupdate(vnode)` if it exists.

Here's a few examples of how it's used:

```js
// Objects
const Comp = {
    oninit() { this.clicked = false },
    view(vnode) {
        return m(m.helpers.SelfSufficient, {view: ({state}) => [
            m(".foo", "What is this?"),
            this.clicked
                ? m(".bar.fail", "Why did you click me?!?")
                : m(".bar", {
                    onclick: state.link(() => { this.clicked = true }),
                }, "Just kidding, nothing to see here..."),
        ]})
    }
}

// Closures
function Comp() {
    var clicked = false

    return {
        view(vnode) {
            return m(m.helpers.SelfSufficient, {view: ({state}) => [
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
        return m(m.helpers.SelfSufficient, {view: ({state}) => [
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

Note that this requires a `Set` polyfill to work.

## Usage

- `m(m.helpers.SelfSufficient, {tag, attrs, view, ...hooks}) -> vnode`

    - `tag` is the tag to use for the component. It must be a string, and it defaults to `"div"`.
    - `attrs` is the attributes to use for the component. It must be an object if passed, but it is optional.
    - `view` is the function used to generate the tree. It must be a function, and is the only required attribute.
    - All of Mithril's lifecycle hooks may be used, and `vnode.state` and `vnode.dom` is available to use within them.

- `vnode.state.safe() -> boolean`

    - Returns `true` if you are able to redraw synchronously (i.e. no other redraw is occurring), `false` otherwise.

- `vnode.state.redraw() -> void`

    - Schedules an async redraw, batching the call if necessary.
    - Returns `undefined`.

- `vnode.state.redrawSync() -> void`

    - Performs an immediate redraw, cancelling any scheduled async redraw if necessary.
    - Returns `undefined`.
    - Throws if any redraw is occurring known to the helper.

- `vnode.state.link(handler) -> handler`

    - Accepts either a function or event listener object.
    - Returns a function that when called with an event:
        - Invokes the handler with the event.
        - If `ev.redraw` (where `ev` is the event) is not `false`, schedules an async redraw, batching the call if necessary.
        - Returns `undefined`
