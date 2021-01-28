(function (root, factory) {
    'use strict';
    if (typeof define === "function" && define.amd) {
        define("adjustUiPerDevice", [], factory);
    } else {
        root.adjustUiPerDevice = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {

    function adjustUiPerDevice(element) {

        if (element === null)
            return;
        if (element == true) {
            adjustUiPerDeviceOnFocus();
            return;
        }
        if (element == false) {
            adjustUiPerDeviceOnBlur();
            return;
        }
        element.onfocus = adjustUiPerDeviceOnFocus;
        element.onblur = adjustUiPerDeviceOnBlur;
    }

    function adjustUiPerDeviceOnFocus() {
        var i;
        var matches = document.querySelectorAll('[data-ios]');
        for (i = 0; i < matches.length; i++) {
            var att = matches[i].getAttribute('data-ios');
            if (att == 'adjustTop') {
                matches[i].style.top = 0;
                matches[i].style.position = 'absolute';
            } else if (att == 'adjustBottom') {
                matches[i].style.position = 'relative';
                matches[i].style.display = "none";
            }
        }
    }

    function adjustUiPerDeviceOnBlur() {
        var i;
        var matches = document.querySelectorAll('[data-ios]');
        for (i = 0; i < matches.length; i++) {
            var att = matches[i].getAttribute('data-ios');
            if (att == 'adjustTop') {
                matches[i].style.top = 0;
                matches[i].style.position = 'fixed';
            } else if (att == 'adjustBottom') {
                matches[i].style.position = 'fixed';
                matches[i].style.display = "";
            }
        }
    }

    return adjustUiPerDevice;
}));