/**
 * This is a module collecting all the other submodules for easy access.
 *
 * Note: this should *not* be loaded as a browser script.
 */

"use strict"

if (typeof exports !== "object" || !exports) {
    throw new Error(
        "This is a CommonJS module, and shouldn't be loaded directly!"
    )
}

exports.censor = require("./censor.js")
exports.SelfSufficient = require("./self-sufficient.js")
exports.makeStore = require("./store.js")
exports.makeRedraw = require("./redraw.js")
exports.each = require("./each.js")
exports.link = require("./link.js")
var match = require("./match.js")
exports.when = match.when
exports.cond = match.cond
exports.match = match.match
