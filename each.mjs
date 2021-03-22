/**
 * Use this to create keyed fragments more safely. Keys are always converted to
 * properties, so `null`/`undefined` *are* valid keys and are equivalent to
 * `"null"` and `"undefined"` respectively. Note that keys still must be unique
 * when coerced to property keys.
 *
 * This is just a preview of something I'm looking to add in my redesign.
 */

import Vnode from "mithril/render/vnode"

// This is coded specifically for efficiency, so it's necessarily a bit messy.
// The `Array.from` calls are also written to be easily inlined by JIT engines.
//
// Here's it simplified, with roughly equivalent semantics:
//
// ```js
// export default function each(list, by, view) {
//     // So it doesn't get coerced in the loop
//     if (typeof by !== "function" && typeof by !== "symbol") by = "" + by
//     const found = Object.create(null)
//     return m.fragment(Array.from(list, (item, i) => {
//         let key = typeof by === "function" ? by(item, i) : item[by]
//         if (typeof key !== "symbol") key = "" + key
//         if (found[key]) throw new Error("Duplicate keys are not allowed.")
//         found[key] = true
//         return m.fragment({key}, view(item, i))
//     }))
// }
// ```

function cast(view, found, item, i, key) {
    if (typeof key !== "symbol") key = "" + key
    if (found.has(key)) throw new Error("Duplicate keys are not allowed.")
    found.add(key)
    return Vnode("[", key, null, [Vnode.normalize(view(item, i))], null, null)
}

export default function each(list, by, view) {
    const found = new Set()
    let children
    if (typeof by === "function") {
        children = Array.from(list, (item, i) =>
            cast(view, found, item, i, by(item, i))
        )
    } else {
        // So it doesn't get coerced in the loop
        if (typeof by !== "symbol") by = "" + by
        children = Array.from(list, (item, i) =>
            cast(view, found, item, i, item[by])
        )
    }

    return Vnode("[", null, null, children, null, null)
}
