define(
    'viewmodels/BonusViewModel',
    [
        "knockout",
        'cachemanagers/bonusmanager'
    ],
    function (ko, bonusManager) {

        function BonusViewModel(params) {

            var data = this.Data || {};

            data.CashBack = ko.observable("");
            data.MaxCashBack = ko.observable("");
            
            data.isDataLoaded = ko.observable(false);

            data.SpreadDiscount = ko.observable("");
            data.MaxSpreadDiscount = ko.observable("");

            function updateBonusData() {
                var bonus = bonusManager.bonus();
                // cash back
                data.CashBack(bonus.accumulatedVolumeUsd / bonus.volumeUsd * bonus.amountBase);
                data.MaxCashBack(bonus.amountBase);
                // spread
                data.SpreadDiscount(bonus.amountGivenBase);
                data.MaxSpreadDiscount(bonus.amountGivenBase + bonus.amountBase);

                data.isDataLoaded(bonus.amountBase > 0);
            }

            function dispose() {

                bonusManager.onChange.Remove(updateBonusData);
            }

            bonusManager.onChange.Add(updateBonusData);
            updateBonusData();

            return {
                Data: data,
                Params: params || {},
                dispose: dispose
            };
        }

        var createViewModel = function (params) {

            var viewModel = new BonusViewModel(params);
            return viewModel;
        };

        return {
            viewModel: {
                createViewModel: createViewModel
            }
        };
    });