define(
    'deviceviewmodels/EconomicCalendar/EconomicCalendarViewModel',
    [
        'knockout',
        'configuration/initconfiguration',
        'handlers/general',
        'viewmodels/EconomicCalendarViewModel',
        'FxNet/LogicLayer/EconomicCalendar/EconomicCalendarHandler',
        'StateObject!EconomicCalendar',
        'helpers/CustomKOBindings/InfiniteScrollBinding',
        'helpers/CustomKOBindings/SwipeTabs',
        'vendor/knockout-postbox'
    ],
    function EconomicCalendarViewModelDef(ko, config, general, baseViewModel, economicCalendarHandler, stateObjectEC) {
        var EconomicCalendarViewModel = general.extendClass(baseViewModel.EconomicCalendarViewModel, function EconomicCalendarViewModelClass() {
            var self = this,
                parent = this.parent, // inherited from EconomicCalendarViewModel
                handlers = {},
                data = this.Data,
                economicCalendarConfig = config.EconomicCalendarConfiguration,
                currentFilter = {},
                soFilterDataKey = 'filterData',
                soFilterData = stateObjectEC.get(soFilterDataKey) || {},
                selectedDateTab = !general.isEmptyValue(soFilterData.selectedDateTab) ?
                    soFilterData.selectedDateTab : economicCalendarConfig.defaultDateTab;

            function init(settings) {
                parent.init.call(self, settings); // inherited from EconomicCalendarViewModel

                setObservables();
                setSubscribers();
                setHandlers();
                setComputables();

                currentFilter = setInitialFilter();
                parent.ApplyFilter(currentFilter);
            }

            function setInitialFilter() {
                var defaultDate = economicCalendarHandler.DateInterval(selectedDateTab)

                var filter = {
                    FromDate: defaultDate.FromDate.toDotNetString(),
                    ToDate: defaultDate.ToDate.toDotNetString()
                };

                if (soFilterData.countryCodes) {
                    Object.assign(filter, { CountryCodes: soFilterData.countryCodes, CountryCodesMandatory: true });
                }

                if (soFilterData.importanceCodes) {
                    Object.assign(filter, { Importance: soFilterData.importanceCodes, ImportanceMandatory: true });
                }

                return filter;
            }

            function showDayHeader(i) {
                if (i === 0) {
                    return true;
                }

                if (!data.events() || data.events().length === 0) {
                    return true;
                }

                return new Date(data.events()[i].EventTime).getPureUTCDate() >
                    new Date(data.events()[i - 1].EventTime).getPureUTCDate();
            }

            function setObservables() {
                data.selectedDateTab = ko.observable(selectedDateTab);
                data.pagedEvents = ko.observableArray([]);
            }

            function setSubscribers() {
                var applyFilterSubscriber = ko.postbox.subscribe('fx-economic-calendar-apply-filter', function (filter) {
                    filter.FromDate = filter.FromDate || currentFilter.FromDate;
                    filter.ToDate = filter.ToDate || currentFilter.ToDate;
                    filter.CountryCodes = filter.CountryCodes || currentFilter.CountryCodes;
                    filter.CountryCodesMandatory = filter.CountryCodesMandatory || currentFilter.CountryCodesMandatory;
                    filter.Importance = filter.Importance || currentFilter.Importance;
                    filter.ImportanceMandatory = filter.ImportanceMandatory || currentFilter.ImportanceMandatory;
                    currentFilter = filter;
                    data.pageIndex(1);
                    parent.ApplyFilter(filter);
                });

                self.addDisposable(applyFilterSubscriber);

                self.subscribeTo(parent.Data.isLoading, function (isLoading) {
                    ko.postbox.publish(ePostboxTopic.SetSpinnerVisibility, isLoading);
                });

                self.subscribeTo(parent.Data.hasEvents, function (hasEvents) {
                    if (hasEvents) {
                        data.pagedEvents(parent.Data.events.slice(0, economicCalendarConfig.mobilePageSize * data.pageIndex()));
                    }
                    else {
                        data.pagedEvents([]);
                    }
                });
            }

            function setHandlers() {
                handlers.swipeLeft = function swipeLeft() {
                    ko.postbox.publish('fx-economic-calendar-swipe-left');
                };

                handlers.swipeRight = function swipeRight() {
                    ko.postbox.publish('fx-economic-calendar-swipe-right');
                };

                handlers.scrolled = function scrolled() {
                    if (data.events() && data.events().length > 0) {
                        var totalCount = data.events()[0].TotalCount;

                        if (data.pageIndex() * economicCalendarConfig.mobilePageSize < totalCount) {
                            data.pageIndex(data.pageIndex() + 1);
                            data.pagedEvents(data.events().slice(0, economicCalendarConfig.mobilePageSize * data.pageIndex()));
                        }
                    }
                }
            }

            function setComputables() {
                data.maxDateTime = self.createComputed(function computeMaxDate() {
                    if (data.events().length > 0) {
                        var maxDate = data.events()[data.events().length - 1].EventTime;

                        return maxDate;
                    }

                    return null;
                });
            }

            function dispose() {
                parent.dispose.call(self);

                handlers.swipeLeft = null;
                handlers.swipeRight = null;
                handlers.scrolled = null;
            }

            return {
                init: init,
                dispose: dispose,
                Handlers: handlers,
                ShowDayHeader: showDayHeader
            };
        });

        var createViewModel = function (params) {
            var viewModel = new EconomicCalendarViewModel(params);
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
