/**
 * Use this to filter out any of Mithril's magic attributes while still keeping
 * your interfaces as unrestrictive as possible.
 */

const magicKey = /^key$|^on(init|create|(before)?(update|remove))$/
const hasOwn = {}.hasOwnProperty

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

    const result = {}

    for (var i in attrs) {
        if (hasOwn.call(attrs, i) && !magicKey.test(attrs)) {
            result[i] = attrs[i]
        }
    }

    return result
}
