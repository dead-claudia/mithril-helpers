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
            require("mithril/hyperscript"),
            require("mithril/render")
        )
    } else if (typeof m === "function") {
        (m.helpers || (m.helpers = {})).SelfSufficient = factory(m, m.render)
    } else {
        throw new Error("Mithril must be loaded first!")
    }
})(function (h, render) {
    "use strict"

    // Get the correct scheduling function
    var schedule = typeof requestAnimationFrame === "function"
        ? requestAnimationFrame
        : setTimeout

    // Set up the initial state
    var last = 0
    var locked = false
    var states = new Set()

    function execRedraw(state) {
        if (typeof state._.attrs.onbeforeupdate === "function") {
            var force = state._.attrs.onbeforeupdate(state._, state._)
            if (force !== undefined && !force) return
        }
        render(state._.dom, state._.attrs.view(state._))
        if (typeof state._.attrs.onupdate === "function") {
            state._.attrs.onupdate(state._)
        }
    }

    function invokeRedraw() {
        var prev = new Set(states)
        var iter = prev.values()

        states.clear()
        last = Date.now()
        locked = true

        for (var next = iter.next(); !next.done; next = iter.next()) {
            // We need at least some fault tolerance - it'd be weird if someone
            // else's errors prevented one of our redraws.
            try {
                if (next.value._ != null) execRedraw(next.value)
            } catch (e) {
                setTimeout(function () { throw e }, 0)
            }
        }

        locked = false
    }

    return {
        oninit: function () {
            this._ = undefined
        },

        safe: function () {
            return this._ != null && this._.dom != null && !locked
        },

        redraw: function () {
            if (this._ == null) return
            // 60fps translates to ~16ms per frame
            if (!states.size) schedule(invokeRedraw, 16 - Date.now() - last)
            states.add(this)
        },

        redrawSync: function () {
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

        link: function (callback) {
            var self = this

            return function (e) {
                if (typeof callback === "function") callback(e)
                else callback.handleEvent(e)

                if (e.redraw !== false) {
                    e.redraw = false
                    self.redraw()
                }
            }
        },

        onbeforeupdate: function (vnode, old) {
            // This is false only if we're currently redrawing.
            if (vnode !== old) states.delete(old._)
            this._ = vnode
        },

        onremove: function () {
            states.delete(this)
            this._ = undefined
        },

        view: function (vnode) {
            this._ = vnode
            return h(this._.attrs.tag, this._.attrs.attrs,
                this._.attrs.view(this._)
            )
        },
    }
})
