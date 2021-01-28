/*!
 Version = 20201230110628 2021-01-27 11:45:06 
*/
var UrlResolver = (function () {
	var brokerID = null;

	var module = {
		memoizedValues: {},
		getVersion: function () {
			if (this.memoizedValues["version"]) {
				return this.memoizedValues["version"];
			} else {
				return (this.memoizedValues["version"] =
					(document.cookie.match(/(^|; )Version=([^;]+)/i) || "")[2] || "");
			}
		},
		getLanguage: function () {
			if (this.memoizedValues["language"]) {
				return this.memoizedValues["language"];
			} else {
				return (this.memoizedValues["language"] =
					(document.cookie.match(/(^|; )Language=([^;]+)/i) || "")[2] || "");
			}
		},
		getLanguageId: function () {
			if (this.memoizedValues["languageId"]) {
				return this.memoizedValues["languageId"];
			} else {
				return (this.memoizedValues["languageId"] =
					(document.cookie.match(/(^|; )LID=([^;]*)/i) || "")[2] || "");
			}
		},
		getCdnPath: function () {
			if (this.memoizedValues["cdnPath"]) {
				return this.memoizedValues["cdnPath"];
			} else {
				return (this.memoizedValues["cdnPath"] = (document.cookie.match(/(^|; )CDN=([^;]*)/i) || "")[2] || "");
			}
		},
		getApplicationType: function () {
			if (this.memoizedValues["applicationType"]) {
				return this.memoizedValues["applicationType"];
			} else {
				var viewMode = (document.cookie.match(/(^|; )ViewMode=([^;]*)/i) || 0)[2] || "";

				if (viewMode.toLowerCase() === "mobile") {
					return (this.memoizedValues["applicationType"] = "mobile");
				}

				return (this.memoizedValues["applicationType"] = "web");
			}
		},
		getDefaultBroker: function () {
			return (document.cookie.match(/(^|; )DB=([\d]+)B/i) || "")[2] || "0";
		},
		getBroker: function () {
			if (brokerID === null) {
				brokerID = (document.cookie.match(/(^|; )B=([\d]+)B\|/i) || "")[2] || "";
			}
			return brokerID;
		},
		getFolderForInstruments: function () {
			var isDemo = (document.cookie.match(/(^|; )B=.*\|(DM)\|/i) || "")[2] === "DM";

			if (isDemo) {
				return (document.cookie.match(/(^|; )B=.*\|([\d]+)RF\|/i) || "")[2] || "0";
			}

			return this.getFolder();
		},
		getFolder: function () {
			return (document.cookie.match(/(^|; )B=.*\|([\d]+)F\|/i) || "")[2] || "";
		},
		getFuturesPermission: function () {
			return (document.cookie.match(/(^|; )B=.*\|([\w]+)FP\|/i) || "")[2] || "";
		},
		getSharesPermission: function () {
			return (document.cookie.match(/(^|; )B=.*\|([\w]+)SP\|/i) || "")[2] || "";
		},
		getShowTestInstruments: function () {
			return (document.cookie.match(/(^|; )B=.*\|([\w]+)TST\|/i) || "")[2] || "";
		},
		getInstrumentsVersion: function () {
			return (document.cookie.match(/(^|; )B=.*\|([\d]+)\-VER\|/i) || "")[2] || "";
		},
		getVersionHash: function () {
			return (document.cookie.match(/(^|; )B=.*\|([\w]+)\-H\|/i) || "")[2] || "";
		},
		getDealAmountsVersion: function () {
			return (document.cookie.match(/(^|; )B=.*\|([\d]+)\-DVER\|/i) || "")[2] || "";
		},
		getDealAmountsHash: function () {
			return (document.cookie.match(/(^|; )B=.*\|([\w]+)\-DH\|/i) || "")[2] || "";
		},
		getMinDealsVersion: function () {
			return (document.cookie.match(/(^|; )B=.*\|([\d]+)\-MVER\|/i) || "")[2] || "";
		},
		getMinDealGroupId: function () {
			return (document.cookie.match(/(^|; )MinDealGroupId=([^;]*)/i) || "")[2] || "";
		},
		getMinDealsHash: function () {
			return (document.cookie.match(/(^|; )B=.*\|([\w]+)\-MH/i) || "")[2] || "";
		},
		getIsAutoLogin: function () {
			return (document.cookie.match(/(^|; )B=.*\|([\d]+)\-AL/i) || "")[2] || "";
		},
		getApplicationRelativePath: function () {
			return '/webpl3';
			if (this.memoizedValues["getApplicationRelativePath"]) {
				return this.memoizedValues["getApplicationRelativePath"];
			} else {
				return (this.memoizedValues["getApplicationRelativePath"] = window.location.pathname
					.substring(0, window.location.pathname.indexOf("/", 1))
					.toLowerCase());
			}
		},
		getStaticPath: function () {
			return this.combine(this.getCdnPath(), this.getApplicationRelativePath());
		},
		getAssetsPath: function () {
			return this.combine(this.getStaticPath(), "assets", this.getVersion());
		},
		getOriginJSPath: function (filename) {
			return this.combine("assets", this.getVersion(), "js", filename || "");
		},
		getStaticJSPath: function (filename) {
			return this.combine(this.getAssetsPath(), "js", filename || "");
		},
		getStaticJSActionPath: function (controller, action) {
			return this.combine(this.getAssetsPath(), controller, action + ".js");
		},
		getImagePath: function (filename, hasLanguage, hasBroker) {
			filename = filename || "";

			var lang = hasLanguage === true ? this.getLanguage() : "Default";
			var broker = hasBroker === true ? "Broker" + this.getDefaultBroker() : "AllBrokers";

			return this.combine(
				this.getAssetsPath(),
				"skins",
				this.getApplicationType(),
				broker,
				lang,
				"img",
				filename
			);
		},
		getImageSharedPath: function (filename) {
			filename = filename || "";

			return this.combine(this.getAssetsPath(), "skins", "Shared", "svg", filename);
		},
		getStaticParams: function () {
			var domain = window.location.host.replace(':9005',''),
				applicationType = this.getApplicationType(),
				brokerId = this.getBroker(),
				languageId = this.getLanguageId();

			return this.combine(domain, applicationType, brokerId, languageId);
		},
		getStaticFilePath: function () {
			return this.combine(this.getStaticPath(), this.getStaticParams());
		},
		getStaticResourcePath: function (resource) {
			return this.combine(this.getStaticPath(), this.getStaticParams(), this.getVersion(), resource + ".js");
		},
		getContentPath: function (resource) {
			return this.combine(
				this.getStaticPath(),
				this.getStaticParams(),
				this.getVersion(),
				this.getDefaultBroker(),
				resource + ".js"
			);
		},
		getHostName: function (url) {
			var match = url.match(/:\/\/([^\/]*)/i);

			if (
				typeof match !== "undefined" &&
				match !== null &&
				match.length > 1 &&
				typeof match[1] === "string" &&
				match[1].length > 0
			) {
				return match[1];
			} else {
				return null;
			}
		},
		getRedirectPath: function () {
			return "Account/Redirect";
		},
		getRedirectUrl: function (action, queryString) {
			return this.combine(
				this.getApplicationRelativePath(),
				this.getRedirectPath(),
				action,
				queryString ? "?" + queryString : String.empty
			);
		},
		getInstrumentsUrl: function (version, hash) {
			var action = "Instruments/";

			action += "fu" + this.getFuturesPermission();
			action += "-s" + this.getSharesPermission();
			action += "-fo" + this.getFolderForInstruments();
			action += "-br" + this.getBroker();
			action += "-tst" + this.getShowTestInstruments();
			action += "-v" + (version || this.getInstrumentsVersion());
			action += "-h" + (hash || this.getVersionHash());

			return action;
		},
		getInstrumentsFromOriginUrl: function () {
			var action = "InitialData/InstrumentsFromOrigin";

			action += "?futuresPermission=" + this.getFuturesPermission();
			action += "&stocksPermission=" + this.getSharesPermission();
			action += "&folderId=" + this.getFolderForInstruments();
			action += "&brokerId=" + this.getBroker();
			action += "&includeTestInstruments=" + this.getShowTestInstruments();

			return action;
		},
		getMinDealAmountsUrl: function (groupId, version, hash) {
			var action = "MinDealAmounts/";

			action += "g" + groupId;
			action += "-v" + (version || this.getMinDealsVersion());
			action += "-h" + (hash || this.getMinDealsHash());

			return action;
		},
		getDealAmountsUrl: function (version, hash) {
			var action = "DealAmounts/";
			action += "v" + (version || this.getDealAmountsVersion());
			action += "-h" + (hash || this.getDealAmountsHash());

			return action;
		},
		getStaticInitialDataInstrumentsUrl: function (version, hash) {
			return this.combine(this.getAssetsPath(), "InitialData", this.getInstrumentsUrl(version, hash) + ".js");
		},
		getStaticInitialDataDealAmountsUrl: function (version, hash) {
			return this.combine(this.getAssetsPath(), "InitialData", this.getDealAmountsUrl(version, hash) + ".js");
		},
		getStaticInitialDataMinDealAmountsUrl: function (groupId, version, hash) {
			return this.combine(
				this.getAssetsPath(),
				"InitialData",
				this.getMinDealAmountsUrl(groupId, version, hash) + ".js"
			);
		},
		isCors: function (requestUrl) {
			var currDomain = ""; //window.location.host;
			var requestDomain = this.getHostName(requestUrl);

			return requestDomain !== null && currDomain !== requestDomain;
		},
		combine: function () {
			var input = [].slice.call(arguments, 0),
				output = input
					.filter(function (item) {
						return typeof item !== "undefined" && item !== null && item !== "";
					})
					.join("/");

			output = output.replace(/:\/(?=[^\/])/g, "://"); // make sure that protocol is followed by 2 slashes
			output = output.replace(/([^:\s\%\3\A])\/+/g, "$1/"); // remove consecutive slashes
			output = output.replace(/\/(\?|&|#[^!]|$)/g, "$1"); // remove trailing slash before parameters or hash
			output = output.replace(/(\?.+)\?/g, "$1&"); // replace ? in parameters with &

			return output;
		},
		getHashParameters: function () {
			var hashData = {
				connectionToken: "",
				jwtToken: "",
				dealerCurrency: null,
				dealerAdvancedWalletView: null,
				CSMPushEnabled: "",
			};

			if (window.location.hash && window.location.hash.indexOf("$") > -1) {
				var hashParams = window.location.hash.slice(1).split("$");

				for (var i = 0; i < hashParams.length; i++) {
					if (hashParams[i].indexOf("ct=") !== -1) {
						hashData.connectionToken = hashParams[i].substring(3, hashParams[i].length);
					}

					if (hashParams[i].indexOf("jt=") !== -1) {
						hashData.jwtToken = hashParams[i].substring(3, hashParams[i].length);
					}

					if (hashParams[i].indexOf("dc=") !== -1) {
						hashData.dealerCurrency = parseInt(hashParams[i].substring(3, hashParams[i].length));
					}

					if (hashParams[i].indexOf("av=") !== -1) {
						hashData.dealerAdvancedWalletView = parseInt(hashParams[i].substring(3, hashParams[i].length));
					}

					if (hashParams[i].indexOf("en=") !== -1) {
						hashData.CSMPushEnabled = hashParams[i].substring(3, hashParams[i].length);
					}
				}

				window.location.hash = "";
			}

			return hashData;
		},
		getContentStyleBrokerId: function () {
			return (document.cookie.match(/(^|; )CS=([^;]*)/i) || "")[2] || "";
		},
		rndKey: "rnd",
		regexRndKey: /[?|&]rnd=0.\d+/g,
		rndMaxValue: 9007199254740991,
		getRndKeyValue: function () {
			if (window.location.host.indexOf("9005") > -1)
			{
				return "";
			}
			return module.rndKey + "=0." + Math.floor(Math.random() * module.rndMaxValue);
		},
		getUrlWithRndKeyValue: function (url) {
			url = url.replace(module.regexRndKey, "");
			var randomPrefix = url.indexOf("?") < 0 ? "?" : "&";

            url = url + randomPrefix + module.getRndKeyValue();
            return url;
        },
        getChatBotResourcesPath: function () {
            return UrlResolver.getStaticJSPath() + "/fx-chatbot/";
        },
        isNativeIos: function () {
            return new RegExp("(^|; )NativeIosApp=true", "i").test(document.cookie);
        },
        isNativeAndoid: function () {
            return new RegExp("(^|; )NativeAndroidApp=true", "i").test(document.cookie);
        },
        getMinDealGroupId: function () {
            return (document.cookie.match(/(^|; )MinDealGroupId=([^;]*)/i) || "")[2] || "";
        }
    };

	return module;
})();



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
	return UrlResolver;
});

