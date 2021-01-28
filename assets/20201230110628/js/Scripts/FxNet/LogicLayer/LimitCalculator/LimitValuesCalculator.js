define(
    'calculators/LimitValuesCalculator',
    [
        'require',
        'handlers/general',
        'handlers/AmountConverter',
        'enums/enums'
    ],
    function (require) {
        var general = require('handlers/general'),
            amountConverter = require('handlers/AmountConverter');

        function LimitValues(_amount, _value, _rate, _percent) {
            this.amount = general.isDefinedType(_amount) ? _amount : "";
            this.value = general.isDefinedType(_value) ? _value : "";
            this.rate = general.isDefinedType(_rate) ? _rate : "";
            this.percent = general.isDefinedType(_percent) ? _percent : "";

            this.isValid = (this.amount !== "" && this.amount !== "NA") &&
                (this.value !== "" && this.value !== "NA") &&
                (this.rate !== "" && this.rate !== "NA") &&
                (this.percent !== "" && this.percent !== "NA");
        }

        var LimitValuesCalculator = {
            //--------------------------------------------------
            // CalculateValuesFromRate
            //--------------------------------------------------
            CalculateValuesFromRate: function (bid, ask, limitRate, orderDir, limitType, dealAmount, range, quoteForOtherCcyToAccountCcy, instrumentId, gap) {
                gap = general.isNumber(gap) ? gap : 0;

                if (!general.isNumber(limitRate))
                    return new LimitValues();

                //---------------------------------------------

                limitRate = parseFloat(limitRate);

                if (!general.InRange(limitRate, range))
                    return new LimitValues("NA", "NA", limitRate, "NA");

                //---------------------------------------------

                var rate = (orderDir == eOrderDir.Sell) ? parseFloat(bid) : parseFloat(ask);
                var amount = this.CalculateAmountFromRate(rate, limitRate, dealAmount, orderDir) + gap;
                var percent = this.CalculatePercentFromRate(rate, limitRate) + (gap / (dealAmount * 100));
                var value = this.CalculateValue(amount, quoteForOtherCcyToAccountCcy);

                limitRate = Format.toRate(limitRate, true, instrumentId);

                return new LimitValues(amount, value, limitRate, percent);
            },

            //--------------------------------------------------
            // CalculateValuesFromAmount
            //--------------------------------------------------
            CalculateValuesFromAmount: function (bid, ask, amount, orderDir, limitType, dealAmount, range, quoteForOtherCcyToAccountCcy, instrumentId) {
                if (!general.isNumber(amount)) {
                    return new LimitValues();
                }

                var _amount = Math.abs(parseFloat(amount));

                //---------------------------------------------

                var rate = (orderDir == eOrderDir.Sell) ? parseFloat(bid) : parseFloat(ask);
                var limitRate = this.CalculateRateFromAmount(rate, _amount, dealAmount, orderDir, limitType);
                limitRate = Format.toRate(limitRate, true, instrumentId);

                if (!general.InRange(limitRate, range))
                    return new LimitValues(amount, "NA", "NA", "NA");

                //---------------------------------------------

                var percent = this.CalculatePercentFromRate(rate, limitRate, dealAmount);
                var value = this.CalculateValue(_amount, quoteForOtherCcyToAccountCcy);

                return new LimitValues(amount, value, limitRate, percent);
            },

            //--------------------------------------------------
            // CalculateValuesFromPercent
            //--------------------------------------------------
            CalculateValuesFromPercent: function (bid, ask, percent, orderDir, limitType, dealAmount, range, quoteForOtherCcyToAccountCcy, instrumentId) {
                if (!general.isNumber(percent))
                    return new LimitValues();

                var rate = (orderDir == eOrderDir.Sell) ? parseFloat(bid) : parseFloat(ask);
                var _percent = parseFloat(percent);

                //---------------------------------------------

                var limitRate = this.CalculateRateFromPercent(rate, _percent, orderDir, limitType);
                limitRate = Format.toRate(limitRate, true, instrumentId);

                if (!general.InRange(limitRate, range))
                    return new LimitValues("NA", "NA", "NA", percent);

                //---------------------------------------------

                var amount = this.CalculateAmountFromRate(rate, limitRate, dealAmount, orderDir);
                var value = this.CalculateValue(amount, quoteForOtherCcyToAccountCcy);

                return new LimitValues(amount, value, limitRate, percent);
            },

            //--------------------------------------------------
            // CalculateRateFromAmount
            //--------------------------------------------------
            CalculateRateFromAmount: function (rate, amount, dealAmount, orderDir, limitType) {
                if (dealAmount <= 0)
                    return 0;

                var amountRelation = amount / dealAmount;

                if (orderDir == eOrderDir.Sell)
                    amountRelation *= -1;

                return (limitType == eLimitType.TakeProfit) ? rate + amountRelation : rate - amountRelation;
            },

            //--------------------------------------------------
            // CalculateRateFromPercent
            //--------------------------------------------------
            CalculateRateFromPercent: function (rate, percent, orderDir, limitType) {
                var percentage = percent * rate / 100;

                if (orderDir === eOrderDir.Buy && limitType === eLimitType.StopLoss) {
                    return rate - percentage;
                }

                if (orderDir === eOrderDir.Buy && limitType === eLimitType.TakeProfit) {
                    return rate + percentage;
                }

                if (orderDir === eOrderDir.Sell && limitType === eLimitType.StopLoss) {
                    return rate + percentage;
                }

                if (orderDir === eOrderDir.Sell && limitType === eLimitType.TakeProfit) {
                    return rate - percentage;
                }

                // When orderDir hasn't been selected
                if (limitType === eLimitType.StopLoss) {
                    return rate - percentage;
                }

                // For TakeProfit limit
                return rate + percentage;
            },

            //--------------------------------------------------
            // Calculate amount from given amount currency to customer currency
            //--------------------------------------------------
            CalculateValue: function (amount, quoteForOtherCcyToAccountCcy) {
                return amountConverter.Convert(amount, quoteForOtherCcyToAccountCcy);
            },

            //--------------------------------------------------
            // Calculate amount from customer currency to given currency
            //--------------------------------------------------
            CalculateAmount: function (amount, quoteForAccountCcyToOtherCcy, limitType) {
                if (limitType == eLimitType.StopLoss) {
                    amount *= -1;
                }

                return amountConverter.Convert(amount, quoteForAccountCcyToOtherCcy);
            },

            //--------------------------------------------------
            // CalculateAmountFromRate
            //--------------------------------------------------
            CalculateAmountFromRate: function (rate, limitRate, dealAmount, orderDir) {
                var operator = orderDir === eOrderDir.Sell ? -1 : 1;
                var rateDifference = (limitRate - rate) * operator;
                return dealAmount * general.RateRound(rateDifference);
            },

            //--------------------------------------------------
            // CalculatePercentFromRate
            //--------------------------------------------------
            CalculatePercentFromRate: function (rate, limitRate) {
                return (limitRate === 0) ? 100 : (100 * Math.abs(rate - limitRate) / rate);
            }
        };

        return LimitValuesCalculator;
    }
);