/* global eShutDownHandlerTopics, ko, eDealerParams */
define("dataaccess/dalsocketclientstate", [
	"require",
	"StateObject!DealerParams",
	"managers/CustomerProfileManager",
	"initdatamanagers/Customer",
	"handlers/websocketconnection",
], function (require) {
	var stateObjectDealerParams = require("StateObject!DealerParams"),
		CustomerProfileManager = require("managers/CustomerProfileManager"),
		Customer = require("initdatamanagers/Customer"),
		SocketConnection = require("handlers/websocketconnection");
		

	function TDALSocketClientState() {
		if (!SocketConnection.isConnected()) {
			throw new Error("Cannot establish web socket connection");
		}

		var isFirstRegistration = true;

		var register = function (list, flag, isReinitialized) {
			var methodName,
				profileCustomer = CustomerProfileManager.ProfileCustomer(),
				dealerCurrency = stateObjectDealerParams.get(eDealerParams.DealerCurrency);
			var customCurrency = dealerCurrency || profileCustomer.displaySymbol;
			if (isFirstRegistration || flag === eSubscriptionRequestFlags.All || isReinitialized) {
				isFirstRegistration = false;
				methodName = "RegisterQuotesAndGetInitialAll";
				var cust = Customer.prop || {};
				SocketConnection.send(methodName, {
					instruments: list,
					symbol: customCurrency !== cust.baseCcyId() ? customCurrency : null,
				});
			} else {
				methodName = "RegisterQuotesAndGetInitialQuotes";
				SocketConnection.send(methodName, {
					instruments: list,
				});
			}
			
		};

		function unregister() {
			SocketConnection.send("Unregister");
		}

		function setDisplaySymbol(symbolId) {
			SocketConnection.send("SetDisplaySymbol", { symbol: symbolId });
		}

		function registerMessageCallback(fnHandler) {
			SocketConnection.setMessageHandler(fnHandler);
		}

		function registerReconnectedCallback(fnHandler) {
			SocketConnection.setReconnectedHandler(fnHandler);
		}

		function registerDisconnectedCallback(fnHandler) {
			SocketConnection.setDisconnectedHandler(fnHandler);
		}

		return {
			registerMessageCallback: registerMessageCallback,
			registerReconnectedCallback: registerReconnectedCallback,
			registerDisconnectedCallback: registerDisconnectedCallback,
			StopConnection: function () {
				SocketConnection.stop();
			},
			Register: register,
			Unregister: unregister,
			SetDisplaySymbol: setDisplaySymbol,
			HasStarted: SocketConnection.hasStarted,
		};
	}

	return TDALSocketClientState;
});
