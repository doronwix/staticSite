define(
    'viewmodels/Limits/AmountFieldsWrapper',
    [
        'require',
        'knockout',
        'handlers/general',
        'helpers/KoComponentViewModel',
        'calculators/LimitValuesCalculator'
    ],
    function AmountFieldsWrapperDef(require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            KoComponentViewModel = require('helpers/KoComponentViewModel'),
            LimitValuesCalculator = require('calculators/LimitValuesCalculator');

        var AmountFieldsWrapper = general.extendClass(KoComponentViewModel, function AmountFieldsWrapperClass() {
            var self = this,
                parent = this.parent,
                data = this.Data,
                setLimitsModel,
                parentData,
                slAmount = ko.observable(""),
                tpAmount = ko.observable(""),
                slAmountIsUpdating = ko.observable(false),
                tpAmountIsUpdating = ko.observable(false);

            function init(limitsModel, dealData) {
                setLimitsModel = limitsModel;
                parentData = dealData;

                setComputables();
                setSubscribers();
                setValidation();
            }

            function setComputables() {
                data.stopLossInCustomerCcy = self.createComputed({
                    read: function read() {
                        var isAmountTabSelected = setLimitsModel.Data.curSlActiveTab() == eSetLimitsTabs.Amount || setLimitsModel.Data.curSlActiveTab() == setLimitsModel.Data.defaultTab,
                            rawValue,
                            amount = "";

                        if (!isAmountTabSelected) {
                            rawValue = setLimitsModel.Data.ccySLAmount();
                        }
                        else {
                            rawValue = slAmount();
                        }

                        if (rawValue === "NA") {
                            return rawValue;
                        }

                        if (rawValue !== "" && !isNaN(rawValue)) {
                            amount = Math.abs(Number(rawValue));
                            amount = Math.ceil(amount);
                        }

                        return amount;
                    },
                    write: function write(value) {
                        var isAmountTabSelected = setLimitsModel.Data.curSlActiveTab() == eSetLimitsTabs.Amount || setLimitsModel.Data.curSlActiveTab() == setLimitsModel.Data.defaultTab,
                            isEmptyValue = value === "" || 'NA'.indexOf(value) > -1 || (general.isStringType(value) && value.indexOf("NA") > -1),
                            isValidValue = !isNaN(value),
                            quoteForAccountCcyToOtherCcy = parentData.quoteForAccountCcyToOtherCcy(),
                            amount = "",
                            previousAmount = slAmount(),
                            previousResult = setLimitsModel.Data.stopLossAmount(),
                            result;

                        if (!isAmountTabSelected) {
                            return;
                        }

                        if (isEmptyValue) {
                            result = "";
                        }
                        else if (isValidValue) {
                            amount = parseFloat(value);
                        }
                        else {
                            amount = previousAmount;
                        }

                        if (!isEmptyValue && amount !== "" && !isNaN(amount)) {
                            // Convert only if there is a valid value
                            result = LimitValuesCalculator.CalculateAmount(amount, quoteForAccountCcyToOtherCcy, eLimitType.StopLoss);
                            result = Math.abs(result);
                        }

                        slAmountIsUpdating(true);
                        slAmount(amount);

                        if (amount === previousAmount) {
                            slAmount.notifySubscribers(amount);
                        }

                        setLimitsModel.Data.stopLossAmount(result);

                        if (result === previousResult) {
                            setLimitsModel.Data.stopLossAmount.notifySubscribers(result);
                        }

                        slAmountIsUpdating(false);
                    }
                });

                data.takeProfitInCustomerCcy = self.createComputed({
                    read: function read() {
                        var isAmountTabSelected = setLimitsModel.Data.curTpActiveTab() == eSetLimitsTabs.Amount || setLimitsModel.Data.curTpActiveTab() == setLimitsModel.Data.defaultTab,
                            rawValue,
                            amount = "";

                        if (!isAmountTabSelected) {
                            rawValue = setLimitsModel.Data.ccyTPAmount();
                        } else {
                            rawValue = tpAmount();
                        }

                        if (rawValue === "NA") {
                            return rawValue;
                        }

                        if (rawValue !== "" && !isNaN(rawValue)) {
                            amount = Math.abs(Number(rawValue));
                            amount = Math.ceil(amount);
                        }

                        return amount;
                    },
                    write: function write(value) {
                        var isAmountTabSelected = setLimitsModel.Data.curTpActiveTab() == eSetLimitsTabs.Amount || setLimitsModel.Data.curTpActiveTab() == setLimitsModel.Data.defaultTab,
                            isEmptyValue = value === "" || 'NA'.indexOf(value) > -1 || (general.isStringType(value) && value.indexOf("NA") > -1),
                            isValidValue = !isNaN(value),
                            quoteForAccountCcyToOtherCcy = parentData.quoteForAccountCcyToOtherCcy(),
                            amount = "",
                            previousAmount = tpAmount(),
                            previousResult = setLimitsModel.Data.takeProfitAmount(),
                            result;

                        if (!isAmountTabSelected) {
                            return;
                        }

                        if (isEmptyValue) {
                            result = "";
                        }
                        else if (isValidValue) {
                            amount = parseFloat(value);
                        }
                        else {
                            amount = previousAmount;
                        }

                        if (!isEmptyValue && amount !== "" && !isNaN(amount)) {
                            // Convert only if there is a valid value
                            result = LimitValuesCalculator.CalculateAmount(amount, quoteForAccountCcyToOtherCcy, eLimitType.TakeProfit);
                            result = Math.abs(result);
                        }

                        tpAmountIsUpdating(true);
                        tpAmount(amount);

                        if (amount === previousAmount) {
                            tpAmount.notifySubscribers(amount);
                        }

                        setLimitsModel.Data.takeProfitAmount(result);

                        if (result === previousResult) {
                            setLimitsModel.Data.takeProfitAmount.notifySubscribers(result);
                        }

                        tpAmountIsUpdating(false);
                    }
                });
            }

            function setSubscribers() {
                // Stop Loss
                self.subscribeTo(setLimitsModel.Data.ccySLAmount, function onCcySLAmountChanged(value) {
                    var isAmountTabSelected = setLimitsModel.Data.curSlActiveTab() == eSetLimitsTabs.Amount ||
                        setLimitsModel.Data.curSlActiveTab() == setLimitsModel.Data.defaultTab;

                    if (!slAmountIsUpdating()) {
                        if ((isAmountTabSelected && (general.isEmpty(slAmount()) || isNaN(slAmount()))) || !isAmountTabSelected) {
                            slAmount(value);
                        }
                    }
                });

                // Take Profit
                self.subscribeTo(setLimitsModel.Data.ccyTPAmount, function onCcyTPAmountChanged(value) {
                    var isAmountTabSelected = setLimitsModel.Data.curTpActiveTab() == eSetLimitsTabs.Amount ||
                        setLimitsModel.Data.curTpActiveTab() == setLimitsModel.Data.defaultTab;

                    if (!tpAmountIsUpdating()) {
                        if ((isAmountTabSelected && (general.isEmpty(tpAmount()) || isNaN(tpAmount()))) || !isAmountTabSelected) {
                            tpAmount(value);
                        }
                    }
                });
            }

            function setValidation() {
                // apply validator
                data.stopLossInCustomerCcy.extend({
                    validation: {
                        validator: function validate() {
                            return setLimitsModel.Data.stopLossAmount.isValid();
                        },
                        params: setLimitsModel.Data.stopLossAmount
                    }
                });

                data.stopLossInCustomerCcy.extend({
                    incremental: {
                        ranges: [
                            { from: 0, to: 10, step: 1 },                    // units
                            { from: 10, to: 100, step: 5 },                  // tens
                            { from: 100, to: 1000, step: 50 },               // hundreds
                            { from: 1000, to: Number.MAX_VALUE, step: 500 }  // thousands
                        ]
                    }
                });

                data.stopLossInCustomerCcy.extend({
                    notify: "always"
                });

                // apply validator
                data.takeProfitInCustomerCcy.extend({
                    validation: {
                        validator: function validate() {
                            return setLimitsModel.Data.takeProfitAmount.isValid();
                        },
                        params: setLimitsModel.Data.takeProfitAmount
                    }
                });

                data.takeProfitInCustomerCcy.extend({
                    incremental: {
                        ranges: [
                            { from: 0, to: 10, step: 1 },                    // units
                            { from: 10, to: 100, step: 5 },                  // tens
                            { from: 100, to: 1000, step: 50 },               // hundreds
                            { from: 1000, to: Number.MAX_VALUE, step: 500 }  // thousands
                        ]
                    }
                });

                data.takeProfitInCustomerCcy.extend({
                    notify: "always"
                });
            }

            function dispose() {
                parent.dispose.call(self);

                setLimitsModel = null;
                parentData = null;
            }

            return {
                init: init,
                Data: data,
                dispose: dispose
            };
        });

        return AmountFieldsWrapper;
    }
);
