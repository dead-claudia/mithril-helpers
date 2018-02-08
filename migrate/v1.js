/**
 * A general migration utility to ease v0.2-v1 migration.
 *
 * This file is licensed under MIT, as it takes a *lot* of code from Mithril
 * v0.2 itself.
 */

;(function () {
    if (typeof Promise !== "function") {
        throw new Error("A promise polyfill is required!")
    }

    var toString = {}.toString
    var hasOwn = {}.hasOwnProperty
    var mithril

    if (typeof module === "object" && module && module.exports) {
        module.exports = v1
        mithril = require("mithril")
    } else if (typeof m !== "function") {
        throw new Error("Mithril must be loaded first!")
    } else {
        if (!m.helpers) m.helpers = {}
        if (!m.helpers.migrate) m.helpers.migrate = {}
        m.helpers.migrate.v1 = v1
        mithril = m
    }

    var index = 0
    var migrated = typeof WeakMap === "function"
        ? new WeakMap()
        : {
            has: function (Comp) { return Comp.$migrating != null },
            get: function (Comp) { return Comp.$migrating },
            set: function (Comp, value) { Comp.$migrating = value }
        }

    v1.migrate = function (Comp) {
        migrated.set(Comp, index++)
        return Comp
    }

    //
    //  #    #     #####  #####   ####  #####
    //  ##  ##     #    # #    # #    # #    #
    //  # ## #     #    # #    # #    # #    #
    //  #    # ### #####  #####  #    # #####
    //  #    # ### #      #   #  #    # #
    //  #    # ### #      #    #  ####  #
    //

    function propify(promise, initialValue) {
        var prop = makeProp(initialValue)
        promise.then(prop)
        prop.then = function (resolve, reject) {
            return propify(promise.then(resolve, reject), initialValue)
        }
        prop.catch = function (reject) {
            return prop.then(null)
        }
        return prop
    }

    function makeClosure(store) {
        function prop() {
            if (arguments.length) store = arguments[0]
            return store
        }

        prop.toJSON = function () {
            if (store && typeof store.toJSON === "function") {
                return store.toJSON()
            }

            return store
        }

        return prop
    }

    v1.prop = makeProp
    function makeProp(store) {
        if (
            store != null && (
                typeof store === "object" || typeof store === "function"
            ) && typeof store.then === "function"
        ) {
            return propify(store)
        }

        return makeClosure(store)
    }

    //
    //  #    #      ####   ####  #    # #####   ####  #    # ###### #    # #####
    //  ##  ##     #    # #    # ##  ## #    # #    # ##   # #      ##   #   #
    //  # ## #     #      #    # # ## # #    # #    # # #  # #####  # #  #   #
    //  #    # ### #      #    # #    # #####  #    # #  # # #      #  # #   #
    //  #    # ### #    # #    # #    # #      #    # #   ## #      #   ##   #
    //  #    # ###  ####   ####  #    # #       ####  #    # ###### #    #   #
    //

    function construct(controller, _, args) {
        if (!controller) return {}
        var result = Object.create(controller.prototype)
        return controller.apply(result, args) || result
    }

    var RenderLegacy = {
        oninit: function (vnode) {
            var component = vnode.attrs.component
            this.ctrl = construct(component.controller, vnode.attrs.args)
            if (component.oninit) component.oninit(vnode)
        },

        oncreate: function (vnode) {
            var func = vnode.attrs.component.oncreate
            if (func != null) vnode.attrs.call(this, vnode)
        },

        onbeforeupdate: function (vnode, old) {
            var func = vnode.attrs.component.onbeforeupdate
            return func != null ? func.call(this, vnode, old) : true
        },

        onupdate: function (vnode) {
            var func = vnode.attrs.component.onupdate
            if (func != null) func.call(this, vnode)
        },

        onbeforeremove: function (vnode) {
            var func = vnode.attrs.component.onbeforeremove
            return func != null ? func.call(this, vnode) : undefined
        },

        onremove: function (vnode) {
            var func = vnode.attrs.component.onremove
            if (func != null) func.call(this, vnode)
        },

        view: function (vnode) {
            return vnode.attrs.component.view.apply(
                vnode.attrs.component,
                [this.ctrl].concat(vnode.attrs.args)
            )
        },
    }

    function nonComponentInit() {
        throw new Error("v1 nodes aren't components anymore!")
    }

    function makeLegacy(component, args, key) {
        // Avoid the overhead of going through the factory
        return mithril.vnode(RenderLegacy, key, {
            component: component,
            args: args
        }, undefined, undefined, undefined)
    }

    v1.component = makeComponent
    function makeComponent(component) {
        if (!migrating.has(component)) {
            var output = mithril.apply(undefined, arguments)
            output.controller = output.view = nonComponentInit
            return output
        }

        // So we can keep components properly diffed
        var key = "mithril-helpers/self-sufficient:" + migrating.get(component)
        var args = []

        for (var i = 1; i < arguments.length; i++) {
            args[i] = arguments[i]
        }

        // Append to the key, so things like `m(Foo, {key: 1})` and
        // `m(Bar, {key: 1})` are seen as different.
        if (args[0] && args[0].key != null) key += ":" + args[0].key
        // Avoid the overhead of going through the factory
        var output = makeLegacy(component, args, key)

        output.controller = function () {
            return construct(component.controller, args)
        }

        if (component.controller) {
            output.controller.prototype = component.controller.prototype
        }

        output.view = function (ctrl) {
            var currentArgs = [ctrl].concat(args)
            for (var i = 1; i < arguments.length; i++) {
                currentArgs.push(arguments[i])
            }

            return component.view.apply(component, currentArgs)
        }

        // Our shim doesn't use this, but users might.
        output.view.$original = component.view

        return output
    }

    //
    //  #    #
    //  ##  ##
    //  # ## #
    //  #    #
    //  #    #
    //  #    #
    //

    var onunloadEvent = {
        preventDefault: function () {
            throw new Error("Unmounting may no longer be prevented in v1!")
        }
    }

    var configAttrs = {
        oninit: function () {
            this._ = {}
        },

        oncreate: function (vnode) {
            vnode.attrs.config.call(vnode, vnode.dom, false, this._)
        },

        onupdate: function (vnode) {
            vnode.attrs.config.call(vnode, vnode.dom, true, this._)
        },

        onremove: function () {
            if (this._.onunload) this._.onunload(onunloadEvent)
        },
    }

    function checkComponent(component) {
      if (component.tag && !migrating.has(component)) {
          throw new Error("Raw vnodes are no longer valid components in v1!")
      }
    }

    function v1(tag, pairs) {
        if (tag && typeof tag.view === "function") {
            return makeComponent.apply(undefined, arguments)
        }

        var vnode = mithril.apply(this, arguments)

        if (typeof vnode.attrs.config === "function") {
            for (var key in configAttrs) {
                if (hasOwn.call(configAttrs, key)) {
                    vnode.attrs[key] = configAttrs[key]
                }
            }
        }

        if (Array.isArray(vnode.children)) {
            for (var i = 0; i < vnode.children.length; i++) {
                if (vnode.children[i]) checkComponent(vnode.children[i])
            }
        }

        return vnode
    }

    //
    //  #    #     ##### #####  #    #  ####  #####
    //  ##  ##       #   #    # #    # #        #
    //  # ## #       #   #    # #    #  ####    #
    //  #    # ###   #   #####  #    #      #   #
    //  #    # ###   #   #   #  #    # #    #   #
    //  #    # ###   #   #    #  ####   ####    #
    //

    v1.trust = function (text) {
        var inst = mithril.trust(text)
        var string = new String(text)

        for (var key in inst) {
            if (hasOwn.call(inst, key)) string[key] = inst[key]
        }

        return string
    }

    //                                      #
    //  #    #     #    # # ##### #    #   # #   ##### ##### #####
    //  ##  ##     #    # #   #   #    #  #   #    #     #   #    #
    //  # ## #     #    # #   #   ###### #     #   #     #   #    #
    //  #    # ### # ## # #   #   #    # #######   #     #   #####
    //  #    # ### ##  ## #   #   #    # #     #   #     #   #   #
    //  #    # ### #    # #   #   #    # #     #   #     #   #    #
    //

    v1.withAttr = mithril.withAttr

    //
    //  #    #     #####  ###### #####  #####    ##   #    #
    //  ##  ##     #    # #      #    # #    #  #  #  #    #
    //  # ## #     #    # #####  #    # #    # #    # #    #
    //  #    # ### #####  #      #    # #####  ###### # ## #
    //  #    # ### #   #  #      #    # #   #  #    # ##  ##
    //  #    # ### #    # ###### #####  #    # #    # #    #
    //

    v1.redraw = function (sync) {
        if (sync) throw new Error("Sync redraws are not possible in v1!")
        mithril.redraw()
    }

    //
    //  #    #     #    #  ####  #    # #    # #####
    //  ##  ##     ##  ## #    # #    # ##   #   #
    //  # ## #     # ## # #    # #    # # #  #   #
    //  #    # ### #    # #    # #    # #  # #   #
    //  #    # ### #    # #    # #    # #   ##   #
    //  #    # ### #    #  ####   ####  #    #   #
    //

    v1.mount = function (elem, component) {
        if (component != null) checkComponent(component)
        return mithril.mount.apply(this, arguments)
    }

    //
    //  #    #     #####   ####  #    # ##### ######
    //  ##  ##     #    # #    # #    #   #   #
    //  # ## #     #    # #    # #    #   #   #####
    //  #    # ### #####  #    # #    #   #   #
    //  #    # ### #   #  #    # #    #   #   #
    //  #    # ### #    #  ####   ####    #   ######
    //

    function Resolver(component) {
        checkComponent(component)
        this.component = component
    }

    Resolver.prototype.render = function () {
        return makeLegacy(this.component, [])
    }

    v1.route = function (elem, arg1, arg2, vdom) {
        // m.route()
        if (arguments.length === 0) return mithril.route.get()
        // m.route(el, defaultRoute, routes)
        if (arguments.length === 3 && isString(arg1)) {
            var newRoutes = {}

            for (var key of arg2) {
                if (hasOwn.call(arg2, key)) {
                    newRoutes[key] = new Resolver(arg2[key])
                }
            }

            return mithril.route(elem, arg1, arg2)
        }

        if (root.addEventListener || root.attachEvent) {
            // config: v1.route
            mithril.route.link(vdom)
            return
        }

        // m.route(route, params, shouldReplaceHistoryEntry)
        if (isString(root)) {
            var replaceHistory =
                (arguments.length === 3 ? arg2 : arg1) === true ||
                previousRoute === currentRoute

            v1.route.set(route, params, {
                replace: (arguments.length === 3 ? arg2 : arg1) === true,
            })
        }
    }

    v1.route.param = function (key) {
        return mithril.route.param(key)
    }

    // Have to use a getter/setter to correctly mirror Mithril v1's API.
    var mode = "search"
    var modes = {
        pathname: "",
        hash: "#",
        search: "?",
    }

    mithril.route.prefix("?")

    Object.defineProperty(v1.route, "mode", {
        configurable: true,
        enumerable: true,
        get: function () { return mode },
        set: function (value) {
            mode = value
            if (hasOwn.call(modes, value)) {
                mithril.route.prefix(modes[value])
            }
        },
    })

    v1.route.buildQueryString = v1.buildQueryString
    v1.route.parseQueryString = v1.parseQueryString

    //
    //  #    #     #####  ###### ###### ###### #####  #####  ###### #####
    //  ##  ##     #    # #      #      #      #    # #    # #      #    #
    //  # ## #     #    # #####  #####  #####  #    # #    # #####  #    #
    //  #    # ### #    # #      #      #      #####  #####  #      #    #
    //  #    # ### #    # #      #      #      #   #  #   #  #      #    #
    //  #    # ### #####  ###### #      ###### #    # #    # ###### #####
    //

    v1.deferred = makeDeferred
    function makeDeferred() {
        var deferred = {
            resolve: undefined,
            reject: undefined,
            promise: undefined,
        }

        deferred.promise = propify(new Promise(function (resolve, reject) {
            deferred.resolve = resolve
            deferred.reject = reject
        }))

        return deferred
    }

    //
    //  #    #      ####  #   # #    #  ####
    //  ##  ##     #       # #  ##   # #    #
    //  # ## #      ####    #   # #  # #
    //  #    # ###      #   #   #  # # #
    //  #    # ### #    #   #   #   ## #    #
    //  #    # ###  ####    #   #    #  ####
    //

    v1.sync = function (items) {
        return propify(Promise.all(items))
    }

    //
    //  #    #     #####  ######  ####  #    # ######  ####  #####
    //  ##  ##     #    # #      #    # #    # #      #        #
    //  # ## #     #    # #####  #    # #    # #####   ####    #
    //  #    # ### #####  #      #  # # #    # #           #   #
    //  #    # ### #   #  #      #   #  #    # #      #    #   #
    //  #    # ### #    # ######  ### #  ####  ######  ####    #
    //

    v1.request = function (options) {
        return propify(
            options.dataType === "jsonp"
                ? mithril.jsonp(options),
                : mithril.request(options),
            options.initialValue
        )
    }

    //
    //  #    #     #####  ###### #    # #####  ###### #####
    //  ##  ##     #    # #      ##   # #    # #      #    #
    //  # ## #     #    # #####  # #  # #    # #####  #    #
    //  #    # ### #####  #      #  # # #    # #      #####
    //  #    # ### #   #  #      #   ## #    # #      #   #
    //  #    # ### #    # ###### #    # #####  ###### #    #
    //

    v1.render = function (elem, vnode, forceRecreation) {
        if (migrating.has(vnode)) vnode = makeLegacy(vnode, [])
        if (forceRecreation) mithril.render(elem, null)
        return mithril.render(elem, vnode)
    }

    //
    //  #    #     #####  ###### #####   ####
    //  ##  ##     #    # #      #    # #
    //  # ## #     #    # #####  #    #  ####
    //  #    # ### #    # #      #####       #
    //  #    # ### #    # #      #      #    #
    //  #    # ### #####  ###### #       ####
    //

    v1.deps = function () {
        throw new Error("m.deps() is no longer available in v1!")
    }
})()
