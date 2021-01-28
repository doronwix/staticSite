define(
    'deviceviewmodels/Deals/DealNoteViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'helpers/KoComponentViewModel',
        'Dictionary'
    ],
    function DealNoteDef(require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            Dictionary = require('Dictionary'),
            KoComponentViewModel = require('helpers/KoComponentViewModel');

        var DealNoteViewModel = general.extendClass(KoComponentViewModel, function DealNoteClass(params) {
            var data = this.Data;

            function setObservables() {
                data.dealNoteTitle = ko.observable(params.dealNoteLabel);
                data.toolTipTitle = ko.observable(params.toolTipTitle);
                data.dealNoteDateText = ko.observable(String.format(Dictionary.GetItem('dealNoteDateText', 'deals_Notes'), params.dealNoteDateText));
            }

            function init() {
                setObservables();
            }

            return {
                Data: data,
                init: init
            }
        });

        var createViewModel = function (params) {
            var viewModel = new DealNoteViewModel(params);

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
