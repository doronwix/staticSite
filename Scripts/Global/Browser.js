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