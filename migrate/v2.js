/**
 * A general migration utility to ease v1-v2 migration.
 *
 * This file is licensed under MIT, as it takes a *lot* of code from Mithril
 * v1 itself.
 */

;(function () {
  var mithril

  if (typeof exports === "object" && exports) {
    exports.v2 = v2
    mithril = require("mithril")
  } else if (typeof m !== "function") {
    throw new Error("Mithril must be loaded first!")
  } else {
    mithril = m
  }

  /**
   *
   * m()
   *
   */
  function v2(tag, pairs) {
    return mithril.apply(this, arguments)
  }

  /**
   *
   * render
   *
   */
  v2.render = mithril.render

  /**
   *
   * mount
   *
   */
  v2.mount = mithril.mount

  /**
   *
   * route
   *
   */
  v2.route = mithril.route

  /**
   *
   * request
   *
   */
  v2.request = mithril.request

  /**
   *
   * jsonp
   *
   */
  v2.jsonp = mithril.jsonp

  /**
   *
   * parseQueryString
   *
   */
  v2.parseQueryString = function(string) {
    if (string === "" || string == null) return {}
    if (string.charAt(0) === "?") string = string.slice(1)

    var entries = string.split("&"), data = {}, counters = {}
    for (var i = 0; i < entries.length; i++) {
      var entry = entries[i].split("=")
      var key = decodeURIComponent(entry[0])
      var value = entry.length === 2 ? decodeURIComponent(entry[1]) : ""

      if (value === "true") value = true
      else if (value === "false") value = false

      var levels = key.split(/\]\[?|\[/)
      var cursor = data
      if (key.indexOf("[") > -1) levels.pop()
      for (var j = 0; j < levels.length; j++) {
        var level = levels[j], nextLevel = levels[j + 1]
        var isNumber = nextLevel == "" || !isNaN(parseInt(nextLevel, 10))
        var isValue = j === levels.length - 1
        if (level === "") {
          var key = levels.slice(0, j).join()
          if (counters[key] == null) counters[key] = 0
          level = counters[key]++
        }
        if (cursor[level] == null) {
          cursor[level] = isValue ? value : isNumber ? [] : {}
        }
        cursor = cursor[level]
      }
    }
    return data
  }

  /**
   *
   * buildQueryString
   *
   */
  v2.buildQueryString = function(object) {
    if (Object.prototype.toString.call(object) !== "[object Object]") return ""

    var args = []
    for (var key in object) {
      destructure(key, object[key])
    }

    return args.join("&")

    function destructure(key, value) {
      if (Array.isArray(value)) {
        for (var i = 0; i < value.length; i++) {
          destructure(key + "[" + i + "]", value[i])
        }
      }
      else if (Object.prototype.toString.call(value) === "[object Object]") {
        for (var i in value) {
          destructure(key + "[" + i + "]", value[i])
        }
      }
      else args.push(encodeURIComponent(key) + (value != null && value !== "" ? "=" + encodeURIComponent(value) : ""))
    }
  }

  /**
   *
   * withAttr
   *
   */
  v2.withAttr = mithril.withAttr

  /**
   *
   * trust
   *
   */
  v2.trust = mithril.trust

  /**
   *
   * fragment
   *
   */
  v2.fragment = mithril.fragment

  /**
   *
   * redraw
   *
   */
  v2.redraw = mithril.redraw

  /**
   *
   * version
   *
   */
  v2.version = '1.0.0.migrate'
})()
