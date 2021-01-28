define("viewmodels/Account/UserFlowWrapViewModel", ["require", "global/UrlResolver"], function (require) {
	var urlResolver = require("global/UrlResolver");

	return {
		viewModel: {
			createViewModel: function () {
				return {
					UserFlowComponent: "fx-component-account-userflow-br" + urlResolver.getBroker(),
				};
			},
		},
	};
});
