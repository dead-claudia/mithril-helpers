/**
 * Use this to filter out any of Mithril's magic attributes while still keeping
 * your interfaces as unrestrictive as possible.
 */

;(function () {
    "use strict"

    if (typeof module === "object" && module && module.exports) {
        module.exports = censor
    } else if (typeof m !== "function") {
        throw new Error("Mithril must be loaded first!")
    } else {
        (m.helpers || (m.helpers = {})).censor = censor
    }

    // Note: this avoids as much allocation and overhead as possible.
    var hasOwn = {}.hasOwnProperty
    var magic = [
        "key", "oninit", "oncreate", "onbeforeupdate", "onupdate",
        "onbeforeremove", "onremove",
    ]

    function includesOwn(attrs, keys) {
        if (Array.isArray(keys)) {
            for (var i = 0; i < keys.length; i++) {
                if (hasOwn.call(attrs, keys[i])) return true
            }
        }
        return false
    }

    function filterOne(attrs, list) {
        var result = {}

        for (var key in attrs) {
            if (hasOwn.call(attrs, key) && list.indexOf(key) < 0) {
                result[key] = attrs[key]
            }
        }

        return result
    }

    return function censor(attrs, extras) {
        if (includesOwn(attrs, magic)) {
            if (includesOwn(attrs, extras)) {
                var result = {}

                for (var key in attrs) {
                    if (hasOwn.call(attrs, key) &&
                            magic.indexOf(key) < 0 &&
                            extras.indexOf(key) < 0) {
                        result[key] = attrs[key]
                    }
                }

                return result
            } else {
                return filterOne(attrs, magic)
            }
        } else if (includesOwn(attrs, extras)) {
            return filterOne(attrs, extras)
        } else {
            return attrs
        }
    }
})()
