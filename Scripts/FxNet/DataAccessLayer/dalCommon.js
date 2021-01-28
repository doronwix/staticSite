define("dataaccess/dalCommon", [
	"global/UrlResolver",
	"handlers/general",
	"handlers/Ajaxer",
	"generalmanagers/ShutDownHandler",
], function dalCommonClass(urlResolver, general, TAjaxer, ShutDownHandler) {
	function checkAjaxerStatus(status) {
		status.State = status.State || eAjaxerState.None;

		if (status.State === eAjaxerState.Retry) {
			// console.log('Retry the last request: ' + JSON.stringify(status.Data));
		}
	}

	function logout(reason) { 
		FxNet.SessionStorage.removeItem("TrackingSessionId");

		if (typeof $cacheManager !== "undefined" && $cacheManager) {
			$cacheManager.Unregister();
		}

		if (ShutDownHandler) {
			ShutDownHandler.StopRunningServices();
		}
 
		var reasonqs = reason ? "?" + reason : "";

		window.location = urlResolver.combine(
			urlResolver.getApplicationRelativePath(),
			"Account/Logout",
			($initialDataManager.prop.csmg || "") + reasonqs
		);
	}

	function login(reason) {
		debugger;
		FxNet.SessionStorage.removeItem("TrackingSessionId");

		var reasonqs = reason ? "?" + reason : "";

		window.location = urlResolver.combine(urlResolver.getApplicationRelativePath(), "Account/Login", reasonqs);
	}

	function exit(reason) {
		FxNet.SessionStorage.removeItem("TrackingSessionId");

		if (typeof $cacheManager !== "undefined" && $cacheManager) {
			$cacheManager.Unregister();
		}

		var reasonqs = reason ? "?" + reason : "";

		if (ShutDownHandler) {
			ShutDownHandler.StopRunningServices();
		}

		window.location = urlResolver.combine(
			urlResolver.getApplicationRelativePath(),
			"Account/Exit",
			($initialDataManager.prop.csmg || "") + reasonqs
		);
	}

	function getJWTLogin() {
		var ajaxer = new TAjaxer();
		var params = "";
		var promise = ajaxer.promises.get(
			"dalCommon/GetJWTLogin",
			"account/GetJWTLogin",
			params,
			null,
			function (error) {
				ErrorManager.onError("dalCommon/getGwtToken", "", eErrorSeverity.low);
				promise.reject(error);
			}
		);

		return promise;
	}

	function keepAlive(callback) {
		var ajaxer = new TAjaxer();
		var params = "";

		var promise = ajaxer.promises.get(
			"dalCommon/keepAlive",
			"api/clientstate/KeepAlive",
			params,
			callback,
			function () {
				ErrorManager.onError("dalCommon/keepAlive", "", eErrorSeverity.high);
			},
			0,
			1000
		);

		promise.progress(checkAjaxerStatus).done();
	}

	var switchClickedOnce = false;

	function switchAccount() {
		if (switchClickedOnce) {
			return;
		}

		switchClickedOnce = true;
		if (typeof $cacheManager !== "undefined" && $cacheManager) {
			$cacheManager.Unregister();
		}

		if (ShutDownHandler) {
			ShutDownHandler.StopRunningServices();
		}

		window.location.replace(
			urlResolver.combine(
				urlResolver.getApplicationRelativePath(),
				"Account/Switch?" + urlResolver.getRndKeyValue()
			)
		);
	}

	function addLog(source, message) {
		var ajaxer = new TAjaxer();
		var params = JSON.stringify({
			loggedErrorString: JSON.stringify({ Location: source, Info: message }),
		});

		return ajaxer.promises.jsonPost("Error/logError", "Error/Log", params).fail(function () {});
	}

	function addWarning(source, message) {
		var ajaxer = new TAjaxer();
		var params = JSON.stringify({
			loggedErrorString: JSON.stringify({ Location: source, Info: message }),
		});

		return ajaxer.promises.jsonPost("Warning/logWarning", "Error/Warn", params).fail(function () {});
	}

	function addInfo(source, message) {
		var ajaxer = new TAjaxer();
		var params = JSON.stringify({
			loggedErrorString: JSON.stringify({ Location: source, Info: message }),
		});

		return ajaxer.promises.jsonPost("logInfo", "Error/Info", params);
	}

	function logUploadActivityMessage(errorType, errorDetails, frameGuid) {
		var ajaxer = new TAjaxer();
		var params = JSON.stringify({ errorType: errorType, errorDetails: errorDetails, frameGuid: frameGuid });

		ajaxer.jsonPost(
			"Error/WriteUploadErrorActivityLog",
			"Error/WriteUploadErrorActivityLog",
			params,
			general.emptyFn,
			function () {
				ErrorManager.onError("Error/WriteUploadErrorActivityLog", "", eErrorSeverity.medium);
			}
		);
	}

	function logFrameNotLoadedMessage(errorType, errorDetails, frameGuid) {
		logUploadActivityMessage(errorType, errorDetails, frameGuid);
	}

	function logUploadCommunication(messageType, message, action) {
		var ajaxer = new TAjaxer(),
			params = JSON.stringify({ messageType: messageType, message: message, action: action });

		ajaxer.jsonPost(
			"Error/LogUploadCommunication",
			"Error/LogUploadCommunication",
			params,
			general.emptyFn,
			function () {
				ErrorManager.onError("Error/LogUploadCommunication", "", eErrorSeverity.medium);
			}
		);
	}

	function writeInfoLog(messageType, message, action) {
		var ajaxer = new TAjaxer(),
			params = JSON.stringify({ messageType: messageType, message: message, action: action });

		ajaxer.jsonPost("Error/WriteInfoLog", "Error/WriteInfoLog", params, general.emptyFn, function (error) {
			ErrorManager.onWarning("Error/WriteInfoLog", error, eErrorSeverity.medium);
		});
	}

	var module = (dalCommon = {
		GetJWTLogin: getJWTLogin,
		AddInfo: addInfo,
		AddLog: addLog,
		AddWarning: addWarning,
		Logout: logout,
		Login: login,
		SwitchAccount: switchAccount,
		Exit: exit,
		KeepAlive: keepAlive,
		LogUploadActivityMessage: logUploadActivityMessage,
		LogUploadCommunication: logUploadCommunication,
		LogFrameNotLoadedMessage: logFrameNotLoadedMessage,
		WriteInfoLog: writeInfoLog,
	});

	return module;
});
