/*!
 Version = 20201230110628 2021-01-27 11:45:08 
*/
var Browser = (function () {
    var inScopeWindowObject = window;
    var iosDevices;

    var getiosDevices = function () {
        if (General.isNullOrUndefined(iosDevices)) {
            iosDevices = {
                older: {
                    iphSeSimilar: inScopeWindowObject.screen.width === 320 && inScopeWindowObject.screen.height === 568 &&
                        inScopeWindowObject.devicePixelRatio === 2
                },
                notch: {
                    iphXSimilar: inScopeWindowObject.screen.width === 375 && inScopeWindowObject.screen.height === 812 &&
                        inScopeWindowObject.devicePixelRatio === 3,
                    iphXr: inScopeWindowObject.screen.width === 414 && inScopeWindowObject.screen.height === 896 &&
                        inScopeWindowObject.devicePixelRatio === 2,
                    iphXsMax: inScopeWindowObject.screen.width === 414 && inScopeWindowObject.screen.height === 896 &&
                        inScopeWindowObject.devicePixelRatio === 3
                }
            };
        }
        return iosDevices;
    };

    var isIosnotchDevice = function () {
        var iosDevices = getiosDevices();
        return (iosDevices.notch.iphXSimilar ||
            iosDevices.notch.iphXr || iosDevices.notch.iphXsMax);
    };

    var forceRepaintIosRotate = function () {
        var styleTimeout, el = document.getElementById('main');
        if (el && isIosnotchDevice()) {
            if (typeof styleTimeout !== "undefined") {
                clearTimeout(styleTimeout);
            }
            el.style.border = '1px solid transparent';
            styleTimeout = setTimeout(function () {
                el.style.border = '';
            }, 200);
        }
    };

    var isIEVersionGreaterThen = function (versionNumber) {

        if (isSpartan()) return true;

        // for test of IE lower than Spartan
        return Number(getBrowserVersion()) > Number(versionNumber);
    };

    var isDefinePropertySupported = function () {
        return typeof Object.defineProperty == 'function' &&
            (!Browser.isInternetExplorer() || Browser.isIEVersionGreaterThen(8));
    };

    var isInternetExplorer = function (excludeEdge /*default false*/) {
        var ua = inScopeWindowObject.navigator.userAgent;

        var msie = ua.indexOf('MSIE ');
        if (msie > 0) {
            // IE 10 or older => return version number
            return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
        }

        var trident = ua.indexOf('Trident/');
        if (trident > 0) {
            // IE 11 => return version number
            var rv = ua.indexOf('rv:');
            return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
        }

        if (excludeEdge) {
            return false;
        }

        return isEdge();
    };

    var isEdge = function () {
        var ua = inScopeWindowObject.navigator.userAgent;

        var edge = ua.indexOf('Edge/');

        if (edge > 0) {
            // IE 12 => return version number
            return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
        }

        // other browser
        return false;
    };

    var isSpartan = function () {
        //Win10 IE browser Spartan introduced numeration like Chrome

        var version = (getBrowserVersion().split('.').length > 2) ? getBrowserVersion().split('.')[0] : getBrowserVersion();
        return Browser.isInternetExplorer() && Number(version) > 40;
    };

    var isOpera = function () {
        return !!inScopeWindowObject.opera || inScopeWindowObject.navigator.userAgent.indexOf(' OPR/') >= 0;
    };

    var isSafari = function () {
        return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    };

    var getBrowserData = function () {
        var userAgent = inScopeWindowObject.navigator.userAgent,
            match = userAgent.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [],
            tempMatch;

        if (/trident/i.test(match[1])) {
            tempMatch = /\brv[ :]+(\d+)/g.exec(userAgent) || [];

            return {
                name: 'IE ',
                version: (tempMatch[1] || '')
            };
        }

        if (match[1] === 'Chrome') {
            tempMatch = userAgent.match(/\b(OPR|Edge)\/(\d+)/);

            if (tempMatch != null) {
                return {
                    name: tempMatch.slice(1)[0].replace('OPR', 'Opera'),
                    version: tempMatch.slice(1)[1]
                };
            }
        }

        match = match[2] ? [match[1], match[2]] : [navigator.appName, navigator.appVersion, '-?'];

        if ((tempMatch = userAgent.match(/version\/(\d+)/i)) != null) {
            match.splice(1, 1, tempMatch[1]);
        }

        return {
            name: match[0],
            version: match[1]
        };
    }

    var getBrowserName = function () {
        var browserName = getBrowserData().name;
        if (isEdge()) return 'Edge';
        if (isInternetExplorer(true)) return 'Internet Explorer';
        if (isOpera()) return 'Opera';
        if (isSafari()) return 'Safari';
        if (browserName === 'Chrome') return 'Chrome';
        if (browserName === 'Mozilla') return 'Mozilla';

        return inScopeWindowObject.navigator.userAgent;
    };

    var getBrowserVersion = function () {
        return getBrowserData().version;
    };

    var getOperatingSystemName = function () {
        if (inScopeWindowObject.navigator.userAgent.indexOf("Windows") != -1) return "Windows";
        if (inScopeWindowObject.navigator.userAgent.indexOf("Mac") != -1) return "Mac/iOS";
        if (inScopeWindowObject.navigator.userAgent.indexOf("X11") != -1) return "UNIX";
        if (inScopeWindowObject.navigator.userAgent.indexOf("Linux") != -1) return "Linux";

        return inScopeWindowObject.navigator.userAgent;
    };

    var isChromeOnIOS = function () {
        return navigator.userAgent.indexOf('CriOS') !== -1;
    };

    var isMacOs = function () {
        return navigator.userAgent.indexOf('Mac OS') !== -1;
    };

    var isSafariOnMacIOS = function () {
        return isMacOs() && isSafari();
    };

    var isChrome = function () {
        return navigator.userAgent.indexOf('Chrome') !== -1 && navigator.userAgent.indexOf('Edge') === -1;
    };

    var isChromium = function () {
        return !General.isNullOrUndefined(window.chrome);
    };

    var isAndroidApp = function () {
        var cookie = window.CookieHandler.ReadCookie('NativeAndroidApp');
        return cookie !== null && cookie === 'true';
    };

    var isIosApp = function () {
        var cookie = window.CookieHandler.ReadCookie('NativeIosApp');
        return cookie !== null && cookie === 'true';
    };

    var getOperatingSystemNameAndVersion = function () {
        if (inScopeWindowObject.navigator.userAgent.indexOf("Windows NT 10.0") != -1) return "Windows 10";
        if (inScopeWindowObject.navigator.userAgent.indexOf("Windows NT 6.2") != -1) return "Windows 8";
        if (inScopeWindowObject.navigator.userAgent.indexOf("Windows NT 6.1") != -1) return "Windows 7";
        if (inScopeWindowObject.navigator.userAgent.indexOf("Windows NT 6.0") != -1) return "Windows Vista";
        if (inScopeWindowObject.navigator.userAgent.indexOf("Windows NT 5.1") != -1) return "Windows XP";
        if (inScopeWindowObject.navigator.userAgent.indexOf("Windows NT 5.0") != -1) return "Windows 2000";
        if ((inScopeWindowObject.navigator.userAgent.indexOf("Mac OS X 10_5") != -1) ||
            (inScopeWindowObject.navigator.userAgent.indexOf("Mac OS X 10.5") != -1)) return "Mac 10.5";
        if ((inScopeWindowObject.navigator.userAgent.indexOf("Mac OS X 10_6") != -1) ||
            (inScopeWindowObject.navigator.userAgent.indexOf("Mac OS X 10.6") != -1)) return "Mac 10.6";
        if ((inScopeWindowObject.navigator.userAgent.indexOf("Mac OS X 10_7") != -1) ||
            (inScopeWindowObject.navigator.userAgent.indexOf("Mac OS X 10.7") != -1)) return "Mac 10.7";
        if ((inScopeWindowObject.navigator.userAgent.indexOf("Mac OS X 10_8") != -1) ||
            (inScopeWindowObject.navigator.userAgent.indexOf("Mac OS X 10.8") != -1)) return "Mac 10.8";
        if (inScopeWindowObject.navigator.userAgent.indexOf("X11") != -1) return "UNIX";
        if (inScopeWindowObject.navigator.userAgent.indexOf("Linux") != -1) return "Linux";

        return inScopeWindowObject.navigator.userAgent;
    };

    var getScreenResolution = function () {
        return inScopeWindowObject.screen.width + 'x' + inScopeWindowObject.screen.height;
    };

    var getLargestResolutionDimension = function () {
        return Math.max(inScopeWindowObject.screen.width, inScopeWindowObject.screen.height);
    };

    var detectPassiveEventListenersSupport = function () {
        try {
            var options = Object.defineProperty({}, "passive", {
                get: function () {
                    passiveSupported = true;
                }
            });

            window.addEventListener("test", options, options);
            window.removeEventListener("test", options, options);
        } catch (err) {
            return false;
        }

        return true;
    };

    var passiveSupported = detectPassiveEventListenersSupport();

    var isPassiveEventListenersSupported = function () {
        return passiveSupported;
    };

    /**
    * https://stackoverflow.com/questions/21741841/detecting-ios-android-operating-system
    * Determine the mobile operating system.
    * This function returns one of 'iOS', 'Android', 'Windows Phone', or 'unknown'.
    *
    * @returns {String}
    */
    var getMobileOperatingSystem = function () {
        var userAgent = navigator.userAgent || navigator.vendor || window.opera;

        // Windows Phone must come first because its UA also contains "Android"
        if (/windows phone/i.test(userAgent)) {
            return "Windows Phone";
        }

        if (/android/i.test(userAgent)) {
            return "Android";
        }

        // iOS detection from: http://stackoverflow.com/a/9039885/177710
        if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
            return "iOS";
        }

        return "unknown";
    }

    var isIeEdgePrivateMode = function () {
        //IE or Edge don't have window.indexedDB
        //window.MSPointerEvent is undefined in Edge

        return (!window.indexedDB && (window.PointerEvent || window.MSPointerEvent));
    }

    var isSafariMobile = function () {
        return navigator.userAgent.match(/(iPod|iPhone|iPad)/) && navigator.userAgent.match(/AppleWebKit/);
    }

    function getBrowserDetails() {
        return {
            screenColorDept: screen.colorDepth,
            screenHeight: screen.height,
            screenWidth: screen.width,
            screenResolution: screen.pixelDepth,
            javaEnabled: navigator.javaEnabled(),
            javaScriptEnabled: true,
            language: navigator.language,
            timeZoneOffset: new Date().getTimezoneOffset(),
            userAgent: navigator.userAgent.substr(0, 2048)
        };
    }

    function getAllBrowserInfo() {
        'use strict';

        var module = {
            options: [],
            header: [navigator.platform, navigator.userAgent, navigator.appVersion, navigator.vendor, window.opera],
            dataos: [
                { name: 'Windows Phone', value: 'Windows Phone', version: 'OS' },
                { name: 'Windows', value: 'Win', version: 'NT' },
                { name: 'iPhone', value: 'iPhone', version: 'OS' },
                { name: 'iPad', value: 'iPad', version: 'OS' },
                { name: 'Kindle', value: 'Silk', version: 'Silk' },
                { name: 'Android', value: 'Android', version: 'Android' },
                { name: 'PlayBook', value: 'PlayBook', version: 'OS' },
                { name: 'BlackBerry', value: 'BlackBerry', version: '/' },
                { name: 'Macintosh', value: 'Mac', version: 'OS X' },
                { name: 'Linux', value: 'Linux', version: 'rv' },
                { name: 'Palm', value: 'Palm', version: 'PalmOS' }
            ],
            databrowser: [
                { name: 'Chrome', value: 'Chrome', version: 'Chrome' },
                { name: 'Firefox', value: 'Firefox', version: 'Firefox' },
                { name: 'Safari', value: 'Safari', version: 'Version' },
                { name: 'Internet Explorer', value: 'MSIE', version: 'MSIE' },
                { name: 'Opera', value: 'Opera', version: 'Opera' },
                { name: 'BlackBerry', value: 'CLDC', version: 'CLDC' },
                { name: 'Mozilla', value: 'Mozilla', version: 'Mozilla' }
            ],
            init: function () {
                var agent = this.header.join(' '),
                    os = this.matchItem(agent, this.dataos),
                    browser = this.matchItem(agent, this.databrowser);

                return { os: os, browser: browser };
            },
            matchItem: function (string, data) {
                var i = 0,
                    j = 0,
                    html = '',
                    regex,
                    regexv,
                    match,
                    matches,
                    version;

                for (i = 0; i < data.length; i += 1) {
                    regex = new RegExp(data[i].value, 'i');
                    match = regex.test(string);
                    if (match) {
                        regexv = new RegExp(data[i].version + '[- /:;]([\\d._]+)', 'i');
                        matches = string.match(regexv);
                        version = '';
                        if (matches) { if (matches[1]) { matches = matches[1]; } }
                        if (matches) {
                            matches = matches.split(/[._]+/);
                            for (j = 0; j < matches.length; j += 1) {
                                if (j === 0) {
                                    version += matches[j] + '.';
                                } else {
                                    version += matches[j];
                                }
                            }
                        } else {
                            version = '0';
                        }
                        return {
                            name: data[i].name,
                            version: parseFloat(version)
                        };
                    }
                }
                return { name: 'unknown', version: 0 };
            }
        };

        return module.init();
    }

    return {
        getMobileOperatingSystem: getMobileOperatingSystem,
        isPassiveEventListenersSupported: isPassiveEventListenersSupported,
        isInternetExplorer: isInternetExplorer,
        isEdge: isEdge,
        isIEVersionGreaterThen: isIEVersionGreaterThen,
        isDefinePropertySupported: isDefinePropertySupported,
        getBrowserName: getBrowserName,
        getBrowserVersion: getBrowserVersion,
        getOperatingSystemName: getOperatingSystemName,
        getOperatingSystemNameAndVersion: getOperatingSystemNameAndVersion,
        getScreenResolution: getScreenResolution,
        getLargestResolutionDimension: getLargestResolutionDimension,
        isChromeOnIOS: isChromeOnIOS,
        isMacOs: isMacOs,
        isSafariOnMacIOS: isSafariOnMacIOS,
        isChrome: isChrome,
        isChromium: isChromium,
        isAndroidApp: isAndroidApp,
        isIosApp: isIosApp,
        replaceWindowWith: function (newWindow) { inScopeWindowObject = newWindow; },
        isIeEdgePrivateMode: isIeEdgePrivateMode,
        isSafariMobile: isSafariMobile,
        getiosDevices: getiosDevices,
        forceRepaintIosRotate: forceRepaintIosRotate,
        getBrowserDetails: getBrowserDetails,
        FullBrowserInfo: getAllBrowserInfo()
    };
})();
;
$(document).ready(function () {
    UserDeviceInformation.init();
});

