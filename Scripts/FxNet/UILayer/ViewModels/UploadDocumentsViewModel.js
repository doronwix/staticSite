define(
    'viewmodels/UploadDocumentsViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'helpers/KoComponentViewModel',
        'JSONHelper',
        'dataaccess/dalCompliance',
        'viewmodels/UploadDocumentsComponentViewModel',
        'modules/permissionsmodule',
        'enums/alertenums',
        'devicemanagers/AlertsManager',
        'devicecustommodules/DepositConfirmationActions',
        'StateObject!UploadDocuments',
        'StateObject!userFlow',
        'initdatamanagers/Customer'
    ],
    function UploadDocumentsDef(require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            JSONHelper = require('JSONHelper'),
            dalCompliance = require('dataaccess/dalCompliance'),
            UploadDocumentsComponentViewModel = require('viewmodels/UploadDocumentsComponentViewModel'),
            permissionsModule = require('modules/permissionsmodule'),
            AlertTypes = require('enums/alertenums'),
            AlertsManager = require('devicemanagers/AlertsManager'),
            DepositConfirmationActions = require('devicecustommodules/DepositConfirmationActions'),
            KoComponentViewModel = require('helpers/KoComponentViewModel'),
            stateObject = require('StateObject!UploadDocuments'),
            soUserFlow = require('StateObject!userFlow');

        var UploadDocumentsViewModel = general.extendClass(KoComponentViewModel,
            function UploadDocumentsClass() {
                var self = this,
                    parent = this.parent, // inherited from KoComponentViewModel
                    data = this.Data, // inherited from KoComponentViewModel
                    index = 0,
                    docsHash = new THashTable(),
                    soUnsubscribe;

                function init() {
                    parent.init.call(self); // inherited from KoComponentViewModel

                    setIsLoading();
                    data.isPermitted = permissionsModule.CheckPermissions('uploadDocuments');

                    setObservables();
                    setSubscribers();
                    getData();
                }

                function setObservables() {
                    data.documentsData = ko.observable(docsHash);
                    data.notApprovedCreditCards = ko.observable([]);
                    data.ccTooltipVisible = ko.observable(false);
                    data.isEmailClicked = ko.observable(false);
                    setPoiDocumentsStatus(soUserFlow.get(eStateObjectTopics.UserFlowChanged));
                }

                function setSubscribers() {
                    soUnsubscribe = soUserFlow.subscribe(eStateObjectTopics.UserFlowChanged, function (model) {
                        setPoiDocumentsStatus(model);
                    });
                }

                function setPoiDocumentsStatus(model) {
                    if (!data.hasOwnProperty('poiDocumentsRequired')) {
                        data.poiDocumentsRequired = ko.observable(false);
                    }

                    if (!model || model.userStatus === eUserStatus.NA) {
                        return;
                    }

                    data.poiDocumentsRequired(model.daysCounter > 0);
                }

                function setIsLoading() {
                    stateObject.set('isLoaded', null);
                    stateObject.update('isLoaded', false);
                }

                function setIsLoaded() {
                    stateObject.set('uploadTypes', Object.keys(data.documentsData().Container))
                    stateObject.update('isLoaded', true);
                }

                function getData() {
                    dalCompliance
                        .getUploadDocumentsData()
                        .then(processUploadDocumentsData)
                        .then(setIsLoaded);
                }

                function processUploadDocumentsData(docsData) {
                    var docs = JSONHelper.STR2JSON('UploadDocumentsViewModel/getUploadDocumentsData', docsData, eErrorSeverity.medium);

                    if (!docs) {
                        return;
                    }

                    if (docs.Data) {
                        processDocuments(docs.Data);
                    }

                    if (docs.NotApprovedCreditCards) {
                        data.notApprovedCreditCards(docs.NotApprovedCreditCards);
                    }
                }

                function processDocuments(docData) {
                    docsHash = data.documentsData();
                    docData.forEach(processDocument);

                    var otherDoc = docsHash.GetItem(eUploadDocumentType.OtherDocuments);
                    docsHash.OverrideItem(eUploadDocumentType.OtherDocuments, otherDoc);

                    index = 0;
                    data.documentsData(docsHash);
                }

                function processDocument(docDataFromServer, i) {
                    var acceptedDocumentTypes = [
                        eUploadDocumentType.ProofOfID,
                        eUploadDocumentType.ProofOfResidence,
                        eUploadDocumentType.CreditCardCopy,
                        eUploadDocumentType.DepositConfirmation,
                        eUploadDocumentType.WithdrawalPendingRequest,
                        eUploadDocumentType.TaxCard,
                        eUploadDocumentType.OtherDocuments
                    ];

                    if (!acceptedDocumentTypes.contains(docDataFromServer.DocumentTypeID)) {
                        return;
                    }

                    docDataFromServer.IsVisible = true;
                    docDataFromServer.uploadVm = UploadDocumentsComponentViewModel.viewModel.createViewModel({
                        recordType: docDataFromServer.DocumentTypeID,
                        documentTypeName: docDataFromServer.Category,
                        autoUpload: true,
                        id: 'upload',
                        hashTag: i + 1,
                        uploadResponseCallback:
                            docDataFromServer.DocumentTypeID === eUploadDocumentType.DepositConfirmation
                                ? DepositConfirmationActions.CloseConfirmation
                                :general.emptyFn
                    });

                    docDataFromServer.dispose = docDataFromServer.uploadVm.dispose;
                    docsHash.OverrideItem(docDataFromServer.DocumentTypeID, docDataFromServer);
                }

                function showCCTooltip() {
                    data.ccTooltipVisible(!data.ccTooltipVisible());
                }

                function getIndexInc(visible) {
                    return visible ? ++index : 0;
                }

                function getIndex() {
                    return index;
                }

                function getStatusColor(status, uploadDocType) {
                    if (status === eUploadDocumentStatus.Processing) {
                        return 'status-orange';
                    }

                    if (status === eUploadDocumentStatus.Approved ||
                        status === eUploadDocumentStatus.NotRequired) {
                        return 'status-green';
                    }

                    if (status === eUploadDocumentStatus.Incomplete ||
                        status === eUploadDocumentStatus.AwaitingSignatureHighAmount) {
                        return 'status-red';
                    }

                    if ([eUploadDocumentType.ProofOfID, eUploadDocumentType.ProofOfResidence].contains(uploadDocType) &&
                        data.poiDocumentsRequired() && status === eUploadDocumentStatus.AwaitingDocument) {
                        return 'status-red';
                    }

                    return 'status-gray';
                }

                function disposeDocumentDataItem(docType, docData) {
                    if (docData && general.isFunctionType(docData.dispose)) {
                        docData.dispose();
                    }
                }

                function sendEmail() {
                    if (!data.isPermitted) {
                        return;
                    }

                    if (data.isEmailClicked()) {
                        return;
                    }

                    dalCompliance.sendDepositConfirmation();

                    var message = Dictionary.GetItem('depositConfirmationEmail'),
                        title = Dictionary.GetItem('PleaseNote');

                    data.isEmailClicked(true);

                    AlertsManager.UpdateAlert(AlertTypes.DepositConfirmationEmailSentAlert, title, message);
                    AlertsManager.PopAlert(AlertTypes.DepositConfirmationEmailSentAlert);
                }

                function dispose() {
                    if (soUnsubscribe) {
                        soUnsubscribe();
                    }

                    data.documentsData().ForEach(disposeDocumentDataItem);
                    docsHash.Clear();
                    parent.dispose.call(self);  // inherited from KoComponentViewModel
                }

                return {
                    init: init,
                    dispose: dispose,
                    Data: data,
                    ShowCCTooltip: showCCTooltip,
                    GetIndexInc: getIndexInc,
                    GetIndex: getIndex,
                    GetStatusColor: getStatusColor,
                    OpenDepositconfirmationPopup: DepositConfirmationActions.OpenConfirmation,
                    SendEmail: sendEmail
                };
            }
        );

        var createViewModel = function () {
            var viewModel = new UploadDocumentsViewModel();

            viewModel.init();

            return viewModel;
        };

        return {
            viewModel: { createViewModel: createViewModel }
        };
    }
);
