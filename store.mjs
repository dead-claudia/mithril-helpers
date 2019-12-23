/**
 * Use this if you want the ease of use you'd get with v0.2's `m.prop()`, but
 * you don't want to pull in an entire stream library just to have it. It also
 * integrates with `m.redraw`, so it works in a lot more situations
 */

// So engines don't think to "optimize" the memory layout by making a shared
// closure for both functions.
//
// Note: this uses `onchange` itself as the lock, so it doesn't require an extra
// variable.
function makeObserved(store, onchange) {
    return function () {
        if (!arguments.length) return store
        const old = store
        const func = onchange
        const value = (store = arguments[0])

        if (func) {
            onchange = null
            try {
                func(value, old)
            } finally {
                onchange = func
            }
        }
        
        return value
    }
}

export default function makeStore(store, onchange) {
    if (typeof onchange === "function") {
        // Attribute used here for whenever Terser finally implements this
        // https://github.com/terser/terser/issues/350
        return /*@__NOINLINE__*/ makeObserved(store, onchange)
    } else {
        return function () {
            return arguments.length ? (store = arguments[0]) : store
        }
    }
}
