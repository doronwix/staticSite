require(
    [
        "fxnet/devices/mobile/configuration/require.config",
        "fxnet/devices/mobile/configuration/app"
    ],
    function (config, startFn) {
        if (typeof startFn === "function") {
            startFn();
        }
    }
);