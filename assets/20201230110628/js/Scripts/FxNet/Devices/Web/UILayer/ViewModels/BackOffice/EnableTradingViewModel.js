define(
    'deviceviewmodels/BackOffice/EnableTradingViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'helpers/KoComponentViewModel',
        'StateObject!TradingEnabled',
        'modules/permissionsmodule',
    ],
    function EnableTradingDef(require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            PermissionsModule = require('modules/permissionsmodule'),
            stateTradingEnabled = require('StateObject!TradingEnabled'),
            stateTradingKey = 'TradingEnabled',
            EnableTradingConfiguration,
            KoComponentViewModel = require('helpers/KoComponentViewModel');

        var EnableTradingViewModel = general.extendClass(KoComponentViewModel, function EnableTradingClass() {
            var data = this.Data;
            var configLoaded = false;

            function init() {
                setObservables();
                setSubscribers();
            }

            function setSubscribers() {
                stateTradingEnabled.subscribe(stateTradingKey, function (value) {
                    data.enableTrading(value);
                });
            }

            function setObservables() {
                data.visible = ko.observable(PermissionsModule.IsTradingUser());
                data.enableTrading = ko.observable(false);
                data.configLoading = ko.observable(false);
            }

            function loadEnableTradingConfiguration(callback) {
                if (configLoaded) {
                    callback(EnableTradingConfiguration);
                }
                else {
                    require(['configuration/EnableTradingConfiguration'],
                        function (enableTradingConfiguration) {
                            configLoaded = true;
                            EnableTradingConfiguration = enableTradingConfiguration;
                            callback(EnableTradingConfiguration);
                        });
                }
            }

            function toggleTradingConfig(etc) {
                if (data.enableTrading()) {
                    etc.RegisterComponentsOnDisable();
                    stateTradingEnabled.update(stateTradingKey, !data.enableTrading());
                    data.configLoading(false);
                } else {
                    etc
                        .RegisterComponentsOnEnable()
                        .then(function () {
                            stateTradingEnabled.update(stateTradingKey, !data.enableTrading());
                            data.configLoading(false);
                        });
                }
            }

            function onClickEnable() {
                data.configLoading(true);
                loadEnableTradingConfiguration(toggleTradingConfig);
            }

            function dispose() {
                if (EnableTradingConfiguration) {
                    EnableTradingConfiguration.RegisterComponentsOnDisable();
                }

                if (stateTradingEnabled.containsKey(stateTradingKey)) {
                    stateTradingEnabled.unset(stateTradingKey);
                }
            }

            return {
                Init: init,
                dispose: dispose,
                Data: data,
                OnClickEnable: onClickEnable,
            };
        });

        var createViewModel = function () {
            var viewModel = new EnableTradingViewModel();

            viewModel.Init();

            return viewModel;
        };

        return {
            viewModel: {
                createViewModel: createViewModel,
            },
        };
    }
);
