var PerformanceDataCollector = function PerformanceDataCollector() {
    var timestamps = {},
        resourceList = (window.performance && window.performance.getEntriesByType) ? window.performance.getEntriesByType("resource") : [];

    function registerEventTimestamp(event) {
        timestamps[event] = Date.now();
    }

    function getResourceTiming(resourceNamePattern) {
        var resourceNameRegex = new RegExp(resourceNamePattern, "gi");
        var duration = 0;

        var resources = resourceList.filter(function(item) {
            // filter by resource name
            return resourceNameRegex.test(item.name);
        });

        if (resources && resources.length) {
            resources.forEach(function(item) {
                duration += (item.responseEnd - item.startTime);
            });
        }

        return duration;
    }

    function isNewVersion() {
        var isNew = false;

        if (StorageFactory.isSupported(StorageFactory.eStorageType.local)) {
            var cookieCurrentVersion = CookieHandler.ReadCookie('Version');
            var localStorage = StorageFactory(StorageFactory.eStorageType.local);
            var localStorageVersion = localStorage.getItem('fxnet_version');

            if (localStorageVersion !== cookieCurrentVersion) {
                isNew = true;
                localStorage.setItem('fxnet_version', cookieCurrentVersion);
            };
        }

        return isNew;
    }

    function loadEventEnd() {
        var loadEventEndValue = "";

        try {
            loadEventEndValue = window.performance.timing.loadEventEnd;
        } catch (e) {
            ErrorManager.onWarning("window.performance.timing.loadEventEnd",
                "window.performance.timing.loadEventEnd is not supported in this OS");
        }

        return loadEventEndValue;
    }

    function responseEnd() {
        var responseEndValue = "";

        try {
            responseEndValue = window.performance.timing.responseEnd;
        } catch (e) {
            ErrorManager.onWarning("window.performance.timing.responseEnd",
                "window.performance.timing.responseEnd is not supported in this OS");
        }

        return responseEndValue;
    }

    function fetchStart() {
        var fetchStartValue = "";

        try {
            fetchStartValue = window.performance.timing.fetchStart;
        } catch (e) {
            ErrorManager.onWarning("window.performance.timing.responseEnd",
                "window.performance.timing.fetchStart is not supported in this OS");
        }

        return fetchStartValue;
    }

    return {
        Timestamps: timestamps,
        getResourceTiming: getResourceTiming,
        isNewVersion: isNewVersion,
        registerEventTimestamp: registerEventTimestamp,
        loadEventEnd: loadEventEnd,
        responseEnd: responseEnd,
        fetchStart: fetchStart
    };
};

define("tracking/PerformanceDataCollector", function(){return PerformanceDataCollector() });
