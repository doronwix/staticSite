define(
    'deviceviewmodels/SearchCountryViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'managers/historymanager',
        'viewmodels/BaseSearchCountryViewModel'
    ],
    function SearchCountryViewModelDef(require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            HistoryManager = require('managers/historymanager'),
            BaseSearchCountryViewModel = require('viewmodels/BaseSearchCountryViewModel');

        var SearchCountryViewModel = general.extendClass(BaseSearchCountryViewModel, function SearchCountryViewModelClass() {
            var self = this,
                parent = this.parent, // inherited from BaseSearchCountryViewModel
                data = this.Data; // inherited from BaseSearchCountryViewModel

            var initialHistoryStateId = HistoryManager.GetCurrentState().id;
            var silentUpdate = false;

            function init() {
                parent.Init.call(self);
                setObservables();
                setSubscribers();
            }

            function setSubscribers() {
                data.displaySearch.subscribe(function (value) {
                    if (silentUpdate) {
                        return;
                    }

                    if (value) {
                        var serializedSubstate = "expand_search_countries";

                        HistoryManager.PushSubState(serializedSubstate);
                    } else {
                        var currentHistoryStateId = HistoryManager.GetCurrentState().id;

                        if (initialHistoryStateId !== currentHistoryStateId) {
                            HistoryManager.Back();
                        }
                    }
                });

                HistoryManager.OnStateChanged.Add(function () {
                    var currentHistoryStateId = HistoryManager.GetCurrentState().id;

                    if (initialHistoryStateId === currentHistoryStateId && data.displaySearch()) {
                        silentUpdate = true;
                        data.displaySearch(false);
                        silentUpdate = false;
                    }
                });

                data.selectedCountry.subscribe(function (newCountry) {
                    if (!newCountry || !newCountry.id || newCountry.id <= -1) {
                        return;
                    }

                    data.displaySearch(false);
                });
            }

            function setObservables() {
                data.displaySearch = ko.observable(false);
                data.searchFocus = ko.observable(true);
            }

            function onClickBackButton() {
                data.displaySearch(false);
                data.searchFocus(false);
            }

            return {
                Init: init,
                SetCouuntry: parent.SetCouuntry,
                OnClickBackButton: onClickBackButton,
                Data: data
            };
        });

        var createViewModel = function (params) {
            var viewModel = new SearchCountryViewModel(params);
            viewModel.Init();
            return viewModel;
        };

        return {
            viewModel: {
                createViewModel: createViewModel
            }
        };
    }
);
