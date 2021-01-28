define(
    'viewmodels/Deals/BaseMarketInfoToolViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'helpers/KoComponentViewModel',
        'initdatamanagers/InstrumentsManager',
        'initdatamanagers/Customer',
        'managers/CustomerProfileManager',
        'dataaccess/dalInstruments',
        'dataaccess/dalCustomerProfile',
        'FxNet/LogicLayer/Deal/SentimentsConnManager',
        'StateObject!Transaction',
        'StateObject!SentimentsConnManager'
    ],
    function BaseMarketInfoToolDef(require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            KoComponentViewModel = require('helpers/KoComponentViewModel'),
            instrumentsManager = require('initdatamanagers/InstrumentsManager'),
            customer = require('initdatamanagers/Customer'),
            customerProfileManager = require('managers/CustomerProfileManager'),
            dalInstruments = require('dataaccess/dalInstruments'),
            dalCustomerProfile = require('dataaccess/dalCustomerProfile'),
            SentimentsConnManager = require('FxNet/LogicLayer/Deal/SentimentsConnManager'),
            stateObject = require('StateObject!Transaction'),
            SentimentsConnManagerStateObject = require('StateObject!SentimentsConnManager');

        var BaseMarketInfoToolViewModel = general.extendClass(KoComponentViewModel, function BaseMarketInfoToolClass() {
            var self = this,
                parent = this.parent, // inherited from KoComponentViewModel
                data = this.Data, // inherited from KoComponentViewModel
                newDealData = stateObject.getAll(),
                fakeMessageTimer = 0;

            function init(settings) {
                parent.init.call(self, settings);   // inherited from KoComponentViewModel

                setObservables();
                setComputables();
                setSubscribers();

                var currentInstrumentId = ko.utils.unwrapObservable(newDealData.selectedInstrument);

                SentimentsConnManager.SetMessageReceivedCallback(onMessageReceived);

                setTimeout(subscribeToTradingService.bind(self, currentInstrumentId));
            }

            function onMessageReceived(eventMessage) {
                // cancel any fake message
                if (fakeMessageTimer) {
                    clearTimeout(fakeMessageTimer);
                    fakeMessageTimer = 0;
                }

                var risePercent,
                    fallPercent;

                if (eventMessage && !general.isNullOrUndefined(eventMessage.PercentLong)) {
                    risePercent = general.toNumeric(eventMessage.PercentLong);
                    fallPercent = 100 - risePercent;
                    data.risePercent(risePercent / 100);
                    data.fallPercent(fallPercent / 100);
                    data.riseValue(Math.round(risePercent));
                    data.fallValue(Math.round(fallPercent));
                    data.hasData(true);
                }
                else {
                    data.hasData(false);
                }
            }

            function viewSentimentsButtonHandler() {
                var profileCustomer = customerProfileManager.ProfileCustomer();

                profileCustomer.viewSentimentsDisclaimerClicked = new Date().toUTCString();
                dalCustomerProfile.SaveSentimentsToProfileWebMobile({ ViewSentimentsDisclaimerClicked: new Date().toUTCString() });
            }

            function sendFakeMessage() {
                if (fakeMessageTimer) {
                    clearTimeout(fakeMessageTimer);
                    fakeMessageTimer = 0;
                }

                fakeMessageTimer = setTimeout(onMessageReceived, 400); // in case no message is received, show 50/50 after 250ms
            }

            function subscribeToTradingService(instrumentId) {
                if (instrumentId) {
                    sendFakeMessage();
                    SentimentsConnManager.Subscribe(customer.prop.brokerID, instrumentId);
                }
            }

            function unsubscribeFromTradingService(instrumentId) {
                if (instrumentId) {
                    SentimentsConnManager.Unsubscribe(customer.prop.brokerID, instrumentId);
                }
            }

            function setObservables() {
                data.hasData = ko.observable(false);
                data.risePercent = ko.observable("");
                data.fallPercent = ko.observable("");
                data.riseValue = ko.observable("");
                data.fallValue = ko.observable("");
                data.overnightFinancingTimeGMT = ko.observable("");
                data.OfCalculationTimeGMT = ko.observable();
                data.displayTradingSentimentsFirstView = ko.observable(general.isEmptyType(customerProfileManager.ProfileCustomer().viewSentimentsDisclaimerClicked));
            }

            function setSubscribers() {
                self.subscribeTo(newDealData.selectedInstrument, function (previousInstrumentId) {
                    if (previousInstrumentId) {
                        unsubscribeFromTradingService(previousInstrumentId);
                    }
                }, null, "beforeChange");

                self.subscribeTo(newDealData.selectedInstrument, function (instrumentId) {
                    subscribeToTradingService(instrumentId);
                });
            }

            function setComputables() {
                data.displayTradingSentiments = self.createComputed(function () {
                    return data.hasData() && SentimentsConnManagerStateObject.get('IsServiceAvailable');
                });

                data.change = self.createComputed(function () {
                    var currentSell = newDealData.bid(),
                        previousCloseSell = newDealData.close();

                    return Format.toRate(currentSell - previousCloseSell, true, newDealData.selectedInstrument());
                });

                data.OfCalculationTimeGMT = self.createComputed(function () {
                    var instrument = instrumentsManager.GetInstrument(newDealData.selectedInstrument()),
                        scheduleGroupGMTCloseTime,
                        GMTCloseTime;

                    dalInstruments.GetScheduleGroup(instrument.id).then(function (result) {
                        scheduleGroupGMTCloseTime = result[0].GMTCloseTime;
                        GMTCloseTime = scheduleGroupGMTCloseTime.split(" ")[1];
                        data.overnightFinancingTimeGMT(GMTCloseTime);
                    }).done();
                }, self, false);
            }

            function dispose() {
                unsubscribeFromTradingService(newDealData.selectedInstrument());
                parent.dispose.call(self);
            }

            return {
                init: init,
                dispose: dispose,
                NewDealData: newDealData,
                ViewSentimentsButtonHandler: viewSentimentsButtonHandler
            };
        });

        return BaseMarketInfoToolViewModel;
    }
);