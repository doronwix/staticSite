/* globals eDepositMessageTypes */
define([
	"require",
	"handlers/general",
	"helpers/KoComponentViewModel",
	"managers/viewsmanager",
	"global/UrlResolver",
	"devicemanagers/StatesManager",
], function (require) {
	var viewsManager = require("managers/viewsmanager"),
		general = require("handlers/general"),
		urlResolver = require("global/UrlResolver"),
		statesManager = require("devicemanagers/StatesManager"),
		KoComponentViewModel = require("helpers/KoComponentViewModel");

	var WireTransferSuccessViewModel = general.extendClass(
		KoComponentViewModel,
		function WireTransferSuccessViewModel() {
			var self = this,
				parent = this.parent, // inherited from KoComponentViewModel
				data = this.Data, // inherited from KoComponentViewModel
				logoImagePath = urlResolver.getImagePath("Withdrawal-Logo.png", false, true),
				shouldShowCddNotice = statesManager.States.CddStatus() === eCDDStatus.NotComplete;

			function init(customSettings) {
				parent.init.call(self, customSettings); // inherited from KoComponentViewModel

				if (!customSettings.data) {
					viewsManager.RedirectToURL(urlResolver.getRedirectUrl("Deals"));
					return;
				}

				setInitialData(customSettings.data);
			}

			function setInitialData(wireData) {
				return Object.assign(data, wireData);
			}

			function dispose() {
				parent.dispose.call(self); // inherited from KoComponentViewModel
			}

			return {
				Data: data,
				LogoImagePath: logoImagePath,
				ShouldShowCddNotice: shouldShowCddNotice,
				init: init,
				dispose: dispose,
			};
		}
	);

	var createViewModel = function (params) {
		var viewModel = new WireTransferSuccessViewModel();
		viewModel.init(params || {});

		return viewModel;
	};

	return {
		viewModel: {
			createViewModel: createViewModel,
		},
	};
});
