[*Up*](./README.md)

# API

Everything is exposed as submodules, where you can pull them all in piecemeal. They are available as both CommonJS modules (exported by name) and global scripts that attach themselves individually to `m.helpers`, where `m` is Mithril's main export. In addition, `/index.js` is a CommonJS-only module bundling all of them except for what's in `/migrate`.

Alternatively, if you're using ES modules, every module apart from what's in `/migrate` is also available as an ES module with the extension `.mjs`, with `/index.mjs` exposing named exports and the rest as default exports. Do note that some of them require Mithril, and so you will need something like `rollup-plugin-commonjs` + `rollup-plugin-node-resolve` or Webpack's builtin resolver to resolve Mithril.

Every module except those in `/migrate` also feature complete TypeScript definitions. That way, if you prefer TypeScript, you're not left out, either.

If you wish to bundle these, you can just concatenate the ones you use or use Browserify/etc. to bundle them along with your app.

- [`mithril-helpers/censor` - `censor(attrs)`](./censor.md)
- [`mithril-helpers/store` - `makeStore(initial?, onchange?)`](./store.md)
- [`mithril-helpers/self-sufficient` - `m(SelfSufficient, {root, view})`](./self-sufficient.md)
- [`mithril-helpers/redraw` - `makeRedraw(state?)`](./redraw.md)
- [`mithril-helpers/each` - `each(list, by, view)`](./each.md)
- [`mithril-helpers/link` - `link(key, ...children)`](./link.md)
- [`mithril-helpers/migrate` - Mithril migration utilities](./migrate.md)
