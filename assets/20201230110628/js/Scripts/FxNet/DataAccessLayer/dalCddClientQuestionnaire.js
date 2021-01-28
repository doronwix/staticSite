define("dataaccess/dalCddClientQuestionnaire", [
	"require",
	"handlers/Ajaxer",
	"JSONHelper",
	"StateObject!PostLoginAlerts",
	"generalmanagers/ErrorManager",
	"enums/enums",
	"global/UrlResolver",
], function DalCddClientQuestionnaireDef(require) {
	var TAjaxer = require("handlers/Ajaxer"),
		jsonhelper = require("JSONHelper"),
		postLoginAlerts = require("StateObject!PostLoginAlerts"),
		errorManager = require("generalmanagers/ErrorManager"),
		urlResolver = require("global/UrlResolver"),
		ajaxer = new TAjaxer(),
		callerInfo = "dalCddClientQuestionnaire";

	function post(customerAnswers) {
		var customerAnswersUrl = "compliance/CddCustomerAnswers?" + urlResolver.getRndKeyValue();

		return ajaxer.promises
			.jsonPost(callerInfo, customerAnswersUrl, JSON.stringify(customerAnswers))
			.then(function (response) {
				var showAlerts = 1;
				postLoginAlerts.update("SetAlertsBehaviorMode", showAlerts);
				var model = jsonhelper.STR2JSON("dalCddClientQuestionnaire", response);

				return model;
			})
			.fail(function (responseError) {
				return responseError;
			});
	}

	function loadCddPreviousAnswers() {
		var customerAnswersUrl = "compliance/GetCDDQuestionnaireLastAnswers?" + urlResolver.getRndKeyValue();

		return ajaxer.promises
			.get(callerInfo, customerAnswersUrl, null, null, null, null, 1)
			.then(function GetQuestionnairesPreviouAnswers(response) {
				return jsonhelper.STR2JSON("dalCddClientQuestionnaire:GetQuestionnairesPreviousAnswers", response);
			})
			.fail(function GetQuestionnairePreviousAnswersFail(responseError) {
				errorManager.onError(
					"compliance/CddCustomerAnswers",
					responseError.message || "",
					eErrorSeverity.warning
				);

				return {};
			});
	}

	return {
		post: post,
		LoadCddPreviousAnswers: loadCddPreviousAnswers,
	};
});
