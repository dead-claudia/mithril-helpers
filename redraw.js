/**
 * Use this when you want to use `m.redraw` to link from streams or other
 * synchronously-updating cells.
 *
 * Note: call `redraw.ready` in `oncreate` to unlock it.
 *
 * Also, you may call `redraw.lock` in `onbeforeupdate` and `redraw.ready` in
 * `onupdate`, to avoid unnecessary rendering calls.
 */

;(function () {
    "use strict"

    // Ideally, this would use a hook to know when Mithril starts/finishes
    // redrawing.
    var p = Promise.resolve()
    var mithril

    if (typeof module === "object" && module && module.exports) {
        module.exports = makeRedraw
        mithril = require("mithril")
    } else if (typeof m !== "function") {
        throw new Error("Mithril must be loaded first!")
    } else {
        (m.helpers || (m.helpers = {})).makeRedraw = makeRedraw
        mithril = m
    }

    function makeRedraw(state) {
        var ready = false
        var redraw = state != null
            ? function () { if (ready) state.redraw() }
            : function () { if (ready) p.then(mithril.redraw) }

        redraw.ready = function () {
            ready = true
        }

        return redraw
    }
})()
