const o = require("mithril/ospec")
const browserMock = require("mithril/test-utils/browserMock.js")

global.window = browserMock()
global.document = window.document

o.describe = o.context = o.spec
o.it = o.expect = o

module.exports = o
