/**
 * Use this to isolate your component from Mithil's redraw system, so those who
 * use `m.render` directly can still use your component. It's also useful in its
 * own right if you're using `m.render` directly, since you can use this to
 * batch your redraws in child components, and it's also useful for implementing
 * subtree redraws.
 */

;(function (factory) {
    "use strict"

    if (typeof module === "object" && module && module.exports) {
        module.exports = factory(
            require("mithril/render"),
            require("mithril/render/vnode")
        )
    } else if (typeof m === "function") {
        (m.helpers || (m.helpers = {})).SelfSufficient = factory(
            m.render, m.vnode
        )
    } else {
        throw new Error("Mithril must be loaded first!")
    }
})(function (render, Vnode) {
    "use strict"

    var frameId, insts

    function invokeRedraw() {
        var scheduled = insts

        insts = frameId = null

        for (var i = 0; i < scheduled.length; i++) {
            // We need at least some fault tolerance - it'd be weird if someone
            // else's errors prevented one of our redraws.
            var inst = scheduled[i]
            inst.l = true
            try {
                render(
                    inst.s.dom,
                    [(0, inst.s.attrs.view)(inst)],
                    inst.r
                )
            } catch (e) {
                setTimeout(function () { throw e }, 0)
            } finally {
                inst.l = false
            }
        }
    }

    function unschedule(inst) {
        if (insts == null) return
        if (insts.length === 1) {
            if (insts[0] !== inst) return
            cancelAnimationFrame(frameId)
            insts = frameId = null
        } else {
            var index = insts.indexOf(inst)
            if (index >= 0) insts.splice(index, 0)
        }
    }

    function SelfSufficient(vnode) {
        var self = this
        this.s = vnode
        this.r = function () { self.redraw() }
        this.l = null
    }

    SelfSufficient.prototype.view = function (vnode) {
        this.s = vnode
        return vnode.attrs.root
    }

    SelfSufficient.prototype.oncreate =
    SelfSufficient.prototype.onupdate = function (vnode) {
        if (this.l) throw new Error("State is currently locked!")
        unschedule(this)
        this.l = true
        try {
            render(vnode.dom, [(0, vnode.attrs.view)(this)], this.r)
        } finally {
            this.l = false
        }
    }

    SelfSufficient.prototype.onremove = function (vnode) {
        this.s = this.r = null
        this.l = true
        unschedule(this)
        render(vnode.dom)
    }

    // Public API
    SelfSufficient.prototype.safe = function () {
        return !this.l
    }

    SelfSufficient.prototype.redraw = function () {
        if (!this.l) {
            if (insts == null) {
                insts = [this]
                frameId = requestAnimationFrame(invokeRedraw)
            } else {
                var end = insts.length - 1
                // Already at the end, nothing left to do.
                if (insts[end] === this) return
                var index = insts.indexOf(this)

                if (index >= 0) {
                    // In case this winds up spammy, I can't take the naïve approach.
                    while (index < end) {
                        insts[index] = insts[index + 1]
                        index++
                    }
                    insts[end] = this
                } else {
                    insts.push(inst)
                }
            }
        }
    }

    SelfSufficient.prototype.redrawSync = function () {
        if (this.s == null) throw new TypeError("Can't redraw after unmount.")
        if (this.l == null) throw new TypeError("Can't redraw without a root.")
        this.onupdate(this.s)
    }

    return SelfSufficient
})
