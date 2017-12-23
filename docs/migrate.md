[*Up*](./api.md)

# Migration with mithril-helpers/migrate

This includes an array of utilities, shims, etc., for migrating from older to newer Mithril versions. Currently, there is only one submodule, but there may be more in the future.

- [`mithril-helpers/migrate/v1` - Mithril v0.2 &rarr; v1 migration](#mithril-helpersmigratev1)

## mithril-helpers/migrate/v1

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
