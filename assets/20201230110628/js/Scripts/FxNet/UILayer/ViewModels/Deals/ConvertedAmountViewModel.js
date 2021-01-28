define(
    'viewmodels/Deals/ConvertedAmountViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'helpers/KoComponentViewModel',
        'FxNet/LogicLayer/Deal/DealMarginCalculator',
        'initdatamanagers/Customer'
    ],
    function (require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            KoComponentViewModel = require('helpers/KoComponentViewModel'),
            dealMarginCalculator = require('FxNet/LogicLayer/Deal/DealMarginCalculator'),
            customer = require('initdatamanagers/Customer');

        var ConvertedAmountViewModel = general.extendClass(KoComponentViewModel, function ConvertedAmountViewModelClass(_newDealData) {
            var self = this,
                parent = this.parent, // inherited from KoComponentViewModel
                data = this.Data, // inherited from KoComponentViewModel
                newDealData = _newDealData || {};

            var init = function (settings) {
                parent.init.call(self, settings);   // inherited from KoComponentViewModel

                setObservables();
                setComputables();
            };

            var setObservables = function () {
                var symbolName = ko.utils.unwrapObservable(newDealData.customerSymbolName);
                data.currencySymbol = ko.observable(symbolName);
                data.customerSymbolId = ko.observable(customer.prop.baseCcyId());
            };

            var setComputables = function () {
                data.convertedDealAmount = self.createComputed(function () {
                    var params = {
                        'dealAmount': general.toNumeric(newDealData.selectedDealAmount()),
                        'dealRate': general.toNumeric(newDealData.orderDir() == eOrderDir.Sell ? newDealData.bid() : newDealData.ask()),
                        'quoteForOtherCcyToAccountCcy': newDealData.quoteForOtherCcyToAccountCcy(),
                        'otherSymbol': newDealData.amountSymbol(),
                        'baseSymbol': newDealData.hasOwnProperty('baseSymbol') ? newDealData.baseSymbol() : newDealData.baseSymbolId()
                    };

                    return dealMarginCalculator.DealAmount(params);
                }).extend({ empty: true });

                data.isCompleted = self.createComputed(function () {
                    return !data.convertedDealAmount.isEmpty();
                });

                data.isBaseEqualWithCustomerCcy = self.createComputed(function () {
                    var isBaseEqualWithCustomerCcy;
                    newDealData.hasOwnProperty('baseSymbol') ? (isBaseEqualWithCustomerCcy = newDealData.baseSymbol() === customer.prop.baseCcyId()) :
                        (isBaseEqualWithCustomerCcy = newDealData.baseSymbolId() === customer.prop.baseCcyId());
                    return isBaseEqualWithCustomerCcy;

                });
            };

            var dispose = function () {
                parent.dispose.call(self);
            };

            return {
                init: init,
                dispose: dispose
            };
        });

        var createViewModel = function (params) {
            var viewModel = new ConvertedAmountViewModel(params);
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
