define(
    'viewmodels/common/ComponentLoader',
    [
        'require',
        'knockout',
        'handlers/general',
        'helpers/KoComponentViewModel'
    ],
    function (require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            KoComponentViewModel = require('helpers/KoComponentViewModel');

        var ComponentLoader = general.extendClass(KoComponentViewModel, function (params) {
            var data = this.Data;

            function setObservables() {
                data.isLoading = ko.observable(true);
                data.viewType = ko.observable();
            }

            function init() {
                setObservables();

                if (!general.isNullOrUndefined(params)) {
                    data.viewType(params.viewType);
                }
            }

            return {
                init: init,
                Data: data
            };
        });

        var createViewModel = function (params) {
            var viewModel = new ComponentLoader(params);
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
