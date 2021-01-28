/* global General */
function THashTable() {
    var length = 0;
    var container = {};

    function removeItem(key) {
        if (container.hasOwnProperty(key) && General.isDefinedType(container[key])) {
            length -= 1;

            delete container[key];
        }
    }

    function getItem(key) {
        if (container.hasOwnProperty(key) && General.isDefinedType(container[key])) {
            return container[key];
        }

        return null;
    }

    function foreach(delegate) {
        for (var key in container) {
            if (container.hasOwnProperty(key)) {
                if (delegate(key, container[key]) === false) {
                    break;
                }
            }
        }
    }

    function filter(callback) {
        var result = new THashTable();

        for (var key in container) {
            if (container.hasOwnProperty(key)) {
                if (callback(key, container[key])) {
                    result.SetItem(key, container[key]);
                }
            }
        }

        return result;
    }

    function find(callback) {
        var result = new THashTable();

        for (var key in container) {
            if (container.hasOwnProperty(key)) {
                if (callback(key, container[key])) {
                    result.SetItem(key, container[key]);

                    return result;
                }
            }
        }
        return result;
    }

    function setItem(key, value) {
        if (General.isDefinedType(value)) {
            if (!General.isDefinedType(container[key])) {
                length += 1;
                container[key] = value;
            }
        }
    }

    function overrideItem(key, value) {
        if (hasItem(key)) {
            if (General.isDefinedType(value)) {
                container[key] = value;
            }
        }
        else {
            setItem(key, value);
        }
    }

    function firstItem() {
        for (var key in container) {
            if (container.hasOwnProperty(key)) {
                return container[key];
            }
        }

        return null;
    }

    function hasItem(key) {
        return container.hasOwnProperty(key) && General.isDefinedType(container[key]);
    }

    function hasItems() {
        return length > 0;
    }

    function clear() {
        for (var key in container) {
            if (container.hasOwnProperty(key)) {
                if (!General.isNullOrUndefined(container[key]) && General.isFunctionType(container[key].dispose)) {
                    container[key].dispose();
                }

                delete container[key];
            }
        }

        length = 0;
    }

    function count() {
        return length;
    }

    function sort(field, asc) {
        /* eslint no-array-constructor: 0 */
        var res = [],
            tmp = [],
            item,
            fieldValue;

        for (var key in container) {
            if (!container.hasOwnProperty(key)) {
                continue;
            }

            item = container[key];

            if (item !== null && typeof item === 'object') {
                fieldValue = item[field];

                if (General.isNumber(fieldValue) || General.isStringType(fieldValue)) {
                    tmp.push(new Array(fieldValue, key));
                }
            }
        }

        //---------------------------------------

        for (var i = 1, n = tmp.length; i < n; i++) {
            for (var j = 0; j < n - i; j++) {
                if (tmp[j][0] > tmp[j + 1][0]) {
                    var tempVal = tmp[j];
                    tmp[j] = tmp[j + 1];
                    tmp[j + 1] = tempVal;
                }
            }
        }

        //---------------------------------------

        for (var t = 0; t < tmp.length; t++) {
            res[t] = tmp[t][1];
        }

        return asc ? res : res.reverse();
    }

    return {
        count: count,
        Sort: sort,
        Clear: clear,
        GetItem: getItem,
        SetItem: setItem,
        HasItem: hasItem,
        OverrideItem: overrideItem,
        RemoveItem: removeItem,
        Container: container,
        firstItem: firstItem,
        hasItems: hasItems,
        ForEach: foreach,
        Filter: filter,
        Find: find
    };
}

define(
    'handlers/HashTable',
    [
        'handlers/general'
    ],
    function () {
        return THashTable
    }
);
