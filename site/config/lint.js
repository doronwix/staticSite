module.exports.tasks = {
    eslint: {
        qunit: {
            options: {
                format: './node_modules/eslint-friendly-formatter',
                configFile: './config/qunit-eslint-rules.json',
                quiet: true
            },
            src: [
                '../TestJS/**/*.js',
                '!../TestJS/Tests/Chart/**/*.json.js',
                '!../TestJS/Frameworks/**/*.js',
                '!../TestJS/bundles/**/*.js'
            ]
        },
        fxnet: {
            options: {
                format: './node_modules/eslint-friendly-formatter',
                configFile: './config/framework-eslint-rules.json',
                quiet: true
            },
            src: [
                '../Scripts/FxNet/**/*.js',
                '../Scripts/FxNet/LogicLayer/Deposit/**/*.js',
                '../Scripts/FxNet/UILayer/Objects/Controls/Funds/**/*.js',
                '../Scripts/FxNet/UILayer/ViewModels/Payments/**/*.js',
                '../Scripts/Tracking/Loggers/**/*.js',
                '../Scripts/FxNet/Devices/Web/Configuration/require.config.js',
                '!../Scripts/FxNet/Common/Utils/Extensions/**/*.js',
                '!../Scripts/FxNet/Devices/Desktop/Tools/SmartClientTutorials.js',
                '!../Scripts/FxNet/UILayer/ViewModels/SmartBannerViewModel.js',
                '!../Scripts/FxNet/assets.js'
            ]
        },
        framework: {
            options: {
                format: './node_modules/eslint-friendly-formatter',
                configFile: './config/framework-eslint-rules.json',
                quiet: true
            },
            src: [
                '../Scripts/FxNet/LogicLayer/**/*.js',
                '../Scripts/FxNet/DataAccessLayer/**/*.js',
                '../Scripts/FxNet/Common/**/*.js',
                '!../Scripts/FxNet/Common/Utils/Extensions/**/*.js'
            ]
        },
        noko: {
            options: {
                format: './node_modules/eslint-friendly-formatter',
                configFile: './config/noko-eslint-rules.json',
                quiet: true
            },
            src: [
                '../Scripts/FxNet/LogicLayer/**/*.js',
                '!../Scripts/FxNet/LogicLayer/DeepLink/DeepLinkHandler.js',
                '!../Scripts/FxNet/LogicLayer/GeneralManager/StatesManager.js',
                '!../Scripts/FxNet/LogicLayer/UserFlows/UserFlowManager.js',
                '!../Scripts/FxNet/LogicLayer/InitialDataManagers/Customer.js',
                '!../Scripts/FxNet/LogicLayer/LimitCalculator/LimitRangeCalculator.js',
                '!../Scripts/FxNet/LogicLayer/CacheManagers/BonusManager.js'
            ]
        },
        badHabbitsSoft: {
            options: {
                format: './node_modules/eslint-friendly-formatter',
                configFile: './config/soft-eslint-rules.json',
                quiet: true
            },
            src: [
                '../Scripts/**/*.js',
                '!../Scripts/AdvinionChart/**/*.js',
                '!../Scripts/AdvinionChartCustomizations/**/*.js',
                '!../Scripts/Vendor/**/*.js'
            ]
        },
        badHabbitsQunit: {
            options: {
                format: './node_modules/eslint-friendly-formatter',
                configFile: './config/qunit-eslint-rules.json',
                quiet: true
            },
            src: [
                '../Scripts/**/*.js',
                '!../Scripts/AdvinionChart/**/*.js',
                '!../Scripts/AdvinionChartCustomizations/**/*.js',
                '!../Scripts/Vendor/**/*.js'
            ]
        },
        registration: {
            options: {
                format: './node_modules/eslint-friendly-formatter',
                configFile: './config/soft-eslint-rules.json',
                quiet: true
            },
            src: [
                '../Scripts/Registration/changepasswordmodule.js'
            ]
        },
        custom: {
            options: {
                format: './node_modules/eslint-friendly-formatter',
                configFile: './config/qunit-eslint-rules.json',
                quiet: true
            },
            src: [
                '../Scripts/Tutorials/tutorials.js',
                '../scripts/fxnet/common/utils/extensions/array.js'
            ]
        }
    },
    lesshint: {
        web: {
            src: ['../Skins/Web/**/*.less']
        },
        mobile: {
            src: ['../Skins/Mobile/**/*.less']
        },
        shared: {
            src: ['../Skins/Shared/**/*.less']
        },
        all: {
            src: ['../Skins/**/*.less']
        },
        watch: {
            src: []
        }
    },
    htmlvalidate: {
        templates: {
            src: [
                "../Scripts/**/*.html",
                "../rootHtmls/*.html",
            ],
        },
        asp: {
            src: [
                "../*.aspx",
                "../WebForms/**/*.ascx",
                "../Views/**/*.cshtml",
                "../Areas/**/*.cshtml",
            ],
        },
        tests: {
            src: [
                "../TestJS/**/*.html",
            ],
        },
    },
    concurrent: {
        eslint: {
            tasks: [
                'eslint:qunit',
                'eslint:fxnet',
                'eslint:framework',
                'eslint:noko'
            ],
            options: {
                logConcurrentOutput: true,
                compress: true
            }
        }
    }
};