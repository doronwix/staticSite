define(
    'viewmodels/questionnaire/SupportViewModel',
    [
        'require',
        'knockout',
        'Dictionary',
        'LoadDictionaryContent!Support'
    ],
    function () {
        var dictionary = require('Dictionary'), ko = require('knockout');

        function onCallBackClick() {
            ko.postbox.publish('support-interaction', 'callback');
        }

        var createViewModel = function () {
            return {
                lnkEmailResponse: dictionary.GetItem("lnkEmailResponse", "support"),
                lblCompliancePhone: dictionary.GetItem("lblCompliancePhone", "support"),
                callBackLink: dictionary.GetItem("callBackLink", "support"),
                enableChat: dictionary.GetItem("enableGTMChat", "support") === "1",
                isClickChatEnabled: !dictionary.ValueIsEmpty("lnkClickChat", "support"),
                isCallMeBackEnabled: !dictionary.ValueIsEmpty("lblCallMeBack", "support"),
                onCallBackClick: onCallBackClick
            };
        };

        return {
            viewModel: {
                createViewModel: createViewModel
            }
        };
    }
);
