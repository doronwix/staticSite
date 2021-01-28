define(
    'managers/ChartZoomSettingsManager',
    [
        'require',
        'handlers/general',
        'Q',
        'managers/ChartSettingManager'
    ],
    function (require) {
        var Q = require('Q'),
            general = require('handlers/general'),
            chartSettingManager = require('managers/ChartSettingManager'),
            enumSources = {
                user: 'user',
                history: 'history',
                rt: 'rt',
                restorezoom: 'restorezoom',
                zoomfullrange: 'zoomfullrange'
            };

        var ChartZoomSettingsManager = function ChartZoomSettingsManagerClass(_profileIdx) {
            var defaultSettingsIdx = -1,
                profileIdx = _profileIdx,
                objChart,
                onActionRunHandler,
                lastZoomAction,
                isZoomRestored = Q.defer();

            function dispose() {
                if (onActionRunHandler && objChart && objChart.events) {
                    objChart.events.actions.onActionRun = onActionRunHandler;
                }

                if (objChart && objChart.chart) {
                    objChart.chart.OnZoomChangeCallback = null;
                }

                objChart = null;
            }

            function onActionRunWrapper(actionname) {
                switch (actionname) {
                    case "zoom_default":
                        var timeScale = objChart.chart.TimeScale,
                            settings = getSettings();

                        delete settings[timeScale];
                        updateSettings(settings);
                        break;

                    case "zoom_left":
                    case "zoom_in":
                    case "zoom_out":
                    case "zoom_all":
                    case "zoom_right":
                        lastZoomAction = actionname;
                        break;
                }

                if (general.isFunctionType(onActionRunHandler)) {
                    onActionRunHandler.apply(this, arguments);
                }
            }

            function start(initializedChartObject) {
                if (!initializedChartObject || !general.isDefinedType(initializedChartObject.ExtraData.additionalStartArgs.containerSuffix)) {
                    throw new Error("Argument exception: initializedChartObject is not valid.");
                }

                objChart = initializedChartObject;

                if (!general.isNumberType(profileIdx)) {
                    profileIdx = objChart.ExtraData.additionalStartArgs.containerSuffix || defaultSettingsIdx;
                }

                objChart.chart.OnZoomChangeCallback = onZoomChangeCallback;

                if (general.isFunctionType(objChart.events.actions.onActionRun)) {
                    onActionRunHandler = objChart.events.actions.onActionRun;
                }

                objChart.events.actions.onActionRun = onActionRunWrapper;
            }

            function getSettings() {
                var chartsZoomSettings = chartSettingManager.Chart().chartsZoomSettings || (chartSettingManager.Chart().chartsZoomSettings = {}),
                    zoomProfile = chartsZoomSettings[profileIdx] || (chartsZoomSettings[profileIdx] = {});

                return zoomProfile;
            }

            function updateSettings(zoomData) {
                chartSettingManager.Chart().chartsZoomSettings = chartSettingManager.Chart().chartsZoomSettings || {};
                chartSettingManager.Chart().chartsZoomSettings[profileIdx] = zoomData;

                chartSettingManager.SaveChart();
            }

            function onZoomChangeCallback(objCurZoom) {
                if (!objChart || !objChart.chart) {
                    //objChart can't be null (if it is > is an orphaned call)
                    return;
                }

                var settings = getSettings();

                var future = objCurZoom.future,
                    zoomSize = objCurZoom.zoomSize,
                    timeScale = objCurZoom.timescale,
                    source = objCurZoom.source, //Can be "user", "history", "rt", "restorezoom" or "zoomfullrange"
                    bufferSize = objCurZoom.bufferSize;

                if (source == enumSources.restorezoom) {
                    delete settings[timeScale];
                    updateSettings(settings);

                    //By default show on 1Tick 95% of real data + 5% of future data
                    if (timeScale == eChartTimeFramesIds.tick) {
                        objChart.chart.SetZoom(bufferSize * 0.05, bufferSize * 1.05, true);
                    }
                    else {
                        //For other scales show 
                        objChart.chart.SetZoom(bufferSize * 0.6, bufferSize + 2, true);
                    }
                }

                //Caused by user changing the zoom manually and/or using zoom buttons from zooms toolbar
                if (source == enumSources.user || source == enumSources.zoomfullrange || lastZoomAction) {
                    lastZoomAction = "";

                    //Save changes to local dictionary only if there are visible future bars and they don't occupy more than 80% of the viewport.
                    if (future / zoomSize > 0.01 && future / zoomSize <= 0.5) {
                        settings[timeScale] = {
                            future: objCurZoom.future,
                            visibleCandles: objCurZoom.end - objCurZoom.start + 1
                        };

                        updateSettings(settings);

                        return resetZoom(objCurZoom);
                    }

                    if (future / zoomSize > 0.5) {
                        delete settings[timeScale];
                        updateSettings(settings);
                    }
                }

                if (source == enumSources.history) {
                    // Chart got history data. Need to reload saving from dictionary
                    var objLoadedZoom = settings[timeScale];

                    if (objLoadedZoom && !objLoadedZoom.visibleCandles) {
                        objLoadedZoom.visibleCandles = objLoadedZoom.end - objLoadedZoom.start + 1;
                    }

                    if (objLoadedZoom) {
                        if (isZoomRestored.promise.inspect().state === "pending") {
                            isZoomRestored.resolve();
                        }

                        if (bufferSize + objLoadedZoom.future < objLoadedZoom.visibleCandles) {
                            return resetZoom(objCurZoom);
                        } else {
                            var startCandle = bufferSize + objLoadedZoom.future - objLoadedZoom.visibleCandles,
                                endCandle = bufferSize + objLoadedZoom.future;

                            objCurZoom.start = startCandle;
                            objCurZoom.end = endCandle;
                            objCurZoom.zoomSize = endCandle - startCandle + 1;
                            objCurZoom.future = objLoadedZoom.future;
                        }

                        return objCurZoom;
                    } else {
                        return resetZoom(objCurZoom);
                    }
                }
            }

            function resetZoom(currentZoom) {
                if (isZoomRestored.promise.inspect().state === "pending") {
                    isZoomRestored.resolve();
                }

                var startCandlePercent = currentZoom.timeScale == eChartTimeFramesIds.tick ? 0.05 : 0.6,
                    endCandlePercent = 1.05,
                    startCandle = parseInt(currentZoom.bufferSize * startCandlePercent),
                    endCandle = parseInt(currentZoom.bufferSize * endCandlePercent);

                currentZoom.start = startCandle;
                currentZoom.end = endCandle;
                currentZoom.zoomSize = endCandle - startCandle + 1;
                currentZoom.future = endCandle - currentZoom.bufferSize + 1;

                return currentZoom;
            }

            return {
                Dispose: dispose,
                Start: start,
                IsZoomRestored: isZoomRestored.promise
            };
        };

        return ChartZoomSettingsManager;
    }
);