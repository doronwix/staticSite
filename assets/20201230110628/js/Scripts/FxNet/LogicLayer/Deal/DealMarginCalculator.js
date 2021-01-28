define(
    'FxNet/LogicLayer/Deal/DealMarginCalculator',
    [
        'require',
        'initdatamanagers/Customer',
        'handlers/AmountConverter',
        'handlers/general',
    ],
    function (require) {
        var Customer = require("initdatamanagers/Customer"),
            general = require('handlers/general'),
            AmountConverter = require("handlers/AmountConverter");

        /* 
        * Computes deal margin for the given parameters
        *
        * @param {Object} params
        *  params.orderDir
        *  params.dealAmount
        *  params.dealRate
        *  params.quoteForBaseCcyToAccountCcy
        *  params.quoteForOtherCcyToAccountCcy
        *  params.baseSymbol
        *  params.hasPosition
        *  params.otherSymbol
        *  params.otherSymbolAmount
        *  params.baseSymbolAmount
        *  params.requiredMarginPercentage
        */
        var calculateMargin = function (params) {

            if (!hasValidParams(params)) {
                return;
            }

            var totalOtherAmountExistingDeals = general.toNumeric(params.otherSymbolAmount),
                totalBaseAmountExistingDeals = general.toNumeric(params.baseSymbolAmount),
                requiredMarginPercentage = general.toNumeric(params.requiredMarginPercentage),
                dealAmountInOtherCcy = params.dealAmount * general.toNumeric(params.dealRate),
                signForAmountInBase,
                signForAmountInOther;

            if (params.hasPosition) {
                signForAmountInBase = params.orderDir === eOrderDir.Sell ? -1 : 1;
                signForAmountInOther = signForAmountInBase * -1;
            } else {
                signForAmountInBase = signForAmountInOther = 1;
            }

            var totalOtherAmountExistingDealsInAccountCcy = roundValueWithPrecision(AmountConverter.Convert(Math.abs(totalOtherAmountExistingDeals), params.quoteForOtherCcyToAccountCcy, true), 2);
            var totalBaseAmountExistingDealsInAccountCcy = roundValueWithPrecision(AmountConverter.Convert(Math.abs(totalBaseAmountExistingDeals), params.quoteForBaseCcyToAccountCcy, true), 2);
            var maxVolumeExistingDeals = Math.max(totalOtherAmountExistingDealsInAccountCcy, totalBaseAmountExistingDealsInAccountCcy);
            var usedMarginExistingDeals = roundValueWithPrecision(maxVolumeExistingDeals * requiredMarginPercentage, 2);

            var totalOtherAmountSimulatedInAccountCcy = roundValueWithPrecision(AmountConverter.Convert(Math.abs(totalOtherAmountExistingDeals + dealAmountInOtherCcy * signForAmountInOther), params.quoteForOtherCcyToAccountCcy, true), 2);
            var totalBaseAmountSimulatedInAccountCcy = roundValueWithPrecision(AmountConverter.Convert(Math.abs(totalBaseAmountExistingDeals + params.dealAmount * signForAmountInBase), params.quoteForBaseCcyToAccountCcy, true), 2);
            var maxVolumeSimulated = Math.max(totalOtherAmountSimulatedInAccountCcy, totalBaseAmountSimulatedInAccountCcy);
            var usedMarginSimulated = roundValueWithPrecision(maxVolumeSimulated * requiredMarginPercentage, 2);

            var dealUsedMargin = usedMarginSimulated - usedMarginExistingDeals;

            return roundValueWithPrecision(dealUsedMargin, 2);
        };

        function roundValueWithPrecision(value, precision) {
            var factor = Math.pow(10, precision);

            return Math.round(value * factor) / factor;
        }

        var calculatePipWorth = function (dealAmount, pipDigit, quoteForOtherCcyToAccountCcy, conversionRate) {
            var pipWorth = dealAmount * (1 / Math.pow(10, pipDigit));
            var convertPipWorth = convert(pipWorth, quoteForOtherCcyToAccountCcy);
            var pipWorthFormat;

            if (conversionRate > 10 && convertPipWorth) {
                pipWorthFormat = convertPipWorth.toFixed(0);
            } else {
                pipWorthFormat = toPipWorthFormat(convertPipWorth);
            }

            return pipWorthFormat;
        };

        var calculateDealAmount = function (params) {

            if (!params.quoteForOtherCcyToAccountCcy) {
                return "";
            }

            if (params.baseSymbol == Customer.prop.baseCcyId()) {
                return params.dealAmount;
            }

            var convertedDealAmount = convert(params.dealRate * params.dealAmount, params.quoteForOtherCcyToAccountCcy);

            return convertedDealAmount;
        }

        var calculateSpreadWorthInAcountCCY = function (params) {
            var askBidDifference = params.ask - params.bid,
                spreadAmountInOther = params.dealAmount * askBidDifference,
                spreadWorthInAcountCCY = 0;

            if (general.isNumber(spreadAmountInOther)) {
                spreadWorthInAcountCCY = Math.abs(convert(-spreadAmountInOther, params.quoteForOtherCcyToAccountCcy));
            }

            return roundValueWithPrecision(spreadWorthInAcountCCY, 2);
        };

        var convert = function (dealAmount, inBetweenQuote) {
            var result = AmountConverter.Convert(dealAmount, inBetweenQuote);
            return result;
        };

        var toPipWorthFormat = function (value) {
            if (value) {
                value = parseFloat(value.toFixed(2));
            }

            return value;
        };

        var hasValidParams = function (params) {
            return (params.orderDir === eOrderDir.Sell || params.orderDir === eOrderDir.Buy) &&
                general.isNumber(params.requiredMarginPercentage) &&
                general.isNumber(params.dealRate) &&
                general.isNumber(params.dealAmount);
        };

        return {
            DealMargin: calculateMargin,
            PipWorth: calculatePipWorth,
            DealAmount: calculateDealAmount,
            SpreadWorthInAcountCCY: calculateSpreadWorthInAcountCCY,
            Convert: convert
        };
    }
);
