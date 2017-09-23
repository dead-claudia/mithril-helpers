/**
 * Use this to isolate your component from Mithil's redraw system, so those who
 * use `m.render` directly can still use your component. It's also useful in its
 * own right if you're using `m.render` directly, since you can use this to
 * batch your redraws in child components, and it's also useful for implementing
 * subtree redraws.
 */

;(function (factory) {
    if (typeof exports === "object" && exports != null) {
        factory(exports,
            require("mithril/hyperscript"),
            require("mithril/render")
        )
    } else if (typeof m === "function") {
        factory(m.helpers || (m.helpers = {}), m, m.render)
    } else {
        throw new Error("Mithril must be loaded first!")
    }
})(function (exports, h, render) {
    "use strict"

    // Get the correct scheduling function
    var schedule = typeof requestAnimationFrame === "function"
        ? requestAnimationFrame
        : setTimeout

    // Set up the initial state
    var last = 0, locked = false
    var vnodes

    function execRedraw(vnode) {
        if (typeof vnode.state.onbeforeupdate === "function") {
            var force = vnode.state.onbeforeupdate(vnode, vnode)
            if (force !== undefined && !force) return
        }
        render(vnode.dom, vnode.state.render(vnode))
        if (typeof vnode.state.onupdate === "function") {
            vnode.state.onupdate(vnode)
        }
    }

    function invokeRedraw() {
        var queued = vnodes
        vnodes = undefined
        last = Date.now()

        // Store the length now, since it might grow later.
        for (var i = 0; i < queued.length; i++) {
            locked = true
            // We need at least some fault tolerance - it'd be weird if
            // someone else's errors prevented one of our redraws.
            try {
                execRedraw(queued[i])
            } catch (e) {
                setTimeout(function () { throw e }, 0)
            }
            locked = false
        }
    }

    function unregister(vnode) {
        var index = vnodes.indexOf(vnode)
        if (index >= 0) vnodes.splice(index, 1)
    }

    exports.SelfSufficient = SelfSufficient
    function SelfSufficient(tag, attrs) {
        if (typeof tag !== "string") tag = "div"
        if (typeof attrs !== "object" || attrs == null) attrs = undefined
        this._t = tag
        this._a = attrs
    }

    SelfSufficient.prototype.view = function (vnode) {
        return h(this._t, this._a, vnode.state.render(vnode))
    }

    SelfSufficient.prototype.onbeforeupdate = function (vnode, old) {
        // This is false only if we're currently redrawing.
        if (vnode !== old && vnodes != null) unregister(old)
        return true
    }

    SelfSufficient.prototype.forceRedraw = function (vnode) {
        if (locked) throw new Error("Node is currently locked!")
        if (vnodes != null) {
            unregister(vnode)
        } else {
            vnodes = []
            // 60fps translates to ~16ms per frame
            schedule(invokeRedraw, 16 - Date.now() - last)
        }
        locked = true
        try {
            execRedraw(vnode)
        } finally {
            locked = false
        }
    }

    SelfSufficient.prototype.redraw = function (vnode) {
        if (vnodes == null) {
            vnodes = []
            // 60fps translates to ~16ms per frame
            schedule(invokeRedraw, 16 - Date.now() - last)
        }
        if (vnodes.indexOf(vnode) < 0) vnodes.push(vnode)
    }

    SelfSufficient.prototype.link = function (vnode, callback) {
        return function (e) {
            callback(e)
            if (e.redraw !== false) {
                e.redraw = false
                SelfSufficient.prototype.redraw(vnode)
            }
        }
    }
})
