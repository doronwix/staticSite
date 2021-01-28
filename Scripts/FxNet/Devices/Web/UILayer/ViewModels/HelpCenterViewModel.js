define([
	"require",
	"knockout",
	"handlers/general",
	"helpers/KoComponentViewModel",
	"StateObject!HelpcHub",
	"managers/HelpCenterContentManager",
	"devicemanagers/HelpCenterMenuPersonalGuideManager",
	"managers/viewsmanager",
	"JSONHelper",
	"global/storagefactory",
], function HelpCenterDef(require) {
	var ko = require("knockout"),
		general = require("handlers/general"),
		KoComponentViewModel = require("helpers/KoComponentViewModel"),
		stateObjectHelpc = require("StateObject!HelpcHub"),
		contentManager = require("managers/HelpCenterContentManager"),
		personalGuideManger = require("devicemanagers/HelpCenterMenuPersonalGuideManager"),
		VManager = require("managers/viewsmanager"),
		JSONHelper = require("JSONHelper"),
		StorageFactory = require("global/storagefactory"),
		storageFactory = StorageFactory(StorageFactory.eStorageType.local),
		helpCenterStorageKey = "help-center-states",
		showPersonalGuideOnNextOpen = false;

	function getPGSeenStatus() {
		var obj = JSONHelper.STR2JSON(
			"HelpCenterViewModel:getPGSeenStatus",
			storageFactory.getItem(helpCenterStorageKey)
		) || { pgSeen: false };

		return obj.pgSeen;
	}

	function getPGInteractedStatus() {
		var obj = JSONHelper.STR2JSON(
			"HelpCenterViewModel:getPGInteractedStatus",
			storageFactory.getItem(helpCenterStorageKey)
		) || { pgInteracted: false };

		return obj.pgInteracted;
	}

	function savePGInteractedStatus(statusSeen, statusInteracted) {
		var obj =
			JSONHelper.STR2JSON(
				"HelpCenterViewModel:savePGInteractedStatus",
				storageFactory.getItem(helpCenterStorageKey)
			) || {};

		obj.pgSeen = statusSeen;
		obj.pgInteracted = statusInteracted;
		storageFactory.setItem(helpCenterStorageKey, JSON.stringify(obj));
	}

	function getHelpCenterSeenStatus() {
		var obj = JSONHelper.STR2JSON(
			"HelpCenterViewModel:getHelpCenterSeenStatus",
			storageFactory.getItem(helpCenterStorageKey)
		) || { helpCenterSeen: false };

		return obj.helpCenterSeen;
	}

	function saveHelpCenterSeenStatus(status) {
		var obj =
			JSONHelper.STR2JSON(
				"HelpCenterViewModel:saveHelpCenterSeenStatus",
				storageFactory.getItem(helpCenterStorageKey)
			) || {};

		obj.helpCenterSeen = status;
		storageFactory.setItem(helpCenterStorageKey, JSON.stringify(obj));
	}

	var HelpCenterViewModel = general.extendClass(KoComponentViewModel, function HelpCenterClass(params) {
		var self = this,
			parent = this.parent,
			data = this.Data,
			soSubscriptions = [];

		function getLastSectionActive() {
			if (!data.pgPresent()) {
				return eHelpcSections.default;
			}

			var obj =
				JSONHelper.STR2JSON(
					"HelpCenterViewModel:getLastSectionActive",
					storageFactory.getItem(helpCenterStorageKey)
				) || {};

			return obj.lastActiveSection || eHelpcSections.personalguide;
		}

		function saveLastSectionActive(section) {
			if (!data.pgPresent()) {
				return;
			}

			var obj =
				JSONHelper.STR2JSON(
					"HelpCenterViewModel:saveLastSectionActive",
					storageFactory.getItem(helpCenterStorageKey)
				) || {};

			obj.lastActiveSection = section;
			storageFactory.setItem(helpCenterStorageKey, JSON.stringify(obj));
		}

		function init() {
			personalGuideManger.Init();
			setObservables();
			setSubscriptions();
			loadResources();
		}

		function loadResources() {
			var content = contentManager.GetData();

			data.listData(content.walkthroughList);
			data.tradingGuideLink(content.tradingGuideLink);
			data.wireTransferGuideLink(content.wireTransferGuideLink);
			data.secureTradingLink(content.secureTradingLink);
		}

		function setObservables() {
			data.personalGuideLoaded = false;
			data.tradingGuideLink = ko.observable(null);
			data.wireTransferGuideLink = ko.observable(null);
			data.secureTradingLink = ko.observable(null);
			data.pcLoading = ko.observable(false);

			data.visible = ko.observable(false);
			stateObjectHelpc.update("visible", false);

			data.hidePersonalGuide = ko.observable(stateObjectHelpc.get("HidePersonalGuide") || false);
			data.pgPresent = ko.observable();

			data.activeSection = ko.observable(data.pgPresent() ? getLastSectionActive() : eHelpcSections.default);
			data.listData = ko.observable({});

			data.pgSeen = ko.observable(getPGSeenStatus());
			data.visibleFirstTime = ko.observable(!(getPGSeenStatus() || getPGInteractedStatus()));

			ko.computed(function () {
				if (
					data.visible() &&
					data.activeSection() === eHelpcSections.personalguide &&
					!data.personalGuideLoaded
				) {
					data.personalGuideLoaded = true;
					personalGuideManger.Show();
				}
			});
		}

		function setSubscriptions() {
			stateObjectHelpc.set("pg-interacted", getPGInteractedStatus());
			stateObjectHelpc.subscribe("pg-interacted", function (interacted) {
				savePGInteractedStatus(data.pgSeen(), interacted);
			});
			soSubscriptions.push(
				{
					unsubscribe: stateObjectHelpc.subscribe("visible", function (willBeVisible) {
						if (!data.visible()) {
							if (stateObjectHelpc.get("pg-present") && !data.pgPresent()) {
								data.pgPresent(true);

								if (!(getPGSeenStatus() || getPGInteractedStatus())) {
									data.activeSection(eHelpcSections.personalguide);
								}
							}
						} else if (!willBeVisible && data.pgPresent()) {
							if (!(getPGSeenStatus() || getPGInteractedStatus())) {
								saveLastSectionActive(eHelpcSections.personalguide);
								showPersonalGuideOnNextOpen = true;
							} else {
								saveLastSectionActive(data.activeSection());
							}
						}

						if (willBeVisible) {
							if (data.pgPresent()) {
								if (!(getPGSeenStatus() || getPGInteractedStatus())) {
									stateObjectHelpc.update("showNotification", true);
								} else {
									data.visibleFirstTime(false);
								}
							} else {
								if (!getHelpCenterSeenStatus()) {
									saveHelpCenterSeenStatus(true);
									data.visibleFirstTime(true);
								} else {
									data.visibleFirstTime(false);
								}
							}

							data.activeSection(getLastSectionActive());
						}
						data.visible(willBeVisible);
					}),
				},
				{
					unsubscribe: stateObjectHelpc.subscribe("pg-present", function (isPresent) {
						if (isPresent === false) {
							stateObjectHelpc.update("showNotification", false);
							stateObjectHelpc.update("visible", false);

							data.pgPresent(false);
							return;
						}

						if (!data.visible()) {
							if (!(getPGSeenStatus() || getPGInteractedStatus()) && !data.pgPresent() && isPresent) {
								data.activeSection(eHelpcSections.personalguide);
							}
							if (
								stateObjectHelpc.get("HidePersonalGuide") &&
								!(data.pgSeen() || getPGInteractedStatus())
							) {
								showPersonalGuideOnNextOpen = true;
							} else {
								data.pgPresent(isPresent);
							}
						} else {
							if (!(data.pgSeen() || getPGInteractedStatus())) {
								stateObjectHelpc.update("showNotification", true);
								showPersonalGuideOnNextOpen = true;
							}
						}
					}),
				},
				{
					unsubscribe: stateObjectHelpc.subscribe("HidePersonalGuide", function (mustHide) {
						data.hidePersonalGuide(mustHide);
						if (!mustHide && showPersonalGuideOnNextOpen) {
							showPersonalGuideOnNextOpen = false;
							stateObjectHelpc.update("visible", true);
						}
					}),
				}
			);

			self.subscribeTo(data.visible, function (visible) {
				ko.postbox.publish("help-center", {
					event: visible ? "open" : "close",
					tab: data.activeSection() === eHelpcSections.personalguide ? "guide" : "help",
				});
			});

			var lastForm = VManager.ActiveFormName();
			self.subscribeTo(VManager.ActiveFormName, function (currentForm) {
				if (data.visible() && lastForm !== currentForm) {
					stateObjectHelpc.update("visible", false);
				}
				lastForm = currentForm;
			});

			self.subscribeTo(data.activeSection, function (value) {
				if (value === eHelpcSections.personalguide && data.personalGuideLoaded) {
					personalGuideManger.Scroll();
				}
			});

			self.subscribeTo(data.visible, function (value) {
				if (value && data.personalGuideLoaded) {
					personalGuideManger.Scroll();
				}
			});
		}

		function closeHub() {
			stateObjectHelpc.update("visible", false);

			if (showPersonalGuideOnNextOpen === true) {
				data.activeSection(eHelpcSections.personalguide);
				data.pgPresent(true);
				showPersonalGuideOnNextOpen = false;
			} else {
				stateObjectHelpc.update("showBubble", false);
			}

			saveLastSectionActive(data.activeSection());
		}

		function save() {
			saveLastSectionActive(data.activeSection());
		}

		function dispose() {
			save();

			while (soSubscriptions.length > 0) {
				soSubscriptions.pop().unsubscribe();
			}

			parent.dispose.call(self);
		}

		return {
			init: init,
			dispose: dispose,
			Data: data,
			CloseHub: closeHub,
		};
	});

	function createViewModel(params) {
		var viewModel = new HelpCenterViewModel(params || {});
		viewModel.init();

		return viewModel;
	}

	return {
		viewModel: {
			createViewModel: createViewModel,
		},
	};
});
