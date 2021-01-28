define(
    'FxNet/Common/Constants/Collections/PresetsDefinitions',
    [
        'enums/enums'
    ],
    function () {
        var subCategories = {
            Display: {
                label: "lblDisplay",
                order: 0,
                columnId: 0
            },
            CrossRates: {
                label: "lblCrossRates",
                order: 1,
                columnId: 0
            },
            Group: {
                label: "lblGroup",
                order: 2,
                columnId: 0
            },
            Region: {
                label: "lblRegion",
                order: 3,
                columnId: 0
            },
            Americas: {
                label: "lblAmericas",
                order: 4,
                sortAlphabetically: true,
                columnId: 0
            },
            APAC: {
                label: "lblAPAC",
                order: 5,
                sortAlphabetically: true,
                columnId: 0
            },
            EMEA: {
                label: "lblEMEA",
                order: 6,
                sortAlphabetically: true,
                columnId: 1
            },
            Assets: {
                label: "lblAssets",
                order: 7,
                columnId: 0
            }
        };

        return [
            {
                presets: {
                    PresetCustomized: { id: 0, subCategory: subCategories.Display },
                    PresetMostPopular: { id: 2, subCategory: subCategories.Display },
                    PresetMostPopularWithoutFutures: { id: 1, subCategory: subCategories.Display },
                    PresetMostPopularWithoutShares: { id: 18, subCategory: subCategories.Display },
                    PresetMostPopularWithoutFuturesWithoutShares: { id: 19, subCategory: subCategories.Display },
                    PresetNewReleases: { id: 136, subCategory: subCategories.Display },
                    PresetNewReleasesNoFutures: { id: 137, subCategory: subCategories.Display },
                    PresetNewReleasesNoShares: { id: 138, subCategory: subCategories.Display },
                    PresetNewReleasesNoSharesNoFutures: { id: 139, subCategory: subCategories.Display },
                    MainHot: { id: 80, subCategory: subCategories.Display },
                    MainHot_NoShares: { id: 83, subCategory: subCategories.Display },
                    MainHot_NoSharesNoFutures: { id: 84, subCategory: subCategories.Display },
                    MainTopGainers: { id: 85, subCategory: subCategories.Display },
                    MainTopGainers_NoShares: { id: 88, subCategory: subCategories.Display },
                    MainTopGainers_NoSharesNoFuture: { id: 89, subCategory: subCategories.Display },
                    MainTopLosers: { id: 90, subCategory: subCategories.Display },
                    MainTopLosers_NoShares: { id: 93, subCategory: subCategories.Display },
                    MainTopLosers_NoSharesNoFutures: { id: 94, subCategory: subCategories.Display },
                    MainHot_NoFutures: { id: 101, subCategory: subCategories.Display },
                    MainTopGainers_NoFutures: { id: 102, subCategory: subCategories.Display },
                    MainTopLosers_NoFutures: { id: 103, subCategory: subCategories.Display }
                },
                ascOrderPresetIds: [90, 93, 94, 103],
                descOrderPresetIds: [85, 88, 89, 102],
                categoryName: "PresetMainTab",
                presetOrder: 0,
                sortPresetsAlphabetically: false,
                instrumentType: eInstrumentType.Mixed,
                searchPresetIds: []
            },
            {
                presets: {
                    PresetMostPopularCurrencies: { id: 3, subCategory: subCategories.Display },
                    CurrenciesHot: { id: 81, subCategory: subCategories.Display },
                    CurrenciesTopGainers: { id: 86, subCategory: subCategories.Display },
                    CurrenciesTopLosers: { id: 91, subCategory: subCategories.Display },
                    PresetUsdCurrencies: { id: 4, subCategory: subCategories.CrossRates },
                    PresetEurCurrencies: { id: 5, subCategory: subCategories.CrossRates },
                    PresetGbpCurrencies: { id: 6, subCategory: subCategories.CrossRates },
                    PresetJpyCurrencies: { id: 7, subCategory: subCategories.CrossRates },
                    PresetOtherCurrencies: { id: 8, subCategory: subCategories.CrossRates }
                },
                ascOrderPresetIds: [91],
                descOrderPresetIds: [86],
                categoryName: "PresetCurrenciesTab",
                presetOrder: 1,
                sortPresetsAlphabetically: false,
                instrumentType: eInstrumentType.Currencies,
                searchPresetIds: [4, 5, 6, 7, 8]
            },
            {
                presets: {
                    PresetCommodities: { id: 9, subCategory: subCategories.Display },
                    PresetCommoditiesWithoutFutures: { id: 10, subCategory: subCategories.Display },
                    CommoditiesHot: { id: 95, subCategory: subCategories.Display },
                    CommoditiesTopGainers: { id: 96, subCategory: subCategories.Display },
                    CommoditiesTopLosers: { id: 97, subCategory: subCategories.Display },
                    PresetCommoditiesAgricultural: { id: 24, subCategory: subCategories.Group },
                    PresetCommoditiesEnergy: { id: 25, subCategory: subCategories.Group },
                    PresetCommoditiesMetals: { id: 26, subCategory: subCategories.Group }
                },
                ascOrderPresetIds: [97],
                descOrderPresetIds: [96],
                categoryName: "PresetCommoditiesTab",
                presetOrder: 2,
                sortPresetsAlphabetically: false,
                instrumentType: eInstrumentType.Commodities,
                searchPresetIds: [10, 24, 25, 26]
            },
            {
                presets: {
                    IndiciesMostPopular_NoShares: { id: 11, subCategory: subCategories.Display },
                    IndicesHot_NoShares: { id: 98, subCategory: subCategories.Display },
                    IndicesTopGainers_NoShares: { id: 99, subCategory: subCategories.Display },
                    IndicesTopLosers_NoShares: { id: 100, subCategory: subCategories.Display },
                    IndicesEMEA_NoShares: { id: 27, subCategory: subCategories.Display },
                    IndicesNorthAmericas_NoShares: { id: 28, subCategory: subCategories.Display },
                    IndicesOther_NoShares: { id: 29, subCategory: subCategories.Display },
                    IndicesMostPopular: { id: 113, subCategory: subCategories.Display },
                    IndicesHot: { id: 114, subCategory: subCategories.Display },
                    IndicesTopGainers: { id: 115, subCategory: subCategories.Display },
                    IndicesTopLosers: { id: 116, subCategory: subCategories.Display },
                    IndicesNorthAmericas: { id: 118, subCategory: subCategories.Region },
                    IndicesOther: { id: 119, subCategory: subCategories.Region },
                    IndicesEMEA: { id: 117, subCategory: subCategories.Region }
                },
                ascOrderPresetIds: [100, 116],
                descOrderPresetIds: [99, 115],
                categoryName: "PresetIndicesTab",
                presetOrder: 3,
                sortPresetsAlphabetically: false,
                instrumentType: eInstrumentType.Indices,
                searchPresetIds: [27, 28, 29, 117, 118, 119]
            },
            {
                presets: {
                    PresetShares: { id: 12, subCategory: subCategories.Display },
                    SharesHot: { id: 82, subCategory: subCategories.Display },
                    SharesTopGainers: { id: 87, subCategory: subCategories.Display },
                    SharesTopLosers: { id: 92, subCategory: subCategories.Display },
                    PresetSharesUS: { id: 13, subCategory: subCategories.Americas },
                    PresetSharesUK: { id: 20, subCategory: subCategories.EMEA },
                    PresetSharesJapan: { id: 22, subCategory: subCategories.APAC },
                    PresetSharesHongKong: { id: 125, subCategory: subCategories.APAC },
                    PresetSharesGermany: { id: 15, subCategory: subCategories.EMEA },
                    PresetSharesFrance: { id: 21, subCategory: subCategories.EMEA },
                    PresetSharesIndia: { id: 140, subCategory: subCategories.APAC },
                    PresetSharesItaly: { id: 17, subCategory: subCategories.EMEA },
                    PresetSharesNetherlands: { id: 31, subCategory: subCategories.EMEA },
                    PresetSharesAustralia: { id: 126, subCategory: subCategories.APAC },
                    PresetSharesSouthCorea: { id: 30, subCategory: subCategories.APAC },
                    PresetsSharesSaudiArabia: { id: 135, subCategory: subCategories.EMEA },
                    PresetSharesSpain: { id: 16, subCategory: subCategories.EMEA },
                    PresetSharesRussia: { id: 23, subCategory: subCategories.EMEA },
                    PresetSharesMexico: { id: 127, subCategory: subCategories.Americas },
                    PresetSharesSwitzerland: { id: 32, subCategory: subCategories.EMEA },
                    PresetSharesSweden: { id: 33, subCategory: subCategories.EMEA },
                    PresetSharesPoland: { id: 128, subCategory: subCategories.EMEA },
                    PresetSharesFinland: { id: 132, subCategory: subCategories.EMEA },
                    PresetSharesGreece: { id: 129, subCategory: subCategories.EMEA },
                    PresetSharesCzechRepublic: { id: 130, subCategory: subCategories.EMEA },
                    PresetSharesHungary: { id: 131, subCategory: subCategories.EMEA }
                },
                ascOrderPresetIds: [92],
                descOrderPresetIds: [87],
                categoryName: "PresetSharesTab",
                presetOrder: 4,
                sortPresetsAlphabetically: true,
                instrumentType: eInstrumentType.Shares,
                searchPresetIds: [13, 20, 22, 125, 15, 21, 140, 17, 31, 126, 30, 135, 16, 23, 127, 32, 33, 128, 132, 129, 130, 131]
            },
            {
                presets: {
                    StocksMostPopular: { id: 141, subCategory: subCategories.Display }
                },
                categoryName: "PresetStocksTab",
                presetOrder: 5,
                instrumentType: eInstrumentType.Stocks,
                ascOrderPresetIds: [],
                descOrderPresetIds: [],
                searchPresetIds: [141]
            },
            {
                presets: {
                    ETFMostPopular: { id: 104, subCategory: subCategories.Display },
                    ETFHot: { id: 105, subCategory: subCategories.Display },
                    ETFTopGainers: { id: 106, subCategory: subCategories.Display },
                    ETFTopLosers: { id: 107, subCategory: subCategories.Display },
                    ETFCommodities: { id: 108, subCategory: subCategories.Assets },
                    ETFEquityCountries: { id: 109, subCategory: subCategories.Assets },
                    ETFEquityIndices: { id: 110, subCategory: subCategories.Assets },
                    ETFEquitySectors: { id: 111, subCategory: subCategories.Assets },
                    ETFFixedIncome: { id: 112, subCategory: subCategories.Assets }
                },
                ascOrderPresetIds: [107],
                descOrderPresetIds: [106],
                categoryName: "PresetETFTab",
                presetOrder: 6,
                instrumentType: eInstrumentType.ETF,
                searchPresetIds: [108, 109, 110, 111, 112]
            },
            {
                presets: {
                    CryptoMostPopular: { id: 120, subCategory: subCategories.Display },
                    CryptoHot: { id: 121, subCategory: subCategories.Display },
                    CryptoTopGainers: { id: 122, subCategory: subCategories.Display },
                    CryptoTopLosers: { id: 123, subCategory: subCategories.Display },
                    CryptoCurrencies: { id: 124, subCategory: subCategories.Display }
                },
                ascOrderPresetIds: [123],
                descOrderPresetIds: [122],
                categoryName: "PresetCryptoTab",
                presetOrder: 7,
                instrumentType: eInstrumentType.Crypto,
                searchPresetIds: [124]
            }
        ];
    }
);
