[*Up*](./api.md)

# mithril-helpers/each

Exposes an `each(list, (item, i) => key, (item, i) => vnode)` utility. This is something I've been considering for the next major API redesign of Mithril after Leo's v1.0 redesign, and I wanted to give people the ability to test it and hopefully get some early feedback on the API front.

In v2, you'd ordinarily do something like this to return keyed fragments:

```js
function makeUserInputs(users) {
    return users.map(u => m("div.user-info", {key: u.id},
        m("label.user-name", "Name: ", m("input[type=text]", u.name)),
        m("label.user-bio", "Bio: ", m("textarea", u.bio)),
        m("label.user-loc", "Location: ", m("input[type=text]", u.location))
    ))
}
```

With this utility, it'd look closer to this, and is sometimes a little more concise and less noisy:

```js
function makeUserInputs(users) {
    return each(users, "id", u => m("div.user-info",
        m("label.user-name", "Name: ", m("input[type=text]", u.name)),
        m("label.user-bio", "Bio: ", m("textarea", u.bio)),
        m("label.user-loc", "Location: ", m("input[type=text]", u.location))
    ))
}

// Or if you wanted to be more explicit about it - this is about the same length
function makeUserInputs(users) {
    return each(users, u => u.id, u => m("div.user-info",
        m("label.user-name", "Name: ", m("input[type=text]", u.name)),
        m("label.user-bio", "Bio: ", m("textarea", u.bio)),
        m("label.user-loc", "Location: ", m("input[type=text]", u.location))
    ))
}
```

It also separates the key from the child, and separating keys from attributes may make it a bit easier to read.

## Usage

- `m.helpers.each(list, by, view) -> vnode`

    - `list` is the list of items to iterate.
    - `by` is either an `(item, index) => key` function or a property key to read the key from. In either case, it's coerced to a property key.
    - `view` is an `(item, index) => child` function where `child` is a vnode.
    - Returns a keyed fragment vnode.
