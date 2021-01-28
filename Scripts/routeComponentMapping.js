/**
 * strategy wise perhaps it would be better to 'require' the  component
 * that would involve changing the way components are defined
 * eg: menuComponent = define(['menuviewmodel', 'template'], function() {
 * })
 */

/**
 * @typedef ComponentConfig
 * @type {object}
 * @property {string} viewModel
 * @property {string} template
 */

/**
 * @typedef ViewComponents
 * @type {ComponentConfig[]}
 */

/**
 * components
 */

var summaryView = [
	{
		viewModel: "viewmodels/WalletViewModel",
		template: "text!webHtml/statichtml/AcccountSummaryWallet.html",
	},
	{
		template: "text!partial-views/web-customer-netexposuresummary.html",
		viewModel: "", //extract viewmodel from viewModel: { instance: { VmNetExposure: ViewModelsManager.VmNetExposure } },
	},
];

var menuView = [
	{
		viewModel: "viewmodels/menuviewmodel",
		template: "text!webHtml/statichtml/MainHeader.html",
	},
];

var quotesView = [
	{
		viewModel: "devicemanagers/ViewModelsManager",
	},
	{
		viewModel: "deviceviewmodels/PresetInstrumentSearchViewModel",
		template: "text!webHtml/statichtml/PresetInstrumentSearch.html",
	},
];

var unparented = [
	{
		viewModel: "viewmodels/accounthub/AccountHubCardViewModel",
		template: "text!webHtml/statichtml/AccountHub/AccountHubCard.html",
	},
	{
		viewModel: "viewmodels/Account/UserFlowWrapViewModel",
		template: "text!webHtml/statichtml/account/user-flow-wrap.html",
	},
	// the templates are dynamic for this, not going to include them
	{
		viewModel: "deviceviewmodels/account/UserFlowViewModel",
	},
	// behind abtest flag
	{
		viewModel: "deviceviewmodels/HelpCenterViewModel",
		template: "text!webHtml/statichtml/HelpCenter/help-center.html",
	},
	{
		viewModel: "viewmodels/HelpCenter/HelpCenterActionViewModel",
		template: "text!webHtml/statichtml/HelpCenter/help-center-action.html",
	},
];

// this one still needs to have deps to $viewModelsManager removed from its template
var toolbarView = [
	{
		viewModel: "deviceviewmodels/toolbarviewmodel",
		template: "text!webHtml/statichtml/toolbartemplate.html",
	},
];

var marketView = [
	{
		viewModel: "viewmodels/MarketClosedViewModel",
	},
];

/**
 * check if value exists in array
 *
 * @param {string} value
 * @param {number} index
 * @param {string[]} selfArray
 *
 * @returns {boolean}
 */
function onlyUnique(value, index, selfArray) {
	return selfArray.indexOf(value) === index;
}

/**
 * from object to list of require modules
 *
 * @param {string[]} list
 * @param {ComponentConfig} componentConfig
 * @returns {string[]}
 */
function componentConfigToList(list, componentConfig) {
	return list.concat(
		Object.keys(componentConfig).map(function (key) {
			return componentConfig[key];
		})
	);
}

/**
 * Returns unique list of require modules
 *
 * @param {ViewComponents} viewComponents
 * @returns {string[]}
 */
function flattenConfig(viewComponents) {
	return viewComponents.reduce(componentConfigToList, []).filter(onlyUnique);
}

var closedDeals = [
	{
		viewModel: "deviceviewmodels/AccountClosedDealsViewModel",
		template: "text!partial-views/web-deals-closeddeals.html",
	},
];

var eForms = {};

var eViewTypes = {};
define([], function () {
	return {
		// [eForms.Deals]: {
		// 	[eViewTypes.vQuotes]: quotesView,
		// 	[eViewTypes.vQuotesPreset]: quotesView,
		// 	[eViewTypes.vSummeryView]: summaryView,
		// 	[eViewTypes.vAccountSummaryWallet]: [quotesView, summaryView],
		// 	[eViewTypes.vDealsTabs]: [],
		// 	[eViewTypes.vOpenDeals]: [],
		// 	[eViewTypes.vLimits]: [],
		// 	[eViewTypes.vClosedDeals]: closedDeals,
		// 	[eViewTypes.vMenu]: menuView,
		// 	[eViewTypes.vToolBar]: toolbarView,
		// 	// vMarketClosed - convert fx-template-market-closed to html file
		// 	[eViewTypes.vMarketClosed]: marketView,
		// 	[eViewTypes.vEnableTrading]: [],
		// },
	};
});
