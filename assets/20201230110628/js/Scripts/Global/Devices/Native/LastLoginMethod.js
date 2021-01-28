(function (root, factory) {
    'use strict';
    if (typeof define === "function" && define.amd) {
        define("global/devices/native/LastLoginMethod", [], factory);
    }
    else {
        root.LastLoginMethod = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    function LastLoginMethodClass() {
        var lastLoginKey = "lastLoginMethod";

        function setLastLoginMethod(loginMethod) {
            localStorage.setItem(lastLoginKey, loginMethod);
        }

        function getLastLoginMethod() {
            var loginMethod = localStorage.getItem(lastLoginKey);

            if (typeof loginMethod === "undefined" || loginMethod === null) {
                loginMethod = eLoginMethods.Password;
            }

            setLastLoginMethod(loginMethod);

            return loginMethod;
        }

        return {
            SetLastLoginMethod: setLastLoginMethod,
            GetLastLoginMethod: getLastLoginMethod
        };
    }

    var module = window.LastLoginMethod = new LastLoginMethodClass();

    return module;
}));