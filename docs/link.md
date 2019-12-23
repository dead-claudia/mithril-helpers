[*Up*](./api.md)

# mithril-helpers/link

Exposes an `link(key, ...children)` utility. This is something I've been considering for the next major API redesign of Mithril after Leo's v1.0 redesign, and I wanted to give people the ability to test it and hopefully get some early feedback on the API front.

In v2, you'd ordinarily do something like this to programmatically reset elements:

```js
function ResettableToggle() {
    let toggleKey = false
    const reset = () => { toggleKey = !toggleKey }

    return {
        view: () => [
            m("button", {onclick: reset}, "Reset toggle"),
            [m(Toggle, {key: toggleKey})]
        ]
    }
}
```

With this utility, it'd look closer to this, slightly more conise and potentially a lot more intuitive:

```js
function ResettableToggle() {
    let toggleKey = false
    const reset = () => { toggleKey = !toggleKey }

    return {
        view: () => [
            m("button", {onclick: reset}, "Reset toggle"),
            link(toggleKey, m(Toggle)),
        ]
    }
}
```

## Usage

- `m.helpers.link(key, ...children) -> vnode`

    - `key` is the key to use - it must be a property key.
    - `...children` are a list of children to include. It works the same way `m.fragment` and `m` accept their children - if you pass an array as the sole argument, it's read literally and not copied.
    - Returns a single element keyed fragment vnode.
