define(
    "deviceviewmodels/DynamicHeaderViewModel",
    [
        "require",
        "knockout",
        'handlers/general',
        'helpers/KoComponentViewModel',
        'managers/viewsmanager',
        'devicemanagers/AlertsManager',
        'userflow/UserFlowManager',
        "StateObject!userFlow"
    ],
    function(require) {
        var ko = require("knockout"),
            general = require('handlers/general'),
            KoComponentViewModel = require('helpers/KoComponentViewModel'),
            VManager = require('managers/viewsmanager'),
            stateObjectUserFlow = require("StateObject!userFlow"),
            AlertsManager = require('devicemanagers/AlertsManager');

        var DynamicHeaderViewModel = general.extendClass(KoComponentViewModel, function() {
            var self = this,
                parent = this.parent,
                data = this.Data,
                stateObjectUnsubscribe;

            function init(customSettings) {  
                parent.init.call(self, customSettings); // inherited from KoComponentViewModel

                setObservables();
                setComputables();
                
                updateFromStateObject(stateObjectUserFlow.get(eStateObjectTopics.UserFlowChanged));
                stateObjectUnsubscribe = stateObjectUserFlow.subscribe(eStateObjectTopics.UserFlowChanged, function (model) {
                    updateFromStateObject(model);
                });
            }

            function setObservables() {
                data.isButtonVisibleForConcreteView = ko.observable().subscribeTo(ePostboxTopic.PaymentButtonsVisible);
                data.generalStatusColor = ko.observable('');
            }

            function setComputables() {
                data.showDepositButton = self.createComputed(function() {
                    return VManager.GetActiveFormViewProperties(eViewTypes.vCreditCard3rdParty).visible()
                        || VManager.GetActiveFormViewProperties(eViewTypes.vGenericCreditCard).visible();
                });

                data.showBackButton = self.createComputed(function() {
                    return !VManager.GetActiveFormViewProperties(eForms.Menu).visible()
                        && (VManager.GetActiveFormViewProperties(eForms.Wallet).visible() && (VManager.GetActiveFormViewProperties(eForms.Wallet).args ? !VManager.GetActiveFormViewProperties(eForms.Wallet).args.showMenuButton : true)
                            || VManager.GetActiveFormViewProperties(eViewTypes.vBalance).visible()
                            || VManager.GetActiveFormViewProperties(eViewTypes.vPendingWithdrawal).visible()
                            || VManager.GetActiveFormViewProperties(eViewTypes.vNetExposure).visible()
                            || VManager.GetActiveFormViewProperties(eViewTypes.vEditFavoriteInstruments).visible()
                            || VManager.GetActiveFormViewProperties(eViewTypes.vWithdrawal).visible()
                            || VManager.GetActiveFormViewProperties(eViewTypes.vContact).visible()
                            || VManager.GetActiveFormViewProperties(eViewTypes.vInternalContactUs).visible()
                            || VManager.GetActiveFormViewProperties(eViewTypes.vGenericCreditCard).visible()
                            || VManager.GetActiveFormViewProperties(eViewTypes.vTradingSignals).visible()
                            || (VManager.GetActiveFormViewProperties(eViewTypes.vEconomicCalendar).visible() && !VManager.GetActiveFormViewProperties(eViewTypes.vEconomicCalendarFilter).visible())
                            || VManager.GetActiveFormViewProperties(eViewTypes.vEducationalTutorialsSwitcher).visible()
                            || VManager.GetActiveFormViewProperties(eViewTypes.vEditClosingLimit).visible()
                            || VManager.GetActiveFormViewProperties(eViewTypes.vCloseDeal).visible()
                            || VManager.GetActiveFormViewProperties(eViewTypes.vEditLimit).visible()
                            || VManager.GetActiveFormViewProperties(eViewTypes.vClosedDealDetails).visible()
                            || VManager.GetActiveFormViewProperties(eViewTypes.vAmlStatus).visible()
                            || VManager.GetActiveFormViewProperties(eViewTypes.vTradingSignalDetails).visible()
                            || VManager.GetActiveFormViewProperties(eViewTypes.vEconomicCalendarFilter).visible()
                            || VManager.GetActiveFormViewProperties(eViewTypes.vTransactionSwitcher).visible()
                            || VManager.GetActiveFormViewProperties(eViewTypes.vEditFavoriteInstruments).visible()
                            || (VManager.GetActiveFormViewProperties(eViewTypes.vPaymentTypes).visible() && data.isButtonVisibleForConcreteView())
                            || VManager.GetActiveFormViewProperties(eViewTypes.vMoneyBookers).visible()
                            || VManager.GetActiveFormViewProperties(eViewTypes.vGlobalCollectAPM).visible()
                            || VManager.GetActiveFormViewProperties(eViewTypes.vConcretePaymentForm).visible()
                            || VManager.GetActiveFormViewProperties(eViewTypes.vWithdrawalBankDetails).visible()
                            || VManager.GetActiveFormViewProperties(eViewTypes.vWithdrawalCCDetails).visible()
                            || VManager.GetActiveFormViewProperties(eViewTypes.vEducationalTutorialsAccess).visible() 
                            || VManager.GetActiveFormViewProperties(eViewTypes.vNewPriceAlert).visible() 
                            || VManager.GetActiveFormViewProperties(eViewTypes.vChangePassword).visible()
                            || VManager.GetActiveFormViewProperties(eViewTypes.vNotificationsSettings).visible()
                            || VManager.GetActiveFormViewProperties(eViewTypes.vPersonalInformation).visible() 
                            || VManager.GetActiveFormViewProperties(eViewTypes.vPriceAlerts).visible() 
                            || VManager.GetActiveFormViewProperties(eViewTypes.vClientQuestionnaire).visible() 
                            || data.showDepositButton());
                });

                data.showContinueButton = self.createComputed(function() {
                    return VManager.GetActiveFormViewProperties(eViewTypes.vEpaylinks).visible()
                        || VManager.GetActiveFormViewProperties(eViewTypes.vPaySafeCard).visible()
                        || VManager.GetActiveFormViewProperties(eViewTypes.vSafeChargeCashier).visible()
                        || VManager.GetActiveFormViewProperties(eViewTypes.vAstropay).visible()
                        || VManager.GetActiveFormViewProperties(eViewTypes.vNetellerGO).visible()
                        || VManager.GetActiveFormViewProperties(eViewTypes.vMoneyBookers).visible()
                        || VManager.GetActiveFormViewProperties(eViewTypes.vGlobalCollectAPM).visible()
                        || VManager.GetActiveFormViewProperties(eViewTypes.vInatecAPMGiropay).visible()
                        || VManager.GetActiveFormViewProperties(eViewTypes.vInatecAPMPrzelewy24).visible()
                        || VManager.GetActiveFormViewProperties(eViewTypes.vEmpCashU).visible()
                        || VManager.GetActiveFormViewProperties(eViewTypes.vEcoPayz).visible()
                        || VManager.GetActiveFormViewProperties(eViewTypes.vSofortDirect).visible()
                        || VManager.GetActiveFormViewProperties(eViewTypes.vKluwp).visible()
                        || VManager.GetActiveFormViewProperties(eViewTypes.vRPN).visible()
                        || VManager.GetActiveFormViewProperties(eViewTypes.vNuveiAPM).visible()
                        || VManager.GetActiveFormViewProperties(eViewTypes.GlobePay).visible()
                        || VManager.GetActiveFormViewProperties(eViewTypes.AstropayWallet).visible()
                        || VManager.GetActiveFormViewProperties(eViewTypes.vPerfectMoney).visible()
                        || VManager.GetActiveFormViewProperties(eViewTypes.vPayPal).visible()
                        || VManager.GetActiveFormViewProperties(eViewTypes.vWireTransfer).visible();
                });

                data.hideMobileMenu = self.createComputed(function() {
                    return VManager.GetActiveFormViewProperties(eViewTypes.vBalance).visible()
                        || VManager.GetActiveFormViewProperties(eViewTypes.vPendingWithdrawal).visible()
                        || VManager.GetActiveFormViewProperties(eViewTypes.vNetExposure).visible()
                        || VManager.GetActiveFormViewProperties(eViewTypes.vEditFavoriteInstruments).visible()
                        || VManager.GetActiveFormViewProperties(eViewTypes.vWithdrawal).visible()
                        || VManager.GetActiveFormViewProperties(eViewTypes.vContact).visible()
                        || VManager.GetActiveFormViewProperties(eViewTypes.vInternalContactUs).visible()
                        || VManager.GetActiveFormViewProperties(eViewTypes.vTradingSignals).visible()
                        || (VManager.GetActiveFormViewProperties(eViewTypes.vEconomicCalendar).visible() && !VManager.GetActiveFormViewProperties(eViewTypes.vEconomicCalendarFilter).visible())
                        || VManager.GetActiveFormViewProperties(eViewTypes.vEducationalTutorialsSwitcher).visible()
                        || VManager.GetActiveFormViewProperties(eViewTypes.vTransactionSwitcher).visible()
                        || VManager.GetActiveFormViewProperties(eViewTypes.vEditClosingLimit).visible()
                        || VManager.GetActiveFormViewProperties(eViewTypes.vCloseDeal).visible()
                        || VManager.GetActiveFormViewProperties(eViewTypes.vEditLimit).visible()
                        || VManager.GetActiveFormViewProperties(eViewTypes.vClosedDealDetails).visible()
                        || VManager.GetActiveFormViewProperties(eViewTypes.vAmlStatus).visible()
                        || VManager.GetActiveFormViewProperties(eViewTypes.vTradingSignalDetails).visible()
                        || VManager.GetActiveFormViewProperties(eViewTypes.vEconomicCalendarFilter).visible()
                        || VManager.GetActiveFormViewProperties(eViewTypes.vEditFavoriteInstruments).visible()
                        || VManager.GetActiveFormViewProperties(eViewTypes.vEducationalTutorialsAccess).visible()
                        || data.showBackButton()
                        || AlertsManager.HasAlert();
                });
            }

            function updateFromStateObject(model) {
                if (model) {
                    switch (model.userStatus) {
                        case eUserStatus.ReadyToTrade:
                        case eUserStatus.ActiveLimited:
                            data.generalStatusColor('yellow');
                            break;

                        case eUserStatus.Locked:
                        case eUserStatus.NotActivated:
                        case eUserStatus.Restricted:
                            data.generalStatusColor('red');
                            break;

                        default:
                            data.generalStatusColor('');
                            break;
                    }
                }
            }
            
            function dispose() {
                stateObjectUnsubscribe();
                parent.dispose.call(self); // inherited from KoComponentViewModel
            }

            return {
                init: init,
                dispose: dispose,
                Data: data
            };
        });

        var createViewModel = function(params) {
            var viewModel = new DynamicHeaderViewModel(params);
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