var UserDeviceInformation = {
    init: function () {
        this.setUserDeviceResolutionCookie();
        this.setResolutionSpecificDomElements();
    },

    setUserDeviceResolutionCookie: function () {

        var udi = CookieHandler.ReadCookie("UserDeviceInformation");
        if (udi != null) {
            var isReturningUser = udi.split('|')[0];
            var showMobileReferralLink = udi.split('|')[2];

            CookieHandler.CreateCookie("UserDeviceInformation", isReturningUser + "|" + Browser.getLargestResolutionDimension().toString() + "|" + showMobileReferralLink, (new Date()).AddDays(Model.UserDeviceInformationCookieExpirationDays));
        }
    },

    setResolutionSpecificDomElements: function () {
        var udi = CookieHandler.ReadCookie("UserDeviceInformation");
        if (udi != null) {
            var showMobileReferralLink = udi.split('|')[2];
            if (showMobileReferralLink.toLowerCase() == "true") {
                $('#Footer .mobilePlatformLink.contactIconItem').addClass('visible').closest('.features').addClass('mobileLinkVisible');
            }
        }
    }
};
;
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define('tracking/loggers/datalayer', [], factory);
    } else {
        root.dataLayer = factory(root);
    }
}(typeof self !== 'undefined' ? self : this, function (root) {
    root = root || window;
    root.dataLayer = root.dataLayer || [];

    var _dataLayer = root.dataLayer,
        maxDataLayerLength = 350, //GTM has 300
        _isGTMActive;

    function isGTMEnabled() {
        if (typeof _isGTMActive !== 'boolean') {
            for (var idx = 0; idx < _dataLayer.length; idx++) {
                if (!_dataLayer[idx]) {
                    continue;
                }

                var event = _dataLayer[idx].event || '';

                if (0 === event.indexOf('gtm.')) {
                    _isGTMActive = true;
                    break;
                }
            }
        }

        _isGTMActive = _isGTMActive || false;

        return _isGTMActive;
    }

    function truncateDataLayer() {
        if (maxDataLayerLength > _dataLayer.length) {
            return;
        }

        //if GTM is loaded size is managed by him 
        if (isGTMEnabled()) {
            return;
        } else {
            for (; maxDataLayerLength < _dataLayer.length;)
                _dataLayer.shift();
        }
    }

    function _newPush() {
        var pushParams = [].slice.call(arguments, 0);

        var g = _dataLayer.originalPush.apply(_dataLayer, pushParams);

        //call subscribers
        _dataLayer.subscribers.forEach(function (f) {
            try {
                f.apply(this, pushParams);
            } catch (e) { }
        });

        truncateDataLayer();

        var h = ("boolean" !== typeof g) || g;
        return h;
    }

    _dataLayer.init = function () {

        _dataLayer.originalPush = _dataLayer.push;
        _dataLayer.push = _newPush;

        _dataLayer.subscribers = [];
        _dataLayer.subscribers.originalPush = _dataLayer.subscribers.push;

        _dataLayer.subscribers.push = function (s) {
            if (0 > _dataLayer.subscribers.indexOf(s)) {
                var pushParams = [].slice.call(arguments, 0);
                _dataLayer.subscribers.originalPush.apply(_dataLayer.subscribers, pushParams);
            }
        }
    }

    return _dataLayer;
}));
;
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define('tracking/googleTagManager', ['tracking/loggers/datalayer'], factory);
    } else {
        root.googleTagManager = factory(root.dataLayer);
    }
}(typeof self !== 'undefined' ? self : this, function (dataLayer) {
    var googleTagManagerAccountId;

    function init(gAccId) {
        googleTagManagerAccountId = gAccId;
        doGoogleTagManager();
    }

    function startChat() {
        try {
            dataLayer.push({ "event": "start-chat" });
        } catch (ex) {
            ErrorManager.onError('startChat', 'Google Tag Manager has failed', eErrorSeverity.low);
        }
    }

    function configAttributes(oAttributes) {
        ko.postbox.publish(eFxNetEvents.GtmConfigurationSet, oAttributes);
    }

    function doGoogleTagManager() {

        var w = window;
        var d = document;
        var s = 'script';
        var l = 'dataLayer';
        var i = googleTagManagerAccountId;

        w[l] = w[l] || [];
        w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
        var f = d.getElementsByTagName(s)[0],
            j = d.createElement(s),
            dl = l != 'dataLayer' ? '&l=' + l : '';
        j.async = true;
        j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl; f.parentNode.insertBefore(j, f);

    }

    window.googleTagManager = {
        Init: init,
        StartChat: startChat,
        ConfigAttributes: configAttributes
    }

    return window.googleTagManager;
}));
;
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define('tracking/EventRaiser',
            [
                'jquery'
            ], factory);
    } else if (typeof exports === 'object') {
        // CommonJS
        module.exports = factory();
    } else {
        // running in browser
        root.TrackingEventRaiser = factory;
    }
})(typeof self !== 'undefined' ? self : this,
    function TrackingEventRaiser() {
        // IE<9 Date.now() fix
        Date.now = Date.now || function () { return + new Date(); };

        /**
         * Adds a leading zero to a number
         * @param {Number} number 
         * @returns {String}
         */
        function padNumber(number) {
            return ('0' + number).slice(-2);
        }

        /**
         * Formats a Date object as a `dd/mm/yyyy hh:mm:ss` string
         * @param {Date} date 
         * @returns {String} 
         */
        function formatEventDate(date) {
            var formattedDateString = padNumber(date.getDate()) + '/' +
                padNumber(date.getMonth() + 1) + '/' +
                date.getFullYear() + ' ' +
                padNumber(date.getHours()) + ':' +
                padNumber(date.getMinutes()) + ':' +
                padNumber(date.getSeconds());

            return formattedDateString;
        }

        function getEventTime() {
            var eventTime;

            if (typeof $cacheManager !== 'undefined') {
                eventTime = formatEventDate($cacheManager.ServerTime());
            }
            else {
                eventTime = formatEventDate(new Date(Date.now() + (new Date().getTimezoneOffset() * 60 * 1000)));
            }

            return eventTime;
        }

        var eventData = {};

        function addEventTime() {
            eventData.EventTime = getEventTime();
        }

        function callGoogleApi() {
            try {
                window.dataLayer.push(getEventDataClone());
            }
            catch (ex) {
                ErrorManager.onError('callGoogleApi', 'Google Tag Manager has failed for event: ' + eventData.event, eErrorSeverity.high);
            }
        }

        function getEventDataClone() {
            return $.extend(true, {}, eventData);
        }

        function clean() {
            for (var prop in eventData) {
                if (eventData.hasOwnProperty(prop)) {
                    delete eventData[prop];
                }
            }
        }

        function raiseEvent() {
            addEventTime();
            callGoogleApi();
            clean();
        }

        return {
            eventData: eventData,
            raiseEvent: raiseEvent,
            formatEventDate: formatEventDate
        };
    }
);