;
(function cordovaIOSLoader() {
    var deviceAgent = navigator.userAgent;
    // default - old ios version - 3.5.0
    var cordovaFile = "cordova-ios-raw.js";
    
    if (deviceAgent.match(/CDV6.1.1/)) {
    	cordovaFile = "cordova-ios-raw-6.1.1.js";
    }
    else
    if (deviceAgent.match(/CDV5.1.1/)) {
    	cordovaFile = "cordova-ios-raw-5.1.1.js";
    }
    else if (deviceAgent.match(/CDV4.5.4.IOS9/)) {
    	cordovaFile = "cordova-ios-raw-4.5.4.IOS9.js";
    }
    else if (deviceAgent.match(/CDV4.5.4/)) {
    	cordovaFile = "cordova-ios-raw-4.5.4.js";
        // console.log("cordova version 4.5.4");
    }
    else if (deviceAgent.match(/CDV4.1.1/)) {
    	cordovaFile = "cordova-ios-raw-4.1.1.js";
        // console.log("cordova version 4.1.1");
    } else {
        // default - old cordova ios
        // console.log("cordova version 3.5.0");
    }

    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = UrlResolver.getStaticJSPath(cordovaFile);
    document.getElementsByTagName("head")[0].appendChild(script);
})();
;
var app = function () {

    function onDeviceReady() {
        document.addEventListener("backbutton", onBackKeyDown, false);
        
         if ((navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/PG_Andr_FXNET/))) {
                if (navigator.userAgent.match(/CDV7.1.0/) || navigator.userAgent.match(/CDV8.1.0/) || navigator.userAgent.match(/CDV9.0.0/)) {
                    // new Cordova 7.1.0 OR 8.1.0 OR 9.0.0 + new Push (2.X) and FCM
                    // new push FCM
                    // Init Push
                     PushNotification.init({
                        "android": {
                        "senderID": "1"
                        }
                    });   
                }
         }
    }

    // test eyal 1
  
    function onBackKeyDown(e) {
        e.preventDefault();
        if (window.location.href.toLowerCase().indexOf("/account/login") > 0) {
            navigator.app.exitApp();
        }
        else {
            window.location.replace("/Account/Login");
        }
    }
    return {

        onDeviceReady: onDeviceReady,
        onBackKeyDown: onBackKeyDown
    };
}();

