define("devicecustomdeeplinks/DepositConfirmationActionHandler", [
	"require",
	"knockout",
	"fxnet/fxnet",
	"StateObject!UploadDocuments",
], function DepositConfirmationActionHandler(require) {
	var ko = require("knockout"),
		stateObject = require("StateObject!UploadDocuments"),
		fxnet = require("fxnet/fxnet");

	function openDepositConfirmationPopup() {
		stateObject.set("isLoaded", null);
		stateObject.subscribe("isLoaded", onIsLoadedChanged);
	}

	function onIsLoadedChanged(newIsLoaded) {
		if (!newIsLoaded) {
			return;
		}

		var uploadTypes = stateObject.get("uploadTypes");

		if (uploadTypes.indexOf(String(eUploadDocumentType.DepositConfirmation)) < 0) {
			return;
		}

		ko.postbox.publish("triggerUploadDepositConfirmationClick", {});
	}

	//------------------------------------------
	function openDepositConfirmationPopupWhenReady() {
		if (fxnet.IsCacheLoaded()) {
			openDepositConfirmationPopup();
			return;
		}

		var cacheLoadedSubscriber = FxNet.IsCacheLoaded.subscribe(function () {
			cacheLoadedSubscriber.dispose();
			openDepositConfirmationPopup();
		});
	}

	return {
		HandleDeepLink: openDepositConfirmationPopupWhenReady,
	};
});
