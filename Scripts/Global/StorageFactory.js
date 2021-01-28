function StorageFactory(storageType) {
	var inMemoryStorage = {},
		isNativeSupported = StorageFactory.isSupported(storageType),
		storage = (function () {
			if (isNativeSupported)
				switch (storageType) {
					case StorageFactory.eStorageType.session:
						return window.sessionStorage;
						break;
					case StorageFactory.eStorageType.local:
					default:
						return window.localStorage;
						break;
				}
		})();

	function getItem(_key) {
		if (isNativeSupported) {
			return storage.getItem(_key);
		}
		return inMemoryStorage[_key] || null;
	}

	function setItem(_key, _value) {
		if (isNativeSupported) {
			storage.setItem(_key, _value);
		} else {
			inMemoryStorage[_key] = _value;
		}
	}

	function removeItem(_key) {
		if (isNativeSupported) {
			storage.removeItem(_key);
		} else {
			delete inMemoryStorage[_key];
		}
	}

	function clear() {
		if (isNativeSupported) {
			storage.clear();
		} else {
			inMemoryStorage = {};
		}
	}

	function key(n) {
		if (isNativeSupported) {
			return storage.key(n);
		} else {
			return Object.keys(inMemoryStorage)[n] || null;
		}
	}

	return {
		getItem: getItem,
		setItem: setItem,
		removeItem: removeItem,
		clear: clear,
		key: key,
	};
}

StorageFactory.isSupported = function (storageType) {
	try {
		var storage = null;
		switch (storageType) {
			case StorageFactory.eStorageType.session:
				storage = window.sessionStorage;
				break;
			case StorageFactory.eStorageType.local:
			default:
				storage = window.localStorage;
				break;
		}
		var _key = "__tst_strg_key__";
		storage.setItem(_key, _key);
		storage.removeItem(_key);
		return true;
	} catch (e) {
		return false;
	}
};

StorageFactory.eStorageType = {
	local: 0,
	session: 1,
};

(function (root, factory) {
	if (typeof define === "function" && define.amd) {
		// AMD. Register as an anonymous module.
		define([], factory);
	} else {
		// Browser globals
		root = factory();
	}
})(typeof self !== "undefined" ? self : this, function () {
	// Use b in some fashion.

	// Just return a value to define the module export.
	// This example returns an object, but the module
	// can return a function as the exported value.
	return StorageFactory;
});