//on ios this will do nothing, because we dont have a "back button"
document.addEventListener("backbutton", app.onBackKeyDown, false);

document.addEventListener('deviceready', app.onDeviceReady, false);


;
var eLoginMethods = {
    Password: 1,
    Fingerprint: 2
};

// is Device Support Fingerprint general API and Android specific
var deviceSupportErrorEnum = {
    SUPPORTED: "10",
    NOT_SUPPORTS_FINGERPRINT: "1",
    DEVICE_HAS_NO_ENROLLED_FINGERPRINT: "2",
    OTHER_REASON: "3",
    MINIMUM_SDK_VERSION_23_REQUIRED: "4",
    BIOMETRY_IS_LOCKED_OUT: "5", // iOS too many failed attempts 
    IOS_FACE_INSTEADOF_FINGERPTINT: "6"
};

var tokenErrorEnum = {
    WRONG_ACCOUNT_NUMBER: "1"
}
// is Device Support Fingerprint iOS specific API
var iOSDeviceSupportErrorEnum = {
    ErrorTouchIDNotEnrolled: -7,
    BiometryIsLockedOut: -8
};

function translateIOSErrorToGeneralMessage(err) {

    switch (err.code) {
        case iOSDeviceSupportErrorEnum.ErrorTouchIDNotEnrolled:
            return deviceSupportErrorEnum.DEVICE_HAS_NO_ENROLLED_FINGERPRINT;
        case iOSDeviceSupportErrorEnum.BiometryIsLockedOut:
            return deviceSupportErrorEnum.BIOMETRY_IS_LOCKED_OUT;
        default:
            return deviceSupportErrorEnum.NOT_SUPPORTS_FINGERPRINT;
    }
}
;
(function (root, factory) {
    'use strict';
    if (typeof define === "function" && define.amd) {
        define("global/native/FingerprintTools", ['generalmanagers/ErrorManager'], factory);
    } else {
        root.FingerprintTools = factory(root.ErrorManager);
    }
}(typeof self !== 'undefined' ? self : this, function (errorManager) {
    function FingerprintToolsClass() {
        var fingerPrintKey = "fingerPrint",
            fingerprintSupportKey = "fingerprintSupport";

        function init() {
            removeFingerprintSupportLS();
        }

        function onError(name, message) {
            if (errorManager) {
                errorManager.onError("CFingerprintTools/" + name, message);
            }
        }

        function isDeviceSupportFingerprint(successCallback, errorCallback) {
            try {
                Fingerprint.IsDeviceSupportFingerprint(isDeviceSupportFingerprintSuccess, isDeviceSupportFingerprintError);
            } catch (e) {
                errorCallback(deviceSupportErrorEnum.OTHER_REASON);
            }

            function isDeviceSupportFingerprintSuccess(fpType) {
                if (!(typeof fpType === "undefined" || fpType === null) && fpType === 'face') {
                    isDeviceSupportFingerprintError(deviceSupportErrorEnum.IOS_FACE_INSTEADOF_FINGERPTINT);
                }
                else {
                    storeFingerprintSupport(window.deviceSupportErrorEnum.SUPPORTED);
                    successCallback(fpType);
                }
            }

            function isDeviceSupportFingerprintError(message) {
                if (message === window.deviceSupportErrorEnum.DEVICE_HAS_NO_ENROLLED_FINGERPRINT) {
                    //delete token and local storage in case of removed fingerprint
                    deleteToken();
                    storeFingerprintSupport(message);
                }
                else if (message === window.deviceSupportErrorEnum.BIOMETRY_IS_LOCKED_OUT) {
                    storeFingerprintSupport(message);
                }

                errorCallback(message);
            }
        }

        function storeFingerprintSupport(supportValue) {
            localStorage.setItem(fingerprintSupportKey, supportValue);
        }

        function retrieveFingerprintSupport() {
            var fingerprintSupport = localStorage.getItem(fingerprintSupportKey);

            if (typeof fingerprintSupport === "undefined" || fingerprintSupport === null) {
                return null;
            }

            return fingerprintSupport;
        }

        function removeFingerprintSupportLS() {
            localStorage.removeItem(fingerprintSupportKey);
        }

        function getToken(account, successCallback, errorCallback) {
            Fingerprint.GetToken(GetTokenSuccess, GetTokenError);

            function GetTokenSuccess(result) {
                if (result && result !== "0") {
                    var tokenObj = JSON.parse(result);

                    //on login account === 0
                    if (account === 0 || tokenObj.account === account) {
                        return successCallback(tokenObj.token);
                    }

                    return errorCallback(tokenErrorEnum.WRONG_ACCOUNT_NUMBER);
                }

                return errorCallback(result);
            }

            function GetTokenError(message) {
                onError("GetTokenError", message);

                return errorCallback(message);
            }
        }

        function setFingerprintSet() {
            localStorage.setItem(fingerPrintKey, "1");
        }

        function isFingerprintSet() {
            var fingerPrintSet = localStorage.getItem(fingerPrintKey);

            return !(typeof fingerPrintSet === "undefined" || fingerPrintSet === null);
        }

        function removeFingerprintSet() {
            localStorage.removeItem(fingerPrintKey);
        }

        function setToken(account, tokenVar) {
            Fingerprint.SetToken(JSON.stringify({ "token": tokenVar, "account": account }), SetTokenSuccess, SetTokenError);

            function SetTokenSuccess(result) {
                setFingerprintSet();
                return result;
            }

            function SetTokenError(message) {
                onError("SetTokenError", message);
            }
        }

        function deleteToken() {
            removeFingerprintSet();

            try {
                Fingerprint.DeleteToken(DeleteTokenSuccess, DeleteTokenError);
            }
            catch (e) { }

            function DeleteTokenSuccess(result) {
                removeFingerprintSet();
                return result;
            }

            function DeleteTokenError(message) {
                onError("DeleteTokenError", message);
            }
        }

        var _onScanError;

        function onScanErrorCallback(error) {
            if (_onScanError) {
                _onScanError(error);
            }
        }

        function randomClientSecret(len) {
            var result = '';
            var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            var charactersLength = characters.length;

            for (var i = 0; i < len; i++) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }

            return result;
        }

        function showSetFingerprint(config, successCallback, errorCallback, onScanError) {
            _onScanError = onScanError;

            var clientSecret = randomClientSecret(32);

            Fingerprint.show({
                clientId: "FingerprintPluginForApp",
                clientSecret: clientSecret, // Necessary for Android - Use random secret key.
                disableBackup: true,
                title: config.title,
                message: config.message, // Necessary for IOS Touch ID
                description: config.message, // Necessary for Android upgraded to 3.0.0
                cancel: config.cancel, // Necessary for IOS Touch ID
                cancelButtonTitle: config.cancel, //  // Necessary for Android upgraded to 3.0.0
                fingerprint_not_recognized: config.fingerprint_not_recognized,
                fingerprint_success: config.fingerprint_success,
                secure_lock_screen_required: config.secure_lock_screen_required,
                finger_moved_too_fast: config.finger_moved_too_fast,
                too_many_attempts: config.too_many_attempts

            }, _successCallback, _errorCallback);

            function _successCallback() {
                successCallback();
            }

            function _errorCallback(err) {
                if (err && typeof err === "string" && err === "Cancelled") {
                    errorCallback(err, true)
                }
                if (err && typeof err === "string" && err.indexOf("IllegalBlockSizeException: null") >= 0) {
                    return successCallback();
                }

                return errorCallback(err, false);
            }
        }

        function fingerprintScanCancel(successCallback, errorCallback) {
            Fingerprint.scanCancel(successCallback, errorCallback);
        }

        return {
            DeviceSupportErrorEnum: window.deviceSupportErrorEnum,
            IsDeviceSupportFingerprint: isDeviceSupportFingerprint,
            GetToken: getToken,
            SetToken: setToken,
            DeleteToken: deleteToken,
            ShowSetFingerprint: showSetFingerprint,
            IsFingerprintSet: isFingerprintSet,
            FingerprintScanCancel: fingerprintScanCancel,
            onScanError: onScanErrorCallback,
            RetrieveFingerprintSupport: retrieveFingerprintSupport,
            Init: init
        }
    };

    // FingerprintTools must be exposed on the global window for cordova to call window.FingerprintTools.onScanError
    var module = window.FingerprintTools = new FingerprintToolsClass();
    return module;
}));
;

