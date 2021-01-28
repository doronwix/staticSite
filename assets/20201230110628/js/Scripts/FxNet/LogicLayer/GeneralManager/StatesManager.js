/* globals eUploadDocumentType, eUploadDocumentStatus */
define(
    'generalmanagers/StatesManager',
    [
        'require',
        'knockout',
        'handlers/general',
        'initdatamanagers/Customer',
        'cachemanagers/ClientStateFlagsManager',
        'cachemanagers/PortfolioStaticManager',
        'dataaccess/dalCompliance',
        'Dictionary',
        'helpers/ObservableHashTable',
        'JSONHelper'
    ],
    function (require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            Customer = require('initdatamanagers/Customer'),
            ClientStateFlagsManager = require('cachemanagers/ClientStateFlagsManager'),
            PortfolioStaticManager = require('cachemanagers/PortfolioStaticManager'),
            Dictionary = require('Dictionary'),
            dalCompliance = require('dataaccess/dalCompliance'),
            JSONHelper = require('JSONHelper'),
            observableHashTable = require('helpers/ObservableHashTable');

        function StatesManager() {
            var stateNamesPriorities = {
                // the state names and priorities, the state container will initialize by this priority
                SystemMode: 1,
                DemoStatus: 2,
                IsActive: 3,
                AmlStatus: 4,
                KycStatus: 5,
                MarketState: 6,
                EquityAlert: 7,
                ExposureAlert: 8,
                ExposureCoverageAlert: 9,
                ServerErrorStatus: 10,
                PepStatus: 11,
                CddStatus: 12,
                Forbidden: 13,
                KycReviewStatus: 14,

                //documents status
                docProofOfID: 15,
                docProofOfResidence: 16,
                docCreditCardCopy: 17,
                docDepositConfirmation: 18,
                docWithdrawalPendingRequest: 19,
                docTaxCard: 20,
                docOtherDocuments: 21,

                //customer 'flags'
                Folder: 22,
                FolderType: 23,
                FolderTypeId: 24,
                fxDenied: 25,
                minDepositGroup: 26,
                signAgreementDate: 27,
                IsQuizPassed: 28,
                UploadDocumentsAfterFirstDepositCountdown: 29,
                SignAgreementCountdown: 30,
                CDDRenewalCountdown: 31
            };
            var states = {};
            var isGetDocumentsStatus = false;
            var isGetDocumentsForAccountHubStatus = false;
            var statesContainer = observableHashTable(ko, general, 'StateType', { enabled: true, sortProperty: 'Priority', asc: true });

            function TState(type, value, priority) {
                this.StateType = type;
                this.Value = ko.observable(value);
                this.Priority = priority;
            }

            function pushState(type, value, priority) {
                var state = new TState(type, value, priority);

                if (!statesContainer.Add(state)) {
                    statesContainer.UpdateAlways(type, state);
                }
            }

            function getStateValue(type) {
                var state = statesContainer.Get(type);

                if (state) {
                    return state.Value;
                }

                return null;
            }

            function init() {
                initStateValues();
                initStatesObject();
                registerToAPI();
            }

            function initStateValues() {
                //need to initilize by the order of priorities

                for (var stateName in stateNamesPriorities) {
                    if (stateNamesPriorities.hasOwnProperty(stateName)) {
                        pushState(stateNamesPriorities[stateName], eFlagState.Initial, stateNamesPriorities[stateName]);
                    }
                }
            }

            function initStatesObject() {
                //documents status
                states.docProofOfID = getStateValue(stateNamesPriorities.docProofOfID);
                states.docProofOfResidence = getStateValue(stateNamesPriorities.docProofOfResidence);
                states.docCreditCardCopy = getStateValue(stateNamesPriorities.docCreditCardCopy);
                states.docDepositConfirmation = getStateValue(stateNamesPriorities.docDepositConfirmation);
                states.docWithdrawalPendingRequest = getStateValue(stateNamesPriorities.docWithdrawalPendingRequest);
                states.docTaxCard = getStateValue(stateNamesPriorities.docTaxCard);
                states.docOtherDocuments = getStateValue(stateNamesPriorities.docOtherDocuments);

                //customer 'flags'
                states.Folder = getStateValue(stateNamesPriorities.Folder);
                states.FolderType = getStateValue(stateNamesPriorities.FolderType);
                states.FolderTypeId = getStateValue(stateNamesPriorities.FolderTypeId);
                states.fxDenied = getStateValue(stateNamesPriorities.fxDenied);
                states.minDepositGroup = getStateValue(stateNamesPriorities.minDepositGroup);
                states.signAgreementDate = getStateValue(stateNamesPriorities.signAgreementDate);

                states.EquityAlert = getStateValue(stateNamesPriorities.EquityAlert);
                states.ExposureAlert = getStateValue(stateNamesPriorities.ExposureAlert);
                states.ExposureCoverageAlert = getStateValue(stateNamesPriorities.ExposureCoverageAlert);

                states.MarketState = getStateValue(stateNamesPriorities.MarketState);
                states.SystemMode = getStateValue(stateNamesPriorities.SystemMode);

                states.IsActive = getStateValue(stateNamesPriorities.IsActive);
                states.AmlStatus = getStateValue(stateNamesPriorities.AmlStatus);

                states.DemoStatus = getStateValue(stateNamesPriorities.DemoStatus);
                states.KycStatus = getStateValue(stateNamesPriorities.KycStatus);

                states.PepStatus = getStateValue(stateNamesPriorities.PepStatus);
                states.CddStatus = getStateValue(stateNamesPriorities.CddStatus);

                states.KycReviewStatus = getStateValue(stateNamesPriorities.KycReviewStatus);

                states.CDDRenewalCountdown = getStateValue(stateNamesPriorities.CDDRenewalCountdown);
                states.SignAgreementCountdown = getStateValue(stateNamesPriorities.SignAgreementCountdown);
                states.UploadDocumentsAfterFirstDepositCountdown = getStateValue(stateNamesPriorities.UploadDocumentsAfterFirstDepositCountdown);

                states.isIntDebit = ko.computed(function () {
                    return this.Folder() === eFolder.IntDebit;
                }, states);

                states.IsDemo = ko.computed(function () {
                    return this.DemoStatus() === eFlagState.Active;
                }, states);

                states.IsMarketClosed = ko.computed(function () {
                    return this.MarketState() === eCSFlagStates.NotActive;
                }, states);

                states.IsPortfolioInactive = ko.computed(function () {
                    return this.IsActive() === false;
                }, states);

                states.IsAmlRestricted = ko.computed(function () {
                    var res = this.AmlStatus();
                    return res === eAMLStatus.Restricted || res === eAMLStatus.Unverified;
                }, states);

                states.IsAmlPending = ko.computed(function () {
                    var res = this.AmlStatus();
                    return res === eAMLStatus.Pending;
                }, states);

                states.IsKycStatusRequired = ko.computed(function () {
                    var res = this.KycStatus();
                    return res === eKYCStatus.NotComplete;
                }, states);

                states.IsKycReviewStatusRequired = ko.computed(function () {
                    return (this.KycStatus() === eKYCStatus.Failed) && (this.KycReviewStatus() === eKYCReviewStatus.NotReviewed || this.KycReviewStatus() === eKYCReviewStatus.Review || this.KycReviewStatus() === eKYCReviewStatus.Tested);
                }, states);

                states.IsCddStatusNotComplete = ko.computed(function () {
                    var res = this.CddStatus();
                    return res === eCDDStatus.NotComplete;
                }, states);

                states.IsCddStatusRequired = ko.computed(function () {
                    var res = this.CddStatus();
                    return res === eCDDStatus.NotComplete || res === eCDDStatus.Complete;
                }, states);

                states.IsPepRequired = ko.computed(function () {
                    return this.PepStatus() == ePEPStatus.Required;
                }, states);

                states.IsActiveButNotSinceTradingBonus = ko.computed(function () {
                    return this.IsActive() == eFlagState.Active && Customer.prop.customerType !== eCustomerType.TradingBonus;
                }, states);

                states.IsTradingBonusGoingToCDDAfterDeposit = ko.computed(function () {
                    var res = this.CddStatus();
                    return (Dictionary.GetItem('TradingBonusGoesToCDDAfterDeposit', 'application_configuration') === '1' && Customer.prop.customerType === eCustomerType.TradingBonus && res === eCDDStatus.NotRequired);
                }, states);

                states.IsCddOrKycRequired = ko.computed(function () {
                    return this.KycStatus() !== eKYCStatus.NotRequired || this.CddStatus() !== eCDDStatus.NotRequired;
                }, states);

                states.ServerErrorStatus = getStateValue(stateNamesPriorities.ServerErrorStatus).extend({ notify: 'always' });

                states.Forbidden = getStateValue(stateNamesPriorities.Forbidden).extend({ notify: 'always' });

                states.IsCddStatusNotRequired = ko.computed(function () {
                    return this.CddStatus() === eCDDStatus.NotRequired;
                }, states);

                // should redirect to CDD
                states.shouldCddRedirect = ko.computed(function () {
                    return this.IsActive() == eFlagState.Active && (
                        this.CddStatus() === eCDDStatus.NotComplete ||
                        this.KycStatus() === eKYCStatus.NotComplete || (
                            this.KycStatus() === eKYCStatus.Failed && (
                                this.KycReviewStatus() === eKYCReviewStatus.NotReviewed ||
                                this.KycReviewStatus() === eKYCReviewStatus.Review ||
                                this.KycReviewStatus() === eKYCReviewStatus.Tested)
                        )
                    );
                }, states);

                states.IsQuizPassed = getStateValue(stateNamesPriorities.IsQuizPassed);

                states.IsCDDRestricted = ko.observable(false);
            }

            function onCSFlagsChanged(csFlags) {
                pushState(stateNamesPriorities.EquityAlert, csFlags.equityAlert, stateNamesPriorities['EquityAlert']);
                pushState(stateNamesPriorities.ExposureAlert, csFlags.exposureAlert, stateNamesPriorities['ExposureAlert']);
                pushState(stateNamesPriorities.ExposureCoverageAlert, csFlags.exposureCoverageAlert, stateNamesPriorities['ExposureCoverageAlert']);
                pushState(stateNamesPriorities.MarketState, csFlags.marketState, stateNamesPriorities['MarketState']);
                pushState(stateNamesPriorities.SystemMode, csFlags.systemMode, stateNamesPriorities['SystemMode']);
            }

            function onPortfolioStaticChanged(portfolioStatic) {
                // The positions of pushState calls is important!
                pushState(stateNamesPriorities.PepStatus, portfolioStatic.pepStatus, stateNamesPriorities['PepStatus']);
                pushState(stateNamesPriorities.CddStatus, portfolioStatic.cddStatus, stateNamesPriorities['CddStatus']);
                pushState(stateNamesPriorities.AmlStatus, portfolioStatic.amlStatus, stateNamesPriorities['AmlStatus']);
                pushState(stateNamesPriorities.IsActive, portfolioStatic.isActive, stateNamesPriorities['IsActive']);
                pushState(stateNamesPriorities.DemoStatus, portfolioStatic.isDemo ? eFlagState.Active : eFlagState.NotActive, stateNamesPriorities['DemoStatus']);
                pushState(stateNamesPriorities.KycStatus, portfolioStatic.kycStatus, stateNamesPriorities['KycStatus']);
                pushState(stateNamesPriorities.KycReviewStatus, portfolioStatic.kycReviewStatus, stateNamesPriorities['KycReviewStatus']);

                updateCustomer();

                updateCustomerData();
            }

            function updateCustomer() {
                Customer
                    .GetCustomer()
                    .then(function (response) {
                        var data = JSONHelper.STR2JSON('StatesManager:updateCustomer', response);

                        if (!general.isNullOrUndefined(data)) {
                            states.Folder(data.folder);
                            states.FolderType(data.folderType);
                            states.FolderTypeId(data.folderTypeId);
                            states.fxDenied(data.allowFXnet == 0);
                            states.minDepositGroup(data.minDepositGroup);
                            states.signAgreementDate(general.str2Date(data.signAgreementDate));
                            ko.postbox.publish('customer-data-loaded');
                        }
                    })
                    .done();
            }

            function updateDocumentStatus() {
                dalCompliance
                    .getUploadDocumentsData()
                    .then(processUploadDocumentsData);
            }

            function updateCustomerData() {
                dalCompliance
                    .getDocumentsDataForAccountHub()
                    .then(processCustomerData);
            }

            function processUploadDocumentsData(data) {
                var docs = JSONHelper.STR2JSON('StatesManager/processUploadDocumentsData', data, eErrorSeverity.medium);
                if (docs) {
                    processDocsData(docs);
                }
            }

            function processCustomerData(data) {
                var customerData = JSONHelper.STR2JSON('StatesManager/processCustomerData', data, eErrorSeverity.medium);

                if (customerData) {
                    if (customerData.DocumentsData) {
                        processDocsData(customerData.DocumentsData);
                    }

                    processCustomerStatuses(customerData);
                }
            }

            function processCustomerStatuses(customerData) {
                states.IsQuizPassed(customerData.IsQuizPassed);

                if (general.isNumber(customerData.CDDAccess)) {
                    states.IsCDDRestricted(states.CddStatus() === eCDDStatus.Complete && customerData.CDDAccess === eCDDAccess.Restricted);
                }

                if (general.isNumber(customerData.UploadDocumentsAfterFirstDepositCountdown)) {
                    states.UploadDocumentsAfterFirstDepositCountdown(customerData.UploadDocumentsAfterFirstDepositCountdown);
                }

                if (general.isNumber(customerData.SignAgreementCountdown)) {
                    states.SignAgreementCountdown(customerData.SignAgreementCountdown);
                }

                if (general.isNumber(customerData.CDDRenewalCountdown)) {
                    states.CDDRenewalCountdown(customerData.CDDRenewalCountdown);
                }
            }

            function processDocsData(docs) {
                if (docs.Data) {
                    docs.Data.forEach(function (docDataFromServer) {
                        if (docDataFromServer.DocumentTypeID === eUploadDocumentType.ProofOfID) {
                            states.docProofOfID(docDataFromServer.DocumentStatus);
                        }
                        else if (docDataFromServer.DocumentTypeID === eUploadDocumentType.ProofOfResidence) {
                            states.docProofOfResidence(docDataFromServer.DocumentStatus);
                        }
                        else if (docDataFromServer.DocumentTypeID === eUploadDocumentType.CreditCardCopy) {
                            states.docCreditCardCopy(docDataFromServer.DocumentStatus);
                        }
                        else if (docDataFromServer.DocumentTypeID === eUploadDocumentType.DepositConfirmation) {
                            states.docDepositConfirmation(docDataFromServer.DocumentStatus);
                        }
                        else if (docDataFromServer.DocumentTypeID === eUploadDocumentType.WithdrawalPendingRequest) {
                            states.docWithdrawalPendingRequest(docDataFromServer.DocumentStatus);
                        }
                        else if (docDataFromServer.DocumentTypeID === eUploadDocumentType.TaxCard) {
                            states.docTaxCard(docDataFromServer.DocumentStatus);
                        }
                        else if (docDataFromServer.DocumentTypeID === eUploadDocumentType.OtherDocuments) {
                            states.docOtherDocuments(docDataFromServer.DocumentStatus);
                        }
                    });
                }
            }

            function registerToAPI() {
                ClientStateFlagsManager.OnChange.Add(onCSFlagsChanged);
                PortfolioStaticManager.OnChange.Add(onPortfolioStaticChanged);

            }

            function startGetDocumentsStatus() {
                if (!isGetDocumentsStatus) {
                    isGetDocumentsStatus = true;
                    updateDocumentStatus();
                }
            }

            function startGetCustomerData() {
                if (!isGetDocumentsForAccountHubStatus) {
                    isGetDocumentsForAccountHubStatus = true;
                    updateCustomerData();
                }
            }

            function initFromCustomer(customerCompliance) {
                pushState(stateNamesPriorities.PepStatus, customerCompliance.PepStatus, stateNamesPriorities['PepStatus']);
                pushState(stateNamesPriorities.CddStatus, customerCompliance.CddStatus, stateNamesPriorities['CddStatus']);
                pushState(stateNamesPriorities.AmlStatus, customerCompliance.AmlStatus, stateNamesPriorities['AmlStatus']);
                pushState(stateNamesPriorities.IsActive, customerCompliance.IsActive, stateNamesPriorities['IsActive']);
                pushState(stateNamesPriorities.KycStatus, customerCompliance.KycStatus, stateNamesPriorities['KycStatus']);
                pushState(stateNamesPriorities.KycReviewStatus, customerCompliance.KycReviewStatus, stateNamesPriorities['KycReviewStatus']);
            }

            function getStates() {
                return states;
            }

            return {
                StartGetDocumentsStatus: startGetDocumentsStatus,
                StartGetCustomerData: startGetCustomerData,
                Init: init,
                StateValue: getStateValue,
                States: states,
                GetStates: getStates,
                PushState: pushState,
                StatePropertiesEnum: stateNamesPriorities, //  ComputedHandle: computedHandle
                InitFromCustomer: initFromCustomer
            };
        }

        var module = window.$statesManager = new StatesManager();

        return module;
    }
);