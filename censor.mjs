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

export default function censor(attrs, extras) {
    const excludeSet = new Set(magic)
    if (extras != null) {
        for (const item of extras) excludeSet.add(item)
    }

    for (let i = 0; i < exclude.length; i++) {
        if (hasOwn.call(attrs, exclude[i])) {
            const result = {}

            for (const key in attrs) {
                if (hasOwn.call(attrs, key) && !excludeSet.has(key)) {
                    result[key] = attrs[key]
                }
            }

            return result
        }
    }

    return attrs
}
