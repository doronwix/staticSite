/// menus_mainmenu prereqs

define([
	"knockout",
	"modules/permissionsmodule",
	"handlers/general",
	"devicemanagers/ViewModelsManager",
	"generalmanagers/StatesManager",
	"initdatamanagers/Customer",
	"Dictionary",
	"configuration/initconfiguration",
	"cachemanagers/PortfolioStaticManager",
	"customEnums/ViewsEnums",
	"enums/enums",
], function (
	ko,
	permissionsModule,
	general,
	viewModelsManager,
	statesManager,
	customer,
	Dictionary,
	InitConfiguration,
	portfolioManager
) {
	var SubMenuModel = function () {
		var isActive = ko.observable(false);

		return {
			isActive: isActive,
			show: function () {
				isActive(true);
			},
			hide: function () {
				isActive(false);
			},
		};
	};

	var tradingPermissions = {},
		customerProperties = {},
		forexCfdMenu = new SubMenuModel(),
		toolsMenu = new SubMenuModel(),
		educationMenu = new SubMenuModel(),
		fundsMenu = new SubMenuModel(),
		reportsMenu = new SubMenuModel(),
		tradingMenu = new SubMenuModel();

	var pendingWithdrawals = ko.observable(portfolioManager.Portfolio.pendingWithdrawals);

	var goToMainPage = function () {
		viewModelsManager.VManager.SwitchViewVisible(customer.prop.mainPage, {});
	};

	var init = function () {
		registerObservableStartUpEvent();
		registerOnPendingWithdrawalsChange();
		customerProperties = {
			mainPage: customer.prop.mainPage,
			isOnlyForexCustomer: customer.prop.tradingPermissions.isOnlyForexCustomer,
			hasTransactionsReport: customer.prop.tradingPermissions.hasTransactionsReport,
			isDemo: customer.prop.isDemo,
		};

		tradingMenu.tradingClick = function () {
			switchView(customerProperties.mainPage, null, "HeaderMenu");
		};
		tradingMenu.activeCss = ko.pureComputed(function () {
			return viewModelsManager.VManager.ActiveFormType() === customerProperties.mainPage;
		});

		toolsMenu.activeCss = ko.pureComputed(function () {
			return (
				viewModelsManager.VManager.ActiveFormType() == eForms.AdvinionChart ||
				viewModelsManager.VManager.ActiveFormType() == eForms.TradingSignals
			);
		});

		reportsMenu.reportsVisible = ko.pureComputed(function () {
			return (
				viewModelsManager.VManager.ActiveFormType() == eForms.Statement ||
				viewModelsManager.VManager.ActiveFormType() == eForms.ActivityLog ||
				viewModelsManager.VManager.ActiveFormType() == eForms.TransactionsReport
			);
		});

		reportsMenu.accountStatementClick = function () {
			switchView(eForms.Statement, null, "HeaderMenu");
		};

		reportsMenu.activityLogClick = function () {
			switchView(eForms.ActivityLog, null, "HeaderMenu");
		};

		reportsMenu.transactionsClick = function () {
			switchView(eForms.TransactionsReport, null, "HeaderMenu");
		};

		toolsMenu.chartClick = function () {
			switchView(eForms.AdvinionChart, null, "HeaderMenu");
		};

		toolsMenu.tradingSignalsClick = function () {
			switchView(eForms.TradingSignals, null, "HeaderMenu");
		};

		toolsMenu.priceAlertMenuClick = function () {
			ko.postbox.publish("price-alerts-menu-view");
			switchView(eForms.PriceAlerts, null, "HeaderMenu");
		};

		educationMenu.educationVisible = ko.pureComputed(function () {
			return (
				viewModelsManager.VManager.ActiveFormType() == eForms.Tutorials ||
				viewModelsManager.VManager.ActiveFormType() == eForms.EducationalTutorials
			);
		});

		educationMenu.tutorialsClick = function () {
			switchView(eForms.Tutorials, null, "HeaderMenu");
		};

		educationMenu.educationTutorialsClick = function () {
			switchView(eForms.EducationalTutorials, null, "HeaderMenu");
		};

		educationMenu.eduSubVisible = function () {
			// this is a bug with default value, so we abuse the bug
			return Dictionary.GetItem("liForexTutorial2", "menus_mainmenu", "0") !== "";
		};

		educationMenu.tutorialsVisible = function () {
			// this is a bug with default value, so we abuse the bug
			return Dictionary.GetItem("liEducationalForexTutorial2", "menus_mainmenu", "0") !== "";
		};

		educationMenu.allVisible = function () {
			return educationMenu.eduSubVisible() && educationMenu.tutorialsVisible();
		};

		fundsMenu.fundsVisible = ko.pureComputed(function () {
			return (
				viewModelsManager.VManager.ActiveFormType() == eForms.Deposit ||
				viewModelsManager.VManager.ActiveFormType() == eForms.Withdrawal
			);
		});

		fundsMenu.depositsClick = function () {
			switchView(eForms.Deposit, null, "HeaderMenu");
		};

		fundsMenu.withdrawalsClick = function () {
			switchView(
				eForms.Withdrawal,
				InitConfiguration.WithdrawalConfiguration.wizardConfig.useBrowserHistory
					? { step: eWithdrawalSteps.setAmount }
					: null,
				"HeaderMenu"
			);
		};

		fundsMenu.pendingWithdrawalsClick = function () {
			switchView(eForms.PendingWithdrawal, null, "HeaderMenu");
		};
	};

	var tradesVisbile = function () {
		return ko.computed(function () {
			return (
				viewModelsManager.VManager.GetActiveFormViewProperties(eViewTypes.vOpenDeals).visible() ||
				viewModelsManager.VManager.GetActiveFormViewProperties(eViewTypes.vClosedDealsSummaries).visible() ||
				viewModelsManager.VManager.GetActiveFormViewProperties(eViewTypes.vLimits).visible()
			);
		});
	};

	function simpleVisible(viewType) {
		if (general.isDefinedType(window.DialogViewModel) && window.DialogViewModel.getCurrentView() == viewType) {
			return false;
		}

		return viewModelsManager.VManager.GetActiveFormViewProperties(viewType).visible;
	}

	var registerObservableStartUpEvent = function () {
		viewModelsManager.VManager.GetActiveFormViewProperties(eViewTypes.vMenu).visible.subscribe(function (
			isVisible
		) {
			if (!isVisible) {
				stop();
			} else {
				start();
			}
		});
	};

	var start = function () {};

	var stop = function () {
		unRegisterOnPendingWithdrawalsChange();
	};

	var clientQuestionnaireVisible = ko.pureComputed(function () {
		return statesManager.States.CddStatus() !== eCDDStatus.NotRequired && !customer.prop.isDemo;
	});

	var forexAndCfdVisible = function () {
		return ko.computed(function () {
			return (
				viewModelsManager.VManager.ActiveFormType() == customer.prop.mainPage ||
				viewModelsManager.VManager.ActiveFormType() == eForms.Deals
			);
		});
	};

	var onClientPortfolioStateChange = function () {
		pendingWithdrawals(parseInt(portfolioManager.Portfolio.pendingWithdrawals));
	};

	var registerOnPendingWithdrawalsChange = function () {
		portfolioManager.OnChange.Add(onClientPortfolioStateChange);
	};

	var unRegisterOnPendingWithdrawalsChange = function () {
		portfolioManager.OnChange.Remove(onClientPortfolioStateChange);
	};

	var switchView = function (viewType, viewArgs, actionSourceTracking) {
		if (actionSourceTracking) {
			ko.postbox.publish("action-source", actionSourceTracking);
		}
		viewModelsManager.VManager.RedirectToForm(viewType, viewArgs || {});
		hide();
	};

	var educationMenuClick = function () {
		var hasForexTutorial = educationMenu.eduSubVisible();
		var hasEducationalForexTutorial = educationMenu.tutorialsVisible();
		if (hasForexTutorial && hasEducationalForexTutorial) return;

		if (hasForexTutorial) switchView(eForms.Tutorials);

		if (hasEducationalForexTutorial) switchView(eForms.EducationalTutorials);
	};

	function hide() {
		forexCfdMenu.hide();
		toolsMenu.hide();
		educationMenu.hide();
		fundsMenu.hide();
		reportsMenu.hide();
		tradingMenu.hide();
	}

	function createViewModel() {
		init();
		return {
			tradingPermissions: tradingPermissions,

			forexAndCfdVisible: forexAndCfdVisible,
			simpleVisible: simpleVisible,
			pendingWithdrawals: pendingWithdrawals,

			clientQuestionnaireVisible: clientQuestionnaireVisible,
			forexCfdMenu: forexCfdMenu,
			toolsMenu: toolsMenu,
			educationMenu: educationMenu,
			fundsMenu: fundsMenu,
			reportsMenu: reportsMenu,
			tradingMenu: tradingMenu,
			EducationMenuClick: educationMenuClick,

			SwitchView: switchView,
			IsDemo: statesManager.States.IsDemo,
			GoToMainPage: goToMainPage,
			customerProperties: customerProperties,
			tradesVisbile: tradesVisbile,
		};
	}

	return {
		viewModel: {
			createViewModel: createViewModel,
		},
	};
});
