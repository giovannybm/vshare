"use strict";

function n(n) {
    var r = !1;
    return function() {
        r || (r = !0, n.apply(null, arguments))
    }
}

function r(n, r, e) {
    a(n, function(n, i) {
        if (n) return void e(n);
        var t = r(i);
        return t.length <= 1 ? void e(Error("Failed reading uuid.")) : void e(null, t)
    })
}

function e(n, r) {
    return r.slice(r.indexOf(n) + 2).trim()
}

function i(r) {
    var e = "",
        i = n(r),
        t = u.get("http://169.254.169.254/latest/meta-data/instance-id", function(n) {
            n.on("data", function(n) {
                e += n
            }).on("end", function() {
                return e.length <= 2 ? void i(Error("Failed reading uuid.")) : void i(null, e.trim())
            })
        });
    t.on("error", i).setTimeout(1e3, i)
}

function t(r) {
    var e = "",
        i = n(r),
        t = u.get({
            protocol: "http:",
            hostname: "metadata.google.internal",
            path: "/computeMetadata/v1/instance/id",
            headers: {
                "Metadata-Flavor": "Google"
            }
        }, function(n) {
            n.on("data", function(n) {
                e += n
            }).on("end", function() {
                return e.length <= 2 ? void i(Error("Failed reading uuid.")) : void i(null, e.trim())
            })
        });
    t.on("error", i).setTimeout(1e3, i)
}

function o(n, r) {
    return 0 == n.length ? void r(Error("Failed reading uuid.")) : void n[0](function(e, i) {
        return e ? (d.system.debug({
            err: e
        }, "Serial number mechanism failed."), void o(n.slice(1), r)) : void r(null, i)
    })
}
var u = require("http"),
    a = require("child_process").exec,
    d = require("ols-logger").FLP;
module.exports = function(n) {
    var u = r.bind(null, "wmic csproduct get UUID", e.bind(null, "\r\n")),
        a = r.bind(null, "system_profiler SPHardwareDataType | grep UUID", e.bind(null, ": ")),
        d = r.bind(null, "cat /var/lib/dbus/machine-id", function(n) {
            return n.trim()
        }),
        l = r.bind(null, "cat /etc/machine-id", function(n) {
            return n.trim()
        });
    switch (process.platform) {
        case "win32":
            return void o([u, i, t], n);
        case "darwin":
            return void o([a, i, t], n);
        case "linux":
            return void o([d, l, i, t], n);
        default:
            return void n(Error("Cannot provide serial number for " + process.platform))
    }
};
