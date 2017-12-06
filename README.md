# mithril-helpers

Just a collection of Mithril helpers, all written in pure ES5.

Everything here is licensed under ISC except for the `/migrate` modules, whose licenses are specified in those files. Additionally, you may view the licenses in `/LICENSE.txt`, which carries the same information. Feel free to use it however you wish.

## Installation

```
npm install --save isiahmeadows/mithril-helpers
yarn add git+https://github.com/isiahmeadows/mithril-helpers
```

## Issues/Contributing

If you come up with any other things that you feel should be included, or you find a bug in something I did, please file an issue, and I'll consider the use case. In particular, I could use some assistance with ensuring the stuff in `/migrate` actually works, so if you find bugs in it, please tell me right away, and I'll address it.

If you want to implement something yourself, definitely go for it and send a PR. Just note the following (for legal reasons): when you submit a pull request, you agree to license your contribution under the relevant license(s) in this repository, and you also agree that you have sufficient rights to do so.

## API

Everything is exposed as submodules, where you can pull them all in piecemeal. They are available as both CommonJS modules (exported by name) and global scripts that attach themselves individually to `m.helpers`, where `m` is Mithril's main export. In addition, `index.js` is a CommonJS-only module bundling all of them except for what's in `/migrate`.

If you wish to bundle these, you can just concatenate the ones you use or use Browserify/etc. to bundle them along with your app.

### mithril-helpers/censor

Exposes `censor(attrs)`, which removes all of Mithril's magic attributes from an object (making a copy if necessary to avoid actually modifying the object), so you may safely pass it directly as an attribute object to other methods. Helpful to [avoid overly restrictive interfaces](https://mithril.js.org/components.html#avoid-restrictive-interfaces) without running into [odd buggy behavior with magic methods](https://github.com/MithrilJS/mithril.js/issues/1775).

```js
return m("div", m.helpers.censor(vnode.attrs), [...children])
```

### mithril-helpers/store

Exposes `store = makeStore(initial?, onchange?)`, which is very much like a spiritial successor to Mithril v0.2's `m.prop()`, just without all the magic promise wrapping stuff.

- When you call `store()`, you get the value.
- If you call it with an argument like with `store(newValue)`, it invokes `onchange(newValue, oldValue)` if it exists, for easy observation.

I also threw in a couple niceities to make it even better.

1. I optimized the case of no `onchange`, so it is faster and takes less memory.
2. Changing the value from an `onchange` doesn't call the function recursively.

### mithril-helpers/self-sufficient

Exposes a `SelfSufficient` class, for making self-sufficient (i.e. no dependency on `m.redraw`) object/closure and class components, respectively. It's also useful if you're using `m.render` directly, since you don't have to worry about implementing batching and all the other annoying crap.

- `state = new SelfSufficient(tag?, attrs?)` - Create a new instance to do subtree management.
    - `tag` is the tag you want to create your wrapper element with, defaulting to `div`.
    - `attrs` is the attrs you want to add to your wrapper element.
    - Both `tag` and `attrs` check their type and invoke the default only if their types don't match, so it's safe to subclass/subtype this for your components without implementing a constructor.

- `state.forceRedraw(vnode)` - Force a synchronous redraw for this vnode.

- `state.redraw(vnode)` - Schedule a redraw for this vnode.

- `state.link(vnode, handler)` - Wrap an event handler to implicitly redraw iff `e.redraw !== false`, much like how Mithril normally does implicitly when you use `m.mount`.

- `state.render(vnode)` - This is the `view` you use in your component.

- `state.onbeforeupdate(vnode, old)` - This is the `onbeforeupdate` you use in your component. If you need to override this (say, in a subclass), you'll need to call the original `onbeforeupdate` with the arguments to cancel any existing redraw. (It always returns `true`)

When you call `state.redraw(vnode)`, when it redraws, it also invokes a few of Mithril's lifecycle methods:

- Before it attempts to redraw, it calls `state.onbeforeupdate(vnode, vnode)` if it exists. If this method exists and returns `false`, then no redraw is attempted.
- After it redraws, it calls `state.onupdate(vnode)` if it exists.

Note: this does *not* support `vnode.state = ...`, although you shouldn't be using that, anyways.

Here's a few examples of how it's used:

