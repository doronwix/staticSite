define(
    "fxnet/CoreAssetsConfig",
    [
        "require"
    ],
    function CoreAssetsConfig() {
        var shim = {
            "StoreAPI": {
                "deps": ["core.runtime", "vendors~Components~KoBindings~StoreAPI", "vendors~Components~StoreAPI", "vendors~StoreAPI"],
                "exports": "Core.StoreAPI"
            },
            "Components": {
                "deps": ["core.runtime", "vendors~Components~KoBindings~StoreAPI", "vendors~Components~KoBindings", "vendors~Components~StoreAPI", "vendors~Components"],
                "exports": "Core.Components"
            },
            "KoBindings": {
                "deps": ["core.runtime", "vendors~Components~KoBindings~StoreAPI", "vendors~Components~KoBindings"],
                "exports": "Core.KoBindings"
            }
        };
        var paths = {
            "Components": "Components",
            "KoBindings": "KoBindings",
            "StoreAPI": "StoreAPI",
            "core.runtime": "core.runtime",
            "demoicon": "demoicon",
            "vendors~Components": "vendors~Components",
            "vendors~Components~KoBindings": "vendors~Components~KoBindings",
            "vendors~Components~KoBindings~StoreAPI": "vendors~Components~KoBindings~StoreAPI",
            "vendors~Components~StoreAPI": "vendors~Components~StoreAPI",
            "vendors~StoreAPI": "vendors~StoreAPI"
        };

        function generatePaths(basePath) {
            return Object.keys(paths).reduce(function (agg, pathKey) {
                agg[pathKey] = basePath + paths[pathKey];
                return agg;
            }, {});
        }

        return {
            generatePaths: generatePaths,
            shim: shim
        };
    }
);
