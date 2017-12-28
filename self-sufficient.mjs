/**
 * Use this to isolate your component from Mithil's redraw system, so those who
 * use `m.render` directly can still use your component. It's also useful in its
 * own right if you're using `m.render` directly, since you can use this to
 * batch your redraws in child components, and it's also useful for implementing
 * subtree redraws.
 */

import h from "mithril/hyperscript"
import render from "mithril/render"

// Get the correct scheduling function
const schedule = typeof requestAnimationFrame === "function"
    ? requestAnimationFrame
    : setTimeout

// Set up the initial state
let last = 0
let locked = false
const vnodes = new Map()

function invokeRedraw() {
    const prev = Array.from(vnodes)

    vnodes.clear()
    last = Date.now()
    locked = true

    for (const [vnode, state] of prev) {
        // We need at least some fault tolerance - it'd be weird if someone
        // else's errors prevented one of our redraws.
        try {
            render(vnode.dom, (0, vnode.attrs.view)(state))
        } catch (e) {
            setTimeout(() => { throw e }, 0)
        }
    }

    locked = false
}

class State {
    constructor(vnode) {
        this._ = vnode
    }

    safe() {
        return this._ != null && this._.dom != null && !locked
    }

    redraw() {
        if (!this.safe()) return
        // 60fps translates to ~16ms per frame
        if (!vnodes.size) schedule(invokeRedraw, 16 - Date.now() - last)
        vnodes.set(this._, this)
    }

    redrawSync() {
        if (locked) throw new Error("State is currently locked!")
        if (!this.safe()) {
            throw new TypeError("Can't redraw without a DOM node!")
        }
        // 60fps translates to ~16ms per frame
        if (!vnodes.size) schedule(invokeRedraw, 16 - Date.now() - last)
        else vnodes.delete(this._)
        locked = true
        try {
            render(this._.dom, (0, this._.attrs.view)(this))
        } finally {
            locked = false
        }
    }

    link(callback) {
        return e => {
            if (typeof callback === "function") callback(e)
            else callback.handleEvent(e)

            if (e.redraw !== false) {
                e.redraw = false
                // 60fps translates to ~16ms per frame
                if (!vnodes.size) schedule(invokeRedraw, 16 - Date.now() - last)
                vnodes.set(this._, this)
            }
        }
    }
}

export const SelfSufficient = {
    onbeforeupdate(vnode, old) {
        // This is false only if we're currently redrawing.
        if (vnode !== old) vnodes.delete(old)
    },

    onupdate() {
        locked = false
    },

    onremove(vnode) {
        vnodes.delete(vnode)
    },

    view(vnode) {
        var ret = view(new State(vnode))

        if (
            object == null || typeof object !== "object" ||
            typeof ret.tag !== "string" || ret.tag === "#" ||
            ret.tag === "<" || ret.tag === "["
        ) {
            throw new TypeError("You must return a DOM vnode!")
        }

        return ret
    }
}
