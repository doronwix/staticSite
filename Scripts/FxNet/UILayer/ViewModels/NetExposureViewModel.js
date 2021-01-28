define(
    'viewmodels/NetExposureViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'helpers/ObservableHashTable',
        'cachemanagers/ClientStateHolderManager',
        'cachemanagers/NetExposureManager',
        'initdatamanagers/SymbolsManager'
    ],
    function NetExposureViewModelDef(require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            observableHashTable = require('helpers/ObservableHashTable'),
            csHolderManager = require('cachemanagers/ClientStateHolderManager'),
            netExposureManager = require('cachemanagers/NetExposureManager'),
            symbolsManager = require('initdatamanagers/SymbolsManager');

        var NetExposureViewModel = function NetExposureViewModelClass() {
            var observableNetExposuresObject = {},
                observableNetExposuresCollection = new observableHashTable(ko, general, 'symbolId');

            function init() {
                setObservableNetExposuresObject();
                registerToDispatcher();
            }

            function registerToDispatcher() {
                netExposureManager.OnChange.Add(onNetExposureChange);
                csHolderManager.OnChange.Add(onCsHolderClientStateChange);
            }

            function toObservable(exposure) {
                return {
                    accountSymbolAmount: ko.observable(exposure.accountSymbolAmount),
                    status: exposure.status,
                    amount: ko.observable(exposure.amount),
                    symbolId: ko.observable(exposure.symbolId),
                    symbolName: ko.observable(symbolsManager.GetTranslatedSymbolById(exposure.symbolId))
                };
            }

            function onNetExposureChange(exposures) {
                for (var i = 0; i < exposures.length; i++) {
                    var exposure = exposures[i];

                    if (exposure.status === eStatus.Removed) {
                        observableNetExposuresCollection.Remove(exposure.symbolId);
                        continue;
                    }

                    var item = observableNetExposuresCollection.Get(exposure.symbolId);
                    if (!item) {
                        observableNetExposuresCollection.Add(toObservable(exposure));
                    }
                    else {
                        var delta = {
                            accountSymbolAmount: exposure.accountSymbolAmount,
                            amount: exposure.amount
                        };

                        observableNetExposuresCollection.Update(exposure.symbolId, delta);
                    }
                }
            }

            function onCsHolderClientStateChange() {
                var csHolder = csHolderManager.CSHolder;

                observableNetExposuresObject.netExposure(general.toNumeric(csHolder.netExposure));
            }

            function setObservableNetExposuresObject() {
                var csHolder = csHolderManager.CSHolder;

                observableNetExposuresObject.netExposure = ko.observable(general.toNumeric(csHolder.netExposure));
                observableNetExposuresObject.displayedInAccountCurrency = ko.observable(false);
            }

            return {
                Init: init,
                NetExposureCollection: observableNetExposuresCollection.Values,
                NetExposureInfo: observableNetExposuresObject
            };
        };

        return new NetExposureViewModel();
    }
);