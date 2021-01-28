require(
    [
        'fxnet/devices/web/configuration/require.config.local',
        'fxnet/devices/web/configuration/app',
    ],
    function (config, startFn) {
        if (typeof startFn === 'function') {
            startFn();
        }
    }
);
