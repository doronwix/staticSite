define(
    'modules/PrintModule',
    [
        "require",
        "knockout",
        'managers/viewsmanager',
        'devicemanagers/AlertsManager',
        "Dictionary",
        'handlers/general',
        "helpers/observabledataset",
        "modules/Printer",
        "configuration/initconfiguration"
    ],
    function (require) {
        var ko = require("knockout"),
            ViewsManager = require('managers/viewsmanager'),
            AlertsManager = require('devicemanagers/AlertsManager'),
            general = require('handlers/general'),
            Dictionary = require("Dictionary"),
            ObservableDataSet = require("helpers/observabledataset"),
            initConfiguration = require("configuration/initconfiguration"),
            printer = require("modules/Printer");

        function PrintModule() {
            var dataSet = new ObservableDataSet(ko, general),
                dataRows = ko.observable(),
                processPrint = ko.observable(false),
                componentSubscriber,
                dataSetIsLoadingDataSubScriber,
                disabled,
                canPrint,
                currentExportComponent;

            function setObservables() {
                disabled = ko.observable();

                canPrint = ko.pureComputed(function readyForPrint() {
                    return !(disabled() || processPrint());
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

            function exportPrintHandler(view, historicalData) {
                if (disabled()) {
                    return;
                }
                processPrint(true);
                if (historicalData) {
                    exportHistoricalData(view);
                } else {
                    printElement(eClientExportTable[view])
                    .fin(function () {
                        processPrint(false);
                    })
                    .done();

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
                    cols.DAL.onLoad = dataSetOnloadHandler;

                    // switching between active/executed/deleted limits needs filter update
                    cols.Filter = currentExportComponent() == eComponent[eForms.Deals] ? general.cloneHardCopy(ViewsManager.VmLimits.Filter) : cols.Filter;

                    cols.Filter.pagesize = initConfiguration.PrintConfiguration.pageSize;
                    cols.Filter.exportdata = true;
                    dataSet.UpdateColumnModel(cols);

                    if (dataSetIsLoadingDataSubScriber) {
                        dataSetIsLoadingDataSubScriber.dispose();
                    }

                    dataSetIsLoadingDataSubScriber = dataSet.IsLoadingData.subscribe(function (isLoading) {
                        if (!isLoading && dataSet.HasRecords()) {
                            dataRows(dataSet.DataRows());
                            dataSetIsLoadingDataSubScriber.dispose();
                            printElement(eServerExportTable[ViewsManager.ActiveFormType()])
                            .then(function () {
                                currentExportComponent(null);
                                processPrint(false);
                            })
                            .done();
                        }
                    });

                    dataSet.Load();
                });

                currentExportComponent(eComponent[view]);
            }

            function dataSetOnloadHandler(result) {
                if (eOperationStatus[result["status"]] === eOperationStatus.ExportValidationFailed) {
                    AlertsManager.UpdateAlert(AlertTypes.ServerResponseAlert, Dictionary.GetItem("ExportValidationFailedMsgTitle"), Dictionary.GetItem("ExportValidationFailedMsgText"), "");
                    AlertsManager.PopAlert(AlertTypes.ServerResponseAlert);
                    processPrint(false);
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

            function printElement(elementSelector) {
                var contentsNode = document.getElementById(elementSelector);
                if (!contentsNode) {
                    return;
                }
                return printer.print(contentsNode.outerHTML);
            }

            setObservables();
            setSubscribers();

            return {
                DataRows: dataRows,
                PrintHandler: exportPrintHandler,
                CurrentExportComponent: currentExportComponent,
                ProcessPrint: processPrint,
                CanPrint: canPrint
            };
        }

        return new PrintModule();
    }
);
