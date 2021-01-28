define([
	"require",
	"knockout",
	"handlers/general",
	"helpers/KoComponentViewModel",
	"devicemanagers/ViewModelsManager",
	"Dictionary",
	"StateObject!DealsTabs",
	"configuration/initconfiguration",
], function (require) {
	var ko = require("knockout"),
		general = require("handlers/general"),
		KoComponentViewModel = require("helpers/KoComponentViewModel"),
		viewModelsManager = require("devicemanagers/ViewModelsManager"),
		Dictionary = require("Dictionary"),
		state = require("StateObject!DealsTabs"),
		dealTabsConfiguration = require("configuration/initconfiguration").DealTabsConfiguration;

	var TabsViewModel = general.extendClass(KoComponentViewModel, function () {
		var self = this,
			parent = this.parent, // inherited from KoComponentViewModel
			data = this.Data, // inherited from KoComponentViewModel
			stateKey = "selectedTabView" + dealTabsConfiguration.view;

		function init(settings) {
			parent.init.call(self, settings); // inherited from KoComponentViewModel

			setObservables();
		}

		function setObservables() {
			var viewArgs = viewModelsManager.VManager.GetViewArgs(dealTabsConfiguration.view),
				selectedTab = viewArgs ? viewArgs.selectedTab : null,
				defaultTab =
					selectedTab ||
					(state.containsKey(stateKey) && state.get(stateKey)) ||
					dealTabsConfiguration.tabs[0].type;

			data.tabs = dealTabsConfiguration.tabs.map(function (tab) {
				return Object.assign(tab, {
					componentReady: ko.observable(false),
					tabTitleText: Dictionary.GetItem(tab.tabTitle, "static_controlTitle"),
				});
			});

			data.selectedTab = state.set(stateKey, ko.observable(defaultTab));
		}

		function setComponentReady(componentType) {
			var componentItem = data.tabs.filter(function (tab) {
				return tab.type === componentType;
			});
			componentItem[0].componentReady(true);
		}

		return {
			init: init,
			SetComponentReady: setComponentReady,
		};
	});

	var createViewModel = function (params) {
		var viewModel = new TabsViewModel();

		viewModel.init(params);

		return viewModel;
	};

	return {
		viewModel: { createViewModel: createViewModel },
	};
});
