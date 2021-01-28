define(
    'deviceviewmodels/OpenDealsViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'helpers/KoComponentViewModel',
        'configuration/initconfiguration',
        'deviceviewmodels/OpenDealsModule',
        'initdatamanagers/Customer',
    ],
    function (require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            KoComponentViewModel = require('helpers/KoComponentViewModel'),
            openDealsGridSettings = require('configuration/initconfiguration').OpenDealsConfiguration,
            openDealsModule = require('deviceviewmodels/OpenDealsModule'),
            Model = new openDealsModule(),
            customer = require('initdatamanagers/Customer');

        Model.Init(openDealsGridSettings);

        var OpenDealsViewModel = general.extendClass(KoComponentViewModel, function OpenDealsViewModelClass() {
            var self = this,
                parent = this.parent, // inherited from KoComponentViewModel
                data = this.Data, // inherited from CloseDealBaseViewModel
                plDeltaTolerance = 1;

            function init() {
                parent.init.call(self);

                setComputables();
            }

            function setComputables() {
                data.maxPlLength = ko.pureComputed(function computeMaxPlLength() {
                    var curentMaxPlLength = Math.max.apply(null, ko.utils.arrayMap(Model.OpenDeals(), mapOpenDeal));

                    if (self._previousMaxPlLength) {
                        self._previousMaxPlLength = curentMaxPlLength;
                    }

                    curentMaxPlLength = (Math.abs(self._previousMaxPlLength - curentMaxPlLength) > plDeltaTolerance)
                        ? curentMaxPlLength
                        : self._previousMaxPlLength = curentMaxPlLength;

                    return curentMaxPlLength;
                }).extend({ throttle: 500 });
            }

            function mapOpenDeal(openDeal) {
                var options = { currencyId: customer.prop.baseCcyId(), value: Number.fromStr(openDeal.pl()) };

                return Format.toNumberWithCurrency(options.value, options).length;
            }

            return {
                init: init,
                Data: data,
                model: Model
            };
        });

        var createViewModel = function (params) {
            var viewModel = new OpenDealsViewModel(params);
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