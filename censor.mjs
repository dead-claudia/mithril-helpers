/**
 * Use this to filter out any of Mithril's magic attributes while still keeping
 * your interfaces as unrestrictive as possible.
 */

var magicKey = /^key$|^on(init|create|(before)?(update|remove))$/
var hasOwn = {}.hasOwnProperty

export default function censor(attrs) {
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
