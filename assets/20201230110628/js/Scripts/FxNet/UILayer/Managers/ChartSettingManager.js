define(
    'managers/ChartSettingManager',
    [
        "require",
        'managers/CustomerProfileManager',
        "modules/LoadFromPouchDB!chart",
        'dataaccess/dalPouchDB',
        'JSONHelper',
        'global/debounce'
    ],
    function ChartSettingManager(require) {
        var customerProfileManager = require('managers/CustomerProfileManager'),
            requireChartDoc = require("modules/LoadFromPouchDB!chart"),
            JSONHelper = require('JSONHelper'),
            dalPouchDB = require('dataaccess/dalPouchDB');

        var chartDocId = "chart";
        var period = 1000;
        var chart = {};

        var saveChart = debounce(function saveChartHandler() {
            //chart without methods
            var chartToSave = JSONHelper.STR2JSON("ChartSettingManager:saveChart", JSON.stringify(chart));
            dalPouchDB.Save(chartDocId, chartToSave);

        }, period);

        function getChart() {
            return chart;
        }

        function init() {
            if (requireChartDoc) {
                chart = requireChartDoc;
            }
            else {
                // try to load from legacy
                chart.chartUserSettings = customerProfileManager.OldChart().chartUserSettings || {};
                chart.tileChartSettings = customerProfileManager.OldChart().tileChartSettings || [];
                chart.tileSettings = customerProfileManager.OldChart().tileSettings || {};
                chart.chartFavorites = customerProfileManager.OldChart().chartFavorites || {};
                chart.chartIndicatorsSettings = customerProfileManager.OldChart().chartIndicatorsSettings || [];
                chart.chartsZoomSettings = customerProfileManager.OldChart().chartsZoomSettings || {};
            }
        }

        init();

        return {
            Chart: getChart,
            SaveChart: saveChart
        };
    }
);
