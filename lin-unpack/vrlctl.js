"use strict";

function e(e, o) {
    console.log("Command:", e, o.params), console.log("\t", o.description), o.detailed && console.log("\t", o.detailed)
}

function o() {
    y.online[b] ? e("online " + b, y.online[b]) : (console.log("\nThe online commands provide a way to enable, disable and monitor online licensing settings of this license server.\n"), console.log('To enable online licensing, follow these steps: \n\t1. Type "vrlctl online getcsr" to save an online licensing request file (cert.csr) in the current directory\n\t2. Visit "https://my.chaosgroup.com" and follow the instructions to obtain an online licensing key file (cert.crt)\n\t3. Type "vrlctl online enable" to enable online licensing using cert.crt from the current directory\n'), console.log("Other online commands:"), ["disable", "status"].map(function(e) {
        console.log("\t-", e, "\t=>", y.online[e].description)
    }))
}

function n() {
    console.log("The diagnostics command helps you get the diagnostic bundle that could help ChaosGroup's support team investigate problems you might run into.\n"), console.log("Usage:\tvrlctl diagnostics get [<save_path>]\n\tDownload the diagnostic bundle. If <save_path> is provided, the diagnostic bundle will be saved in the given directory.")
}

function t() {
    console.log("The config command allows you to get or set different configuration variables of the V-Ray Online Licensing Server\n"), console.log("The available subcommands are:\n"), e("config get", y.config.get), e("config set", y.config.set)
}

function r(e) {
    return u.code[e.errno] ? u.code[e.errno].description : e.message
}

function i(e, o, n) {
    (e || 200 !== o.statusCode) && (o ? console.log("> ERROR:(" + o.statusCode + ")", e) : console.log("> ERROR", e));
    try {
        n = JSON.parse(n), console.log(s(n))
    } catch (t) {
        console.log(n)
    }
}

function s(e, o) {
    var n, t;
    void 0 == o && (o = 0), n = "";
    for (t in e) e.hasOwnProperty(t) && (0 != o || "file" != t && "readonly" != t) && (1 != o || "size" != t && "logFile" != t) && ("object" == S(e[t]) ? (n += "\t".repeat(o) + t + ":\n", n += s(e[t], o + 1)) : n += "\t".repeat(o) + t + ": " + JSON.stringify(e[t]) + "\n");
    return n
}

function l(e) {
    return Number.isFinite(e) ? Math.floor(Math.max(+e, 0)) : 0
}

function a(e, o, n, t) {
    var r = n ? " while " + n : "";
    return o && o.body && (o.body = "" + new Buffer(o.body)), e || 200 !== o.statusCode ? (o ? console.log("> ERROR:", r + " (" + o.statusCode + ")", o.body || o.statusMessage) : console.log("ERROR", r, e), 403 != o.statusCode && console.log('Try the "vrlctl online status" command to check if the server is reachable'), !0) : (t ? t(o) : console.log("> SUCCESS: " + n), !1)
}
var c, d, u, g, p, v, f, m, b, h, y, w, O, R, S = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e) {
        return typeof e
    } : function(e) {
        return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e
    },
    C = "localhost,127.0.0.1",
    q = 5,
    _ = 6;