;
var TrackingCommonData = function () {
	return function (storage) {
		var _sessionStorage = storage;

		function getCountryNameByIp() {
			if (typeof systemInfo !== "undefined") return systemInfo.countryNameByIP;
			if (window.Model !== "undefined") return window.Model.CountryNameByIP;

			return "";
		}

		function getBrowserPropertyValue() {
			if (window.CookieHandler) {
				if (
					window.CookieHandler.ReadCookie("NativeIosApp") !== null &&
					window.CookieHandler.ReadCookie("NativeIosApp") === "true"
				) {
					return "App iPhone";
				}

				if (
					window.CookieHandler.ReadCookie("NativeAndroidApp") != null &&
					window.CookieHandler.ReadCookie("NativeAndroidApp") === "true"
				) {
					return "App Android";
				}
			}

			return Browser.getBrowserName();
		}

		function getDevice() {
			return window.environmentData && window.environmentData.isDesktop
				? "Desktop"
				: CookieHandler.ReadCookie("ViewMode");
		}

		function renewTrackingSessionId() {
			var newTrackingSessionId = Math.random();
			_sessionStorage.setItem("TrackingSessionId", newTrackingSessionId.toString());
		}

		function getTrackingSessionId() {
			if (_sessionStorage.getItem("TrackingSessionId") == null) {
				renewTrackingSessionId();
			}

			return _sessionStorage.getItem("TrackingSessionId");
		}

		return {
			IPCountry: getCountryNameByIp(),
			ResolutionScreen: Browser.getScreenResolution(),
			OS: Browser.getOperatingSystemName(),
			OSVersion: Browser.getOperatingSystemNameAndVersion(),
			Browser: getBrowserPropertyValue(),
			BrowserVersion: Browser.getBrowserVersion(),
			Device: getDevice(),
			TrackingSessionId: getTrackingSessionId(),
			Language: CookieHandler.ReadCookie("Language"),
		};
	};
};

(function (root, factory) {
	if (typeof define === "function" && define.amd) {
		// AMD. Register as an anonymous module.
		define([], factory);
	} else {
		// Browser globals
		root = factory();
	}
})(typeof self !== "undefined" ? self : this, function () {
	// Use b in some fashion.

	// Just return a value to define the module export.
	// This example returns an object, but the module
	// can return a function as the exported value.
	return TrackingCommonData();
});

;
var AdditionalProperties = function () {
    var events = { ViewedPassword: 'ViewedPassword', ChangedCountry: 'ChangedCountry' },
        data = { ViewedPassword: false, ViewedPrivacy: false, ViewedAgreement: false, ChangedCountry: false };

    var init = function () {
        window.additionalPropertiesCallbacks = $.Callbacks();
        window.additionalPropertiesCallbacks.add(consumeAdditionalPropertiesEvent);

        window.externalEventsCallbacks.add(consumeExternalEvent);
    };

    var consumeAdditionalPropertiesEvent = function (eventName) {
        switch (eventName) {
            case events.ViewedPassword:
                consumeViewedPasswordEvent();
                break;
            case events.ChangedCountry:
                consumeChangedCountryEvent();
                break;
        }
    };
    
    var consumeExternalEvent = function (eventName) {
        if (eventName == 'registration-view') {
            bindToRegistrationUserInteractionEvents();
        }
    };

    var bindToRegistrationUserInteractionEvents = function () {
        var privacyLinkSelector = '#RegistrationForm a#chkDisclaimer4',
            agreementsLinkSelector = '#RegistrationForm a#chkDisclaimer1',
			experiencedUserSelector = '#RegistrationForm input:radio[name="UserWithExperience"]';

        $(privacyLinkSelector).click(function () {
            data.ViewedPrivacy = true;
        });
        
        $(agreementsLinkSelector).click(function () {
            data.ViewedAgreement = true;
        });

	    $(experiencedUserSelector).on('change', function() {
		    data.UserWithExperience = this.value.toLowerCase() === 'true' ? "Yes": "No";
	    });
    };

    var consumeViewedPasswordEvent = function () {
        data.ViewedPassword = true;
    };
    
    var consumeChangedCountryEvent = function () {
        data.ChangedCountry = true;
    };

    return {
        init: init,
        data: data
    };
}
;
var TrackingData = function () {
    var properties = {},
        wasInitialized = false,
        registrationPageModel = {},
        additionalProperties = new AdditionalProperties();
    
    var init = function () {
        properties = TrackingCommonData()(StorageFactory(StorageFactory.eStorageType.session));
        additionalProperties.init();
    };

    var getProperties = function () {
        if (!wasInitialized) {
            init();
            wasInitialized = true;
        }

        return properties;
    };


    return {
        init: init,
        getProperties: getProperties,
        registrationPageModel: registrationPageModel,
        additionalProperties: additionalProperties
    };
};

