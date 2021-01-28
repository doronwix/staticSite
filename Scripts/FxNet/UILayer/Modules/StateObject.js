define(
    'StateObject',
    [
        'handlers/HashTable',
        'handlers/general'
    ],
    function (hashTable, general) {
        function StateObject(name) {
            this._data = [];
            this._keys = [];
            this._name = name;
            this._currentListeners = {};
            this._nextListeners = {};
        }

        StateObject.prototype.containsKey = function (name) {
            var index = this._keys.indexOf(name);

            return index >= 0;
        };

        StateObject.prototype.set = function (name, value) {
            var index = this._keys.indexOf(name);

            if (index !== -1 && index < this._data.length) {
                return this.get(name);
            }

            this._keys.push(name);

            index = this._data.push(value) - 1;

            this._nextListeners[name] = this._currentListeners[name] = [];

            return this._data[index];
        };

        StateObject.prototype.update = function (name, value) {
            var index = this._keys.indexOf(name);
            var listener;

            var listeners = this._currentListeners[name] = this._nextListeners[name];
            if (listeners) {
                for (var i = 0, ii = listeners.length; i < ii; i++) {
                    listener = listeners[i];
                    listener(value);
                }
            }

            if (index !== -1 && index < this._data.length) {
                this._data[index] = value;
                return this._data[index];
            }

            return this.set(name, value);
        };

        StateObject.prototype.get = function (name) {
            var index = this._keys.indexOf(name);

            if (index !== -1 && index < this._data.length) {
                return this._data[index];
            }

            return null;
        };

        StateObject.prototype.unset = function (name) {
            var index = this._keys.indexOf(name);

            if (index !== -1 && index < this._data.length) {
                this._keys.splice(index, 1);
                this._data.splice(index, 1);
            }
        };

        StateObject.prototype.getAll = function () {
            var obj = {};

            for (var index = 0; index < this._keys.length; index++) {
                obj[this._keys[index]] = this._data[index];
            }

            return obj;
        };

        StateObject.prototype.subscribe = function (name, listener) {
            var index = this._keys.indexOf(name);

            if (index === -1) {
                this.set(name, null);
            }

            if (typeof listener !== 'function') {
                throw new ReferenceError('Expected listener to be a function.');
            }

            if (this._nextListeners[name] === this._currentListeners[name]) {
                this._nextListeners[name] = this._currentListeners[name].slice();
            }

            this._nextListeners[name].push(listener);

            return unsubscribe.bind(this, name, listener);
        };

        function unsubscribe(name, listener) {
            if (this._nextListeners[name] === this._currentListeners[name] && general.isArrayType(this._currentListeners[name])) {
                this._nextListeners[name] = this._currentListeners[name].slice();
            }

            if (general.isArrayType(this._nextListeners[name])) {
                var listenerIndex = this._nextListeners[name].indexOf(listener);
                this._nextListeners[name].splice(listenerIndex, 1);
            }
        }

        StateObject.prototype.clear = function () {
            this._data = [];
            this._keys = [];
            this._currentListeners = {};
            this._nextListeners = {};
        }

        var store = new hashTable();

        return {
            load: function (stateObjectName, req, onload, config) {
                if (config && config.isBuild) {
                    onload(null);
                    return;
                }

                var key = stateObjectName.toLowerCase(),
                    stateObject;

                if (!store.HasItem(key)) {
                    stateObject = new StateObject(stateObjectName);
                    store.SetItem(key, stateObject);
                }

                onload(store.GetItem(key));
            }
        };
    }
);
