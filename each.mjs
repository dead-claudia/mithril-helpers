/**
 * Use this to create keyed fragments more safely. Keys are always converted to
 * properties, so `null`/`undefined` *are* valid keys and are equivalent to
 * `"null"` and `"undefined"` respectively. Note that keys still must be unique
 * when coerced to property keys.
 *
 * This is just a preview of something I'm looking to add in my redesign.
 */

import Vnode from "mithril/render/vnode"

export default function each(list, by, child) {
    const children = []
    const found = Object.create(null)

    for (let i = 0; i < list.length; i++) {
        const item = list[i]
        let key = by(item, i)
        if (typeof key !== "symbol") key = "" + key
        if (key in found) throw new Error("Duplicate keys are not allowed.")
        found[key] = true
        children.push(Vnode("[", key, null, [Vnode.normalize(child(item, i))], null, null)
    }

    return Vnode("[", null, null, children, null, null)
}
