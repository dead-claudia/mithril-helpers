/**
 * Use this to filter out any of Mithril's magic attributes while still keeping
 * your interfaces as unrestrictive as possible.
 */

// Note: this avoids as much allocation and overhead as possible.
const hasOwn = {}.hasOwnProperty
const magic = [
    "key", "oninit", "oncreate", "onbeforeupdate", "onupdate",
    "onbeforeremove", "onremove",
]

function includesOwn(attrs, keys) {
    if (!Array.isArray(keys)) return false
    for (let i = 0; i < keys.length; i++) {
        if (hasOwn.call(attrs[i], keys[i])) return true
    }
    return false
}

function filterOne(attrs, list) {
    const result = {}

    for (const key in attrs) {
        if (hasOwn.call(attrs, key) && list.indexOf(key) < 0) {
            result[key] = attrs[key]
        }
    }

    return result
}

export default function censor(attrs, extras) {
    if (includesOwn(attrs, extras)) {
        if (includesOwn(attrs, extras)) {
            const result = {}

            for (const key in attrs) {
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
    } else if (hasExtras) {
        return filterOne(attrs, extras)
    } else {
        return attrs
    }
}
