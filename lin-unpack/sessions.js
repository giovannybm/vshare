"use strict";

function e() {
    var e, n = Date.now();
    for (e in l) l[e] + 9e4 < n && (delete a[e], delete l[e], o.user.trace("Session %s timed out, clearing.", e))
}

function n(e) {
    var n = a[e] || 0;
    return o.user.trace("Sending session %s to %s handler.", e, t[n]), n
}

function s(e, n, s) {
    switch (l[e] = Date.now(), s) {
        case "pin":
            a[e] = n, o.user.trace("Pinning session %s to %s handler.", e, t[n]);
            break;
        case "unpin":
            o.user.trace("Unpinning session %s from %s handler.", e, t[n]), delete a[e], delete l[e]
    }
}

function r(e) {
    return !!l[e]
}

function i(e) {
    var n, s;
    if (o.user.trace("Clearing all %s sessions.", e), n = t.indexOf(e), n >= 0)
        for (s in a) a[s] == n && (delete a[s], delete l[s], o.user.trace("Clearing session %s.", s))
}
var t, o = require("ols-logger").FLP,
    a = {},
    l = {};
setInterval(e, 1e3), t = ["dongle", "offline", "online"], module.exports = {
    clearSessions: i,
    getSessionHandler: n,
    isSessionTrusted: r,
    updateSessionHandler: s
};
