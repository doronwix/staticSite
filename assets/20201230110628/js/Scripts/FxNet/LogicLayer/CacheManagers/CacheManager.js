/* global Preloader, SocketConnection*/
define("cachemanagers/CacheManager", [
	"require",
	"Q",
	"generalmanagers/ErrorManager",
	"generalmanagers/RegistrationManager",
	"cachemanagers/AjaxCacheManager",
	"cachemanagers/SocketCacheManager",
	"cachemanagers/clientstatedataprocessor",
	"handlers/websocketconnection",
], function CacheManagerDef(require) {
	var Q = require("Q"),
		ErrorManager = require("generalmanagers/ErrorManager"),
		RegistrationManager = require("generalmanagers/RegistrationManager"),
		AjaxCacheManager = require("cachemanagers/AjaxCacheManager"),
		SocketCacheManager = require("cachemanagers/SocketCacheManager"),
		ClientStateDataProcessor = require("cachemanagers/clientstatedataprocessor"),
		SocketConnection = require("handlers/websocketconnection");

	function CacheManager() {
		var isInstanceLoaded = Q.defer(),
			instance;

		function init() {
			SocketConnection.hasStarted()
				.then(function onInit() {
					instance = new SocketCacheManager(ClientStateDataProcessor);

					SocketConnection.setNotAvailableHandler(function notAvailableHandler() {
						// only for fallback during application run after cache manager init was called
						ErrorManager.onWarning(
							"SocketConnection",
							"Socket connection is not available when PushService is enabled, falling back to ajax"
						);

						if (instance) {
							instance = new AjaxCacheManager(ClientStateDataProcessor);

							instance.OnRegisterRequest.Add(RegistrationManager.Register);
							instance.OnLoadRequest.Add(function () {
								loadData().done();
							});

							instance.LoadData().done();
						}
					});

					isInstanceLoaded.resolve();
				})
				.catch(function onError() {
					instance = new AjaxCacheManager(ClientStateDataProcessor);
					isInstanceLoaded.resolve();

					ErrorManager.onWarning("SocketConnection", "WebSocket not supported");
				})
				.done();

			isInstanceLoaded.promise
				.then(function setHandlers() {
					instance.OnRegisterRequest.Add(RegistrationManager.Register);
					instance.OnLoadRequest.Add(function () {
						loadData().done();
					});
				})
				.done();
		}

		function loadData() {
			return whenInstanceIsAvailable().then(function () {
				return instance.LoadData();
			});
		}

		function setDisplaySymbol(newSymbol) {
			whenInstanceIsAvailable()
				.then(function () {
					instance.SetDisplaySymbol(newSymbol);
				})
				.done();
		}

		function loadFinished() {
			return whenInstanceIsAvailable().then(function () {
				return instance.LoadFinished;
			});
		}

		function register(requestList, flag, isReinitialized) {
			loadFinished()
				.then(function () {
					instance.Register(requestList, flag, isReinitialized);
				})
				.done();
		}

		function unregister() {
			loadFinished()
				.then(function () {
					instance.Unregister();
				})
				.done();
		}

		function whenInstanceIsAvailable() {
			return isInstanceLoaded.promise;
		}

		return {
			Init: init,
			Register: register,
			Unregister: unregister,
			LoadData: loadData,
			SetDisplaySymbol: setDisplaySymbol,
			ServerTime: ClientStateDataProcessor.ServerTime,
		};
	}

	var module = (window.$cacheManager = new CacheManager());

	return module;
});
