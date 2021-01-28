define(
    'deviceviewmodels/SearchCountryViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'viewmodels/BaseSearchCountryViewModel'
    ],
    function SearchCountryViewModelDef(require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            BaseSearchCountryViewModel = require('viewmodels/BaseSearchCountryViewModel');

        var SearchCountryViewModel = general.extendClass(BaseSearchCountryViewModel, function SearchCountryViewModelClass() {
            var parent = this.parent, // inherited from BaseSearchCountryViewModel
                data = this.Data; // inherited from BaseSearchCountryViewModel

            self.searchFocus = ko.observable(true);

            self.onFocus = function onFocus() {
                self.searchFocus(true);
            };

            return {
                SetCountry: parent.SetCountry,
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
