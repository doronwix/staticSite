define(
    'managers/CustomerProfileManager',
    [
        'require',
        'helpers/ObservableCustomExtender',
        'dataaccess/dalCustomerProfile',
        'managers/profileinstruments',
        'modules/permissionsmodule',
        'StateObject!DealerParams',
        'JSONHelper'
    ],
    function CustomerProfileManager(require) {
        var ko = require('helpers/ObservableCustomExtender'),
            dalCustomerProfile = require('dataaccess/dalCustomerProfile'),
            ProfileInstruments = require('managers/profileinstruments'),
            stateObjectDealerParams = require('StateObject!DealerParams'),
            JSONHelper = require('JSONHelper'),
            permissionsModule = require('modules/permissionsmodule');

        var profileCustomer = ko.observable({}).extend({ dirty: false }),
            startUpForm = ko.observable(0).extend({ dirty: false }),
            cashBackVolume = ko.observable(''),
            maxCashBack = ko.observable(''),
            lastSelectedPresetId = ko.observable(-1).extend({ dirty: false }),
            period = 10000,
            timeoutHold,
            startUpFormChanged = new TDelegate(),
            initialScreenChanged = new TDelegate(),
            oldChart = {};

        function setInitialAdvancedView() {
            var isAdvanced = !!(
                stateObjectDealerParams.get(eDealerParams.DealerAdvancedWalletView) ||
                profileCustomer().advancedWalletView
            );
            updateIsAdvancedView(isAdvanced);
        }

        function updateIsAdvancedView(isAdvanced) {
            var pc = profileCustomer();
            pc.advancedWalletView = isAdvanced ? 1 : 0;
            profileCustomer(pc);
        }

        function updateProfile() {
            // disable if dealer mode
            if (!permissionsModule.CheckPermissions('customerProfile')) {
                return;
            }
            if (startUpForm.isDirty()) {
                var defaultPageValue = startUpForm();
                var clientProfileModel = {
                    defaultFirstPage: defaultPageValue,
                };

                startUpForm.markClean();

                startUpFormChanged.Invoke(startUpForm());

                dalCustomerProfile.SaveStartUpPage(clientProfileModel);
            }

            if (profileCustomer.isDirty()) {
                profileCustomer.markClean();
                dalCustomerProfile.SaveProfile(profileCustomer());
            }

            if (lastSelectedPresetId.isDirty()) {
                dalCustomerProfile
                    .SaveClientScreen({ ScreenId: lastSelectedPresetId() })
                    .then(function (result) {
                        if (result && result.status == eOperationStatus.Success) {
                            lastSelectedPresetId.markClean();
                            initialScreenChanged.Invoke(lastSelectedPresetId());
                        }
                    })
                    .done();
            }

            clearTimeout(timeoutHold);
            timeoutHold = setTimeout(updateProfile, period);
        }

        function init(
            _customerProfile,
            _startUpForm,
            _profileInstruments,
            initialScreenId) {
            lastSelectedPresetId(initialScreenId);
            lastSelectedPresetId.markClean();

            startUpForm(_startUpForm);
            startUpForm.markClean();

            ProfileInstruments.Init(_profileInstruments);
            ProfileInstruments.OnUpdate.Add(function (value) {
                dalCustomerProfile.SaveProfileInstrument(value);
            });

            processProfileCustomer(_customerProfile);
            setInitialAdvancedView();

            timeoutHold = setTimeout(updateProfile, period);
        }

        function processProfileCustomer(customerProfile) {
            customerProfile = customerProfile || {};

            if (
                customerProfile.chartUserSettings ||
                customerProfile.tileChartSettings ||
                customerProfile.tileSettings ||
                customerProfile.chartFavorites ||
                customerProfile.chartIndicatorsSettings ||
                customerProfile.chartsZoomSettings) {
                // try to load from legacy
                oldChart.chartUserSettings = customerProfile.chartUserSettings
                    ? JSONHelper.STR2JSON("CustomerProfileManager:chartUserSettings", customerProfile.chartUserSettings)
                    : {};
                oldChart.tileChartSettings = customerProfile.tileChartSettings
                    ? JSONHelper.STR2JSON("CustomerProfileManager:tileChartSettings", customerProfile.tileChartSettings)
                    : [];
                oldChart.tileSettings = customerProfile.tileSettings
                    ? JSONHelper.STR2JSON("CustomerProfileManager:tileSettings", customerProfile.tileSettings)
                    : {};
                oldChart.chartFavorites = customerProfile.chartFavorites
                    ? JSONHelper.STR2JSON("CustomerProfileManager:chartFavorites", customerProfile.chartFavorites)
                    : {};
                oldChart.chartIndicatorsSettings = customerProfile.chartIndicatorsSettings
                    ? JSONHelper.STR2JSON("CustomerProfileManager:chartIndicatorsSettings", customerProfile.chartIndicatorsSettings)
                    : {};
                oldChart.chartsZoomSettings = customerProfile.chartsZoomSettings
                    ? JSONHelper.STR2JSON("CustomerProfileManager:chartsZoomSettings", customerProfile.chartsZoomSettings)
                    : {};

                // delete legacy
                delete customerProfile.chartUserSettings;
                delete customerProfile.tileChartSettings;
                delete customerProfile.tileSettings;
                delete customerProfile.chartFavorites;
                delete customerProfile.chartIndicatorsSettings;
                delete customerProfile.chartsZoomSettings;

                profileCustomer(customerProfile);
            } else {
                profileCustomer(customerProfile);
                profileCustomer.markClean();
            }
        }

        function getUiVersion() {
            return profileCustomer().dealSlipVersion || eUIVersion.Default;
        }

        function dispose() {
            startUpFormChanged.Flush();
            initialScreenChanged.Flush();

            clearTimeout(timeoutHold);
        }

        window.CustomerProfileManager = window.$customerProfileManager = {
            ProfileCustomer: profileCustomer,
            OldChart: function () {
                return oldChart;
            },
            LastSelectedPresetId: lastSelectedPresetId,
            UpdateIsAdvancedView: updateIsAdvancedView,
            DefaultPage: startUpForm,
            GetUiVersion: getUiVersion,
            CashBackVolume: cashBackVolume,
            MaxCashBack: maxCashBack,
            Init: init,
            Dispose: dispose,
            Events: {
                onStartUpFormChanged: startUpFormChanged,
                onInitialScreenChanged: initialScreenChanged,
            },
        };

        return window.CustomerProfileManager;
    }
);