window.trackingData = new TrackingData();
;
function TrackingExternalEvents(eventRaiser) {
	var self = {};
	self.getCurrentEventData = function () {
		return eventRaiser.eventData;
	};

	function removeParametersFromReferrerUrl(referrerUrl) {
		return referrerUrl.split("?")[0];
	}

	if (window.environmentData && window.environmentData.isDesktop)
		self.raiseEvent = function (name) {
			eventRaiser.eventData.event = name;
			eventRaiser.raiseEvent();
			return;
		};
	// todo temporary patch. smell bad
	// consider to reuse the rest of the specific handling for next drop
	// else regular behavior is used in external

	self["account-type-view"] = function () {
		eventRaiser.eventData.event = "account-type-view";
		eventRaiser.eventData.Referrer = removeParametersFromReferrerUrl(document.referrer);
		eventRaiser.raiseEvent();
	};

	self["demo-click"] = function () {
		eventRaiser.eventData.event = "demo-click";
		eventRaiser.raiseEvent();
	};

	self["real-click"] = function () {
		eventRaiser.eventData.event = "real-click";
		eventRaiser.raiseEvent();
	};

	self["registration-view"] = function (eventData) {
		if (eventData) {
			Object.assign(eventRaiser.eventData, eventData);
		}
		eventRaiser.eventData.event = "registration-view";
		eventRaiser.eventData.Referrer = removeParametersFromReferrerUrl(document.referrer);
		eventRaiser.raiseEvent();
	};

	self["registration-interaction"] = function () {
		eventRaiser.eventData.event = "registration-interaction";
		eventRaiser.raiseEvent();
	};

	self["registration-submit"] = function (options) {
		eventRaiser.eventData.event = "registration-submit";

		eventRaiser.eventData.ViewedPassword = window.trackingData.additionalProperties.data.ViewedPassword;
		eventRaiser.eventData.ViewedPrivacy = window.trackingData.additionalProperties.data.ViewedPrivacy;
		eventRaiser.eventData.ViewedAgreement = window.trackingData.additionalProperties.data.ViewedAgreement;
		eventRaiser.eventData.ChangedCountry = window.trackingData.additionalProperties.data.ChangedCountry;
		eventRaiser.eventData.UserWithExperience = window.trackingData.additionalProperties.data.UserWithExperience;
		eventRaiser.eventData.SAProcess = options ? options.saRegistration : 0;
		eventRaiser.raiseEvent();
	};

	self["registration-error"] = function (options) {
		eventRaiser.eventData.event = "registration-error";
		eventRaiser.eventData.Type = options.type;
		eventRaiser.eventData.Reason = options.reason;
		if (options.hasOwnProperty("errorMessage")) {
			eventRaiser.eventData.ErrorMessage = options.errorMessage;
		}
		eventRaiser.raiseEvent();
	};

	self["login-error"] = function (options) {
		eventRaiser.eventData.event = "login-error";
		eventRaiser.eventData.Type = options.type;
		eventRaiser.eventData.Reason = options.reason;
		if (options.hasOwnProperty("errorMessage")) {
			eventRaiser.eventData.ErrorMessage = options.errorMessage;
		}
		eventRaiser.raiseEvent();
	};

	self["request-new-password-error"] = function (options) {
		eventRaiser.eventData.event = "request-new-password-error";
		eventRaiser.eventData.Type = options.type;
		eventRaiser.eventData.Reason = options.reason;
		if (options.hasOwnProperty("errorMessage")) {
			eventRaiser.eventData.ErrorMessage = options.errorMessage;
		}
		eventRaiser.raiseEvent();
	};

	self["forgot-password-error"] = function (options) {
		eventRaiser.eventData.event = "forgot-password-error";
		eventRaiser.eventData.Type = options.type;
		eventRaiser.eventData.Reason = options.reason;
		if (options.hasOwnProperty("errorMessage")) {
			eventRaiser.eventData.ErrorMessage = options.errorMessage;
		}
		eventRaiser.raiseEvent();
	};

	self["registration-success"] = function (options) {
		eventRaiser.eventData.event = "registration-success";
		eventRaiser.eventData.SAProcess = options.saRegistration;
		eventRaiser.eventData.AccountNumber = options.accountNumber;
		eventRaiser.eventData.Referrer = removeParametersFromReferrerUrl(document.referrer);
		eventRaiser.raiseEvent();
	};

	self["login-view"] = function (eventData) {
		if (eventData) {
			Object.assign(eventRaiser.eventData, eventData);
		}
		eventRaiser.eventData.event = "login-view";
		eventRaiser.eventData.Referrer = removeParametersFromReferrerUrl(document.referrer);
		eventRaiser.raiseEvent();
	};

	self["login-interaction"] = function () {
		eventRaiser.eventData.event = "login-interaction";
		eventRaiser.raiseEvent();
	};

	self["login-submit"] = function (options) {
		eventRaiser.eventData.event = "login-submit";
		eventRaiser.eventData.IsAutologin = options.isAutologin;
		eventRaiser.eventData.Type = options.type;
		eventRaiser.raiseEvent();
	};

	self["request-new-password-view"] = function () {
		eventRaiser.eventData.event = "request-new-password-view";
		eventRaiser.raiseEvent();
	};

	self["request-new-password-interaction"] = function () {
		eventRaiser.eventData.event = "request-new-password-interaction";
		eventRaiser.raiseEvent();
	};

	self["request-new-password-submit"] = function () {
		eventRaiser.eventData.event = "request-new-password-submit";
		eventRaiser.raiseEvent();
	};

	self["request-new-password-success"] = function () {
		eventRaiser.eventData.event = "request-new-password-success";
		eventRaiser.raiseEvent();
	};

	self["forgot-password-view"] = function () {
		eventRaiser.eventData.event = "forgot-password-view";
		eventRaiser.eventData.Referrer = removeParametersFromReferrerUrl(document.referrer);
		eventRaiser.raiseEvent();
	};

	self["forgot-password-interaction"] = function () {
		eventRaiser.eventData.event = "forgot-password-interaction";
		eventRaiser.raiseEvent();
	};

	self["forgot-password-submit"] = function () {
		eventRaiser.eventData.event = "forgot-password-submit";
		eventRaiser.raiseEvent();
	};

	self["change-language"] = function () {
		eventRaiser.eventData.event = "change-language";
		eventRaiser.eventData.Language = CookieHandler.ReadCookie("Language");
		eventRaiser.raiseEvent();
	};

	return self;
}

