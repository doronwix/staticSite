define("managers/CommunicationManager", ["knockout", "fxnet/fxnet"], function (ko, FxNet) {
	var CommunicationManager = function (communicationInfo) {
		var actionUrl = communicationInfo.actionUrl;
		var postDataArr = communicationInfo.postData;
		var proccessStarted = false;

		var isPost = function () {
			if (postDataArr && postDataArr.length > 0) {
				return true;
			}
			return false;
		};

		var send = function (communicationWindow) {
			setData(communicationWindow);
			navigate(communicationWindow);
		};

		var setData = function (communicationWindow) {
			if (isPost()) {
				preparePostRedirect(communicationWindow);
			}
		};

		var navigate = function (communicationWindow) {
			if (proccessStarted) return;

			if (isPost()) {
				proccessStarted = true;
				communicationWindow.document.forms[0].submit();
			} else {
				communicationWindow.location = actionUrl;
			}

			FxNet.exposeUI();
		};

		var preparePostRedirect = function (communicationWindow) {
			var newDoc = communicationWindow.document;
			var form = createForm(newDoc);
			newDoc.getElementsByTagName("body")[0].appendChild(form);

			var postElements = postDataArr.map(function (postData) {
				var input = newDoc.createElement("input");
				input.setAttribute("type", "hidden");
				input.setAttribute("name", postData.name);
				input.setAttribute("value", postData.value);
				return input;
			});

			ko.utils.setDomNodeChildren(form, postElements);
		};

		var createForm = function (document) {
			var f = document.createElement("form");
			f.setAttribute("method", "post");
			f.setAttribute("action", actionUrl);

			return f;
		};

		return {
			Send: send,
			ActionUrl: actionUrl,
			PostDataArr: postDataArr,
			Hash: communicationInfo.hash,
			AccountNumber: communicationInfo.accountNumber,
			Title: communicationInfo.title,
		};
	};
	return CommunicationManager;
});