if (process.env.NO_PROXY ? process.env.NO_PROXY += "," + C : process.env.NO_PROXY = C, c = require("lodash"), d = require("minimist")(process.argv.slice(2)), u = require("errno"), g = require("fs"), p = require("os"), v = require("path"), f = require("./lib/vrlctl"), m = d._[0], b = d._[1], h = {
        online: {
            description: "Get help about the activation workflow",
            params: ""
        },
        diagnostics: {
            description: "Download diagnostics bundle",
            detailed: 'Specify "path" for custom download location',
            params: "[" + p.tmpdir() + "]"
        },
        config: {
            description: "Get/Set Licensing Server configuration parameters",
            detailed: 'Specify "get" without parameter name to obtain all configuration',
            params: "[set|get] <parameter> <value>"
        },
        dongle: {
            description: "Enable/Disable Dongle Server",
            detailed: "",
            params: "[enable|disable|port]"
        }
    }, y = {
        online: {
            getcsr: {
                description: "Downloads licensing request file for offline activation",
                params: "[<output_dir>]"
            },
            login: {
                description: "Enables online licensing for this license server using a username and password",
                params: "<username> <password> [--retries=0]"
            },
            enable: {
                description: "Enables online licensing for this license server using a CRT file downloaded from portal",
                params: "</path/to/cert.crt>"
            },
            disable: {
                description: "Disables online licensing for this license server",
                params: ""
            },
            status: {
                description: "Displays information about online licensing status",
                params: ""
            }
        },
        config: {
            get: {
                description: "Get the complete license server configuration.",
                params: ""
            },
            set: {
                description: 'Set the value of a specific configuration option. The configuration option consists of all the\nconfiguration node that lead to it connected with a . (dot) (e.g. proxy.host, diagnostics.level).\nThe value must be surrounded with " (quotation marks)',
                params: '<configuration_option> "<new_value>"'
            }
        },
        dongle: {
            enable: {
                description: "Enables the dongle server.",
                params: ""
            },
            disable: {
                description: "Disables the dongle server.",
                params: ""
            },
            port: {
                description: 'Gets / Sets the Dongle server port.\n\t If called without "port" - returns the port number of the dongle server.\n\t If "port" is given - sets the dongle server to that port.',
                params: "[port]"
            }
        }
    }, w = {}, O = {
        config: {},
        online: {},
        diagnostics: {},
        dongle: {}
    }, w.config = function() {
        var e = d._[2],
            o = d._[3];
        return O.config[b] ? O.config[b](e, o) : t()
    }, w.browser = function() {
        f.openBrowser({
            pathname: "/",
            hash: "/firstRun"
        });
        var e = "win32" == process.platform ? ".bat" : "";
        console.log('The V-Ray Online License Server is now installed. Please run "' + v.resolve(v.dirname(module.filename)) + "/vrlctl" + e + ' help" to start using it"')
    }, w.online = function() {
        b && "help" !== b ? O.online.hasOwnProperty(b) ? O.online[b]() : (console.warn('Invalid online command "' + b + '". Available commands:'), Object.keys(y.online).map(function(o) {
            e("online " + o, y.online[o])
        })) : o()
    }, w.dongle = function() {
        var o = d._[1],
            n = d._.slice(2);
        return O.dongle.hasOwnProperty(o) ? void O.dongle[o].apply(null, n) : (console.warn('Invalid dongle command "' + b + '". Available commands:'), void Object.keys(y.dongle).map(function(o) {
            e("dongle " + o, y.dongle[o])
        }))
    }, O.online.getcsr = function() {
        return f.requestGet("/csr", function(e, o, n) {
            var t, r;
            a(e, o, "downloading CSR") || (t = d._[2] || p.tmpdir(), r = v.join(t, "cert.csr"), g.writeFile(r, n, function(e) {
                return e ? console.log(e, "\n") : (console.log("Downloaded licensing request file for offline activation:", r, "\n"), console.log('Please visit "https://my.chaosgroup.com" and upload this file to get the certificate\n'))
            }))
        })
    }, O.online.login = function() {
        var e = d._[2],
            o = d._[3],
            n = l(d.retries),
            t = 500,
            i = function s(n) {
                return n < 1 ? process.exit(_) : f.requestPostPromise("/activate", !1, {
                    username: e,
                    password: o,
                    cli: !0
                }).then(function(e) {
                    var o = e.response;
                    o && "Invalid username or password" === o.body && (console.error("ERROR: Invalid username or password"), process.exit(q)), o && 200 !== o.statusCode && 409 !== o.statusCode && (console.error("ERROR:", e.body), setTimeout(function() {
                        return s(n - 1)
                    }, t))
                }, function(e) {
                    1 === n && (console.error("ERROR:", r(e)), process.exit("ECONNREFUSED" === e.errno ? _ : 1)), console.log("Retrying..."), s(n - 1)
                })
            };
        return e && o ? void i(n + 1) : void console.error("Error: provide username and password")
    }, O.online.enable = function() {
        var e, o = d._[2];
        if (o) {
            try {
                e = g.readFileSync(o)
            } catch (n) {
                return console.error("Error while trying to load a .crt file:", n.message), console.log("\nPlease specify a valid path to .crt file."), console.log('For more information on usage type "vrlctl online"')
            }
            return f.requestPostBinary("/crt", e, function(e, o) {
                !e && [200, 302].indexOf(o.statusCode) >= 0 ? console.log("License server activated.") : a(e, o, "activating site: ")
            })
        }
        return console.log('Error: missing parameter "crt". Please specify path to the downloaded certificate')
    }, O.online.disable = function() {
        return f.requestPost("/deactivate", !1, !1, i)
    }, O.online.status = function() {
        f.requestGet("/status", c.bind(a, void 0, c, c, "getting status", function(e) {
            e.body = JSON.parse(e.body), console.log("\nChaosGroup Online licensing server v." + e.body.version), console.log("Online licensing is", e.body.online.available ? "available" : "unavailable")
        }))
    }, O.dongle.enable = function() {
        f.requestGet("/status", c.bind(a, void 0, c, c, "getting status", function(e) {
            var o = void 0;
            try {
                o = JSON.parse(e.body)
            } catch (n) {
                return void console.error("Could not parse license server response:\t", "" + n.stack)
            }
            return o.dongle.enabled === !0 ? void console.log("Dongle server is already running - exiting.") : void f._request.post("/dongle/enable", {
                timeout: 5e3
            }, function(e, o) {
                if (e) return void console.error("Could not enable dongle server:\t", r(e));
                if (200 !== o.statusCode) return void console.error("Could not enable dongle server:\t", o.body);
                console.log("[SUCCESS]\tDongle server enabled successfully."), console.log("Testing dongle availability...");
                var n = function() {
                    return f._request.get("/status", {
                        timeout: 5e3
                    }, c.bind(a, void 0, c, c, "getting status", function(e) {
                        var o, n = void 0;
                        try {
                            n = JSON.parse(e.body)
                        } catch (t) {
                            return void console.error("Could not parse license server status", r(t))
                        }
                        n.dongle.available ? (o = Object.keys(n.dongle.dongles).length, console.log("[OK]\tDongle server running - Found", o, 1 === o ? "dongle." : "dongles.")) : console.warn("Dongle unavailable - Please make sure that you have inserted your", "dongle and that you have installed the correct WIBU drivers.")
                    }))
                };
                setTimeout(n, 1e3)
            })
        }))
    }, O.dongle.disable = function() {
        f.requestGet("/status", function(e, o, n) {
            if (e) return void console.error("License server responded badly:\t", r(e));
            var t = JSON.parse(n);
            return t.dongle.enabled === !1 ? void console.log("Dongle server is not currently running - exiting.") : void f._request.post("/dongle/disable", {
                timeout: 5e3
            }, function(e) {
                e ? console.error("Could not disable dongle server:\t", r(e)) : console.log("Dongle server disabled successfully.")
            })
        })
    }, O.dongle.port = function(e) {
        if (e) {
            var o = function() {
                var o = +e;
                return !Number.isFinite(o) || e < 1 || (0 | e) !== e ? (console.error("ERROR:\t", '"' + e + '"', "is not a valid port number"), {
                    v: void 0
                }) : void f._request.get("/config", c.bind(a, void 0, c, c, "getting status", function(e) {
                    var n = void 0;
                    try {
                        n = JSON.parse(e.body)
                    } catch (t) {
                        return void console.error("Could not parse license server config:\t", t)
                    }
                    return n.local.vrlPort === o ? void console.log("Dongle server port is already", o) : o === n.local.vrolPort ? void console.log("Dongle server port be the same as the license server port") : (n.local.vrlPort = o, void f._request.post("/config", function(e) {
                        return e ? void console.error("Could not save License server config:\t", r(e)) : void console.log("Dongle server port changed successfully.")
                    }))
                }))
            }();
            if ("object" === (void 0 === o ? "undefined" : S(o))) return o.v
        } else console.log("Dongle server port is:", f.getDongleServerPort())
    }, O.config.get = function() {
        return f.requestGet("/config", i)
    }, O.config.set = function(e, o) {
        return e && "" != e && o && "" != o ? f.requestGet("/config", c.bind(a, void 0, c, c, "getting status", function(n) {
            return n.body = JSON.parse(n.body), c.has(n.body, e) ? (c.set(n.body, e, o), f.requestPost("/config", void 0, n.body, function(e) {
                return e ? console.log("Unable to update the configuration") : console.log("Configuration updated")
            })) : console.log("Error: Invalid parameter")
        })) : (console.log("Error: Missing parameter name and/or it's value"), t())
    }, w.diagnostics = function() {
        if ("get" == b) {
            var e = function(e) {
                console.log("\nDownloaded diagnostics bundle to:", e)
            };
            return f.requestGet("/logs/download", function(o, n, t) {
                var r, i, s, l = p.tmpdir();
                return d._[2] && (l = v.resolve("./", d._[2])), r = v.join(l, "diagnostics.zip"), o || n && 200 != n.statusCode ? (i = f.getLogs(), s = g.createWriteStream(r), s.on("end", function() {
                    e(r)
                }), void i.pipe(s)) : void g.writeFile(r, t, function(o) {
                    return o ? console.log(o) : e(r)
                })
            })
        }
        return n()
    }, d.ols_home ? f.createConf(d.ols_home) : f.createConf(), m && !w[m] && (console.warn("=> Invalid command: " + m + "\n"), m = !1), !m || "help" === m) {
    console.log("V-Ray Online Licensing Server controller\n"), console.log("Usage: ", "vrlctl <command>\n"), console.log("Available commands: ");
    for (R in h) console.log("\t-", R, "\t=>", h[R].description);
    console.log("\nType `vrlctl online help` to get help about the activation workflow"), console.log("Type `vrlctl <command> help` to get more information about the utility commands"), process.exit(9)
}
w.hasOwnProperty(m) ? w[m]() : console.warn("\n=> Command " + m + " not implemented");
