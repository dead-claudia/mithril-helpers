/**
 * Use this to isolate your component from Mithil's redraw system, so those who
 * use `m.render` directly can still use your component. It's also useful in its
 * own right if you're using `m.render` directly, since you can use this to
 * batch your redraws in child components, and it's also useful for implementing
 * subtree redraws.
 */

;(function () {
    "use strict"

    var requests = [], vnodes = []
    var last = 0, pending = false
    var h, render
    var timeout = typeof requestAnimationFrame === "function"
        ? requestAnimationFrame
        : setTimeout

    if (typeof exports === "object" && exports) {
        exports.SelfSufficient = SelfSufficient
        h = require("mithril/hyperscript")
        render = require("mithril/render")
    } else if (typeof m !== "function") {
        throw new Error("Mithril must be loaded first!")
    } else {
        (m.helpers || (m.helpers = {})).SelfSufficient = SelfSufficient
        h = m
        render = m.render
    }

    function invokeRedraw() {
        var reqSlice = requests
        var vnodeSlice = vnodes
        pending = false
        requests = []
        vnodes = []

        for (var i = 0; i < reqSlice.length; i++) {
            render(vnodeSlice[i].dom, reqSlice[i].render(vnodeSlice[i]))
        }

        last = Date.now()
    }

    exports.SelfSufficient = SelfSufficient
    function SelfSufficient(tag, attrs) {
        if (typeof tag !== "string") tag = "div"
        if (typeof attrs !== "object" || attrs == null) attrs = undefined
        this._tag = tag
        this._attrs = attrs
    }

    SelfSufficient.prototype.redraw = function (vnode) {
        if (requests.indexOf(this) >= 0) return
        requests.push(this)
        vnodes.push(vnode)
        if (!pending) {
            pending = true
            // 60fps translates to 16.6ms per frame, round it down since
            // `setTimeout` requires int
            timeout(invokeRedraw, 16 - Date.now() - last)
        }
    }

    SelfSufficient.prototype.view = function (vnode) {
        return h(this._tag || "div", this._attrs, this.render(vnode))
    }
})()
