"use strict";exports.addAmounts=function(t,r){var o,n,e=[1,2,4];for(o=0;o<e.length;o++)n=e[o],t[n]+=r[n]||0},exports.subtractAmounts=function(t,r){var o,n,e=[1,2,4];for(o=0;o<e.length;o++)n=e[o],t[n]-=r[n]||0},exports.addProductMaps=function(t,r){var o,n;for(o in r)n=t[o]||{1:0,2:0,4:0},exports.addAmounts(n,r[o]),t[o]=n},exports.subtractProductMaps=function(t,r){var o,n;for(o in r)n=t[o]||{1:0,2:0,4:0},exports.subtractAmounts(n,r[o]),t[o]=n},exports.toUnique=function(t,r){var o,n,e,u,a,i,d,f,s,c,l,p,y=new Set;if(t){d=!0,f=!1,s=void 0;try{for(c=t[Symbol.iterator]();!(d=(l=c.next()).done);d=!0)p=l.value,y.add(p)}catch(x){f=!0,s=x}finally{try{!d&&c["return"]&&c["return"]()}finally{if(f)throw s}}}else if(r){o=!0,n=!1,e=void 0;try{for(u=r[Symbol.iterator]();!(o=(a=u.next()).done);o=!0)i=a.value,y.add(i.productId||i.product.productId)}catch(x){n=!0,e=x}finally{try{!o&&u["return"]&&u["return"]()}finally{if(n)throw e}}}return Array.from(y)},exports.numberToIp=function(t){return(t>>24&255)+"."+(t>>16&255)+"."+(t>>8&255)+"."+(255&t)};