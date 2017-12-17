const o = require("../spec_helper")
const v2 = require("../../migrate/v2").v2

o.describe("migrate/v2", () => {
    o.beforeEach(() => {
        document.body.innerHTML = ""
    })

    o.describe("v2", () => {
        const subject = () => v2("div")

        o.it("Return vnode", () => {
            o.expect(subject().tag).equals("div")
        })
    })

    o.describe(".render", () => {
        const subject = () => v2.render(document.body, v2("span", "Hello"))

        o.it("Render dom", () => {
            subject()
            o.expect(document.body.firstChild.nodeName).equals("SPAN")
        })
    })

    o.describe(".mount", () => {
        const subject = () => {
            v2.mount(document.body, {view: () => v2("main", "Hello")})
        }

        o.it("Render dom", () => {
            subject()
            o.expect(document.body.firstChild.nodeName).equals("MAIN")
        })
    })

    o.describe("#route", () => {
        const subject = () => {
            v2.route(
                document.body,
                "/",
                {
                    "/": {view: () => v2("header", "Hello")}
                }
            )
        }

        o.it("Render dom", () => {
            subject()
            return new Promise((resolve) => {
                setTimeout(() => {
                    o.expect(document.body.firstChild.nodeName).equals("HEADER")
                    resolve()
                }, 100)
            })
        })
    })

    o.describe(".request", () => {
        const subject = () => v2.request("127.0.0.1").catch(() => null)

        o.it("Return promise", () => {
            o.expect(typeof subject().then === "function").equals(true)
            o.expect(typeof subject().catch === "function").equals(true)
        })
    })

    o.describe(".jsonp", () => {
        const subject = () => v2.jsonp("127.0.0.1").catch(() => null)

        o.it("Return promise", () => {
            o.expect(typeof subject().then === "function").equals(true)
            o.expect(typeof subject().catch === "function").equals(true)
        })
    })

    o.describe(".parseQueryString", () => {
        const subject = () => v2.parseQueryString(value)
        let value = null

        o.context("When value is array", () => {
            o.beforeEach(() => {
                value = "a[0]=x&a[1]=y"
            })

            o.it("Parse query string", () => {
                o.expect(subject().a[0]).equals("x")
                o.expect(subject().a[1]).equals("y")
            })
        })
    })

    o.describe(".buildQueryString", () => {
        const subject = () => v2.buildQueryString(value)
        let value = null

        o.context("When value is array", () => {
            o.beforeEach(() => {
                value = {a: ["x", "y"]}
            })

            o.it("Parse query string", () => {
                o.expect(subject()).equals(encodeURI("a[0]=x&a[1]=y"))
            })
        })
    })

    o.describe(".withAttr", () => {
        const subject = () => v2.withAttr("value", () => null)

        o.it("Return function", () => {
            o.expect(typeof subject() === "function").equals(true)
        })
    })

    o.describe(".trust", () => {
        const subject = () => v2.trust("<script>alert(0)</script>")

        o.it("Return vnode", () => {
            o.expect(subject().tag).equals("<")
            o.expect(subject().children).equals("<script>alert(0)</script>")
        })
    })

    o.describe(".fragment", () => {
        const subject = () => v2.fragment({oninit: () => null}, [v2("div")])

        o.it("Return vnodes", () => {
            o.expect(subject().tag).equals("[")
            o.expect(subject().children[0].tag).equals("div")
        })
    })

    o.describe(".redraw", () => {
        const subject = () => v2.redraw()

        o.it("Not raise error", () => {
            let error = null
            try {
                subject()
            } catch (e) {
                error = e
            }
            o.expect(error).equals(null)
        })
    })

    o.describe(".version", () => {
        const subject = () => v2.version

        o.it("Return version", () => {
            o.expect(subject()).equals("1.0.0.migrate")
        })
    })
})