var AppRateTools = {
    // Application Constructor
initialize: function() {
    this.bindEvents();
},
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
bindEvents: function() {
    document.addEventListener('deviceready', this.onDeviceReady, false);
},
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
onDeviceReady: function() {
     AppRateTools.receivedEvent('deviceready');
    //alert('AppRate onDeviceReady');
},
receivedEvent: function(id) {
    console.log('Received Event: ' + id);
},
ShowInAppRating: function() {
    console.log('ShowInAppRating... ');
    //alert('ShowInAppRating');
    try {
        AppRate.navigateToAppStore(IsNavigateToAppStoreSuccess, IsNavigateToAppStoreSuccessFailure);
    }
    catch (err) {
        // nada for now
    }
    
    function IsNavigateToAppStoreSuccess(result) {
        //alert("IsNavigateToAppStoreSuccess - Launch method is: " + result);
    }
    
    function IsNavigateToAppStoreSuccessFailure(message) {
        //alert("IsNavigateToAppStoreSuccessFailure: message is" + message);
    }
    
}
};

AppRateTools.initialize();


;

var NativeLogsTools = {
    // Application Constructor
initialize: function() {
    this.bindEvents();
},
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
bindEvents: function() {
    document.addEventListener('deviceready', this.onDeviceReady, false);
},
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
onDeviceReady: function() {
     NativeLogsTools.receivedEvent('deviceready');
    //alert('NativeLogsTools onDeviceReady');
},
receivedEvent: function(id) {
    console.log('Received Event: ' + id);
},
GetLogs: function() {
    
    console.log('GetLogs... ');
                                      
    try {
        NativeLogs.getLog(500,false,GetLogsSuccess,GetLogsError);
    }
    catch (err) {
        // nada for now
    }

    function GetLogsSuccess(result) {
        //alert("GetLogsSuccess - result is: " + result);
        console.log("GetLogsSuccess - result is: " + result);
        return result;
    }

    function GetLogsError(message) {
       //alert("GetLogsError: " + message);
       console.log("GetLogsError: " + message);
     }

},
GetCustomerID: function() {

    console.log('GetCustomerID on NativeLogsTools... ');

    try {
        //var customerID = "123456"; // $customer.prop.accountNumber

        var customerID = ""
        try {
                if ($customer.prop.accountNumber == undefined) {
                    customerID = 0;
                } else {
                    customerID = $customer.prop.accountNumber;
                }
            }
            catch (err) {
              // alert('not defined');
               customerID = 0;
            }

            //alert("customerID is: " + customerID);
            console.log("customerID is: " + customerID);

            NativeLogs.getCustomerID(customerID, GetCustomerIDSuccess, GetCustomerIDError);
    }
    catch (err) {
        // nada for now
    }

    function GetCustomerIDSuccess(result) {
        //alert("GetCustomerIDSuccess - result is: " + result);
        console.log("GetCustomerIDSuccess - result is: " + result);
        return result;
    }

    function GetCustomerIDError(message) {
       //alert("GetCustomerIDError: " + message);
       console.log("GetCustomerIDError: " + message);
     }

}
};

