define(
    'deviceviewmodels/MainGridInstrumentSearchViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'viewmodels/QuotesSubscriber',
        'managers/viewsmanager',
        'viewmodels/BaseInstrumentSearchViewModel'
    ],
    function MainGridInstrumentSearchDef(require) {
        var QuotesSubscriber = require('viewmodels/QuotesSubscriber'),
            general = require('handlers/general'),
            viewsManager = require('managers/viewsmanager'),
            instrumentSearchViewModel = require('viewmodels/BaseInstrumentSearchViewModel');

        var MainGridInstrumentSearchViewModel = general.extendClass(instrumentSearchViewModel, function MainGridInstrumentSearchClass() {
            var self = this,
                parent = this.parent, // inherited from KoComponentViewModel
                data = this.Data, // inherited from KoComponentViewModel
                quotesSubscriber = new QuotesSubscriber();

            function init(settings) {
                parent.init.call(self, settings);

                setSubscribers();
            }

            function setSubscribers() {
                self.subscribeTo(data.selected, function selectedInstrumentChanged(instrument) {
                    if (!instrument || !instrument.id || instrument.id <= -1) {
                        return;
                    }

                    var quote = quotesSubscriber.GetQuote(instrument.id),
                        isActiveQuote = !general.isNullOrUndefined(quote) && quote.isActiveQuote() ? true : null;

                    viewsManager.SwitchViewVisible(eForms.Transaction, { 'instrumentId': instrument.id, isActiveQuote: isActiveQuote });
                });
            }

            return {
                init: init
            };
        });

        var createViewModel = function (params) {
            var viewModel = new MainGridInstrumentSearchViewModel();
            viewModel.init(params);

            return viewModel;
        };

        return {
            viewModel: {
                createViewModel: createViewModel
            }
        };
    }
);
