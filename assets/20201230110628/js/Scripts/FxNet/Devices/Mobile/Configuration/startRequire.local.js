require(
    [
        "fxnet/devices/mobile/configuration/require.config.local",
        "fxnet/devices/mobile/configuration/app"
    ],
    function (config, startFn) {
        if (typeof startFn === "function") {
            startFn();
        }
    }
);