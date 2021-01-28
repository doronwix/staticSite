/* globals eUserStatus */
define([
	"require",
	"knockout",
	"handlers/general",
	"helpers/KoComponentViewModel",
	"initdatamanagers/Customer",
	"StateObject!userFlow",
	"StateObject!AccountHub",
	"StateObject!HelpcHub",
	"StateObject!IM",
	"modules/permissionsmodule",
	"vendor/knockout-postbox",
	"enums/enums",
], function AccountHeaderDef(require) {
	var KoComponentViewModel = require("helpers/KoComponentViewModel"),
		ko = require("knockout"),
		general = require("handlers/general"),
		Customer = require("initdatamanagers/Customer"),
		stateObjectUserFlow = require("StateObject!userFlow"),
		stateObjectAccountHub = require("StateObject!AccountHub"),
		stateObjectHelpc = require("StateObject!HelpcHub"),
		stateObjectIM = require("StateObject!IM"),
		permissionsModule = require("modules/permissionsmodule");

	var AccountHeaderViewModel = general.extendClass(KoComponentViewModel, function AccountHeaderClass(params) {
		var self = this,
			parent = this.parent,
			data = this.Data, // inherited from KoComponentViewModel
			stateObjectSubscriptions = [],
			accountButtonSelected = ko.observable(false),
			maxNameLength = 20;

		function init() {
			setObservables();
			data.onClose = params.onClose;

			updateFromStateObject(stateObjectUserFlow.get(eStateObjectTopics.UserFlowChanged));

			data.userName = calculateName();

			if (!stateObjectIM.get("message")) {
				stateObjectIM.set("message", "empty");
			}

			data.MessageCSS = ko.observable(stateObjectIM.get("message"));

			if (!stateObjectAccountHub.get("visible")) {
				stateObjectAccountHub.set("visible", false);
			}

			accountButtonSelected(stateObjectAccountHub.get("visible"));

			stateObjectSubscriptions.push(
				{
					unsubscribe: stateObjectIM.subscribe("message", function (value) {
						data.MessageCSS(value);
					}),
				},
				{
					unsubscribe: stateObjectAccountHub.subscribe("visible", function (value) {
						accountButtonSelected(value);
					}),
				},
				{
					unsubscribe: stateObjectUserFlow.subscribe(eStateObjectTopics.UserFlowChanged, function (model) {
						updateFromStateObject(model);
					}),
				},
				{
					unsubscribe: stateObjectHelpc.subscribe("visible", function (value) {
						if (value === true) {
							toggleAccountHub(value);
						}
					}),
				}
			);
		}

		function setObservables() {
			data.generalStatusColor = ko.observable("");
			data.userStatusName = ko.observable(general.getKeyByValue(eUserStatus, eUserStatus.Active));
			data.generalStatusName = ko.observable("");
		}

		function calculateName() {
			if (!Customer.prop.firstName && !Customer.prop.lastName) return "";

			var firstName = Customer.prop.firstName ? Customer.prop.firstName : "",
				lastName = Customer.prop.lastName ? Customer.prop.lastName.charAt(0) : "",
				fullName = (firstName + " " + lastName + ".").trim();

			if (fullName.length > maxNameLength) {
				fullName = firstName;

				if (fullName.length > 0) {
					fullName = "";

					if (firstName.length > maxNameLength) {
						fullName = firstName.substr(0, maxNameLength).trim() + "...";
					} else {
						var names = firstName.split(" ");

						for (var i = 0; i < names.length; i++) {
							if ((fullName + names[i]).length <= maxNameLength) fullName += names[i] + " ";
						}
					}
				}
			}

			fullName = fullName.trim();

			return fullName;
		}

		function dispose() {
			while (stateObjectSubscriptions.length > 0) {
				stateObjectSubscriptions.pop().unsubscribe();
			}

			parent.dispose.call(self); // inherited from KoComponentViewModel
		}

		function toggleAccountHub(closeIfOpen) {
			var hubVisible = stateObjectAccountHub.get("visible");

			if (closeIfOpen === true) {
				if (hubVisible) {
					stateObjectAccountHub.update("visible", false);
					ko.postbox.publish("hub-menu-close");
				}
			} else {
				stateObjectAccountHub.update("visible", !hubVisible);

				if (!hubVisible) {
					ko.postbox.publish("hub-menu-open");
					stateObjectHelpc.update("visible", false);
				} else {
					ko.postbox.publish("hub-menu-close");
				}
			}
		}

		function updateFromStateObject(model) {
			if (!model) {
				return;
			}

      var userStatus = Customer.prop.isDemo ? eUserStatus.Active : model.userStatus;
      data.userStatusName(general.getKeyByValue(eUserStatus, userStatus));


			data.generalStatusName("flow_" + general.getKeyByValue(eUserStatus, model.userStatus));

			switch (model.userStatus) {
				case eUserStatus.ReadyToTrade:
				case eUserStatus.ActiveLimited:
					data.generalStatusColor("yellow");
					break;

				case eUserStatus.Active:
					data.generalStatusColor("green");
					break;

				case eUserStatus.Locked:
				case eUserStatus.NotActivated:
				case eUserStatus.Restricted:
					data.generalStatusColor("red");
					break;

				default:
					data.generalStatusColor("blue");
					break;
			}
		}

		function generalStatusClick() {
			ko.postbox.publish("action-source", "StatusRow");
			$viewModelsManager.VManager.SwitchViewVisible(eForms.UserFlowMap);
		}

		return {
			init: init,
			dispose: dispose,
			Data: data,
			toggleAccountHub: toggleAccountHub,
			AccountButtonSelected: accountButtonSelected,
			Customer: Customer,
			permissionsModule: permissionsModule,
			generalStatusClick: generalStatusClick,
		};
	});

	function createViewModel(params) {
		var viewModel = new AccountHeaderViewModel(params || {});

		viewModel.init();

		return viewModel;
	}

	return {
		viewModel: {
			createViewModel: createViewModel,
		},
	};
});
