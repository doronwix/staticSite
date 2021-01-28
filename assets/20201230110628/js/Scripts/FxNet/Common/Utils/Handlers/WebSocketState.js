define(["fxnet/loader", "global/UrlResolver", "Q"], function (loader, urlResolver, Q) {
	var empty = "";

	var connectionData = {
		connectionToken: empty,
		jwtToken: empty,
		CSMPushEnabled: empty,
	};

	var states = {
		enabled: "1",
		disabled: "0",
	};

	function init(params) {
		connectionData.connectionToken = params.connectionToken || empty;
		connectionData.jwtToken = params.jwtToken || empty;
		connectionData.CSMPushEnabled = params.CSMPushEnabled || empty;
	}

	function isCSMPushServiceEnabled() {
		return connectionData.CSMPushEnabled === states.enabled;
	}

	function getConnectionToken() {
		return connectionData.connectionToken;
	}

	function getJwtToken() {
		return connectionData.jwtToken;
	}

	function canConnect() {
		return (
			isCSMPushServiceEnabled() &&
			connectionData.jwtToken &&
			connectionData.jwtToken.length > 0 &&
			connectionData.connectionToken &&
			connectionData.connectionToken.length > 0
		);
	}

	function tryConnect() {
		var deferred = Q.defer();

		if (connectionData.CSMPushEnabled === states.disabled) {
			deferred.reject("CSMPushService disabled for this account");
		}

		if (canConnect()) {
			deferred.resolve();
		}

		if (connectionData.CSMPushEnabled === empty) {
			return loadJWT(deferred);
		}

		return deferred.promise;
	}

	// if token is invalid (browser refresh), then go to server and bring one as fallback.
	function loadJWT(deferred) {
		//just in case, support calling this method without parent promise
		if (deferred === null || typeof deferred === "undefined") {
			deferred = Q.defer();
		}

		loader.get(
			urlResolver.combine(urlResolver.getApplicationRelativePath(), "Account/GetJWTAndConnectionId"),
			function (error, token) {
				if (error) {
					deferred.reject(error);
				}

				updateConnectionData(token);

				if (!isCSMPushServiceEnabled()) {
					deferred.reject("server refused web sockets");
				}

				deferred.resolve();
			},
			"application/json; charset=utf-8",
			true
		);

		return deferred.promise;
	}

	function updateConnectionData(result) {
		if (!result || result.indexOf("$") === -1) {
			return;
		}

		var _params = result.split("$");

		for (var i = 0; i < _params.length; i++) {
			var param = _params[i].substring(3, _params[i].length);

			if (_params[i].indexOf("ct=") !== -1) {
				connectionData.connectionToken = param;
			}

			if (_params[i].indexOf("jt=") !== -1) {
				connectionData.jwtToken = param;
			}

			if (_params[i].indexOf("en=") !== -1) {
				connectionData.CSMPushEnabled = param;
			}
		}
	}

	function resetConnectionData() {
		connectionData.connectionToken = empty;
		connectionData.jwtToken = empty;
		connectionData.CSMPushEnabled = empty;
	}

	return {
		IsCSMPushServiceEnabled: isCSMPushServiceEnabled,
		GetConnectionToken: getConnectionToken,
		GetJwtToken: getJwtToken,
		CanConnect: canConnect,
		TryConnect: tryConnect,
		ResetConnectionData: resetConnectionData,
		Init: init,
	};
});
