define(
    'modules/FavoriteInstrumentsManager',
    [
        "require",
        'enums/DataMembersPositions',
        'customEnums/ViewsEnums',
        'initdatamanagers/InstrumentsManager',
        'dataaccess/dalInstruments',
        'configuration/initconfiguration',
        'handlers/general',
    ],
    function FavoriteInstrumentsManager(require) {
        var InstrumentsManager = require('initdatamanagers/InstrumentsManager'),
            dalInstruments = require('dataaccess/dalInstruments'),
            general = require('handlers/general'),
            initConfiguration = require('configuration/initconfiguration');

        function getFavoriteInstrumentIds() {
            return InstrumentsManager.GetCustomizedUiOrder().map(function (el) { return el[eQuotesUIOrder.InstrumentID]; });
        }

        //-----------------------------------------------------------
        function addFavoriteInstrument(instrumentId, callback) {
            var customizedInstruments = InstrumentsManager.GetCustomizedUiOrder();

            if (isFavoriteInstrument(instrumentId)) {
                if (general.isFunctionType(callback)) {
                    callback("{\"status\": 1 }");
                }

                return;
            }

            var favoriteInstrumentIds = getFavoriteInstrumentIds();

            if (favoriteInstrumentIds.length >= initConfiguration.FavoriteInstrumentsConfiguration.favoriteInstrumentsLimit) {
                var message = String.format(Dictionary.GetItem("FavoritesList_MaximumLimitReached"), initConfiguration.FavoriteInstrumentsConfiguration.favoriteInstrumentsLimit);

                AlertsManager.UpdateAlert(AlertTypes.SimpleClientAlert, null, message, '');
                AlertsManager.PopAlert(AlertTypes.SimpleClientAlert);

                if (general.isFunctionType(callback)) {
                    callback("{\"status\": 0 }");
                }

                return;
            }

            favoriteInstrumentIds.unshift(instrumentId);

            var instrument = InstrumentsManager.GetInstrument(instrumentId);

            if (!instrument) {
                if (general.isFunctionType(callback)) {
                    callback("{\"status\": 0 }");
                }

                return;
            }

            var instrumentData = [[instrumentId, instrument.defaultDealSize]];
            customizedInstruments = instrumentData.concat(customizedInstruments);

            updateCustomizedUIOrderData(customizedInstruments);
            saveUIOrder(favoriteInstrumentIds, callback);
        }

        //-----------------------------------------------------------
        function removeFavoriteInstrument(instrumentId, callback) {
            if (!isFavoriteInstrument(instrumentId)) {
                if (general.isFunctionType(callback)) {
                    callback("{\"status\": 1 }");
                }

                return;
            }

            var favoriteInstrumentIds = getFavoriteInstrumentIds().filter(function (el) { return el !== instrumentId; });
            var customizedInstruments = InstrumentsManager.GetCustomizedUiOrder().filter(function (el) { return el[eQuotesUIOrder.InstrumentID] != instrumentId });

            updateCustomizedUIOrderData(customizedInstruments);
            saveUIOrder(favoriteInstrumentIds, callback);
        }

        //-----------------------------------------------------------
        function isFavoriteInstrument(instrumentId) {
            return getFavoriteInstrumentIds().indexOf(instrumentId) >= 0;
        }

        //-----------------------------------------------------------
        function saveUIOrder(favoriteInstrumentList, callback) {
            dalInstruments.ChangeUIOrder(favoriteInstrumentList, callback);
        }

        //-----------------------------------------------------------
        function changeUIOrder(favoriteInstrumentList, skipUpdate, callback) {
            if (!favoriteInstrumentList) {
                if (general.isFunctionType(callback)) {
                    callback("{\"status\": 1 }");
                }

                return;
            }

            var customizedInstruments = [];

            for (var i = 0; i < favoriteInstrumentList.length; i++) {
                var instrumentId = favoriteInstrumentList[i];
                var instrument = InstrumentsManager.GetInstrument(instrumentId);

                customizedInstruments.push([instrumentId, instrument.defaultDealSize]);
            }

            updateCustomizedUIOrderData(customizedInstruments, skipUpdate);
            saveUIOrder(favoriteInstrumentList, callback);
        }

        //-----------------------------------------------------------
        function updateCustomizedUIOrderData(uiOrder, skipUpdate) {
            uiOrder = uiOrder || [];
            InstrumentsManager.SetCustomizedUiOrder(uiOrder, skipUpdate);
        }

        return {
            GetFavoriteInstrumentIds: getFavoriteInstrumentIds,
            AddFavoriteInstrument: addFavoriteInstrument,
            RemoveFavoriteInstrument: removeFavoriteInstrument,
            IsFavoriteInstrument: isFavoriteInstrument,
            ChangeUIOrder: changeUIOrder
        };
    }
);