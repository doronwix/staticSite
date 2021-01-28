define(
    'viewmodels/BaseVerificationDocumentViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'handlers/Logger',
        'helpers/KoComponentViewModel',
        'dataaccess/dalCompliance',
        'StateObject!VerificationDocument',
        'Dictionary'
    ],
    function (require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            logger = require('handlers/Logger'),
            KoComponentViewModel = require('helpers/KoComponentViewModel'),
            dalCompliance = require('dataaccess/dalCompliance'),
            StateVerificationDocument = require('StateObject!VerificationDocument'),
            Dictionary = require('Dictionary');

        var BaseVerificationDocumentViewModel = general.extendClass(KoComponentViewModel, function (params) {
            var data = this.Data,
                stateObj = StateVerificationDocument.get(params.documentType);

            function init() {
                setObservables();
            }

            function setObservables() {
                var isEnabled = stateObj.enableConfirm;

                if (isEnabled) {
                    isEnabled = params.documentStatus !== eUploadDocumentStatus.Approved;
                    setStateConfirm(isEnabled);
                }

                data.enableConfirm = ko.observable(isEnabled);
            }

            function setStateConfirm(value) {
                if (stateObj) {
                    stateObj.enableConfirm = value;
                    StateVerificationDocument.update(params.documentType, stateObj);
                }
            }

            function setStateDocStatusText(value) {
                if (stateObj) {
                    stateObj.showDocStatusText = value;
                    StateVerificationDocument.update(params.documentType, stateObj);
                }
            }

            function setStateNormalUpload(value) {
                if (stateObj) {
                    stateObj.normalUpload = value;
                    StateVerificationDocument.update(params.documentType, stateObj);
                }
            }

            function getVerificationDocumentUrl() {
                return dalCompliance
                    .getVerificationDocumentUrl(params.documentTypeId)
                    .then(function (response) {
                        if (!general.isNullOrUndefined(response)) {
                            var parsedResponse = JSONHelper.STR2JSON("dalCompliance:getVerificationDocumentUrl", response);

                            return parsedResponse;
                        } else {
                            logger.warn("VerificationDocumentViewModel:GetVerificationDocumentUrl", "Shufty Url is null/empty", general.emptyFn, eErrorSeverity.warning);
                            return null;
                        }
                    });
            }

            function getConfirmAlertMsg() {
                var uploadDocTypeName = general.getKeyByValue(eUploadDocumentType, params.documentTypeId);
                var document_type_name = Dictionary.GetItem('docname_' + uploadDocTypeName, 'UploadDocumentsStatusPopUpMessages');

                var confirmBodyMsg = Dictionary.GetItem('docname_load_success', 'UploadDocumentsStatusPopUpMessages');

                if (confirmBodyMsg) {
                    confirmBodyMsg = confirmBodyMsg.replace('{0}', document_type_name);
                }

                return confirmBodyMsg;
            }

            return {
                Init: init,
                Data: data,
                SetStateConfirm: setStateConfirm,
                SetStateDocStatusText: setStateDocStatusText,
                SetStateNormalUpload: setStateNormalUpload,
                GetVerificationDocumentUrl: getVerificationDocumentUrl,
                GetConfirmAlertMsg: getConfirmAlertMsg
            };
        });

        return BaseVerificationDocumentViewModel;
    }
);
