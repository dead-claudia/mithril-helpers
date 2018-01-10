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

    var migrated = typeof WeakSet === "function"
        ? new WeakSet()
        : {
            has: function (Comp) { return Comp.$migrating },
            add: function (Comp) { Comp.$migrating = true }
        }

    v1.migrate = function (Comp) {
        migrated.add(Comp)
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

    var construct = typeof Reflect === "object"
        ? Reflect.construct
        : function construct(controller, _, args) {
            if (!controller) return {}
            var result = Object.create(controller.prototype)
            return controller.apply(result, args) || result
        }

    function invokeHook(hook, ifMissing) {
        return function () {
            var func = this.component[hook]
            return func != null ? func.apply(this, arguments) : ifMissing
        }
    }

    var RenderLegacy = {
        oninit: function (vnode) {
            this.component = vnode.attrs.component
            this.state = construct(this.component.controller, vnode.attrs.args)
            if (this.component.oninit) {
                this.component.oninit.apply(this.component, arguments)
            }
        },

        oncreate: function () {
            var func = this.component.oncreate
            if (func != null) func.apply(this, arguments)
        },

        onbeforeupdate: function () {
            var func = this.component.onbeforeupdate
            return func != null ? func.apply(this, arguments) : true
        },

        onupdate: function () {
            var func = this.component.onupdate
            if (func != null) func.apply(this, arguments)
        },

        onbeforeremove: function () {
            var func = this.component.onbeforeremove
            return func != null ? func.apply(this, arguments) : undefined
        },

        onremove: function () {
            var func = this.component.onremove
            if (func != null) func.apply(this, arguments)
        },

        view: function (vnode) {
            return this.component.view.apply(
                this.component,
                [this.state].concat(vnode.attrs.args)
            )
        },
    }

    function nonComponentInit() {
        throw new Error("v1 nodes aren't components anymore!")
    }

    v1.component = makeComponent
    function makeComponent(component) {
        if (component.tag !== RenderLegacy && !migrating.has(component)) {
            var output = mithril.apply(undefined, arguments)
            output.controller = output.view = nonComponentInit
            return output
        }

        var args = []

        for (var i = 1; i < arguments.length; i++) {
            args[i] = arguments[i]
        }

        var attrs = {component: component, args: args}
        var output = mithril(RenderLegacy, attrs)

        if (args[0] && args[0].key != null) output.attrs.key = args[0].key
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

    function convertComponents(vnode) {
        if (vnode.children == null) return
        for (var i = 0; i < vnode.children.length; i++) {
            if (migrating.has(vnode.children[i])) {
                vnode.children[i] = mithril(RenderLegacy, {
                    component: component,
                    args: [],
                })
            }
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

        convertComponents(vnode)
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
        if (sync === true) {
            throw new Error("Sync redraws are not possible in v1!")
        }
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
        if (component && component.tag && !migrating.has(component)) {
            throw new Error(
                "Raw vnodes are no longer valid mount components in v1!"
            )
        }

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
        if (component.tag && !migrating.has(component)) {
            throw new Error(
                "Raw vnodes are no longer valid mount components in v1!"
            )
        }

        this.component = component
    }

    Resolver.prototype.render = function () {
        return mithril(RenderLegacy, {component: this.component, args: []})
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
        if (migrating.has(vnode)) {
            vnode = mithril(RenderLegacy, {component: vnode, args: []})
        }
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
