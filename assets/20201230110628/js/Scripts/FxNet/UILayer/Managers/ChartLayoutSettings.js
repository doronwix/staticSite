define(
    'managers/ChartLayoutSettings',
    [
        'require',
        'handlers/general',
        'managers/ChartSettingManager',
        'initdatamanagers/InstrumentsManager'
    ],
    function ChartLayoutSettings(require) {
        var chartSettingManager = require('managers/ChartSettingManager'),
            general = require('handlers/general'),
            instrumentsManager = require('initdatamanagers/InstrumentsManager'),
            maxTileCount = 4;

        //-------------------------------------------------------
        function init() {
            var settingsChanged = false;

            if (general.isEmptyValue(chartSettingManager.Chart().tileChartSettings)) {
                chartSettingManager.Chart().tileChartSettings = buildInitialConfiguration();
                settingsChanged = true;
            }

            if (areInstrumentsMissing()) {
                chartSettingManager.Chart().tileChartSettings = replaceMissingInstruments();
                settingsChanged = true;
            }

            if (settingsChanged) {
                chartSettingManager.SaveChart();
            }
        }

        //-------------------------------------------------------
        function buildInitialConfiguration() {
            var instrumentIds = getValidInstrumentIds();

            return [
                { instrumentId: instrumentIds[0] },
                { instrumentId: instrumentIds[1] },
                { instrumentId: instrumentIds[2] },
                { instrumentId: instrumentIds[3] }
            ];
        }

        //-------------------------------------------------------
        function getValidInstrumentIds() {
            var favoriteInstruments = instrumentsManager.GetFavoriteInstruments() || [],
                validInstruments = favoriteInstruments.filter(isValidInstrument);

            if (validInstruments.length >= maxTileCount) {
                return validInstruments.map(getId);
            }

            var mainInstruments = instrumentsManager.GetMainMostPopularInstruments(),
                validMainInstruments = mainInstruments.filter(isValidInstrument);

            validInstruments = validInstruments.concat(validMainInstruments);
            if (validInstruments.length >= maxTileCount) {
                return validInstruments.map(getId);
            }

            var returnInstumetsIdsList = validInstruments.map(getId);
            for (var idx = maxTileCount - validInstruments.length; idx > 0; idx--) {
                returnInstumetsIdsList.push(3631);
            }

            return returnInstumetsIdsList;
        }

        //-------------------------------------------------------
        function isValidInstrument(instrument) {
            return instrumentsManager.HasInstrumentId(instrument.id);
        }

        //-------------------------------------------------------
        function getId(instrument) {
            return instrument.id;
        }

        //-------------------------------------------------------
        function getInstrumentId(settings) {
            return settings.instrumentId;
        }

        //-------------------------------------------------------
        function areInstrumentsMissing() {
            var tileInstruments = getTileInstruments();
            var validInstruments = tileInstruments.filter(instrumentsManager.HasInstrumentId);

            return validInstruments.length < tileInstruments.length;
        }

        //-------------------------------------------------------
        function replaceMissingInstruments() {
            var settings = chartSettingManager.Chart().tileChartSettings,
                tileInstrumentIds = getTileInstruments(),
                validNotUsedInstrumentIds = getValidInstrumentIds().filter(function (id) { return !tileInstrumentIds.contains(id); }),
                index = -1;

            for (var i = 0; i < tileInstrumentIds.length; i++) {
                var instrumentId = tileInstrumentIds[i];

                if (instrumentsManager.HasInstrumentId(instrumentId)) {
                    continue;
                }

                settings[i].instrumentId = validNotUsedInstrumentIds[++index];
            }

            return settings;
        }

        //-------------------------------------------------------
        function getSettings(chartId) {
            if (chartId === '') {
                return chartSettingManager.Chart().chartUserSettings;
            } else {
                return chartSettingManager.Chart().tileChartSettings[chartId];
            }
        }

        //-------------------------------------------------------
        function updateSettings(chartId, chartSettings) {
            if (chartId === '') {
                chartSettingManager.Chart().chartUserSettings = chartSettings;
            } else {
                chartSettingManager.Chart().tileChartSettings[chartId] = chartSettings;
            }

            chartSettingManager.SaveChart();
        }

        //-------------------------------------------------------
        function getTileInstruments() {
            return chartSettingManager.Chart().tileChartSettings.map(getInstrumentId);
        }

        return {
            Init: init,
            GetSettings: getSettings,
            GetTileInstruments: getTileInstruments,
            UpdateSettings: updateSettings
        };
    }
);