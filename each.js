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
    var from = Array.from || function (list, func) {
        var result = []
        for (var i = 0; i < list.length; i++) result.push(func(list[i], i))
        return result
    }

    // This is coded specifically for efficiency, so it's necessarily a bit
    // messy. The `Array.from` calls are also written to be easily inlined by
    // JIT engines.
    //
    // Here's it simplified, with roughly equivalent semantics:
    //
    // ```js
    // function each(list, by, view) {
    //     // So it doesn't get coerced in the loop
    //     if (typeof by !== "function" && typeof by !== "symbol") by = "" + by
    //     var found = Object.create(null)
    //     return m.fragment(from(list, function (item, i) {
    //         var key = typeof by === "function" ? by(item, i) : item[by]
    //         if (typeof key !== "symbol") key = "" + key
    //         if (found[key]) throw new Error("Duplicate keys are not allowed.")
    //         found[key] = true
    //         return m.fragment({key: key}, view(item, i))
    //     }))
    // }
    // ```

    function cast(view, found, item, i, key) {
        if (typeof key !== "symbol") key = "" + key
        if (found[key]) throw new Error("Duplicate keys are not allowed.")
        found[key] = true
        return Vnode("[", key, null, [Vnode.normalize(view(item, i))], null, null)
    }

    function each(list, by, view) {
        var found = Object.create(null)
        var children
        if (typeof by === "function") {
            children = from(list, function (item, i) {
                return cast(view, found, item, i, by(item, i))
            })
        } else {
            // So it doesn't get coerced in the loop
            if (typeof by !== "symbol") by = "" + by
            children = from(list, function (item, i) {
                return cast(view, found, item, i, item[by])
            })
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
