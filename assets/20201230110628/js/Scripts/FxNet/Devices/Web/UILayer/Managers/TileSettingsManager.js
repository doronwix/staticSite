define(
    'devicemanagers/TileSettingsManager',
    [
        'require',
        'managers/ChartSettingManager',
        'handlers/general',
    ],
    function TileSettingsManager(require) {
        var chartSettingManager = require('managers/ChartSettingManager'),
            general = require('handlers/general');

        function init(settings) {
            settings = settings || {};
            chartSettingManager.Chart().tileSettings = chartSettingManager.Chart().tileSettings || {};

            if (!general.isDefinedType(chartSettingManager.Chart().tileSettings.activeTileId)) {
                chartSettingManager.Chart().tileSettings.activeTileId = 0;
            }

            if (!general.isDefinedType(chartSettingManager.Chart().tileSettings.layoutId) ||
                isPageFittingOtherLayout(settings, chartSettingManager.Chart())) {
                chartSettingManager.Chart().tileSettings.layoutId = settings.initialLayout || eTileLayout.FourSplit;
            }

            chartSettingManager.SaveChart();
        }

        function isPageFittingOtherLayout(settings, chart) {
            return !general.isNullOrUndefined(settings.initialLayout) &&
                chart.tileSettings.layoutId !== settings.initialLayout &&
                chart.tileSettings.layoutId !== eTileLayout.Single;
        }

        function getActiveTileId() {
            return chartSettingManager.Chart().tileSettings.activeTileId;
        }

        function getLayout() {
            return chartSettingManager.Chart().tileSettings.layoutId;
        }

        function updateLayout(layoutId) {
            var settings = getSettings();

            settings.layoutId = layoutId;

            updateSettings(settings);
        }

        function updateActiveTileId(activeTileId) {
            var settings = getSettings();

            settings.activeTileId = activeTileId;

            updateSettings(settings);
        }

        function getSettings() {
            return chartSettingManager.Chart().tileSettings;
        }

        function updateSettings(tileSettings) {
            chartSettingManager.Chart().tileSettings = general.extendType(chartSettingManager.Chart().tileSettings, tileSettings);
            chartSettingManager.SaveChart();
        }

        return {
            Init: init,
            GetLayout: getLayout,
            GetActiveTileId: getActiveTileId,
            UpdateActiveTileId: updateActiveTileId,
            UpdateLayout: updateLayout
        };
    }
);
