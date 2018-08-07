"use strict";

function e(e, t) {
    if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
}
var t = function() {
        function e(e, t) {
            var i, s;
            for (i = 0; i < t.length; i++) s = t[i], s.enumerable = s.enumerable || !1, s.configurable = !0, "value" in s && (s.writable = !0), Object.defineProperty(e, s.key, s)
        }
        return function(t, i, s) {
            return i && e(t.prototype, i), s && e(t, s), t
        }
    }(),
    i = require("crypto"),
    s = require("fs"),
    n = require("lodash"),
    r = require("vrloffline"),
    a = require("../sessions"),
    l = require("ols-logger").FLP,
    o = require("./transforms"),
    u = 36e5,
    f = 864e5,
    d = 6e4,
    c = 9,
    h = /X-Session-Operation: (:?pin|unpin|)/gi,
    b = Object.freeze({
        PERMISSION_DENIED: "PERMISSION_DENIED",
        RATE_LIMITED: "RATE_LIMITED",
        FILE_SYSTEM_ERROR: "FILE_SYSTEM_ERROR",
        UNKNOWN_ERROR: "UNKNOWN_ERROR"
    }),
    v = 864e5,
    p = function() {
        function p(t, i) {
            e(this, p), this.timestamp = Date.now(), this.configure(t, i)
        }
        return t(p, [{
            key: "configure",
            value: function(e, t) {
                this._offlineBin && (s.unwatchFile(this._offlineBin), delete this._offlineBin), this.config = e, this.workstation = t, this.online = null, this.resetState()
            }
        }, {
            key: "start",
            value: function() {
                var e, t, i = this;
                l.system.debug("Starting offline subsystem monitoring."), this._offlineBin = this.config.offline, s.watchFile(this._offlineBin, {
                    persistent: !1,
                    interval: 1e3
                }, this.updateOfflineBundle.bind(this)), s.stat(this.config.offline, function(e, t) {
                    e ? l.user.info(e, "Offline bundle not available.") : t && i.updateOfflineBundle(t, t)
                }), e = this.renewLicenses.bind(this), setInterval(e, u), setTimeout(e, 1e4), t = this.checkTimestamp.bind(this), setInterval(t, d), setTimeout(t, 1e4), setInterval(this.updateState.bind(this), 1e3)
            }
        }, {
            key: "resetState",
            value: function() {
                l.user.trace("Resetting offline subsystem cached state."), a.clearSessions("offline"), this.bundle = null, this.bundleVerified = !1, this.state = {
                    enabled: !1,
                    available: !1,
                    user: null,
                    site: null,
                    expiryDate: null,
                    renew: !1,
                    licenses: [],
                    sessions: {},
                    total: {}
                }, this.removeDanglingTimeout = null
            }
        }, {
            key: "getState",
            value: function(e) {
                this.renderState(), e(null, this.state)
            }
        }, {
            key: "updateState",
            value: function() {
                var e = this;
                l.user.trace("Updating offline subsystem state.");
                try {
                    this.state.enabled = !!this.bundle, this.bundle && !r.status() && (l.user.trace("Applying offline bundle."), r.setBuffer(new Buffer(this.bundle.code, "base64"))), n.get(this.bundle, "site.offline") && (!this.bundleVerified && n.get(this.online, "state.available") ? this.online.getState(function(t, i) {
                        return t ? void l.user.error({
                            err: t
                        }, "Failed to update offline subsystem state.") : void(n.has(e.bundle, "site.offline.expiryDate") && n.get(e.bundle, "site.offline.expiryDate") == n.get(i, "site.offline.expiryDate") ? (e.bundleVerified = !0, e.renderState(), clearTimeout(e.removeDanglingTimeout), e.removeDanglingTimeout = null) : e.removeDanglingTimeout ? e.renderState() : e.removeDanglingTimeout = setTimeout(function() {
                            l.user.warn("Dangling offline bundle detected."), e.releaseLicenses()
                        }, 1e4))
                    }) : this.renderState())
                } catch (t) {
                    l.user.error({
                        err: t
                    }, "Failed to update offline subsystem state."), this.releaseLicenses(function(e) {
                        e && l.user.error({
                            err: e
                        }, "Failed to release licenses.")
                    })
                }
            }
        }, {
            key: "renderState",
            value: function() {
                var e, t, i, s, n, a, l, o, u, f, d, c;
                if (this.bundle) {
                    this.state.user = this.bundle.user, this.state.site = this.bundle.site, this.state.expiryDate = new Date(this.bundle.site.offline.expiryDate), this.state.licenses = [];
                    for (e in this.bundle.site.offline.products) this.state.licenses.push(this.bundle.site.offline.products[e]);
                    this.state.renew = this.bundle.site.offline.renew || !1, this.state.available = new Date(this.bundle.site.offline.expiryDate) > Date.now(), r.clearInactiveSessions(), t = r.listSessions(), i = t.sessions;
                    for (s in i) {
                        for (n = i[s], a = n.appid, delete n.appid, n.productId = a, l = [1, 2, 4], o = 0; o < l.length; o++) u = l[o], n[u] = n.amount[u] || 0;
                        delete n.amount, n.sessionId = s, n.lastAccess = Math.round((Date.now() - n.datenow) / 1e3)
                    }
                    this.state.sessions = i, f = t.total;
                    for (d in f) f[d].productId = parseInt(d, 10), f[d] = [f[d]];
                    this.state.total = f, c = this.getExpiringLicenses(Date.now() + v), null != c && c.length > 0 && (this.state.notifications = {
                        expiringOffline: {
                            expiration: c
                        }
                    })
                } else this.resetState()
            }
        }, {
            key: "canHandleRequest",
            value: function() {
                return this.state.enabled && this.state.available
            }
        }, {
            key: "handleRequest",
            value: function(e, t) {
                var i, s, n, a, o, u, f;
                l.user.trace("Offline subsystem handling license request.");
                try {
                    i = !!e.headers.via, s = r.handleRequest(e.url, i), n = parseInt(s.slice(c, c + 3), 10), n ? (l.user.trace({
                        statusCode: n
                    }, "Offline subsystem handled license request."), o = s.indexOf("X-Tag: ") + 7, u = s.match(h), f = u && u.length > 1 ? u[1] : "", t(n, s.slice(s.indexOf("<html>")), s.slice(o, o + 32), f.toLowerCase())) : (a = Error("Offline subsystem failed to handle license request."), l.user.error({
                        err: a
                    }, "Offline subsystem failed to handle license request."), t(500, a))
                } catch (d) {
                    l.user.error({
                        err: d
                    }, "Offline subsystem failed to handle license request."), t(500, d.message)
                }
            }
        }, {
            key: "getTotal",
            value: function(e) {
                var t, i, s, n, r, a, l, u, f, d, c, h, b = {};
                if (this.state.enabled && this.state.available) {
                    t = !0, i = !1, s = void 0;
                    try {
                        for (n = o.toUnique(e, this.state.licenses)[Symbol.iterator](); !(t = (r = n.next()).done); t = !0) {
                            a = r.value, b[a] = {
                                1: 0,
                                2: 0,
                                4: 0
                            }, l = !0, u = !1, f = void 0;
                            try {
                                for (d = this.state.licenses[Symbol.iterator](); !(l = (c = d.next()).done); l = !0) h = c.value, a == h.productId && o.addAmounts(b[a], h)
                            } catch (v) {
                                u = !0, f = v
                            } finally {
                                try {
                                    !l && d["return"] && d["return"]()
                                } finally {
                                    if (u) throw f
                                }
                            }
                        }
                    } catch (v) {
                        i = !0, s = v
                    } finally {
                        try {
                            !t && n["return"] && n["return"]()
                        } finally {
                            if (i) throw s
                        }
                    }
                }
                return b
            }
        }, {
            key: "getTotalDetails",
            value: function(e) {
                var t = this;
                return this.state.enabled && this.state.available ? this.state.licenses.filter(function(t) {
                    return t.productId == e
                }).map(function(e) {
                    var i = Object.assign({}, e);
                    return delete i.productId, delete i.productLabel, delete i.defaultLicenseType, i.details = {
                        keep: t.state.renew
                    }, i.expiryDate = t.state.expiryDate.valueOf(), i
                }).sort(function(e, t) {
                    return e.expiryDate < t.expiryDate
                }) : []
            }
        }, {
            key: "getEngaged",
            value: function(e) {
                var t, i, s, n, r, a, l, u = {};
                if (this.state.enabled && this.state.available) {
                    t = !0, i = !1, s = void 0;
                    try {
                        for (n = o.toUnique(e, this.state.licenses)[Symbol.iterator](); !(t = (r = n.next()).done); t = !0) a = r.value, l = this.state.total[a], l ? u[a] = l[0] : u[a] = {
                            1: 0,
                            2: 0,
                            4: 0
                        }
                    } catch (f) {
                        i = !0, s = f
                    } finally {
                        try {
                            !t && n["return"] && n["return"]()
                        } finally {
                            if (i) throw s
                        }
                    }
                }
                return u
            }
        }, {
            key: "getEngagedDetails",
            value: function(e) {
                var t, i, s = [];
                if (this.state.enabled && this.state.available && this.state.sessions)
                    for (t in this.state.sessions) i = this.state.sessions[t], i.productId == e && s.push({
                        1: i[1],
                        2: i[2],
                        4: i[4],
                        mode: "session",
                        details: {
                            ip: i.ip,
                            location: this.state.site.name,
                            lastActive: i.lastAccess
                        }
                    });
                return s
            }
        }, {
            key: "getProductLabels",
            value: function(e) {
                var t, i, s, n, r, a, l = this,
                    u = {};
                if (this.state.enabled && this.state.available) {
                    t = !0, i = !1, s = void 0;
                    try {
                        for (n = function() {
                                var e = a.value,
                                    t = l.state.licenses.find(function(t) {
                                        return t.productId == e
                                    });
                                t && (u[e] = t.productLabel)
                            }, r = o.toUnique(e, this.state.licenses)[Symbol.iterator](); !(t = (a = r.next()).done); t = !0) n()
                    } catch (f) {
                        i = !0, s = f
                    } finally {
                        try {
                            !t && r["return"] && r["return"]()
                        } finally {
                            if (i) throw s
                        }
                    }
                }
                return u
            }
        }, {
            key: "updateOfflineBundle",
            value: function(e, t) {
                var i = this;
                if (l.user.trace("Offline bundle changed."), r.status() && r.clearBuffer(), e.ino > 0)
                    if (e.size > 0 && e.birthtime < new Date && e.birthtime >= t.birthtime) {
                        if (!n.get(this.online, "auth.ok")) return l.user.trace("Deactivated license server detected, releasing offline bundle."), void this.release();
                        this.loadOfflineBundle(function(e, t) {
                            e ? i.release() : (i.bundle = t, i.bundleVerified = !1, i.updateState())
                        })
                    } else l.user.trace("Invalid offline bundle change, releasing."), this.release();
                else l.user.trace("Offline bundle not present, resetting."), this.resetState()
            }
        }, {
            key: "loadOfflineBundle",
            value: function(e) {
                var t = this;
                l.user.trace("Loading offline bundle."), s.readFile(this.config.offline, function(s, n) {
                    var r, a, o;
                    if (s) l.user.error({
                        err: s
                    }, "Failed to load offline bundle."), e(s);
                    else try {
                        r = i.privateDecrypt({
                            key: t.workstation.key,
                            passphrase: t.workstation.machineId
                        }, n.slice(0, 256)), a = i.createDecipher("aes-256-cbc", r), o = JSON.parse("" + Buffer.concat([a.update(n.slice(256)), a["final"]()])), l.user.trace("Offline bundle loaded."), e(null, o)
                    } catch (u) {
                        l.user.error({
                            err: u
                        }, "Failed to load offline bundle."), e(u)
                    }
                })
            }
        }, {
            key: "checkTimestamp",
            value: function() {
                var e = Date.now();
                this.bundle && e < this.timestamp && (l.user.warn("Offline bundle corrupted."), this.release()), this.timestamp = e
            }
        }, {
            key: "reserveLicenses",
            value: function(e, t) {
                var i = this;
                l.user.debug({
                    products: e
                }, "Sending borrow request."), e.version = r.version, this.online.auth.request("/offline/reserve", {
                    json: e,
                    method: "POST",
                    encoding: null
                }, function(e, n, r) {
                    var a, o;
                    if (n && 200 == n.statusCode && r) l.user.debug("Borrow request succeeded, saving offline bundle."), a = s.createWriteStream(i.config.offline, {
                        mode: "0600"
                    }), a.once("finish", function() {
                        l.user.info("Offline bundle saved."), t()
                    }), a.once("error", function(e) {
                        l.user.error({
                            err: e
                        }, "Failed to save offline bundle."), i.release(), t(e, b.FILE_SYSTEM_ERROR)
                    }), a.end(r);
                    else if (e || 200 != n.statusCode)
                        if (o = e || Error("Borrow request failed with error " + n.statusCode), l.user.error({
                                err: o
                            }, "Failed to request offline bundle."), n) switch (n.statusCode) {
                            case 403:
                                t(o, b.PERMISSION_DENIED);
                                break;
                            case 429:
                                t(o, b.RATE_LIMITED);
                                break;
                            default:
                                t(o, b.UNKNOWN_ERROR)
                        } else t(o, b.UNKNOWN_ERROR)
                })
            }
        }, {
            key: "releaseLicenses",
            value: function() {
                var e = this,
                    t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : function() {};
                l.user.debug("Sending release request."), this.online.auth.request("/offline/release", {
                    method: "POST"
                }, function(i, s) {
                    if (s && 200 == s.statusCode) l.user.debug("Borrowed offline licenses released."), e.release(), t();
                    else if (i || 200 != s.statusCode) {
                        var n = i || Error("Release request failed with error " + s.statusCode);
                        l.user.error({
                            err: n
                        }, "Failed to release offline bundle."), t(n)
                    }
                })
            }
        }, {
            key: "renewLicenses",
            value: function() {
                var e, t, i, s;
                if (this.bundle && this.bundle.site.offline.renew && (e = this.state.expiryDate.getTime(), t = Date.now(), e - t < f)) {
                    i = {};
                    for (s in this.bundle.site.offline.products) i[s] = this.bundle.site.offline.products[s];
                    i.renew = this.state.renew || !1, l.user.info("Borrowed licenses about to expire, renewing."), this.reserveLicenses(i, function(e) {
                        e ? l.user.error({
                            err: e
                        }, "Failed to renew borrowed licenses.") : l.user.info("Successfully renewed borrowed licenses.")
                    })
                }
            }
        }, {
            key: "release",
            value: function() {
                this.bundle = null, l.user.trace("Deleting offline bundle."), s.unlink(this.config.offline, function(e) {
                    e ? l.user.trace({
                        err: e
                    }, "Failed to delete offline bundle.") : l.user.trace({
                        err: e
                    }, "Deleted offline bundle.")
                })
            }
        }, {
            key: "getExpiringLicenses",
            value: function(e) {
                var t = this;
                return this.state.expiryDate < e && !this.state.renew ? this.state.licenses.map(function(e) {
                    return {
                        productLabel: e.productLabel,
                        expiryDate: t.state.expiryDate
                    }
                }).sort(function(e, t) {
                    return e.expiryDate < t.expiryDate
                }) : []
            }
        }]), p
    }();
module.exports = p, module.exports.BORROW_RESULT = b;
