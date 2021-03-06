define(
    
    [
        'require',
        'modules/environmentData!get',
        'UrlResolver',
        'fxnet/common/config/common.config',
    ],
    function (require) {
        var environmentData = require('modules/environmentData!get'),
            UrlResolver = require('UrlResolver'),
            appRelativePath = UrlResolver.getApplicationRelativePath(),
            staticFilePath = UrlResolver.getStaticFilePath(),
            version = 'v=' + (environmentData.version || window.version || '');

        //coreAssetsConfig = require("fxnet/CoreAssetsConfig");
        // var coreAssetsPaths = coreAssetsConfig.generatePaths('https://127.0.0.1:9000/');
        //var coreAssetsPaths = coreAssetsConfig.generatePaths(assestPath + "/js/fx-core-api/");
        //var shim = coreAssetsConfig.shim;

        var coreAssetsPaths = {};

        var baseConfig = {
            onNodeCreated: function (node) {
                node.setAttribute('crossorigin', 'anonymous');
            },
            urlArgs: version,
            baseUrl: UrlResolver.combine(environmentData.jsCdnPath || '', appRelativePath, 'scripts'),
            config: {
                text: {
                    useXhr: function () {
                        return true;
                    },
                },
            },

            map: {
                '*': {
                    jquery: 'vendor/jquery-3.5.1',
                    'vendor/jquery.signalR': 'vendor/jquery.signalR-2.2.2.2',
                },
            },
            paths: generatePath(),
            waitSeconds: 0,
        };

        function generatePath() {
            var corePath = {
                knockout: 'vendor/knockout-3.5.1',
                Q: 'vendor/q',
                managers: 'fxnet/uilayer/managers',
                devicemanagers: 'fxnet/devices/web/uilayer/managers',
                widgets: 'fxnet/uilayer/objects',
                devicewidgets: 'fxnet/devices/web/uilayer/objects',
                generalmanagers: 'fxnet/LogicLayer/GeneralManager',
                cachemanagers: 'fxnet/logiclayer/cachemanagers',
                calculators: 'fxnet/LogicLayer/LimitCalculator',
                userflow: 'fxnet/logiclayer/userflows',
                withdrawal: 'fxnet/logiclayer/withdrawal',
                modules: 'fxnet/uilayer/modules',
                currentAppFolder: 'fxnet/devices/web',
                LoadDictionaryContent: 'fxnet/uilayer/modules/LoadDictionaryContent',
                viewmodels: 'fxnet/uilayer/viewmodels',
                deviceviewmodels: 'fxnet/devices/web/uilayer/viewmodels',
                deviceviews: 'fxnet/devices/web/uilayer/views',
                devicecustommodules: 'fxnet/devices/web/modules',
                payments: 'fxnet/uilayer/viewmodels/payments',
                Dictionary: 'fxnet/LogicLayer/GeneralManager/Dictionary',
                UrlResolver: 'Global/UrlResolver',
                JSONHelper: 'fxnet/common/utils/handlers/jsonhelper',
                dataaccess: 'fxnet/dataaccesslayer',
                devicealerts: 'fxnet/devices/web/uilayer/alerts',
                initdatamanagers: 'fxnet/logiclayer/initialdatamanagers',
                configuration: 'fxnet/devices/web/configuration',
                alerts: 'fxnet/uilayer/alerts',
                handlers: 'fxnet/common/utils/handlers',
                helpers: 'fxnet/uilayer/uilayerhelpers',
                devicehelpers: 'fxnet/devices/web/uilayer/uilayerhelpers',
                StateObject: 'fxnet/uilayer/modules/StateObject',
                deepLinks: 'fxnet/LogicLayer/DeepLink',
                devicecustomdeeplinks: 'fxnet/devices/web/logiclayer/deeplink',
                extensions: 'fxnet/Common/Utils/Extensions',
                enums: 'fxnet/Common/constants/enums',
                constsEnums: 'fxnet/Common/constants/consts',
                ProChart_Loader: 'AdvinionChart/ChartUI/init/prochart.loader.min',
                trackingIntExt: 'tracking/internal',
                deposit: 'fxnet/LogicLayer/Deposit',
                'partial-views': staticFilePath,
                controllers: appRelativePath,
                assets: UrlResolver.getAssetsPath(),
                webHtml: UrlResolver.combine(
                    staticFilePath,
                    'scripts/fxnet/devices/web/uilayer/views'
                ),
                html: UrlResolver.combine(
                    staticFilePath,
                    'scripts/fxnet/uilayer/viewmodels'
                ),
                emily: UrlResolver.combine(UrlResolver.getStaticJSPath(), 'emily'),
                'fx-core-api': UrlResolver.combine(
                    UrlResolver.getStaticJSPath(),
                    'fx-core-api'
                ),
                html2canvas: 'vendor/html2canvas.min',
                SignaturePad: 'vendor/signature_pad.min'
            };

            return Object.assign(corePath, coreAssetsPaths);
        }

        return requirejs.config(baseConfig);
    }
);
