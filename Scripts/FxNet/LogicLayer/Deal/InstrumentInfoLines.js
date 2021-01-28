define(
    'FxNet/LogicLayer/Deal/InstrumentInfoLines',
    [
        'require',
        'Dictionary',
        'handlers/general',
        'LoadDictionaryContent!deals_InstrumentInfoTool'
    ],
    function (require) {
        var dictionary = require('Dictionary'),
            general = require('handlers/general'),
            instrument, data,
            instrumentInfoConfig = [
                {
                    id: instrumentInfoProps.pipValue,
                    available: true,
                    label: 'txtPipValue',
                    labelMobile: 'lblPipValue',
                    tooltip: 'txtPipValueInfo',
                    attrIdOfValue: 'lblPipValue',
                    attrIdOfValueMobile: 'lblPipValue',
                    value: 'pipValue'
                },
                {
                    id: instrumentInfoProps.pipWorth,
                    available: true,
                    label: 'lblPipWorth',
                    labelMobile: 'lblPipWorth',
                    tooltip: 'txtPipWorthInfo',
                    attrIdOfValue: 'lblPipWorth',
                    attrIdOfValueMobile: 'lblPipWorth',
                    value: 'pipWorth'
                },
                {
                    id: instrumentInfoProps.requiredMargin,
                    available: true,
                    label: 'lblRequiredMargin',
                    labelMobile: 'lblRequiredMargin',
                    tooltip: 'txtRequiredMarginInfo',
                    attrIdOfValue: 'lblRequiredMargin',
                    attrIdOfValueMobile: 'lblRequiredMargin',
                    value: 'requiredMargin'
                },
                {
                    id: instrumentInfoProps.offHoursRequiredMargin,
                    available: true,
                    label: 'lblOffHoursRequiredMargin',
                    labelMobile: 'lblOffHoursRequiredMargin',
                    tooltip: 'txtOffHoursRequiredMarginInfo',
                    attrIdOfValue: 'lblOffHoursRequiredMargin',
                    attrIdOfValueMobile: 'lblOffHoursRequiredMargin',
                    value: 'offHoursRequiredMargin'
                },
                {
                    id: instrumentInfoProps.maximumLeverage,
                    available: true,
                    label: 'lblMaximumLeverage',
                    labelMobile: 'lblMaximumLeverage',
                    tooltip: null,
                    attrIdOfValue: 'lblMaximumLeverage',
                    attrIdOfValueMobile: 'lblMaximumLeverage',
                    value: 'maximumLeverage'
                },
                {
                    id: instrumentInfoProps.minDealAmount,
                    available: true,
                    label: 'minDealAmountLabel',
                    labelMobile: 'minDealAmountLabel',
                    tooltip: 'txtMinAmountToTrade',
                    attrIdOfValue: 'lblMinAmount',
                    attrIdOfValueMobile: 'lblMinAmount',
                    value: 'minAmount'
                },
                {
                    id: instrumentInfoProps.maxDealAmount,
                    available: true,
                    label: 'maxDealAmountLabel',
                    labelMobile: 'maxDealAmountLabel',
                    tooltip: 'txtMaxAmountToTrade',
                    attrIdOfValue: 'lblMaxAmount',
                    attrIdOfValueMobile: 'lblMaxAmount',
                    value: 'maxAmount'
                },
                {
                    id: instrumentInfoProps.marketPriceTolerance,
                    available: true,
                    label: 'lblMaketPriceTolerance',
                    labelMobile: 'lblMraketPriceTolerance',
                    tooltip: 'txtMaketPriceToleranceInfo',
                    attrIdOfValue: 'lblMaketPriceTolerance',
                    attrIdOfValueMobile: 'lblMarketPriceTolerance',
                    value: 'marketPriceTolerance'
                },
                {
                    id: instrumentInfoProps.ofSell,
                    available: true,
                    label: 'lblOFSell',
                    labelMobile: 'lblOFSell',
                    tooltip: 'txtShortOvernightFinancingInfo',
                    attrIdOfValue: 'lblovernightFinancingShort',
                    attrIdOfValueMobile: 'lblovernightFinancingShort',
                    value: 'overnightFinancingShort'
                },
                {
                    id: instrumentInfoProps.ofBuy,
                    available: true,
                    label: 'lblOFBuy',
                    labelMobile: 'lblOFBuy',
                    tooltip: 'txtLongOvernightFinancingInfo',
                    attrIdOfValue: 'lblovernightFinancingLong',
                    attrIdOfValueMobile: 'lblovernightFinancingLong',
                    value: 'overnightFinancingLong'
                },
                {
                    id: instrumentInfoProps.ofPercentageSell,
                    available: true,
                    label: 'lblOFPercentageSell',
                    labelMobile: 'lblOFPercentageSell',
                    tooltip: 'txtOvernightFinancingPercent',
                    attrIdOfValue: 'lblOFPercentageSell',
                    attrIdOfValueMobile: 'lblOFPercentageSell',
                    value: 'overnightFinancingPercentageSell'
                },
                {
                    id: instrumentInfoProps.ofPercentageBuy,
                    available: true,
                    label: 'lblOFPercentageBuy',
                    labelMobile: 'lblOFPercentageBuy',
                    tooltip: 'txtOvernightFinancingPercent',
                    attrIdOfValue: 'lblOFPercentageBuy',
                    attrIdOfValueMobile: 'lblOFPercentageBuy',
                    value: 'overnightFinancingPercentageBuy'
                },
                {
                    id: instrumentInfoProps.overnightFinancingGMT,
                    available: true,
                    label: 'lblOvernightFinancingGMT',
                    labelMobile: 'lblOvernightFinancingGMT',
                    tooltip: null,
                    attrIdOfValue: 'lblOFGMT',
                    attrIdOfValueMobile: 'lblOvernightFinancingGMT',
                    value: 'overnightFinancingTimeGMT'
                },
                {
                    id: instrumentInfoProps.weekendFinancing,
                    available: true,
                    label: 'lblWeekendFinancing',
                    labelMobile: 'lblWeekendFinancing',
                    tooltip: null,
                    attrIdOfValue: '',
                    attrIdOfValueMobile: '',
                    value: ''
                },
                {
                    id: instrumentInfoProps.rolloverDate,
                    available: true,
                    label: 'lblRolloverDate',
                    labelMobile: 'lblRolloverDate',
                    tooltip: null,
                    attrIdOfValue: 'lblRolloverDate',
                    attrIdOfValueMobile: 'lblRolloverDate',
                    value: 'rolloverDate'
                },
                {
                    id: instrumentInfoProps.dividendDate,
                    available: true,
                    label: 'lblDividendDate',
                    labelMobile: 'lblDividendDate',
                    tooltip: null,
                    attrIdOfValue: 'lblDividendDate',
                    attrIdOfValueMobile: 'lblDividendDate',
                    value: 'dividendDate'
                },
                {
                    id: instrumentInfoProps.dividendAmount,
                    available: true,
                    label: 'lblDividendAmount',
                    labelMobile: 'lblDividendAmount',
                    tooltip: null,
                    attrIdOfValue: 'lblDividendAmount',
                    attrIdOfValueMobile: 'lblDividendAmount',
                    value: 'dividendAmount'
                }
            ];

        function getInfoLines(instrumentData, instrumentInfoViewModelData) {
            var result = [];

            instrument = instrumentData;
            data = instrumentInfoViewModelData;

            instrumentInfoConfig.forEach(function forEachInfoLine(item) {
                var infoLine = parseInfo(item);
                if (infoLine.available) {
                    result.push(infoLine);
                }
            });

            return result;
        }

        function parseInfo(item) {
            var infoProps = instrumentInfoProps,
                tooltipConfig = { tooltipClass: 'tooltip tooltipBottom', position: { my: 'center bottom-18', at: 'center center' } },
                resource = 'deals_InstrumentInfoTool',
                infoLine = {
                    id: item.id,
                    available: item.available,
                    attr: setValueMarkupAttributes(item),
                    computedLabel: false,
                    resourceName: resource,
                    label: item.label,
                    labelm: item.labelMobile,
                    value: '',
                    tooltip: item.tooltip ? dictionary.GetItem(item.tooltip, resource) : null,
                    tooltipConfig: tooltipConfig,
                };

            switch (item.id) {
                case infoProps.pipWorth:
                    infoLine.value = Format.toNumberWithCurrency(data[item.value](), { currencyId: data.customerSymbolId() });
                    break;

                case infoProps.offHoursRequiredMargin:
                    infoLine.available = infoLine.available && data.displayOffHoursRequiredMargin();
                    infoLine.value = data[item.value]();
                    break;

                case infoProps.maxDealAmount:
                case infoProps.minDealAmount:
                    var round = item.id === infoProps.minDealAmount ? Math.ceil : Math.floor;
                    infoLine.label = data[item.label]();
                    infoLine.labelm = data[item.label]();
                    infoLine.computedLabel = true;
                    infoLine.value = !data.isStock() ? data[item.value]() : general.formatNumberWithThousandsSeparator(round(general.toNumeric(data[item.value]())));
                    break;

                case infoProps.ofSell:
                case infoProps.ofBuy:
                    infoLine.available = infoLine.available && !data.isStock() && data.isNotIslamicDealPermit &&
                        instrument.isOvernightFinancing();
                    infoLine.value = Format.toNumberWithCurrency(data[item.value](), { currencyId: data.customerSymbolId() });
                    break;

                case infoProps.ofPercentageSell:
                case infoProps.ofPercentageBuy:
                case infoProps.overnightFinancingGMT:
                    infoLine.available = infoLine.available && !data.isStock() && data.isNotIslamicDealPermit &&
                        instrument.isOvernightFinancing();
                    infoLine.value = data[item.value]();
                    break;

                case infoProps.rolloverDate:
                    infoLine.available = infoLine.available && instrument.isFuture && data.rolloverDate();
                    infoLine.value = data[item.value]();
                    break;

                case infoProps.dividendDate:
                    infoLine.available = infoLine.available && instrument.isShare && data.dividendDate();
                    infoLine.value = data[item.value]();
                    break;

                case infoProps.dividendAmount:
                    infoLine.available = infoLine.available && instrument.isShare && data.dividendDate() && data.dividendAmount();
                    infoLine.value = Format.toNumberWithCurrency(data[item.value](), { currencyId: data.otherInstrumentSymbol() });
                    break;

                case infoProps.weekendFinancing:
                    infoLine.available = infoLine.available && !data.isStock() && data.weekendFinancingType() != eWeekendFinancingTypes.None && data.isNotIslamicDealPermit;
                    if (!infoLine.available) {
                        return infoLine;
                    }

                    var valueKey = data.weekendFinancingType() == eWeekendFinancingTypes.Thursday ?
                        'txtThursday' : (
                            data.weekendFinancingType() == eWeekendFinancingTypes.Friday ? 'txtFriday' : null
                        ),
                        dataAutomation = data.weekendFinancingType() == eWeekendFinancingTypes.Thursday ?
                            'lblWeekendFinancingThursday' : (
                                data.weekendFinancingType() == eWeekendFinancingTypes.Friday ? 'lblWeekendFinancingFriday' : null
                            );

                    if (dataAutomation) {
                        infoLine.attr['dataAutomation'] = dataAutomation;
                    }

                    infoLine.value = valueKey ? dictionary.GetItem(valueKey, resource, '') : '';
                    break;

                default:
                    infoLine.value = data[item.value]();
                    break;
            }

            return infoLine;
        }

        function setValueMarkupAttributes(item) {
            var attributes = {};

            if (item.attrIdOfValue) {
                attributes['id'] = item.attrIdOfValue;
            }

            if (item.attrIdOfValueMobile) {
                attributes['idm'] = item.attrIdOfValueMobile;
            }

            return attributes;
        }

        return {
            GetInfoLines: getInfoLines
        };
    }
);