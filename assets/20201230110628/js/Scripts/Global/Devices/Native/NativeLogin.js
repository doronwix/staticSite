$(document).ready(function () {
    document.addEventListener("deviceready",
        function onDeviceReady() {
            if (navigator && navigator.splashscreen) {
                navigator.splashscreen.hide();
            }

            if (window.FingerprintLogin) {
                window.FingerprintLogin.InitDependencies(window.$, window.Model, window.FingerprintTools, window.LastLoginMethod, window.popupManager, window.externalEventsCallbacks);
                window.FingerprintLogin.FingerprintStart(window.Model.AutologinStatus);
            }
        },
        false);
});