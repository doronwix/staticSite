define(
    'deviceviewmodels/InternalContactUsViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'helpers/KoComponentViewModel',
        'global/UrlResolver',
        'Dictionary'
    ],
    function InternalContactUsDef(require) {
        var general = require('handlers/general'),
            ko = require('knockout'),
            koComponentViewModel = require('helpers/KoComponentViewModel'),
            UrlResolver = require('global/UrlResolver'),
            dictionary = require('Dictionary');

        var InternalContactUsViewModel = general.extendClass(koComponentViewModel, function InternalContactUsClass() {
            var parent = this.parent, // inherited from KoComponentViewModel
                data = parent.Data; // inherited from KoComponentViewModel

            //----------------------------------------------------------------
            function init() {
                data.isNativeIos = UrlResolver.isNativeIos();
                data.lnkEmailResponse = dictionary.GetItem("lnkEmailResponse", "support");
                data.lblCompliancePhone = dictionary.GetItem("lblCompliancePhone", "support");
                data.callBackLink = dictionary.GetItem("callBackLink", "support");
                data.onCallBackClick = onCallBackClick;
            }

            //----------------------------------------------------------------

            function onCallBackClick() {
                ko.postbox.publish('support-interaction', 'callback');
            }

            return {
                init: init,
                Data: data
            };
        });

        function createViewModel() {
            var viewModel = new InternalContactUsViewModel();

            viewModel.init();

            return viewModel;
        }

        return {
            viewModel: {
                createViewModel: createViewModel
            }
        };
    }
);
