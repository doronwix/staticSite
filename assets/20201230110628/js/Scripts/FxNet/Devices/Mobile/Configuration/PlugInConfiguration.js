define("configuration/PlugInConfiguration", [
	"require",
	"jquery",
	"knockout",
	"handlers/general",
	"handlers/Cookie",
	"handlers/Logger",
	"devicemanagers/ViewModelsManager",
	"configuration/PaymentsConfiguration",
	"configuration/mobilePatches",
	"configuration/initconfiguration",
	"helpers/customkobindings/KoCustomBindings",
	"devicehelpers/KoCustomBindings",
	"trackingIntExt/TrackingData",
	"vendor/globalize",
	"global/UrlResolver",
], function (require) {
	var ko = require("knockout"),
		general = require("handlers/general"),
		$ = require("jquery"),
		CookieHandler = require("handlers/Cookie"),
		Logger = require("handlers/Logger"),
		ViewModelsManager = require("devicemanagers/ViewModelsManager"),
		PaymentsConfiguration = require("configuration/PaymentsConfiguration"),
		mobilePatches = require("configuration/mobilePatches"),
		trackingData = require("trackingIntExt/TrackingData"),
		Globalize = require("vendor/globalize"),
		urlResolver = require("global/UrlResolver");

	function PlugInConfiguration() {
		function bindKO(rootElement) {
			if (!general.isDefinedType(rootElement)) {
				rootElement = document.body;
			}

			ko.cleanNode(rootElement);

			try {
				ko.applyBindingsWithValidation(ViewModelsManager, rootElement, {
					registerExtenders: true,
					messagesOnModified: true,
					insertMessages: false,
					parseInputAttributes: true,
					decorateInputElement: true,
					messageTemplate: null,
					errorElementClass: "validationElement",
				});
			} catch (ex) {
				Logger.log("PlugInConfiguration.bindKO", ex.message, "", eErrorSeverity.warning);
			}
		}

		function adjustHtml() {
			var footerOffset = "";

			try {
				if ($("#footer").offset()) {
					footerOffset = Math.abs($(window).height() - $("#footer").offset().top - $("#footer").height());
				}
			} catch (er) {
				// empty
			}

			if (
				(mobile.device.android && typeof footerOffset == "number" && footerOffset > 7) ||
				mobile.browser.opera
			) {
				setTimeout(mobilePatches.delayedFooter, 1000);
			}

			$(document).on(eAppEvents.formChangeEvent, function () {
				$(document).scrollTop(0);
				$(document).trigger(eAppEvents.formChangedEvent);
			});
		}

		function addPixel() {
			var links = CookieHandler.ReadCookie("LinksForPixel");

			if (links) {
				var arrayLinks = links.split(",");
				var im = new Image();

				arrayLinks.forEach(function addLinksToImage(link) {
					if (link != "") {
						im.src = link;
					}
				});

				CookieHandler.EraseCookie("LinksForPixel");
			}
		}

		function exposeUI() {}

		function updateScmmTrackingData(token) {
			if (trackingData) {
				trackingData.updateScmmData();
			}
		}

		function registerComponents(configuration) {
			configuration = configuration || {};

			ko.components.register("fx-component-loader", {
				viewModel: { require: "viewmodels/common/ComponentLoader" },
				template: { require: "text!mobileHtml/statichtml/common/component-loader.html" },
			});

			ko.components.register("fx-component-new-pricealert", {
				deps: ["helpers/CustomKOBindings/SpinnerFieldBinding"],
				viewModel: { require: "viewmodels/NewPriceAlertViewModel" },
				template: { require: "text!partial-views/mobile-limits-newpricealert.html" },
			});

			ko.components.register("fx-instrument-price-alert", {
				viewModel: { require: "viewmodels/InstrumentPriceAlertViewModel" },
				template: { require: "text!mobileHtml/statichtml/instrument-price-alert.html" },
			});

			ko.components.register("fx-component-spinner", {
				viewModel: { require: "managers/SpinnerManager" },
				template: { element: "fx-template-spinner" },
			});

			ko.components.register("fx-open-question", {
				deps: ["LoadDictionaryContent!client_questionnaire"],
				viewModel: { require: "viewmodels/questionnaire/question/open-question" },
				template: { require: "text!mobileHtml/statichtml/questionnaire/question/open-question.html" },
			});

			ko.components.register("fx-phone-number-question", {
				viewModel: { require: "viewmodels/questionnaire/question/phone-number-question" },
				template: { require: "text!mobileHtml/statichtml/questionnaire/question/phone-number-question.html" },
			});

			ko.components.register("fx-overridable-question", {
				deps: ["LoadDictionaryContent!client_questionnaire"],
				viewModel: { require: "viewmodels/questionnaire/question/overridable-question" },
				template: { require: "text!mobileHtml/statichtml/questionnaire/question/open-question.html" },
			});

			ko.components.register("fx-radio-question", {
				viewModel: { require: "viewmodels/questionnaire/question/radio-question" },
				template: { require: "text!mobileHtml/statichtml/questionnaire/question/radio-question.html" },
			});

			ko.components.register("fx-select-question", {
				viewModel: { require: "viewmodels/questionnaire/question/select-question" },
				template: { require: "text!mobileHtml/statichtml/questionnaire/question/select-question.html" },
			});

			ko.components.register("fx-radiolist-question", {
				viewModel: { require: "viewmodels/questionnaire/question/radio-question" },
				template: { require: "text!mobileHtml/statichtml/questionnaire/question/radiolist-question.html" },
			});

			ko.components.register("fx-search-question", {
				deps: ["helpers/CustomKOBindings/AutocompleteBinding"],
				viewModel: { require: "viewmodels/questionnaire/question/search-question" },
				template: { require: "text!mobileHtml/statichtml/questionnaire/question/search-question.html" },
			});

			ko.components.register("fx-date-question", {
				deps: ["LoadDictionaryContent!client_questionnaire"],
				viewModel: { require: "viewmodels/questionnaire/question/date-question" },
				template: { require: "text!mobileHtml/statichtml/questionnaire/question/date-question.html" },
			});

			ko.components.register("fx-checkbox-question", {
				viewModel: { require: "viewmodels/questionnaire/question/checkbox-question" },
				template: { require: "text!mobileHtml/statichtml/questionnaire/question/checkbox-question.html" },
			});

			ko.components.register("fx-questionnaire", {
				viewModel: { require: "viewmodels/questionnaire/question/questionnaire" },
				template: { require: "text!mobileHtml/statichtml/questionnaire/question/questionnaire.html" },
			});

			ko.components.register("fx-progress-bar-a", {
				deps: ["LoadDictionaryContent!client_questionnaire"],
				viewModel: { require: "viewmodels/questionnaire/progress-bar-a" },
				template: { require: "text!mobileHtml/statichtml/questionnaire/progress-bar-a.html" },
			});

			ko.components.register("fx-progress-title", {
				deps: ["LoadDictionaryContent!client_questionnaire"],
				viewModel: { require: "viewmodels/questionnaire/progress-title" },
				template: { require: "text!mobileHtml/statichtml/questionnaire/progress-title-a.html" },
			});

			ko.components.register("fx-client-questionnaire", {
				deps: ["LoadDictionaryContent!client_questionnaire"],
				viewModel: { require: "viewmodels/questionnaire/client-questionnaire" },
				template: { require: "text!mobileHtml/statichtml/questionnaire/client-questionnaire.html" },
			});

			ko.components.register("fx-tooltip", {
				viewModel: { require: "viewmodels/common/tool-tip" },
				template: { require: "text!mobileHtml/statichtml/common/tool-tip.html" },
			});

			ko.components.register("fx-welcome-client-questionnaire", {
				deps: ["LoadDictionaryContent!client_questionnaire"],
				viewModel: { require: "viewmodels/questionnaire/welcome-client-questionnaire" },
				template: { require: "text!mobileHtml/statichtml/questionnaire/welcome-client-questionnaire.html" },
			});

			ko.components.register("fx-thankyou-client-questionnaire", {
				deps: ["LoadDictionaryContent!client_questionnaire"],
				viewModel: { require: "viewmodels/questionnaire/thankyou-client-questionnaire" },
				template: { require: "text!mobileHtml/statichtml/questionnaire/thankyou-client-questionnaire.html" },
			});

			ko.components.register("fx-unsuccessful-client-questionnaire", {
				deps: ["LoadDictionaryContent!client_questionnaire"],
				viewModel: { require: "viewmodels/questionnaire/unsuccessful-client-questionnaire" },
				template: {
					require: "text!mobileHtml/statichtml/questionnaire/unsuccessful-client-questionnaire.html",
				},
			});

			ko.components.register("fx-question-validation-balloon", {
				template: {
					require: "text!mobileHtml/statichtml/questionnaire/question/question-validation-balloon.html",
				},
			});

			ko.components.register("fx-question-tooltip-balloon", {
				viewModel: { require: "viewmodels/questionnaire/question-tooltip-balloon" },
				template: {
					require: "text!mobileHtml/statichtml/questionnaire/question/question-tooltip-balloon.html",
				},
			});

			ko.components.register("fx-customer-activation", {
				viewModel: { require: "viewmodels/MissingCustomerInformationViewModel" },
				template: { require: "text!partial-views/mobile-customer-mobilemissinginformation.html" },
			});

			ko.components.register("fx-upload-documents-page", {
				deps: [
					"LoadDictionaryContent!FAQUPLOADDOCUMENTS",
					"LoadDictionaryContent!compliance_UploadDocuments",
					"LoadDictionaryContent!Tooltip",
					"LoadDictionaryContent!Category",
					"LoadDictionaryContent!Status",
					"LoadDictionaryContent!UploadDocumentsStatusPopUpMessages",
				],
				viewModel: { require: "viewmodels/UploadDocumentsViewModel" },
				template: { require: "text!mobileHtml/statichtml/compliance/upload-documents.html" },
			});

			ko.components.register("fx-component-change-password", {
				viewModel: { require: "viewmodels/ChangePasswordViewModel" },
				template: {
					require: "text!account/changepasswordpartial?SuppressExpirationMessage=true&refresh=" + Date.now(),
				},
			});

			ko.components.register("fx-trading-signals", {
				deps: ["LoadDictionaryContent!customerTools_TradingSignalDetails"],
				viewModel: { require: "deviceviewmodels/SignalsViewModel" },
				template: { require: "text!partial-views/mobile-customertools-tradingsignals.html" },
			});

			ko.components.register("fx-trading-signal-details", {
				viewModel: { require: "deviceviewmodels/SignalDetailsViewModel" },
				template: { require: "text!partial-views/mobile-customertools-tradingsignaldetails.html" },
			});

			ko.components.register("fx-trading-signals-detail-page", {
				deps: ["LoadDictionaryContent!customerTools_TradingSignalDetails"],
				viewModel: { require: "deviceviewmodels/SignalDetailsViewModel" },
				template: { require: "text!mobileHtml/statichtml/Signals/trading-signals-detail.html" },
			});

			ko.components.register("fx-signal-details", {
				template: { element: "fx-template-signal-details" },
			});

			ko.components.register("fx-component-dealsignalstool-disclaimer", {
				template: { require: "text!mobileHtml/statichtml/deals/DealSignalsDisclaimer.html" },
				deps: ["LoadDictionaryContent!deals_DealSignalsTool"],
			});

			ko.components.register("fx-economic-calendar", {
				deps: [
					"LoadDictionaryContent!customerTools_EconomicCalendar",
					"LoadDictionaryContent!economicCalendar",
					"LoadDictionaryContent!economicCalendar_tools_static",
				],
				viewModel: { require: "deviceviewmodels/EconomicCalendar/EconomicCalendarViewModel" },
				template: { require: "text!mobileHtml/statichtml/EconomicCalendar/economic-calendar.html" },
			});

			ko.components.register("fx-economic-calendar-filter", {
				deps: ["LoadDictionaryContent!customerTools_EconomicCalendarFilter"],
				viewModel: { require: "deviceviewmodels/EconomicCalendar/EconomicCalendarFilterViewModel" },
				template: { require: "text!mobileHtml/statichtml/EconomicCalendar/filter-economic-calendar.html" },
			});

			ko.components.register("fx-economic-calendar-event", {
				deps: ["LoadDictionaryContent!customerTools_EconomicCalendar"],
				viewModel: { require: "deviceviewmodels/EconomicCalendar/EconomicCalendarEventViewModel" },
				template: { require: "text!mobileHtml/statichtml/EconomicCalendar/event-economic-calendar.html" },
			});

			ko.components.register("fx-educational-tutorials-switcher", {
				viewModel: { require: "deviceviewmodels/EducationalTutorialsSwitcherViewModel" },
				template: { require: "text!partial-views/mobile-customertools-educationaltutorialsswitcher.html" },
			});

			ko.components.register("fx-educational-tutorials", {
				viewModel: { require: "deviceviewmodels/EducationalTutorialsViewModel" },
				template: { require: "text!partial-views/mobile-customertools-educationaltutorials.html" },
			});

			ko.components.register("fx-component-educational-tutorial-access", {
				deps: ["LoadDictionaryContent!accessRequest"],
				viewModel: { require: "viewmodels/AccessRequestViewModel" },
				template: { require: "text!partial-views/mobile-customertools-educationaltutorialsaccess.html" },
			});

			ko.components.register("fx-aml-status-page", {
				viewModel: { require: "viewmodels/AmlViewModel" },
				template: { require: "text!partial-views/mobile-compliance-amlstatus.html" },
			});

			ko.components.register("fx-popup-header", {
				deps: ["LoadDictionaryContent!partialViews_vMobilePopupHeader"],
				viewModel: { require: "deviceviewmodels/PopupHeaderViewModel" },
				template: { require: "text!mobileHtml/statichtml/popup-header.html" },
			});

			ko.components.register("fx-component-cash-back", {
				viewModel: { require: "viewmodels/CashBackViewModel" },
				template: { require: "text!partial-views/mobile-deals-cashback.html" },
			});

			ko.components.register("fx-component-live-cash-back", {
				viewModel: { require: "viewmodels/BonusViewModel" },
				template: { require: "text!partial-views/mobile-deals-livecashback.html" },
			});

			ko.components.register("fx-component-spread-discount", {
				viewModel: { require: "viewmodels/BonusViewModel" },
				template: { require: "text!partial-views/mobile-deals-spreaddiscount.html" },
				synchronous: true,
			});

			ko.components.register("fx-component-market-closed-view", {
				viewModel: { require: "viewmodels/MarketClosedViewModel" },
				template: { require: "text!partial-views/mobile-deals-marketclosed.html" },
			});

			ko.components.register("fx-component-transaction-switcher", {
				viewModel: { require: "deviceviewmodels/TransactionSwitcherViewModel" },
				template: { require: "text!partial-views/mobile-deals-transactionswitcher.html" },
			});

			ko.components.register("fx-component-new-limit", {
				deps: ["LoadDictionaryContent!deals_NewLimit", "helpers/CustomKOBindings/SpinnerFieldBinding"],
				viewModel: { require: "deviceviewmodels/NewLimitViewModel" },
				template: { require: "text!partial-views/mobile-deals-newlimit.html" },
			});

			ko.components.register("fx-component-edit-limit", {
				deps: ["LoadDictionaryContent!deals_EditLimit", "helpers/CustomKOBindings/SpinnerFieldBinding"],
				viewModel: { require: "deviceviewmodels/EditLimitViewModel" },
				template: { require: "text!partial-views/mobile-deals-editlimit.html" },
			});

			ko.components.register("fx-component-new-deal-slip", {
				deps: ["LoadDictionaryContent!deals_NewDeal", "helpers/CustomKOBindings/SpinnerFieldBinding"],
				viewModel: { require: "deviceviewmodels/NewDealSlipViewModel" },
				template: { require: "text!partial-views/mobile-deals-newdeal.html" },
			});

			ko.components.register("fx-component-require-margin-text", {
				viewModel: { require: "viewmodels/Deals/DealMarginViewModel" },
				template: { require: "text!partial-views/mobile-deals-requiremargin.html" },
			});

			ko.components.register("fx-component-converted-amount-text", {
				viewModel: { require: "viewmodels/Deals/ConvertedAmountViewModel" },
				template: { require: "text!partial-views/mobile-deals-convertedamount.html" },
			});

			ko.components.register("fx-component-deal-tools", {
				viewModel: { require: "deviceviewmodels/DealToolsViewModel" },
				template: { require: "text!partial-views/mobile-deals-dealtools.html" },
			});

			ko.components.register("fx-component-chart-tool", {
				viewModel: { require: "deviceviewmodels/ChartToolViewModel" },
				template: { require: "text!partial-views/mobile-deals-dealcharttool.html" },
			});

			ko.components.register("fx-component-market-info-tool", {
				deps: ["LoadDictionaryContent!deals_DealMarketInfoTool"],
				viewModel: { require: "deviceviewmodels/MarketInfoToolViewModel" },
				template: { require: "text!partial-views/mobile-deals-dealmarketinfotool.html" },
			});

			ko.components.register("fx-component-signals-tool", {
				viewModel: { require: "deviceviewmodels/SignalDetailsViewModel" },
				template: { require: "text!mobileHtml/statichtml/deals/dealsignalstool.html" },
				deps: ["LoadDictionaryContent!deals_DealSignalsTool"],
			});

			ko.components.register("fx-component-instrument-info-tool", {
				deps: ["LoadDictionaryContent!deals_DealMarketInfoTool"],
				viewModel: { require: "viewmodels/Deals/InstrumentInfoViewModel" },
				template: { require: "text!partial-views/mobile-deals-instrumentinfotool.html" },
			});

			ko.components.register("fx-component-market-info-rates", {
				deps: ["LoadDictionaryContent!deals_DealMarketInfoTool"],
				viewModel: { require: "viewmodels/Deals/MarketInfoRatesViewModel" },
				template: { require: "text!mobileHtml/statichtml/deals/market-info-rates.html" },
			});

			ko.components.register("fx-component-rate-range-indicator", {
				deps: ["LoadDictionaryContent!deals_DealMarketInfoTool"],
				viewModel: { require: "viewmodels/Deals/RateRangeIndicatorViewModel" },
				template: { require: "text!mobileHtml/statichtml/deals/rate-range-indicator.html" },
			});

			ko.components.register("fx-component-close-deal", {
				deps: ["LoadDictionaryContent!deals_CloseDeal"],
				viewModel: { require: "deviceviewmodels/CloseDealViewModel" },
				template: { require: "text!mobileHtml/statichtml/deals/close-deal.html" },
			});

			ko.components.register("fx-component-edit-closing-limit", {
				deps: ["helpers/CustomKOBindings/SpinnerFieldBinding"],
				viewModel: { require: "deviceviewmodels/EditClosingLimitViewModel" },
				template: { require: "text!partial-views/mobile-deals-editclosinglimit.html" },
			});

			ko.components.register("fx-schedule-group", {
				deps: ["LoadDictionaryContent!schedulegrouphtml"],
				viewModel: { require: "viewmodels/Deals/ScheduleGroupViewModel" },
				template: { require: "text!html/statichtml/deals/schedule-group.html" },
			});

			ko.components.register("fx-component-dynamic-header", {
				viewModel: { require: "deviceviewmodels/DynamicHeaderViewModel" },
				template: { require: "text!mobileHtml/statichtml/dynamic-header.html" },
			});

			ko.components.register("fx-component-main-menu", {
				viewModel: { require: "deviceviewmodels/MainMenuViewModel" },
				template: { element: "fx-template-main-menu" },
			});

			ko.components.register("fx-component-d3", {
				viewModel: { instance: ViewModelsManager },
				template: { element: "fx-template-d3" },
			});

			ko.components.register("fx-component-trading-summary", {
				viewModel: { require: "viewmodels/TradingSummaryViewModel" },
				template: { element: "fx-template-trading-summary" },
			});

			ko.components.register("fx-component-pending-withdrawal", {
				deps: ["LoadDictionaryContent!views_vMobilePendingWithdrawal"],
				viewModel: { require: "viewmodels/Withdrawal/PendingWithdrawalsViewModel" },
				template: { require: "text!mobileHtml/statichtml/Withdrawal/PendingWithdrawals.html" },
			});

			ko.components.register("fx-component-balance", {
				viewModel: { instance: ViewModelsManager },
				template: { element: "fx-template-balance" },
			});

			ko.components.register("fx-component-net-exposure", {
				viewModel: { instance: ViewModelsManager },
				template: { element: "fx-template-net-exposure" },
			});

			ko.components.register("fx-component-wallet", {
				viewModel: { require: "viewmodels/WalletViewModel" },
				template: { require: "text!mobileHtml/statichtml/AcccountSummaryWallet.html" },
				deps: ["LoadDictionaryContent!views_vMobileWallet"],
			});

			ko.components.register("fx-component-quotes", {
				viewModel: { instance: ViewModelsManager },
				template: { element: "fx-template-quotes" },
			});

			ko.components.register("fx-component-rate-details", {
				viewModel: { instance: ViewModelsManager },
				template: { element: "fx-template-rate-details" },
			});

			ko.components.register("fx-component-closed-deal-details", {
				viewModel: { instance: ViewModelsManager },
				template: { element: "fx-template-closed-deal-details" },
			});

			ko.components.register("fx-component-add-instrument", {
				viewModel: { instance: ViewModelsManager },
				template: { element: "fx-template-add-instrument" },
			});

			ko.components.register("fx-component-validation-templates", {
				viewModel: { instance: ViewModelsManager },
				template: { element: "fx-template-validation-templates" },
			});

			ko.components.register("fx-component-menu", {
				deps: ["LoadDictionaryContent!partialViews_vMobileMenu", "LoadDictionaryContent!mobile_MainMenu"],
				viewModel: { require: "viewmodels/menuviewmodel" },
				template: { element: "fx-template-menu" },
			});

			ko.components.register("fx-component-contact", {
				template: { require: "text!partial-views/mobile-account-contactus.html" },
			});

			ko.components.register("fx-component-internal-contactus", {
				deps: ["LoadDictionaryContent!account_InternalContactUs", "LoadDictionaryContent!support"],
				viewModel: { require: "deviceviewmodels/InternalContactUsViewModel" },
				template: { require: "text!mobileHtml/statichtml/InternalContactUs.html" },
			});

			ko.components.register("fx-component-edit-favorite-instruments", {
				viewModel: { require: "deviceviewmodels/EditFavoriteInstrumentsViewModel" },
				template: { require: "text!mobileHtml/statichtml/EditFavoriteInstruments.html" },
			});

			ko.components.register("fx-component-open-deals-grid", {
				deps: ["LoadDictionaryContent!views_vMobileOpenDeals"],
				viewModel: { require: "deviceviewmodels/OpenDealsViewModel" },
				template: { require: "text!partial-views/mobile-deals-opendeals.html" },
			});

			ko.components.register("fx-component-limits-grid", {
				deps: ["LoadDictionaryContent!views_vMobileLimits"],
				viewModel: { require: "deviceviewmodels/LimitsViewModel" },
				template: { require: "text!partial-views/mobile-deals-limits.html" },
			});

			ko.components.register("fx-component-closed-deals", {
				deps: ["LoadDictionaryContent!views_vMobileClosedDeals"],
				viewModel: { require: "deviceviewmodels/ClosedDealsViewModel" },
				template: { element: "fx-template-closed-deals" },
			});

			ko.components.register("fx-component-price-alerts-grid", {
				viewModel: { require: "deviceviewmodels/PriceAlertsViewModel" },
				template: { require: "text!partial-views/mobile-limits-pricealerts.html" },
			});

			ko.components.register("fx-component-closed-deals-filter", {
				viewModel: { require: "deviceviewmodels/ClosedDealsFilterViewModel" },
				template: { require: "text!partial-views/mobile-deals-closeddealsfilter.html" },
			});

			ko.components.register("fx-component-contract-rollover", {
				viewModel: { require: "deviceviewmodels/ContractRolloverViewModel" },
				template: { require: "text!partial-views/mobile-deals-contractrollover.html" },
			});

			ko.components.register("fx-component-account-card-records", {
				deps: ["LoadDictionaryContent!deals_AccountCardRecords"],
				viewModel: { require: "deviceviewmodels/AccountCardRecordsViewModel" },
				template: { require: "text!partial-views/mobile-deals-accountcardrecords.html" },
			});

			ko.components.register("fx-notifications-settings", {
				viewModel: { require: "viewmodels/NotificationsSettingsViewModel" },
				template: { require: "text!partial-views/mobile-compliance-notificationssettings.html" },
				deps: ["LoadDictionaryContent!compliance_NotificationsSettings"],
			});

			ko.components.register("fx-login-options", {
				deps: ["LoadDictionaryContent!loginOptions"],
				viewModel: { require: "deviceviewmodels/LoginOptionsViewModel" },
				template: { require: "text!mobileHtml/statichtml/login-options.html" },
			});

			ko.components.register("fx-component-demo-deposit-icon", {
				viewModel: { require: "viewmodels/demoDeposit/demo-deposit-icon" },
				template: { require: "text!mobileHtml/statichtml/demoDeposit/demo-deposit-icon.html" },
			});

			ko.components.register("fx-component-deposit-confirmation", {
				deps: ["LoadDictionaryContent!compliance_DepositConfirmation"],
				viewModel: { require: "viewmodels/deposit/DepositConfirmationViewModel" },
				template: { require: "text!mobileHtml/statichtml/deposit/deposit-confirmation.html" },
			});

			ko.components.register("fx-component-electronic-signature", {
				viewModel: { require: "viewmodels/deposit/ElectronicSignatureViewModel" },
				template: { require: "text!mobileHtml/statichtml/deposit/electronic-signature.html" },
			});

			ko.components.register("fx-component-demo-banner-openclosedeal", {
				viewModel: { require: "viewmodels/DemoBannerViewModel" },
				template: { require: "text!mobileHtml/statichtml/demoaccount-banner.html" },
			});

			ko.components.register("fx-component-withdrawal-wrapper", {
				template: { require: "text!mobileHtml/statichtml/withdrawal-wrapper.html" },
			});

			ko.components.register("fx-component-navigation-wizard", {
				deps: ["LoadDictionaryContent!navigationWizard"],
				viewModel: { require: "viewmodels/NavigationWizardViewModel" },
				template: { require: "text!mobileHtml/statichtml/navigation-wizard.html" },
			});

			ko.components.register("fx-component-amount-requested", {
				deps: ["LoadDictionaryContent!views_vMobileWithdrawal"],
				viewModel: { require: "viewmodels/Withdrawal/AmountRequestedViewModel" },
				template: { require: "text!mobileHtml/statichtml/Withdrawal/amount-requested.html" },
			});

			ko.components.register("fx-component-withdrawal-amount", {
				deps: ["LoadDictionaryContent!views_vMobileWithdrawal"],
				viewModel: { require: "deviceviewmodels/Withdrawal/Wizard/WithdrawalSetAmountViewModel" },
				template: { require: "text!mobileHtml/statichtml/withdrawal/wizard/withdrawal-setamount.html" },
			});

			ko.components.register("fx-component-withdrawal-method", {
				deps: ["LoadDictionaryContent!views_vMobileWithdrawal"],
				viewModel: { require: "deviceviewmodels/Withdrawal/Wizard/WithdrawalSetMethodViewModel" },
				template: { require: "text!mobileHtml/statichtml/withdrawal/wizard/withdrawal-setmethod.html" },
			});

			ko.components.register("fx-component-withdrawal-setbankdetails", {
				deps: [
					"helpers/CustomKOBindings/AutocompleteBinding",
					"LoadDictionaryContent!country_names",
					"LoadDictionaryContent!views_vMobileWithdrawal",
				],
				viewModel: { require: "deviceviewmodels/Withdrawal/Wizard/WithdrawalSetbankdetailsViewModel" },
				template: {
					require: "text!mobileHtml/statichtml/withdrawal/wizard/withdrawal-setbankdetails.html",
				},
			});

			ko.components.register("fx-component-withdrawal-setccdetails", {
				deps: [
					"LoadDictionaryContent!views_vMobileWithdrawal",
					"LoadDictionaryContent!payments_concreteView_mobile",
					"LoadDictionaryContent!payments_concreteNames",
				],
				viewModel: { require: "deviceviewmodels/Withdrawal/Wizard/WithdrawalSetCCDetailsViewModel" },
				template: { require: "text!mobileHtml/statichtml/withdrawal/wizard/withdrawal-setccdetails.html" },
			});

			ko.components.register("fx-component-withdrawal-setapproval", {
				deps: ["LoadDictionaryContent!views_vMobileWithdrawal", "LoadDictionaryContent!country_names"],
				viewModel: { require: "deviceviewmodels/Withdrawal/Wizard/WithdrawalSetApprovalViewModel" },
				template: { require: "text!mobileHtml/statichtml/withdrawal/wizard/withdrawal-setapproval.html" },
			});

			ko.components.register("fx-component-withdrawal-thankyou", {
				deps: [
					"LoadDictionaryContent!navigationWizard",
					"LoadDictionaryContent!views_vMobileWithdrawal",
					"LoadDictionaryContent!Category",
				],
				viewModel: { require: "viewmodels/Withdrawal/WithdrawalThankYouViewModel" },
				template: { require: "text!mobileHtml/statichtml/withdrawal/withdrawal-thankyou.html" },
			});

			ko.components.register("fx-component-withdrawal", {
				viewModel: { require: "viewmodels/Withdrawal/WithdrawalViewModel" },
				template: { require: "text!partial-views/mobile-withdrawal-withdrawal.html" },
			});

			ko.components.register("fx-component-withdrawalbankdetails", {
				viewModel: { require: "viewmodels/Withdrawal/WithdrawalBankDetailsViewModel" },
				template: { require: "text!partial-views/mobile-withdrawal-withdrawalbankdetails.html" },
			});

			ko.components.register("fx-component-withdrawal-ccdetails", {
				viewModel: { require: "viewmodels/Withdrawal/WithdrawalCreditCardDetailsViewModel" },
				template: { require: "text!partial-views/mobile-withdrawal-withdrawalcreditcarddetails.html" },
			});

			ko.components.register("fx-component-main-grid-instrument-search", {
				deps: ["helpers/CustomKOBindings/AutocompleteBinding"],
				viewModel: { require: "deviceviewmodels/MainGridInstrumentSearchViewModel" },
				template: { require: "text!mobileHtml/statichtml/MainGridInstrumentSearch.html" },
			});

			ko.components.register("fx-component-favorites-instrument-search", {
				deps: ["helpers/CustomKOBindings/AutocompleteBinding"],
				viewModel: { require: "deviceviewmodels/FavoritesInstrumentSearchViewModel" },
				template: { require: "text!mobileHtml/statichtml/FavoritesInstrumentSearch.html" },
			});

			ko.components.register("fx-component-closed-deals-instrument-search", {
				deps: ["helpers/CustomKOBindings/AutocompleteBinding", "LoadDictionaryContent!views_vMobileQuotes"],
				viewModel: { require: "deviceviewmodels/ClosedDealsInstrumentSearchViewModel" },
				template: { require: "text!mobileHtml/statichtml/ClosedDealsInstrumentSearch.html" },
			});

			ko.components.register("fx-component-positions-tabs", {
				viewModel: { instance: ViewModelsManager },
				template: { require: "text!mobileHtml/statichtml/deals/DealTabs.html" },
			});

			ko.components.register("fx-component-question-mark", {
				viewModel: { require: "deviceviewmodels/QuestionMarkViewModel" },
				template: { require: "text!mobileHtml/statichtml/content/questionmark.html" },
			});

			ko.components.register("fx-component-help", {
				viewModel: { require: "deviceviewmodels/HelpViewModel" },
				template: { require: "text!mobileHtml/statichtml/content/Help.html" },
			});

			ko.components.register("faq", {
				viewModel: { require: "viewmodels/Content/FaqQuestionViewModel" },
				template: { require: "text!mobileHtml/statichtml/content/content-faq-question.html" },
			});

			ko.components.register("fx-component-faq", {
				viewModel: { require: "viewmodels/questionnaire/FaqViewModel" },
				template: { require: "text!mobileHtml/statichtml/content/faq.html" },
			});

			ko.components.register("fx-component-support", {
				viewModel: { require: "viewmodels/questionnaire/SupportViewModel" },
				template: { require: "text!mobileHtml/statichtml/questionnaire/support.html" },
			});

			ko.components.register("fx-component-amount-spinner", {
				viewModel: { require: "viewmodels/AmountSpinnerFieldViewModel" },
				template: { require: "text!mobileHtml/statichtml/AmountSpinnerField.html" },
			});

			ko.components.register("fx-component-low-margin-spinner", {
				viewModel: { require: "viewmodels/LowMarginSpinnerViewModel" },
				template: { require: "text!mobileHtml/statichtml/LowMarginSpinnerField.html" },
			});

			ko.components.register("fx-component-search-country", {
				deps: ["helpers/CustomKOBindings/AutocompleteBinding", "LoadDictionaryContent!country_names"],
				viewModel: { require: "deviceviewmodels/SearchCountryViewModel" },
				template: { require: "text!mobileHtml/statichtml/SearchCountry.html" },
			});

			ko.components.register("fx-component-wire-transfer-success", {
				viewModel: { require: "deviceviewmodels/Deposit/WireTransferSuccessViewModel" },
				template: { require: "text!mobileHtml/statichtml/deposit/wire-transfer-success.html" },
			});

			ko.components.register("fx-component-access-request-signals-details", {
				deps: ["LoadDictionaryContent!accessRequest"],
				viewModel: { require: "viewmodels/AccessRequestViewModel" },
				template: { require: "text!mobileHtml/statichtml/Signals/SignalDetailsAccessRequest.html" },
			});

			ko.components.register("fx-component-access-request-signals", {
				deps: ["LoadDictionaryContent!accessRequest"],
				viewModel: { require: "viewmodels/AccessRequestViewModel" },
				template: { require: "text!mobileHtml/statichtml/Signals/SignalsAccessRequest.html" },
			});

			ko.components.register("fx-tutorials-request-access", {
				deps: ["LoadDictionaryContent!accessRequest"],
				viewModel: { require: "viewmodels/AccessRequestViewModel" },
				template: { require: "text!mobileHtml/statichtml/Tutorials/TutorialsRequestAcess.html" },
			});

			ko.components.register("fx-component-account-header", {
				viewModel: { require: "viewmodels/accounthub/AccountHeaderViewModel" },
				template: { require: "text!mobileHtml/statichtml/AccountHub/AccountHeader.html" },
			});

			ko.components.register("fx-component-account-hub-countdown", {
				deps: ["LoadDictionaryContent!account_hub"],
				viewModel: { require: "viewmodels/accounthub/AccountHubCountdownViewModel" },
				template: { require: "text!mobileHtml/statichtml/AccountHub/AccountHubCountdown.html" },
			});

			ko.components.register("fx-component-userflow-wrap", {
				viewModel: { require: "viewmodels/Account/UserFlowWrapViewModel" },
				template: { require: "text!mobileHtml/statichtml/account/user-flow-wrap.html" },
			});

			ko.components.register("fx-component-account-userflow-br" + urlResolver.getBroker(), {
				viewModel: { require: "deviceviewmodels/account/UserFlowViewModel" },
				template: {
					require: "text!mobileHtml/statichtml/account/userflow-br" + urlResolver.getBroker() + ".html",
				},
			});

			ko.components.register("fx-component-account-preferences", {
				deps: ["LoadDictionaryContent!accountPreferences"],
				viewModel: { require: "viewmodels/AccountPreferencesViewModel" },
				template: { require: "text!partial-views/mobile-account-preferences.html" },
			});

			ko.components.register("fx-component-personal-details", {
				deps: ["LoadDictionaryContent!country_names"],
				viewModel: { require: "viewmodels/PersonalDetailsViewModel" },
				template: { require: "text!partial-views/mobile-customer-PersonalDetailsPartial.html" },
			});

			ko.components.register("fx-instrument-notavailable", {
				viewModel: { require: "viewmodels/InstrumentNotAvailableViewModel" },
				template: { require: "text!mobileHtml/statichtml/instrument-notavailable.html" },
			});

			ko.components.register("fx-component-help-center-action", {
				viewModel: { require: "viewmodels/HelpCenter/HelpCenterActionViewModel" },
				template: { require: "text!mobileHtml/statichtml/HelpCenter/help-center-action.html" },
			});

			ko.components.register("fx-component-help-center", {
				deps: ["LoadDictionaryContent!HelpCenterWalkthroughs", "LoadDictionaryContent!HelpCenterTradingGuide"],
				viewModel: { require: "deviceviewmodels/HelpCenterViewModel" },
				template: { require: "text!mobileHtml/statichtml/HelpCenter/help-center.html" },
			});

			// begin fix for merge Changeset 166784
			if (
				general.isStringType(configuration["fx-personal-guide"]) &&
				configuration["fx-personal-guide"].indexOf("Variation4") >= 0
			) {
				ko.components.register("fx-component-help-center-bubble", {
					viewModel: { require: "deviceviewmodels/helpcenter/HelpCenterBubbleViewModel" },
					template: { require: "text!mobileHtml/statichtml/HelpCenter/help-center-bubble-variation-4.html" },
				});
			} else {
				ko.components.register("fx-component-help-center-bubble", {
					viewModel: { require: "deviceviewmodels/helpcenter/HelpCenterBubbleViewModel" },
					template: { require: "text!mobileHtml/statichtml/HelpCenter/help-center-bubble.html" },
				});
			}
			// begin fix for merge Changeset 166784

			ko.components.register("fx-component-feedback", {
				deps: ["LoadDictionaryContent!emily_feedback"],
				viewModel: { require: "viewmodels/FeedBack/FeedBackViewModel" },
				template: { require: "text!viewmodels/FeedBack/FeedBackTemplate.html" },
			});

			ko.components.register("fx-confirm-documentverification", {
				deps: ["LoadDictionaryContent!compliance_UploadDocuments"],
				viewModel: { require: "deviceviewmodels/UploadDocuments/VerificationDocumentViewModel" },
				template: { require: "text!mobileHtml/statichtml/Compliance/confirm-verification-document.html" },
			});

			ko.components.register("fx-documentverification-modal", {
				deps: [
					"LoadDictionaryContent!compliance_UploadDocuments",
					"LoadDictionaryContent!UploadDocumentsStatusPopUpMessages",
				],
				viewModel: { require: "deviceviewmodels/UploadDocuments/VerificationDocumentModal" },
				template: { require: "text!mobileHtml/statichtml/Compliance/verification-document-modal.html" },
			});

			PaymentsConfiguration.RegisterDepositComponents(configuration);
		}

		function registerContentTemplateComponents() {
			ko.components.register("phone", {
				template: { require: "text!mobileHtml/statichtml/content/content-phone.html" },
				viewModel: {
					createViewModel: function (params, componentInfo) {
						return {
							number: componentInfo.templateNodes[0].data,
						};
					},
				},
			});
		}

		function adjustCulture() {
			if (typeof Globalize !== "undefined") {
				var cultureInfo = {
					numberFormat: {},
				};

				cultureInfo.numberFormat[","] = "";
				Globalize.addCultureInfo("noThousandsSeparator", "default", cultureInfo);
				window.Globalize = Globalize;
			}

			return true;
		}

		return {
			AdjustCulture: adjustCulture,
			RegisterComponents: registerComponents,
			RegisterContentTemplateComponents: registerContentTemplateComponents,
			BindKO: bindKO,
			AdjustHtml: adjustHtml,
			AddPixel: addPixel,
			ExposeUI: exposeUI,
			UpdateScmmTrackingData: updateScmmTrackingData,
		};
	}

	return PlugInConfiguration();
});
