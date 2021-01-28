require(
    [
        'fxnet/devices/desktop/configuration/require.config',
        'fxnet/devices/desktop/configuration/app',
    ],
    function (config, startFn) {
        if (typeof startFn === 'function') {
            startFn(window.startForm, window.startCallback);
        }
    }
);
