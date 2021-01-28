define(
    'viewmodels/NotificationsSettingsViewModel',
    [
        'helpers/ObservableCustomExtender',
        'handlers/general',
        'helpers/KoComponentViewModel',
        'dataaccess/dalCompliance',
        'devicemanagers/ViewModelsManager',
        'initdatamanagers/Customer',
        'Dictionary',
        'modules/permissionsmodule',
        'StateObject!Setting',
        'devicemanagers/AlertsManager',
        'JSONHelper'

    ],
    function (ko, general, KoComponentViewModel, dalCompliance, viewModelsManager, customer, dictionary, permissionsModule, settingStateObject, alertsManager, JSONHelper) {
        var NotificationsSettingsViewModel = general.extendClass(KoComponentViewModel, function () {
            var self = this,
                parent = this.parent, // inherited from KoComponentViewModel
                data = this.Data, // inherited from KoComponentViewModel
                handlers = {};

            var eCampaignCategories = {
                Other: 0,
                Legal: 1,
                AccountInformation: 2,
                MovementsAndEvents: 3,
                PromotionsOffers: 4,
                Informative: 5,
                EconomicCalendar: 6,
                PriceAlert: 7,
                LimitExecution: 8,
                LowMarginAlert: 9,
                AccountLiquidation: 10,
                Support: 11
            }

            var tradingInformationCategories = [eCampaignCategories.LimitExecution, eCampaignCategories.LowMarginAlert, eCampaignCategories.AccountLiquidation],
                marketingCategories = [eCampaignCategories.MovementsAndEvents, eCampaignCategories.EconomicCalendar, eCampaignCategories.Support, eCampaignCategories.PromotionsOffers];

            var eNotificationsSettings_TradingInformation = {
                CCID_8: 0,
                CCID_9: 1,
                CCID_10: 2
            };

            var eNotificationsSettings_Marketing = {
                CCID_3: 0,
                CCID_6: 1,
                CCID_11: 2,
                CCID_4: 3
            };

            var eNotificationsSettingsGroups = {
                TradingInformation: 1,
                Marketing: 2
            }

            var setObservables = function () {
                data.isReady = ko.observable(false);
                data.areNotificationsChanging = ko.observable(false);
                data.notificationCategories = ko.observableArray([]);
                data.lowMarginAlertValue = ko.observable();
                data.minMargin = ko.observable(0.25);
                data.maxMargin = ko.observable(10);
                data.step = 0.25;
                data.lowMarginAlertMinMax = ko.observable([data.minMargin(), data.maxMargin()]);
                data.lowMarginAlertValue.extend({ amountValidation: data.lowMarginAlertMinMax, dirty: false });

                data.lowMarginAlertValue.extend({
                    notify: "always"
                });
                data.lowMarginAlertValueValid = ko.observable(true);
                data.isCollapsed = ko.observable(true);
                data.saveMarginButtonEnabled = ko.observable(false);
                data.spinnerEnabled = ko.observable(false);
                data.updated = Q.defer();
                data.isProcessing = ko.observable(false);
            };

            var setSubscribers = function () {
                data.lowMarginAlertValueValid.subscribe(updateAlertMarginValueSaveAvailable)
                data.lowMarginAlertValue.subscribe(updateAlertMarginValueSaveAvailable);
                data.updated.promise.then(function () {
                    data.isReady(true);
                })
            }

            function updateAlertMarginValueSaveAvailable() {
                var lowMarginCategory = data.notificationCategories().find(function (category) {
                    return category.CampaignCategoryID === eCampaignCategories.LowMarginAlert;
                });
                if (lowMarginCategory) {
                    var validLowMarginValue = !general.isNullOrUndefined(data.lowMarginAlertValue()) && data.lowMarginAlertValue() !== '' && data.lowMarginAlertValueValid();
                    var categoryAllowed = false;
                    for (var i = 0, length = lowMarginCategory.CategoryMethods.length; i < length; i++) {
                        if (lowMarginCategory.CategoryMethods[i].Enable) {
                            categoryAllowed = categoryAllowed || lowMarginCategory.CategoryMethods[i].ObservableAllowed();
                        }
                    }
                    data.spinnerEnabled(categoryAllowed)
                    data.saveMarginButtonEnabled(validLowMarginValue && categoryAllowed && data.lowMarginAlertValue.isDirty());
                }


            }

            var updateNotificationCategories = function (responseText) {
                var response = JSONHelper.STR2JSON("NotificationsSettingsViewModel/getNotificationsSettings",
                    responseText,
                    eErrorSeverity.medium);

                if (response && response.Status === eOperationStatus.Success) {

                    if (response.Result.MinExposureCoverage !== 0 && response.Result.MaxExposureCoverage !== 0) {
                        data.minMargin(response.Result.MinExposureCoverage);
                        data.maxMargin(response.Result.MaxExposureCoverage);
                        data.lowMarginAlertMinMax([data.minMargin(), data.maxMargin()]);
                    }

                    if (!data.lowMarginAlertValue() && response.Result.MinPctEQXP !== 0) {
                        data.lowMarginAlertValue(response.Result.MinPctEQXP);
                        data.lowMarginAlertValue.markClean();
                    }

                    response.Result.SendingCategoryList.forEach(function (category) {
                        if (tradingInformationCategories.indexOf(category.CampaignCategoryID) > -1) {
                            category.groupId = eNotificationsSettingsGroups.TradingInformation;
                            category.order = eNotificationsSettings_TradingInformation['CCID_' + category.CampaignCategoryID];
                        }
                        if (marketingCategories.indexOf(category.CampaignCategoryID) > -1) {
                            category.groupId = eNotificationsSettingsGroups.Marketing;
                            category.order = eNotificationsSettings_Marketing['CCID_' + category.CampaignCategoryID];
                        }

                        category.subscriptions = category.subscriptions || [];
                        for (var i = 0, length = category.CategoryMethods.length; i < length; i++) {

                            if (category.CategoryMethods[i].Enable) {
                                category.CategoryMethods[i].ObservableAllowed = ko.observable(category.CategoryMethods[i].Allowed);

                                if (!isRestricted()) {
                                    category.subscriptions.push(
                                        setSubscriber(category.CategoryMethods[i].ObservableAllowed,
                                            { categoryId: category.CampaignCategoryID, methodId: category.CategoryMethods[i].SendingMethodId }));
                                }
                            }
                        }
                    });

                    var prevCategoriesArray = data.notificationCategories();
                    prevCategoriesArray.forEach(function (category) {
                        category.subscriptions.forEach(function (subcription) {
                            subcription.dispose();
                        });
                    });

                    data.notificationCategories(response.Result.SendingCategoryList);

                    data.areNotificationsChanging(false);
                    updateAlertMarginValueSaveAvailable();
                }
                data.updated.resolve();
            };

            var getNotificationsSettings = function () {
                dalCompliance.getNotificationsSettings()
                    .then(updateNotificationCategories)
                    .done();
            };

            var setSubscriber = function (allowedObservable, context) {

                return self.subscribeTo(allowedObservable, function (allowed) {
                    var categoryId = this.categoryId,
                        methodId = this.methodId;


                    if (data.areNotificationsChanging()) {
                        return;
                    }

                    var currentChangedCategory = data.notificationCategories().find(function (category) {
                        return category.CampaignCategoryID === categoryId;
                    });

                    if (!currentChangedCategory) {
                        return;
                    }

                    var currentChangedMethod = currentChangedCategory.CategoryMethods.find(function (method) {
                        return method.SendingMethodId === methodId;
                    });

                    if (!currentChangedMethod) {
                        return;
                    }

                    currentChangedMethod.Allowed = allowed;

                    ko.postbox.publish(
                        'notifications-settings-change',
                        currentChangedCategory.CampaignCategoryName + '+' + currentChangedMethod.SendingMethodName + '+' + currentChangedMethod.Allowed
                    );

                    data.areNotificationsChanging(true);

                    dalCompliance.setNotificationsSettings(data.notificationCategories())
                        .then(updateNotificationCategories)
                        .done();
                }, context);
            };

            var init = function (settings) {
                parent.init.call(self, settings);   // inherited from KoComponentViewModel

                setObservables();

                setSubscribers();

                getNotificationsSettings();

                isOpenCollapsed();

            };
            if (!settingStateObject.get("AccountHubSetting")) {
                settingStateObject.set("AccountHubSetting", null);
            }
            settingStateObject.subscribe("AccountHubSetting", function (view) {
                data.isCollapsed(view !== eViewTypes.vNotificationsSettings);
            });

            function saveButtonHandler() {
                if (isRestricted()) {
                    restrictedAlert();
                    return;
                }

                data.isProcessing(true);
                customer.prop.minPctEQXP = data.lowMarginAlertValue();


                dalCompliance.sendExposureCoverage(data.lowMarginAlertValue(),
                    function () {
                        data.isProcessing(false);
                        data.lowMarginAlertValue.markClean();
                        updateAlertMarginValueSaveAvailable();
                    });
            }

            function isOpenCollapsed() {
                if (customer.prop.isDemo) {
                    return data.isCollapsed(true);
                }

                if (viewModelsManager.VManager.GetViewArgs(eViewTypes.vNotificationsSettings) === eViewTypes.vNotificationsSettings)
                    data.isCollapsed(false);
            }

            function getDataByGroup(groupId) {
                var group = data.notificationCategories().filter(function (categoryData) {
                    return categoryData.groupId === groupId;
                });
                group = group.sort(function (l, r) { return l.order > r.order ? 1 : -1 });
                return group;
            }

            var collapsedToggle = function () {

                if (customer.prop.isDemo) {
                    viewModelsManager.VManager.RedirectToForm(eForms.Settings, eViewTypes.vNotificationsSettings);
                    return;
                }
                data.isCollapsed(!data.isCollapsed());
            }

            function isRestricted() {
                return !permissionsModule.CheckPermissions('notificationsSettings');
            }

            function restrictedAlert() {
                alertsManager.UpdateAlert(AlertTypes.ServerResponseAlert, Dictionary.GetItem("GenericAlert"), Dictionary.GetItem('Forbidden'), null);
                alertsManager.PopAlert(AlertTypes.ServerResponseAlert);
            }

            function checkPermissions() {
                if (isRestricted())
                    restrictedAlert();
            }

            var dispose = function () {
                handlers.notificationSettingChanged = null;
                parent.dispose.call(self);          // inherited from KoComponentViewModel
            };

            return {
                init: init,
                dispose: dispose,
                Handlers: handlers,
                Data: data,
                Dictionary: dictionary,
                GetDataByGroup: getDataByGroup,
                eNotificationsSettingsGroups: eNotificationsSettingsGroups,
                eCampaignCategories: eCampaignCategories,
                CollapsedToggle: collapsedToggle,
                SaveButtonHandler: saveButtonHandler,
                IsRestricted: isRestricted,
                CheckPermissions: checkPermissions
            };
        });

        var createViewModel = function (params) {
            var viewModel = new NotificationsSettingsViewModel(params);
            viewModel.init();

            return viewModel;
        };

        return {
            viewModel: {
                createViewModel: createViewModel
            },
            NotificationsSettingsViewModel: NotificationsSettingsViewModel
        };
    }
);
