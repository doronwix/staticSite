/*globals clone:false, $viewModelsManager:false, eViewState: false, general.str2Date:false, eViewTypes:false, eActivityLogFilterType:false, eActivityLog:false, dalActivityLog:false, eErrorSeverity:false, ObservableDataSet:faLse, ActivityLogModel: true*/
var ActivityLogViewModel = function (ko, general,dalActivityLog, systemInfo) {
    var self = this;
    var dateFrom = ko.observable("").extend({ dirty: false });
    var dateTo = ko.observable("").extend({ dirty: false });
    var recordsRendered = ko.observable(false).extend({ deferred: true });
    var filterBy = ko.observable("");
    var hasDataSubscriber;
    var isLoadingSubscriber;

    var filterTypes = ko.computed(function () {
        var selectedValue = filterBy();
        var types = [];

        if (selectedValue in eActivityLogFilterType) {
            types.push(eActivityLogFilterType[selectedValue]);
        } else {
            for (var name in eActivityLogFilterType) {
                types.push(eActivityLogFilterType[name]);
            }
        }

        return "[" + types.join(",") + "]";
    }, self);

    var dsColumns = {
        columns: [{
            name: "DateTime",
            dataIndex: eActivityLog.DateTime
        }, {
            name: "Type",
            dataIndex: eActivityLog.MessageType
        }, {
            name: "Source",
            dataIndex: eActivityLog.SourceType
        }, {
            name: "Message",
            dataIndex: eActivityLog.Message
        }],
        pageSizes: 5,
        statusField: "status",
        totalField: "totalItems",
        dataField: "activityLogs",
        pagination: {
            pagesPerPage: 5,
            pageIndexField: "page",
            pageSizeField: "pagesize"
        },
        Filter: {
            page: 1,
            pagesize: 20,
            from: dateFrom,
            to: dateTo,
            filterTypes: filterTypes
        },
        DAL: {
            reference: dalActivityLog.LoadActivityLog,
            callerName: "ActivityLogControl/onLoadComplete",
            errorSeverity: eErrorSeverity.medium
        }
    };

    var dataSet = new ObservableDataSet(ko, general, dsColumns);

    var registerObservableStartUpEvent = function () {
        $viewModelsManager.VManager.GetActiveFormViewProperties(eViewTypes.vActivityLog).state.subscribe(function (state) {
            switch (state) {
                case eViewState.Start:
                    start();
                    break;
                case eViewState.Stop:
                    stop();
                    break;
                case eViewState.Refresh:
                    dataSet.Load();
                    $viewModelsManager.VManager.GetActiveFormViewProperties(eViewTypes.vActivityLog).state(eViewState.Initial);
                    break;
            }
        });
    };

    var init = function () {
        registerObservableStartUpEvent();
        dataSet.Init();
        setValidation();
    };

    var start = function () {
        hasDataSubscriber = dataSet.HasRecords.subscribe(function (hasData) {
            if (!hasData) {
                recordsRendered(false);
            }

            ko.postbox.publish("printableDataAvailable", {
                dataAvailable: hasData,
                viewType: $viewModelsManager.VManager.ActiveFormType(),
                viewModel: 'ActivityLogModel'
            });
        });

        isLoadingSubscriber = dataSet.IsLoadingData.subscribe(function (isLoading) {
            if (isLoading) {
                recordsRendered(false);
            }
        });

        setFilterToDefault();
        dataSet.ApplyFilter();
    };

    var setFilterToDefault = function () {
        var defaultDaysBack = systemInfo.get('config').ActivityLogFromDateDefaultRange;
        dateFrom(new Date().AddDays(defaultDaysBack).ExtractDateUTC());
        dateTo(new Date().ExtractDateUTC());
        filterBy("All");
    };

    var setValidation = function () {
        dateFrom.extend({ validation: { validator: validateFromDate } });
        dateTo.extend({ validation: { validator: validateToDate } });
    };

    var validateFromDate = function (value) {
        return general.str2Date(value) <= general.str2Date(dateTo());
    };

    var validateToDate = function (value) {
        return general.str2Date(dateFrom()) <= general.str2Date(value);
    };

    var enableApplyButton = ko.computed(function () { return !dataSet.IsLoadingData(); }, self);

    var applyFilter = function () {
        if (dataSet.IsLoadingData()) {
            return;
        }

        dataSet.ApplyFilter();
    };


    var stop = function () {
        if (hasDataSubscriber) {
            hasDataSubscriber.dispose();
            hasDataSubscriber = null;
        }
        if (isLoadingSubscriber) {
            isLoadingSubscriber.dispose();
            isLoadingSubscriber = null;
        }

        dataSet.Clean();
    };

    return {
        Init: init,
        ActivityLogs: dataSet.DataRows,
        RecordsRendered: recordsRendered,
        HasRecords: dataSet.HasRecords,
        DataSet: dataSet,
        EnableApplyButton: enableApplyButton,
        Filter: {
            From: dateFrom,
            To: dateTo,
            Type: filterBy,
            Apply: applyFilter
        },
        DsColumns: dsColumns
    };
};
