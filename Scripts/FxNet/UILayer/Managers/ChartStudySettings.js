define(
    'managers/ChartStudySettings',
    [
        'require',
        'knockout',
        'handlers/general',
        'managers/ChartSettingManager'
    ],
    function ChartStudySettings(require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            chartSettingManager = require('managers/ChartSettingManager'),
            comparesFavorites = ko.observable([]),
            indicatorsFavorites = ko.observable([]),
            eChartFavorites = {
                compares: 'chartComparesFavorites',
                indicators: 'chartIndicatorsFavorites'
            },
            disposables = [];

        //-------------------------------------------------------
        function init() {
            setObservables();
            setSubscribers();
        }

        //-------------------------------------------------------
        function setObservables() {
            disposables.push(comparesFavorites);
            disposables.push(indicatorsFavorites);

            comparesFavorites(getComparesFavorites());
            indicatorsFavorites(getIndicatorsFavorites());
        }

        //-------------------------------------------------------
        function setSubscribers() {
            disposables.push(comparesFavorites.subscribe(updateComparesFavorites));
            disposables.push(indicatorsFavorites.subscribe(updateIndicatorFavorites));
        }

        //-------------------------------------------------------
        function getComparesFavorites() {
            return getFavorites(eChartFavorites.compares);
        }

        //-------------------------------------------------------
        function getIndicatorsFavorites() {
            return getFavorites(eChartFavorites.indicators);
        }

        //-------------------------------------------------------
        function getFavorites(favoriteName) {
            var favorites;

            if (chartSettingManager.Chart().chartFavorites) {
                favorites = chartSettingManager.Chart().chartFavorites[favoriteName];
            }

            return favorites || [];
        }

        //-------------------------------------------------------
        function updateComparesFavorites(favorites) {
            updateFavorites(eChartFavorites.compares, favorites);
        }

        //-------------------------------------------------------
        function updateIndicatorFavorites(favorites) {
            updateFavorites(eChartFavorites.indicators, favorites);
        }

        //-------------------------------------------------------
        function updateFavorites(favoriteName, favorites) {
            if (general.isNullOrUndefined(chartSettingManager.Chart().chartFavorites)) {
                chartSettingManager.Chart().chartFavorites = {};
            }

            chartSettingManager.Chart().chartFavorites[favoriteName] = favorites;

            chartSettingManager.SaveChart();
        }

        //-------------------------------------------------------
        function getSettings() {
            return chartSettingManager.Chart().chartIndicatorsSettings;
        }

        //-------------------------------------------------------
        function setSettings(indicatorSettings) {
            chartSettingManager.Chart().chartIndicatorsSettings = indicatorSettings;

            chartSettingManager.SaveChart();
        }

        //-------------------------------------------------------
        function dispose() {
            var disposableObject;

            for (var i = 0, j = disposables.length; i < j; i++) {
                disposableObject = disposables[i];

                if (disposableObject &&general.isFunctionType(disposableObject.dispose)) {
                    disposableObject.dispose();
                }
            }

            disposables.length = 0;
        }

        //-------------------------------------------------------
        return {
            Init: init,
            Dispose: dispose,
            ComparesFavorites: comparesFavorites,
            IndicatorsFavorites: indicatorsFavorites,
            GetSettings: getSettings,
            SetSettings: setSettings
        };
    }
);