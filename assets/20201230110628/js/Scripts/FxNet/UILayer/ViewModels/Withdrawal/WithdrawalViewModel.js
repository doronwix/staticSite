    /* globals cDepositMessageKeys */
define(
    'viewmodels/Withdrawal/WithdrawalViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'handlers/ContentHandler',
        'helpers/KoComponentViewModel',
        'Dictionary',
        'initdatamanagers/Customer',
        'devicemanagers/ViewModelsManager',
        'devicemanagers/StatesManager',
        'devicemanagers/AlertsManager',
        'JSONHelper',
        'initdatamanagers/SymbolsManager',
        'dataaccess/dalWithdrawal',
        'FxNet/LogicLayer/Withdrawals/LastWithdrawalRequest',
        'modules/systeminfo',
        'configuration/initconfiguration',
        'dataaccess/dalDeposit',
        'LoadDictionaryContent!payments_concreteView'
    ],
function (require) {
    var ko = require('knockout'),
        general = require('handlers/general'),
        KoComponentViewModel = require('helpers/KoComponentViewModel'),
        JSONHelper = require('JSONHelper'),
        dalWithdrawal = require('dataaccess/dalWithdrawal'),
        customer = require('initdatamanagers/Customer'),
        viewModelsManager = require('devicemanagers/ViewModelsManager'),
        symbolsManager = require('initdatamanagers/SymbolsManager'),
        statesManager = require('devicemanagers/StatesManager'),
        Dictionary = require('Dictionary'),
        AlertsManager = require('devicemanagers/AlertsManager'),
        dalDeposit = require('dataaccess/dalDeposit'),
        initConfiguration = require('configuration/initconfiguration');

    var WithdrawalViewModel = general.extendClass(KoComponentViewModel, function WithdrawalViewModelClass(params) {
        var self = this,
            parent = this.parent, // inherited from KoComponentViewModel
            data = this.Data, // inherited from KoComponentViewModel
            subscribtion2OnCancelPendingRedrawal;

        data.withdrawalInfo = {};

        function init() {
            setwithdrawalObject();
            setComputables();
            setSubsribers();
            start();
        }

        function setwithdrawalObject() {
            data.withdrawalInfo.isLoaded = ko.observable(false);
            data.withdrawalInfo.defaultCcy = customer.prop.defaultCcy();
            data.withdrawalInfo.MaxWithdrawalAmount = ko.observable();
            data.withdrawalInfo.TaxAmount = ko.observable();
            data.withdrawalInfo.hasAmount = ko.observable(false);
            data.withdrawalInfo.hasNoAmount = ko.observable(false);
            data.withdrawalInfo.hasTaxAmount = ko.observable(false);
            data.withdrawalInfo.isBackOffice = params.IsBackOffice;

            data.tiles = ko.observableArray([]);
            data.selectedWithdrawal = ko.observable(null);
            data.depositCurrencies = ko.observableArray([]);
            data.baseSymbol = ko.observable();
            data.LastBankWithdrawal = ko.observable();

            data.resetFormPosition = ko.observable(false);
        }

        function start() {
            if (customer.prop.isDemo) {
                viewModelsManager.VManager.SwitchViewVisible(customer.prop.mainPage, {});
                return;
            }

            updateWithrawal();
            subscribtion2OnCancelPendingRedrawal = ko.postbox.subscribe(eTopic.onCancelPendingRedrawal,
                function () {
                    data.resetFormPosition(true);
                    data.selectedWithdrawal(null);
                    updateWithrawal();
                });

            ko.postbox.publish('trading-event', 'witdrawal-view');
        }

        function setComputables() {
            data.withdrawalInfo.canWithdrawal = self.createComputed(function () {
                return (!statesManager.States.IsPortfolioInactive() || initConfiguration.WithdrawalConfiguration.overrideCanWithdrawal === true) && data.withdrawalInfo.hasAmount();
            }, self, false);

            data.withdrawalInfo.hideTiles = self.createComputed(function() {
                return data.tiles().length === 1;
            }, self, false).extend({ notify: 'always' });

            data.withdrawalInfo.showWithdrawal = self.createComputed(function () {
                return data.withdrawalInfo.canWithdrawal() && !general.isNullOrUndefined(data.selectedWithdrawal());
            }, self, false);

            data.withdrawalInfo.showBankWithdrawal = self.createComputed(function () {
                return data.withdrawalInfo.showWithdrawal() && isBankWithdrawal(data.selectedWithdrawal()) && isBankWithdrawal(data.selectedWithdrawal());
            }, self, false);

            data.withdrawalInfo.showCreditCardWithdrawal = self.createComputed(function () {
                return data.withdrawalInfo.showWithdrawal() && !isBankWithdrawal    (data.selectedWithdrawal());
            }, self, false);

            data.withdrawalInfo.canWithdrawalWithCard = self.createComputed(function() {
                return data.withdrawalInfo.canWithdrawal() && ko.utils.arrayFirst(data.tiles(), function(withdrawal) { return !isBankWithdrawal(withdrawal); }) !== null;
            }, self, false);
        }

        function setSubsribers() {
            self.subscribeTo(data.withdrawalInfo.hideTiles, function (value) { 
                if (value === true) {
                    data.selectedWithdrawal(data.tiles()[0]);
                }
            });
        }

        function updateWithrawal() {
            dalWithdrawal.getWithdrawalInfo()
                .then(onLoadWithdrawalInfoComplete)
                .done();
        }

        function onLoadWithdrawalInfoComplete(responseText) {
            var response = JSONHelper.STR2JSON('WithdrawalViewModel/onLoadWithdrawalInfoComplete', responseText, eErrorSeverity.medium) || {};

            if (response.status === 'ServerError' || response.result === 'SecurityError') {
                AlertsManager.ShowAlert(AlertTypes.ServerResponseAlert, Dictionary.GetItem('GenericAlert'), Dictionary.GetItem('ServerError'), null);
                data.withdrawalInfo.isLoaded(true);
                return;
            }

            data.tiles(response.WithdrawalTiles);
            data.LastBankWithdrawal(response.LastBankWithdrawal);

            var allowedWithdrawalInfo = response.AllowedWithdrawalInfo || {};
 
            if (!general.isNullOrUndefined(allowedWithdrawalInfo.AllowedWithdrawalAmount)) {
                data.withdrawalInfo.MaxWithdrawalAmount(allowedWithdrawalInfo.AllowedWithdrawalAmount);
                data.withdrawalInfo.TaxAmount(allowedWithdrawalInfo.TaxAmount);

                var hasAmount = allowedWithdrawalInfo.AllowedWithdrawalAmount.sign() > 0;
                var hasTaxAmount = allowedWithdrawalInfo.TaxAmount.sign() > 0;

                data.withdrawalInfo.hasAmount(hasAmount);
                data.withdrawalInfo.hasNoAmount(!hasAmount);
                data.withdrawalInfo.hasTaxAmount(hasTaxAmount);
            }

            var symbolsList = allowedWithdrawalInfo.Symbols;
            var currencyIndex;

            if (symbolsList) {
                translateSymbolNames(symbolsList);
                populateCcyListFrom(symbolsList);
                currencyIndex = getCustomerCcyIndexFromSymbolList(symbolsList);

                if (currencyIndex !== -1) {
                    data.baseSymbol(data.depositCurrencies()[currencyIndex]);
                }
            }

            data.withdrawalInfo.isLoaded(true);
        }

        function translateSymbolNames(ccyList) {
            for (var i = 0; i < ccyList.length; i++) {
                ccyList[i].SymbolName = symbolsManager.GetTranslatedSymbolById(ccyList[i].SymbolID);
            }

            return ccyList;
        }

        function populateCcyListFrom(symbolsList) {
            data.depositCurrencies.removeAll();
            ko.utils.arrayPushAll(data.depositCurrencies, symbolsList);
        }

        function getCustomerCcyIndexFromSymbolList(ccyList) {
            for (var i = 0; i < ccyList.length; i++) {
                if (ccyList[i].SymbolID === customer.prop.selectedCcyId()) {
                    return i;
                }
            }

            return -1;
        }

        function getWithdrawalId(withdrawal) {
            withdrawal = ko.utils.unwrapObservable(withdrawal);

            return !isBankWithdrawal(withdrawal) ? ('WithdrawalCCId_' + withdrawal.CCId) : ('WithdrawalId_' + withdrawal.WithdrawalId);
        }

        function getWithdrawalClass(withdrawal) {
            var imageClass;

            if (general.isEmptyValue(withdrawal.ImageClass)) {
                imageClass = "deposit-ico-bank";
            } else {
                imageClass = withdrawal.ImageClass;
            }

            return imageClass + '_saved';
        }

        function getLast4(withdrawal) {
            if (withdrawal.Last4) {
                return withdrawal.Last4;
            }

            var iban = withdrawal.IBAN;

            if (general.isEmptyValue(iban)) {
                return "XXXX";
            }

            if (iban.length < 4) {
                return iban;
            }

            var startIndex = iban.length - 4;

            return iban.substring(startIndex);
        }

        function getDescription(withdrawal) {
            if (!isBankWithdrawal(withdrawal)) {
                return Dictionary.GetItem('existingCC','payments_concreteView');
            }

            if (!general.isEmptyValue(withdrawal.WithdrawalId)) {
                return Dictionary.GetItem('existingBank','payments_concreteView');
            }
            else {
                return Dictionary.GetItem('newBank','payments_concreteView');
            }
        }

        function isSelectedWithdrawal(withdrawal) {
            return withdrawal === data.selectedWithdrawal();
        }

        function selectWithdrawal(withdrawal) {
            data.selectedWithdrawal(withdrawal);
            data.resetFormPosition(false);
        }

        function goToWithdrawalDetails(withdrawal) {
            if (isBankWithdrawal(withdrawal)) {
                viewModelsManager.VManager
                    .SwitchViewVisible(eForms.WithdrawalBankDetails,
                    {
                        withdrawal: withdrawal,
                        withdrawalDetails: data.LastBankWithdrawal(),
                        depositCurrencies: data.depositCurrencies(),
                        baseSymbol: data.baseSymbol(),
                        allowedWithdrawal: {
                            amount: data.withdrawalInfo.MaxWithdrawalAmount(),
                            currency: data.withdrawalInfo.defaultCcy,
                            show: true
                        }
                    });
            } else {
                viewModelsManager.VManager
                    .SwitchViewVisible(eForms.WithdrawalCCDetails,
                    {
                        withdrawal: withdrawal,
                        depositCurrencies: data.depositCurrencies(),
                        baseSymbol: data.baseSymbol(),
                        allowedWithdrawal: {
                            amount: data.withdrawalInfo.MaxWithdrawalAmount(),
                            currency: data.withdrawalInfo.defaultCcy,
                            show: true
                        }
                    });
            }
        }

        function removeTile(withdrawal) {
            confirmRemoveCreditCard(removeCreditCard, withdrawal);
        }

        function confirmRemoveCreditCard(removeCallback, withdrawal) {
            var removeCcProps = {
                okButtonCallback: function () {
                    data.resetFormPosition(true);
                    data.selectedWithdrawal(null);
                    removeCallback(withdrawal);
                },
                okButtonCaption: 'depConfirmRemoveCC',
                cancelButtonCaption: 'depCancelRemoveCC',
            };

            var confirmationMessage = String.format(Dictionary.GetItem(cDepositMessageKeys.removeCCMessage,'payments_concreteView'), withdrawal.Last4);

            AlertsManager.UpdateAlert(AlertTypes.RemoveCreditCardConfirmationAlert, '', confirmationMessage, null, removeCcProps);
            AlertsManager.PopAlert(AlertTypes.RemoveCreditCardConfirmationAlert);
        }

        function removeCreditCard(tileToRemove) {
            dalDeposit.removeUsedCard(tileToRemove.CCId)
                .then(function (responseText) {
                    var response = JSONHelper.STR2JSON('WithdrawalViewModel/onRemoveCreditCard', responseText, eErrorSeverity.low) || {};

                    if (response.result === 'success' ) {
                        if (tileToRemove === data.selectedWithdrawal()) {
                            data.selectedWithdrawal(null);
                        }

                        data.tiles.remove(tileToRemove);
                    }
                })
                .fail(general.emptyFn)
                .done();
        }

        function isBankWithdrawal(withdrawal) {
            return general.isEmptyValue(withdrawal.CCId);
        }
        
        function dispose() {
            stop();

            parent.dispose.call(self); // inherited from KoComponentViewModel
        }

        function stop() {
            data.withdrawalInfo.hasAmount(false);
            data.withdrawalInfo.hasNoAmount(false);

            if (subscribtion2OnCancelPendingRedrawal && subscribtion2OnCancelPendingRedrawal.dispose) {
                subscribtion2OnCancelPendingRedrawal.dispose();
                subscribtion2OnCancelPendingRedrawal = null;
            }
        }

        return {
            init: init,
            dispose: dispose,
            WithdrawalInfo: data.withdrawalInfo,
            Data: data,
            getWithdrawalId: getWithdrawalId,
            getWithdrawalClass: getWithdrawalClass,
            getLast4: getLast4,
            getDescription: getDescription,
            isSelectedWithdrawal: isSelectedWithdrawal,
            selectWithdrawal: selectWithdrawal,
            goToWithdrawalDetails: goToWithdrawalDetails,
            removeTile: removeTile,
            isBankWithdrawal: isBankWithdrawal
        };
    });

    var createViewModel = function (params) {
        var viewModel = new WithdrawalViewModel(params || {});
        viewModel.init();

        return viewModel;
    };

    return {
        viewModel: {
            createViewModel: createViewModel
        }
    };
});