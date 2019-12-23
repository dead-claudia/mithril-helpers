# mithril-helpers

Just a collection of Mithril helpers. Each helper features two variants: `.js` for a CommonJS + global bundle targeting a baseline of ES5.1 and `.mjs` for an ES module targeting a baseline of ES6, and they all feature TypeScript definitions alongside them. The `index.js` file specifically targets CommonJS only. No direct support for AMD/RequireJS loaders exist.

## Installation

```
npm install --save isiahmeadows/mithril-helpers --save-exact
yarn add git+https://github.com/isiahmeadows/mithril-helpers --exact
```

Note: you *must* depend on exact Git hashes, since this package is completely unversioned, and could change in breaking ways at any point. (For similar reasons, the package version will remain at `0.0.0`.) When upgrading, you should assess the diff for each file you use, to see if they require any special migration or not.

## API

See [here](https://github.com/isiahmeadows/mithril-helpers/tree/master/docs/api.md).

## Issues/Contributing

If you come up with any other things that you feel should be included, or you find a bug in something I did, please file an issue, and I'll consider the use case. In particular, I could use some assistance with ensuring the stuff in `/migrate` actually works, so if you find bugs in it, please tell me right away, and I'll address it.

If you want to implement something yourself, definitely go for it and send a PR. Just note the following (for legal reasons): when you submit a pull request, you agree to license your contribution under the relevant license(s) in this repository, and you also agree that you have sufficient rights to do so.

Also, make sure that if you want to add a helper, your helpers should do one thing and one thing only. They should be almost zero-cost to add to a project, and ideally they shouldn't even depend on other helpers.

## License

Everything here is licensed under ISC except for the `/migrate` modules, whose licenses are specified in those files. Feel free to use it however you wish (within those restrictions, of course).

See [here](https://github.com/isiahmeadows/mithril-helpers/tree/master/LICENSE.txt) for the license.
