define(
    "modules/GridSelectionModule",
    [
        "require",
        "knockout",
        "handlers/general"
    ],
    function GridSelectionModule(require) {
        var ko = require("knockout"),
            general = require('handlers/general');

        function apply(positions, observableArray, isSelectableFn) {
            positions.HasSelections = ko.computed(function () {
                var firstChecked = ko.utils.arrayFirst(observableArray(), function (item) {
                    return item.isChecked() == true;
                });

                return !general.isNullOrUndefined(firstChecked);
            });

            positions.CheckAll = ko.computed({
                read: function () {
                    var filteredItems;

                    if (isSelectableFn) {
                        filteredItems = observableArray().filter(isSelectableFn);
                    }
                    else {
                        filteredItems = observableArray();
                    }

                    var firstUnchecked = ko.utils.arrayFirst(filteredItems,
                        function (item) {
                            return item.isChecked() === false;
                        });

                    if (general.isNullOrUndefined(firstUnchecked) && filteredItems.length > 0) {
                        return true;
                    }

                    return false;
                },
                write: function (value) {
                    ko.utils.arrayForEach(observableArray(), function (item) {
                        if (!isSelectableFn || isSelectableFn(item)) {
                            item.isChecked(value);
                        } else {
                            item.isChecked(false);
                        }
                    });
                }
            });

            positions.CheckedItems = ko.computed(function () {
                return ko.utils.arrayFilter(observableArray(), function (item) {
                    return item.isChecked() === true;
                });
            });

            positions.IsSelectAllVisible = ko.computed(function () {
                return !positions.CheckAll() || observableArray().length === 0;
            });

            positions.IsProcessing = ko.observable(false);
        }

        return {
            apply: apply,
        };
    }
);
