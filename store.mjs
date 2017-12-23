/**
 * Use this if you want the ease of use you'd get with v0.2's `m.prop()`, but
 * you don't want to pull in an entire stream library just to have it.
 *
 * It's also safe against recursive modifications when observing - they instead
 * don't notify like they would normally, avoiding a quick stack overflow.
 */

// So engines don't think to "optimize" the memory layout by making a shared
// closure for both functions.
//
// Note: this uses `onchange` itself as the lock, so it doesn't require an extra
// variable.
function makeObserved(store, onchange) {
    return {
        get: () => store,
        set: value => {
            const old = store
            const func = onchange

            store = value
            if (func) {
                onchange = null
                try {
                    func(store = value, old)
                } finally {
                    onchange = func
                }
            }

            return value
        },
    }
}

export default function makeStore(store, onchange) {
    if (typeof onchange === "function") {
        return makeObserved(store, onchange)
    } else {
        return {
            get: () => store,
            set: value => store = value,
        }
    }
}