;
var JqueryValidateHooks = function($form, onErrorOccurredCallback) {
    var keyUpEvent = false,
    checkFormEvent = false,
    focusOutEvent = false;
    
    var init = function () {
        var validator = $form.data('validator');

        hookToTrackErrorRegistration(validator);

        hookToTrackKeyUpEvent(validator);
        hookToTrackFocusOutEvent(validator);
        hookToTrackCheckFormEvent(validator);
    };

    var hookToTrackErrorRegistration = function (validator) {
        var originalMethod = validator.formatAndAdd;
        validator.formatAndAdd = function (element, rule) {
            originalMethod.apply(this, arguments);
            if (shouldRaiseTheEvent()) {
                onErrorOccurredCallback.call(null, getContentKeyValue(element, rule.method));
            }
            keyUpEvent = false;
        };
    };

    var hookToTrackKeyUpEvent = function (validator) {
        var originalMethod = validator.settings.onkeyup;
        validator.settings.onkeyup = function () {
            keyUpEvent = true;
            focusOutEvent = false;
            checkFormEvent = false;
            originalMethod.apply(this, arguments);
        };
    };

    var hookToTrackFocusOutEvent = function (validator) {
        var originalMethod = validator.settings.onfocusout;
        validator.settings.onfocusout = function () {
            focusOutEvent = true;
            keyUpEvent = false;
            originalMethod.apply(this, arguments);
        };
    };

    var hookToTrackCheckFormEvent = function (validator) {
        var originalMethod = validator.checkForm;
        validator.checkForm = function () {
            checkFormEvent = true;
            keyUpEvent = false;
            focusOutEvent = false;

            originalMethod.apply(this, arguments);
        };
    };

    var shouldRaiseTheEvent = function () {
        return !keyUpEvent && !(focusOutEvent && checkFormEvent);
    };

    var getContentKeyValue = function (element, rule) {
        var attributeName = 'val-' + rule.toLowerCase() + '-contentkey';

        return $(element).data(attributeName);
    };

    return {
        init: init
    };
};
;
var ValidationErrorsTracker = function () {
    var errorEventName = null;
    
    var formSelectors = {
            registrationForm: '#RegistrationForm',
            loginForm: '#LoginForm',
            forgotPasswordRequestForm: '#ForgotPasswordRequestForm',
            forgotPasswordResetForm: '#ForgotPasswordResetForm'
        };
    
    var init = function() {
        window.externalEventsCallbacks.add(onExternalEvent);
    };

    var onExternalEvent = function (eventName) {
        var $currentForm = null;

        switch (eventName) {
            case 'registration-view':
            {
                $currentForm = $(formSelectors.registrationForm);
                errorEventName = 'registration-error';
                break;
            }
            case 'login-view':
            {
                $currentForm = $(formSelectors.loginForm);
                errorEventName = 'login-error';
                break;
            }
            case 'request-new-password-view':
            {
                $currentForm = $(formSelectors.forgotPasswordRequestForm);
                errorEventName = 'request-new-password-error';
                break;
            }
            case 'forgot-password-view':
            {
                $currentForm = $(formSelectors.forgotPasswordResetForm);
                errorEventName = 'forgot-password-error';
                break;
            }
        }
        // if SC is Desktop than $currentForm do not exist
        if ($currentForm !== null && $currentForm.length > 0) {
            new JqueryValidateHooks($currentForm, onjQueryValidateError).init();
            checkForServerSideErrors($currentForm);
        }
    };

    var onjQueryValidateError = function(contentKey) {
        window.trackingEventsCollector.consumeEvent(errorEventName, { type: 'client', reason: contentKey });
    }
    
    var checkForServerSideErrors = function ($form) {
        findInlineServerSideErros($form);
        findValidationSummaryErros($form);
    };

    var findInlineServerSideErros = function ($form) {
		var errorInput = $form.find('input[name="validationErrorsContentKey"]');
    	if (errorInput.length > 0) {
    		var reason = errorInput.val();

			if (reason == '') {
				return;
			}

            window.trackingEventsCollector.consumeEvent(errorEventName, { type: 'server', reason: reason });
        }
    };
    
    var findValidationSummaryErros = function ($form) {
        $form.find('div.validation-summary-errors:visible').each(function (index, element) {
            window.trackingEventsCollector.consumeEvent(errorEventName, { type: 'server', errorMessage: $(element).text() });
        });
    };

    return {
        init: init
    };
};


;
function TrackingEventsCollector(ko, eventsCollection, externalPages) {
    var uiLoaded = false, scmmDataLoaded = false,
        customerDataLoaded = false, eventsQueue = [], trackingGlobalData = {};;

    function init(trackingData, evCollection) {
        trackingGlobalData = trackingData;
        eventsCollection = evCollection || eventsCollection;

        if (externalPages) {
            uiLoaded = true;
            scmmDataLoaded = true;
            customerDataLoaded = true;

            // desktop specific elimination :
            if (!window.environmentData || !window.environmentData.isDesktop) {
                window.externalEventsCallbacks.add(consumeEvent);
            }
        }
        else {
            ko.postbox.subscribe('trading-event', consumeEvent);
            ko.postbox.subscribe('ui-loaded', onUiFinishedLoading);
            ko.postbox.subscribe('scmm-data-loaded', onScmmDataLoaded);
            ko.postbox.subscribe('customer-data-loaded', onCustomerDataLoaded);
        }
    }

    function onUiFinishedLoading() {
        uiLoaded = true;

        if (eventsResourcesLoaded()) {
            executeAllQueuedEvents();
        }

        consumeEvent("exposeUI");
    }

    function onScmmDataLoaded() {
        scmmDataLoaded = true;

        if (eventsResourcesLoaded()) {
            executeAllQueuedEvents();
        }
    }

    function onCustomerDataLoaded() {
        customerDataLoaded = true;

        if (eventsResourcesLoaded()) {
            executeAllQueuedEvents();
        }
    }

    function executeAllQueuedEvents() {
        while( eventsQueue.length > 0){
            var element = eventsQueue.shift();
            consumeEvent(element.eventName, element.additionalData);

        }
        
    }

    function consumeEvent(eventName, additionalData) {
        if (!eventsResourcesLoaded()) { // push events to queue if resources for the events did not load yet
            eventsQueue.push({ eventName: eventName, additionalData: additionalData });
            return;
        }

        addGlobalPropertiesToCurrentEvent();

        //on smart client tracking
        if (window.environmentData && window.environmentData.isDesktop) {
            Object.assign(eventsCollection.getCurrentEventData(), additionalData);
            eventsCollection.raiseEvent(eventName);
            return;
        }

        eventsCollection[eventName](additionalData);
    }

    function eventsResourcesLoaded() {
        return uiLoaded && scmmDataLoaded && customerDataLoaded;
    }

    function addGlobalPropertiesToCurrentEvent() {
        Object.assign(eventsCollection.getCurrentEventData(), trackingGlobalData.getProperties());
    }

    return {
        init: init,
        consumeEvent: consumeEvent
    };
};
;
/*global trackingData*/
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define('tracking/loggers/pagenocaptcha', ['tracking/loggers/datalayer', 'tracking/loggers/gglanalyticslogger'], factory);
    } else {
        root.fxTracking = root.fxTracking || {};
        root.fxTracking.pageNoCaptcha = factory(root.dataLayer);
    }
}(typeof self !== 'undefined' ? self : this, function (dataLayer) {
    function init() {
        var attempts = 0;
        var waitForAccountNumber = function () {
            attempts += 1;
            if (attempts > 40) return;
            if (
              typeof trackingData == "undefined" ||
              typeof trackingData.getProperties == "undefined" ||
              typeof trackingData.getProperties().AccountNumber == "undefined"
            ) {
                window.setTimeout(waitForAccountNumber, 250);
            } else {
                var data;
                if (trackingData.getProperties().SAProcess) {
                    var userid = trackingData.getProperties().AccountNumber;
                    data = {
                        event: "load-google-analytics",
                        gauserid: userid,
                        gaclientid: ""
                    };
                } else {
                    data = {
                        event: "load-google-analytics",
                        gauserid: "",
                        gaclientid: ""
                    };
                }

                dataLayer.push(data);
            }
        };

        if (null === window.location.href.match(/\/Parse/i)) {
            if (document.location.href.match(/\/login/i)) {
                if (document.location.search.match(/sauser=true/)) {
                    try {
                        window.localStorage.setItem("sauser", true);
                    } catch (e) { }
                }

                var gaclientid = "";
                try {
                    gaclientid = window.localStorage.getItem("gaclientid") || "";
                } catch (e) { }
                var data = {
                    event: "load-google-analytics",
                    gauserid: "",
                    gaclientid: gaclientid
                };

                dataLayer.push(data);
            } else {
                waitForAccountNumber();
            }
        }
    }

    return {
        init: init
    };
}));

;
/*global trackingData*/
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define('tracking/loggers/pagewithcaptcha',
            ['tracking/loggers/datalayer', 'tracking/loggers/gglanalyticslogger'],
            factory);
    } else {
        root.fxTracking = root.fxTracking || {};
        root.fxTracking.pageWithCaptcha = factory(root.dataLayer);
    }
}(typeof self !== 'undefined' ? self : this, function (dataLayer) {
    function init() {
        var attempts = 0;

        var waitForMeta = function () {
            attempts += 1;
            if (attempts > 40) return;
            if (
              typeof trackingData == "undefined" ||
              typeof trackingData.getProperties == "undefined" ||
              typeof trackingData.getProperties().Meta == "undefined"
            ) {
                window.setTimeout(waitForMeta, 250);
            } else {
                var meta = trackingData.getProperties().Meta;
                if (meta.gaclientid) {
                    try {
                        window.localStorage.setItem("gaclientid", meta.gaclientid);
                    } catch (e) { }
                }
                var data = {
                    event: "load-google-analytics",
                    gauserid: "",
                    gaclientid: meta.gaclientid || ""
                };

                dataLayer.push(data);
            }
        };

        if (null !== window.location.href.match(/\/Parse/i)) {
            waitForMeta();
        }
    }

    return {
        init: init
    };
}));

