"use strict";function e(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function t(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function r(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}var i=function(){function e(e,t){var r,i;for(r=0;r<t.length;r++)i=t[r],i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i)}return function(t,r,i){return r&&e(t.prototype,r),i&&e(t,i),t}}(),o=require("crypto"),n=require("events").EventEmitter,s=require("fs"),a=require("request"),c=require("ols-logger").FLP,u=require("./connection-manager"),d=function(n){function d(r,i){e(this,d);var o=t(this,(d.__proto__||Object.getPrototypeOf(d)).call(this));return o.config=r,o.workstation=i,o.connection=new u(r,i),o.ok=!1,o.inProgress=!1,o.jar=a.jar(),o}return r(d,n),i(d,[{key:"start",value:function(e){this.ok=!!this.workstation.cert,this.connection.start(e)}},{key:"activate",value:function(e,t){var r,i,o,n,s=this;c.user.debug("Activating license server."),r=e&&e.body&&e.body.cli,i=function(e,i,o){return r?t.status(e).end(i):t.redirect(o)},this.ok?(c.user.info("Workstation already activated, ignoring."),i(200,"Workstation already activated.","/")):this.inProgress?(c.user.info("Activation in progress, ignoring."),i(409,"Activation in progress, ignoring.","/")):e.query.access_token||e.body?(this.inProgress=!0,c.user.info("Access token found, activating."),n=e.body?{workstation:this.workstation.name,csr:this.workstation.csr,username:e.body.username,password:e.body.password}:{workstation:this.workstation.name,csr:this.workstation.csr,accessToken:e.query.access_token},c.user.debug(n,"Activation request form."),this.connection.request(e.body?"/activate/password":"/activate/token",{form:n,method:"POST",jar:this.jar,timeout:1e4},function(e,o,n){return s.inProgress=!1,e?"ETIMEDOUT"===e.code||"ECONNRESET"===e.code?(c.user.warn({err:e},"Activation request timed out"),i(504,e.message,"/#/error?type=activation_timeout")):(c.user.error({err:e},"Activation request failed."),i(500,e.message,"/#/500?message="+encodeURI(e.message))):o&&200!==o.statusCode?(c.user.error({err:e},"Activation request failed."),i(o.statusCode,o.body,"/#/"+o.statusCode)):(c.user.info("Activation request succeeded."),n?s._saveCertificate(n,t,!r):(s.inProgress=!0,s._pollCertificate(),t.redirect("/")))})):(o=this.config.login+"?return_to=http://"+e.headers.host+"/activate",c.user.info("No access token, redirecting to:"+o),t.redirect(o))}},{key:"offlineActivate",value:function(e,t){this.ok||this.inProgress?(c.user.info("Workstation already activated, ignoring."),t.redirect("/")):(c.user.trace("Uploading certificate."),this._saveCertificate(e,t,!1))}},{key:"deactivate",value:function(e,t){var r=this,i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:function(){};this.ok?this.request("deactivate",{jar:this.jar,method:"POST"},function(e,o,n){e||200!=o.statusCode?o&&403==o.statusCode?(c.user.warn("Force deactivating license server..."),r._deleteCertificate(t),i()):(t.status(500).send(e?e.message:n),i(e)):(c.user.info("Successfully deactivated license server."),r._deleteCertificate(t),i())}):(c.user.info("License server not activated, ignoring."),t.redirect("/"))}},{key:"getCsr",value:function(e,t){c.user.trace("Downloading CSR."),t.download(this.config.ssl.csr,"cert.csr",function(e){return e&&c.user.error({err:e},"Failed to download CSR.")})}},{key:"getCrt",value:function(e,t){c.user.trace("Downloading CRT."),t.download(this.config.ssl.crt,"cert.crt",function(e){return e&&c.user.error({err:e},"Failed to download CRT.")})}},{key:"request",value:function(e,t,r){if(this.ok){var i=Object.assign({},t);t.signature||(i.signature=this.sign("/"===e[0]?e:"/"+e)),i.headers=t.headers||{},i.headers.Authorization='OLS-AUTH certificate="'+this.workstation.base64cert+'", signature="'+i.signature+'"',this.connection.request(e,i,r)}else r(Error("Workstation not activated."))}},{key:"sign",value:function(e){return o.createSign("RSA-SHA256").update(e).sign({key:this.workstation.key,passphrase:this.workstation.machineId},"base64")}},{key:"_saveCertificate",value:function(e,t){var r,i=this,o=!(arguments.length>2&&void 0!==arguments[2])||arguments[2];c.user.debug("Saving certificate."),r=s.createWriteStream(this.config.ssl.crt,{encoding:"ascii"}),r.once("finish",function(){i.workstation.prepareCertificate(function(e){if(e){if(i.ok=!1,c.user.error(e,"Could not save certificate."),t){if(o)return void t.redirect("/#/500");t.status(500).end("Could not save certificate.")}}else if(i.ok=!0,c.user.info("Certificate saved."),i.emit("activated"),t){if(o)return void t.redirect("/");t.status(200).end("Activated.")}})}),r.once("error",function(e){i.ok=!1,c.user.error(e,"Failed to save certificate."),t&&t.sendStatus(500)}),"string"==typeof e||Buffer.isBuffer(e)?r.end(e):e.pipe(r)}},{key:"_deleteCertificate",value:function(e){c.user.debug("Deleting certificate."),s.unlink(this.config.ssl.crt,function(e){e?c.user.warn({err:e},"Failed to delete certificate."):c.user.info({err:e},"Certificate deleted.")}),delete this.workstation.cert,delete this.workstation.base64cert,this.ok=!1,this.emit("deactivated"),e.sendStatus(200)}},{key:"_pollCertificate",value:function(){var e=this;this._pollTimeout?this._pollTimeout*=1.5:this._pollTimeout=1e3,c.user.debug("Requesting certificate from BLP."),this.connection.request("certificate",{jar:this.jar,encoding:null},function(t,r,i){e.inProgress=!1,t||200!=r.statusCode?t||403!=r.statusCode?(delete e._pollTimeout,c.user.warn({err:t,res:r},"Certificate request failed.")):(e.inProgress=!0,c.user.debug("Certificate not ready, retrying."),setTimeout(e._pollCertificate.bind(e),e._pollTimeout)):(e._saveCertificate(i,null,!1),delete e._pollTimeout)})}}]),d}(n);module.exports=d;