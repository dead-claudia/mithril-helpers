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

exports.censor = require("./censor.js").censor
exports.SelfSufficient = require("./self-sufficient.js").SelfSufficient
exports.makeStore = require("./store.js").makeStore
