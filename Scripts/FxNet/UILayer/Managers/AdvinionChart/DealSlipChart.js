define(
    'managers/AdvinionChart/DealSlipChart',
    [
        'require',
        'handlers/general',
        'knockout',
        'managers/AdvinionChart/AdvinionChartWrapper'
    ],
    function(require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            advinionChartWrapper = require('managers/AdvinionChart/AdvinionChartWrapper');

        var DealSlipChart = general.extendClass(advinionChartWrapper, function DealSlipChartClass() {
            var self = this,
                parent = this.parent, // inherited from AdvinionChartWrapper
                data = parent.Data, // inherited from AdvinionChartWrapper
                chartParams = {},
                koPostboxSubscriptions = [];

            function init(customSettings) {
                customSettings = general.extendType(customSettings, {
                    onExtraInitComplete: onInitComplete,
                    onExtraCreateComplete: subscribeToRelativeContainerResizeEvent,
                    onExtraPreloadFinished: onPreloadFinished
                });

                chartParams = customSettings;
                parent.init.call(self, customSettings);     // inherited from AdvinionChartWrapper
                data.chartId = customSettings.additionalStartArgs.containerSuffix;
            }

            function subscribeToRelativeContainerResizeEvent() {
                koPostboxSubscriptions.push(ko.postbox.subscribe("chart-container-resized", parent.ResizeChart));
            }

            function changeMode(isExpanded) {
                parent.ChangeMode(isExpanded ? eChartMode.Expanded : eChartMode.Collapsed);
            }

            function onInitComplete() {
                var isExpandedMode = chartParams.additionalStartArgs.isExpandedMode || chartParams.additionalStartArgs.isFullScreen;

                changeMode(isExpandedMode);
            }

            function onPreloadFinished() {
                parent.ResizeChart();
            }

            function dispose() {
                while (0 < koPostboxSubscriptions.length) {
                    koPostboxSubscriptions.pop().dispose();
                }

                parent.dispose.call(self);                  // inherited from DealViewModel
            }

            return {
                init: init,
                dispose: dispose,
                Data: data,
                ChangeSymbol: parent.ChangeSymbol,
                ChangeOrderDir: parent.ChangeOrderDir,
                DrawPriceLine: parent.DrawPriceLine,
                DeletePriceLine: parent.DeletePriceLine,
                ChangeMode: changeMode
            };
        });

        return DealSlipChart;
    }
);