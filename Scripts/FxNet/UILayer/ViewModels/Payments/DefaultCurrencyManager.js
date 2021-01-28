'use strict';
define(
    'viewmodels/Payments/defaultCurrencyManager',
    [
        'initdatamanagers/Customer',
        'dataaccess/dalDeposit',
        'handlers/general',
    ],
    function (customer, dalDeposit, general) {
        function MakeDefaultCurrencyManager() {
            var lastCurrencyId,
                customerCurrencyId = customer.prop.baseCcyId,
                loadDataPromise;

            function setLastSuccesfullDepositCurrency(currenyId) {
                lastCurrencyId = parseInt(currenyId);
            }

            function loadLastUsedCurrency() {
                loadDataPromise = dalDeposit.getLastSuccesfullDepositCurrency()
                    .then(setLastSuccesfullDepositCurrency)
                    .fail(general.emptyFn);

                return loadDataPromise;
            }

            function getDefaultCurrencyIndex(currencies, currencyIdPropName) {
                if (general.isEmptyValue(currencies)) return -1;

                var currencyIds = currencies.map(function (c) { return parseInt(c[currencyIdPropName]); });

                var indexCurrency = currencyIds.indexOf(lastCurrencyId);

                if (indexCurrency > -1) {
                    return indexCurrency;
                }

                indexCurrency = currencyIds.indexOf(customerCurrencyId());

                if (indexCurrency > -1) {
                    return indexCurrency;
                }

                return 0;
            }

            function getDefaultCurrencyId(currencies, currencyIdPropName) {
                if (!loadDataPromise) {
                    loadLastUsedCurrency();
                }

                return loadDataPromise
                    .then(function () {
                        currencyIdPropName = currencyIdPropName || 'orderId';

                        var index = getDefaultCurrencyIndex(currencies, currencyIdPropName);

                        return (index >= 0) ? currencies[index][currencyIdPropName] : null;
                    });
            }

            function getDefaultCurrency(currencies, currencyIdPropName) {
                if (!loadDataPromise) {
                    loadLastUsedCurrency();
                }

                return loadDataPromise
                    .then(function () {
                        currencyIdPropName = currencyIdPropName || 'orderId';

                        var index = getDefaultCurrencyIndex(currencies, currencyIdPropName);

                        return (index >= 0) ? currencies[index] : null;
                    });
            }

            return {
                loadLastUsedCurrency: loadLastUsedCurrency,
                getDefaultCurrencyId: getDefaultCurrencyId,
                getDefaultCurrency: getDefaultCurrency
            };
        }

        return MakeDefaultCurrencyManager();
    });
