/**
 * Use this to isolate your component from Mithil's redraw system, so those who
 * use `m.render` directly can still use your component. It's also useful in its
 * own right if you're using `m.render` directly, since you can use this to
 * batch your redraws in child components, and it's also useful for implementing
 * subtree redraws.
 *
 * Note: this is very highly optimized, since
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
const states = new Set()

function execRedraw(state) {
    if (typeof state._.attrs.onbeforeupdate === "function") {
        const force = state._.attrs.onbeforeupdate(state._, state._)
        if (force !== undefined && !force) return
    }
    render(state._.dom, state._.attrs.view(state._))
    if (typeof state._.attrs.onupdate === "function") {
        state._.attrs.onupdate(state._)
    }
}

function invokeRedraw() {
    const prev = new Set(states)

    states.clear()
    last = Date.now()
    locked = true

    for (const state of prev) {
        // We need at least some fault tolerance - it'd be weird if someone
        // else's errors prevented one of our redraws.
        try {
            if (state._ != null) execRedraw(state)
        } catch (e) {
            setTimeout(function () { throw e }, 0)
        }
    }

    locked = false
}

export default const SelfSufficient = {
    oninit() {
        this._ = undefined
    },

    safe() {
        return this._ != null && this._.dom != null && !locked
    },

    redraw() {
        if (this._ == null) return
        // 60fps translates to ~16ms per frame
        if (!states.size) schedule(invokeRedraw, 16 - Date.now() - last)
        states.add(this)
    },

    redrawSync() {
        if (this._ == null || this._.dom == null) {
            throw new TypeError("Node is not yet initialized!")
        }
        if (locked) throw new Error("Node is currently locked!")
        // 60fps translates to ~16ms per frame
        if (!states.size) schedule(invokeRedraw, 16 - Date.now() - last)
        else states.delete(this)
        locked = true
        try {
            execRedraw(this)
        } finally {
            locked = false
        }
    },

    link(callback) {
        return e => {
            if (typeof callback === "function") callback(e)
            else callback.handleEvent(e)

            if (e.redraw !== false) {
                e.redraw = false
                this.redraw()
            }
        }
    },

    onbeforeupdate(vnode, old) {
        // This is false only if we're currently redrawing.
        if (vnode !== old) states.delete(old._)
        this._ = vnode
    },

    onupdate() {
        locked = false
    },

    onremove() {
        states.delete(this)
        this._ = undefined
    },

    view(vnode) {
        this._ = vnode
        locked = true
        return h(this._.attrs.tag || "div", this._.attrs.attrs,
            this._.attrs.view(this._)
        )
    },
}
