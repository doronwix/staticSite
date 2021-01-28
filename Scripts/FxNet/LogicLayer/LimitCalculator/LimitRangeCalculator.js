define(
    'calculators/LimitRangeCalculator',
    [
        'require',
        'handlers/general',
        'enums/enums'
    ],
    function (require) {
        var general = require('handlers/general');

        //------------------------------------------------------------
        // LimitRangesCalculator
        //------------------------------------------------------------
        var LimitRangesCalculator = {
            LimitRange: function LimitRange(ko) {
                this.near = ko.observable("");
                this.far = ko.observable("");
            },

            CalculateOpeningRanges: function (bid, ask, orderDir, lowerRange, higherRange, instrument, limitMultiplier) {
                this.CalculateLimitRanges(bid, ask, eLimitMode.OpenDeal, orderDir, lowerRange, higherRange, instrument, limitMultiplier);
            },

            //------------------------------------------------------

            CalculateClosingRanges: function (bid, ask, orderDir, lowerRange, higherRange, instrument, limitMultiplier) {
                this.CalculateLimitRanges(bid, ask, eLimitMode.CloseDeal, orderDir, lowerRange, higherRange, instrument, limitMultiplier);
            },

            //------------------------------------------------------

            CalculateIfDoneRanges: function (bid, ask, orderDir, lowerRange, higherRange, limitLevel, instrument, limitMultiplier) {
                switch (orderDir) {
                    case eOrderDir.Sell:
                        this.CalculateIfDoneShortLimits(bid, ask, instrument, Number(limitLevel), lowerRange, higherRange, limitMultiplier);
                        break;

                    default:
                        this.CalculateIfDoneLongLimits(bid, ask, instrument, Number(limitLevel), lowerRange, higherRange, limitMultiplier);
                        break;
                }
            },

            //------------------------------------------------------

            CalculateLimitRanges: function (bid, ask, limitmode, orderDir, lowerRange, higherRange, instrument, limitMultiplier) {
                switch (limitmode) {
                    case eLimitMode.OpenDeal:
                        switch (orderDir) {
                            case eOrderDir.Sell:
                                this.CalculateOpenShortLimits(bid, ask, instrument, lowerRange, higherRange, limitMultiplier);
                                break;

                            default:
                                this.CalculateOpenLongLimits(bid, ask, instrument, lowerRange, higherRange, limitMultiplier);
                                break;
                        }
                        break;

                    case eLimitMode.CloseDeal:
                        switch (orderDir) {
                            case eOrderDir.Sell:
                                this.CalculateCloseShortLimits(bid, ask, instrument, lowerRange, higherRange, limitMultiplier);
                                break;

                            default:
                                this.CalculateCloseLongLimits(bid, ask, instrument, lowerRange, higherRange, limitMultiplier);
                                break;
                        }
                        break;
                }
            },

            //------------------------------------------------------

            CalculateOpenLongLimits: function (bid, ask, instrument, lowerRange, higherRange, limitMultiplier) {
                if (lowerRange) {
                    lowerRange.near(this.CalculateNearLimit(ask, instrument.SLMinDistance, limitMultiplier, Operation.Add, instrument.PipDigit));
                    lowerRange.far(this.CalculateFarLimit(ask, systemInfo.config.MaxOpenLimitDist, Operation.Add));
                }

                if (higherRange) {
                    higherRange.near(this.CalculateNearLimit(bid, instrument.TPMinDistance, limitMultiplier, Operation.Substruct, instrument.PipDigit));
                    higherRange.far(this.CalculateFarLimit(bid, systemInfo.config.MaxOpenLimitDist, Operation.Substruct));
                }
            },

            //------------------------------------------------------

            CalculateOpenShortLimits: function (bid, ask, instrument, lowerRange, higherRange, limitMultiplier) {
                if (lowerRange) {
                    lowerRange.near(this.CalculateNearLimit(bid, instrument.SLMinDistance, limitMultiplier, Operation.Substruct, instrument.PipDigit));
                    lowerRange.far(this.CalculateFarLimit(bid, systemInfo.config.MaxOpenLimitDist, Operation.Substruct));
                }

                if (higherRange) {
                    higherRange.near(this.CalculateNearLimit(ask, instrument.TPMinDistance, limitMultiplier, Operation.Add, instrument.PipDigit));
                    higherRange.far(this.CalculateFarLimit(ask, systemInfo.config.MaxOpenLimitDist, Operation.Add));
                }
            },

            //------------------------------------------------------

            CalculateCloseLongLimits: function (bid, ask, instrument, lowerRange, higherRange, limitMultiplier) {
                if (lowerRange) {
                    lowerRange.near(this.CalculateNearLimit(bid, instrument.SLMinDistance, limitMultiplier, Operation.Substruct, instrument.PipDigit));
                    lowerRange.far(this.CalculateFarLimit(bid, systemInfo.config.MaxCloseLimitDist, Operation.Substruct));
                }

                if (higherRange) {
                    higherRange.near(this.CalculateNearLimit(ask, instrument.TPMinDistance, limitMultiplier, Operation.Add, instrument.PipDigit));
                    higherRange.far(this.CalculateFarLimit(ask, systemInfo.config.MaxCloseLimitDist, Operation.Add));
                }
            },

            //------------------------------------------------------

            CalculateCloseShortLimits: function (bid, ask, instrument, lowerRange, higherRange, limitMultiplier) {
                if (lowerRange) {
                    lowerRange.near(this.CalculateNearLimit(ask, instrument.SLMinDistance, limitMultiplier, Operation.Add, instrument.PipDigit));
                    lowerRange.far(this.CalculateFarLimit(ask, systemInfo.config.MaxCloseLimitDist, Operation.Add));
                }

                if (higherRange) {
                    higherRange.near(this.CalculateNearLimit(bid, instrument.TPMinDistance, limitMultiplier, Operation.Substruct, instrument.PipDigit));
                    higherRange.far(this.CalculateFarLimit(bid, systemInfo.config.MaxCloseLimitDist, Operation.Substruct));
                }
            },

            //------------------------------------------------------

            CalculateIfDoneShortLimits: function (bid, ask, instrument, limitLevel, lowerRange, higherRange, limitMultiplier) {
                if (lowerRange) {
                    lowerRange.near(this.CalculateNearLimit(limitLevel + (ask - bid), instrument.SLMinDistance, limitMultiplier, Operation.Add, instrument.PipDigit));
                    lowerRange.far(this.CalculateFarLimit(limitLevel + (ask - bid), systemInfo.config.MaxCloseLimitDist, Operation.Add));
                }

                if (higherRange) {
                    higherRange.near(this.CalculateNearLimit(limitLevel, instrument.TPMinDistance, limitMultiplier, Operation.Substruct, instrument.PipDigit));
                    higherRange.far(this.CalculateFarLimit(limitLevel, systemInfo.config.MaxCloseLimitDist, Operation.Substruct));
                }
            },

            CalculateIfDoneLongLimits: function (bid, ask, instrument, limitLevel, lowerRange, higherRange, limitMultiplier) {
                if (lowerRange) {
                    lowerRange.near(this.CalculateNearLimit(limitLevel - (ask - bid), instrument.SLMinDistance, limitMultiplier, Operation.Substruct, instrument.PipDigit));
                    lowerRange.far(this.CalculateFarLimit(limitLevel - (ask - bid), systemInfo.config.MaxCloseLimitDist, Operation.Substruct));
                }

                if (higherRange) {
                    higherRange.near(this.CalculateNearLimit(limitLevel, instrument.TPMinDistance, limitMultiplier, Operation.Add, instrument.PipDigit));
                    higherRange.far(this.CalculateFarLimit(limitLevel, systemInfo.config.MaxCloseLimitDist, Operation.Add));
                }
            },

            CalculateNearLimit: function (rate, minDistance, limitMultiplier, operation, pipDigit) {
                limitMultiplier = limitMultiplier || 1;
                var rawDistance;
                if (pipDigit >= 0)
                    rawDistance = (minDistance * limitMultiplier) / general.pow10cache[pipDigit];
                else
                    rawDistance = minDistance * limitMultiplier * general.pow10cache[pipDigit * (-1)];

                switch (operation) {
                    case Operation.Add:
                        return Number(rate) + rawDistance;

                    case Operation.Substruct:
                        return Number(rate) - rawDistance;

                    default:
                        throw new RangeError("unknown operation");
                }
            },

            CalculateFarLimit: function (rate, maxDistance, operation) {
                var maxDistanceDivider = 100,
                    adjustedMaxDistance;

                switch (operation) {
                    case Operation.Add:
                        adjustedMaxDistance = maxDistanceDivider + maxDistance;
                        break;

                    case Operation.Substruct:
                        adjustedMaxDistance = maxDistanceDivider - maxDistance;
                        break;

                    default:
                        throw new RangeError("unknown operation");
                }

                return Number(rate) * adjustedMaxDistance / maxDistanceDivider;
            }
        };

        return LimitRangesCalculator;
    }
);