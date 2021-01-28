define(
    'managers/PrintExportManager',
    [
        'require',
        'knockout',
        'modules/PrintModule',
        'modules/ExportModule'
    ],
    function () {
        function PrintExportManager(params) {
            var ko = require('knockout'),
                printModule = require('modules/PrintModule'),
                exportModule = require('modules/ExportModule'),
                currentExportComponent, dataRows;

            function isWorkingNow() {
                return printModule.ProcessPrint() || exportModule.ProcessCsv();
            }

            function setComputables() {
                dataRows = ko.pureComputed(function () {
                    var data = null;

                    if (printModule.ProcessPrint()) {
                        data = printModule.DataRows();
                    }

                    if (exportModule.ProcessCsv()) {
                        data = exportModule.DataRows();
                    }

                    return data;
                });

                currentExportComponent = ko.pureComputed(function () {
                    return printModule.CurrentExportComponent() || exportModule.CurrentExportComponent();
                });

                currentExportComponent.extend({ empty: true });
                currentExportComponent.extend({ notify: "always" });
            }

            function doPrint(contextId, historicalData) {
                if (!printModule.CanPrint()) {
                    return;
                }
                printModule.PrintHandler(contextId, historicalData);
            }

            function doExport(contextId, historicalData) {
                if (!exportModule.CanExport()) {
                    return;
                }
                exportModule.ExportCsvHandler(contextId, historicalData);
            }

            setComputables();

            return {
                DoPrint: doPrint,
                DoExport: doExport,
                CanPrint: printModule.CanPrint,
                CanExport: exportModule.CanExport,
                IsPrintingNow: printModule.ProcessPrint,
                CurrentExportComponent: currentExportComponent,
                IsWorkingNow: isWorkingNow,
                DataRows: dataRows
            }
        }

        return new PrintExportManager();
    });