;
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define('tracking/loggers/gglanalitycsconfigs', [], factory);
    } else {
        root.fxTracking = root.fxTracking || {};
        root.fxTracking.gglAnalitycsConfigs = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {

    var eventSections = {
        'account-type-view': 'Registration',
        'registration-view': 'Registration',
        'demo-click': 'Registration',
        'real-click': 'Registration',
        'registration-interaction': 'Registration',
        'registration-submit': 'Registration',
        'registration-error': 'Registration',
        'registration-success': 'Registration',

        'login-view': 'Login',
        'login-success': 'Login',
        'login-interaction': 'Login',
        'login-error': 'Login',
        'login-submit': 'Login',

        'deal-slip-view': 'Deal',
        'deal-slip-interaction': 'Deal',
        'deal-slip-submit': 'Deal',
        'deal-slip-success': 'Deal',
        'deal-slip-error': 'Deal'
    };
    var viewNames = {
        '1': 'Main',
        '2': 'Open Deals',
        '3': 'Limits',
        '4': 'Closed Deals',
        '5': 'Account Statement',
        '15': 'Trading Signals',
        '12': 'View and Print Withdrawal',
        '51': 'Change Password',
        '28': 'Upload Documents',
        '30':'Trading Signals'
    };

    function getSection(eventName) {
        return eventSections[eventName] || 'None';
    }

    function getName(viewId) {
        return viewNames[viewId] || viewId;
    }

    return {
        GetSection: getSection,
        GetName: getName
    };
}));
;
/*global trackingData */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define('tracking/loggers/gglanalyticslogger', [
            'tracking/loggers/datalayer',
            'tracking/loggers/pagenocaptcha',
            'tracking/loggers/pagewithcaptcha'
        ], factory);
    } else {
        root.fxTracking = root.fxTracking || {};
        root.fxTracking.gglAnalyticsLogger = factory(root.dataLayer, root.fxTracking.pageNoCaptcha, root.fxTracking.pageWithCaptcha);
    }
}(typeof self !== 'undefined' ? self : this, function (dataLayer, pageNoCaptcha, pageWithCaptcha) {

    function _loadAnalytics() {
        // store the name of the Analytics object
        window.GoogleAnalyticsObject = 'ga';

        // check whether the Analytics object is defined
        if (!('ga' in window)) {

            // define the Analytics object
            window.ga = function () {

                // add the tasks to the queue
                window.ga.q.push(arguments);

            };

            // create the queue
            window.ga.q = [];

        }

        // store the current timestamp
        window.ga.l = (new Date()).getTime();

        // create a new script element
        var script = document.createElement('script');
        script.src = '//www.google-analytics.com/analytics.js';
        script.async = true;

        // insert the script element into the document
        var firstScript = document.getElementsByTagName('script')[0];
        firstScript.parentNode.insertBefore(script, firstScript);
    }

    function loadAnalytics(obj) {
        if (!(obj && obj.event === 'load-google-analytics')) {
            return;
        }

        _loadAnalytics();

        var gaclientid = obj.gaclientid || '',
            gauserid = obj.gauserid || '',
            sauser;
        try {
            sauser = window.localStorage.getItem("sauser");
        } catch (e) { }

        if (gaclientid != "") {
            window.ga("create", "UA-20661807-41", {
                clientId: gaclientid
            });
        } else if (gauserid != "") {
            window.ga("create", "UA-20661807-41", "auto", {
                userId: gauserid
            });
        } else if (sauser) {
            window.ga("create", "UA-20661807-41", "auto");
        } else {
            window.ga("create", "UA-20661807-28", "auto");
        }

        if (typeof window.__gaq != "undefined") {
            if (window.__gaq.q) {
                for (var i = 0; i < window.__gaq.q.length; i++) {
                    window.ga.apply(window, window.__gaq.q[i]);
                }
            }
        }

        window.__gaq = function () {
            window.ga.apply(window, arguments);
        };

        try {
            var properties = trackingData.getProperties();
            if (properties.AccountNumber) {
                window._gadimensions = {
                    "2": "AccountNumber",
                    "4": "Broker",
                    "5": "DepositCategory",
                    "6": "FirstDealDate",
                    "7": "FolderType",
                    "8": "NumberOfDeals",
                    "9": "NumberOfDeposits",
                    "10": "Serial",
                    "11": "VolumeCategory"
                };

                var dimensions = {};
                for (var gadimension in window._gadimensions) {
                    if (typeof window._gadimensions[gadimension] != "string") {
                        continue;
                    }

                    if (properties[window._gadimensions[gadimension]]) {
                        dimensions["dimension" + gadimension] = properties[window._gadimensions[gadimension]];
                        delete window._gadimensions[gadimension];
                    }
                }

                window.ga("set", dimensions);
            }
        } catch (e) { /*console && console.error(arguments); */ }

        window.ga("send", "pageview");
    }

    function init() {
        dataLayer.subscribers.push(loadAnalytics);

        if (null !== window.location.href.match(/\/Parse/i)) {
            pageWithCaptcha.init();
        } else {
            pageNoCaptcha.init();
        }
    }

    return {
        init: init
    };
}));

