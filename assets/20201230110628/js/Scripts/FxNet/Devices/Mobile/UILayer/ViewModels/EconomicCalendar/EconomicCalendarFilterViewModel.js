/* globals eImportanceFilter, eCountryFilter, eViewTypes */
define(
    'deviceviewmodels/EconomicCalendar/EconomicCalendarFilterViewModel',
    [
        'knockout',
        'handlers/general',
        'helpers/KoComponentViewModel',
        "configuration/initconfiguration",
        'devicemanagers/ViewModelsManager',
        "FxNet/LogicLayer/EconomicCalendar/EconomicCalendarHandler",
        "StateObject!EconomicCalendar"
    ],
    function EconomicCalendarFilterDef(
        ko,
        general,
        KoComponentViewModel,
        economicCalendarConfig,
        viewModelsManager,
        economicCalendarHandler,
        stateObjectEC
    ) {
        var EconomicCalendarFilterViewModel = general.extendClass(KoComponentViewModel, function EconomicCalendarFilterClass(params) {
            var self = this,
                handlers = {},
                parent = this.parent, // inherited from KoComponentViewModel
                data = this.Data, // inherited from KoComponentViewModelz
                soFilterDataKey = 'filterData';

            var init = function (settings) {
                parent.init.call(self, settings);   // inherited from KoComponentViewModel

                if (!stateObjectEC.containsKey(soFilterDataKey)) {
                    stateObjectEC.set(soFilterDataKey, {});
                }

                data.countryList = [];
                data.importanceList = [];
                setDateTabs();
                setHandlers();
                setCountries();
                setImportance();
                setObservables();
                setSubscribers();
            };

            var setHandlers = function () {
                self.Handlers.selectDateTab = function (dateFilter) {
                    var filter = economicCalendarHandler.DateInterval(dateFilter);
                    data.selectedDateFilter(dateFilter);
                    updateSoFilterData();
                    ko.postbox.publish('fx-economic-calendar-apply-filter', filter);
                };
            };

            var setDateTabs = function () {
                data.dateTabs = [];
                for (var filterName in eDateFilter) {
                    if (eDateFilter.hasOwnProperty(filterName)) {
                        data.dateTabs.push({
                            ContentKey: economicCalendarConfig.EconomicCalendarConfiguration.contentKeyFilterPrefix + filterName,
                            DateFilterType: eDateFilter[filterName]
                        });
                    }
                }
            };

            var setCountries = function () {
                data.countries = [];
                for (var filterName in eCountryFilter) {
                    if (eCountryFilter.hasOwnProperty(filterName)) {
                        data.countries.push({
                            CountryCode: filterName,
                            ContentKey: economicCalendarConfig.EconomicCalendarConfiguration.contentKeyFilterPrefix + filterName
                        });
                    }
                }
            };

            var setImportance = function () {
                data.importance = [];
                for (var filterName in eImportanceFilter) {
                    if (eImportanceFilter.hasOwnProperty(filterName)) {
                        data.importance.push({
                            ContentKey: economicCalendarConfig.EconomicCalendarConfiguration.contentKeyFilterPrefix + filterName,
                            ImportanceCode: eImportanceFilter[filterName],
                            ImportanceInactive: economicCalendarConfig.EconomicCalendarConfiguration.eventsMaxImportance - eImportanceFilter[filterName]
                        });
                    }
                }
            };

            var setObservables = function () {
                var soFilterData = stateObjectEC.get(soFilterDataKey) || {},
                    selectedDateTab = !general.isEmptyValue(soFilterData.selectedDateTab) ?
                        soFilterData.selectedDateTab : economicCalendarConfig.EconomicCalendarConfiguration.defaultDateTab,
                    countryCodes,
                    importanceCodes;

                data.countryList = data.countries.map(function (item) {
                    return item.CountryCode;
                });

                data.importanceList = data.importance.map(function (item) {
                    return item.ImportanceCode;
                });

                countryCodes = soFilterData.countryCodes || data.countryList;
                importanceCodes = soFilterData.importanceCodes || data.importanceList;


                data.selectedDateFilter = ko.observable(selectedDateTab);
                data.countryCodes = ko.observableArray(countryCodes.slice(0));
                data.importanceCodes = ko.observableArray(importanceCodes.slice(0));

                updateSoFilterData();
            };

            var setSubscribers = function () {
                var swipeLeftSubscriber = ko.postbox.subscribe("fx-economic-calendar-swipe-left", function () {
                    var dateFilter = data.selectedDateFilter() + 1;
                    var filter = economicCalendarHandler.DateInterval(dateFilter);

                    if (filter) {
                        data.selectedDateFilter(dateFilter);
                        updateSoFilterData();
                        ko.postbox.publish('fx-economic-calendar-apply-filter', filter);
                    }
                });

                self.addDisposable(swipeLeftSubscriber);

                var swipeRightSubscriber = ko.postbox.subscribe("fx-economic-calendar-swipe-right", function () {
                    var dateFilter = data.selectedDateFilter() - 1;
                    var filter = economicCalendarHandler.DateInterval(dateFilter);

                    if (filter) {
                        data.selectedDateFilter(dateFilter);
                        updateSoFilterData();
                        ko.postbox.publish('fx-economic-calendar-apply-filter', filter);
                    }
                });

                self.addDisposable(swipeRightSubscriber);

                self.subscribeTo(viewModelsManager.VManager.GetActiveFormViewProperties(eViewTypes.vEconomicCalendarFilter).visible, function (isVisible) {
                    if (isVisible) {
                        var filter = {
                            CountryCodes: data.countryCodes(),
                            Importance: data.importanceCodes(),
                            CountryCodesMandatory: true,
                            ImportanceMandatory: true
                        };
                        updateSoFilterData();
                        ko.postbox.publish('fx-economic-calendar-apply-filter', filter);
                    }
                }, null, "beforeChange");
            };

            var updateSoFilterData = function () {
                stateObjectEC.update(soFilterDataKey, {
                    selectedDateTab: data.selectedDateFilter(),
                    countryCodes: data.countryCodes(),
                    importanceCodes: data.importanceCodes()
                });
            };

            var toggleInList = function (list, item) {
                if (list.indexOf(item) === -1) {
                    list.push(item);
                } else {
                    list.remove(item);
                }
            };

            var toggleList = function (list, valuesList) {
                if (list().length === valuesList.length) {
                    list([]);
                } else {
                    list(valuesList.slice(0));
                }
            }

            var dispose = function () {
                parent.dispose.call(self);          // inherited from KoComponentViewModel

                handlers.SelectDateTab = null;
            };

            return {
                init: init,
                dispose: dispose,
                Handlers: handlers,
                ToggleInList: toggleInList,
                ToggleList: toggleList
            };
        });

        var createViewModel = function (params) {
            var viewModel = new EconomicCalendarFilterViewModel(params);
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
