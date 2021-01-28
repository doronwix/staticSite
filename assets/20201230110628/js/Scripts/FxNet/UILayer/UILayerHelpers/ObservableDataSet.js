function ObservableDataSet(ko, general, opts, sortingParams) {
    // Keep reference to THIS
    var self = this;
    // Ensure opts is not null
    opts = opts || {};
    var isLoadingData = ko.observable(false);
    // default options
    var defOptions = {
        columns: [],                                // Columns definition
        idField: "id",                              // id field for each record, required for ObservableHashTable
        statusField: "status",                      // response status
        totalField: "total",                        // total records, the field where total records value is stored
        dataField: "data",                          // the field where records are returned
        pagination: {
            pagesPerPage: 5,                        // pages to display
            pageSizeField: "pagesize",              // field for page size
            pageIndexField: "page"                  // field for page index
        },
        Filter: {},                                 // Filter definition
        DAL: {
            reference: function () { },             // reference to DAL function
            callerName: "ObservableDataSet",        // caller name
            errorSeverity: eErrorSeverity.medium,   // error severity
            onLoad: function () { }                 // on load callback
        }
    };

    var options = general.extendType({}, opts, defOptions);  // Merge default options with options passed

    // Initialize properties
    var dataRows = new ObservableHashTable(ko, general, options.idField, sortingParams),
        currentPage = ko.observable(1),
        pageSize = ko.observable(10),
        pages = ko.observableArray(),
        pagesPerPage = ko.observable(options.pagination.pagesPerPage),
        totalRecords = ko.observable(0),
        hasRecords = ko.observable(false);

    var appendRecords = false;

    var showMore = function () {
        if (currentPage() < totalPages()) {
            appendRecords = true;
            currentPage(parseInt(currentPage() + 1));
        }
    };

    var nextPage = function () {
        if (currentPage() < totalPages()) {
            currentPage(parseInt(currentPage() + 1));
        }
    };

    var prevPage = function () {
        if (currentPage() > 1) {
            currentPage(parseInt(currentPage() - 1));
        }
    };

    var firstPage = function () {
        if (currentPage() > 1) {
            currentPage(1);
        }
    };

    var lastPage = function () {
        if (currentPage() < totalPages()) {
            currentPage(totalPages());
        }
    };

    // Computed value
    var totalPages = ko.computed(function () {
        return Math.ceil(totalRecords() / pageSize());
    });
    var hasNextPage = ko.computed(function () {
        return currentPage() < totalPages();
    });
    var isLastPage = ko.computed(function () {
        return currentPage() == totalPages();
    });
    var isFirstPage = ko.computed(function () {
        return currentPage() == 1;
    });
    var hasPrevPage = ko.computed(function () {
        return currentPage() > 1;
    });
    var showPaging = ko.computed(function() {
        return (hasRecords() && totalPages() > 1);
    });

    // apply pageIndex to filter
    var changePageIndexFilter = function (pageIndex) {
        var pageIndexField = options.pagination.pageIndexField;

        if (ko.isWriteableObservable(options.Filter[pageIndexField])) {
            options.Filter[pageIndexField](pageIndex);
        } else {
            options.Filter[pageIndexField] = pageIndex;
        }
    };

    // Subscribe for changing page
    currentPage.subscribe(function (newPageIndex) {
        changePageIndexFilter(newPageIndex);

        // load data when the page is changed
        loadData();
    });

    // initialize column model
    var initColumnModel = function () {
        // Define column template (default properties)
        var columnTemplate = {
            name: "",
            transform: function (value, rIndex, cIndex, rawRecord, record) {
                return value;
            }
        };

        // Initialize columns
        for (var i = 0; i < options.columns.length; i++) {
            options.columns[i] = options.columns[i] || {};

            if (general.isStringType(options.columns[i])) {
                options.columns[i] = {
                    name: options.columns[i]
                };
            }

            // Merge column definition with column template
            general.extendIfType(options.columns[i], columnTemplate);
        }
    };

    // Initialize the DataSet
    var init = function () {
        initColumnModel();      // initialize columns
        setPaginationFilter();  // set pagination
    };

    var updateColumnModel = function (newOptions) {
        options = general.extendType({}, newOptions, defOptions);
        dataRows.KeyProperty(options.idField);

        init();
    };

    var initFilter = function () {
        var filter = {};

        for (var prop in options.Filter) {
            if (options.Filter.hasOwnProperty(prop)) {
                if (ko.isObservable(options.Filter[prop])) {
                    filter[prop] = options.Filter[prop]();
                } else if (ko.isComputed(options.Filter[prop])) {
                    filter[prop] = options.Filter[prop]();
                } else {
                    filter[prop] = options.Filter[prop];
                }
            }
        }

        return filter;
    };

    var setPaginationFilter = function () {
        // get value for pageSize
        var pageSizeField = options.pagination.pageSizeField,
            pageSizeValue = 10;

        if (pageSizeField in options.Filter && general.isNumber(options.Filter[pageSizeField])) {
            // get pageSize value
            pageSizeValue = options.Filter[pageSizeField];
        } else {
            // set default value for pageSize
            options.Filter[pageSizeField] = pageSizeValue;
        }
        // set the value for pageSize
        pageSize(pageSizeValue);

        // set page index value to 1
        changePageIndexFilter(1);
    };

    var setFilter = function (newFilter) {
        options.Filter = newFilter || {};

        // set pagination
        setPaginationFilter();
    };

    // Get values from observable filter
    var applyFilter = function () {
        isLoadingData(true);
        if (currentPage() != 1) {
            // reset current page to 1
            currentPage(1);
        } else {
            loadData();
        }
    };

    // Clean up the memory
    var clean = function () {
        dataRows.Clear();
        pages.removeAll();

        hasRecords(false);
        currentPage(1);
        totalRecords(0);
    };

    // Add record to rows observable collection
    var addRecord = function (rawRecord, rowIndex) {
        if (!general.isEmptyType(rawRecord)) {
            var record = {};

            if (general.isArrayType(rawRecord)) {
                // Iterate through column definitions
                options.columns.forEach(function (column, colIndex) {
                    var field = column.name;
                    var value = "";

                    if ('dataIndex' in column) {
                        if (general.isDefinedType(rawRecord[column.dataIndex])) {
                            value = rawRecord[column.dataIndex];
                        }
                    }

                    if (general.isFunctionType(column.transform)) {
                        value = column.transform(value, rowIndex, colIndex, rawRecord, record);
                    }

                    // Set value for current field
                    record[field] = value;
                });
            } else if (general.isObjectType(rawRecord)) {
                // TODO
            } else if (general.isStringType(rawRecord)) {
                record.value = rawRecord;
            }

            // Check for idField, if not then set the record index
            if (!(options.idField in record)) {
                record[options.idField] = rowIndex;
            }

            // Add record to dataset
            dataRows.Add(record);
        }
    };

    // Paging
    var buildPages = function () {
        pages.removeAll();

        var mod = currentPage() % pagesPerPage();
        var start;
        if (mod == 0) {
            start = currentPage() - pagesPerPage();
        } else {
            start = currentPage() - mod;
        }

        var end = start + pagesPerPage();
        if (end > totalPages()) {
            end = totalPages();
        }

        for (var i = start; i < end; i++) {
            pages.push((i + 1));
        }
    };

    var onData = function (responseText) {
        appendRecords = false;
        var response = JSONHelper.STR2JSON(options.DAL.callerName, responseText, options.DAL.errorSeverity);

        if (response) {
            var result = {};
            result[options.statusField] = "RequestFailed";
            result[options.totalField] = 0;
            result[options.dataField] = [];

            general.extendType(result, response);

            // Set total records
            totalRecords(result[options.totalField]);

            if (eOperationStatus[result[options.statusField]] == eOperationStatus.Success) {
                hasRecords(result[options.dataField].length > 0);

                for (var rIndex = 0, len = result[options.dataField].length; rIndex < len; rIndex++) {
                    addRecord(result[options.dataField][rIndex], rIndex);
                }

                buildPages(); // build paging
            }

            if (general.isFunctionType(options.DAL.onLoad)) {
                options.DAL.onLoad(result);
            }

            isLoadingData(false);
        }
    };

    // Create a callback function for DAL
    var loadData = function () {
        var filter = initFilter();
        isLoadingData(true);

        // Check if new records should be appended
        if (appendRecords !== true) {
            dataRows.Clear();   // remove old records
            hasRecords(false);  // set the hasRecords flag
        }

        // Call the DAL function reference
        if (general.isFunctionType(options.DAL.reference)) {
            return options.DAL.reference.apply(self, [filter, onData]);
        }
    };

    // Return public members
    return {
        Init: init,
        DataRows: dataRows.Values,
        Load: loadData,
        Clean: clean,
        HasRecords: hasRecords,
        ShowPaging: showPaging,
        ApplyFilter: applyFilter,
        IsLoadingData : isLoadingData,
        SetFilter: setFilter,
        Paging: {
            ShowMore: showMore,
            TotalRecords: totalRecords,
            TotalPages: totalPages,
            PageSize: pageSize,
            Pages: pages,
            CurrentPage: currentPage,
            NextPage: nextPage,
            PrevPage: prevPage,
            FirstPage: firstPage,
            LastPage: lastPage,
            IsFirstPage: isFirstPage,
            HasPrevPage: hasPrevPage,
            HasNextPage: hasNextPage,
            IsLastPage: isLastPage
        },
        UpdateColumnModel: updateColumnModel,
        SetSorting: dataRows.SetSorting,
        SortProperties: dataRows.SortProperties
    };
}