;
/*global trackingData */
(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define("tracking/loggers/fxeventslogger",
            [
                "tracking/loggers/datalayer",
                "tracking/loggers/gglanalitycsconfigs"
            ],
            factory);
    } else {
        root.fxTracking = root.fxTracking || {};
        root.fxTracking.fxEventsLogger = factory(root.dataLayer, root.fxTracking.gglAnalitycsConfigs);
    }
}(typeof self !== "undefined" ? self : this, function (dataLayer, gglAnalyticsConfig) {
    var ignoredEvents = [
        "fb-ready",
        "create-helpwidget",
        "load-google-analytics",
        "trackingdata-loaded",
        "interaction",
        "hotjar-init",
        "self-activation-user"
    ];
    var interactionViews = [2, 3, 4, 6, 9, 15, 17, 18, 19, 20, 21];
    var interactionEvents = ["deal-slip-interaction", "account-summary-interaction", "new-limit-view"];

    var biServiceURL;

    function _e2vp(eventSection, eventAction, eventName, eventCategory, viewId) {
        // maps events to virtual page views (there are cases we want to send the event as a pageview for different reasons)
        if (eventSection == "Help" && eventAction == "Show")
            return "vp_help-widget-start";
        if (eventName == "questionnaire-navigation") {
            switch (eventCategory) {
                case "Cdd part 1":
                    return "vp_cdd-page-1";
                case "Cdd part 2":
                    return "vp_cdd-page-2";
                case "Kyc":
                    return "vp_cdd-submit";
            }
        }
        if (eventName == "View" && (viewId == 10 || viewId == 27))
            return "vp_cdd-start";
        if (eventName.match(/^agreement/) && (viewId == 6 || viewId == 15))
            return "vp_missing-information" + eventName.replace(/^agreement/, "");
        if (eventName.match(/^deposit/)) return "vp_" + eventName;
        return null;
    }

    function trace() {
        try {
            /*console.info.apply(console, arguments);*/
        } catch (e) { /*console && console.error(arguments); */ }
    }

    function getproperties(eventname) {
        // returns an object with all the properties that were sent along with the event
        var i = dataLayer.length;
        while (i--) {
            if (dataLayer[i].event && dataLayer[i].event == eventname) {
                var obj = {};
                for (var x in dataLayer[i]) {
                    if (x != "event") obj[x] = dataLayer[i][x];
                }
                return obj;
            }
        }
        return {};
    }

    function dataLayerEventHandler(obj) {
        var eventName = obj.event;
        if (eventName.match(/^[gtm|_]/ig) || (eventName === "interaction" && obj.artificial === true)) {
            return;
        }

        var viewId = obj.ViewId,
            eventSection = gglAnalyticsConfig.GetSection(eventName),
            eventAction = obj.action,
            eventCategory = obj.category,
            interactionView = interactionViews.indexOf(viewId) >= 0,
            interactionEvent = interactionEvents.indexOf(eventName) >= 0,
            ignoreEvent = ignoredEvents.indexOf(eventName) >= 0;

        window.__gaq = window.__gaq || function () {
            window.__gaq.q = window.__gaq.q || [];
            window.__gaq.q.push(arguments);
        };

        try {
            var eventdata = getproperties(eventName);

            // look for the TrackingSessionId and store it in localStorage in case later events will be sent without it
            if (eventdata.TrackingSessionId) {
                window.sessionStorage.setItem("TrackingSessionId", eventdata.TrackingSessionId);
            } else {
                eventdata.TrackingSessionId = window.sessionStorage.getItem("TrackingSessionId");
            }

            // check if SAProcess is passed with the event and store for later use (not all events are sent with the SAProcess)
            if (eventdata.SAProcess) {
                window.sessionStorage.setItem("SAProcess", eventdata.SAProcess);
            } else {
                eventdata.SAProcess = window.sessionStorage.getItem("SAProcess");
            }

            var eventname = eventName;

            if (!eventname || (typeof eventname !== "string") || (eventname.replace(/ /g, "") == "")) {
                dataLayer.push({ event: "unknown" });
                return;
            }

            // look for the ChatBot agent name in the 'personalguide4helpcenter-ready' events
            if (eventName == "personalguide4helpcenter-ready") {
                var agentName = obj.agentName;

                if (agentName && typeof window.hj !== "undefined") {
                    window.__gaq("send", "pageview", "/virtual-pages/" + agentName);
                    window.hj("tagRecording", [agentName]);
                }
            }

            // add the account number to the event
            var accountnumber = trackingData.getProperties().AccountNumber;
            if (accountnumber) eventdata.AccountNumber = accountnumber;

            // when we initiate the Google Analytics tag we also store in memory (window._gadimensions) the list of dimensions we should send back to Google Analytics with each event
            try {
                if (window._gadimensions) {
                    var properties = trackingData.getProperties();
                    var dimensions = {};
                    for (var i in window._gadimensions) {
                        if (typeof window._gadimensions[i] !== "string") continue;
                        if (properties[window._gadimensions[i]]) {
                            dimensions["dimension" + i] = properties[window._gadimensions[i]];
                            delete window._gadimensions[i];
                        }
                    }

                    if (typeof window.hj !== "undefined") {
                        // if HotJar is present, save userId into dimension14 in Google Analytics
                        try {
                            dimensions["dimension14"] = window.hj.pageVisit.property.get("userId");
                        } catch (e) { /*console && console.error(arguments); */ }
                    }
                    window.__gaq("set", dimensions);
                }
            } catch (e) { /*console && console.error(arguments); */ }

            if (eventName == "registration-interaction" && document.location.href.match(/\/Confirm/)) {
                // if here, we should be able to grab the UserWithExperience checkbox. Store it in localStorage for later use
                var userWithExperience = document.getElementsByName(
                    "UserWithExperience"
                );
                if (userWithExperience.length > 0) {
                    for (var idx = 0; idx < userWithExperience.length; idx++) {
                        if (userWithExperience[idx].checked) {
                            window.sessionStorage.setItem(
                                "hasExperience",
                                userWithExperience[idx].value
                            );
                            break;
                        }
                    }
                }
            } else if (trackingData.getProperties().SAProcess) {
                // if SA user, send virtual page with the user's experience
                var hasExperience = window.sessionStorage.getItem("hasExperience");
                window.sessionStorage.removeItem("hasExperience");
                if (hasExperience) {
                    window.__gaq("set", "dimension12", hasExperience);
                    window.__gaq("send", "pageview", "/virtual-pages/vp_experience_" + (hasExperience == "True" ? "true" : "false"));

                    try {
                        window.hj =
                            window.hj ||
                            function () {
                                (window.hj.q = window.hj.q || []).push(arguments);
                            };
                        window.hj("tagRecording", [
                            "vp_experience_" + (hasExperience == "True" ? "true" : "false")
                        ]);
                    } catch (e) {
                        trace();
                    }
                }
            }

            if (eventName == "View") {
                var gglViewName = gglAnalyticsConfig.GetName(viewId);

                window.__gaq("set", {
                    page: "/view/" + viewId + "/" + gglViewName,
                    title: gglViewName
                });
                window.__gaq("send", "pageview");
                eventdata["ItemName"] = gglViewName;
            } else if (eventSection != "None") {
                var eventLabel = eventName === "demo-click" ? "Practice" : eventName === "real-click" ? "Real" : "";

                if (eventSection == "Help" && eventAction == "Click") {
                    var itemName = itemName;
                    var itemType = itemType;
                    if (itemName || itemType)
                        eventLabel += (itemName || "") + " " + (itemType || "");
                }

                window.__gaq("send", "event", eventSection, eventAction, eventLabel);
            }

            var virtualpage = _e2vp(eventSection, eventAction, eventName, eventCategory, viewId);

            if (virtualpage) {
                window.__gaq("send", "pageview", "/virtual_pages/" + virtualpage);
                if (typeof window.hj !== "undefined") {
                    window.hj("tagRecording", [virtualpage]);
                }
            }

            if (!ignoreEvent) {
                var props = [];
                for (var d in eventdata) {
                    props.push(d + "=" + eventdata[d]);
                }
                var img = new Image();
                img.src = biServiceURL + "?name=" + eventname + "&" + props.join("&") + "&random=" + Math.random();
            }

            if (eventName != "interaction" &&
                ((eventName == "View" && interactionView) || interactionEvent)) {
                dataLayer.push({ event: "interaction", artificial: true });
            }
        } catch (e) {
            /*console.error("error in general", e);*/
        }
    }

    function init(_biServiceUrl) {
        biServiceURL = _biServiceUrl;

        dataLayer.subscribers.push(dataLayerEventHandler);
    }

    return {
        init: init
    };
}));
;
/*global trackingData */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define('tracking/loggers/fbeventslogger', ['tracking/loggers/datalayer'], factory);
    } else {
        root.fxTracking = root.fxTracking || {};
        root.fxTracking.fbEventsLogger = factory(root.dataLayer);
    }
}(typeof self !== 'undefined' ? self : this, function (dataLayer) {

    function loadFB(f, b, e, v, n, t, s) {
        if (!f.fbq) {// return;
            n = f.fbq = function () {
                n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
            };
            if (!f._fbq) f._fbq = n;
            n.push = n;
            n.loaded = !0;
            n.version = "2.0";
            n.queue = [];
            t = b.createElement(e);
            t.async = !0;
            t.src = v;
            s = b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t, s);

            f.fbq('init', '871141973245420');
            f.fbq('track', "PageView");

            dataLayer.push({ "event": "fb-ready" });
        }

        if (window["fbq"]) {
            window.fbq("track", "ViewContent", {
                value: trackingData.getProperties().NumberOfDeposits
            });
        }
    }

    function dataLayerEventHandler(obj) {
        if (!(obj && obj.event && obj.event && obj.event.toLowerCase() == 'login-success')) {
            return;
        }

        loadFB(window, document, "script", "//connect.facebook.net/en_US/fbevents.js");
    }

    function init() {
        if (0 > dataLayer.indexOf(function (e) { return e.event && e.event && e.event.toLowerCase() === 'login-success' })) {
            dataLayer.subscribers.push(dataLayerEventHandler);
        } else {
            loadFB(window, document, "script", "//connect.facebook.net/en_US/fbevents.js");
        }
    }

    return {
        init: init
    };
}));

;
/*global trackingData */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define('tracking/loggers/hotjareventslogger', ['tracking/loggers/datalayer',
            'LoadDictionaryContent!HotJarConfig', 'handlers/Logger', 'Q', 'handlers/Cookie'
        ], factory);
    } else {
        root.fxTracking = root.fxTracking || {};
        root.fxTracking.hotJarEventsLogger = factory(root.dataLayer, root.fxTracking.trackingConfig.hotjarconfig, root.Logger);
    }
}(typeof self !== 'undefined' ? self : this, function (dataLayer, hotJarConfig, logger, Q, cookieHandler) {
    var attempts = 0,
        MAX_ATTEMPS = 40,
        TIMEOUT = 250,
        deferer = Q ? Q.defer() : null,
        alreadyStarted = false;

    function waitForTrackingData() {
        attempts += 1;
        if (attempts > MAX_ATTEMPS || alreadyStarted) return;

        alreadyStarted = true;

        if (
            typeof trackingData == "undefined" ||
            typeof trackingData.getProperties == "undefined"
        ) {
            window.setTimeout(waitForTrackingData, TIMEOUT, true);
        } else {
            try {
                (function (h, o, t, j, a, r) {
                    h.hj = h.hj || function () { (h.hj.q = h.hj.q || []).push(arguments); };
                    h._hjSettings = { hjid: hotJarConfig.hjid, hjsv: hotJarConfig.hjsv, hjdebug: hotJarConfig.hjdebug };
                    if (cookieHandler && "1" === cookieHandler.ReadCookie("fx-enable-hjdebug")) {
                        h._hjSettings.hjdebug = true;
                    }
                    a = o.getElementsByTagName("head")[0];
                    r = o.createElement("script");
                    r.async = 1;
                    r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
                    r.onload = function () {
                        logger.warn('tracking/loggers/hotjareventslogger', 'hotjar loaded');
                        if (deferer) {
                            deferer.resolve();
                        }
                    };
                    r.onerror = function (evnt) {
                        logger.warn('tracking/loggers/hotjareventslogger', 'hotjar script load faill', null, 2);
                        if (deferer) {
                            deferer.reject();
                        }
                    };
                    a.appendChild(r);
                })(window, document, "//static.hotjar.com/c/hotjar-", ".js?sv=");
            } catch (e) {
                logger.warn({ e: e });
                if (deferer) {
                    deferer.reject();
                }
            }
        }
    }

    function dataLayerEventHandler(obj) {
        if (attempts > 0 || !(obj && obj.event === 'hotjar-init')) {
            return;
        }

        waitForTrackingData();
    }

    function init(now) {
        if (hotJarConfig.hjid && hotJarConfig.hjid !== '#') {
            if (now)
                waitForTrackingData();//
            else
                dataLayer.subscribers.push(dataLayerEventHandler);
        }

        if (deferer)
            return deferer.promise;
    }

    return {
        init: init
    };
}));

