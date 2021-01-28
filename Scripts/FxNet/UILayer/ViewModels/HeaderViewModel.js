var HeaderViewModel = function () {
	var goToMainPage = function () {
		$viewModelsManager.VManager.SwitchViewVisible($customer.prop.mainPage, {});
	};

	var init = function () {};

	return {
		Init: init,
		GoToMainPage: goToMainPage,
	};
};

define(["devicemanagers/ViewModelsManager", "generalmanagers/StatesManager", "initdatamanagers/Customer"], function (
	viewModelsManager,
	statesManager,
	customer
) {
	var data = {};
	var goToMainPage = function () {
		viewModelsManager.VManager.SwitchViewVisible($customer.prop.mainPage, {});
	};

	var init = function () {
		data.isOnlyForexCustomer = customer.prop.tradingPermissions.isOnlyForexCustomer;
	};

	return {
		Init: init,
		GoToMainPage: goToMainPage,
		VMM: viewModelsManager,
		data: data,
	};
});
