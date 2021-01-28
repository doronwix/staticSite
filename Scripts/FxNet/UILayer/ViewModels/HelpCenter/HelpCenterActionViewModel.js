define([
	"require",
	"knockout",
	"handlers/general",
	"helpers/KoComponentViewModel",
	"StateObject!HelpcHub",
], function HelpCenterActionDef(require) {
	var ko = require("knockout"),
		general = require("handlers/general"),
		KoComponentViewModel = require("helpers/KoComponentViewModel"),
		stateObjectHelpc = require("StateObject!HelpcHub");

	var HelpCenterActionViewModel = general.extendClass(KoComponentViewModel, function HelpCenterActionClass(params) {
		var self = this,
			parent = this.parent,
			data = this.Data,
			soSubscriptions = [];

		function init() {
			parent.init.call(self, params);

			if (general.isNullOrUndefined(stateObjectHelpc.get("visible"))) {
				stateObjectHelpc.update("visible", false);
			}
			data.activeMenu = ko.observable(stateObjectHelpc.get("visible"));
			data.showNotification = ko.observable(stateObjectHelpc.get("showNotification"));
			setSubscriptions();
		}

		function setSubscriptions() {
			soSubscriptions.push({
				unsubscribe: stateObjectHelpc.subscribe("showNotification", function (value) {
					data.showNotification(value);
				}),
			});

			soSubscriptions.push({
				unsubscribe: stateObjectHelpc.subscribe("visible", function (value) {
					data.activeMenu(value);
				}),
			});
		}

		function toggleHelpCenter() {
			var newValue = !stateObjectHelpc.get("visible");
			if (data.showNotification() && true !== stateObjectHelpc.get("visible")) {
				stateObjectHelpc.update("showNotification", false);
			}
			data.activeMenu(newValue);
			stateObjectHelpc.update("visible", newValue);
		}

		function dispose() {
			while (soSubscriptions.length > 0) {
				soSubscriptions.pop().unsubscribe();
			}

			parent.dispose.call(self);
		}

		return {
			init: init,
			dispose: dispose,
			Data: data,
			toggleHelpCenter: toggleHelpCenter,
		};
	});

	var createViewModel = function (params) {
		var viewModel = new HelpCenterActionViewModel(params);
		viewModel.init();

		return viewModel;
	};

	return {
		viewModel: {
			createViewModel: createViewModel,
		},
	};
});
