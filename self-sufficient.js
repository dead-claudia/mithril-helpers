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
    var vnodes = new Map()

    function invokeRedraw() {
        var prev = Array.from(vnodes)

        vnodes.clear()
        last = Date.now()
        locked = true

        for (var i = 0; i < prev.length; i++) {
            // We need at least some fault tolerance - it'd be weird if someone
            // else's errors prevented one of our redraws.
            try {
                render(prev[i][0].dom,
                    (0, prev[i][0].attrs.view)(prev[i][1])
                )
            } catch (e) {
                setTimeout(function () { throw e }, 0)
            }
        }

        locked = false
    }

    function State(vnode) {
        this._ = vnode
    }

    State.prototype.safe = function () {
        return this._ != null && this._.dom != null && !locked
    }

    State.prototype.redraw = function () {
        if (!this.safe()) return
        // 60fps translates to ~16ms per frame
        if (!vnodes.size) schedule(invokeRedraw, 16 - Date.now() - last)
        vnodes.set(this._, this)
    }

    State.prototype.redrawSync = function () {
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

    State.prototype.link = function (callback) {
        var self = this

        return function (e) {
            if (typeof callback === "function") callback(e)
            else callback.handleEvent(e)

            if (e.redraw !== false) {
                e.redraw = false
                // 60fps translates to ~16ms per frame
                if (!vnodes.size) schedule(invokeRedraw, 16 - Date.now() - last)
                vnodes.set(self._, self)
            }
        }
    }

    return {
        onbeforeupdate: function (vnode, old) {
            // This is false only if we're currently redrawing.
            if (vnode !== old) vnodes.delete(old)
        },

        onupdate: function () {
            locked = false
        },

        onremove: function (vnode) {
            vnodes.delete(vnode)
        },

        view: function (vnode) {
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
})
