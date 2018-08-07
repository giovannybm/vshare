"use strict";function e(e,r){if(!(e instanceof r))throw new TypeError("Cannot call a class as a function")}var r,t=function(){function e(e,r){var t,o;for(t=0;t<r.length;t++)o=r[t],o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}return function(r,t,o){return t&&e(r.prototype,t),o&&e(r,o),r}}(),o=require("constants"),n=require("https"),s=require("url"),i=require("request"),u=require("proxydetect"),c=require("ols-logger").FLP,a=15e3,l=new n.Agent({keepAlive:!0,maxSockets:5,maxFreeSockets:1,keepAliveMsecs:1e4}),f=function(){};l.on("free",function(e){e.removeListener("error",f),e.once("error",f)}),r=function(){function r(t,o){e(this,r),this.config=t,this.workstation=o,this.blpUrl=null,this.configure(t)}return t(r,[{key:"start",value:function(e){this.getAddressInfo(function(r){r&&c.user.warn({err:r},"Could not connect."),e(r)})}},{key:"getProxy",value:function(){var e=this;return new Promise(function(r,t){u.getProxyFor(e.config.backend,function(e,o){e?t(e):r(o)})})}},{key:"tryProxy",value:function(e){var r=this;return new Promise(function(t,o){i.get(r.config.backend,{proxy:e,ca:r.config.ssl.ca,timeout:a}).on("response",function(){return t()}).on("error",function(e){return o(e)})})}},{key:"resolveProxy",value:function(e){var t=this;return new Promise(function(o){"http"===e.proxy.type||"https"===e.proxy.type?o(t.config.getProxy()):"auto"===e.proxy.type?t.getProxy().then(function(e){var n=r._parseProxyStr(e);n&&n.hostname&&n.port?n.protocol?o(t.config.proxy.username&&t.config.proxy.password?n.protocol+"//"+t.config.proxy.username+":"+t.config.proxy.password+"@"+n.hostname+":"+n.port:e):!function(){var r=e;t.config.proxy.username&&t.config.proxy.password&&(r=t.config.proxy.username+":"+t.config.proxy.password+"@"+r),t.tryProxy("http://"+r).then(function(){o("http://"+r)})["catch"](function(){t.tryProxy("https://"+r).then(function(){return o("https://"+r)})["catch"](function(e){c.system.warn({err:e},"Could not detect proxy transport protocol:"),o(null)})})}():o(null)})["catch"](function(e){return o(null)}):o(null)})}},{key:"configure",value:function(e){var r=this;this._request=function(t,n,s){return r.resolveProxy(e).then(function(e){r.proxy=e;var u=Object.freeze({agent:l,secureOptions:o.SSL_OP_NO_SSLv2|o.SSL_OP_NO_SSLv3,ca:r.config.ssl.ca,followAllRedirects:!0,strictSSL:!0,proxy:e,timeout:a,tunnel:!!e});i.defaults(u)(t,n,s)})}}},{key:"request",value:function(e,r,t){var o,n=this,s=function(e){return function(r,t,o){(r||t.statusCode<200||t.statusCode>=400)&&(c.user.warn({err:r,res:t},"Request failed, resetting connection."),n.blpUrl=null),e(r,t,o)}},i=Object.assign({headers:{}},r);Object.assign(i.headers,{"x-flp-version":this.workstation.version,"x-flp-os":this.workstation.os});for(o in i.headers)i.headers[o]=i.headers[o].replace(/[^\x00-\x7F]/g,"");this.blpUrl?(this._updateAddressInfo(i,e),this._request(i,s(t))):this.getAddressInfo(function(r){r?t(r):(n._updateAddressInfo(i,e),n._request(i,s(t)))})}},{key:"getAddressInfo",value:function(e,r){var t=this;c.user.trace("BLP address request."),this.blpUrl=null,this._request(this.config.backend+"/address",r||{},function(r,o,n){if(r)e(r);else if(200!=o.statusCode)e(Error("BLP address request failed, status code "+o.statusCode));else try{var s=JSON.parse(n);t.config.login=s.login,t.blpUrl=s.backend,c.user.info("BLP address information.",s),c.user.info("Proxy:",t.proxy?t.proxy:"none"),e()}catch(i){c.user.warn({err:i,body:n},"Incorrect address information"),e(i)}})}},{key:"_updateAddressInfo",value:function(e,r){var t=s.parse(this.blpUrl);t.protocol=t.protocol||"https",t.protocol.lastIndexOf(":")>-1&&(t.protocol=t.protocol.substr(0,t.protocol.length-1)),t.port||("https"==t.protocol?t.port=443:t.port=80),t.pathname=r,e.host=t.hostname,e.port=t.port,e.url=s.format(t),e.servername=e.host}}],[{key:"_parseProxyStr",value:function(e){if(!e)return null;var r=void 0;return/^https?:\/\//.test(e)?r=s.parse(e):(r=s.parse("http://"+e),r.protocol=null),r}}]),r}(),module.exports=r;