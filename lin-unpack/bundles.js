"use strict";

function e(e, t) {
    if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
}
var t = function() {
        function e(e, t) {
            var n, r;
            for (n = 0; n < t.length; n++) r = t[n], r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(e, r.key, r)
        }
        return function(t, n, r) {
            return n && e(t.prototype, n), r && e(t, r), t
        }
    }(),
    n = require("async"),
    r = require("crypto"),
    s = require("fs"),
    a = require("ols-logger").FLP,
    l = "other",
    o = require("./defaultBundles.js"),
    i = r.createHash("sha1").update(JSON.stringify(o)).digest().toString("hex"),
    u = require("./handlers/transforms"),
    d = function() {
        function d(t, n) {
            e(this, d), this.config = t, this.handlers = n, this.bundles = o, this.hash = i;
            var r = this.update.bind(this);
            setInterval(r, 36e5), setTimeout(r, 1e4)
        }
        return t(d, [{
            key: "list",
            value: function(e, t) {
                var n, r, s, a = e.params.source,
                    o = this.getTotalValues(null, a),
                    i = Object.keys(o).map(function(e) {
                        return parseInt(e, 10)
                    }),
                    u = this.getProductLabels(i),
                    d = {};
                for (n in this.bundles) r = this.filterBundle(n, i), r.products && (d[n] = r, d[n].labels = r.products.map(function(e) {
                    return u[e]
                }));
                s = this.filterNonBundledProducts(i), s && (d[l] = {
                    label: "Other Products",
                    products: s
                }), t.json(d)
            }
        }, {
            key: "summary",
            value: function(e, t) {
                var r, s, o, i = this,
                    d = e.params.source,
                    h = e.params.bundleId;
                if (this.bundles[h] || h == l) {
                    r = {};
                    for (s in this.handlers) o = this.handlers[s], r[s] = o.getState.bind(o);
                    n.parallel(r, function(n) {
                        var r, s, o, c, f, g, b, p, y, v, m, P, S;
                        if (n) t.status(500).send(n), a.system.warn(n, "Could not read component state.");
                        else if (r = i.getTotalValues(null, d), s = Object.keys(r).map(function(e) {
                                return parseInt(e, 10)
                            }), s = h == l ? i.filterNonBundledProducts(s) : i.filterBundle(e.params.bundleId, s).products, o = h == l ? "Other Products" : i.bundles[h].label, c = h == l ? "" : i.bundles[h].version, s) {
                            f = {
                                bundleId: h,
                                label: o,
                                version: c,
                                products: s,
                                productLabels: i.getProductLabels(s, d),
                                total: i.getTotalValues(s, d),
                                engaged: i.getEngagedValues(s, d),
                                free: {}
                            }, g = !0, b = !1, p = void 0;
                            try {
                                for (y = s[Symbol.iterator](); !(g = (v = y.next()).done); g = !0) m = v.value, P = {
                                    1: 0,
                                    2: 0,
                                    4: 0
                                }, u.addAmounts(P, f.total[m]), u.subtractAmounts(P, f.engaged[m]), f.free[m] = P
                            } catch (n) {
                                b = !0, p = n
                            } finally {
                                try {
                                    !g && y["return"] && y["return"]()
                                } finally {
                                    if (b) throw p
                                }
                            }
                            t.json(f)
                        } else S = {
                            bundleId: h,
                            label: o,
                            version: c,
                            products: [],
                            productLabels: {},
                            total: {},
                            engaged: {},
                            free: {}
                        }, t.json(S)
                    })
                } else t.sendStatus(404)
            }
        }, {
            key: "getTotalValues",
            value: function(e, t) {
                var n, r = {};
                for (n in this.handlers) t ? n == t ? u.addProductMaps(r, this.handlers[n].getTotal(e)) : "borrow" != t || "online" != n && "offline" != n || u.addProductMaps(r, this.handlers[n].getTotal(e)) : u.addProductMaps(r, this.handlers[n].getTotal(e));
                return r
            }
        }, {
            key: "getEngagedValues",
            value: function(e, t) {
                var n, r = {};
                for (n in this.handlers) t ? n == t ? u.addProductMaps(r, this.handlers[n].getEngaged(e)) : "borrow" != t || "online" != n && "offline" != n || u.addProductMaps(r, this.handlers[n].getEngaged(e)) : u.addProductMaps(r, this.handlers[n].getEngaged(e));
                return r
            }
        }, {
            key: "getProductLabels",
            value: function(e) {
                var t, n, r, s, a, l, o = {},
                    i = this.handlers.online.getProductLabels(e),
                    u = this.handlers.offline.getProductLabels(e),
                    d = this.handlers.dongle.getProductLabels(e);
                if (e) {
                    t = !0, n = !1, r = void 0;
                    try {
                        for (s = e[Symbol.iterator](); !(t = (a = s.next()).done); t = !0) l = a.value, o[l] = i[l] || u[l] || d[l] || "Unknown Product 0x" + l.toString(16)
                    } catch (h) {
                        n = !0, r = h
                    } finally {
                        try {
                            !t && s["return"] && s["return"]()
                        } finally {
                            if (n) throw r
                        }
                    }
                }
                return o
            }
        }, {
            key: "filterBundle",
            value: function(e, t) {
                var n, r, s, a = this.bundles[e],
                    l = {
                        label: a.label,
                        products: [],
                        version: a.version
                    };
                for (n in a.products) {
                    if (r = a.products[n], s = r.filter(function(e) {
                            return t.indexOf(e) >= 0
                        }), !(s.length > 0)) return {
                        label: a.label,
                        version: a.version,
                        products: null
                    };
                    l.products = l.products.concat(s)
                }
                return l.products.sort(function(e, t) {
                    return e > t
                }), l
            }
        }, {
            key: "filterNonBundledProducts",
            value: function(e) {
                var t, n, r, s, a, l, o, i, u = new Set,
                    d = !0,
                    h = !1,
                    c = void 0;
                try {
                    for (t = e[Symbol.iterator](); !(d = (n = t.next()).done); d = !0) {
                        r = n.value, s = !1;
                        for (a in this.bundles) {
                            if (s) break;
                            l = this.bundles[a];
                            for (o in l.products)
                                if (i = l.products[o], i.indexOf(r) >= 0 && this.filterBundle(a, e).products) {
                                    s = !0;
                                    break
                                }
                        }
                        s || u.add(r)
                    }
                } catch (f) {
                    h = !0, c = f
                } finally {
                    try {
                        !d && t["return"] && t["return"]()
                    } finally {
                        if (h) throw c
                    }
                }
                return u.size > 0 ? Array.from(u).sort(function(e, t) {
                    return e > t
                }) : null
            }
        }, {
            key: "total",
            value: function(e, t) {
                var n = e.params.productId;
                t.json({
                    online: this.handlers.online.getTotalDetails(n),
                    offline: this.handlers.offline.getTotalDetails(n),
                    dongle: this.handlers.dongle.getTotalDetails(n)
                })
            }
        }, {
            key: "engaged",
            value: function(e, t) {
                var n = this,
                    r = e.params.productId;
                this.handlers.online.getEngagedDetails(r, function(e, s) {
                    e ? t.sendStatus(500) : t.json({
                        online: s,
                        offline: n.handlers.offline.getEngagedDetails(r),
                        dongle: n.handlers.dongle.getEngagedDetails(r)
                    })
                })
            }
        }, {
            key: "free",
            value: function(e, t) {
                var n, r, s, a = e.params.productId,
                    l = {
                        online: {},
                        offline: {},
                        dongle: {}
                    };
                for (n in l) r = this.handlers[n], s = [a], u.addProductMaps(l[n], r.getTotal(s)), u.subtractProductMaps(l[n], r.getEngaged(s)), l[n] = l[n][a] || {};
                t.json(l)
            }
        }, {
            key: "update",
            value: function() {
                var e, t = this;
                try {
                    s.existsSync(this.config.bundlePath) && s.writeFileSync(this.config.bundlePath, JSON.stringify(this.bundles)), e = s.readFileSync(this.config.bundlePath, "ascii"), this.bundles = JSON.parse(e), this.hash = r.createHash("sha1").update(e).digest().toString("hex")
                } catch (n) {
                    a.system.info({
                        err: n
                    }, "bundle.json not found."), this.bundles = o, this.hash = i
                }
                this.handlers.online.auth.request("/bundleUpdate/" + this.hash, {}, function(e, n, l) {
                    if (!e && 200 == n.statusCode) try {
                        s.writeFileSync(t.config.bundlePath, l), t.bundles = JSON.parse(l), t.hash = r.createHash("sha1").update(l).digest().toString("hex")
                    } catch (u) {
                        a.system.warn({
                            err: u
                        }, "Failed to update product bundles."), t.bundles = o, t.hash = i
                    }
                })
            }
        }]), d
    }();
module.exports = d;
