define(
    'initdatamanagers/DealsAmountsManager',
    [
        'require',
        'Q',
        'handlers/general',
        'handlers/HashTable',
        'dataaccess/dalorder'
    ],
    function DealsAmountsManagerDef(require) {
        var Q = require('Q'),
            general = require('handlers/general'),
            hashTable = require('handlers/HashTable'),
            dalOrders = require('dataaccess/dalorder'),
            minDealAmountsDefer = Q.defer();

        function DealsAmountsManager() {
            var minAmounts = new hashTable();

            function init() {
                getInitialMinDealAmounts();
            }

            function setCustomerMinDealsAmounts(minDealAmounts) {
                if (!general.isEmptyValue(minDealAmounts)) {
                    var i,
                        length = minDealAmounts.length;

                    for (i = 0; i < length; i++) {
                        minAmounts.OverrideItem(minDealAmounts[i][eMinDealValue.instrumentID], general.toNumeric(minDealAmounts[i][eMinDealValue.minAmount]));
                    }
                }
            }

            function updateMinDealAmounts(minDealAmounts) {
                setCustomerMinDealsAmounts(minDealAmounts);
            }

            function getDealMinMaxAmounts(instrumentId, instrumentMaxDeal) {
                var minAmount = minAmounts.GetItem(instrumentId);
                var maxAmount = Number(instrumentMaxDeal.replace(/[^0-9\.]+/g, ""));

                if (minAmount > maxAmount) {
                    minAmount = maxAmount;
                }

                return [minAmount, maxAmount];
            }

            function getInitialMinDealAmounts() {
                return dalOrders.GetMinDealAmounts()
                    .then(updateMinDealAmounts)
                    .then(function () { minDealAmountsDefer.resolve(); });
            }

            return {
                Init: init,
                GetDealMinMaxAmounts: getDealMinMaxAmounts,
                UpdateMinDealAmounts: updateMinDealAmounts,
                MinDealAmountsPromise: minDealAmountsDefer.promise
            };
        }

        return new DealsAmountsManager();
    }
);
