/**
 * Use this to match based on conditions more easily.
 */

;(function () {
    "use strict"

    var Vnode, helpers

    if (typeof module === "object" && module && module.exports) {
        Vnode = require("mithril/render/vnode")
        helpers = module.exports
    } else if (typeof m === "function") {
        Vnode = m.vnode
        helpers = m.helpers || (m.helpers = {})
    } else {
        throw new Error("Mithril must be loaded first!")
    }

    function resolve(then) {
        return Vnode('[', null, null, [Vnode.normalize(then)])
    }

    helpers.when = function (cond, then, orElse) {
        cond = !!cond
        return Vnode("[", null, null, [
            Vnode("[", cond, null, [Vnode.normalize(cond ? then() : orElse())])
        ])
    }

    helpers.cond = function () {
        var children = []
        for (var i = 0; i < arguments.length; i++) {
            var arg = arguments[i]
            children.push(arg.if ? resolve(arg.then()) : null)
        }
        return Vnode('[', null, null, children)
    }

    helpers.match = function (value) {
        var children = []
        if (value === value) {
            for (var i = 1; i < arguments.length; i++) {
                var arg = arguments[i]
                children.push(arg.if === value ? resolve(arg.then()) : null)
            }
        } else {
            for (var i = 1; i < arguments.length; i++) {
                var arg = arguments[i]
                var cond = arg.if
                children.push(cond !== cond ? resolve(arg.then()) : null)
            }
        }
        return Vnode('[', null, null, children)
    }
})()
