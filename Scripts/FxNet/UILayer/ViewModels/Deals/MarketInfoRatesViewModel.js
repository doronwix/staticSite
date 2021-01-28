define(
    'viewmodels/Deals/MarketInfoRatesViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'helpers/KoComponentViewModel',
        'managers/CustomerProfileManager',
        'cachemanagers/QuotesManager',
        'dataaccess/dalRates',
        'StateObject!Transaction'
    ],
    function (require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            KoComponentViewModel = require('helpers/KoComponentViewModel'),
            CustomerProfileManager = require('managers/CustomerProfileManager'),
            QuotesManager = require('cachemanagers/QuotesManager'),
            stateObject = require('StateObject!Transaction'),
            dalRates = require('dataaccess/dalRates');

        var MarketInfoRatesViewModel = general.extendClass(KoComponentViewModel, function (params) {
            var self = this,
                parent = this.parent, // inherited from KoComponentViewModel
                data = this.Data, // inherited from KoComponentViewModel
                dealData = stateObject.getAll(),
                rateDirectionSwitch = dealData.currentRateDirectionSwitch;

            function init() {
                parent.init.call(self);
                data.tabsPeriods = getPeriodsConfig();
                setObservables();
                setSubscribers();

                registerToDispatcher();
                setSelectedTab();
            }

            function setObservables() {
                data.selectedInstrument = ko.observable(dealData.selectedInstrument());
                data.selectedTab = ko.observable(ePeriodTabs.None);
                data.isLoading = ko.observable(false);
                data.periodData = ko.observable([]);
                data.currentRate = ko.observable();
                data.selectedPeriods = ko.observable(data.selectedTab() !== ePeriodTabs.None ? data.tabsPeriods[data.selectedTab()] : []);
            }

            function setSubscribers() {
                self.subscribeTo(data.selectedTab, function () {
                    data.selectedPeriods(data.selectedTab() !== ePeriodTabs.None ? data.tabsPeriods[data.selectedTab()] : []);
                });

                self.subscribeTo(dealData.selectedInstrument, function (newValue) {
                    data.selectedInstrument(newValue);
                    fetchPeriods();
                });

                self.subscribeTo(data.selectedPeriods, function () {
                    fetchPeriods();
                });

                if (!general.isNullOrUndefined(params.expandHighLow)) {
                    self.subscribeTo(params.expandHighLow, function (value) {
                        if (value) {
                            fetchPeriods();
                        }
                    });
                }

                if (dealData.orderDir) {
                    self.subscribeTo(dealData.orderDir, function () {
                        fetchPeriods();
                    });
                }
            }

            function setSelectedTab() {
                var profileCustomer = CustomerProfileManager.ProfileCustomer();

                if (!general.isNullOrUndefined(profileCustomer.riTab)) {
                    data.selectedTab(profileCustomer.riTab);
                }
                else {
                    data.selectedTab(ePeriodTabs.Short);
                    profileCustomer.riTab = data.selectedTab();
                    CustomerProfileManager.ProfileCustomer(profileCustomer);
                }
            }

            function getOrderDir() {
                var orderDir = eOrderDir.Buy;

                if (dealData.orderDir && dealData.orderDir() === eOrderDir.Sell) {
                    orderDir = dealData.orderDir();
                }

                if (rateDirectionSwitch) {
                    orderDir = orderDir === eOrderDir.Sell ? eOrderDir.Buy : eOrderDir.Sell;
                }

                return orderDir;
            }

            function getPeriodsConfig() {
                return [
                    [eMarketInfoPeriods.FiveMin, eMarketInfoPeriods.OneH, eMarketInfoPeriods.TwelveHours, eMarketInfoPeriods.Today],
                    [eMarketInfoPeriods.OneDay, eMarketInfoPeriods.OneWeek, eMarketInfoPeriods.TwoWeeks, eMarketInfoPeriods.ThisMonth],
                    [eMarketInfoPeriods.ThirtyDays, eMarketInfoPeriods.NinetyDays, eMarketInfoPeriods.FiftyTwoWeeks, eMarketInfoPeriods.ThisYear]
                ];
            }

            function fetchPeriods() {
                data.isLoading(true);
                data.currentRate('');
                updateCurrentRate();

                dalRates
                    .FetchPeriods(
                        dealData.selectedInstrument(),
                        getOrderDir(),
                        data.selectedPeriods()
                    )
                    .then(function (result) {
                        data.periodData(result);
                        data.isLoading(false);
                    }, function () {
                        data.isLoading(false);
                    });
            }

            function updateCurrentRate() {
                var orderDir = getOrderDir(),
                    activeQuote = QuotesManager.Quotes.GetItem(dealData.selectedInstrument());
                if (!general.isNullOrUndefined(activeQuote)) {
                    data.currentRate(orderDir === eOrderDir.Sell ? activeQuote.bid : activeQuote.ask);
                }
            }

            function changeTab(newTab) {
                var profileCustomer = CustomerProfileManager.ProfileCustomer(),
                    selectedTabTerm = Object.keys(ePeriodTabs).find(function (key) {
                        return ePeriodTabs[key] === Number(newTab);
                    });
                data.selectedTab(newTab);
                profileCustomer.riTab = newTab;
                CustomerProfileManager.ProfileCustomer(profileCustomer);
                ko.postbox.publish('deal-slip-change-highlow-term', selectedTabTerm + 'Term');
            }

            function registerToDispatcher() {
                QuotesManager.OnChange.Add(updateCurrentRate);
            }

            function unRegisterFromDispatcher() {
                QuotesManager.OnChange.Remove(updateCurrentRate);
            }

            function dispose() {
                unRegisterFromDispatcher();
                parent.dispose.call(self);
            }

            return {
                init: init,
                dispose: dispose,
                ChangeTab: changeTab,
                Data: data,
                DealData: dealData
            };
        });

        var createViewModel = function (params) {
            var viewModel = new MarketInfoRatesViewModel(params);
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
