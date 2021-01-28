define('deviceviewmodels/Deals/Revised/CloseDealViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'deviceviewmodels/Deals/Modules/CloseDealModule',
        'Dictionary',
        'configuration/initconfiguration',
        'StateObject!Transaction',
        'managers/CustomerProfileManager',
        'devicemanagers/StatesManager',
        'cachemanagers/QuotesManager',
        'viewmodels/QuotesSubscriber'
    ], function (require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            config = require('configuration/initconfiguration'),
            dynamicTitleKey = config.DynamicTitleConfiguration.dynamicTitleKey,
            settings = config.NewDealConfiguration,
            Dictionary = require('Dictionary'),
            stateObject = require('StateObject!Transaction'),
            CloseDealModule = require('deviceviewmodels/Deals/Modules/CloseDealModule'),
            customerProfileManager = require('managers/CustomerProfileManager'),
            statesManager = require('devicemanagers/StatesManager'),
            quotesManager = require('cachemanagers/QuotesManager'),
            QuotesSubscriber = require('viewmodels/QuotesSubscriber');

        var CloseDealViewModel = general.extendClass(CloseDealModule.ViewModel, function CloseDealClass() {
            var self = this,
                parent = this.parent,
                data = this.Data,
                quotesVM = new QuotesSubscriber();

            function init(customSettings) {
                parent.init.call(self, customSettings);

                if (!data.HasPosition()) {
                    data.SelectedPosition(parent.OpenDeals()[0]);
                }

                data.isActiveQuote = ko.observable(true);
                data.showTools = stateObject.get('showTools') || stateObject.set('showTools', ko.observable(true));
                data.showTransaction = stateObject.get('showTransaction') || stateObject.set('showTransaction', ko.observable(true));
                setToolsVisibilityByProfile();
                setQuoteStatus();
                setDynamicTitle();
                setSubscribers();
                setComputables();
            }

            function setSubscribers() {
                self.subscribeTo(data.SelectedPosition, function (value) {
                    stateObject.update(dynamicTitleKey, getTitle(value));
                });

                self.subscribeTo(data.showTools, function (isExpanded) {
                    var profileCustomer = customerProfileManager.ProfileCustomer();
                    profileCustomer.tools = Number(isExpanded);
                    customerProfileManager.ProfileCustomer(profileCustomer);
                });

                quotesManager.OnChange.Add(setQuoteStatus);
            }

            function setToolsVisibilityByProfile() {
                var profileCustomer = customerProfileManager.ProfileCustomer();
                data.showTools(profileCustomer.tools === 1);
            }

            function setDynamicTitle() {
                if (!stateObject.containsKey(dynamicTitleKey)) {
                    stateObject.set(dynamicTitleKey, getTitle(data.SelectedPosition()));
                } else {
                    stateObject.update(dynamicTitleKey, getTitle(data.SelectedPosition()));
                }
            }

            function getTitle(selectedPosition) {
                var firstPart = Dictionary.GetItem('titleCloseDeals', 'dialogsTitles');

                return String.format(firstPart, selectedPosition.positionNumber);
            }

            function setComputables() {
                data.isInstrumentAvailable = self.createComputed(function () {
                    return !statesManager.States.IsMarketClosed() && data.isActiveQuote();
                });
            }

            function setQuoteStatus() {
                var currentDeal = data.SelectedPosition() || {};
                if (!general.isNullOrUndefined(currentDeal.instrumentID)) {
                    var quote = quotesVM.GetQuote(currentDeal.instrumentID);
                    data.isActiveQuote(!general.isNullOrUndefined(quote) && quote.isActiveQuote());
                } else {
                    data.isActiveQuote(false);
                }
            }

            return {
                init: init
            };
        });

        var createViewModel = function (params) {
            var viewModel = new CloseDealViewModel();

            var currentSettings = Object.assign(settings, params);
            viewModel.init(currentSettings);

            return viewModel;
        };

        return {
            viewModel: {
                createViewModel: createViewModel
            }
        };
    }); 