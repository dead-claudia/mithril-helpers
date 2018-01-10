/**
 * Use this to isolate your component from Mithil's redraw system, so those who
 * use `m.render` directly can still use your component. It's also useful in its
 * own right if you're using `m.render` directly, since you can use this to
 * batch your redraws in child components, and it's also useful for implementing
 * subtree redraws.
 */

import render from "mithril/render"
import Vnode from "mithril/render/Vnode"

// Get the correct scheduling function
const timeout = typeof requestAnimationFrame === "function"
    ? requestAnimationFrame
    : setTimeout

// Set up the initial state
let last = 0
let locked = false
const vnodes = []
const states = []

function invokeRedraw() {
    const prev = states

    vnodes = []
    states = []
    last = Date.now()
    locked = true

    for (let i = 0; i < prev.length; i++) {
        // We need at least some fault tolerance - it'd be weird if someone
        // else's errors prevented one of our redraws.
        try {
            invokeRender(prev[i])
        } catch (e) {
            setTimeout(() => { throw e }, 0)
        }
    }

    locked = false
}

function schedule(state) {
    // 60fps translates to ~16ms per frame
    if (!vnodes.length) timeout(invokeRedraw, 16 - Date.now() - last)
    let index = vnodes.indexOf(state._)

    if (index >= 0) {
        // In case this winds up spammy, I can't take the naïve approach.
        for (const end = vnodes.length - 1; index < end; index++) {
            vnodes[index] = vnodes[index + 1]
            states[index] = states[index + 1]
        }
        vnodes[end] = state._
        states[end] = state
    } else {
        vnodes.push(state._)
        states.push(state)
    }
}

function remove(vnode) {
    let index = vnodes.indexOf(vnode)

    if (index >= 0) {
        vnodes.splice(index, 0)
        states.splice(index, 0)
    }
}

function callHook(vnode) {
    const original = vnode.state
    try {
        return this.apply(original, arguments)
    } finally {
        if (vnode.state !== original) {
            throw new Error("`vnode.state` must not be modified")
        }
    }
}

function callView(vnode, state) {
    const ret = Vnode.normalize((0, vnode.attrs.view)(state))

    if (
        ret == null || typeof ret !== "object" ||
        typeof ret.tag !== "string" || ret.tag === "#" ||
        ret.tag === "<" || ret.tag === "["
    ) {
        throw new TypeError("You must return a DOM vnode!")
    }

    if (ret.key != null) {
        throw new TypeError(
            "You should set the key on the SelfSufficient component, not " +
            "the instance's view."
        )
    }

    return ret
}

function invokeRender(state) {
    const child = callView(state._, state)

    // We have to make sure Mithril sees the correct vnode state.
    child.state = state._.instance.state
    child.events = state._.instance.events
    child.dom = state._.instance.dom
    child.domSize = state._.instance.domSize

    // We have to make sure Mithril sees the correct vnode to diff
    state._.instance = child

    if (child.attrs != null &&
            typeof child.attrs.onbeforeupdate === "function") {
        const forceUpdate = callHook.call(
            child.attrs.onbeforeupdate,
            child, child
        )

        if (forceUpdate !== undefined && !forceUpdate) return
    }

    render(child.dom, child.children)

    if (typeof child.attrs.onupdate === "function") {
        callHook.call(child.attrs.onupdate, child)
    }
}

class State {
    constructor(vnode) {
        this._ = vnode
    }

    safe() {
        return this._ != null && this._.dom != null && !locked
    }

    redraw() {
        if (this.safe()) schedule(this)
    }

    redrawSync() {
        if (locked) throw new Error("State is currently locked!")
        if (!this.safe()) {
            throw new TypeError("Can't redraw without a DOM node!")
        }
        // 60fps translates to ~16ms per frame
        if (!vnodes.length) timeout(invokeRedraw, 16 - Date.now() - last)
        else remove(this._)
        locked = true
        try {
            invokeRender(this._, this)
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
                schedule(this)
            }
        }
    }
}

function unlock(vnode) {
    // So Mithril believes this has already been rendered to.
    vnode.dom.vnodes = vnode.children
    locked = false
}

export default {
    oncreate: unlock,
    onupdate: unlock,
    onremove: remove,

    view(vnode) {
        locked = true
        remove(vnode)
        return callView(vnode, new State(vnode))
    }
}
