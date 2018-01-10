[*Up*](./api.md)

# mithril-helpers/censor

Exposes `censor(attrs, extras?)`, which removes all of Mithril's magic attributes from an object (making a copy if necessary to avoid actually modifying the object) as well as whatever extras you want to remove, so you may safely pass it directly as an attribute object to other methods. Helpful to [avoid overly restrictive interfaces](https://mithril.js.org/components.html#avoid-restrictive-interfaces) without running into [odd buggy behavior with magic methods](https://github.com/MithrilJS/mithril.js/issues/1775).

```js
return m("div", m.helpers.censor(vnode.attrs), [...children])
```

## Usage

- `m.helpers.censor(attrs, extras?) -> attrs`

    - `attrs` is a single attributes object you want to censor.
    - `extras` is an optional array of whatever other attributes you want to censor.
    - Returns a new shallow clone of the attributes with keys omitted appropriately if anything needed censored, the original attributes object otherwise.
