define(
    'deviceviewmodels/Deals/Modules/CloseDealModule',
    [
        'require',
        'knockout',
        'handlers/general',
        'dataaccess/dalorder',
        'managers/CustomerProfileManager',
        'initdatamanagers/InstrumentsManager',
        'devicemanagers/StatesManager',
        'StateObject!Transaction',
        'viewmodels/Deals/CloseDealBaseViewModel'
    ],
    function CloseDealModuleDefault(require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            dalOrders = require('dataaccess/dalorder'),
            CloseDealBaseViewModel = require('viewmodels/Deals/CloseDealBaseViewModel'),
            instrumentsManager = require('initdatamanagers/InstrumentsManager'),

            StatesManager = require('devicemanagers/StatesManager'),
            stateObject = require('StateObject!Transaction'),
            customerProfileManager = require('managers/CustomerProfileManager');

        var CloseDealModule = general.extendClass(CloseDealBaseViewModel, function CloseDealModuleClass() {
            var self = this,
                parent = this.parent, // inherited from CloseDealBaseViewModel
                data = this.Data, // inherited from CloseDealBaseViewModel
                baseOrder = parent.BaseOrder;

            function init(customSettings) {
                if (!stateObject.containsKey("stateObjectIsReadyDefer")) {
                    stateObject.set('stateObjectIsReadyDefer', Q.defer());
                }

                parent.init.call(self, customSettings);

                setObservables();
                setComputables();
                setSubscribers();

                setViewByUserProfile();

                stateObject.get('stateObjectIsReadyDefer').resolve();
            }

            function setObservables() {
                data.showTools = stateObject.set('showTools', ko.observable(false));
            }

            function setComputables() {
                data.showForwardPips = self.createComputed(function () {
                    if (!data.HasPosition()) {
                        return false;
                    }

                    var selectedPosition = ko.utils.unwrapObservable(data.SelectedPosition);
                    var fwPips = ko.utils.unwrapObservable(selectedPosition.fwPips);

                    return parseFloat(fwPips) !== 0;
                });
            }

            function setSubscribers() {
                self.subscribeTo(data.showTools, function (isExpanded) {
                    var profileCustomer = customerProfileManager.ProfileCustomer();

                    profileCustomer.closeDealTools = Number(isExpanded);

                    customerProfileManager.ProfileCustomer(profileCustomer);
                });
            }

            function setViewByUserProfile() {
                var profileCustomer = customerProfileManager.ProfileCustomer();

                data.showTools(profileCustomer.closeDealTools === 1);
            }

            function closeDeal() {
                if (!data.CloseDealReady()) {
                    return;
                }

                data.isProcessing(true);

                if (StatesManager.States.fxDenied() == true) {
                    baseOrder.ValidateOnlineTradingUser();
                    data.isProcessing(false);
                    return;
                }

                dalOrders.CloseDeals([
                    {
                        positionNumber: data.SelectedPosition().positionNumber,
                        spotRate: data.SelectedPosition().spotRate,
                        fwPips: data.SelectedPosition().fwPips,
                        dealRate: data.SelectedPosition().dealRate,
                        instrumentID: data.SelectedPosition().instrumentID
                    }
                ], onCloseDealReturn, { failCallback: onCloseDealFail });
            }

            function onCloseDealReturn(result, callerId, requestData) {
                data.isProcessing(false);
                var instrument = instrumentsManager.GetInstrument(data.selectedInstrument());

                if (instrument) {
                    baseOrder.OnActionReturn(result, callerId, instrument, { requestData: requestData });
                }
            }

            function onCloseDealFail() {
                data.isProcessing(false);
            }

            function toggleView() {
                data.isCollapsed(!data.isCollapsed());
            }

            return {
                init: init,
                Data: data,
                ToggleView: toggleView,
                CloseDeal: closeDeal
            };
        });

        return {
            ViewModel: CloseDealModule
        };
    }
);