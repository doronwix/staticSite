var TDelegate = function () {
    var _items = [];

    function add(func) {
        if (typeof func === "function") {
            _items.push(func);
        }
    }

    function invoke() {
        var tmpHandlers = _items.slice(0);
        var len = tmpHandlers.length;
        var args = [];

        for (var i = 0, length = arguments.length; i < length; i++) {
            args[i] = arguments[i];
        }

        for (var j = 0; j < len; j++) {
            if (typeof tmpHandlers[j] === "function") {
                tmpHandlers[j].apply(null, args);
            }
        }

        tmpHandlers.length = 0;
    }

    function remove(func) {
        var len = _items.length;

        for (var i = 0; i < len; i++) {
            if (_items[i] === func) {
                _items.splice(i, 1);
                break;
            }
        }
    }

    function flush() {
        _items.splice(0);
    }

    function count() {
        return _items.length;
    }

    return {
        Add: add,
        Invoke: invoke,
        Remove: remove,
        Flush: flush,
        Count: count,
    }
}

define("handlers/Delegate", function () { return TDelegate });
