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
