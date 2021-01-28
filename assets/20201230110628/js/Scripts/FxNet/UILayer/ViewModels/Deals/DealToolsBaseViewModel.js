define(
    'viewmodels/Deals/DealToolsBaseViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'helpers/KoComponentViewModel',
        'managers/CustomerProfileManager',
        'StateObject!Transaction'
    ],
    function DealToolsDef(require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            koComponentViewModel = require('helpers/KoComponentViewModel'),
            customerProfileManager = require('managers/CustomerProfileManager'),
            stateObject = require('StateObject!Transaction');

        var DealToolsViewModel = general.extendClass(koComponentViewModel, function DealToolsClass() {
            var self = this,
                parent = this.parent,               // inherited from KoComponentViewModel
                data = this.Data,                   // inherited from KoComponentViewModel
                handlers = {},
                defaultToolTab,
                dealData = {},
                stateObjectSubscriptions = [];

            function init(settings) {
                parent.init.call(self, settings);   // inherited from KoComponentViewModel

                setInitialObservables();

                if (stateObject.set(eStateObjectTopics.ReadyForUse, false)) {
                    initDelayed(settings);
                } else {
                    stateObjectSubscriptions.push({
                        unsubscribe: stateObject.subscribe(eStateObjectTopics.ReadyForUse, function (isReady) {
                            if (isReady) {
                                initDelayed(settings);
                            }
                        })
                    });
                }
            }

            function setInitialObservables() {
                data.isDataLoaded = ko.observable(false);
                data.showTools = stateObject.set("showTools", ko.observable(false));
                data.showChartSignals = stateObject.set("showChartSignals", false);
                data.selectedInstrument = ko.observable(0);
                data.isVisible = ko.observable(true);
            }

            function initDelayed(settings) {
                dealData = general.extendType(dealData, stateObject.getAll());
                setProperties(dealData);
                setObservables(settings);
                setComputables();
                setSubscribers();
                setHandlers();
                data.isDataLoaded(true);
            }

            function dispose() {
                handlers.chartBtnClick = null;
                handlers.marketInfoBtnClick = null;
                handlers.calendarBtnClick = null;
                handlers.signalsBtnClick = null;
                handlers.instrumentInfoBtnClick = null;
                handlers.toggleToolsClick = null;

                stateObject.unset('showChartSignals');

                while (stateObjectSubscriptions.length > 0) {
                    stateObjectSubscriptions
                        .pop()
                        .unsubscribe();
                }

                parent.dispose.call(self);  // inherited from KoComponentViewModel
            }

            function setProperties(settings) {
                dealData.orderDir = dealData.orderDir || settings.orderDir;
            }

            function setObservables(settings) {
                var profileCustomer = customerProfileManager.ProfileCustomer();

                if (profileCustomer) {
                    defaultToolTab = profileCustomer.defaultTab;
                    data.showTools(profileCustomer.tools === 1);
                }
                else if (dealData.initialToolTab) {
                    defaultToolTab = dealData.initialToolTab();
                }
                else {
                    defaultToolTab = eNewDealTool.None;
                }

                if (settings.transArgs) {
                    if (settings.transArgs.transactionType === eTransactionSwitcher.NewPriceAlert) {
                        data.isVisible(false);
                    }
                    else if (settings.transArgs.tab) {
                        defaultToolTab = settings.transArgs.tab;
                        data.showTools(true);
                    }
                }

                data.selectedToolTab = ko.observable(defaultToolTab);
            }

            function setHandlers() {
                handlers.chartBtnClick = function chartBtnClick() {
                    data.selectedToolTab(eNewDealTool.Chart);
                };

                handlers.marketInfoBtnClick = function marketInfoBtnClick() {
                    data.selectedToolTab(eNewDealTool.MarketLiveInfo);
                };

                handlers.calendarBtnClick = function calendarBtnClick() {
                    data.selectedToolTab(eNewDealTool.EconomicCalendar);
                };

                handlers.signalsBtnClick = function signalsBtnClick() {
                    data.selectedToolTab(eNewDealTool.Signals);
                };

                handlers.instrumentInfoBtnClick = function instrumentInfoBtnClick() {
                    data.selectedToolTab(eNewDealTool.InstrumentInfo);
                };

                handlers.toggleToolsClick = function toggleToolsClick() {
                    data.showTools(!data.showTools());
                }
            }

            function setComputables() {
                data.isChartToolVisible = self.createComputed(function () {
                    return data.selectedToolTab() == eNewDealTool.Chart && data.showTools();
                });

                data.isMarketInfoToolVisible = self.createComputed(function () {
                    return data.selectedToolTab() == eNewDealTool.MarketLiveInfo && data.showTools();
                });

                data.isCalendarToolVisible = self.createComputed(function () {
                    return data.selectedToolTab() == eNewDealTool.EconomicCalendar && data.showTools();
                });

                data.isSignalsToolVisible = self.createComputed(function () {
                    return data.selectedToolTab() == eNewDealTool.Signals && data.showTools();
                });

                data.isInstrumentInfoToolVisible = self.createComputed(function () {
                    return data.selectedToolTab() == eNewDealTool.InstrumentInfo && data.showTools();
                });

                data.tabName = self.createComputed(function () {
                    return general.getKeyByValue(eNewDealTool, data.selectedToolTab());
                });
            }

            function setSubscribers() {
                self.subscribeTo(data.selectedToolTab, function (toolTab) {
                    var profileCustomer = customerProfileManager.ProfileCustomer(),
                        keyForDefaultTab = general.isNullOrUndefined(dealData.profileKeyForDefaultTab) ? 'defaultTab' : dealData.profileKeyForDefaultTab();

                    profileCustomer[keyForDefaultTab] = toolTab;
                    customerProfileManager.ProfileCustomer(profileCustomer);
                });
            }

            return {
                init: init,
                dispose: dispose,
                Handlers: handlers,
                DealData: dealData
            };
        });

        var createViewModel = function (params) {
            var viewModel = new DealToolsViewModel();

            viewModel.init(params);

            return viewModel;
        };

        return {
            viewModel: {
                createViewModel: createViewModel
            },
            DealToolsViewModel: DealToolsViewModel
        };
    }
);
