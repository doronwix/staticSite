define(
    'deviceviewmodels/UploadDocuments/VerificationDocumentViewModel',
    [
        'require',
        'handlers/general',
        'viewmodels/dialogs/DialogViewModel',
        'viewmodels/BaseVerificationDocumentViewModel',
        'devicemanagers/AlertsManager',
        'managers/viewsmanager'
    ],
    function (require) {
        var DialogViewModel = require('viewmodels/dialogs/DialogViewModel'),
            AlertsManager = require('devicemanagers/AlertsManager'),
            ViewsManager = require('managers/viewsmanager'),
            general = require('handlers/general'),
            BaseVerificationDocumentViewModel = require('viewmodels/BaseVerificationDocumentViewModel');

        var VerificationDocumentViewModel = general.extendClass(BaseVerificationDocumentViewModel, function (params) {
            var self = this,
                parent = this.parent, // inherited from BaseVerificationDocumentViewModel
                data = this.Data, // inherited from BaseVerificationDocumentViewModel
                verificationDoneMsg = "done-document-type" + params.documentTypeId;  

            function init() {
                parent.Init.call(self);

                window.addEventListener("message", function (event) {
                    if (event.data.msg === verificationDoneMsg) {
                        parent.SetStateDocStatusText(false);
                        parent.SetStateConfirm(false);
                        data.enableConfirm(false);

                        DialogViewModel.close(eDialog.DocumentVerification, true);

                        ViewsManager.SwitchViewVisible(eForms.UploadDocuments);

                        AlertsManager.UpdateAlert(AlertTypes.GeneralOkAlert,
                            Dictionary.GetItem("pleaseNoteTitle"),
                            parent.GetConfirmAlertMsg(),
                            null, {});
                        AlertsManager.PopAlert(AlertTypes.GeneralOkAlert);
                    }
                });
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
                var widthCoef = parseFloat((window.innerWidth / 1000).toFixed(2));
                var heightCoef = parseFloat((window.innerHeight / 500).toFixed(2));
                var modalWidth = parseFloat((window.innerWidth / widthCoef).toFixed(2));
                var modalHeight = parseFloat((window.innerHeight / heightCoef).toFixed(2));

                var options = {
                    title: '',
                    width: modalWidth,
                    height: modalHeight,
                    dialogClass: 'fx-dialog verification-document-dialog',
                    modal: true,
                    draggable: true,
                    resizable: false,
                    left: (window.innerWidth - modalWidth) / 2,
                    top: 146,
                    offset: modalWidth,
                    useDialogPosition: true
                };

                var args = {
                    iframeUrl: iframeUrl,
                    iframeHeight: modalHeight
                };

                DialogViewModel.open(eDialog.DocumentVerification,
                    options,
                    eViewTypes.vDocumentVerificationModal,
                    args);
            }

            return {
                Init: init,
                Data: data,
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