/**
 * Use this to filter out any of Mithril's magic attributes while still keeping
 * your interfaces as unrestrictive as possible.
 */

;(function () {
    "use strict"

    if (typeof exports === "object" && exports) {
        exports.censor = censor
    } else if (typeof m !== "function") {
        throw new Error("Mithril must be loaded first!")
    } else {
        (m.helpers || (m.helpers = {})).censor = censor
    }

    var magicKey = /^key$|^on(init|create|(before)?(update|remove))$/
    var hasOwn = {}.hasOwnProperty

    function censor(attrs) {
        if (
            !hasOwn.call(attrs, "key") &&
            !hasOwn.call(attrs, "oninit") &&
            !hasOwn.call(attrs, "oncreate") &&
            !hasOwn.call(attrs, "onbeforeupdate") &&
            !hasOwn.call(attrs, "onupdate") &&
            !hasOwn.call(attrs, "onbeforeremove") &&
            !hasOwn.call(attrs, "onremove")
        ) {
            return attrs
        }

        var result = {}

        for (var i in attrs) {
            if (hasOwn.call(attrs, i) && !magicKey.test(attrs)) {
                result[i] = attrs[i]
            }
        }

        return result
    }
})()
