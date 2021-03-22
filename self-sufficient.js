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

    var locked = false
    var frameId, insts

    function invokeRender(inst) {
        render(inst.s.dom, [(0, inst.s.attrs.view)(new State(inst))], inst.r)
    }

    function invokeRedraw() {
        var prev = insts

        insts = frameId = null
        locked = true

        for (var i = 0; i < prev.length; i++) {
            // We need at least some fault tolerance - it'd be weird if someone
            // else's errors prevented one of our redraws.
            try {
                invokeRender(prev[i])
            } catch (e) {
                setTimeout(function () { throw e }, 0)
            }
        }

        locked = false
    }

    function schedule(inst) {
        if (insts == null) {
            insts = []
            frameId = requestAnimationFrame(invokeRedraw)
        }
        var index = insts.indexOf(inst)

        if (index >= 0) {
            // In case this winds up spammy, I can't take the naïve approach.
            for (var end = insts.length - 1; index < end; index++) {
                insts[index] = insts[index + 1]
            }
            insts[end] = inst
        } else {
            insts.push(inst)
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

    function update() {
        try {
            unschedule(this)
            invokeRender(this)
        } finally {
            locked = false
        }
    }

    function State(inst) { this._ = inst }
    State.prototype.safe = function () {
        return this._.s != null && !locked
    }
    State.prototype.redraw = function () {
        if (this._.s != null && !locked) schedule(this._)
    }
    State.prototype.redrawSync = function () {
        if (locked) throw new Error("State is currently locked!")
        if (this._.s == null) {
            throw new TypeError("Can't redraw without a DOM node!")
        }
        locked = true
        update.call(this._)
    }

    return {
        oninit(vnode) {
            var self = this
            this.s = vnode
            this.r = function () { schedule(self) }
        },

        view(vnode) {
            locked = true
            this.s = vnode
            return vnode.attrs.root
        },

        oncreate: update,
        onupdate: update,

        onremove() {
            this.s = this.r = null
            unschedule(this)
        },
    }
})
