define(
    'deviceviewmodels/UploadDocuments/VerificationDocumentModal',
    [
        'require',
        'knockout',
        'helpers/KoComponentViewModel',
        'handlers/general',
        'managers/viewsmanager',
        'StateObject!VerificationDocument',
        'devicemanagers/AlertsManager'
    ],
    function (require) {
        var ko = require('knockout'),
            ViewsManager = require('managers/viewsmanager'),
            general = require('handlers/general'),
            AlertsManager = require('devicemanagers/AlertsManager'),
            StateVerificationDocument = require('StateObject!VerificationDocument'),
            KoComponentViewModel = require('helpers/KoComponentViewModel');

        var VerificationDocumentModal = general.extendClass(KoComponentViewModel, function (params) {
            var data = this.Data,
                viewToReturn = null,
                verificationDoneMsg = "done-document-type" + params.documentTypeId;

            function init() {
                setObservables();

                viewToReturn = params.viewToReturn;

                window.addEventListener("message", function (event) {
                    if (event.data.msg === verificationDoneMsg) {
                        setStateObject(false);

                        AlertsManager.UpdateAlert(AlertTypes.GeneralOkAlert,
                            Dictionary.GetItem("pleaseNoteTitle"),
                            params.confirmAlertMsg,
                            null,
                            {
                                theme: 'alerts-white-theme alerts-no-close-x spaced-list'
                            });
                        AlertsManager.PopAlert(AlertTypes.GeneralOkAlert);

                        ViewsManager.SwitchViewVisible(viewToReturn);
                    }
                });
            }

            function setStateObject(value) {
                var stateObj = StateVerificationDocument.get(params.documentType);

                if (stateObj) {
                    stateObj.enableConfirm = value;
                    stateObj.showDocStatusText = value;
                    StateVerificationDocument.update(params.documentType, stateObj);
                }
            }

            function setObservables() {
                var iframeElem = document.getElementById("shuftipro-iframe");

                data.iframeElement = ko.observable(iframeElem);
                data.iframeUrl = ko.observable(params.iframeUrl);
            }

            return {
                Init: init,
                Data: data
            };
        });

        var createViewModel = function (params) {
            var viewModel = new VerificationDocumentModal(params);

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