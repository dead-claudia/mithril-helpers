/**
 * Use this to isolate your component from Mithil's redraw system, so those who
 * use `m.render` directly can still use your component. It's also useful in its
 * own right if you're using `m.render` directly, since you can use this to
 * batch your redraws in child components, and it's also useful for implementing
 * subtree redraws.
 *
 * Note: this is very highly optimized, since
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

    function invokeList(iter) {
        last = Date.now()
        locked = true

        for (var next = iter.next(); !next.done; next = iter.next()) {
            // We need at least some fault tolerance - it'd be weird if someone
            // else's errors prevented one of our redraws.
            try {
                execRedraw(next.value)
            } catch (e) {
                setTimeout(function () { throw e }, 0)
            }
        }

        locked = false
    }

    // Separate these out into separate closures, so we can let unused functions
    // be properly collected.
    var methods = typeof Set === "function" && typeof Array.from === "function"
        // Let's try a set first - they generally have a sublinear add/remove
        // operation, and that's what we do most.
        ? (function () {
            var vnodes = new Set()

            return {
                invokeRedraw: function () {
                    var prev = new Set(vnodes)
                    vnodes.clear()
                    invokeList(prev.values())
                },

                unregister: function (vnode) {
                    vnodes.delete(vnode)
                },

                register: function (vnode) {
                    vnodes.add(vnode)
                },

                isEmpty: function () {
                    return vnodes.size === 0
                },
            }
        })()
        : (function () {
            var count = 0
            var offset = 0
            var vnodes = []

            /** @this */
            function iterNext() {
                var done = this._ === offset
                var value = done ? undefined : vnodes[this._++]

                return {done: done, value: value}
            }

            return {
                invokeRedraw: function () {
                    offset = count
                    invokeList({_: 0, next: iterNext})
                    var i = 0

                    while (i !== offset) vnodes[i++] = vnodes[offset++]
                    count -= offset
                    vnodes.length = count
                    offset = 0
                },

                // This removes the first occurrence. It avoids all the ceremony
                // of `indexOf` + `splice`, as well as the latter's resulting
                // allocation.
                //
                // Note: this is called on every redraw, so it *has* to be fast.
                unregister: function (vnode) {
                    for (var i = offset; i < count; i++) {
                        if (vnodes[i] === vnode) {
                            var j = i++
                            while (i !== count) vnodes[j++] = vnodes[i++]
                            vnodes[count--] = undefined
                        }
                    }
                },

                register: function (vnode) {
                    for (var i = offset; i < count; i++) {
                        if (vnodes[i] === vnode) return
                    }

                    vnodes[count++] = vnode
                },

                isEmpty: function () {
                    return offset === count
                },
            }
        })()

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
        if (vnode !== old) methods.unregister(old)
        return true
    }

    SelfSufficient.prototype.forceRedraw = function (vnode) {
        if (locked) throw new Error("Node is currently locked!")
        if (methods.isEmpty()) {
            // 60fps translates to ~16ms per frame
            schedule(methods.invokeRedraw, 16 - Date.now() - last)
        } else {
            methods.unregister(vnode)
        }
        locked = true
        try {
            execRedraw(vnode)
        } finally {
            locked = false
        }
    }

    SelfSufficient.prototype.safe = function () {
        return !locked
    }

    // Alias so you can overwrite `redraw` with a compatible function and still
    // redraw from outside the instance.
    SelfSufficient.prototype._redraw =
    SelfSufficient.prototype.redraw = function (vnode) {
        // 60fps translates to ~16ms per frame
        if (methods.isEmpty()) {
            schedule(methods.invokeRedraw, 16 - Date.now() - last)
        }
        methods.register(vnode)
    }

    SelfSufficient.prototype.link = function (vnode, callback) {
        return function (e) {
            if (typeof callback === "function") callback.call(this, e)
            else callback.handleEvent(e)

            if (e.redraw !== false) {
                e.redraw = false
                SelfSufficient.prototype.redraw(vnode)
            }
        }
    }

    return SelfSufficient
})
