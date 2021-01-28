define([
	"require",
	"vendor/text",
	"global/UrlResolver",
	"modules/environmentData",
	"Q",
	"fxnet/loader",
	"handlers/AjaxError",
	"enums/loginlogoutreasonenum",
], function (require, text, UrlResolver, ed, Q, loader, AjaxError, eLoginLogoutReason) {
	var isPageUnloading = false,
		htmlLoadEvent,
		initialDataLoadEvent,
		dataObjects = {
			htmlReady: false,
			initialDataReady: false,
			initialData: {},
		},
		timestamps = {
			start: Date.now(),
			end: 0,
			getDuration: getPreloadDuration,
			htmlStart: 0,
			htmlEnd: 0,
			getHtmlDuration: getHtmlDuration,
			initialDataStart: 0,
			initialDataEnd: 0,
			jsResourceFailureStart: 0,
			jsResourceFailureEnd: 0,
			getInitialDataDuration: getInitialDataDuration,
			getSocketConnectionDuration: getSocketConnectionDuration,
			getSocketFromCompleteConnectionToFirstFrame: getSocketFromCompleteConnectionToFirstFrame,
			getSocketFromCompleteConnectionToFirstQuote: getSocketFromCompleteConnectionToFirstQuote,
			sockets: {
				connectionStart: 0,
				connectionComplete: 0,
				firstFrame: 0,
				firstQuote: 0,
			},
		},
		version,
		cachedVersion,
		language = UrlResolver.getLanguage().toLowerCase(),
		cdnPath = UrlResolver.getCdnPath(),
		applicationRelativePath = UrlResolver.getApplicationRelativePath(),
		applicationType = UrlResolver.getApplicationType(),
		contentStyleBrokerId = UrlResolver.getContentStyleBrokerId(),
		brokerId = UrlResolver.getBroker(),
		minDealGroupId = UrlResolver.getMinDealGroupId(),
		hashParams = UrlResolver.getHashParameters(),
		staticParams = UrlResolver.getStaticParams();

	window.addEventListener(
		"beforeunload",
		function beforeUnload() {
			isPageUnloading = true;
		},
		false
	);

	Q.longStackSupport = true;
	Q.onerror = catchAllErrorHandler;

	version = cachedVersion = UrlResolver.getVersion();

	expireLoginReasonCookie();

	function loadBundlesConfig() {
		var rPath =
			applicationType === "mobile" ? "mobile" : window.environmentData.isDesktop === true ? "desktop" : "web";
		return Q.Promise(function (resolve, reject) {
			require(["fxnet/common/config/bundles." + rPath + ".config"], function () {
				resolve();
			});
		});
	}

	function loadRequireConfig() {
		var rPath =
			applicationType === "mobile"
				? "fxnet/devices/mobile/configuration/require.config"
				: window.environmentData.isDesktop === true
				? "fxnet/devices/desktop/configuration/require.config"
				: "fxnet/devices/web/configuration/require.config";

		return Q.Promise(function (resolve, reject) {
			require([rPath], function (executeConfig) {
				executeConfig();
				resolve(true);
			});
		});
	}

	if (!version) {
		redirectTo(eLoginLogoutReason.preloaderError_noVersion, "login", "Version");
	} else if (!contentStyleBrokerId) {
		redirectTo(eLoginLogoutReason.mobileTrader_nocontentStyleBrokerCookie, "login", "StyleBroker");
	} else if (!language) {
		redirectTo(eLoginLogoutReason.preloaderError_noLanguage, "login", "Language");
	} else if (!staticParams) {
		redirectTo(eLoginLogoutReason.preloaderError_noStaticParams, "login", "StaticParams");
	} else if (!brokerId) {
		redirectTo(eLoginLogoutReason.preloaderError_noBroker, "login", "Broker");
	} else {
		loadEnvironmentData()
			.then(loadRequireConfig)
			.then(loadBundlesConfig)
			.then(function checkVersion() {
				var newVersion = UrlResolver.getVersion();

				if (newVersion !== cachedVersion) {
					return false;
				}

				return true;
			})
			.then(function initSocketConnection(isVersionValid) {
				if (!isVersionValid) {
					window.location.assign(window.location.href.split("?")[0] + "?v=" + version);

					return;
				}
				if (window.isScmmBackOffice || window.environmentData.isDesktop) {
					loadApplication();
				} else {
					// we made this async, however we manually include it in web/mobile bundle
					require(["handlers/websocketconnection"], function (SocketConnection) {
						SocketConnection.init(window.environmentData.CSMPushServiceUrl, timestamps, hashParams)
							.then(loadApplication)
							.catch(loadApplication)
							.done();
					});
				}
			})
			.done();
	}

	function expireLoginReasonCookie() {
		document.cookie = "loginReason=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
	}

	function catchAllErrorHandler(err) {
		if (typeof window.onerror === "function" && err && err.message) {
			window.onerror(err.message, "", 0, 0, err);
			return;
		}

		throw err;
	}

	function loadApplication() {
		var promiseArr;
		if (applicationType === "mobile") {
			// mobile
			promiseArr = [
				loadInitialData(),
				loadScripts().then(loadNativeBundle),
				setTitle(window.environmentData.Title),
				setIcons(window.environmentData.Icons || []),
				getAppStyles(),
				loadHtml(),
			];
		} else if (window.isScmmBackOffice) {
			// scmm
			promiseArr = [
				loadInitialData(),
				loadScripts(),
				setTitle(window.environmentData.Title),
				setLabels(window.environmentData.Labels),
				setIcons(window.environmentData.Icons || []),
				getJScmmBackOfficeStyles(),
				loadHtml(),
			];
		} else {
			//web & desktop
			promiseArr = [
				loadInitialData(),
				loadScripts(),
				setTitle(window.environmentData.Title),
				setLabels(window.environmentData.Labels),
				setIcons(window.environmentData.Icons || []),
				getJQueryStyles(),
				getAppStyles(),
				loadHtml(),
			];
		}

		return Q.all(promiseArr)
			.fail(function onFail(error) {
				if (
					error instanceof AjaxError &&
					(error.httpStatus === 401 ||
						error.httpStatus === 403 ||
						error.httpStatus === 420 ||
						error.httpStatus === 424)
				) {
					redirectTo(eLoginLogoutReason.preloaderError_ajaxHttp, "login", error.toString());
				} else {
					redirectTo(eLoginLogoutReason.preloaderError_other, "logout", error.toString());
				}
			})
			.finally(function onFinishedPreloading() {
				timestamps.end = Date.now();
			})
			.done();
	}

	function parseHelper(jsonString) {
		try {
			return JSON.parse(jsonString);
		} catch (err) {
			var msgJson = JSON.stringify(
				{
					error: "JSONHelper.STR2JSON threw an exception",
					name: err.name,
					message: err.message,
					str: jsonString.substr(0, 2500),
					stack: err.stack,
				},
				null,
				4
			);

			redirectTo(eLoginLogoutReason.preloaderError_jsonParse, "logout", msgJson);
		}
	}

	function loadEnvironmentData() {
		var defer = Q.defer();

		loader.get(
			resolveEnvironmentDataUrl(),
			function onReceivedData(error, response) {
				try {
					if (error) {
						throw error;
					}
					// extend existing environmentData
					window.environmentData = extend(parseHelper(response), window.environmentData);

					if (typeof window.isDesktop !== "undefined") {
						window.environmentData.isDesktop = true;
					}
					// update the version
					window.environmentData.version = window.version = version = UrlResolver.getVersion();
					window.environmentData.jsCdnPath = cdnPath;
					window.environmentData.jsImgPath = UrlResolver.getImagePath("", false, true);
					window.environmentData.isReady = true;
					window.environmentData.dealerCurrency = hashParams.dealerCurrency;
					window.environmentData.dealerAdvancedWalletView = hashParams.dealerAdvancedWalletView;

					if (/to=real/.test(location.search)) {
						window.environmentData.switchToPlatform = "real";
					} else if (/to=demo/.test(location.search)) {
						window.environmentData.switchToPlatform = "demo";
					}

					window.systemInfo = {
						config: {},
					};

					ed.set(window.environmentData);

					defer.resolve("environmentDataReady");
				} catch (e) {
					defer.reject(e);
				}
			},
			"application/json; charset=utf-8"
		);

		return defer.promise;
	}

	function setTitle(titleText) {
		if (titleText) {
			window.document.title = titleText;
		}
	}

	function setLabels(labels) {
		if (!labels) {
			return;
		}

		var splashPage = document.getElementById("splash_page");
		if (!splashPage) {
			return;
		}

		var label;
		for (var key in labels) {
			if (labels.hasOwnProperty(key)) {
				label = document.getElementById(key);
				if (label) {
					label.innerHTML = labels[key];
				}
			}
		}

		// override switch to platform label
		if (window.environmentData.switchToPlatform) {
			label = document.getElementById("lblSplashText");
			if (label) {
				if (window.environmentData.switchToPlatform === "demo") {
					label.innerHTML = labels["lblSplashTextDemo"] || "%Your demo account is loading...";
				} else {
					label.innerHTML = labels["lblSplashTextReal"] || "%Your real money account is loading...";
				}
			}
		}

		splashPage.style.display = "";
	}

	function loadScripts() {
		var rPath =
			applicationType === "mobile"
				? "fxnet/devices/mobile/configuration/app"
				: window.environmentData.isDesktop === true
				? "fxnet/devices/desktop/configuration/app"
				: "fxnet/devices/web/configuration/app";
		return Q.promise(function (resolve, reject) {
			require([rPath], function (startFn) {
				if (typeof startFn === "function") {
					window.environmentData.isDesktop === true
						? startFn(window.startForm, window.startCallback)
						: startFn();
				}
				resolve();
			});
		});
	}

	function loadNativeBundle() {
		return Q.Promise(function onNativeBundleLoad(resolve, reject) {
			var fileName, filePath;

            if (UrlResolver.isNativeIos()) {
                fileName = "nativeiosmain.js";
            } else if (UrlResolver.isNativeAndoid()) {
                fileName = "nativeandroidmain.js";
            } else {
                resolve();
                return;
            }

			filePath = UrlResolver.getStaticJSPath(fileName);

			loadJs(filePath, resolve, reject);
		});
	}

	function loadJs(filePath, onLoad, onError) {
		var script = document.createElement("script");
		script.src = filePath;
		script.type = "text/javascript";
		script.crossOrigin = "anonymous";

		script.onerror = function onScriptError(e) {
			loadFailedJsAjax(filePath).then(function onRetryFulfilled(retryMessage) {
				var error = new URIError(
					"The script " + e.target.src + " is not accessible. Retry result: " + retryMessage
				);

				if (typeof onError !== "function") {
					throw error;
				}

				onError(error);
			});
		};

		if (typeof onLoad === "function") {
			script.onload = onLoad;
		}

		document.body.appendChild(script);
	}

	function loadFailedJsAjax(filePath) {
		var defer = Q.defer();

		timestamps.jsResourceFailureStart = Date.now();

		loader.get(filePath, function onFulfilled(error) {
			timestamps.jsResourceFailureEnd = Date.now();
			if (error) {
				defer.resolve(
					"retry script loading failed with status " +
						error.httpStatus +
						". Snippet: " +
						error.responseSnippet +
						". Duration: " +
						(timestamps.jsResourceFailureEnd - timestamps.jsResourceFailureStart) +
						"ms."
				);
			} else {
				defer.resolve(
					"retry script loading successful. Duration: " +
						timestamps.jsResourceFailureEnd -
						timestamps.jsResourceFailureStart
				);
			}
		});

		return defer.promise;
	}

	function getAppStyles() {
		var theme = "." + (window.ApplicationTheme || "light|false").split("|")[0];
		var url = UrlResolver.combine(
			UrlResolver.getAssetsPath(),
			"skins",
			applicationType,
			"broker" + contentStyleBrokerId,
			language,
			"style" + theme + ".css"
		);

		loadCss(url);
	}

	function getJQueryStyles() {
		var theme = "." + (window.ApplicationTheme || "light|false").split("|")[0];
		var url;

		url = UrlResolver.combine(UrlResolver.getAssetsPath(), "skins/web/allbrokers/default/jquery" + theme + ".css");

		loadCss(url);
	}

	function getJScmmBackOfficeStyles() {
		var url;

		url = UrlResolver.combine(UrlResolver.getAssetsPath(), "Skins/Shared/backoffice/scmm/scmm.css");

		loadCss(url);
	}

	function loadCss(href) {
		if (!href) {
			return;
		}

		var head = document.getElementsByTagName("head")[0],
			link = document.createElement("link");

		link.rel = "stylesheet";
		link.href = href;

		head.appendChild(link);
	}

	function setIcons(urls) {
		var head = document.getElementsByTagName("head")[0],
			link,
			i;

		for (i = 0; i < urls.length; i++) {
			if (urls[i] && urls[i].href) {
				link = document.createElement("link");

				link.rel = urls[i].rel || "icon";
				link.href = urls[i].href;
				link.type = urls[i].type || "image/png";

				head.appendChild(link);
			}
		}
	}

	function loadInitialData() {
		var self = this,
			defer = Q.defer(),
			initialDataArray = [
				{ type: "Main", url: resolveInitialDataUrl("GetData"), nocache: true },
				{ type: "Countries", url: resolveStaticInitialDataUrl("Countries") },
				{ type: "Symbols", url: resolveStaticInitialDataUrl("Symbols") },
				{ type: "Instruments", url: resolveStaticInitialDataUrl(UrlResolver.getInstrumentsUrl()) },
			];

		function initialDataCallback(type, error, response) {
			try {
				if (error && (error.httpStatus === 424 || error.httpStatus === 0 || error.httpStatus === 502)) {
					loader.get(
						UrlResolver.getInstrumentsFromOriginUrl(),
						initialDataCallback.bind(self, "Instruments"),
						"application/json; charset=utf-8",
						true
					);

					return;
				}

				if (error) {
					throw error;
				}

				dataObjects.initialData[type] = parseHelper(response);

				invokeInitialDataLoadEvent();
			} catch (e) {
				defer.reject(e);
			}
		}

		function invokeInitialDataLoadEvent() {
			for (var j = 0; j < initialDataArray.length; j++) {
				if (typeof dataObjects.initialData[initialDataArray[j].type] === "undefined") {
					return;
				}
			}

			timestamps.initialDataEnd = Date.now();
			dataObjects.initialDataReady = true;

			defer.resolve("initialDataReady");
		}

		timestamps.initialDataStart = Date.now();

		for (var i = 0; i < initialDataArray.length; i++) {
			loader.get(
				initialDataArray[i].url,
				initialDataCallback.bind(self, initialDataArray[i].type),
				"application/json; charset=utf-8",
				initialDataArray[i].nocache
			);
		}

		return defer.promise.then(function onInitialDataLoaded(value) {
			if (typeof initialDataLoadEvent === "function") {
				initialDataLoadEvent();
			}

			return value;
		});
	}

	function loadHtml() {
		var defer = Q.defer(),
			url = resolveHtmlRequestUrl();

		timestamps.htmlStart = Date.now();

		loader.get(url, function onLoadHtmlFulfilled(error, response) {
			try {
				if (error) {
					throw error;
				}

				var elementToUpdate = document.getElementById("mainTemplate");
				if (elementToUpdate) {
					elementToUpdate.innerHTML = response;
					dataObjects.htmlReady = true;
				}

				defer.resolve("htmlReady");
			} catch (e) {
				defer.reject(e);
			} finally {
				timestamps.htmlEnd = Date.now();
			}
		});

		return defer.promise.then(function onHtmlReady(value) {
			if (typeof htmlLoadEvent === "function") {
				htmlLoadEvent();
			}

			return value;
		});
	}

	function addLoginReasonCookie(reason) {
		if (reason) {
			var d = new Date();
			d.setTime(d.getTime() + 60000);
			document.cookie =
				"loginReason=" + encodeURIComponent(reason) + ";" + ("Expires=" + d.toUTCString()) + "; path=/";
		}
	}

	function redirectTo(errorCode, location, message) {
		if (isPageUnloading) {
			return;
		}

		isPageUnloading = true;

		if (message) {
			addLoginReasonCookie(message);
		}

		window.location.replace(
			UrlResolver.combine(applicationRelativePath, "account", location, "?reason=" + errorCode)
		);
	}

	function resolveInitialDataUrl(action) {
		var url = UrlResolver.combine(applicationRelativePath, "InitialData", action);

		return url;
	}

	function resolveEnvironmentDataUrl() {
		var url = UrlResolver.combine(
			UrlResolver.getStaticPath(),
			UrlResolver.getStaticParams(),
			"initialdata-environmentdata-" + applicationType + ".js?v=" + version
		);

		return url;
	}

	function resolveStaticInitialDataUrl(action) {
		var url = UrlResolver.combine(UrlResolver.getAssetsPath(), "InitialData", action + ".js");

		return url;
	}

	function resolveHtmlRequestUrl() {
		var url = UrlResolver.combine(
			UrlResolver.getStaticPath(),
			UrlResolver.getStaticParams(),
			minDealGroupId,
			version,
			"main.html"
		);

		return url;
	}

	// borrowed from knockout-3.4.0.js
	function extend(target, source) {
		if (source) {
			for (var prop in source) {
				if (source.hasOwnProperty(prop)) {
					target[prop] = source[prop];
				}
			}
		}

		return target;
	}

	function setHtmlLoadEvent(callback) {
		htmlLoadEvent = callback;
	}

	function setInitialDataLoadEvent(callback) {
		initialDataLoadEvent = callback;
	}

	function getHtmlDuration() {
		return timestamps.htmlEnd - timestamps.htmlStart;
	}

	function getInitialDataDuration() {
		return timestamps.initialDataEnd - timestamps.initialDataStart;
	}

	function getPreloadDuration() {
		return timestamps.end - timestamps.start;
	}

	function getSocketConnectionDuration() {
		var duration = timestamps.sockets.connectionComplete - timestamps.sockets.connectionStart;
		return duration < 0 ? 0 : duration;
	}

	function getSocketFromCompleteConnectionToFirstFrame() {
		var duration = timestamps.sockets.firstFrame - timestamps.sockets.connectionComplete;
		return duration < 0 ? 0 : duration;
	}

	function getSocketFromCompleteConnectionToFirstQuote() {
		var duration = timestamps.sockets.firstQuote - timestamps.sockets.connectionComplete;
		return duration < 0 ? 0 : duration;
	}

	return {
		SetInitialDataLoadEvent: setInitialDataLoadEvent,
		SetHtmlLoadEvent: setHtmlLoadEvent,

		DataObjects: dataObjects,
		Timestamps: timestamps,
	};
});
