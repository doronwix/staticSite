var Browser=function(){function i(){return General.isNullOrUndefined(t)&&(t={older:{iphSeSimilar:320===a.screen.width&&568===a.screen.height&&2===a.devicePixelRatio},notch:{iphXSimilar:375===a.screen.width&&812===a.screen.height&&3===a.devicePixelRatio,iphXr:414===a.screen.width&&896===a.screen.height&&2===a.devicePixelRatio,iphXsMax:414===a.screen.width&&896===a.screen.height&&3===a.devicePixelRatio}}),t}function e(){return/^((?!chrome|android).)*safari/i.test(navigator.userAgent)}function n(){return-1!==navigator.userAgent.indexOf("Mac OS")}var t,a=window,r=function(e){var n=a.navigator.userAgent,t=n.indexOf("MSIE ");if(0<t)return parseInt(n.substring(t+5,n.indexOf(".",t)),10);if(0<n.indexOf("Trident/")){t=n.indexOf("rv:");return parseInt(n.substring(t+3,n.indexOf(".",t)),10)}return!e&&o()},o=function(){var e=a.navigator.userAgent,n=e.indexOf("Edge/");return 0<n&&parseInt(e.substring(n+5,e.indexOf(".",n)),10)},s=function(){var e=2<c().split(".").length?c().split(".")[0]:c();return Browser.isInternetExplorer()&&40<Number(e)},c=function(){return $.uaMatch(a.navigator.userAgent).version.split(".")[0]},g=function(){try{var e=Object.defineProperty({},"passive",{get:function(){g=!0}});window.addEventListener("test",e,e),window.removeEventListener("test",e,e)}catch(e){return!1}return!0}();return{getMobileOperatingSystem:function(){var e=navigator.userAgent||navigator.vendor||window.opera;return/windows phone/i.test(e)?"Windows Phone":/android/i.test(e)?"Android":/iPad|iPhone|iPod/.test(e)&&!window.MSStream?"iOS":"unknown"},isPassiveEventListenersSupported:function(){return g},isInternetExplorer:r,isEdge:o,isIEVersionGreaterThen:function(e){return!!s()||Number(c())>Number(e)},isIEVersionEqualTo:function(e){return r()&&Number(c())==e},isDefinePropertySupported:function(){return"function"==typeof Object.defineProperty&&(!Browser.isInternetExplorer()||Browser.isIEVersionGreaterThen(8))},getBrowserName:function(){return o()?"Edge":r(!0)?"Internet Explorer":a.opera||0<=a.navigator.userAgent.indexOf(" OPR/")?"Opera":e()?"Safari":$.browser&&$.browser.chrome?"Chrome":$.browser&&$.browser.mozilla?"Mozilla":a.navigator.userAgent},getBrowserVersion:c,getOperatingSystemName:function(){return-1!=a.navigator.userAgent.indexOf("Windows")?"Windows":-1!=a.navigator.userAgent.indexOf("Mac")?"Mac/iOS":-1!=a.navigator.userAgent.indexOf("X11")?"UNIX":-1!=a.navigator.userAgent.indexOf("Linux")?"Linux":a.navigator.userAgent},getOperatingSystemNameAndVersion:function(){return-1!=a.navigator.userAgent.indexOf("Windows NT 10.0")?"Windows 10":-1!=a.navigator.userAgent.indexOf("Windows NT 6.2")?"Windows 8":-1!=a.navigator.userAgent.indexOf("Windows NT 6.1")?"Windows 7":-1!=a.navigator.userAgent.indexOf("Windows NT 6.0")?"Windows Vista":-1!=a.navigator.userAgent.indexOf("Windows NT 5.1")?"Windows XP":-1!=a.navigator.userAgent.indexOf("Windows NT 5.0")?"Windows 2000":-1!=a.navigator.userAgent.indexOf("Mac OS X 10_5")||-1!=a.navigator.userAgent.indexOf("Mac OS X 10.5")?"Mac 10.5":-1!=a.navigator.userAgent.indexOf("Mac OS X 10_6")||-1!=a.navigator.userAgent.indexOf("Mac OS X 10.6")?"Mac 10.6":-1!=a.navigator.userAgent.indexOf("Mac OS X 10_7")||-1!=a.navigator.userAgent.indexOf("Mac OS X 10.7")?"Mac 10.7":-1!=a.navigator.userAgent.indexOf("Mac OS X 10_8")||-1!=a.navigator.userAgent.indexOf("Mac OS X 10.8")?"Mac 10.8":-1!=a.navigator.userAgent.indexOf("X11")?"UNIX":-1!=a.navigator.userAgent.indexOf("Linux")?"Linux":a.navigator.userAgent},getScreenResolution:function(){return a.screen.width+"x"+a.screen.height},getLargestResolutionDimension:function(){return Math.max(a.screen.width,a.screen.height)},isChromeOnIOS:function(){return-1!==navigator.userAgent.indexOf("CriOS")},isMacOs:n,isSafariOnMacIOS:function(){return n()&&e()},isChrome:function(){return-1!==navigator.userAgent.indexOf("Chrome")&&-1===navigator.userAgent.indexOf("Edge")},isChromium:function(){return!General.isNullOrUndefined(window.chrome)},isAndroidApp:function(){var e=window.CookieHandler.ReadCookie("NativeAndroidApp");return null!==e&&"true"===e},isIosApp:function(){var e=window.CookieHandler.ReadCookie("NativeIosApp");return null!==e&&"true"===e},replaceWindowWith:function(e){a=e},isIeEdgePrivateMode:function(){return!window.indexedDB&&(window.PointerEvent||window.MSPointerEvent)},isSafariMobile:function(){return navigator.userAgent.match(/(iPod|iPhone|iPad)/)&&navigator.userAgent.match(/AppleWebKit/)},getiosDevices:i,forceRepaintIosRotate:function(){var e,n,t=document.getElementById("main");t&&((n=i()).notch.iphXSimilar||n.notch.iphXr||n.notch.iphXsMax)&&(void 0!==e&&clearTimeout(e),t.style.border="1px solid transparent",e=setTimeout(function(){t.style.border=""},200))},getBrowserDetails:function(){return{screenColorDept:screen.colorDepth,screenHeight:screen.height,screenWidth:screen.width,screenResolution:screen.pixelDepth,javaEnabled:navigator.javaEnabled(),javaScriptEnabled:!0,language:navigator.language,timeZoneOffset:(new Date).getTimezoneOffset(),userAgent:navigator.userAgent.substr(0,2048)}},FullBrowserInfo:function(){"use strict";return{options:[],header:[navigator.platform,navigator.userAgent,navigator.appVersion,navigator.vendor,window.opera],dataos:[{name:"Windows Phone",value:"Windows Phone",version:"OS"},{name:"Windows",value:"Win",version:"NT"},{name:"iPhone",value:"iPhone",version:"OS"},{name:"iPad",value:"iPad",version:"OS"},{name:"Kindle",value:"Silk",version:"Silk"},{name:"Android",value:"Android",version:"Android"},{name:"PlayBook",value:"PlayBook",version:"OS"},{name:"BlackBerry",value:"BlackBerry",version:"/"},{name:"Macintosh",value:"Mac",version:"OS X"},{name:"Linux",value:"Linux",version:"rv"},{name:"Palm",value:"Palm",version:"PalmOS"}],databrowser:[{name:"Chrome",value:"Chrome",version:"Chrome"},{name:"Firefox",value:"Firefox",version:"Firefox"},{name:"Safari",value:"Safari",version:"Version"},{name:"Internet Explorer",value:"MSIE",version:"MSIE"},{name:"Opera",value:"Opera",version:"Opera"},{name:"BlackBerry",value:"CLDC",version:"CLDC"},{name:"Mozilla",value:"Mozilla",version:"Mozilla"}],init:function(){var e=this.header.join(" ");return{os:this.matchItem(e,this.dataos),browser:this.matchItem(e,this.databrowser)}},matchItem:function(e,n){for(var t,i,a,r=0,o=0,r=0;r<n.length;r+=1)if(new RegExp(n[r].value,"i").test(e)){if(t=new RegExp(n[r].version+"[- /:;]([\\d._]+)","i"),a="",(i=e.match(t))&&i[1]&&(i=i[1]),i)for(i=i.split(/[._]+/),o=0;o<i.length;o+=1)a+=0===o?i[o]+".":i[o];else a="0";return{name:n[r].name,version:parseFloat(a)}}return{name:"unknown",version:0}}}.init()}()}}();$(document).ready(function(){UserDeviceInformation.init()});var UserDeviceInformation={init:function(){this.setUserDeviceResolutionCookie(),this.setResolutionSpecificDomElements()},setUserDeviceResolutionCookie:function(){var e,n=CookieHandler.ReadCookie("UserDeviceInformation");null!=n&&(e=n.split("|")[0],n=n.split("|")[2],CookieHandler.CreateCookie("UserDeviceInformation",e+"|"+Browser.getLargestResolutionDimension().toString()+"|"+n,(new Date).AddDays(Model.UserDeviceInformationCookieExpirationDays)))},setResolutionSpecificDomElements:function(){var e=CookieHandler.ReadCookie("UserDeviceInformation");null!=e&&"true"==e.split("|")[2].toLowerCase()&&$("#Footer .mobilePlatformLink").addClass("visible")}};function TrackingCommonData(e){var n,t=e;return{IPCountry:"undefined"!=typeof systemInfo?systemInfo.countryNameByIP:"undefined"!==window.Model?window.Model.CountryNameByIP:"",ResolutionScreen:Browser.getScreenResolution(),OS:Browser.getOperatingSystemName(),OSVersion:Browser.getOperatingSystemNameAndVersion(),Browser:function(){if(window.CookieHandler){if(null!==window.CookieHandler.ReadCookie("NativeIosApp")&&"true"===window.CookieHandler.ReadCookie("NativeIosApp"))return"App iPhone";if(null!=window.CookieHandler.ReadCookie("NativeAndroidApp")&&"true"===window.CookieHandler.ReadCookie("NativeAndroidApp"))return"App Android"}return Browser.getBrowserName()}(),BrowserVersion:Browser.getBrowserVersion(),Device:window.environmentData&&window.environmentData.isDesktop?"Desktop":CookieHandler.ReadCookie("ViewMode"),TrackingSessionId:(null==t.getItem("TrackingSessionId")&&(n=Math.random(),t.setItem("TrackingSessionId",n.toString())),t.getItem("TrackingSessionId")),Language:CookieHandler.ReadCookie("Language")}}function removeParametersFromReferrerUrl(e){return e.split("?")[0]}!function(e,n){"function"==typeof define&&define.amd?define("tracking/loggers/datalayer",[],n):e.dataLayer=n(e)}("undefined"!=typeof self?self:this,function(e){(e=e||window).dataLayer=e.dataLayer||[];var n,t=e.dataLayer,i=350;function a(){if(!(i>t.length||function(){if("boolean"!=typeof n)for(var e=0;e<t.length;e++){if(t[e])if(0===(t[e].event||"").indexOf("gtm.")){n=!0;break}}return n=n||!1}()))for(;i<t.length;)t.shift()}function r(){var n=[].slice.call(arguments,0),e=t.originalPush.apply(t,n);return t.subscribers.forEach(function(e){try{e.apply(this,n)}catch(e){}}),a(),"boolean"!=typeof e||e}return t.init=function(){t.originalPush=t.push,t.push=r,t.subscribers=[],t.subscribers.originalPush=t.subscribers.push,t.subscribers.push=function(e){t.subscribers.indexOf(e)<0&&(e=[].slice.call(arguments,0),t.subscribers.originalPush.apply(t.subscribers,e))}},t}),function(e,n){"function"==typeof define&&define.amd?define("tracking/googleTagManager",["tracking/loggers/datalayer"],n):e.googleTagManager=n(e.dataLayer)}("undefined"!=typeof self?self:this,function(e){var a;return window.googleTagManager={Init:function(e){a=e,function(){var e=window,n=document,t="dataLayer",i=a;e[t]=e[t]||[],e[t].push({"gtm.start":(new Date).getTime(),event:"gtm.js"});t=n.getElementsByTagName("script")[0],n=n.createElement("script");n.async=!0,n.src="https://www.googletagmanager.com/gtm.js?id="+i,t.parentNode.insertBefore(n,t)}()},StartChat:function(){try{e.push({event:"start-chat"})}catch(e){ErrorManager.onError("startChat","Google Tag Manager has failed",eErrorSeverity.low)}},ConfigAttributes:function(e){ko.postbox.publish(eFxNetEvents.GtmConfigurationSet,e)}},window.googleTagManager}),function(e,n){"function"==typeof define&&define.amd?define("tracking/EventRaiser",[],n):"object"==typeof exports?module.exports=n():e.TrackingEventRaiser=n}("undefined"!=typeof self?self:this,function(){Date.now=Date.now||function(){return+new Date};function n(e){return("0"+e).slice(-2)}function e(e){return n(e.getDate())+"/"+n(e.getMonth()+1)+"/"+e.getFullYear()+" "+n(e.getHours())+":"+n(e.getMinutes())+":"+n(e.getSeconds())}function t(){i.EventTime="undefined"!=typeof $cacheManager?e($cacheManager.ServerTime()):e(new Date(Date.now()+60*(new Date).getTimezoneOffset()*1e3))}var i={},a=function(){return $.extend(!0,{},i)};return{eventData:i,raiseEvent:function(){t(),function(){try{window.dataLayer.push(a())}catch(e){ErrorManager.onError("callGoogleApi","Google Tag Manager has failed for event: "+i.event,eErrorSeverity.high)}}(),function(){for(var e in i)i.hasOwnProperty(e)&&delete i[e]}()},formatEventDate:e}});var AdditionalProperties=function(){var n="ViewedPassword",t="ChangedCountry",e={ViewedPassword:!1,ViewedPrivacy:!1,ViewedAgreement:!1,ChangedCountry:!1},i=function(e){switch(e){case n:o();break;case t:s()}},a=function(e){"registration-view"==e&&r()},r=function(){$("#RegistrationForm a#chkDisclaimer4").click(function(){e.ViewedPrivacy=!0}),$("#RegistrationForm a#chkDisclaimer1").click(function(){e.ViewedAgreement=!0}),$('#RegistrationForm input:radio[name="UserWithExperience"]').on("change",function(){e.UserWithExperience="true"===this.value.toLowerCase()?"Yes":"No"})},o=function(){e.ViewedPassword=!0},s=function(){e.ChangedCountry=!0};return{init:function(){window.additionalPropertiesCallbacks=$.Callbacks(),window.additionalPropertiesCallbacks.add(i),window.externalEventsCallbacks.add(a)},data:e}},TrackingData=function(){function e(){n=TrackingCommonData(StorageFactory(StorageFactory.eStorageType.session)),i.init()}var n={},t=!1,i=new AdditionalProperties;return{init:e,getProperties:function(){return t||(e(),t=!0),n},registrationPageModel:{},additionalProperties:i}};function TrackingExternalEvents(n){var e={getCurrentEventData:function(){return n.eventData}};return window.environmentData&&window.environmentData.isDesktop&&(e.raiseEvent=function(e){n.eventData.event=e,n.raiseEvent()}),e["account-type-view"]=function(){n.eventData.event="account-type-view",n.eventData.Referrer=removeParametersFromReferrerUrl(document.referrer),n.raiseEvent()},e["demo-click"]=function(){n.eventData.event="demo-click",n.raiseEvent()},e["real-click"]=function(){n.eventData.event="real-click",n.raiseEvent()},e["registration-view"]=function(e){e&&Object.assign(n.eventData,e),n.eventData.event="registration-view",n.eventData.Referrer=removeParametersFromReferrerUrl(document.referrer),n.raiseEvent()},e["registration-interaction"]=function(){n.eventData.event="registration-interaction",n.raiseEvent()},e["registration-submit"]=function(e){n.eventData.event="registration-submit",n.eventData.ViewedPassword=window.trackingData.additionalProperties.data.ViewedPassword,n.eventData.ViewedPrivacy=window.trackingData.additionalProperties.data.ViewedPrivacy,n.eventData.ViewedAgreement=window.trackingData.additionalProperties.data.ViewedAgreement,n.eventData.ChangedCountry=window.trackingData.additionalProperties.data.ChangedCountry,n.eventData.UserWithExperience=window.trackingData.additionalProperties.data.UserWithExperience,n.eventData.SAProcess=e?e.saRegistration:0,n.raiseEvent()},e["registration-error"]=function(e){n.eventData.event="registration-error",n.eventData.Type=e.type,n.eventData.Reason=e.reason,e.hasOwnProperty("errorMessage")&&(n.eventData.ErrorMessage=e.errorMessage),n.raiseEvent()},e["login-error"]=function(e){n.eventData.event="login-error",n.eventData.Type=e.type,n.eventData.Reason=e.reason,e.hasOwnProperty("errorMessage")&&(n.eventData.ErrorMessage=e.errorMessage),n.raiseEvent()},e["request-new-password-error"]=function(e){n.eventData.event="request-new-password-error",n.eventData.Type=e.type,n.eventData.Reason=e.reason,e.hasOwnProperty("errorMessage")&&(n.eventData.ErrorMessage=e.errorMessage),n.raiseEvent()},e["forgot-password-error"]=function(e){n.eventData.event="forgot-password-error",n.eventData.Type=e.type,n.eventData.Reason=e.reason,e.hasOwnProperty("errorMessage")&&(n.eventData.ErrorMessage=e.errorMessage),n.raiseEvent()},e["registration-success"]=function(e){n.eventData.event="registration-success",n.eventData.SAProcess=e.saRegistration,n.eventData.AccountNumber=e.accountNumber,n.eventData.Referrer=removeParametersFromReferrerUrl(document.referrer),n.raiseEvent()},e["login-view"]=function(e){e&&Object.assign(n.eventData,e),n.eventData.event="login-view",n.eventData.Referrer=removeParametersFromReferrerUrl(document.referrer),n.raiseEvent()},e["login-interaction"]=function(){n.eventData.event="login-interaction",n.raiseEvent()},e["login-submit"]=function(e){n.eventData.event="login-submit",n.eventData.IsAutologin=e.isAutologin,n.eventData.Type=e.type,n.raiseEvent()},e["request-new-password-view"]=function(){n.eventData.event="request-new-password-view",n.raiseEvent()},e["request-new-password-interaction"]=function(){n.eventData.event="request-new-password-interaction",n.raiseEvent()},e["request-new-password-submit"]=function(){n.eventData.event="request-new-password-submit",n.raiseEvent()},e["request-new-password-success"]=function(){n.eventData.event="request-new-password-success",n.raiseEvent()},e["forgot-password-view"]=function(){n.eventData.event="forgot-password-view",n.eventData.Referrer=removeParametersFromReferrerUrl(document.referrer),n.raiseEvent()},e["forgot-password-interaction"]=function(){n.eventData.event="forgot-password-interaction",n.raiseEvent()},e["forgot-password-submit"]=function(){n.eventData.event="forgot-password-submit",n.raiseEvent()},e["change-language"]=function(){n.eventData.event="change-language",n.eventData.Language=CookieHandler.ReadCookie("Language"),n.raiseEvent()},e}window.trackingData=new TrackingData;var JqueryValidateHooks=function(n,i){var a=!1,t=!1,r=!1,o=function(e){var t=e.formatAndAdd;e.formatAndAdd=function(e,n){t.apply(this,arguments),d()&&i.call(null,u(e,n.method)),a=!1}},s=function(e){var n=e.settings.onkeyup;e.settings.onkeyup=function(){t=r=!(a=!0),n.apply(this,arguments)}},c=function(e){var n=e.settings.onfocusout;e.settings.onfocusout=function(){a=!(r=!0),n.apply(this,arguments)}},g=function(e){var n=e.checkForm;e.checkForm=function(){r=a=!(t=!0),n.apply(this,arguments)}},d=function(){return!(a||r&&t)},u=function(e,n){n="val-"+n.toLowerCase()+"-contentkey";return $(e).data(n)};return{init:function(){var e=n.data("validator");o(e),s(e),c(e),g(e)}}},ValidationErrorsTracker=function(){var t=null,i="#RegistrationForm",a="#LoginForm",r="#ForgotPasswordRequestForm",o="#ForgotPasswordResetForm",e=function(e){var n=null;switch(e){case"registration-view":n=$(i),t="registration-error";break;case"login-view":n=$(a),t="login-error";break;case"request-new-password-view":n=$(r),t="request-new-password-error";break;case"forgot-password-view":n=$(o),t="forgot-password-error"}null!==n&&0<n.length&&(new JqueryValidateHooks(n,s).init(),c(n))},s=function(e){window.trackingEventsCollector.consumeEvent(t,{type:"client",reason:e})},c=function(e){n(e),g(e)},n=function(e){e=e.find('input[name="validationErrorsContentKey"]');if(0<e.length){e=e.val();if(""==e)return;window.trackingEventsCollector.consumeEvent(t,{type:"server",reason:e})}},g=function(e){e.find("div.validation-summary-errors:visible").each(function(e,n){window.trackingEventsCollector.consumeEvent(t,{type:"server",errorMessage:$(n).text()})})};return{init:function(){window.externalEventsCallbacks.add(e)}}};function TrackingEventsCollector(n,t,i){var a=!1,r=!1,o=!1,s=[],c={},g=function(){a=!0,r&&o&&e(),l("exposeUI")},d=function(){r=!0,a&&o&&e()},u=function(){o=!0,a&&r&&e()},e=function(){for(var e=0;e<s.length;e++)l(s[e].eventName,s[e].additionalData)},l=function(e,n){if(f())s.push({eventName:e,additionalData:n});else{if(v(),window.environmentData&&window.environmentData.isDesktop)return Object.assign(t.getCurrentEventData(),n),void t.raiseEvent(e);t[e](n)}},f=function(){return!a||!r},v=function(){Object.assign(t.getCurrentEventData(),c.getProperties())};return{init:function(e){c=e,i?(o=r=a=!0,window.environmentData&&window.environmentData.isDesktop||window.externalEventsCallbacks.add(l)):(n.postbox.subscribe("trading-event",l),n.postbox.subscribe("ui-loaded",g),n.postbox.subscribe("scmm-data-loaded",d),n.postbox.subscribe("customer-data-loaded",u))},consumeEvent:l}}!function(e,n){"function"==typeof define&&define.amd?define("tracking/loggers/pagenocaptcha",["tracking/loggers/datalayer","tracking/loggers/gglanalyticslogger"],n):(e.fxTracking=e.fxTracking||{},e.fxTracking.pageNoCaptcha=n(e.dataLayer))}("undefined"!=typeof self?self:this,function(a){return{init:function(){var n=0,t=function(){var e;40<(n+=1)||("undefined"==typeof trackingData||void 0===trackingData.getProperties||void 0===trackingData.getProperties().AccountNumber?window.setTimeout(t,250):(e=trackingData.getProperties().SAProcess?{event:"load-google-analytics",gauserid:trackingData.getProperties().AccountNumber,gaclientid:""}:{event:"load-google-analytics",gauserid:"",gaclientid:""},a.push(e)))};if(null===window.location.href.match(/\/Parse/i))if(document.location.href.match(/\/login/i)){if(document.location.search.match(/sauser=true/))try{window.localStorage.setItem("sauser",!0)}catch(e){}var e="";try{e=window.localStorage.getItem("gaclientid")||""}catch(e){}var i={event:"load-google-analytics",gauserid:"",gaclientid:e};a.push(i)}else t()}}}),function(e,n){"function"==typeof define&&define.amd?define("tracking/loggers/pagewithcaptcha",["tracking/loggers/datalayer","tracking/loggers/gglanalyticslogger"],n):(e.fxTracking=e.fxTracking||{},e.fxTracking.pageWithCaptcha=n(e.dataLayer))}("undefined"!=typeof self?self:this,function(a){return{init:function(){var t=0,i=function(){if(!(40<(t+=1)))if("undefined"==typeof trackingData||void 0===trackingData.getProperties||void 0===trackingData.getProperties().Meta)window.setTimeout(i,250);else{var e=trackingData.getProperties().Meta;if(e.gaclientid)try{window.localStorage.setItem("gaclientid",e.gaclientid)}catch(e){}var n={event:"load-google-analytics",gauserid:"",gaclientid:e.gaclientid||""};a.push(n)}};null!==window.location.href.match(/\/Parse/i)&&i()}}}),function(e,n){"function"==typeof define&&define.amd?define("tracking/loggers/gglanalitycsconfigs",[],n):(e.fxTracking=e.fxTracking||{},e.fxTracking.gglAnalitycsConfigs=n())}("undefined"!=typeof self?self:this,function(){var n={"account-type-view":"Registration","registration-view":"Registration","demo-click":"Registration","real-click":"Registration","registration-interaction":"Registration","registration-submit":"Registration","registration-error":"Registration","registration-success":"Registration","login-view":"Login","login-success":"Login","login-interaction":"Login","login-error":"Login","login-submit":"Login","deal-slip-view":"Deal","deal-slip-interaction":"Deal","deal-slip-submit":"Deal","deal-slip-success":"Deal","deal-slip-error":"Deal"},t={1:"Main",2:"Open Deals",3:"Limits",4:"Closed Deals",5:"Account Statement",15:"Trading Signals",12:"View and Print Withdrawal",51:"Change Password",28:"Upload Documents",30:"Trading Signals"};return{GetSection:function(e){return n[e]||"None"},GetName:function(e){return t[e]||e}}}),function(e,n){"function"==typeof define&&define.amd?define("tracking/loggers/gglanalyticslogger",["tracking/loggers/datalayer","tracking/loggers/pagenocaptcha","tracking/loggers/pagewithcaptcha"],n):(e.fxTracking=e.fxTracking||{},e.fxTracking.gglAnalyticsLogger=n(e.dataLayer,e.fxTracking.pageNoCaptcha,e.fxTracking.pageWithCaptcha))}("undefined"!=typeof self?self:this,function(e,n,t){function i(e){if(e&&"load-google-analytics"===e.event){!function(){(window.GoogleAnalyticsObject="ga")in window||(window.ga=function(){window.ga.q.push(arguments)},window.ga.q=[]),window.ga.l=(new Date).getTime();var e=document.createElement("script");e.src="//www.google-analytics.com/analytics.js",e.async=!0;var n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(e,n)}();var n,t=e.gaclientid||"",e=e.gauserid||"";try{n=window.localStorage.getItem("sauser")}catch(e){}if(""!=t?window.ga("create","UA-20661807-41",{clientId:t}):""!=e?window.ga("create","UA-20661807-41","auto",{userId:e}):n?window.ga("create","UA-20661807-41","auto"):window.ga("create","UA-20661807-28","auto"),void 0!==window.__gaq&&window.__gaq.q)for(var i=0;i<window.__gaq.q.length;i++)window.ga.apply(window,window.__gaq.q[i]);window.__gaq=function(){window.ga.apply(window,arguments)};try{var a=trackingData.getProperties();if(a.AccountNumber){window._gadimensions={2:"AccountNumber",4:"Broker",5:"DepositCategory",6:"FirstDealDate",7:"FolderType",8:"NumberOfDeals",9:"NumberOfDeposits",10:"Serial",11:"VolumeCategory"};var r,o={};for(r in window._gadimensions)"string"==typeof window._gadimensions[r]&&a[window._gadimensions[r]]&&(o["dimension"+r]=a[window._gadimensions[r]],delete window._gadimensions[r]);window.ga("set",o)}}catch(e){}window.ga("send","pageview")}}return{init:function(){e.subscribers.push(i),(null!==window.location.href.match(/\/Parse/i)?t:n).init()}}}),function(e,n){"function"==typeof define&&define.amd?define("tracking/loggers/fxeventslogger",["tracking/loggers/datalayer","tracking/loggers/gglanalitycsconfigs"],n):(e.fxTracking=e.fxTracking||{},e.fxTracking.fxEventsLogger=n(e.dataLayer,e.fxTracking.gglAnalitycsConfigs))}("undefined"!=typeof self?self:this,function(b,D){var E,x=["fb-ready","create-helpwidget","load-google-analytics","trackingdata-loaded","interaction","hotjar-init","self-activation-user"],S=[2,3,4,6,9,15,17,18,19,20,21],T=["deal-slip-interaction","account-summary-interaction","new-limit-view"];function n(e){var n=e.event;if(!(n.match(/^[gtm|_]/gi)||"interaction"===n&&!0===e.artificial)){var t=e.ViewId,i=D.GetSection(n),a=e.action,r=e.category,o=0<=S.indexOf(t),s=0<=T.indexOf(n),c=0<=x.indexOf(n);window.__gaq=window.__gaq||function(){window.__gaq.q=window.__gaq.q||[],window.__gaq.q.push(arguments)};try{var g=function(e){for(var n=b.length;n--;)if(b[n].event&&b[n].event==e){var t,i={};for(t in b[n])"event"!=t&&(i[t]=b[n][t]);return i}return{}}(n);g.TrackingSessionId?window.sessionStorage.setItem("TrackingSessionId",g.TrackingSessionId):g.TrackingSessionId=window.sessionStorage.getItem("TrackingSessionId"),g.SAProcess?window.sessionStorage.setItem("SAProcess",g.SAProcess):g.SAProcess=window.sessionStorage.getItem("SAProcess");var d=n;if(!d||"string"!=typeof d||""==d.replace(/ /g,""))return void b.push({event:"unknown"});"personalguide4helpcenter-ready"!=n||(u=e.agentName)&&void 0!==window.hj&&(window.__gaq("send","pageview","/virtual-pages/"+u),window.hj("tagRecording",[u]));var u=trackingData.getProperties().AccountNumber;u&&(g.AccountNumber=u);try{if(window._gadimensions){var l,f=trackingData.getProperties(),v={};for(l in window._gadimensions)"string"==typeof window._gadimensions[l]&&f[window._gadimensions[l]]&&(v["dimension"+l]=f[window._gadimensions[l]],delete window._gadimensions[l]);if(void 0!==window.hj)try{v.dimension14=window.hj.pageVisit.property.get("userId")}catch(e){}window.__gaq("set",v)}}catch(e){}if("registration-interaction"==n&&document.location.href.match(/\/Confirm/)){var w=document.getElementsByName("UserWithExperience");if(0<w.length)for(var p=0;p<w.length;p++)if(w[p].checked){window.sessionStorage.setItem("hasExperience",w[p].value);break}}else if(trackingData.getProperties().SAProcess){var m=window.sessionStorage.getItem("hasExperience");if(window.sessionStorage.removeItem("hasExperience"),m){window.__gaq("set","dimension12",m),window.__gaq("send","pageview","/virtual-pages/vp_experience_"+("True"==m?"true":"false"));try{window.hj=window.hj||function(){(window.hj.q=window.hj.q||[]).push(arguments)},window.hj("tagRecording",["vp_experience_"+("True"==m?"true":"false")])}catch(e){}}}"View"==n?(u=D.GetName(t),window.__gaq("set",{page:"/view/"+t+"/"+u,title:u}),window.__gaq("send","pageview"),g.ItemName=u):"None"!=i&&(h="demo-click"===n?"Practice":"real-click"===n?"Real":"","Help"==i&&"Click"==a&&0,window.__gaq("send","event",i,a,h));var h=function(e,n,t,i,a){if("Help"==e&&"Show"==n)return"vp_help-widget-start";if("questionnaire-navigation"==t)switch(i){case"Cdd part 1":return"vp_cdd-page-1";case"Cdd part 2":return"vp_cdd-page-2";case"Kyc":return"vp_cdd-submit"}return"View"!=t||10!=a&&27!=a?!t.match(/^agreement/)||6!=a&&15!=a?t.match(/^deposit/)?"vp_"+t:null:"vp_missing-information"+t.replace(/^agreement/,""):"vp_cdd-start"}(i,a,n,r,t);if(h&&(window.__gaq("send","pageview","/virtual_pages/"+h),void 0!==window.hj&&window.hj("tagRecording",[h])),!c){var k,y=[];for(k in g)y.push(k+"="+g[k]);(new Image).src=E+"?name="+d+"&"+y.join("&")+"&random="+Math.random()}"interaction"!=n&&("View"==n&&o||s)&&b.push({event:"interaction",artificial:!0})}catch(e){}}}return{init:function(e){E=e,b.subscribers.push(n)}}}),function(e,n){"function"==typeof define&&define.amd?define("tracking/loggers/fbeventslogger",["tracking/loggers/datalayer"],n):(e.fxTracking=e.fxTracking||{},e.fxTracking.fbEventsLogger=n(e.dataLayer))}("undefined"!=typeof self?self:this,function(s){function n(e,n,t,i,a,r,o){e.fbq||(a=e.fbq=function(){a.callMethod?a.callMethod.apply(a,arguments):a.queue.push(arguments)},e._fbq||(e._fbq=a),(a.push=a).loaded=!0,a.version="2.0",a.queue=[],(r=n.createElement(t)).async=!0,r.src=i,(o=n.getElementsByTagName(t)[0]).parentNode.insertBefore(r,o),e.fbq("init","871141973245420"),e.fbq("track","PageView"),s.push({event:"fb-ready"})),window.fbq&&window.fbq("track","ViewContent",{value:trackingData.getProperties().NumberOfDeposits})}function e(e){e&&e.event&&e.event&&"login-success"==e.event.toLowerCase()&&n(window,document,"script","//connect.facebook.net/en_US/fbevents.js")}return{init:function(){s.indexOf(function(e){return e.event&&e.event&&"login-success"===e.event.toLowerCase()})<0?s.subscribers.push(e):n(window,document,"script","//connect.facebook.net/en_US/fbevents.js")}}}),function(e,n){"function"==typeof define&&define.amd?define("tracking/loggers/hotjareventslogger",["tracking/loggers/datalayer","LoadDictionaryContent!HotJarConfig","handlers/Logger","Q"],n):(e.fxTracking=e.fxTracking||{},e.fxTracking.hotJarEventsLogger=n(e.dataLayer,e.fxTracking.trackingConfig.hotjarconfig,e.Logger))}("undefined"!=typeof self?self:this,function(n,i,a,e){var r=0,o=40,s=250,c=e?e.defer():null,g=!1;function d(){var e,n,t;if(!(o<(r+=1)||g))if(g=!0,"undefined"==typeof trackingData||void 0===trackingData.getProperties)window.setTimeout(d,s,!0);else try{e=window,t=document,e.hj=e.hj||function(){(e.hj.q=e.hj.q||[]).push(arguments)},e._hjSettings={hjid:i.hjid,hjsv:i.hjsv},n=t.getElementsByTagName("head")[0],(t=t.createElement("script")).async=1,t.src="//static.hotjar.com/c/hotjar-"+e._hjSettings.hjid+".js?sv="+e._hjSettings.hjsv,t.onload=function(){a.warn("tracking/loggers/hotjareventslogger","hotjar loaded"),c&&c.resolve()},t.onerror=function(e){a.warn("tracking/loggers/hotjareventslogger","hotjar script load faill",null,2),c&&c.reject()},n.appendChild(t)}catch(e){a.warn({e:e}),c&&c.reject()}}function t(e){0<r||!e||"hotjar-init"!==e.event||d()}return{init:function(e){if(i.hjid&&"#"!==i.hjid&&(e?d():n.subscribers.push(t)),c)return c.promise}}}),function(e,n){"function"==typeof define&&define.amd?define("tracking/loggers/snapengagechat",["tracking/loggers/datalayer","LoadDictionaryContent!SnapEngageConfig","handlers/general","trackingIntExt/TrackingData"],n):(e.fxTracking=e.fxTracking||{},e.fxTracking.snapEngageChat=n(e.dataLayer,e.fxTracking.trackingConfig.snapengageconfig,{isNullOrUndefined:isNullOrUndefined},e.trackingData))}("undefined"!=typeof self?self:this,function(e,n,a,r){function o(){return function(){var e;try{e=window.localStorage.getItem("sauser")}catch(e){}return!!(document.location.search.match(/sauser=true/)||r.getProperties().SAProcess||e)}()&&n.SnapEngageWidgetID_sauser?n.SnapEngageWidgetID_sauser:n.SnapEngageWidgetID}function t(){return n.CallbackWidgetId}function i(e){if(e&&e.event&&!(["start-chat","start-callback-request-chat","start-proactive-chat"].indexOf(e.event)<0)&&"undefined"!=typeof SnapEngage){var n=r.getProperties().IPCountry;switch(e.event){case"start-chat":n.match(/(Poland|Italy|France|Spain|Greece|Holland|Germany)/i)?SnapEngage.setWidgetId(t()):SnapEngage.setWidgetId(o()),SnapEngage.startLink();break;case"start-callback-request-chat":try{SnapEngage.setWidgetId(t()),SnapEngage.startLink()}catch(e){}break;case"start-proactive-chat":e=e.snapengage_message;SnapEngage.openProactiveChat(!0,!1,e)}}}var s=0;function c(){40<(s+=1)||(void 0===r||void 0===r.getProperties?window.setTimeout(c,250):(function(){var e=document.createElement("script"),n=o();e.type="text/javascript",e.async=!0,e.src="//storage.googleapis.com/code.snapengage.com/js/"+n+".js";var t=!1;e.onload=e.onreadystatechange=function(){var e;t||this.readyState&&"loaded"!==this.readyState&&"complete"!==this.readyState||(t=!0,a.isNullOrUndefined(n)&&(e=r.getProperties().AccountNumber,a.isNullOrUndefined(e)||a.isNullOrUndefined(SnapEngage)||(SnapEngage.setUserName(r.getProperties().AccountNumber),SnapEngage.setUserEmail(e+"@trader.com"))))};var i=document.getElementsByTagName("script")[0];i.parentNode.insertBefore(e,i)}(),e.subscribers.push(i)))}return{init:function(){window.SnapEngage||("loading"===document.readyState?document.addEventListener("DOMContentLoaded",c):c())}}}),function(e,n){"function"==typeof define&&define.amd?define("tracking/loggers/fxtracking.lib",["tracking/loggers/datalayer","tracking/googleTagManager","tracking/loggers/fxeventslogger","tracking/loggers/fbeventslogger","tracking/loggers/hotjareventslogger","tracking/loggers/snapengagechat","tracking/loggers/gglanalyticslogger"],n):(e.fxTracking=e.fxTracking||{},e.fxTracking.init=n(e.dataLayer,e.googleTagManager,e.fxTracking.fxEventsLogger,e.fxTracking.fbEventsLogger,e.fxTracking.hotJarEventsLogger,e.fxTracking.snapEngageChat,e.fxTracking.gglAnalyticsLogger).init)}("undefined"!=typeof self?self:this,function(o,s,c,g,d,u,l){return{init:function(e,n,t){var i,a={},r={"disable-gtm":"disableGTM","disable-gtm-fxtracking":"disableGTMFXTracking","disable-gtm-gglanalytics":"disableGTMGoogleAnalytics","disable-gtm-fbevents":"disableGTMFacebookEvents","disable-gtm-hotjar":"disableGTMHotjar","disable-gtm-snapchat":"disableGTMSnapChat"};for(i in r)!0===n[i]&&(a[r[i]]=!0);window.gtmConfiguration={},0<Object.keys(a).length&&(window.gtmConfiguration=a),o.init(),"#"==e||a.disableGTM||s.Init(e),function(e,n){e.disableGTMGoogleAnalytics&&l.init();e.disableGTMFXTracking&&c.init(n);e.disableGTMFacebookEvents&&g.init();e.disableGTMHotjar&&d.init();e.disableGTMSnapChat&&u.init()}(a,t)}}}),function(a){function e(){var e,n,t,i;void 0!==a.Model&&(e=a.Model.GoogleTagManagerId||"",n={},t=a.ABTestConfiguration,i=a.Model.BIServiceURL||"",t&&1===t.Status&&(n=t.Result.reduce(function(e,n){for(var t=JSON.parse(n.Configuration),i=Object.keys(t),a=0;a<i.length;a++)e[i[a]]=t[i[a]];return e},{})),a.fxTracking.init(e,n,i),i=TrackingExternalEvents(TrackingEventRaiser()),a.trackingEventsCollector=new TrackingEventsCollector(null,i,!0),a.trackingEventsCollector.init(a.trackingData),(new ValidationErrorsTracker).init())}a.externalEventsCallbacks=$.Callbacks(),a.environmentData&&a.environmentData.isDesktop?e():$(document).ready(function(){e()})}(window);
//# sourceMappingURL=externaltracking.js.map