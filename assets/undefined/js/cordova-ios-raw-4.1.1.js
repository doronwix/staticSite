function tokenHandler(e){var n,o,t;e="object"==typeof e?(n=e.token,o=e.isNotificationEnabled,t=e.versionCode,e.bundleName):(n=e,t=o=""),o="true"==o?1:0,scmmSettingsModule.updateCustomerPushNotificationToken(n,o,t,e,scmmSettingsModule.deviceType.iOS)}function onNotificationAPN(e){e.alert&&navigator.notification.alert(e.alert),e.sound&&new Media(e.sound).play(),e.badge&&pushNotification.setApplicationIconBadgeNumber(successHandler,errorHandler,e.badge)}function errorHandler(e){console.log("error = "+e)}!function(){var t,h,r,i,a,p="4.1.1";r={},i=[],a={},t=function(e){if(!r[e])throw"module "+e+" not found";var o,n;if(e in a)throw"Cycle in require graph: "+(i.slice(a[e]).join("->")+"->"+e);if(r[e].factory)try{return a[e]=i.length,i.push(e),o=r[e],n=o.factory,o.exports={},delete o.factory,n(function(e){var n=e;return"."===e.charAt(0)&&(n=o.id.slice(0,o.id.lastIndexOf("."))+"."+e.slice(2)),t(n)},o.exports,o),o.exports}finally{delete a[e],i.pop()}return r[e].exports},(h=function(e,n){if(r[e])throw"module "+e+" already defined";r[e]={id:e,factory:n}}).remove=function(e){delete r[e]},h.moduleMap=r,"object"==typeof module&&"function"==typeof t&&(module.exports.require=t,module.exports.define=h),h("cordova",function(e,n,o){if(window.cordova&&!(window.cordova instanceof HTMLElement))throw new Error("cordova already defined");var t=e("cordova/channel"),r=e("cordova/platform"),i=document.addEventListener,a=document.removeEventListener,c=window.addEventListener,u=window.removeEventListener,l={},s={};function d(e,n){var o=document.createEvent("Events");if(o.initEvent(e,!1,!1),n)for(var t in n)n.hasOwnProperty(t)&&(o[t]=n[t]);return o}document.addEventListener=function(e,n,o){var t=e.toLowerCase();void 0!==l[t]?l[t].subscribe(n):i.call(document,e,n,o)},window.addEventListener=function(e,n,o){var t=e.toLowerCase();void 0!==s[t]?s[t].subscribe(n):c.call(window,e,n,o)},document.removeEventListener=function(e,n,o){var t=e.toLowerCase();void 0!==l[t]?l[t].unsubscribe(n):a.call(document,e,n,o)},window.removeEventListener=function(e,n,o){var t=e.toLowerCase();void 0!==s[t]?s[t].unsubscribe(n):u.call(window,e,n,o)};var f={define:h,require:e,version:p,platformVersion:p,platformId:r.id,addWindowEventHandler:function(e){return s[e]=t.create(e)},addStickyDocumentEventHandler:function(e){return l[e]=t.createSticky(e)},addDocumentEventHandler:function(e){return l[e]=t.create(e)},removeWindowEventHandler:function(e){delete s[e]},removeDocumentEventHandler:function(e){delete l[e]},getOriginalHandlers:function(){return{document:{addEventListener:i,removeEventListener:a},window:{addEventListener:c,removeEventListener:u}}},fireDocumentEvent:function(e,n,o){var t=d(e,n);void 0!==l[e]?o?l[e].fire(t):setTimeout(function(){"deviceready"==e&&document.dispatchEvent(t),l[e].fire(t)},0):document.dispatchEvent(t)},fireWindowEvent:function(e,n){var o=d(e,n);void 0!==s[e]?setTimeout(function(){s[e].fire(o)},0):window.dispatchEvent(o)},callbackId:Math.floor(2e9*Math.random()),callbacks:{},callbackStatus:{NO_RESULT:0,OK:1,CLASS_NOT_FOUND_EXCEPTION:2,ILLEGAL_ACCESS_EXCEPTION:3,INSTANTIATION_EXCEPTION:4,MALFORMED_URL_EXCEPTION:5,IO_EXCEPTION:6,INVALID_ACTION:7,JSON_EXCEPTION:8,ERROR:9},callbackSuccess:function(e,n){f.callbackFromNative(e,!0,n.status,[n.message],n.keepCallback)},callbackError:function(e,n){f.callbackFromNative(e,!1,n.status,[n.message],n.keepCallback)},callbackFromNative:function(n,o,e,t,r){try{var i=f.callbacks[n];i&&(o&&e==f.callbackStatus.OK?i.success&&i.success.apply(null,t):o||i.fail&&i.fail.apply(null,t),r||delete f.callbacks[n])}catch(e){var a="Error in "+(o?"Success":"Error")+" callbackId: "+n+" : "+e;throw console&&console.log&&console.log(a),f.fireWindowEvent("cordovacallbackerror",{message:a}),e}},addConstructor:function(e){t.onCordovaReady.subscribe(function(){try{e()}catch(e){console.log("Failed to run constructor: "+e)}})}};o.exports=f}),h("cordova/argscheck",function(e,n,o){var d=e("cordova/utils"),f=o.exports,p={A:"Array",D:"Date",N:"Number",S:"String",F:"Function",O:"Object"};f.checkArgs=function(e,n,o,t){if(f.enableChecks){for(var r,i,a=null,c=0;c<e.length;++c){var u=e.charAt(c),l=u.toUpperCase(),s=o[c];if("*"!=u&&(r=d.typeName(s),(null!=s||u!=l)&&r!=p[l])){a="Expected "+p[l];break}}if(a)throw a+=", but got "+r+".",a='Wrong type for parameter "'+(i=t||o.callee,t=c,/.*?\((.*?)\)/.exec(i)[1].split(", ")[t])+'" of '+n+": "+a,"undefined"==typeof jasmine&&console.error(a),TypeError(a)}},f.getValue=function(e,n){return void 0===e?n:e},f.enableChecks=!0}),h("cordova/base64",function(e,n,o){n.fromArrayBuffer=function(e){return function(e){for(var n,o=e.byteLength,t="",r=c(),i=0;i<o-2;i+=3)n=(e[i]<<16)+(e[i+1]<<8)+e[i+2],t+=r[n>>12],t+=r[4095&n];o-i==2?(n=(e[i]<<16)+(e[i+1]<<8),t+=r[n>>12],t+=a[(4095&n)>>6],t+="="):o-i==1&&(n=e[i]<<16,t+=r[n>>12],t+="==");return t}(new Uint8Array(e))},n.toArrayBuffer=function(e){for(var n="undefined"!=typeof atob?atob(e):new Buffer(e,"base64").toString("binary"),e=new ArrayBuffer(n.length),o=new Uint8Array(e),t=0,r=n.length;t<r;t++)o[t]=n.charCodeAt(t);return e};var t,a="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",c=function(){t=[];for(var e=0;e<64;e++)for(var n=0;n<64;n++)t[64*e+n]=a[e]+a[n];return c=function(){return t},t}}),h("cordova/builder",function(a,r,e){var c=a("cordova/utils");function i(e,n,o){r.replaceHookForTesting(e,n);var t=!1;try{e[n]=o}catch(e){t=!0}!t&&e[n]===o||c.defineGetter(e,n,function(){return o})}function u(e,n,o,t){t?c.defineGetter(e,n,function(){return console.log(t),delete e[n],i(e,n,o),o}):i(e,n,o)}function l(t,e,r,i){!function(e,n,o){for(var t in e)e.hasOwnProperty(t)&&n.apply(o,[e[t],t])}(e,function(e,n){try{var o=e.path?a(e.path):{};r?(void 0===t[n]?u(t,n,o,e.deprecated):void 0!==e.path&&(i?s(t[n],o):u(t,n,o,e.deprecated)),o=t[n]):void 0===t[n]?u(t,n,o,e.deprecated):o=t[n],e.children&&l(o,e.children,r,i)}catch(e){c.alert("Exception building Cordova JS globals: "+e+' for key "'+n+'"')}})}function s(e,n){for(var o in n)n.hasOwnProperty(o)&&(e.prototype&&e.prototype.constructor===e?i(e.prototype,o,n[o]):"object"==typeof n[o]&&"object"==typeof e[o]?s(e[o],n[o]):i(e,o,n[o]))}r.buildIntoButDoNotClobber=function(e,n){l(n,e,!1,!1)},r.buildIntoAndClobber=function(e,n){l(n,e,!0,!1)},r.buildIntoAndMerge=function(e,n){l(n,e,!0,!0)},r.recursiveMerge=s,r.assignOrWrapInDeprecateGetter=u,r.replaceHookForTesting=function(){}}),h("cordova/channel",function(e,n,o){function t(e,n){this.type=e,this.handlers={},this.state=n?1:0,this.fireArgs=null,this.numHandlers=0,this.onHasSubscribersChange=null}var r=e("cordova/utils"),i=1,a={join:function(e,n){function o(){--r||e()}for(var t=n.length,r=t,i=0;i<t;i++){if(0===n[i].state)throw Error("Can only use join with sticky channels.");n[i].subscribe(o)}t||e()},create:function(e){return a[e]=new t(e,!1)},createSticky:function(e){return a[e]=new t(e,!0)},deviceReadyChannelsArray:[],deviceReadyChannelsMap:{},waitForInitialization:function(e){var n;e&&(n=a[e]||this.createSticky(e),this.deviceReadyChannelsMap[e]=n,this.deviceReadyChannelsArray.push(n))},initializationComplete:function(e){e=this.deviceReadyChannelsMap[e];e&&e.fire()}};function c(e){if("function"!=typeof e)throw"Function required as first argument!"}t.prototype.subscribe=function(e,n){var o,t;c(e),2!=this.state?(t=(o=e).observer_guid,"object"==typeof n&&(o=r.close(n,e)),t=t||""+i++,o.observer_guid=t,e.observer_guid=t,this.handlers[t]||(this.handlers[t]=o,this.numHandlers++,1==this.numHandlers&&this.onHasSubscribersChange&&this.onHasSubscribersChange())):e.apply(n||this,this.fireArgs)},t.prototype.unsubscribe=function(e){c(e);e=e.observer_guid;this.handlers[e]&&(delete this.handlers[e],this.numHandlers--,0===this.numHandlers&&this.onHasSubscribersChange&&this.onHasSubscribersChange())},t.prototype.fire=function(e){var n=Array.prototype.slice.call(arguments);if(1==this.state&&(this.state=2,this.fireArgs=n),this.numHandlers){var o,t=[];for(o in this.handlers)t.push(this.handlers[o]);for(var r=0;r<t.length;++r)t[r].apply(this,n);2==this.state&&this.numHandlers&&(this.numHandlers=0,this.handlers={},this.onHasSubscribersChange&&this.onHasSubscribersChange())}},a.createSticky("onDOMContentLoaded"),a.createSticky("onNativeReady"),a.createSticky("onCordovaReady"),a.createSticky("onPluginsReady"),a.createSticky("onDeviceReady"),a.create("onResume"),a.create("onPause"),a.waitForInitialization("onCordovaReady"),a.waitForInitialization("onDOMContentLoaded"),o.exports=a}),h("cordova/exec",function(n,e,o){var t,u=n("cordova"),a=n("cordova/utils"),c=n("cordova/base64"),l=[],s=0,r=0;function d(e){var n;return"ArrayBuffer"==e.CDVType&&(n=e.data,e=function(e){for(var n=new Uint8Array(e.length),o=0;o<e.length;o++)n[o]=e.charCodeAt(o);return n.buffer}(atob(n))),e}function f(){var e,n,o,t,r=null;if("string"==typeof arguments[0])throw new Error("The old format of this exec call has been removed (deprecated since 2.1). Change to: cordova.exec(null, null, 'Service', 'action', [ arg1, arg2 ]);");n=arguments[1],o=arguments[2],t=arguments[3],r="INVALID",i=(i=arguments[4])||[],((e=arguments[0])||n)&&(r=o+u.callbackId++,u.callbacks[r]={success:e,fail:n});var i=[r,o,t,i=function(e){if(!e||"Array"!=a.typeName(e))return e;var o=[];return e.forEach(function(e,n){"ArrayBuffer"==a.typeName(e)?o.push({CDVType:"ArrayBuffer",data:c.fromArrayBuffer(e)}):o.push(e)}),o}(i)];l.push(JSON.stringify(i)),s||1!=l.length||p()}function i(){if(h!==(i=v())&&f!==i){for(var e=l.shift();e;){var n=JSON.parse(e),o=n[0],t=n[1],r=n[2],n=n[3],o=u.callbacks[o]||{};h(o.success,o.fail,t,r,n),e=l.shift()}return 1}var i}function p(){document.body?(t&&t.contentWindow?t.contentWindow.location="gap://ready":((t=document.createElement("iframe")).style.display="none",t.src="gap://ready",document.body.appendChild(t)),r=setTimeout(function(){l.length&&(i()||p())},50)):setTimeout(p)}function v(){var e=n("cordova/exec");return"function"==typeof e.nativeFetchMessages&&"function"==typeof e.nativeEvalAndFetch&&"function"==typeof e.nativeCallback&&h!==e?e:f}function h(){v().apply(null,arguments)}f.nativeFetchMessages=function(){if(r&&(clearTimeout(r),r=0),!l.length)return"";var e="["+l.join(",")+"]";return l.length=0,e},f.nativeCallback=function(r,i,a,c,e){return f.nativeEvalAndFetch(function(){var e,n,o=0===i||1===i,t=(n=[],(e=a)&&e.hasOwnProperty("CDVType")?"MultiPart"==e.CDVType?e.messages.forEach(function(e){n.push(d(e))}):n.push(d(e)):n.push(e),n);setTimeout(function(){u.callbackFromNative(r,o,i,t,c)},0)})},f.nativeEvalAndFetch=function(e){s++;try{return e(),f.nativeFetchMessages()}finally{s--}},h.nativeFetchMessages=function(){return v().nativeFetchMessages.apply(null,arguments)},h.nativeEvalAndFetch=function(){return v().nativeEvalAndFetch.apply(null,arguments)},h.nativeCallback=function(){return v().nativeCallback.apply(null,arguments)},o.exports=h}),h("cordova/exec/proxy",function(e,n,o){var t={};o.exports={add:function(e,n){return console.log("adding proxy for "+e),t[e]=n},remove:function(e){var n=t[e];return delete t[e],t[e]=null,n},get:function(e,n){return t[e]?t[e][n]:null}}}),h("cordova/init",function(e,n,o){var t=e("cordova/channel"),r=e("cordova"),i=e("cordova/modulemapper"),a=e("cordova/platform"),c=e("cordova/pluginloader"),u=e("cordova/utils"),l=[t.onNativeReady,t.onPluginsReady];function s(e){for(var n=0;n<e.length;++n)2!=e[n].state&&console.log("Channel not fired: "+e[n].type)}window.setTimeout(function(){2!=t.onDeviceReady.state&&(console.log("deviceready has not fired after 5 seconds."),s(l),s(t.deviceReadyChannelsArray))},5e3),window.navigator&&(window.navigator=function(n){function e(){}e.prototype=n;var o=new e;if(e.bind)for(var t in n)"function"==typeof n[t]?o[t]=n[t].bind(n):function(e){u.defineGetterSetter(o,t,function(){return n[e]})}(t);return o}(window.navigator)),window.console||(window.console={log:function(){}}),window.console.warn||(window.console.warn=function(e){this.log("warn: "+e)}),t.onPause=r.addDocumentEventHandler("pause"),t.onResume=r.addDocumentEventHandler("resume"),t.onActivated=r.addDocumentEventHandler("activated"),t.onDeviceReady=r.addStickyDocumentEventHandler("deviceready"),"complete"==document.readyState||"interactive"==document.readyState?t.onDOMContentLoaded.fire():document.addEventListener("DOMContentLoaded",function(){t.onDOMContentLoaded.fire()},!1),window._nativeReady&&t.onNativeReady.fire(),i.clobbers("cordova","cordova"),i.clobbers("cordova/exec","cordova.exec"),i.clobbers("cordova/exec","Cordova.exec"),a.bootstrap&&a.bootstrap(),setTimeout(function(){c.load(function(){t.onPluginsReady.fire()})},0),t.join(function(){i.mapModules(window),a.initialize&&a.initialize(),t.onCordovaReady.fire(),t.join(function(){e("cordova").fireDocumentEvent("deviceready")},t.deviceReadyChannelsArray)},l)}),h("cordova/init_b",function(e,n,o){var t=e("cordova/channel"),r=e("cordova"),i=e("cordova/modulemapper"),a=e("cordova/platform"),c=e("cordova/pluginloader"),u=e("cordova/utils"),l=[t.onDOMContentLoaded,t.onNativeReady,t.onPluginsReady];function s(e){for(var n=0;n<e.length;++n)2!=e[n].state&&console.log("Channel not fired: "+e[n].type)}r.exec=e("cordova/exec"),window.setTimeout(function(){2!=t.onDeviceReady.state&&(console.log("deviceready has not fired after 5 seconds."),s(l),s(t.deviceReadyChannelsArray))},5e3),window.navigator&&(window.navigator=function(n){function e(){}e.prototype=n;var o=new e;if(e.bind)for(var t in n)"function"==typeof n[t]?o[t]=n[t].bind(n):function(e){u.defineGetterSetter(o,t,function(){return n[e]})}(t);return o}(window.navigator)),window.console||(window.console={log:function(){}}),window.console.warn||(window.console.warn=function(e){this.log("warn: "+e)}),t.onPause=r.addDocumentEventHandler("pause"),t.onResume=r.addDocumentEventHandler("resume"),t.onActivated=r.addDocumentEventHandler("activated"),t.onDeviceReady=r.addStickyDocumentEventHandler("deviceready"),"complete"==document.readyState||"interactive"==document.readyState?t.onDOMContentLoaded.fire():document.addEventListener("DOMContentLoaded",function(){t.onDOMContentLoaded.fire()},!1),window._nativeReady&&t.onNativeReady.fire(),a.bootstrap&&a.bootstrap(),setTimeout(function(){c.load(function(){t.onPluginsReady.fire()})},0),t.join(function(){i.mapModules(window),a.initialize&&a.initialize(),t.onCordovaReady.fire(),t.join(function(){e("cordova").fireDocumentEvent("deviceready")},t.deviceReadyChannelsArray)},l)}),h("cordova/modulemapper",function(d,e,n){var f,p,v=d("cordova/builder"),r=h.moduleMap;function t(e,n,o,t){if(!(n in r))throw new Error("Module "+n+" does not exist.");f.push(e,n,o),t&&(p[o]=t)}e.reset=function(){f=[],p={}},e.clobbers=function(e,n,o){t("c",e,n,o)},e.merges=function(e,n,o){t("m",e,n,o)},e.defaults=function(e,n,o){t("d",e,n,o)},e.runs=function(e){t("r",e,null)},e.mapModules=function(e){var n={};e.CDV_origSymbols=n;for(var o=0,t=f.length;o<t;o+=3){var r,i,a,c,u=f[o],l=f[o+1],s=d(l);"r"!=u&&(a=(r=f[o+2]).lastIndexOf("."),c=r.substr(0,a),l=r.substr(a+1),i=r in p?"Access made to deprecated symbol: "+r+". "+i:null,c=(a=function(e,n){if(!e)return n;for(var o,t=e.split("."),r=n,i=0;o=t[i];++i)r=r[o]=r[o]||{};return r}(c,e))[l],"m"==u&&c?v.recursiveMerge(c,s):("d"!=u||c)&&"d"==u||(r in n||(n[r]=c),v.assignOrWrapInDeprecateGetter(a,l,s,i)))}},e.getOriginalSymbol=function(e,n){var o=e.CDV_origSymbols;if(o&&n in o)return o[n];for(var t=n.split("."),r=e,i=0;i<t.length;++i)r=r&&r[t[i]];return r},e.reset()}),h("cordova/modulemapper_b",function(d,e,n){var f,p=d("cordova/builder"),v=[];function t(e,n,o,t){v.push(e,n,o),t&&(f[o]=t)}e.reset=function(){v=[],f={}},e.clobbers=function(e,n,o){t("c",e,n,o)},e.merges=function(e,n,o){t("m",e,n,o)},e.defaults=function(e,n,o){t("d",e,n,o)},e.runs=function(e){t("r",e,null)},e.mapModules=function(e){var n={};e.CDV_origSymbols=n;for(var o=0,t=v.length;o<t;o+=3){var r,i,a,c,u=v[o],l=v[o+1],s=d(l);"r"!=u&&(a=(r=v[o+2]).lastIndexOf("."),c=r.substr(0,a),l=r.substr(a+1),i=r in f?"Access made to deprecated symbol: "+r+". "+i:null,c=(a=function(e,n){if(!e)return n;for(var o,t=e.split("."),r=n,i=0;o=t[i];++i)r=r[o]=r[o]||{};return r}(c,e))[l],"m"==u&&c?p.recursiveMerge(c,s):("d"!=u||c)&&"d"==u||(r in n||(n[r]=c),p.assignOrWrapInDeprecateGetter(a,l,s,i)))}},e.getOriginalSymbol=function(e,n){var o=e.CDV_origSymbols;if(o&&n in o)return o[n];for(var t=n.split("."),r=e,i=0;i<t.length;++i)r=r&&r[t[i]];return r},e.reset()}),h("cordova/platform",function(e,n,o){o.exports={id:"ios",bootstrap:function(){e("cordova/channel").onNativeReady.fire()}}}),h("cordova/pluginloader",function(t,r,e){var a=t("cordova/modulemapper");t("cordova/urlutil");function c(e,n,o,t){t=t||o,e in h.moduleMap?o():r.injectScript(n,function(){(e in h.moduleMap?o:t)()},t)}function i(e,n,o){var t=n.length;if(t)for(var r=0;r<n.length;r++)c(n[r].id,e+n[r].file,i);else o();function i(){--t||function(e,n){for(var o,t=0;o=e[t];t++){if(o.clobbers&&o.clobbers.length)for(var r=0;r<o.clobbers.length;r++)a.clobbers(o.id,o.clobbers[r]);if(o.merges&&o.merges.length)for(var i=0;i<o.merges.length;i++)a.merges(o.id,o.merges[i]);o.runs&&a.runs(o.id)}n()}(n,o)}}r.injectScript=function(e,n,o){var t=document.createElement("script");t.onload=n,t.onerror=o,t.src=e,document.head.appendChild(t)},r.load=function(n){var o=function(){for(var e=null,n=document.getElementsByTagName("script"),o="/cordova.js",t=n.length-1;-1<t;t--){var r=n[t].src.replace(/\?.*$/,"");if(r.indexOf(o)==r.length-o.length){e=r.substring(0,r.length-o.length)+"/";break}}return e}();null===o&&(console.log("Could not find cordova.js script tag. Plugin loading may fail."),o=""),c("cordova/plugin_list",o+"cordova_plugins.js",function(){var e=t("cordova/plugin_list");i(o,e,n)},n)}}),h("cordova/pluginloader_b",function(n,e,o){var i=n("cordova/modulemapper");e.load=function(e){!function(e){if(e&&e.length)for(var n,o=0;n=e[o];o++){if(n.clobbers&&n.clobbers.length)for(var t=0;t<n.clobbers.length;t++)i.clobbers(n.id,n.clobbers[t]);if(n.merges&&n.merges.length)for(var r=0;r<n.merges.length;r++)i.merges(n.id,n.merges[r]);n.runs&&i.runs(n.id)}}(n("cordova/plugin_list")),e()}}),h("cordova/urlutil",function(e,n,o){n.makeAbsolute=function(e){var n=document.createElement("a");return n.href=e,n.href}}),h("cordova/utils",function(e,n,o){var t=n;function r(e){for(var n="",o=0;o<e;o++){var t=parseInt(256*Math.random(),10).toString(16);1==t.length&&(t="0"+t),n+=t}return n}function i(){}t.defineGetterSetter=function(e,n,o,t){var r;Object.defineProperty?(r={get:o,configurable:!0},t&&(r.set=t),Object.defineProperty(e,n,r)):(e.__defineGetter__(n,o),t&&e.__defineSetter__(n,t))},t.defineGetter=t.defineGetterSetter,t.arrayIndexOf=function(e,n){if(e.indexOf)return e.indexOf(n);for(var o=e.length,t=0;t<o;++t)if(e[t]==n)return t;return-1},t.arrayRemove=function(e,n){n=t.arrayIndexOf(e,n);return-1!=n&&e.splice(n,1),-1!=n},t.typeName=function(e){return Object.prototype.toString.call(e).slice(8,-1)},t.isArray=Array.isArray||function(e){return"Array"==t.typeName(e)},t.isDate=function(e){return e instanceof Date},t.clone=function(e){if(!e||"function"==typeof e||t.isDate(e)||"object"!=typeof e)return e;var n,o;if(t.isArray(e)){for(n=[],o=0;o<e.length;++o)n.push(t.clone(e[o]));return n}for(o in n={},e)o in n&&n[o]==e[o]||(n[o]=t.clone(e[o]));return n},t.close=function(n,o,t){return function(){var e=t||arguments;return o.apply(n,e)}},t.createUUID=function(){return r(4)+"-"+r(2)+"-"+r(2)+"-"+r(2)+"-"+r(6)},t.extend=function(e,n){i.prototype=n.prototype,e.prototype=new i,e.__super__=n.prototype,e.prototype.constructor=e},t.alert=function(e){window.alert?window.alert(e):console&&console.log&&console.log(e)}}),window.cordova=t("cordova"),t("cordova/init")}(),cordova.define("cordova/plugin_list",function(e,n,o){o.exports=[{file:"plugins/cordova-plugin-splashscreen/www/splashscreen.js",id:"cordova-plugin-splashscreen.SplashScreen",pluginId:"cordova-plugin-splashscreen",clobbers:["navigator.splashscreen"]},{file:"plugins/cordova-plugin-inappbrowser/www/inappbrowser.js",id:"cordova-plugin-inappbrowser.inappbrowser",pluginId:"cordova-plugin-inappbrowser",clobbers:["cordova.InAppBrowser.open","window.open"]},{file:"plugins/com.phonegap.plugins.PushPlugin/www/PushNotification.js",id:"com.phonegap.plugins.PushPlugin.PushNotification",clobbers:["PushNotification"]},{file:"plugins/cordova-plugin-appsflyer/www/appsflyer.js",id:"cordova-plugin-appsflyer.appsflyer",pluginId:"cordova-plugin-appsflyer",clobbers:["window.plugins.appsFlyer"]},{id:"cordova-plugin-touch-id.TouchID",file:"plugins/cordova-plugin-touch-id/www/TouchID.js",pluginId:"cordova-plugin-touch-id",clobbers:["Fingerprint"]}],o.exports.metadata={"cordova-plugin-splashscreen":"3.2.2","cordova-plugin-inappbrowser":"1.4.0","com.phonegap.plugins.PushPlugin":"2.4.0","cordova-plugin-appsflyer":"4.1.0","cordova-plugin-touch-id":"3.3.1"}}),cordova.define("cordova-plugin-touch-id.TouchID",function(e,n,o){function t(){}t.prototype.isDeviceSupportFingerprint=function(e,n){cordova.exec(e,function(e){n(window.translateIOSErrorToGeneralMessage(e))},"TouchID","isAvailable",[])},t.prototype.SetToken=function(e,n,o){cordova.exec(n,o,"TouchID","SetToken",[e])},t.prototype.GetToken=function(e,n){cordova.exec(e,n,"TouchID","GetToken",[])},t.prototype.DeleteToken=function(e,n){cordova.exec(e,n,"TouchID","DeleteToken",[])},t.prototype.scanCancel=function(e,n){cordova.exec(e,n,"TouchID","scanCancel",[])},t.prototype.didFingerprintDatabaseChange=function(e,n){cordova.exec(e,n,"TouchID","didFingerprintDatabaseChange",[])},t.prototype.verifyFingerprint=function(e,n,o){cordova.exec(n,o,"TouchID","verifyFingerprint",[e])},t.prototype.verifyFingerprintWithCustomPasswordFallback=function(e,n,o){cordova.exec(n,o,"TouchID","verifyFingerprintWithCustomPasswordFallback",[e])},t.prototype.show=function(e,n,o){cordova.exec(n,o,"TouchID","verifyFingerprintWithCustomPasswordFallbackAndEnterPasswordLabel",[e.message,""])},t.install=function(){return window.plugins||(window.plugins={}),Fingerprint=new t,Fingerprint},cordova.addConstructor(t.install)}),cordova.define("cordova-plugin-inappbrowser.inappbrowser",function(e,n,o){function c(){this.channels={loadstart:t.create("loadstart"),loadstop:t.create("loadstop"),loaderror:t.create("loaderror"),exit:t.create("exit")}}var u,t,l,s;window.parent&&window.parent.ripple?o.exports=window.open.bind(window):(u=e("cordova/exec"),t=e("cordova/channel"),l=e("cordova/modulemapper"),s=e("cordova/urlutil"),c.prototype={_eventHandler:function(e){e&&e.type in this.channels&&this.channels[e.type].fire(e)},close:function(e){u(null,null,"InAppBrowser","close",[])},show:function(e){u(null,null,"InAppBrowser","show",[])},addEventListener:function(e,n){e in this.channels&&this.channels[e].subscribe(n)},removeEventListener:function(e,n){e in this.channels&&this.channels[e].unsubscribe(n)},executeScript:function(e,n){if(e.code)u(n,null,"InAppBrowser","injectScriptCode",[e.code,!!n]);else{if(!e.file)throw new Error("executeScript requires exactly one of code or file to be specified");u(n,null,"InAppBrowser","injectScriptFile",[e.file,!!n])}},insertCSS:function(e,n){if(e.code)u(n,null,"InAppBrowser","injectStyleCode",[e.code,!!n]);else{if(!e.file)throw new Error("insertCSS requires exactly one of code or file to be specified");u(n,null,"InAppBrowser","injectStyleFile",[e.file,!!n])}}},o.exports=function(e,n,o,t){if(window.frames&&window.frames[n])return l.getOriginalSymbol(window,"open").apply(window,arguments);e=s.makeAbsolute(e);var r,i=new c;for(r in t=t||{})i.addEventListener(r,t[r]);function a(e){i._eventHandler(e)}return u(a,a,"InAppBrowser","open",[e,n,o=o||""]),i})}),cordova.define("cordova-plugin-splashscreen.SplashScreen",function(e,n,o){var t=e("cordova/exec"),e={show:function(){t(null,null,"SplashScreen","show",[])},hide:function(){t(null,null,"SplashScreen","hide",[])}};o.exports=e}),cordova.define("cordova-plugin-appsflyer.appsflyer",function(e,n,o){var t,r;window.CustomEvent||(window.CustomEvent=function(e,n){var o=document.createEvent("CustomEvent");return o.initCustomEvent(e,!0,!0,n.detail),o}),t=window,(r=function(){}).prototype.initSdk=function(e){cordova.exec(null,null,"AppsFlyerPlugin","initSdk",e)},r.prototype.setCurrencyCode=function(e){cordova.exec(null,null,"AppsFlyerPlugin","setCurrencyCode",[e])},r.prototype.setAppUserId=function(e){cordova.exec(null,null,"AppsFlyerPlugin","setAppUserId",[e])},r.prototype.getAppsFlyerUID=function(n){cordova.exec(function(e){n(e)},null,"AppsFlyerPlugin","getAppsFlyerUID",[])},r.prototype.trackEvent=function(e,n){cordova.exec(null,null,"AppsFlyerPlugin","trackEvent",[e,n])},r.prototype.onInstallConversionDataLoaded=function(e){var n=e;"string"==typeof n&&(n=JSON.parse(e)),n=new CustomEvent("onInstallConversionDataLoaded",{detail:n}),t.document.dispatchEvent(n)},t.cordova.addConstructor(function(){t.Cordova||(t.Cordova=t.cordova),t.plugins||(t.plugins={}),t.plugins.appsFlyer=new r})}),cordova.define("com.phonegap.plugins.PushPlugin.PushNotification",function(e,n,o){function t(){}t.prototype.register=function(e,n,o){if(null==n&&(n=function(){}),"function"!=typeof n)return alert("errorCallback... of PushNotification.register"),void console.log("PushNotification.register failure: failure parameter not a function");"function"==typeof e?cordova.exec(e,n,"PushPlugin","register",[o]):console.log("PushNotification.register failure: success callback parameter must be a function")},t.prototype.unregister=function(e,n,o){null==n&&(n=function(){}),"function"==typeof n?"function"==typeof e?cordova.exec(e,n,"PushPlugin","unregister",[o]):console.log("PushNotification.unregister failure: success callback parameter must be a function"):console.log("PushNotification.unregister failure: failure parameter not a function")},t.prototype.showToastNotification=function(e,n,o){null==n&&(n=function(){}),"function"==typeof n?cordova.exec(e,n,"PushPlugin","showToastNotification",[o]):console.log("PushNotification.register failure: failure parameter not a function")},t.prototype.setApplicationIconBadgeNumber=function(e,n,o){null==n&&(n=function(){}),"function"==typeof n?"function"==typeof e?cordova.exec(e,n,"PushPlugin","setApplicationIconBadgeNumber",[{badge:o}]):console.log("PushNotification.setApplicationIconBadgeNumber failure: success callback parameter must be a function"):console.log("PushNotification.setApplicationIconBadgeNumber failure: failure parameter not a function")},window.plugins||(window.plugins={}),window.plugins.pushNotification||(window.plugins.pushNotification=new t),void 0!==o&&o.exports&&(o.exports=t)});
//# sourceMappingURL=cordova-ios-raw-4.1.1.js.map