;
/*global trackingData, SnapEngage, isNullOrUndefined */
(function (root, factory) {

    if (typeof define === 'function' && define.amd) {
        define('tracking/loggers/snapengagechat', ['tracking/loggers/datalayer',
            'LoadDictionaryContent!SnapEngageConfig', 'handlers/general', 'trackingIntExt/TrackingData'
        ], factory);
    } else {
        root.fxTracking = root.fxTracking || {};
        root.fxTracking.snapEngageChat = factory(root.dataLayer, root.fxTracking.trackingConfig.snapengageconfig, { isNullOrUndefined: isNullOrUndefined }, root.trackingData);
    }
}(typeof self !== 'undefined' ? self : this, function (dataLayer, snapEngageConfig, general, trackingData) {
    function isSAUser() {
        var sauser;
        try {
            sauser = window.localStorage.getItem("sauser");
        } catch (e) { }

        if (document.location.search.match(/sauser=true/) ||
            trackingData.getProperties().SAProcess ||
            !!sauser) {
            return true;
        }

        return false;
    }

    function getSnapEngageWidgetId() {
        if (isSAUser() && snapEngageConfig.SnapEngageWidgetID_sauser) {
            return snapEngageConfig.SnapEngageWidgetID_sauser
        }

        return snapEngageConfig.SnapEngageWidgetID;
    }

    function getCallbackWidgetId() {
        return snapEngageConfig.CallbackWidgetId
    }

    function loadSnapEngage() {
        var se = document.createElement("script"),
            SnapEngageWidgetId = getSnapEngageWidgetId();

        se.type = "text/javascript";
        se.async = true;
        se.src = "//storage.googleapis.com/code.snapengage.com/js/" + SnapEngageWidgetId + ".js";
        var done = false;
        se.onload = se.onreadystatechange = function () {
            if (
                !done &&
                (!this.readyState ||
                    this.readyState === "loaded" ||
                    this.readyState === "complete")
            ) {
                done = true;
                if (general.isNullOrUndefined(SnapEngageWidgetId)) {
                    var accountNumber = trackingData.getProperties().AccountNumber;
                    if (!general.isNullOrUndefined(accountNumber) && !general.isNullOrUndefined(SnapEngage)) {
                        SnapEngage.setUserName(trackingData.getProperties().AccountNumber);
                        SnapEngage.setUserEmail(accountNumber + "@trader.com");
                    }
                }
            }
        };
        var s = document.getElementsByTagName("script")[0];
        s.parentNode.insertBefore(se, s);
    }

    function dataLayerEventHandler(obj) {
        if (!(obj && obj.event) ||
            (0 > ['start-chat', 'start-callback-request-chat', 'start-proactive-chat'].indexOf(obj.event)) ||
            typeof SnapEngage == "undefined") {

            return;
        }

        var ipCountry = trackingData.getProperties().IPCountry;

        switch (obj.event) {
            case 'start-chat':
                if (ipCountry.match(/(Poland|Italy|France|Spain|Greece|Holland|Germany)/i)) {
                    SnapEngage.setWidgetId(getCallbackWidgetId());
                } else {
                    SnapEngage.setWidgetId(getSnapEngageWidgetId());
                }
                SnapEngage.startLink();
                break;
            case 'start-callback-request-chat':
                try {
                    SnapEngage.setWidgetId(getCallbackWidgetId());
                    SnapEngage.startLink();
                } catch (e) { /*console && console.error(arguments); */ }
                break;
            case 'start-proactive-chat':
                var message = obj['snapengage_message'];
                SnapEngage.openProactiveChat(true, false, message);
                break;
        }
    }

    var attempts = 0;
    function waitForTrackingData() {
        attempts += 1;
        if (attempts > 40) return;

        if (
            typeof trackingData == "undefined" ||
            typeof trackingData.getProperties == "undefined"
        ) {
            window.setTimeout(waitForTrackingData, 250);
        } else {
            loadSnapEngage();

            dataLayer.subscribers.push(dataLayerEventHandler);
        }
    }

    function init() {
        if (!window.SnapEngage) {
            if (document.readyState === 'loading') {  // Loading hasn't finished yet
                document.addEventListener('DOMContentLoaded', waitForTrackingData);
            } else {  // `DOMContentLoaded` has already fired
                waitForTrackingData();
            }
        }
    }

    return {
        init: init
    };
}));
;
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define('tracking/loggers/fxtracking.lib',
            [
                'tracking/loggers/datalayer',
                'tracking/googleTagManager',
                'tracking/loggers/fxeventslogger',
                'tracking/loggers/fbeventslogger',
                'tracking/loggers/hotjareventslogger',
                'tracking/loggers/snapengagechat',
                'tracking/loggers/gglanalyticslogger'
            ], factory);
    } else {
        root.fxTracking = root.fxTracking || {};

        root.fxTracking.init = factory(root.dataLayer, root.googleTagManager, root.fxTracking.fxEventsLogger,
                                        root.fxTracking.fbEventsLogger, root.fxTracking.hotJarEventsLogger,
                                        root.fxTracking.snapEngageChat, root.fxTracking.gglAnalyticsLogger)
            .init;
    }
}(typeof self !== 'undefined' ? self : this,
    function (dataLayer, googleTagManager, fxEventsLogger, fbEventsLogger, hotJarEventsLogger, snapEngageChat, gglAnalyticsLogger) {
        function init(gtmId, abTestingConfiguration, biServiceURL) {
            var gtmConfiguration = {},
                libs = {
                    "disable-gtm": 'disableGTM',
                    "disable-gtm-fxtracking": 'disableGTMFXTracking',
                    "disable-gtm-gglanalytics": 'disableGTMGoogleAnalytics',
                    "disable-gtm-fbevents": 'disableGTMFacebookEvents',
                    "disable-gtm-hotjar": 'disableGTMHotjar',
                    "disable-gtm-snapchat": 'disableGTMSnapChat'
                };

            for (var t in libs) {
                if (abTestingConfiguration[t] === true) {
                    gtmConfiguration[libs[t]] = true;
                }
            }

            window.gtmConfiguration = {};

            if (Object.keys(gtmConfiguration).length > 0) {
                window.gtmConfiguration = gtmConfiguration;
            }

            dataLayer.init();

            if ('#' != gtmId && !gtmConfiguration.disableGTM) {
                googleTagManager.Init(gtmId);
            }

            _init(gtmConfiguration, biServiceURL);
        }

        function _init(gtmConfiguration, biServiceURL) {
            if (gtmConfiguration.disableGTMGoogleAnalytics) {
                gglAnalyticsLogger.init();
            }

            if (gtmConfiguration.disableGTMFXTracking) {
                fxEventsLogger.init(biServiceURL);
            }

            if (gtmConfiguration.disableGTMFacebookEvents) {
                fbEventsLogger.init();
            }

            if (gtmConfiguration.disableGTMHotjar) {
                hotJarEventsLogger.init();
            }

            if (gtmConfiguration.disableGTMSnapChat) {
                snapEngageChat.init();
            }
        }

        return {
            init: init
        };

    }));
;
(function (window) {

    window.externalEventsCallbacks = $.Callbacks();

    function configTracking() {

        if (typeof window.Model == 'undefined') {
            return;
        }

        var googleTagManagerId = window.Model.GoogleTagManagerId || '';
        var configuration = {}, abTesting = window.ABTestConfiguration;
        var biServiceURL = window.Model.BIServiceURL || '';

        if (abTesting && abTesting.Status === 1) {
            configuration = abTesting.Result.reduce(function (accumulator, ab) {
                var abTests = JSON.parse(ab.Configuration),
                    keys = Object.keys(abTests);
                for (var kIdx = 0; kIdx < keys.length; kIdx++) {
                    accumulator[keys[kIdx]] = abTests[keys[kIdx]];
                }
                return accumulator;
            }, {})
        }

        window.fxTracking.init(googleTagManagerId, configuration, biServiceURL);

        var trackingEvents = TrackingExternalEvents(TrackingEventRaiser());

        window.trackingEventsCollector = new TrackingEventsCollector(null, trackingEvents, true);
        window.trackingEventsCollector.init(window.trackingData);

        new ValidationErrorsTracker().init();
    }

    // on Desktop SC application, not internal external 
    if (window.environmentData && window.environmentData.isDesktop) {
        configTracking();
        return;
    }

    // else for external internal web trader application 

    // todo tracking : why need to document ready?
    // anyway in desktop / we do not need to wait for 
    $(document).ready(function () {
        configTracking();
    });

}(window));
//# sourceMappingURL=externaltracking.js.map