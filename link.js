/**
 * Use this to easily link to an identity key. Keys are always converted to
 * properties, so `null`/`undefined` are equivalent to `"null"` and
 * `"undefined"` respectively.
 *
 * This is just a preview of something I'm looking to add in my redesign.
 */

;(function () {
    "use strict"

    var Vnode

    function link(key) {
        if (typeof key !== "symbol") key = "" + key
        var children = []
        for (var i = 1; i < arguments.length; i++) {
            children.push(Vnode.normalize(arguments[i]))
        }
        return Vnode("[", null, null, [
            Vnode("[", key, null, children)
        ])
    }

    if (typeof module === "object" && module && module.exports) {
        Vnode = require("mithril/render/vnode")
        module.exports = link
    } else if (typeof m === "function") {
        Vnode = m.vnode
        (m.helpers || (m.helpers = {})).link = link
    } else {
        throw new Error("Mithril must be loaded first!")
    }
})()
