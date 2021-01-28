define(
    'deviceviewmodels/Signals/SignalTechAnalysisFullViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        "helpers/ObservableHashTable",
        'helpers/KoComponentViewModel',
        'dataaccess/dalTradingSignals',
        'modules/ThemeSettings',
        'JSONHelper',
        'LoadDictionaryContent!controls_ctlsignaltechanalysisfull'
    ],
    function SignalTechAnalysisDef(require) {
        var ko = require('knockout'),
            themeSetting = require('modules/ThemeSettings'),
            general = require('handlers/general'),
            observableHashTable = require("helpers/ObservableHashTable"),
            KoComponentViewModel = require('helpers/KoComponentViewModel'),
            dalTradingSignals = require('dataaccess/dalTradingSignals'),
            JSONHelper = require('JSONHelper'),
            IMAGE_EXTENSION = '.gif',
            IMAGE_DARK_SUFFIX = '.darktheme',
            rx = RegExp(IMAGE_EXTENSION);

        function Signal(_signal) {
            var currentUiTheme = themeSetting.GetTheme();

            this.signalId = _signal[eTradingSignal.signalId];
            this.signalTitle = _signal[eTradingSignal.signalTitle];
            this.signalDate = _signal[eTradingSignal.signalDate];

            if (currentUiTheme === 'dark') {
                this.imagePath = _signal[eTradingSignal.imagePath].replace(rx, IMAGE_DARK_SUFFIX + IMAGE_EXTENSION);
            } else {
                this.imagePath = _signal[eTradingSignal.imagePath];
            }
            this.weekText = _signal[eTradingSignal.weekText];
            this.weekDelta = _signal[eTradingSignal.weekDelta];
            this.monthText = _signal[eTradingSignal.monthText];
            this.monthDelta = _signal[eTradingSignal.monthDelta];
            this.summary = _signal[eTradingSignal.summary];
            this.story = _signal[eTradingSignal.story];
            this.symbol = _signal[eTradingSignal.symbol];
        }

        var SignalTechAnalysisFullViewModel = general.extendClass(KoComponentViewModel, function SignalTechAnalysisClass(filterData) {
            var self = this,
                parent = this.parent, // inherited from KoComponentViewModel
                data = this.Data; // inherited from KoComponentViewModel

            var init = function (settings) {
                parent.init.call(self, settings);   // inherited from KoComponentViewModel
                setObservables();
                updateSignalsList();
            };

            var setObservables = function () {
                data.signalsList = new observableHashTable(ko, general, 'signalId', { enabled: true, sortProperty: 'signalId', asc: false });
                data.isLoading = ko.observable(false);
            };

            var updateSignalsList = function () {
                var result;

                if (filterData.signalId) {
                    data.isLoading(true);
                    dalTradingSignals.getTradingSignal({ signalId: filterData.signalId })
                        .then(function (responseText) {
                            result = JSONHelper.STR2JSON("getTradingSignal/onLoadComplete", responseText);
                            updateSignalData(result);
                        }).done();
                }
                else if (filterData.symbol) {
                    dalTradingSignals.getLatestTradingSignal({ symbol: filterData.symbol })
                        .then(function (responseText) {
                            result = JSONHelper.STR2JSON("getLatestTradingSignal/onLoadComplete", responseText);
                            updateSignalData(result);
                        }).done();
                }
            };

            var updateSignalData = function (result) {
                if (result.status == eResult.Success && result.resultStatus == 0) {
                    for (var i = 0; i < result.result.length; i++) {
                        data.signalsList.Add(new Signal(result.result[i]));
                    }
                }

                data.isLoading(false);
            };

            var dispose = function () {
                data.signalsList.Clear();
                parent.dispose.call(self);          // inherited from KoComponentViewModel
            };

            return {
                init: init,
                dispose: dispose
            };
        });

        var createViewModel = function (params) {
            var filterData = params || {};

            var viewModel = new SignalTechAnalysisFullViewModel(filterData);
            viewModel.init();

            return viewModel;
        };

        return {
            viewModel: {
                createViewModel: createViewModel
            }
        };
    }
);