define(
    'configuration/Containers',
    [
        'require',
        'customEnums/ViewsEnums',
        'enums/enums',
        'handlers/HashTable'
    ],
    function Containers(require) {
        var THashTable = require('handlers/HashTable');
        var viewsCollections = {};
        var formsContainer = new THashTable();
        var _uiVersion;

        viewsCollections[eUIVersion.Default] = function () {
            formsContainer.SetItem(eForms.ActivityLog, {
                "mappedViews": [
                    eViewTypes.vActivityLog
                ]
            });

            formsContainer.SetItem(eForms.Withdrawal, {
                "mappedViews": [
                    eViewTypes.vWithdrawal,
                    eViewTypes.vPendingWithdrawal
                ]
            });

            formsContainer.SetItem(eForms.PersonalDetails, {
                "mappedViews": [
                    eViewTypes.vPersonalDetails
                ]
            });

            formsContainer.SetItem(eForms.UploadDocuments, {
                "mappedViews": [
                    eViewTypes.vUploadDocuments
                ]
            });

            formsContainer.SetItem(eForms.ViewAndPrintWithdrawal, {
                "mappedViews": [
                    eViewTypes.vViewAndPrintWithdrawal
                ]
            });

            formsContainer.SetItem(eForms.Deposit, {
                "mappedViews": [
                    eViewTypes.vPaymentTypes
                ],
                exportSupport: { isExport: true, historicalData: false }
            });

            formsContainer.SetItem(eForms.CreditCard3rdParty, {
                "mappedViews": [
                    eViewTypes.vCreditCard3rdParty
                ]
            });

            formsContainer.SetItem(eForms.ThirdParty, {
                "mappedViews": [
                    eViewTypes.vThirdParty
                ]
            });

            formsContainer.SetItem(eForms.MissingCustomerInformation, {
                "mappedViews": [
                    eViewTypes.vMissingCustomerInformation
                ]
            });

            formsContainer.SetItem(eForms.ClientQuestionnaire, {
                "mappedViews": []
            });

            formsContainer.SetItem(eForms.AmlStatus, {
                "mappedViews": [eViewTypes.vAmlStatus]
            });

            formsContainer.SetItem(eForms.RegularWireTransfer, {
                "mappedViews": [
                    eViewTypes.vWireTransfer
                ]
            });

            formsContainer.SetItem(eForms.CashBack, {
                "mappedViews": [
                    eViewTypes.vCashBack
                ]
            });

            formsContainer.SetItem(eForms.SignalsTrader, {
                "mappedViews": [
                    eViewTypes.vTradingSignals,
                    eViewTypes.vSignalsTechnicalAnalysisGrid,
                    eViewTypes.vSignalsAlertGrid,
                    eViewTypes.vSignalsCandleStickGrid,
                    eViewTypes.vSignalsService,
                    eViewTypes.vSignalsDisclamer
                ]
            });

            formsContainer.SetItem(eForms.SignalsDealer, {
                "mappedViews": [
                    eViewTypes.vTradingSignals,
                    eViewTypes.vSignalsTechnicalAnalysisGrid,
                    eViewTypes.vSignalsAlertGrid,
                    eViewTypes.vSignalsCandleStickGrid
                ]
            });

            formsContainer.SetItem(eForms.WithdrawalAutomation, {
                "mappedViews": [
                    eViewTypes.vWithdrawalAutomation
                ]
            });

            formsContainer.SetItem(eForms.WithdrawalProcess, {
                "mappedViews": [
                    eViewTypes.vWithdrawalProcess
                ]
            });

            formsContainer.SetItem(eForms.ForcedDeposit, {
                "mappedViews": [
                    eViewTypes.vForcedDeposit
                ]
            });

            formsContainer.SetItem(eForms.WireTransfers, {
                "mappedViews": [
                    eViewTypes.vWireTransfers
                ]
            });

            formsContainer.SetItem(eForms.NewApproveWireTransfer, {
                "mappedViews": [
                    eViewTypes.vNewApproveWireTransfer
                ]
            });

            formsContainer.SetItem(eForms.ConvertBalance, {
                "mappedViews": [
                    eViewTypes.vConvertBalance
                ]
            });

            formsContainer.SetItem(eForms.ConvertAccountLine, {
                "mappedViews": [
                    eViewTypes.vConvertAccountLine
                ]
            });

            formsContainer.SetItem(eForms.GeneralAccountActions, {
                "mappedViews": [
                    eViewTypes.vGeneralAccountActions
                ]
            });

            formsContainer.SetItem(eForms.AmendDeposit, {
                "mappedViews": [
                    eViewTypes.vAmendDeposit
                ]
            });

            formsContainer.SetItem(eForms.FixPosition, {
                "mappedViews": [
                    eViewTypes.vFixPosition
                ]
            });

            formsContainer.SetItem(eForms.CurrencyConverter, {
                "mappedViews": [
                    eViewTypes.vCurrencyConverter
                ]
            });
        };

        var getUiVersion = function () {
            return _uiVersion;
        };

        var init = function (uiVersion) {
            formsContainer.Clear();

            if (typeof viewsCollections[uiVersion] === "undefined") {
                // Fallback to First version
                uiVersion = eUIVersion.Default;
            }

            viewsCollections[uiVersion]();

            _uiVersion = uiVersion;
        };

        return {
            Init: init,
            UiVersion: getUiVersion,
            Forms: formsContainer,
            MainForm: eForms.Deals
        };
    }
);