```js
// Objects
const Comp = {
    __proto__: new m.helpers.SelfSufficient(),
    oninit() { this.clicked = false },
    render(vnode) {
        return [
            m(".foo", "What is this?"),
            this.clicked
                ? m(".bar.fail", "Why did you click me?!?")
                : m(".bar", {
                    onclick: this.link(vnode, () => { this.clicked = true }),
                }, "Just kidding, nothing to see here..."),
        ]
    }
}

// Closures
function Comp(vnode) {
    var clicked = false
    var state = new m.helpers.SelfSufficient()

    return Object.assign({}, state, {
        render(vnode) {
            return [
                m(".foo", "What is this?"),
                clicked
                    ? m(".bar.fail", "Why did you click me?!?")
                    : m(".bar", {
                        onclick: state.link(vnode, () => { clicked = true }),
                    }, "Just kidding, nothing to see here..."),
            ]
        }
    })
}

// Classes
class Comp extends m.helpers.SelfSufficient {
    constructor() {
        super()
        this.clicked = false
    }

    render(vnode) {
        return [
            m(".foo", "What is this?"),
            this.clicked
                ? m(".bar.fail", "Why did you click me?!?")
                : m(".bar", {
                    onclick: this.link(() => { this.clicked = true }),
                }, "Just kidding, nothing to see here..."),
        ]
    }
}
```

### mithril-helpers/migrate/v1

An array of utilities and shims for migrating from v0.2 to v1. It shims most of the important functionality in v0.2 using v1 APIs.

The shim is exposed as `v1`, but throughout this listing, we use `m` to refer to the export for clarity.

- `m(".selector", ...)` is mostly shimmed using v1's `m()`, including `config`.
    - `context.retain` in `config` is ignored, since Mithril v1 has no equivalent.
    - `context.onunload` is implemented, but its `e.preventDefault()` is not.
    - `config` is shimmed using v1's lifecycle methods, so you can't migrate a single `config` incrementally.
    - `config`'s final `vdom` parameter is a v1 node, not a v0.2 one.
    - v1's magic methods are available for DOM vnodes *only*, not for component vnodes.
    - The `xlink` namespace is *not* shimmed for you - you must add it now.
    - Note: raw components are *not* allowed.
- `m(Component, ...)` and `m.component(Component, ...)` are shimmed using v1's `m`, including the arbitrary-argument API.
    - All the v1 lifecycle methods may *also* be used.
    - Node instances are also components as they previously were.
- `m.trust(text)` returns a String object (not primitive) as it did in v0.2, but it also has the relevant v1 vnode properties copied into it.
- `m.prop(value?)` is fully shimmed with original semantics.
    - It is actually properly shimmed; it doesn't use v1's streams.
- `m.withAttr(attr, callback, context?)` just uses v1's equivalent implementation
- `m.startComputation()`, `m.endComputation()`, and `m.redraw.mode()` are not shimmed, as redraws are controlled per-component using lifecycle methods.
- `m.deferred()` is shimmed fully except for two caveats due to its internal use of ES6 promises:
    - `.then` is invoked *asynchronously*, unlike in v0.2.
    - `Error` subclasses, when caught, are *not* rethrown out of band like in v0.2.
- `m.sync(items)` just uses `Promise.all` and wraps the result into an `m.prop()`.
- `m.request(options)` delegates to v1's `m.request(options)` and `m.jsonp(options)` as appropriate, but the result is properly propified with `options.initialValue` supported.
    - For `options.unwrap{Success,Error}`, just use `extract`/`deserialize` appropriately instead.
- `m.mount(elem, Comp)` and `m.route(elem, defaultRoute, routes)` are mostly shimmed.
    - Support for raw vnode roots is *not* shimmed.
- The rest of the `m.route` API is fully shimmed:
    - `m.route.mode` calls v1's `m.route.prefix(prefix)` on set.
    - `m.route()` returns v1's `m.route.get()`
    - `config: m.route` delegates to v1's  `m.route.link`
    - `m.route(route, params?, shouldReplaceHistoryEntry?)` invokes v1's `m.route.set(route, params?, options?)`
    - `m.route.param(key?)` returns v1's `m.route.param(key?)`
- `m.deps(window)` is *not* shimmed. There are other ways of testing components, most of which are far better, anyways. It also was exposed primarily for *internal* testing.

Here are a few critical notes you need to read before using this:

- Unlike v0.2, you can no longer cache trees in v1; you must create them fresh each time now.
- `m.migrate(Comp)` brands a component for migration, so this knows it should be migrated.
    - You must do this for every legacy component *before* switching to this.
- You *must* call `m.migrate(Comp)` on all v0.2 components to brand them before they can be migrated with this shim. Components created via `m()` and `m.component()` are automatically branded this way, but you have to add them to all custom components.
