define(
    'viewmodels/PrintExportViewModel',
    [
        'require',
        'managers/viewsmanager',
        'managers/PrintExportManager'
    ],
    function () {
        function PrintExportViewModel(_params) {
            var viewsManager = require('managers/viewsmanager'),
                printExportManager = require('managers/PrintExportManager'),
                params = _params || {},
                contextId = params.contextId || viewsManager.ActiveFormType(),
                historicalData = params.historicalData || viewsManager.Activeform().IsHistoricalData();

            function doPrint() {
                printExportManager.DoPrint(contextId, historicalData);
            }

            function doExport() {
                printExportManager.DoExport(contextId, historicalData);
            }

            return {
                DoPrint: doPrint,
                DoExport: doExport,
                CanPrint: printExportManager.CanPrint,
                CanExport: printExportManager.CanExport,
                CurrentExportComponent: printExportManager.CurrentExportComponent,
                DataRows: printExportManager.DataRows
            };
        }

        return {
            viewModel: PrintExportViewModel
        };
    }
);