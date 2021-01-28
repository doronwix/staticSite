define(
    'deviceviewmodels/UploadDocuments/VerificationDocumentViewModel',
    [
        'require',
        'handlers/general',
        'devicemanagers/ViewModelsManager',
        'managers/viewsmanager',
        'viewmodels/BaseVerificationDocumentViewModel'
    ],
    function (require) {
        var ViewModelsManager = require('devicemanagers/ViewModelsManager'),
            general = require('handlers/general'),
            ViewsManager = require('managers/viewsmanager'),
            BaseVerificationDocumentViewModel = require('viewmodels/BaseVerificationDocumentViewModel');

        var VerificationDocumentViewModel = general.extendClass(BaseVerificationDocumentViewModel, function (params) {
            var self = this,
                parent = this.parent, // inherited from BaseVerificationDocumentViewModel
                data = this.Data; // inherited from BaseVerificationDocumentViewModel

            function init() {
                parent.Init.call(self);
            }

            function onClick() {
                parent.GetVerificationDocumentUrl(params.documentTypeId)
                    .then(function (response) {
                        if (!general.isNullOrUndefined(response) && !general.isEmptyValue(response.iframeUrl)) {
                            openShuftyModal(response.iframeUrl);
                        } else {
                            parent.SetStateNormalUpload(true);
                        }
                    })
                    .done();
            }

            function openShuftyModal(iframeUrl) {
                ViewModelsManager.VManager.SwitchViewVisible(eForms.DocumentVerificationModal,
                    {
                        iframeUrl: iframeUrl,
                        confirmAlertMsg: parent.GetConfirmAlertMsg(),
                        documentTypeId: params.documentTypeId,
                        viewToReturn: ViewsManager.Activeform() ? ViewsManager.Activeform().type : null
                    }
                );
            }

            return {
                Data: data,
                Init: init,
                OnClick: onClick
            };
        });

        var createViewModel = function (params) {
            var viewModel = new VerificationDocumentViewModel(params);

            viewModel.Init();

            return viewModel;
        };

        return {
            viewModel: {
                createViewModel: createViewModel
            }
        };
    }
)