NativeLogsTools.initialize();


;
(function (root, factory) {
    'use strict';
    if (typeof define === "function" && define.amd) {
        define("global/devices/native/LastLoginMethod", [], factory);
    }
    else {
        root.LastLoginMethod = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    function LastLoginMethodClass() {
        var lastLoginKey = "lastLoginMethod";

        function setLastLoginMethod(loginMethod) {
            localStorage.setItem(lastLoginKey, loginMethod);
        }

        function getLastLoginMethod() {
            var loginMethod = localStorage.getItem(lastLoginKey);

            if (typeof loginMethod === "undefined" || loginMethod === null) {
                loginMethod = eLoginMethods.Password;
            }

            setLastLoginMethod(loginMethod);

            return loginMethod;
        }

        return {
            SetLastLoginMethod: setLastLoginMethod,
            GetLastLoginMethod: getLastLoginMethod
        };
    }

    var module = window.LastLoginMethod = new LastLoginMethodClass();

    return module;
}));
;
var popupManager = (function createPopupManager($) {

    var overlay = document.querySelector('.log-opt-overlay');
    var popup = null;

    function showPopup() {
        if (popup) {
            overlay.classList.add('visible');
            popup.classList.add('visible');
            $(document).scrollTop(0);
        }
    }

    function hidePopup() {
        overlay.classList.remove('visible');
        if (popup)
            popup.classList.remove('visible');
    }

    function showCookiesDisabledPopUp() {
        document.querySelector('#fingerprint').classList.remove('visible');
        var ok = document.querySelector('#cookies_ok');
        ok.addEventListener('click', hidePopup, false);
        ok.classList.remove("gray");
        ok.classList.remove("left");
        var x = document.querySelector('#cookies_alert_x');
        if (x) {
            x.addEventListener('click', hidePopup, false);
        }       
        popup = document.querySelector('#cookies');
        showPopup();
    }

    function showSetupFingerprintPopup(title, message, closeLbl, continueLbl) {        
        document.querySelector('#cookies').classList.remove('visible');
        document.querySelector('#fingerprint_title').innerHTML = title;
        document.querySelector('#fingerprint_message').innerHTML = message;
        var continueButton = document.querySelector('#fingerprint_continue');
        continueButton.innerHTML = continueLbl;
        var closeButton = document.querySelector('#fingerprint_close');
        closeButton.innerHTML = closeLbl;
        closeButton.addEventListener('click', hidePopup, false);
        if (typeof continueLbl === "undefined" || continueLbl === null) {
            $(continueButton).hide();
            closeButton.classList.remove("gray");
            closeButton.classList.remove("left");
        }
        else {
            $(continueButton).show();
            closeButton.classList.add("gray");
            closeButton.classList.add("left");
            continueButton.addEventListener('click', function () {
                location.href = UrlResolver.getApplicationRelativePath() + "/account/redirect/loginoptions?option=fingerprint";
            }, { once: true });
        }
        popup = document.querySelector('#fingerprint');     
        showPopup();
    }

    return {
        showSetupFingerprintPopup: showSetupFingerprintPopup,
        showCookiesDisabledPopUp: showCookiesDisabledPopUp
    }
})(jQuery);

