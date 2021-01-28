define(
    'viewmodels/Withdrawal/WithdrawalThankYouViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'helpers/KoComponentViewModel',
        'managers/viewsmanager',
        'modules/WithdrawalCommon',
        'StateObject!withdrawal',
        'dataaccess/dalCompliance'
    ],
    function WithdrawalThankYouDef(require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            viewsManager = require('managers/viewsmanager'),
            withdrawalCommon = require('modules/WithdrawalCommon'),
            withdrawalState = require('StateObject!withdrawal'),
            dalCompliance = require('dataaccess/dalCompliance'),
            KoComponentViewModel = require('helpers/KoComponentViewModel');

        var WithdrawalThankYouViewModel = general.extendClass(KoComponentViewModel, function WithdrawalThankClass() {
            var self = this,
                parent = this.parent,
                data = this.Data;

            function init(settings) {
                var redirectFromWizard = withdrawalState.get('redirectFromWizard');
                parent.init.call(self, settings);
                withdrawalState.unset('redirectFromWizard');

                setObservables();

                if (!redirectFromWizard) {
                    withdrawalCommon.goToDefaultPage();
                    return;
                }

                getUploadDocuments();
            }

            function setObservables() {
                data.isLoading = ko.observable(true);
                data.documentsToUpload = ko.observableArray();
            }

            function getUploadDocuments() {
                dalCompliance.getUploadDocumentsData().then(function (response) {
                    var docs = JSONHelper.STR2JSON("WithdrawalThankYouViewModel/getUploadDocuments", response, eErrorSeverity.medium);

                    if (!(general.isNullOrUndefined(docs) && general.isNullOrUndefined(docs.Data) && general.isEmpty(docs.Data))) {
                        data.documentsToUpload(filterDocs(docs.Data));
                    }
                    data.isLoading(false);
                });
            }

            function filterDocs(docs) {
                return docs.filter(function (doc) {
                    var docStatus = doc.DocumentStatus,
                        docTypeId = doc.DocumentTypeID,
                        hasDocStatus = docStatus !== eUploadDocumentStatus.NotRequired && docStatus !== eUploadDocumentStatus.Approved,
                        hasDocType = (docTypeId === eUploadDocumentType.ProofOfID ||
                            docTypeId === eUploadDocumentType.ProofOfResidence ||
                            docTypeId === eUploadDocumentType.CreditCardCopy);

                    return hasDocStatus && hasDocType;
                });
            }

            function onClickUploadDocuments() {
                viewsManager.RedirectToForm(eForms.UploadDocuments);
            }

            function onClickDefaultAction() {
                withdrawalCommon.goToDefaultPage();
            }

            function dispose() {
                parent.dispose.call(self);
            }

            return {
                init: init,
                OnClickDefaultAction: onClickDefaultAction,
                OnClickUploadDocuments: onClickUploadDocuments,
                dispose: dispose,
                Data: data
            };
        });

        var createViewModel = function () {
            var viewModel = new WithdrawalThankYouViewModel();
            viewModel.init();

            return viewModel;
        };

        return {
            viewModel: {
                createViewModel: createViewModel
            }
        };
    }
);
