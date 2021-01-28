define(
    'modules/ExportModule',
    [
        "require",
        "knockout",
        'managers/viewsmanager',
        'devicemanagers/AlertsManager',
        "Dictionary",
        'handlers/general',
        'configuration/initconfiguration',
        "helpers/observabledataset"
    ],
    function (require) {
        var ko = require("knockout"),
            ViewsManager = require('managers/viewsmanager'),
            AlertsManager = require('devicemanagers/AlertsManager'),
            general = require('handlers/general'),
            initConfiguration = require('configuration/initconfiguration'),
            Dictionary = require("Dictionary");

        function ExportModule() {
            var dataSet = new ObservableDataSet(ko, general),
                dataRows = ko.observable(),
                processCsv = ko.observable(false),
                componentSubscriber,
                dataSetIsLoadingDataSubScriber,
                disabled,
                canExport,
                currentExportComponent;

            function setObservables() {
                disabled = ko.observable();

                canExport = ko.pureComputed(function readyForExport() {
                    return !(disabled() || processCsv());
                }).extend({ notify: "always" });

                currentExportComponent = ko.observable();//"default-empty-component");
                currentExportComponent.extend({ empty: true });
                currentExportComponent.extend({ notify: "always" });
            }

            function setSubscribers() {
                disabled.subscribeTo("printableDataAvailable", true, check4Data2Print);

                ko.postbox.subscribe("active-view", function (formType) {
                    //internal disable print/export before each form change
                    ko.postbox.publish("printableDataAvailable", {
                        reset: "on eAppEvents.formChangeEvent",
                        dataAvailable: false,
                        viewType: ViewsManager.ActiveFormType(),
                        nextViewType: formType,
                        viewModel: "ExportViewModel"
                    });
                });
            }

            function exportCsvHandler(view, historicalData) {
                if (disabled()) {
                    return;
                }
                processCsv(true);
                if (historicalData) {
                    exportHistoricalData(view);
                } else {
                    exportTableElementToCsv(eClientExportTable[view]);
                    processCsv(false);
                }
            }

            function exportHistoricalData(view) {
                dataSet.Clean();

                if (componentSubscriber) {
                    componentSubscriber.dispose();
                }

                componentSubscriber = ko.postbox.subscribe(eAppEvents.exportDataLoadedEvent, function (params) {
                    if (componentSubscriber) {
                        componentSubscriber.dispose();
                    }

                    var cols = general.cloneHardCopy(params.vm.DsColumns);
                    cols.DAL.onLoad = dataSetOnloadHandler.bind(null, cols.Filter);
                    
                    // switching between active/executed/deleted limits needs filter update
                    cols.Filter = currentExportComponent() == eComponent[eForms.Deals] ? general.cloneHardCopy(ViewsManager.VmLimits.Filter) : cols.Filter;

                    cols.Filter.pagesize = initConfiguration.CsvConfiguration.pageSize;
                    cols.Filter.exportdata = true;
                    dataSet.UpdateColumnModel(cols);

                    if (dataSetIsLoadingDataSubScriber) {
                        dataSetIsLoadingDataSubScriber.dispose();
                    }

                    dataSetIsLoadingDataSubScriber = dataSet.IsLoadingData.subscribe(function (isLoading) {
                        if (!isLoading && dataSet.HasRecords()) {
                            dataRows(dataSet.DataRows());
                            dataSetIsLoadingDataSubScriber.dispose();
                            exportTableElementToCsv(eServerExportTable[ViewsManager.ActiveFormType()]);
                            currentExportComponent(null);
                            processCsv(false);
                        }
                    });

                    dataSet.Load();
                });

                currentExportComponent(eComponent[view]);
            }

            function dataSetOnloadHandler(filter, result) {
                filter.exportdata = false;
                filter.pagesize = null;
                if (eOperationStatus[result["status"]] === eOperationStatus.ExportValidationFailed) {
                    AlertsManager.UpdateAlert(AlertTypes.ServerResponseAlert, Dictionary.GetItem("ExportValidationFailedMsgTitle"), Dictionary.GetItem("ExportValidationFailedMsgText"), "");
                    AlertsManager.PopAlert(AlertTypes.ServerResponseAlert);
                    processCsv(false);
                }
            }

            function check4Data2Print(newVal) {
                newVal = general.isObjectType(newVal) ? newVal : { dataAvailable: newVal };

                //skip if active view is not the same as the active view from sender
                if (newVal.viewType !== ViewsManager.ActiveFormType()) {
                    return disabled();
                }

                return !newVal.dataAvailable;
            }

            function exportTableElementToCsv(tableName) {
                var table = document.getElementById(tableName),
                    rowLength = table.rows.length,
                    colLength = table.rows[0].cells.length,
                    tableString = cTextMarks.ZeroWidthNoBreakSpace,
                    fileName = tableName.replace("tbl", "").replace("Export", "").replace(/([A-Z])/g, " $1").trim() + ".csv",
                    cellText,
                    commasNum;

                // set filter string
                tableString += (table.caption ? (table.caption.innerText || table.caption.textContent) : "") + Array(colLength + 1).join(",") + "\r\n";

                // get column headers
                for (var i = 0; i < colLength; i++) {
                    cellText = (table.rows[0].cells[i].innerText || table.rows[0].cells[i].textContent).replace(/(?:\r\n|\r|\n)/g, " ").trim();
                    commasNum = table.rows[0].cells[i].hasAttribute("colspan") ? parseInt(table.rows[0].cells[i].getAttribute("colspan")) : 1;

                    tableString += cellText.split(",").join("") + Array(commasNum + 1).join(","); // empty column headers workaround
                }

                tableString = tableString.substring(0, tableString.length - 1) + "\r\n";

                // get row data
                for (var j = 1; j < rowLength; j++) {
                    for (var k = 0; k < table.rows[j].cells.length; k++) {
                        cellText = (table.rows[j].cells[k].innerText || table.rows[j].cells[k].textContent).replace(/(?:\r\n|\r|\n)/g, " ").trim();
                        tableString += cellText.split(",").join("");
                        commasNum = table.rows[j].cells[k].hasAttribute("colspan") ? parseInt(table.rows[j].cells[k].getAttribute("colspan")) : 1;
                        tableString += Array(commasNum + 1).join(",");
                    }
                    tableString += "\r\n";
                }

                if (navigator.msSaveBlob) { // IE 10.0, IE 11.0
                    var blob = new Blob([tableString], { type: "text/csv;charset=utf-8;" });
                    navigator.msSaveBlob(blob, fileName);
                } else { // Chrome, FF
                    var anchor = document.createElement("a");
                    anchor.style.position = "absolute";
                    anchor.style.top = "-1000000px";
                    document.body.appendChild(anchor);
                    anchor.setAttribute("href", "data:text/csv;charset=utf-8,\uFEFF" + cTextMarks.ZeroWidthNoBreakSpace + encodeURIComponent(tableString));
                    anchor.setAttribute("target", "_blank");
                    anchor.setAttribute("download", fileName);

                    anchor.click();
                    setTimeout(function () {
                        document.body.removeChild(anchor);
                    }, 500);
                }
            }

            setObservables();
            setSubscribers();

            return {
                DataRows: dataRows,
                ExportCsvHandler: exportCsvHandler,
                CurrentExportComponent: currentExportComponent,
                ProcessCsv: processCsv,
                CanExport: canExport
            };
        }

        return new ExportModule();
    }
);