;
var FingerprintLogin = (function () {
    var eAutoLoginAllowStatus = {
        None: 0,
        Allow: 1,
        Restricted: 2
    };

    var eFingerprintLoginResult = {
        None: 0,
        Success: 1,
        LoginServerError: 2,
        FingerprintNotSupported: 3,
        NoFingerPrintOnDevice: 4,
        FigerprintNotSet: 5,
        LastLoginMethodNotFingerprint: 6,
        CancelFingerprint: 7,
        ScanError: 8,
        CancelAfterMaxAttempts: 9,
        TokenNotFound: 10,
        ErrorGetToken: 11
    };

    var self = this;
    self.fingerprintResult = 0;
    var $, model, fingerprintTools, lastLoginMethod, popupManager, externalEventsCallbacks;

    showEarlyFingerprintButton();

    function showEarlyFingerprintButton() {
        if (window.FingerprintTools) {
            var storedFingerprintSupport = window.FingerprintTools.RetrieveFingerprintSupport();
            if (storedFingerprintSupport &&
                (storedFingerprintSupport === window.FingerprintTools.DeviceSupportErrorEnum.SUPPORTED ||
                    storedFingerprintSupport === window.FingerprintTools.DeviceSupportErrorEnum.DEVICE_HAS_NO_ENROLLED_FINGERPRINT ||
                    storedFingerprintSupport === window.FingerprintTools.DeviceSupportErrorEnum.BIOMETRY_IS_LOCKED_OUT)) {
                //pure javascript because jquery is not ready yet
                if (document.getElementById("TokenLoginForm")) {
                    document.getElementById("TokenLoginForm").style.display = "block";
                }
            };
        }
    }

    function initDependencies(_$, _model, _fingerprintTools, _lastLoginMethod, _popupManager, _externalEventsCallbacks) {
        $ = _$;
        model = _model;
        fingerprintTools = _fingerprintTools;
        lastLoginMethod = _lastLoginMethod;
        popupManager = _popupManager;
        externalEventsCallbacks = _externalEventsCallbacks;
    }

    function initHandlers() {
        $("#fingerPrintLogin").click(function () {
            fingerprintStartPressButton();
        });

        $('#btnOkLogin').click(function () {
            lastLoginMethod.SetLastLoginMethod(eLoginMethods.Password);
        });
    }

    function getFingerprintResult() {
        return self.fingerprintResult;
    }

    function removeFingerprintLogin() {
        fingerprintTools.DeleteToken();
        lastLoginMethod.SetLastLoginMethod(eLoginMethods.Password);
    }

    function loginError(loginStatus) {
        externalEventsCallbacks.fire('login-error', {
            isAutologin: false,
            reason: loginStatus,
            type: "server"
        });

        removeFingerprintLogin();
        showSetupFingerprintPopup();
    }

    function showSetupFingerprintPopup() {
        var content = JSON.parse(model.FingerprintModelJson).Content;
        popupManager.showSetupFingerprintPopup(content.scanFingerprintTitle, content.setupFingerPrintMessage, content.cancelButton, content.continueButton);
    }

    function showScanError(message) {
        var content = JSON.parse(model.FingerprintModelJson).Content;
        popupManager.showSetupFingerprintPopup('', message, content.closeButton);
    }

    function fingerprintStart(loginStatus) {
        initHandlers();
        fingerprintTools.Init();

        if (loginStatus === eAutoLoginAllowStatus.Restricted) {
            loginError(loginStatus);
            self.fingerprintResult = eFingerprintLoginResult.LoginServerError;

            return;
        }

        var lastLoginMethodType = lastLoginMethod.GetLastLoginMethod();

        fingerprintTools.IsDeviceSupportFingerprint(
            function onSuccessDeviceSupportFingerPrint() {
                $("#TokenLoginForm").show();
                if (fingerprintTools.IsFingerprintSet()) {
                    if (parseInt(lastLoginMethodType) === eLoginMethods.Fingerprint) {
                        fingerprintAuthentication();
                    }
                    else {
                        self.fingerprintResult = eFingerprintLoginResult.LastLoginMethodNotFingerprint;
                    }
                }
                else {
                    self.fingerprintResult = eFingerprintLoginResult.FigerprintNotSet;
                }

            },
            function onErrorDeviceSupportFingerPrint(errorMessage) {
                // device supports fingerprint but user doesn't have fingerprint enrollments 
                if (errorMessage === fingerprintTools.DeviceSupportErrorEnum.DEVICE_HAS_NO_ENROLLED_FINGERPRINT ||
                    errorMessage === fingerprintTools.DeviceSupportErrorEnum.BIOMETRY_IS_LOCKED_OUT) {
                    $("#TokenLoginForm").show();
                    self.fingerprintResult = eFingerprintLoginResult.NoFingerPrintOnDevice;
                }
                else {
                    $("#TokenLoginForm").hide();
                    self.fingerprintResult = eFingerprintLoginResult.FingerprintNotSupported;
                }
            }
        );
    }

    function getTokenAndLogin() {
        fingerprintTools.GetToken(0,
            function onSuccessGetToken(token) {
                externalEventsCallbacks.fire('login-submit', {
                    isAutologin: false,
                    type: "fingerprint"
                });

                lastLoginMethod.SetLastLoginMethod(eLoginMethods.Fingerprint);
                tokenSubmit(token);
                self.fingerprintResult = eFingerprintLoginResult.Submit;
            },
            function onErrorGetToken(message) {
                showSetupFingerprintPopup();
                self.fingerprintResult = eFingerprintLoginResult.TokenNotFound;

            });
    }

    function tokenSubmit(token) {
        $("#token").val(token);
        $('#TokenLoginForm').submit();
    }

    function fingerprintStartPressButton() {
        //one more time ask IsDeviceSupport - for case if user removes fingerprint from device while not closing login screen  
        fingerprintTools.IsDeviceSupportFingerprint(
            function onSuccessDeviceSupportFingerPrint() {
                if (fingerprintTools.IsFingerprintSet()) {
                    fingerprintAuthentication();
                } else {
                    showSetupFingerprintPopup();
                    self.fingerprintResult = eFingerprintLoginResult.FigerprintNotSet;
                }
            },
            function onErrorDeviceSupportFingerPrint(errorMessage) {
                if (errorMessage === fingerprintTools.DeviceSupportErrorEnum.BIOMETRY_IS_LOCKED_OUT) {
                    if (fingerprintTools.IsFingerprintSet()) {
                        fingerprintAuthentication();
                        return;
                    }
                }
                showSetupFingerprintPopup();
                self.fingerprintResult = eFingerprintLoginResult.NoFingerPrintOnDevice;

            }
        );
    }

    function fingerprintAuthentication() {
        var fingerprintModel = JSON.parse(model.FingerprintModelJson);
        var contentDictionary = fingerprintModel.Content;
        var maxScanAttemts = fingerprintModel.MaxScanAttempts;
        var config = {
            title: contentDictionary.scanFingerprintMessage,
            message: " ", //one space since the native plug in crashes when empty string.
            cancel: contentDictionary.cancelButton,
            fingerprint_not_recognized: contentDictionary.scanFingerprintNotRecognized,
            fingerprint_success: contentDictionary.scanFingerprintSuccess,
            secure_lock_screen_required: contentDictionary.scanFingerprintSecureLockRequired,
            finger_moved_too_fast: contentDictionary.scanFingerprintMoovedTooFast,
            too_many_attempts: contentDictionary.scanFingerprintTooManyAttempts
        };
        var scanErrorCounter = 0;

        fingerprintTools.ShowSetFingerprint(config,
            function onSuccessShowSetFingerprint() {
                getTokenAndLogin();
            },
            function onErrorShowSetFingerprint(message, isCancelled) {
                if (typeof message === 'string' && !isCancelled) {
                    showScanError(message);
                }
                self.fingerprintResult = eFingerprintLoginResult.CancelFingerprint;
            },
            function onScanError() {
                scanErrorCounter += 1;

                if (scanErrorCounter >= maxScanAttemts) {
                    fingerprintTools.FingerprintScanCancel(function onSuccess() { }, function onError() { });
                    self.fingerprintResult = eFingerprintLoginResult.CancelAfterMaxAttempts;
                } else {
                    self.fingerprintResult = eFingerprintLoginResult.ScanError;
                }
            }
        );
    }

    return {
        eFingerprintLoginResult: eFingerprintLoginResult,
        InitDependencies: initDependencies,
        GetFingerprintResult: getFingerprintResult,
        FingerprintStart: fingerprintStart
    }
})();

;
$(document).ready(function () {
    document.addEventListener("deviceready",
        function onDeviceReady() {
            if (navigator && navigator.splashscreen) {
                navigator.splashscreen.hide();
            }

            if (window.FingerprintLogin) {
                window.FingerprintLogin.InitDependencies(window.$, window.Model, window.FingerprintTools, window.LastLoginMethod, window.popupManager, window.externalEventsCallbacks);
                window.FingerprintLogin.FingerprintStart(window.Model.AutologinStatus);
            }
        },
        false);
});
//# sourceMappingURL=nativeiosmainprelogin.js.map