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

    return function censor(attrs, extras) {
        var exclude = [
            "key", "oninit", "oncreate", "onbeforeupdate", "onupdate",
            "onbeforeremove", "onremove",
        ]
        if (extras != null) exclude.push.apply(exclude, extras)

        for (let i = 0; i < exclude.length; i++) {
            if (hasOwn.call(attrs, exclude[i])) {
                var result = {}

                for (var key in attrs) {
                    if (hasOwn.call(attrs, key) && !exclude.includes(key)) {
                        result[key] = attrs[key]
                    }
                }

                return result
            }
        }

        return attrs
})()
