function ObservableHashTable(ko, general, _keyProperty, _sortingParams) {
    var keyProperty = ko.observable(_keyProperty);
    var array = ko.observableArray([]);
    var keys = new THashTable(general);
    var sortingParams = (typeof (_sortingParams) == 'undefined') ? { enabled: false, sortProperty: '', asc: true} : _sortingParams;
    var sortPropreties = ko.observable(sortingParams);

    var clear = function () {
        keys.Clear();

        ko.utils.arrayForEach(array(), function(item) {
            if (item && typeof item.dispose === "function") {
                item.dispose();
            }
        });

        array.removeAll();
    };

    var getkey = function (value) {
        var underlineValue = ko.unwrap(value);
        return ko.toJS(underlineValue[keyProperty()]);
    };

    // isPeekMode (default = false ) is for AddRange
    // get a reference to our underlying array, push to it, then call .valueHasMutated()
    var checkAndAdd = function (value, index, isPeekMode) {
        // push sorted is defined on ko.observableArray.fn.pushSorted
        var targetArray = (isPeekMode && !sortingParams.enabled) ? array() : array;
        var key = getkey(value);

        if (!keys.HasItem(key)) {
            if (sortingParams.enabled) {
                targetArray.pushSorted(sortingParams.sortProperty, sortingParams.asc, value);
            } else if (typeof index == 'number') {
                targetArray.splice(index, 0, value);
            } else {
                targetArray.push(value);
            }

            keys.SetItem(key, value);

            return true;
        }

        return false;
    };

    var addAt = function (index, value) {
        return checkAndAdd(value, index);
    };

    var add = function (value) {
        return checkAndAdd(value);
    };

    //Adds the array of values to the internal observable collection with the rowBuilder function as an al
    // see preformace improvement
    // http://www.knockmeout.net/2012/04/knockoutjs-performance-gotcha.html
    var addRange = function (arrayOfValues) {
        for (var i = 0; i < arrayOfValues.length; i++) {
            checkAndAdd(arrayOfValues[i], null, true);
        }

        // on sorted object the add range is notifying mutation on each item: no performance improvement here
        if (!sortingParams.enabled) {
            array.valueHasMutated();
        }
    };

    var updateSorting = function (value) {
        if (sortingParams.enabled) {
            var item = value;
            array.remove(item);
            array.pushSorted(sortingParams.sortProperty, sortingParams.asc, value);
        }
    };

    var update = function (key, value) {
        var item = keys.GetItem(key);

        if (item !== null && ko.utils.updateShallowFrom(value, item, sortingParams.sortProperty)) {
            updateSorting(item);
        }
    };
    //use this to update even if the item exists - good for subscribers to items
    var updateAlways = function (key, value) {
        var item = keys.GetItem(key);

        if (item !== null && ko.utils.updateDeepFrom(value, item, sortingParams.sortProperty)) {
            updateSorting(item);
        }
    };

    var get = function (key) {
        return keys.GetItem(key);
    };

    var contains = function (key) {
        return keys.HasItem(key);
    };

    var remove = function (key) {
        var item = keys.GetItem(key);

        if (item === null) {
            return false;
        }

        keys.RemoveItem(key);
        array.remove(item);

        return true;
    };

    var initialSort = function () {
        array.sortByProperty(sortingParams.sortProperty, sortingParams.asc);
    };

    var reverse = function () {
        array.reverse();
    };

    var setSorting = function (enabled, sortProperty, asc) {
        var doInitialSort = ((!sortingParams.enabled && enabled) || (sortingParams.sortProperty != sortProperty));
        var doReverse = (sortingParams.asc != asc);

        sortingParams.enabled = enabled;
        sortingParams.sortProperty = sortProperty;
        sortingParams.asc = asc;

        sortPropreties(sortingParams);

        if (array().length > 1) {
            if (doInitialSort)
                initialSort();
            else if (doReverse)
                reverse();
        }
    };

    var hasItems = function() {
        return keys.hasItems();
    };

    return {
        Clear: clear,
        Add: add,
        AddRange: addRange,
        AddAt: addAt,
        Update: update,
        UpdateAlways: updateAlways,
        Get: get,
        Contains: contains,
        Remove: remove,
        SetSorting: setSorting,
        SortProperties: sortPropreties,
        Keys: keys,
        HasItems: hasItems,
        Values: array,
        KeyProperty: keyProperty
    };
}

define('helpers/ObservableHashTable', ['handlers/HashTable'], function(){ return ObservableHashTable });
