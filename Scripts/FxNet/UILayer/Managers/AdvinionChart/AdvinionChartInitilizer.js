define(
    'managers/AdvinionChart/AdvinionChartInitilizer',
    [
        'require',
        'handlers/general',
        'global/UrlResolver',
        'modules/ThemeSettings',
        'enums/enums'
    ],
    function (require) {
        var general = require('handlers/general'),
            UrlResolver = require('global/UrlResolver'),
            ThemeSettings = require('modules/ThemeSettings');

        var AdvinionChartInitializer = function () {
            var colors = {
                    white: 'rgba(255,255,255,1)',
                    grey: 'rgba(85, 85, 85,1)',
                    transparentGray: 'rgba(247,247,247,0.8)',
                    transparentWhite: 'rgba(255,255,255,0.8)',
                    transparent: 'rgba(0,0,0,0)',
                    black: 'rgba(0,0,0,1)'
                },
                horizontalLineSolidStyle = [],
                horizontalLineMargin = [2, 0, 0, 0],
                horizontalLineWidth = 1,
                horizontalLineLabelBackground = colors.transparent,
                horizontalLineLabelFont = '10px Verdana',
                horizontalLineLabelAlignment = 'left',
                horizontalLineLabelLeftPadding = 2,
                priceLines = {};

            priceLines[eChartPriceLineType.CurrentRate] = {
                panelId: 'price',
                lineColor: 'rgba(3,165,217,1)',
                lineWidth: horizontalLineWidth,
                dashStyle: horizontalLineSolidStyle,
                labelColor: 'rgba(0,184,240,1)',
                labelfont: horizontalLineLabelFont,
                labelAlignment: horizontalLineLabelAlignment,
                horizontalPadding: horizontalLineLabelLeftPadding,
                margin: horizontalLineMargin,
                inPriceRange: false,
                labelBackgroundColor: horizontalLineLabelBackground,
                boxColor: 'rgba(0,183,241,1)',
                boxTextColor: colors.white,
                allowDragLine: false
            };

            priceLines[eChartPriceLineType.LimitLevel] = {
                panelId: 'price',
                lineColor: 'rgba(150,150,150,1)',
                lineWidth: horizontalLineWidth,
                dashStyle: horizontalLineSolidStyle,
                labelColor: 'rgba(150,150,150,1)',
                labelfont: horizontalLineLabelFont,
                labelAlignment: horizontalLineLabelAlignment,
                horizontalPadding: horizontalLineLabelLeftPadding,
                margin: horizontalLineMargin,
                inPriceRange: false,
                labelBackgroundColor: horizontalLineLabelBackground,
                boxColor: 'rgba(150,150,150,1)',
                boxTextColor: colors.white,
                allowDragLine: true
            };

            priceLines[eChartPriceLineType.StopLoss] = {
                panelId: 'price',
                lineColor: 'rgba(246,87,86,1)',
                lineWidth: horizontalLineWidth,
                dashStyle: horizontalLineSolidStyle,
                labelColor: 'rgba(246,87,86,1)',
                labelfont: horizontalLineLabelFont,
                labelAlignment: horizontalLineLabelAlignment,
                horizontalPadding: horizontalLineLabelLeftPadding,
                margin: horizontalLineMargin,
                inPriceRange: false,
                labelBackgroundColor: horizontalLineLabelBackground,
                boxColor: 'rgba(251,138,142,1)',
                boxTextColor: colors.black,
                allowDragLine: true
            };

            priceLines[eChartPriceLineType.TakeProfit] = {
                panelId: 'price',
                lineColor: 'rgba(93,185,92,1)',
                lineWidth: horizontalLineWidth,
                dashStyle: horizontalLineSolidStyle,
                labelColor: 'rgba(93,185,92,1)',
                labelfont: horizontalLineLabelFont,
                labelAlignment: horizontalLineLabelAlignment,
                horizontalPadding: horizontalLineLabelLeftPadding,
                margin: horizontalLineMargin,
                inPriceRange: false,
                labelBackgroundColor: horizontalLineLabelBackground,
                boxColor: 'rgba(172,224,133,1)',
                boxTextColor: colors.black,
                allowDragLine: true
            };

            priceLines[eChartPriceLineType.OpenRate] = {
                panelId: 'price',
                lineColor: 'rgba(150,150,150,1)',
                lineWidth: horizontalLineWidth,
                dashStyle: horizontalLineSolidStyle,
                labelColor: 'rgba(150,150,150,1)',
                labelfont: horizontalLineLabelFont,
                labelAlignment: horizontalLineLabelAlignment,
                horizontalPadding: horizontalLineLabelLeftPadding,
                margin: horizontalLineMargin,
                inPriceRange: false,
                labelBackgroundColor: horizontalLineLabelBackground,
                boxColor: 'rgba(150,150,150,1)',
                boxTextColor: colors.white,
                allowDragLine: false
            };

            priceLines[eChartPriceLineType.PriceAlertRate] = {
                panelId: 'price',
                lineColor: 'rgba(150,150,150,1)',
                lineWidth: horizontalLineWidth,
                dashStyle: horizontalLineSolidStyle,
                labelColor: 'rgba(150,150,150,1)',
                labelfont: horizontalLineLabelFont,
                labelAlignment: horizontalLineLabelAlignment,
                horizontalPadding: horizontalLineLabelLeftPadding,
                margin: horizontalLineMargin,
                inPriceRange: false,
                labelBackgroundColor: horizontalLineLabelBackground,
                boxColor: 'rgba(150,150,150,1)',
                boxTextColor: colors.white,
                allowDragLine: true
            };

            var advinionChartInitConfiguration = {
                rootPath: UrlResolver.getStaticJSPath('Scripts/AdvinionChartCustomizations'),
                dataFeedSettings: {
                    instrumentsNumber: 10,
                    comparisonInstrumentsNumber: 10,
                    requestTimeout: 500,
                    searchInstrumentsNumber: 1000,
                    TickMinutes: '2',
                    RateValueMode: 'mid'
                },
                studySettings: [
                    {
                        propertyPath: ['rsi', 'renderitem1', 'drawtype'],
                        value: 'line'
                    }
                ],
                dateFormatSettings: {
                    realtime: 'DD/MM/YYYY HH:mm:ss',
                    minutes: 'DD/MM/YYYY HH:mm:ss',
                    hours: 'DD/MM/YYYY HH:mm:ss',
                    eod: 'DD/MM/YYYY',
                    datebarYear: 'YYYY',
                    datebarMonthDay: 'DD/MM/YYYY',
                    datebarDay: 'DD',
                    datebarFull: 'DD/MM/YYYY',
                    datebarHoursMinutes: 'HH:mm',
                    datebarMonth: 'MM',
                    datebarHoursMinutesSeconds: 'HH:mm:ss'
                },
                priceLines: priceLines,
                getPriceBoxSettings: function (lineType, content) {
                    return [
                        'outOfRangeAxisMarker', true,
                        'outOfRangeBoxColor', priceLines[lineType].boxColor,
                        'outOfRangeTextColor', priceLines[lineType].boxTextColor,
                        'outOfRangeLabel', content,
                        'boxColor', priceLines[lineType].boxColor,
                        'boxTextColor', priceLines[lineType].boxTextColor
                    ];
                },
                languages: [
                    { id: 'ar', name: 'العربية', dir: 'rtl' },
                    { id: 'he', name: 'עברית', dir: 'rtl' },
                    { id: 'it', name: 'Italiano', dir: 'ltr' },
                    { id: 'fr', name: 'Français', dir: 'ltr' },
                    { id: 'ru', name: 'Русский', dir: 'ltr' },
                    { id: 'pt', name: 'Português', dir: 'ltr' },
                    { id: 'nl', name: 'Nederlands', dir: 'ltr' },
                    { id: 'es', name: 'Español', dir: 'ltr' },
                    { id: 'tr', name: 'Türk', dir: 'ltr' },
                    { id: 'ja', name: '日本人', dir: 'ltr' },
                    { id: 'de', name: 'Deutsch', dir: 'ltr' },
                    { id: 'pl', name: 'Polski', dir: 'ltr' },
                    { id: 'gr', name: 'ελληνικά', dir: 'ltr' },
                    { id: 'ro', name: 'Română', dir: 'ltr' },
                    { id: 'en', name: 'English', dir: 'ltr' },
                    { id: 'zh', name: '中文', dir: 'ltr' },
                    { id: 'cs', name: 'Čeština', dir: 'ltr' },
                    { id: 'hu', name: 'Magyar', dir: 'ltr' },
                    { id: 'id', name: 'Bahasa Indonesia', dir: 'ltr' },
                    { id: 'ms', name: 'Bahasa Melayu', dir: 'ltr' },
                    { id: 'sv', name: 'Svenska', dir: 'ltr' },
                    { id: 'tl', name: 'Filipino', dir: 'ltr' },
                    { id: 'hi', name: 'हिंदी', dir: 'ltr' },
                    { id: 'ko', name: '한국어', dir: 'ltr' },
                    { id: 'th', name: 'ไทย', dir: 'ltr' }
                ],
                timeframes: [
                    { n: 'tick', id: eChartTimeFramesIds.tick, f: 1, t1: 't', t2: '' },
                    { n: '1 Minute', id: eChartTimeFramesIds['1 Minute'], f: 1, t1: '1', t2: 'm' },
                    { n: '5 Minutes', id: eChartTimeFramesIds['5 Mintes'], f: 1, t1: '5', t2: 'm' },
                    { n: '10 Minutes', id: eChartTimeFramesIds['10 Minutes'], f: 1, t1: '10', t2: 'm' },
                    { n: '15 Minutes', id: eChartTimeFramesIds['15 Minutes'], f: 1, t1: '15', t2: 'm' },
                    { n: '30 Minutes', id: eChartTimeFramesIds['30 Minutes'], f: 1, t1: '30', t2: 'm' },
                    { n: '1 Hour', id: eChartTimeFramesIds['1 Hour'], f: 1, t1: '1', t2: 'h' },
                    { n: '2 Hours', id: eChartTimeFramesIds['2 Hours'], f: 1, t1: '2', t2: 'h' },
                    { n: '4 Hours', id: eChartTimeFramesIds['4 Hours'], f: 1, t1: '4', t2: 'h' },
                    { n: '5 Hours', id: eChartTimeFramesIds['5 Hours'], f: 1, t1: '5', t2: 'h' },
                    { n: '6 Hours', id: eChartTimeFramesIds['6 Hours'], f: 1, t1: '6', t2: 'h' },
                    { n: '7 Hours', id: eChartTimeFramesIds['7 Hours'], f: 1, t1: '7', t2: 'h' },
                    { n: '8 Hours', id: eChartTimeFramesIds['8 Hours'], f: 1, t1: '8', t2: 'h' },
                    { n: '9 Hours', id: eChartTimeFramesIds['9 Hours'], f: 1, t1: '9', t2: 'h' },
                    { n: '10 Hours', id: eChartTimeFramesIds['10 Hours'], f: 1, t1: '10', t2: 'h' },
                    { n: '12 Hours', id: eChartTimeFramesIds['12 Hours'], f: 1, t1: '12', t2: 'h' },
                    { n: '14 Hours', id: eChartTimeFramesIds['14 Hours'], f: 1, t1: '14', t2: 'h' },
                    { n: '1 Day', id: eChartTimeFramesIds['1 Day'], f: 1, t1: 'D', t2: '' },
                    { n: '1 Week', id: eChartTimeFramesIds['1 Week'], f: 1, t1: 'W', t2: '' },
                    { n: '1 Month', id: eChartTimeFramesIds['1 Month'], f: 1, t1: 'M', t2: '' },
                    { n: '3 Months', id: eChartTimeFramesIds['3 Months'], f: 1, t1: '3', t2: 'M' },
                    { n: '6 Months', id: eChartTimeFramesIds['6 Months'], f: 1, t1: '6', t2: 'M' },
                    { n: '1 Year', id: eChartTimeFramesIds['1 Year'], f: 1, t1: 'Y', t2: '' }
                ]
            };

            function getChartNewDealSlipSettings(startArgs) {
                var selectedTheme = ThemeSettings.GetTheme(),
                    startSettings = {
                        isMobile: function () {
                            return false;
                        },
                        ChartLayoutContainer: '#dealChartContainer',
                        ParentRelativeObjectID: 'dealChartContainer',
                        Template: (selectedTheme === 'light' ? eChartCustomTemplates.web : eChartCustomTemplates.webDark) +
                            UrlResolver.getDefaultBroker(),
                        Layout: 'layout99',
                        CustomLayoutFile: 'ChartUI/LayoutScripts/webNewDealSlipLayout.js',
                        SelectedInstrumentId: startArgs.instrumentId,
                        OrderDirection: startArgs.orderDir,
                        chart: {
                            DefaultTimeScale: eChartTimeFramesIds['1 Minute'],
                            DynWick: true,
                            LegendOnlyWithCrosshair: false,
                            ShowBarData: 'true',
                            PriceChartType: 'candlesticks',
                            WaterMark: false,
                            TimeZone: 0,
                            ExtraData: eChartTimeFramesIds['5 Mintes'],
                            LineLastCloseMarkRadius: 0,
                            AlignToLeft: false,
                            MaximumBars: 500,
                            HistoryCandlesCount: 500,
                            NumberOfVisibleBars: 100,
                            TwoFingersPriceSlide: null
                        },
                        actions: {
                            showMajors: true,
                            showCompares: true,
                            setLastUpdateEvent: false,
                            enableShowUserPosition: false,
                            setOpenOptionToolbar: false,
                            isExpirationRequired: false
                        },
                        appiinit_indicators: [],
                        tracking: {
                            eventName: startArgs.tracking.eventName
                        },
                        events: {
                            onDialogAddStudy: general.emptyFn
                        },
                        api: {
                            props: {
                                chart: {
                                    gui: {
                                        zoom: {
                                            interval_font_color: selectedTheme === 'dark' ? colors.grey : colors.black
                                        }
                                    }
                                }
                            }
                        }
                    };

                startSettings = Object.assign({}, advinionChartInitConfiguration, startSettings);

                startSettings.priceLines[eChartPriceLineType.StopLoss].boxTextColor =
                    selectedTheme === 'dark' ? colors.white : colors.black;
                startSettings.priceLines[eChartPriceLineType.TakeProfit].boxTextColor =
                    selectedTheme === 'dark' ? colors.white : colors.black;

                return startSettings;
            }

            function getChartNewDealSlipMobileSettings(startArgs) {
                var selectedTheme = ThemeSettings.GetTheme(),
                    startSettings = {
                        isMobile: function () {
                            return true;
                        },
                        enableCrosshairMode: true,
                        ChartLayoutContainer: '#chartContainer',
                        ParentRelativeObjectID: 'chartContainer',
                        Template: (selectedTheme === 'light' ? eChartCustomTemplates.mobile : eChartCustomTemplates.mobileDark) +
                            UrlResolver.getDefaultBroker(),
                        Layout: 'layout99',
                        CustomLayoutFile: 'ChartUI/LayoutScripts/mobileNewDealSlipLayout.js',
                        SelectedInstrumentId: startArgs.instrumentId,
                        OrderDirection: startArgs.orderDir,
                        chart: {
                            DefaultTimeScale: eChartTimeFramesIds['1 Minute'],
                            DynWick: true,
                            LegendOnlyWithCrosshair: true,
                            ShowBarData: 'true',
                            PriceChartType: 'candlesticks',
                            WaterMark: false,
                            TimeZone: 0,
                            ExtraData: eChartTimeFramesIds['5 Mintes'],
                            LineLastCloseMarkRadius: 0,
                            AlignToLeft: false,
                            MaximumBars: 500,
                            HistoryCandlesCount: 500,
                            NumberOfVisibleBars: 100,
                            TwoFingersPriceSlide: true
                        },
                        actions: {
                            showMajors: true,
                            showCompares: true,
                            setLastUpdateEvent: false,
                            enableShowUserPosition: false,
                            setOpenOptionToolbar: false,
                            isExpirationRequired: false
                        },
                        appiinit_indicators: [],
                        tracking: {
                            eventName: 'deal-slip-chart-interaction'
                        },
                        events: {
                            onDialogAddStudy: function onDialogAddStudyImpl(studyName, jqDialogContentElement) {
                                if (jqDialogContentElement) {
                                    jqDialogContentElement.dialog('close');
                                }
                            }
                        },
                        api: {
                            props: {
                                chart: {
                                    gui: {
                                        zoom: {
                                            interval_font_size: 11,
                                            interval_font_bold: false,
                                            interval_font_color: selectedTheme === 'dark' ? colors.grey : colors.black
                                        }
                                    }
                                }
                            }
                        }
                    };

                startSettings = Object.assign({}, advinionChartInitConfiguration, startSettings);

                startSettings.priceLines[eChartPriceLineType.CurrentRate].labelBackgroundColor = colors.transparent;
                startSettings.priceLines[eChartPriceLineType.StopLoss].boxTextColor =
                    selectedTheme === 'dark' ? colors.white : colors.black;
                startSettings.priceLines[eChartPriceLineType.TakeProfit].boxTextColor =
                    selectedTheme === 'dark' ? colors.white : colors.black;

                return startSettings;
            }

            function getStartSettings(instanceType, startArgs) {
                var set = null;

                switch (instanceType) {
                    case eChartInstanceType.newDealSlip:
                        set = getChartNewDealSlipSettings(startArgs);
                        break;

                    case eChartInstanceType.newDealMobile:
                        set = getChartNewDealSlipMobileSettings(startArgs);
                        break;

                    default:
                        ErrorManager.onError(
                            '/AdvinionChartInitializer',
                            'Invalid chart type for the start settings',
                            eErrorSeverity.high
                        );
                        break;
                }

                return set;
            }

            return {
                getStartSettings: getStartSettings
            };
        };

        return new AdvinionChartInitializer();
    }
);
