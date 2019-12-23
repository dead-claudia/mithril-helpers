/**
 * Use this to easily link to an identity key. Keys are always converted to
 * properties, so `null`/`undefined` are equivalent to `"null"` and
 * `"undefined"` respectively.
 *
 * This is just a preview of something I'm looking to add in my redesign.
 */

import Vnode from "mithril/render/vnode"

export default function link(key, ...children) {
    return Vnode("[", null, null, [
        Vnode("[", typeof key === "symbol" ? key : "" + key, null,
            Vnode.normalizeChildren(children)
        )
    ])
}
