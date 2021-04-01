/**
 * Use this to isolate your component from Mithil's redraw system, so those who
 * use `m.render` directly can still use your component. It's also useful in its
 * own right if you're using `m.render` directly, since you can use this to
 * batch your redraws in child components, and it's also useful for implementing
 * subtree redraws.
 */

import render from "mithril/render"
import Vnode from "mithril/render/Vnode"

let frameId, insts

function invokeRedraw() {
    const scheduled = insts

    insts = frameId = null

    scheduled.forEach(inst => {
        // We need at least some fault tolerance - it'd be weird if someone
        // else's errors prevented one of our redraws.
        try {
            const inst = prev[i]
            inst.l = true
            render(
                inst.s.dom,
                [(0, inst.s.attrs.view)(inst)],
                inst.r
            )
        } catch (e) {
            setTimeout(() => { throw e }, 0)
        } finally {
            inst.l = false
        }
    })
}

function unschedule(inst) {
    if (insts == null) return
    if (insts.size === 1) {
        // Skip the mutation
        if (!insts.has(inst)) return
        cancelAnimationFrame(frameId)
        insts = frameId = null
    } else {
        insts.delete(inst)
    }
}

export default class SelfSufficient {
    constructor(vnode) {
        this.s = vnode
        this.r = () => { this.redraw() }
        this.l = null
    }

    view(vnode) {
        this.s = vnode
        return vnode.attrs.root
    }

    oncreate(vnode) {
        this.onupdate(vnode)
    }

    onupdate(vnode) {
        this.s = vnode
        if (this.l) throw new Error("State is currently locked!")
        unschedule(this)
        this.l = true
        try {
            render(vnode.dom, [(0, vnode.attrs.view)(this)], this.r)
        } finally {
            this.l = false
        }
    }

    onremove(vnode) {
        this.s = this.r = null
        this.l = true
        unschedule(this)
        render(vnode.dom)
    }

    // Public API
    safe() {
        return !this.l
    }

    redraw() {
        if (!this.l) {
            if (insts == null) {
                insts = new Set([this])
                frameId = requestAnimationFrame(invokeRedraw)
            } else {
                insts.add(this)
            }
        }
    }

    redrawSync() {
        if (this.s == null) throw new TypeError("Can't redraw after unmount.")
        if (this.l == null) throw new TypeError("Can't redraw without a root.")
        this.onupdate(this.s)
    }
}
