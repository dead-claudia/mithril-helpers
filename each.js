/**
 * Use this to create keyed fragments more safely. Keys are always converted to
 * properties, so `null`/`undefined` *are* valid keys and are equivalent to
 * `"null"` and `"undefined"` respectively. Note that keys still must be unique
 * when coerced to property keys.
 *
 * This is just a preview of something I'm looking to add in my redesign.
 */

;(function () {
    "use strict"

    var Vnode

    function each(list, by, child) {
        var children = []
        var found = Object.create(null)

        for (let i = 0; i < list.length; i++) {
            var item = list[i]
            var key = by(item, i)
            if (typeof key !== "symbol") key = "" + key
            if (key in found) throw new Error("Duplicate keys are not allowed.")
            found[key] = true
            children.push(Vnode("[", key, null, [Vnode.normalize(child(item, i))], null, null)
        }

        return Vnode("[", null, null, children, null, null)
    }

    if (typeof module === "object" && module && module.exports) {
        Vnode = require("mithril/render/vnode")
        module.exports = each
    } else if (typeof m === "function") {
        Vnode = m.vnode
        (m.helpers || (m.helpers = {})).each = each
    } else {
        throw new Error("Mithril must be loaded first!")
    }
})()
