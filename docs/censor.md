[*Up*](./api.md)

# mithril-helpers/censor

Exposes `censor(attrs)`, which removes all of Mithril's magic attributes from an object (making a copy if necessary to avoid actually modifying the object), so you may safely pass it directly as an attribute object to other methods. Helpful to [avoid overly restrictive interfaces](https://mithril.js.org/components.html#avoid-restrictive-interfaces) without running into [odd buggy behavior with magic methods](https://github.com/MithrilJS/mithril.js/issues/1775).

```js
return m("div", m.helpers.censor(vnode.attrs), [...children])
```

## Usage

- `m.helpers.censor(attrs) -> attrs`

    - Accepts a single attributes object.
    - Returns the same attributes object if no magic methods/keys exist, a new shallow clone otherwise.
