/**
 * Use this to match based on conditions more easily.
 */

import Vnode from "mithril/render/vnode"

function resolve(then) {
    return Vnode('[', null, null, [Vnode.normalize(then)])
}

export function when(cond, then, orElse) {
    cond = !!cond
    return Vnode("[", null, null, [
        Vnode("[", cond, null, [Vnode.normalize(cond ? then() : orElse())])
    ])
}

export function cond(...args) {
    for (let i = 0; i < args.length; i++) {
        args[i] = args[i].if ? resolve(args[i].then()) : null
    }
    return Vnode('[', null, null, args)
}

export function match(value, ...args) {
    if (value === value) {
        for (let i = 0; i < args.length; i++) {
            args[i] = args[i].if === value ? resolve(args[i].then()) : null
        }
    } else {
        for (let i = 0; i < args.length; i++) {
            const cond = args[i].if
            args[i] = cond !== cond ? resolve(args[i].then()) : null
        }
    }
    return Vnode('[', null, null, args)
}
