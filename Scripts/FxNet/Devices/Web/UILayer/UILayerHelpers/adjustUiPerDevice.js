(function (root, factory) {
    'use strict';
    if (typeof define === "function" && define.amd) {
        define("devicehelpers/adjustUiPerDevice", [], factory);
    } else {
        root.adjustUiPerDevice = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {

    function adjustUiPerDevice(element) {
    }

    return adjustUiPerDevice;
}));