define(
    'deviceviewmodels/Signals/SignalsToolViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'viewmodels/BaseSignalsViewModel',
        'managers/CustomerProfileManager',
        'LoadDictionaryContent!deals_DealSignalsTool',
        'StateObject!Transaction',
        'initdatamanagers/InstrumentsManager',
        'dataaccess/dalTradingSignals'
    ],
    function (require) {
        var ko = require('knockout'),
            general = require('handlers/general'), 
            BaseSignalsViewModel = require('viewmodels/BaseSignalsViewModel'),
            CustomerProfileManager = require('managers/CustomerProfileManager'),
            stateObject = require('StateObject!Transaction'),
            instrumentsManager = require('initdatamanagers/InstrumentsManager'),
            dalTradingSignals = require('dataaccess/dalTradingSignals');

        var WebSignalsToolViewModel = general.extendClass(BaseSignalsViewModel, function (filterData) {
            var self = this,
                parent = this.parent,
                data = this.parent.Data,
                handlers = this.Handlers,
                stateObjectSubscriptions = [];

            function init(settings) {
                parent.init.call(self, settings);

                setObservables();
                setSubscribers();
                setHandlers();

                getSignal();
            }

            function setObservables() {
                if (!stateObject.containsKey(eStateObjectTopics.SignalChartToggle)) {
                    var profileCustomer = CustomerProfileManager.ProfileCustomer();
                    stateObject.set(eStateObjectTopics.SignalChartToggle, Boolean(profileCustomer.showSignalsCharts));
                }

                data.showSignals = ko.observable(stateObject.get(eStateObjectTopics.SignalChartToggle)).extend({ notify: "always" });
                data.currentSignal = ko.observable(null);
            }

            function setSubscribers() {
                stateObjectSubscriptions.push({
                    unsubscribe: stateObject.subscribe(eStateObjectTopics.SignalChartToggle, data.showSignals)
                });

                self.subscribeTo(filterData.instrumentId, function () {
                    getSignal();
                });

                self.subscribeTo(data.hasAgreedDisclaimer, function (agreed) {
                    if (agreed) {
                        getSignal();
                    }
                });

                self.subscribeTo(data.showSignals, function(showSignals) {
                    var profileCustomer = CustomerProfileManager.ProfileCustomer();
                    profileCustomer.showSignalsCharts = Number(showSignals);
                    CustomerProfileManager.ProfileCustomer(profileCustomer);
                });
            }

            function setHandlers() {
                handlers.toggleSignalsClick = function toggleSignalsClick() {
                    var currentValue = !!stateObject.get(eStateObjectTopics.SignalChartToggle);
                    stateObject.update(eStateObjectTopics.SignalChartToggle, !currentValue);
                }
            }

            function getSignal() {
                if (data.hasAgreedDisclaimer() && filterData.instrumentId) {
                    var result,
                        instrument = instrumentsManager.GetInstrument(filterData.instrumentId());
                    if (instrument.hasSignal) {
                        data.fetchingData(true);
                        dalTradingSignals.getLatestTradingSignal({ symbol: instrument.signalName })
                            .then(function (responseText) {
                                result = JSONHelper.STR2JSON("getLatestTradingSignal/onLoadComplete", responseText);
                                setSignal(result);
                            }).done();
                    } else {
                        data.signalsAreAvailable(false);
                    }
                }
            }

            function setSignal(signalResponse) {
                if (signalResponse.status == eResult.Success && signalResponse.resultStatus == 0 &&
                    signalResponse.result.length) {
                    data.currentSignal(parent.toSignalObject(signalResponse.result[0]));
                }
                data.signalsAreAvailable(signalResponse.status == eResult.Success && signalResponse.resultStatus == 0);
                data.fetchingData(false);
            }

            function dispose() {
                handlers.toggleSignalsClick = null;

                while (stateObjectSubscriptions.length > 0) {
                    stateObjectSubscriptions.pop()
                        .unsubscribe();
                }

                parent.dispose.call(self);
            }

            return {
                init: init,
                dispose: dispose,
                Data: data,
                Handlers: handlers,
                PermissionsModule: parent.permissionsModule
            };
        });

        function createViewModel(params) {
            params = params || {};

            var viewModel = new WebSignalsToolViewModel(params.filterData || {});
            viewModel.init();

            return viewModel;
        }

        return {
            viewModel: {
                createViewModel: createViewModel
            }
        };
    }
);