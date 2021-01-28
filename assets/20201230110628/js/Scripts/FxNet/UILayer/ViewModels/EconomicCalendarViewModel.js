/* globals eDirections, eAvailabilityState */
define(
    'viewmodels/EconomicCalendarViewModel',
    [
        'require',
        'knockout',
        'enums/enums',
        'handlers/general',
        'configuration/initconfiguration',
        'helpers/KoComponentViewModel',
        'FxNet/LogicLayer/EconomicCalendar/EconomicCalendarConnManager',
        'StateObject!EconomicCalendarConnManager',
        'global/debounce',
        'Dictionary'
    ],
    function EconomicCalendarViewModelDef(require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            config = require('configuration/initconfiguration'),
            KoComponentViewModel = require('helpers/KoComponentViewModel'),
            EconomicCalendarConnManager = require('FxNet/LogicLayer/EconomicCalendar/EconomicCalendarConnManager'),
            stateObject = require('StateObject!EconomicCalendarConnManager'),
            debounce = require('global/debounce'),
            dictionary = require('Dictionary');

        var unsubscribeFromStateObject,
            economicCalendarConfig = config.EconomicCalendarConfiguration,
            invertedDirectionEvents = economicCalendarConfig.invertedDirectionEvents;

        function getCurrenciesFilter(ccyPair) {
            var currencies;

            if (!general.isEmptyValue(ccyPair)) {
                currencies = ccyPair.split('/');

                if (!general.isEmptyValue(currencies) && currencies.length === 2) {
                    return {
                        FirstCurrency: currencies[0],
                        SecondCurrency: currencies[1]
                    };
                }
            }

            return false;
        }

        var EconomicCalendarViewModel = general.extendClass(KoComponentViewModel, function EconomicCalendarViewModelClass(params) {
            var self = this,
                parent = this.parent, // inherited from KoComponentViewModel
                data = this.Data, // inherited from KoComponentViewModelz,
                viewName = params.viewName,
                currentGroupId;

            function init(settings) {
                parent.init.call(self, settings); // inherited from KoComponentViewModel

                initFilters();

                setObservables();
                setComputables();
                setSubscribers();

                EconomicCalendarConnManager.SetMessageReceivedCallback(viewName, onMessageReceived);
            }

            function initFilters() {
                data.filters = {
                    FirstCurrency: ko.observable(),
                    SecondCurrency: ko.observable(),
                    FromDate: ko.observable(),
                    ToDate: ko.observable(),
                    TimeZoneId: ko.observable(),
                    TimeZoneOffset: ko.observable(),
                    CountryCodes: ko.observableArray([]),
                    Importance: ko.observableArray([]),
                    CountryCodesMandatory: ko.observable(),
                    ImportanceMandatory: ko.observable(),
                    Count: ko.observable()
                };
            }

            function setComputables() {
                data.ccyPair = self.createComputed(function () {
                    if (general.isDefinedType(params.ccyPair)) {
                        return params.ccyPair();
                    }

                    return '';
                });

                data.isShowEventsUnavailable = self.createComputed(function () {
                    var isUnavailable = !data.hasEvents() && !data.isLoading();
                    return isUnavailable;
                });

                data.isShowLoader = self.createComputed(function () {
                    return data.isLoading();
                });

                data.isShowEvents = self.createComputed(function () {
                    var isShowEvents = data.hasEvents() && !data.isLoading();
                    return isShowEvents;
                });
            }

            var subscribeToTradingService = debounce(function subscribeToTradingServiceHandler() {
                currentGroupId = EconomicCalendarConnManager.Subscribe(viewName, ko.toJS(data.filters));
            });

            function clearEvents() {
                data.events([]);
                data.mapEvents([]);
                data.hasEvents(false);
            }

            function unsubscribeFromTradingService() {
                clearEvents();

                if (currentGroupId) {
                    EconomicCalendarConnManager.Unsubscribe(currentGroupId);
                }
            }

            function decideDirection(eventMessage) {
                var forecast = eventMessage.Forecast,
                    actual = eventMessage.Actual,
                    retVal = '';

                if (forecast !== '') {
                    var isInverted = invertedDirectionEvents.indexOf(eventMessage.ContentId) >= 0;

                    retVal = (general.extractNumberFromString(forecast) > general.extractNumberFromString(actual))
                        ? (isInverted ? eDirections.Up : eDirections.Down)
                        : ((general.extractNumberFromString(forecast) < general.extractNumberFromString(actual))
                            ? (isInverted ? eDirections.Down : eDirections.Up) : eDirections.Bold);
                }

                return retVal;
            }

            function mutateEvent(eventMessage, totalCount) {
                var currentEvent = {
                    EventTime: eventMessage.EventTime.trim() + 'Z',
                    CountryCode: eventMessage.CountryCode.toLowerCase(),
                    Symbol: general.isArrayType(eventMessage.Symbols) ? eventMessage.Symbols.shift() : '',
                    ImportanceActive: eventMessage.Importance,
                    ImportanceInactive: economicCalendarConfig.eventsMaxImportance - eventMessage.Importance,
                    Title: dictionary.GetItem('ec' + eventMessage.ContentId, 'economicCalendar').trim(),
                    Previous: eventMessage.Previous,
                    Actual: eventMessage.Actual,
                    ActualDirection: decideDirection(eventMessage),
                    Forecast: eventMessage.Forecast,
                    ContentKey: economicCalendarConfig.contentKeySection + eventMessage.ContentId,
                    RecordId: eventMessage.RecordId,
                    Description: dictionary.GetItem('eclong' + eventMessage.ContentId, 'economicCalendarLongData', ' '),
                    isDescriptionExpanded: ko.observable(false),
                    ContentId: eventMessage.ContentId,
                    TotalCount: totalCount
                };

                return currentEvent;
            }

            function onMessageReceived(eventMsgArr, mode) {
                if (eventMsgArr) {

                    var foundIndex;
                    var events = data.events();
                    var mapEvents = data.mapEvents();

                    for (var i = 0, length = eventMsgArr.length; i < length; i++) {
                        foundIndex = null;

                        if (mode === 1) { //publish
                            foundIndex = mapEvents[eventMsgArr[i].RecordId];
                        }
                        if (foundIndex || foundIndex == 0) {
                            events[foundIndex] = mutateEvent(eventMsgArr[i], events[foundIndex].TotalCount);//publish does not have TotalCount
                        } else {
                            events.push(mutateEvent(eventMsgArr[i], eventMsgArr[i].TotalCount));
                            mapEvents[eventMsgArr[i].RecordId] = events.length - 1;
                        }
                    }
                    data.events(events);
                    data.hasEvents(true);
                } else {
                    if (data.pageIndex() === 1)
                        data.hasEvents(false);
                }

                data.isLoading(false);
            }

            function setObservables() {
                data.hasEvents = ko.observable(false);
                data.isLoading = ko.observable(true);
                data.events = ko.observableArray([]);
                data.newEvents = ko.observableArray([]);
                data.mapEvents = ko.observableArray([]);
                data.showFilters = ko.observable(false);
                data.pageIndex = ko.observable(1); //web - no paging, always 1, mobile has paging
            }

            function applyFilter(filter) {
                filter = filter || {};

                if (data.pageIndex() === 1) {
                    data.isLoading(true);
                    unsubscribeFromTradingService();
                }


                EconomicCalendarConnManager.WhenAvailable()
                    .then(function (isAvailable) {
                        if (!isAvailable) {
                            data.hasEvents(false);
                            data.isLoading(false);

                            return;
                        }

                        for (var prop in filter) {
                            if (!filter.hasOwnProperty(prop) || !data.filters.hasOwnProperty(prop)) {
                                continue;
                            }

                            data.filters[prop](filter[prop]);
                        }

                        subscribeToTradingService();
                    })
                    .done();
            }

            function handleServiceAvailability(value) {
                if (value === eAvailabilityState.NotAvailable) {
                    data.hasEvents(false);
                    data.isLoading(false);
                    data.events([]);
                    data.mapEvents([]);
                }
            }

            function setSubscribers() {
                self.subscribeTo(data.ccyPair, function (ccyPair) {
                    var currencyFilter = getCurrenciesFilter(ccyPair);

                    if (currencyFilter !== false) {
                        applyFilter(currencyFilter);
                    }
                });

                unsubscribeFromStateObject = stateObject.subscribe('IsServiceAvailable', handleServiceAvailability);
            }

            function dispose() {
                unsubscribeFromStateObject();
                unsubscribeFromTradingService();

                parent.dispose.call(self);
            }

            return {
                ApplyFilter: applyFilter,
                init: init,
                dispose: dispose
            };
        });

        var createViewModel = function (params) {
            var viewModel = new EconomicCalendarViewModel(params);
            viewModel.init();

            var ccyPair = params.ccyPair,
                currencyFilter;

            if (general.isDefinedType(ccyPair)) {
                currencyFilter = getCurrenciesFilter(ko.utils.unwrapObservable(ccyPair));

                if (currencyFilter !== false) {
                    viewModel.ApplyFilter(currencyFilter);
                }
            }

            return viewModel;
        };

        return {
            viewModel: {
                createViewModel: createViewModel
            },
            EconomicCalendarViewModel: EconomicCalendarViewModel
        };
    }
);