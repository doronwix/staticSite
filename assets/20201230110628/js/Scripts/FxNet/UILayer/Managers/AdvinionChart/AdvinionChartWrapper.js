/* global eResourcesNames */
define(
    'managers/AdvinionChart/AdvinionChartWrapper',
    [
        'require',
        'knockout',
        'helpers/KoComponentViewModel',
        'Q',
        'managers/AdvinionChart/AdvinionChartsManager',
        'managers/AdvinionChart/AdvinionChartInitilizer',
        'managers/AdvinionChart/AdvinionLanguagesMapper',
        'managers/AdvinionChart/TradingChartsManager',
        'managers/ChartStudySettings',
        'managers/ChartZoomSettingsManager',
        'managers/ChartLayoutSettings',
        'Dictionary',
        'generalmanagers/RegistrationManager',
        'managers/instrumentTranslationsManager',
        'LoadDictionaryContent!charts_resources',
        'handlers/Logger',
        'StateObject!Transaction',
        'initdatamanagers/InstrumentsManager',
        'AdvinionChartCustomizations/ChartSignals/tc/pivot.lib',
        'initdatamanagers/Customer',
        'handlers/Cookie',
        'handlers/general',
        "configuration/initconfiguration",
        'global/debounce'
    ],
    function (require) {
        var ko = require('knockout'),
            koComponentViewModel = require('helpers/KoComponentViewModel'),
            Q = require('Q'),
            advinionChartsManager = require('managers/AdvinionChart/AdvinionChartsManager'),
            advinionChartInitializer = require('managers/AdvinionChart/AdvinionChartInitilizer'),
            advinionLanguagesMapper = require('managers/AdvinionChart/AdvinionLanguagesMapper'),
            tradingChartsManager = require('managers/AdvinionChart/TradingChartsManager'),
            chartStudySettings = require('managers/ChartStudySettings'),
            chartLayoutSettings = require('managers/ChartLayoutSettings'),
            chartZoomSettingsManager = require('managers/ChartZoomSettingsManager'),
            registrationManager = require('generalmanagers/RegistrationManager'),
            instrumentTranslationsManager = require('managers/instrumentTranslationsManager'),
            instrumentsManager = require('initdatamanagers/InstrumentsManager'),
            dictionary = require('Dictionary'),
            logger = require('handlers/Logger'),
            stateObject = require('StateObject!Transaction'),
            chartPivotLibrary = require('AdvinionChartCustomizations/ChartSignals/tc/pivot.lib'),
            customer = require('initdatamanagers/Customer'),
            cookieHandler = require('handlers/Cookie'),
            general = require('handlers/general'),
            advinionChartSettings = require("configuration/initconfiguration").AdvinionChartConfiguration,
            debounce = require("global/debounce"),
            jsPushRequestTypes = {
                GetRecentHistory: "GetRecentHistory",
                GetMultiRT: "GetMultiRT",
                GetSymbolsByGroup: "GetSymbolsByGroup",
                FindSymbols: "FindSymbols",
                GetHistoryByDates: "GetHistoryByDates"
            };

        chartStudySettings.Init();

        var AdvinionChartWrapper = general.extendClass(koComponentViewModel, function () {
            var self = this,
                parent = this.parent,                       // inherited from DealBaseViewModel
                data = this.Data,                           // inherited from DealBaseViewModel
                objChartMain = {},
                isChartLoadedDeferred = Q.defer(),
                isChartLoaded = isChartLoadedDeferred.promise,
                chartParams = {},
                extraInitComplete = null,
                extraCreateComplete = null,
                extraPreloadFinished = null,
                extraOnPriceLineDragged = null,
                chartZoomSettingsManagerInstance = null,
                previousCcyAskValues = {},
                guid = general.createGuid(),
                chartLoaderRejectReasons = {
                    chartDisposed: 'Chart disposed',
                    chartNotLoaded: 'Chart not loaded'
                },
                rejectedPromiseStateText = 'rejected';

            self.priceLines = {};

            chartLayoutSettings.Init();

            function onPromiseRejected() {
                //used on rejected promise on fail when don't want to do nothing
            }

            function init(customSettings) {
                var additionalStartArgs = customSettings.additionalStartArgs || {},
                    tcChartSignalsKey = 'tc-chart-signals' + additionalStartArgs.containerSuffix;
                
                data['tc-chart-signals'] = stateObject.set(tcChartSignalsKey, ko.observable({
                    disabled: true,
                    active: false
                }));

                parent.init.call(self, customSettings); // inherited from KoComponentViewModel

                chartZoomSettingsManagerInstance = new chartZoomSettingsManager(additionalStartArgs.containerSuffix);

                chartParams.additionalStartArgs = additionalStartArgs || {};
                chartParams.additionalStartArgs.isLoadingData = chartParams.additionalStartArgs.isLoadingData ||general.emptyFn;
                chartParams.startSettings = advinionChartInitializer.getStartSettings(customSettings.additionalStartArgs.instanceType, customSettings.additionalStartArgs);

                chartParams.startSettings.ChartLayoutContainer = chartParams.startSettings.ChartLayoutContainer + customSettings.additionalStartArgs.containerSuffix;
                chartParams.startSettings.ParentRelativeObjectID = chartParams.startSettings.ParentRelativeObjectID + customSettings.additionalStartArgs.containerSuffix;

                extraInitComplete = customSettings.onExtraInitComplete ||general.emptyFn;
                extraCreateComplete = customSettings.onExtraCreateComplete ||general.emptyFn;
                extraPreloadFinished = customSettings.onExtraPreloadFinished ||general.emptyFn;
                extraOnPriceLineDragged = customSettings.additionalStartArgs.onPriceLineDragged ||general.emptyFn;

                tradingChartsManager.subscribe(guid);

                if (!advinionChartsManager.IsChartManagerLoaded()) {
                    advinionChartsManager.Init(advinionChartSettings);
                }

                advinionChartsManager.IsLoaded
                    .then(tradingChartsManager.GetTimeScalesAsync)
                    .then(start)
                    .then(setSubscribers)
                    .fail(onFailWhileStarting)
                    .done();

                isChartLoaded
                    .then(getMajors)
                    .fail(onPromiseRejected)
                    .done();
            }

            function onFailWhileStarting() {
                logger.log("AdvinionChartWrapper", 'advinionChartsManager not loadded!', null, eErrorSeverity.critical);

                isChartLoadedDeferred.reject(chartLoaderRejectReasons.chartNotLoaded);
            }

            function start(timeframe) {
                ko.postbox.publish(eFxNetEvents.ChartInit);

                //Init the layout
                objChartMain = ProChart_InitLayout(chartParams.startSettings.ChartLayoutContainer, chartParams.startSettings.Layout, chartParams.startSettings.Template, general.isEmptyValue(chartParams.additionalStartArgs.containerSuffix) ? "singlechart-stationkey" : "fourcharts-stationkey", 1);

                // extra data may be to late here for the chart chartInstanceKey
                objChartMain.ExtraData = chartParams.ExtraData = {
                    startSettings: chartParams.startSettings,
                    additionalStartArgs: chartParams.additionalStartArgs,
                    historyCandlesCount: chartParams.startSettings.chart.HistoryCandlesCount
                };

                var userSavedChartSettings = getCustomerSavedChartSettings();
                if (userSavedChartSettings) {
                    chartParams.ExtraData.TimeScale = userSavedChartSettings.TimeScale;
                }

                objChartMain.api.props.chart.gui.legend.font_darklight_auto = false;
                objChartMain.api.props.chart.gui.legend.font_darklight_percent = 0;
                objChartMain.api.props.chart.gui.favorites.compares = chartStudySettings.ComparesFavorites() || [];
                objChartMain.api.props.chart.gui.favorites.indicators = chartStudySettings.IndicatorsFavorites() || [];

                objChartMain.api.props.chart.gui.zoom.interval_font_size = chartParams.startSettings.api.props.chart.gui.zoom.interval_font_size || objChartMain.api.props.chart.gui.zoom.interval_font_size;
                objChartMain.api.props.chart.gui.zoom.interval_font_bold = chartParams.startSettings.api.props.chart.gui.zoom.interval_font_bold || objChartMain.api.props.chart.gui.zoom.interval_font_bold;
                objChartMain.api.props.chart.gui.zoom.interval_font_color = chartParams.startSettings.api.props.chart.gui.zoom.interval_font_color || objChartMain.api.props.chart.gui.zoom.interval_font_color;

                //Set the path to the package root into the GUI object
                objChartMain.guiinit.rootpath = chartParams.startSettings.rootPath;
                objChartMain.apiinit.customLayoutFile = objChartMain.guiinit.rootpath + '/' + chartParams.startSettings.CustomLayoutFile;

                //objChartMain.guiinit.cache = true;
                objChartMain.navigator.properties.alvaysXMLHttpRequest = true;
                objChartMain.navigator.properties.xdrMinIE = 11;
                objChartMain.apiinit.timeupdateVersiongui = "time456";
                objChartMain.apiinit.savedIndicatorsSetting = chartStudySettings.GetSettings() || [];
                objChartMain.apiinit.localization.languages = chartParams.startSettings.languages;
                objChartMain.apiinit.timeframes = getVisibleTimeFramesItems(chartParams.startSettings.timeframes, timeframe);

                objChartMain.gui.init.localizationlang = advinionLanguagesMapper.getChartLanguage();

                //Connect events
                objChartMain.events.layout.readyComplete = onReadyComplete;
                objChartMain.events.layout.initComplete = onInitComplete;
                objChartMain.events.layout.onPreloadStart = onPreloadStart;
                objChartMain.events.layout.onPreloadFinished = onPreloadFinished;

                objChartMain.events.chart.createComplete = onCreateComplete;

                objChartMain.events.chart.onCanSaveTA = saveChartSettings;
                objChartMain.events.chart.onCanLoadTA = loadChartSettingsOnce;

                objChartMain.events.chart.onChangeComparesFavorites = chartStudySettings.ComparesFavorites;
                objChartMain.events.chart.onChangeIndicatorsFavorites = chartStudySettings.IndicatorsFavorites;

                objChartMain.events.study.onChangeDefaultSettings = closeChartDialogAfterChangeDefaultSettings;
                objChartMain.events.study.onDialogAddStudy = chartParams.startSettings.events.onDialogAddStudy;

                objChartMain.events.onDetectMobileMode = chartParams.startSettings.isMobile;

                //Load layout
                objChartMain.gui.loadLayout();

                configureTracking();
            }

            function getVisibleTimeFramesItems(allTimeFrames, visibleTimeFrames) {
                return allTimeFrames.filter(
                    function (advinionTimeFrameItem) {
                        var timeFrameItem = visibleTimeFrames.find(
                            function (item) {
                                return item.id.toLowerCase() === advinionTimeFrameItem.id.toLowerCase();
                            }
                        );
                        return general.isDefinedType(timeFrameItem);
                    });
            }

            function closeChartDialogAfterChangeDefaultSettings() {
                chartStudySettings.SetSettings.apply(null, arguments);
                objChartMain.apiactions.common.closeDialog();
            }

            function onCustomButtonClickHandle(source) {
                switch (source) {
                    case 'menu-compareform':
                        if (chartStudySettings.ComparesFavorites().length > 0) {
                            objChartMain.apiactions.ta.openCompareSmart();
                        } else {
                            objChartMain.apiactions.ta.openCompareSearch();
                        }
                        break;

                    case 'menu-indicatorform':
                        if (chartStudySettings.IndicatorsFavorites().length > 0) {
                            objChartMain.apiactions.indicators.openWizardFavorites();
                        } else {
                            objChartMain.apiactions.indicators.openWizardSmart();
                        }
                        break;

                    case 'tc-signals-button':
                        toggleSignals(null, true);
                        break;

                    default:
                        chartParams.additionalStartArgs.toggleDealSlipViewCallback.apply(this, arguments);
                        break;
                }
            }

            function getMajors() {
                if (objChartMain.chart && objChartMain.chart.symbols) {
                    objChartMain.chart.symbols.GetSymbolsByGroup({ guiparent: null, guigroup: 'majors' }, 'majors');
                }
            }

            function drawCurrentPriceLine(priceData) {
                if (priceData && priceData.length > 0) {
                    drawPriceLine(eChartPriceLineType.CurrentRate, priceData[priceData.length - 1].close, chartParams.additionalStartArgs.currentRateKey);
                }
            }

            function keepSyncPreviousCcyAskValues(rateData) {
                var responseData = [];

                for (var idx = 0; idx < rateData.length; idx++) {
                    var currentCcyAskValue = rateData[idx].data[0].ask,
                        symbolId = rateData[idx].id;

                    if (previousCcyAskValues[symbolId] == currentCcyAskValue) {
                        continue;
                    }

                    previousCcyAskValues[symbolId] = currentCcyAskValue;
                    responseData.push(rateData[idx]);
                }

                return responseData;
            }

            function getRecentHistory(objChartContext, objRequestContext, objParameters) {
                var request = {
                    timeFrame: objParameters.strTimeFrame,
                    instrumentId: objParameters.strSymbol,
                    orderDir: chartParams.ExtraData.additionalStartArgs.orderDir,
                    historyLength: chartParams.ExtraData.historyCandlesCount,
                    fromDate: objParameters.strFromDate,
                    toDate: objParameters.strToDate
                };

                chartParams.isLoadingHistory = true;

                previousCcyAskValues = {};
                deletePriceLine(eChartPriceLineType.CurrentRate);

                ko.postbox.publish(eFxNetEvents.ChartGetHistoryRequest);

                tradingChartsManager.GetRecentHistory(request)
                    .then(function (responseData) {
                        ko.postbox.publish(eFxNetEvents.ChartGetHistoryResponse);

                        if (responseData) {
                            responseData.data = general.isEmptyValue(responseData.data) ? [] : responseData.data;

                            if (objChartMain && objChartMain.chart && general.isFunctionType(objChartMain.chart.Push) &&
                                isChartLoaded && general.isFunctionType(isChartLoaded.inspect) && isChartLoaded.inspect().state !== rejectedPromiseStateText) {
                                objChartMain.chart.Push(objChartContext, objRequestContext, jsPushRequestTypes.GetRecentHistory, responseData);
                            }

                            drawCurrentPriceLine(responseData.data);

                            forceRedrawPriceLine(eChartPriceLineType.LimitLevel);
                        }
                    })
                    .finally(function () {
                        chartParams.isLoadingHistory = false;
                    })
                    .done();

                registerInstrument(objParameters.strSymbol);
            }

            function getMultiRT(objChartContext, objRequestContext, objParameters) {
                if (chartParams.isLoadingHistory == true) {
                    return;
                }

                var orderDir = chartParams.ExtraData.additionalStartArgs.orderDir,
                    symbols = objParameters.strSymbols,
                    strSeparator = objParameters.strSeparator,
                    instrumentIds = symbols.toString().split(strSeparator);

                var rateData = tradingChartsManager.GetMultiRT(guid, instrumentIds, orderDir);

                if (general.isEmptyType(rateData)) {
                    return;
                }

                var responseData = [];
                if (objParameters.strTimeFrame === eChartTimeFramesIds.tick) {
                    responseData = keepSyncPreviousCcyAskValues(rateData);
                } else {
                    responseData = rateData;
                }

                if (responseData.length > 0) {
                    isChartLoaded
                        .then(function () {
                            objChartMain.chart.Push(objChartContext, objRequestContext, jsPushRequestTypes.GetMultiRT, responseData);
                        })
                        .fail(onPromiseRejected)
                        .done();
                }

                if (rateData[0].data && rateData[0].data.length > 0) {
                    drawPriceLine(eChartPriceLineType.CurrentRate, rateData[0].data[0].ask, chartParams.additionalStartArgs.currentRateKey);
                }

                ko.postbox.publish("GetMultiRT");
            }

            function getSymbolsByGroup(objChartContext, objRequestContext, objParameters) {
                var strGroup = objParameters.strGroup,
                    instrumentId = objRequestContext.UI.instrumentId,
                    comparisonInstrumentsNumber = chartParams.startSettings.comparisonInstrumentsNumber,
                    instrumentsNumber = chartParams.startSettings.instrumentsNumber;

                var symbolsByGroup = tradingChartsManager.GetSymbolsByGroup(strGroup, instrumentId, comparisonInstrumentsNumber, instrumentsNumber);

                isChartLoaded
                    .then(function () {
                        objChartMain.chart.Push(objChartContext, objRequestContext, jsPushRequestTypes.GetSymbolsByGroup, symbolsByGroup);
                    })
                    .fail(onPromiseRejected)
                    .done();
            }

            function findSymbols(objChartContext, objRequestContext, objParameters) {
                var isForCompares = objRequestContext.UI.guiparent === 'dialogcompares';
                var foundData = tradingChartsManager.FindSymbols(objParameters.strText, chartParams.startSettings.searchInstrumentsNumber, isForCompares);

                isChartLoaded
                    .then(function () {
                        objChartMain.chart.Push(objChartContext, objRequestContext, jsPushRequestTypes.FindSymbols, foundData);
                    })
                    .fail(onPromiseRejected)
                    .done();
            }

            function getHistoryByDates(objChartContext, objRequestContext, objParameters) {
                var request = {
                    timeFrame: objParameters.strTimeFrame,
                    instrumentId: objParameters.strSymbol,
                    orderDir: chartParams.ExtraData.additionalStartArgs.orderDir,
                    historyLength: chartParams.ExtraData.historyCandlesCount,
                    fromDate: objParameters.strFromDate,
                    toDate: objParameters.strToDate
                };

                previousCcyAskValues = {};
                ko.postbox.publish(eFxNetEvents.ChartGetHistoryRequest);

                tradingChartsManager.GetRecentHistory(request)
                    .then(function (response) {
                        ko.postbox.publish(eFxNetEvents.ChartGetHistoryResponse);

                        isChartLoaded
                            .then(function () {
                                if (response && !general.isEmptyValue(response.data)) {
                                    objChartMain.chart.Push(objChartContext, objRequestContext, jsPushRequestTypes.GetHistoryByDates, response);
                                    drawCurrentPriceLine(response.data);
                                } else {
                                    objChartMain.chart.Push(objChartContext, objRequestContext, jsPushRequestTypes.GetHistoryByDates, null);
                                    chartParams.ExtraData.additionalStartArgs.isLoadingData(false);
                                }
                            })
                            .fail(onPromiseRejected)
                            .done();
                    })
                    .fail(onPromiseRejected)
                    .done();

                registerInstrument(objParameters.strSymbol);
            }

            function jsPushCallbackFunction(objChartContext, objRequestContext, strRequest, objParameters) {
                if (!objChartMain || !objChartMain.chart) {
                    return;
                }

                // in case of open option we need to build a line with the last  of the open option
                switch (strRequest) {
                    case jsPushRequestTypes.GetRecentHistory:
                        getRecentHistory(objChartContext, objRequestContext, objParameters);
                        break;

                    case jsPushRequestTypes.GetMultiRT:
                        getMultiRT(objChartContext, objRequestContext, objParameters);
                        break;

                    case jsPushRequestTypes.GetSymbolsByGroup:
                        getSymbolsByGroup(objChartContext, objRequestContext, objParameters);
                        break;

                    case jsPushRequestTypes.FindSymbols:
                        findSymbols(objChartContext, objRequestContext, objParameters);
                        break;

                    case jsPushRequestTypes.GetHistoryByDates:
                        getHistoryByDates(objChartContext, objRequestContext, objParameters);
                        break;
                }
            }

            function changeSymbol(instrumentId, newOrderDir) {
                function changeSymbolInternal() {
                    var symbol = tradingChartsManager.GetAdvinionInstrument(instrumentId);

                    changeOrderDir(newOrderDir);

                    objChartMain.chart.ChangeSymbol(symbol);
                }

                isChartLoaded
                    .then(changeSymbolInternal)
                    .fail(onPromiseRejected)
                    .done();
            }

            function changeOrderDir(newOrderDir) {
                chartParams.ExtraData.additionalStartArgs.orderDir = general.isDefinedType(newOrderDir) ? newOrderDir : chartParams.ExtraData.additionalStartArgs.orderDir;
            }

            function getCustomerSavedChartSettings() {
                var containerSuffix = chartParams.additionalStartArgs.containerSuffix;
                var settings = chartLayoutSettings.GetSettings(containerSuffix);

                if (general.isNullOrUndefined(settings)) {
                    return null;
                }

                return settings.chartSettings || settings;
            }

            function loadChartSettingsOnce() {
                objChartMain.events.chart.onCanLoadTA = null;

                var userSavedChartSettings = getCustomerSavedChartSettings();

                if (userSavedChartSettings) {
                    objChartMain.chart.SetTAObject(userSavedChartSettings, true, true);
                }

                ko.postbox.publish(eFxNetEvents.ChartStartComplete);
                ko.postbox.publish('chart-performance', { event: 'chart-start-completed', chartType: chartParams.additionalStartArgs.chartInstanceType, instrument: objChartMain.chart.SymbolName });

                objChartMain.events.chart.onChangeTimeframe = saveChartSettings;
                objChartMain.events.chart.onPriceTypeChange = saveChartSettings;
                objChartMain.events.chart.onChangeSymbol = onChageSymbolHandler;
            }

            function forceRedrawPriceLine(lineType) {
                var previousLineData = self.priceLines[lineType];

                if (!previousLineData) {
                    return;
                }

                deletePriceLine(lineType);
                drawPriceLine(lineType, previousLineData.rate, previousLineData.contentKey);
            }

            function drawPriceLine(lineType, rateValue, contentKey) {
                if ((!rateValue || rateValue == 0)) {
                    deletePriceLine(lineType);

                    return;
                }

                function drawPriceLineFunction() {
                    var lineSettings = chartParams.startSettings.priceLines[lineType];

                    drawPriceLineInternal(lineType, rateValue, lineSettings, contentKey);
                }

                isChartLoaded
                    .then(drawPriceLineFunction)
                    .fail(onPromiseRejected)
                    .done();
            }

            function onPriceLineMoved(rate, priceLineId) {
                var priceLineSettings = general.objectFirst(self.priceLines, function (priceLine) { return priceLine.id === priceLineId; });

                if (!priceLineSettings) {
                    return;
                }

                extraOnPriceLineDragged(priceLineSettings.lineType, rate);
            }

            function drawPriceLineInternal(lineType, rate, lineSettings, contentKey) {
                var shapeSettingsArray = chartParams.startSettings.getPriceBoxSettings(lineType, dictionary.GetItem(contentKey + '_Short', eResourcesNames.ChartsResources, ' '));

                if (self.priceLines[lineType]) {
                    objChartMain.chart.Shapes.UpdateShape(lineSettings.panelId, self.priceLines[lineType].id, ["value", rate], true);

                    self.priceLines[lineType].rate = rate;

                    return;
                }

                var priceLineId = objChartMain.chart.Shapes.AddHLine(lineSettings.panelId,
                    rate,
                    dictionary.GetItem(contentKey, eResourcesNames.ChartsResources),
                    lineSettings.lineColor,
                    lineSettings.lineWidth,
                    lineSettings.dashStyle,
                    lineSettings.labelColor,
                    lineSettings.labelfont,
                    lineSettings.labelAlignment,
                    lineSettings.horizontalPadding,
                    lineSettings.margin,
                    lineSettings.inPriceRange,
                    lineSettings.labelBackgroundColor);

                self.priceLines[lineType] = {
                    id: priceLineId,
                    rate: rate,
                    contentKey: contentKey,
                    lineType: lineType
                };

                objChartMain.chart.Shapes.UpdateShape(lineSettings.panelId, self.priceLines[lineType].id, shapeSettingsArray, true);

                if (lineSettings.allowDragLine && chartParams.additionalStartArgs.allowDragLine) {
                    objChartMain.chart.Shapes.UpdateShape(lineSettings.panelId, self.priceLines[lineType].id, ["movewithmouse", true, "callback", onPriceLineMoved]);
                }
            }

            function deletePriceLine(lineType) {
                function deletePriceLineFunction() {
                    var lineSettings = chartParams.startSettings.priceLines[lineType];

                    if (self.priceLines[lineType]) {
                        objChartMain.chart.Shapes.DeleteHLine(lineSettings.panelId, self.priceLines[lineType].id);

                        delete self.priceLines[lineType];
                    }
                }

                isChartLoaded
                    .then(deletePriceLineFunction)
                    .fail(onPromiseRejected)
                    .done();
            }

            var signalsOn = false;
            function tcSignalsOn(instrument) {
                if (!objChartMain.pivotLib) {
                    objChartMain.pivotLib = new chartPivotLibrary(objChartMain, {
                        onClearView: function onClearView() {
                            data['tc-chart-signals'](Object.assign(data['tc-chart-signals'](), {
                                active: false
                            }));

                            signalsOn = false;

                            if (null !== stateObject.get('showChartSignals')) {
                                stateObject.update('showChartSignals', signalsOn);
                            }

                        },
                        onRenderTC: function onRenderTC() {
                            data['tc-chart-signals'](Object.assign(data['tc-chart-signals'](), {
                                active: true
                            }));

                            signalsOn = true;

                            if (null !== stateObject.get('showChartSignals')) {
                                stateObject.update('showChartSignals', signalsOn);
                            }

                        }
                    });
                }

                objChartMain.tradingCentral.init.styleConfigpath = objChartMain.guiinit.rootpath + "/ChartSignals/tc/tradingcentral.config.js";

                var strSymbol = instrument.signalName.trim();
                var url = "/webpl3/api/tradingsignals/GetChartTradingSignal/" + strSymbol;

                objChartMain.tradingCentral.api.render(url);
            }

            function tcSignalsOff() {
                objChartMain.tradingCentral.api.hide();
            }

            function hasAgreedDisclaimer() {
                var tsComplianceDate = cookieHandler.ReadCookie("TsComplianceDate");
                return tsComplianceDate !== null;
            }

            function toggleSignals(on, fromUserInteraction) {
                var instrument = instrumentsManager.GetInstrument(objChartMain.chart.GetSymbol().id);

                if (instrument.hasSignal && instrument.signalName && hasAgreedDisclaimer() && customer.prop.AreSignalsAllowed) {
                    data['tc-chart-signals'](Object.assign(data['tc-chart-signals'](), {
                        disabled: false
                    }));
                } else {
                    tcSignalsOff()
                    data['tc-chart-signals'](Object.assign(data['tc-chart-signals'](), {
                        disabled: true
                    }));
                    return;
                }

                signalsOn = general.isBooleanType(on) ? on : !signalsOn;

                if (!signalsOn) {
                    tcSignalsOff();
                } else {
                    tcSignalsOn(instrument);
                }

                if (fromUserInteraction) {
                    ko.postbox.publish(chartParams.startSettings.tracking.eventName, {
                        'element': signalsOn ? eFxNetEvents.Trading_Central_Added : eFxNetEvents.Trading_Central_Removed
                    });
                }
            }

            function onChageSymbolHandler(parentid, symbolInfo) {
                toggleSignals(signalsOn);
                saveChartSettings({ instrumentId: symbolInfo.id });
            }

            function saveChartSettings(changes) {
                if (!objChartMain.chart || !objChartMain.chart.GetTAObject) {
                    return;
                }

                var settings;

                if ('' === chartParams.additionalStartArgs.containerSuffix) {
                    settings = getChartSettings();
                } else {
                    settings = chartLayoutSettings.GetSettings(chartParams.additionalStartArgs.containerSuffix);
                    settings.chartSettings = getChartSettings();

                    if (changes && changes.instrumentId) {
                        settings.instrumentId = changes.instrumentId;
                    }
                }

                chartLayoutSettings.UpdateSettings(chartParams.additionalStartArgs.containerSuffix, settings);
            }

            function getChartSettings() {
                if (!objChartMain.chart.GetTAObject) {
                    return null;
                }

                var config = {
                    symbol: false,
                    timeScale: true,
                    drawing: true,
                    indicators: true,
                    priceType: true
                };

                return objChartMain.chart.GetTAObject(config.symbol, config.timeScale, config.drawing, config.indicators, config.priceType);
            }

            function registerInstrument(instrumentId) {
                registrationManager.Update(eRegistrationListName.SingleQuote, instrumentId);
            }

            function onReadyComplete() {
                //Init  indicator  favorites
                var indicators = chartStudySettings.IndicatorsFavorites();

                objChartMain.apiinit.indicators =general.isArrayType(indicators) && indicators.length ? indicators : chartParams.ExtraData.startSettings.appiinit_indicators;
                objChartMain.apiinit.parentRelativeObjectID = chartParams.ExtraData.startSettings.ParentRelativeObjectID;
            }

            function onInitComplete() {
                var defaultInstrument = tradingChartsManager.GetDefaultInstrument(chartParams.startSettings.SelectedInstrumentId),
                    defaultInstrumentId;

                if (!general.isEmptyType(defaultInstrument)) {
                    defaultInstrumentId = defaultInstrument.id;
                    objChartMain.chart.Precision = defaultInstrument.DecimalDigit; // calculate decimal digit based on bid and ask
                } else {
                    defaultInstrumentId = chartParams.startSettings.SelectedInstrumentId;
                }

                objChartMain.chart.TwoFingersPriceSlide = chartParams.startSettings.chart.TwoFingersPriceSlide;

                objChartMain.chart.StudiesById.momentum.min = null;
                objChartMain.chart.StudiesById.momentum.max = null;

                // all these details should be changed only by methods
                objChartMain.chart.Symbol = defaultInstrumentId;
                objChartMain.chart.SymbolName = instrumentTranslationsManager.Long(defaultInstrumentId);
                objChartMain.chart.Name = objChartMain.chart.SymbolName;

                objChartMain.chart.AlignToLeft = chartParams.startSettings.chart.AlignToLeft; //Chart is aligned to left instead of centered
                var chartSettings = getCustomerSavedChartSettings();
                objChartMain.chart.TimeScale = chartSettings && chartSettings.TimeScale || chartParams.startSettings.chart.DefaultTimeScale;

                objChartMain.chart.BigValuesFormat = null;
                objChartMain.chart.DynMobileWick = chartParams.startSettings.chart.DynWick;
                objChartMain.chart.DynWebWick = chartParams.startSettings.chart.DynWick;
                objChartMain.chart.TimeZone = chartParams.startSettings.chart.TimeZone;
                objChartMain.chart.ShowBarData = chartParams.startSettings.chart.ShowBarData;
                objChartMain.chart.PriceChartType = chartParams.startSettings.chart.PriceChartType;
                objChartMain.chart.WaterMark = chartParams.startSettings.chart.WaterMark;
                objChartMain.chart.RequestTimeout = chartParams.startSettings.dataFeedSettings.requestTimeout;
                objChartMain.chart.WaterMarkOnSnapshot = false;

                objChartMain.chart.StudiesToLoad = []; //Don't load studies
                objChartMain.chart.LineLastCloseMarkRadius = chartParams.startSettings.chart.LineLastCloseMarkRadius; //Turn on (integer value>0) last close marker by settings its radius to positive numner.

                objChartMain.chart.DateFormat = chartParams.startSettings.dateFormatSettings;

                objChartMain.chart.vAxis.boxWidth = 70;
                objChartMain.chart.vAxis.hidePriceMarker = true;
                objChartMain.chart.vAxis.hideCutLabel = true;

                objChartMain.chart.LegendOnlyWithCrosshair = chartParams.startSettings.chart.LegendOnlyWithCrosshair;
                objChartMain.patterns.panels.legend_study = objChartMain.patterns.panels.legend_study.replace("</span>:", "</span><span class='legend-study-separator1'>:<span>");

                chartZoomSettingsManagerInstance.Start(objChartMain);

                objChartMain.chart.JSPush = {
                    enableHistory: true,
                    enableRT: true,
                    enableSymbols: true,
                    enableStudies: true,
                    enableTemplates: true,
                    funcFetchData: jsPushCallbackFunction
                };

                extraInitComplete();

                ko.postbox.publish(eFxNetEvents.ChartInitComplete);
            }

            function onCreateComplete() {
                extraCreateComplete();

                objChartMain.events.toolbar.onCustomButtonClick = onCustomButtonClickHandle;

                if (chartParams.startSettings.enableCrosshairMode) {
                    objChartMain.chart.SetCrosshairMode(true);
                }

                isChartLoaded
                    .then(toggleSignals.bind(null, stateObject.get('showChartSignals') || false))
                    .fail(onPromiseRejected)
                    .done();
            }

            function onPreloadStart() {
                ko.postbox.publish(eFxNetEvents.ChartStart);

                chartParams.ExtraData.additionalStartArgs.isLoadingData(true);
            }

            function onEndLoadingData() {
                chartParams.ExtraData.additionalStartArgs.isLoadingData(false);

                isChartLoadedDeferred.resolve();
            }

            function onPreloadFinished() {
                extraPreloadFinished();

                chartZoomSettingsManagerInstance
                    .IsZoomRestored
                    .then(function(){
                        onEndLoadingData();
                    })
                    .done();
            }

            function configureTracking() {
                if (!general.isObjectType(objChartMain.bi)) {
                    return;
                }

                objChartMain.bi.stop();
                objChartMain.bi.clear();

                if (!general.isObjectType(chartParams.startSettings.tracking)) {
                    return;
                }

                var doStart = false;

                if (general.isStringType(chartParams.startSettings.tracking.eventName)) {
                    doStart = true;

                    objChartMain.events.bi.onGetBI = function (eventsArr) {
                        ko.postbox.publish(chartParams.startSettings.tracking.eventName, { element: eventsArr[0].title });
                    };
                }

                if (doStart) {
                    objChartMain.bi.start(1);
                }
            }

            var resizeChart = debounce(function resizeChartHandler() {
                var chartContainer = document.getElementById(chartParams.startSettings.ParentRelativeObjectID);

                if (!chartContainer) {
                    return;
                }

                objChartMain.api.layout.changeSize(chartContainer.offsetWidth, chartContainer.offsetHeight);
            }, 100);

            function changeMode(mode) {
                isChartLoaded
                    .then(function changeModeInternal() {
                        objChartMain.api.layout.changeMode(mode);
                    })
                    .fail(onPromiseRejected)
                    .done();
            }

            function twoFingersPriceSlide(info) {
                switch (info.element) {
                    case 'expand-button':
                        objChartMain.chart.EnableTwoFingersPriceSlide(false);
                        break;

                    case 'collapse-button':
                        objChartMain.chart.EnableTwoFingersPriceSlide(true);
                        break;
                }
            }

            function setSubscribers() {
                self.subscribeTo(chartStudySettings.ComparesFavorites, function (compares) {
                    objChartMain.api.props.chart.gui.favorites.compares = compares;
                });

                self.subscribeTo(chartStudySettings.IndicatorsFavorites, function (indicators) {
                    objChartMain.api.props.chart.gui.favorites.indicators = indicators;
                });

                if (chartParams.startSettings.chart.TwoFingersPriceSlide) {
                    self.addDisposable(ko.postbox.subscribe("deal-slip-chart-interaction", twoFingersPriceSlide));
                }
            }

            function disposeChartObjectDependents() {
                if (chartZoomSettingsManagerInstance) {
                    chartZoomSettingsManagerInstance.Dispose();
                }
            }

            function stop() {
                saveChartSettings();

                objChartMain.events.chart.onCanSaveTA = null;
                objChartMain.events.chart.onCanLoadTA = null;
                objChartMain.events.chart.onChangeTimeframe = null;
                objChartMain.events.chart.onPriceTypeChange = null;
                objChartMain.events.chart.onChangeSymbol = null;
                objChartMain.chart.JSPush = null;

                objChartMain.chart.CleanUp(objChartMain);
                objChartMain = null;
            }

            function dispose() {
                if (chartParams) {
                    if (chartParams.hasOwnProperty('additionalStartArgs') &&
                        !general.isNullOrUndefined(chartParams.additionalStartArgs) &&
                        chartParams.additionalStartArgs.hasOwnProperty('containerSuffix') &&
                        !general.isNullOrUndefined(chartParams.additionalStartArgs.containerSuffix)) {
                            var tcChartSignalsKey = 'tc-chart-signals-' + chartParams.additionalStartArgs.containerSuffix;
                            stateObject.unset(tcChartSignalsKey);
                    }
                }

                if (objChartMain.chart && objChartMain.chart.StopRTRequests) {
                    objChartMain.chart.StopRTRequests();
                }

                tradingChartsManager.unsubscribe(guid);

                disposeChartObjectDependents();

                isChartLoaded
                    .then(stop)
                    .fail(onPromiseRejected)
                    .finally(function () {
                        parent.dispose.call(self);                  // inherited from DealViewModel
                    })
                    .done();

                isChartLoadedDeferred
                    .reject(chartLoaderRejectReasons.chartDisposed);
            }

            return {
                init: init,
                dispose: dispose,
                Data: data,
                ChangeSymbol: changeSymbol,
                DeletePriceLine: deletePriceLine,
                DrawPriceLine: drawPriceLine,
                ResizeChart: resizeChart,
                ChangeMode: changeMode
            };
        });

        return AdvinionChartWrapper;
    }
);