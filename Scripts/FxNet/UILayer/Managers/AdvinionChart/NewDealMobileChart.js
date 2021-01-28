define(
    'managers/AdvinionChart/NewDealMobileChart',
    [
        'require',
        'knockout',
        'handlers/general',
        'managers/AdvinionChart/AdvinionChartWrapper'
    ],
    function(require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            advinionChartWrapper = require('managers/AdvinionChart/AdvinionChartWrapper');

        var NewDealMobileChart = general.extendClass(advinionChartWrapper, function NewDealMobileChartClass() {
            var self = this,
                parent = this.parent, // inherited from DealBaseViewModel
                data = parent.Data, // inherited from DealBaseViewModel
                koPostboxSubscriptions = [];

            function init(customSettings) {
                customSettings = $.extend(customSettings, {
                    onExtraInitComplete:general.emptyFn,
                    onExtraCreateComplete: onCreateComplete,
                    onExtraPreloadFinished: onPreloadFinished
                });

                parent.init.call(self, customSettings);     // inherited from DealBaseViewModel
            }

            function onCreateComplete() {
                subscribeToRelativeContainerResizeEvent();
            }

            function subscribeToRelativeContainerResizeEvent() {
                koPostboxSubscriptions.push(ko.postbox.subscribe("chart-container-resized", parent.ResizeChart));
                koPostboxSubscriptions.push(ko.postbox.subscribe("orientation-change", parent.ResizeChart));
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
                DeletePriceLine: parent.DeletePriceLine
            };
        });

        return NewDealMobileChart;
    }
);
