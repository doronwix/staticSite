define(
    'deviceviewmodels/SignalDetailsViewModel',
    [
        'require',
        'knockout',
        'viewmodels/BaseSignalsViewModel',
        'handlers/general',
        'cachemanagers/QuotesManager',
        'initdatamanagers/InstrumentsManager',
        'dataaccess/dalTradingSignals',
        'JSONHelper'
    ],
    function(require) {
        var ko = require('knockout'),
            BaseSignalsViewModel = require('viewmodels/BaseSignalsViewModel'),
            JSONHelper = require('JSONHelper'),
            general = require('handlers/general'),
            QuotesManager = require('cachemanagers/QuotesManager'),
            instrumentsManager = require('initdatamanagers/InstrumentsManager'),
            dalTradingSignals = require('dataaccess/dalTradingSignals');

        var MobileSignalsDetailsViewMode = general.extendClass(BaseSignalsViewModel, function MobileSignalsDetailsViewModeClass(filterData) {
            var self = this,
                data = this.Data,
                parent = this.parent; // inherited from KoComponentViewModel

            var instrumentRegistered = false;

            function init(settings) {
                parent.init.call(self, settings); // inherited from KoComponentViewModel
                data.currentSignal = ko.observable(null);
                data.currentChange = ko.observable('');
                setSubscribers();

                getSignal();
            }

            function setSubscribers() {
                self.subscribeTo(data.hasAgreedDisclaimer, function (agreed) {
                    if (agreed) {
                        getSignal();
                    }
                });
            }

            function getSignal() {
                if (data.hasAgreedDisclaimer()) {
                    if (filterData.instrumentId) {
                        var result,
                            instrument = instrumentsManager.GetInstrument(filterData.instrumentId());
                        if (instrument.hasSignal) {
                            data.fetchingData(true);
                            dalTradingSignals.getLatestTradingSignal({ symbol: instrument.signalName })
                                .then(function (responseText) {
                                    result = JSONHelper.STR2JSON("getLatestTradingSignal/onLoadComplete", responseText);
                                    setSignal(result);
                                }).done();
                        }
                    } else if (filterData.signalId) {
                        data.fetchingData(true);
                        dalTradingSignals.getTradingSignal({ signalId: filterData.signalId })
                            .then(function (responseText) {
                                result = JSONHelper.STR2JSON("getTradingSignal/onLoadComplete", responseText);
                                setSignal(result);
                            }).done();
                    }
                }
            }

            function setSignal(signalResponse) {
                if (signalResponse.status == eResult.Success && signalResponse.resultStatus == 0 && 
                    signalResponse.result.length) {
                    data.currentSignal(parent.toSignalObject(signalResponse.result[0]));
                    updateCurrentChange();
                    registerToDispatcher();
                }
                data.signalsAreAvailable(signalResponse.status == eResult.Success && signalResponse.resultStatus == 0);
                data.fetchingData(false);
            }


            function updateCurrentChange() {
                var activeQuote;

                if (data.currentSignal() && data.currentSignal().instrument.id) {
                    activeQuote = QuotesManager.Quotes.GetItem(data.currentSignal().instrument.id);
                }

                if (!general.isNullOrUndefined(activeQuote)) {
                    data.currentChange(Format.toSignedPercent(activeQuote.change, ''));
                } else if (!instrumentRegistered && data.currentSignal()) {
                    parent.registerInstruments([data.currentSignal().instrument.id]);
                    instrumentRegistered = true;
                }
            }

            function registerToDispatcher() {
                QuotesManager.OnChange.Add(updateCurrentChange);
            }

            function unRegisterFromDispatcher() {
                QuotesManager.OnChange.Remove(updateCurrentChange);
            }

            function dispose() {
                unRegisterFromDispatcher();
                parent.dispose.call(self);
            }

            return {
                init: init,
                dispose: dispose,
                OpenNewDeal: parent.openDeal,
                Data: data
            };
        });

        var createViewModel = function(params) {
            params = params || {};

            var viewModel = new MobileSignalsDetailsViewMode(params.filterData || {});
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