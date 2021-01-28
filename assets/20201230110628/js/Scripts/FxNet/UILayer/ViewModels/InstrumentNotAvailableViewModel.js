define(
    'viewmodels/InstrumentNotAvailableViewModel',
    [
        'require',
        'handlers/general',
        'helpers/KoComponentViewModel',
        'StateObject!Transaction',
        'devicemanagers/StatesManager'
    ],
    function InstrumentNotAvailableDef(require) {
        var KoComponentViewModel = require('helpers/KoComponentViewModel'),
            stateObject = require('StateObject!Transaction'),
            general = require('handlers/general'),
            statesManager = require('devicemanagers/StatesManager');

        var InstrumentNotAvailableViewModel = general.extendClass(KoComponentViewModel, function InstrumentNotAvailableClass() {
            var self = this,
                currentSelectedInstrument,
                data = this.Data;

            function init() {
                setComputables();
            }

            function setComputables() {
                var isActiveQuote = stateObject.get('isActiveQuote'),
                    selectedInstrument = stateObject.get('selectedInstrument'),
                    observableContext = null,
                    isPureComputed = false;

                data.instrumentData = self.createComputed(function computeInstrumentData() {
                    var isActiveQuoteValue = isActiveQuote();

                    if (general.isNullOrUndefined(isActiveQuoteValue)) {
                        return {
                            isAvailable: true,
                            isChanged: false
                        };
                    } 

                    var isAvailable = !statesManager.States.IsMarketClosed() && isActiveQuoteValue,
                        isChanged = currentSelectedInstrument !== selectedInstrument();

                    currentSelectedInstrument = selectedInstrument();

                    return {
                        isAvailable: isAvailable,
                        isChanged: isChanged
                    };
                }, observableContext, isPureComputed);
            }

            return {
                Data: data,
                init: init
            };
        });

        var createViewModel = function () {
            var viewModel = new InstrumentNotAvailableViewModel();

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