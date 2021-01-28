define(
    'managers/viewsmanager',
    [
        "require",
        "jquery",
        "knockout",
        'handlers/general',
        'configuration/Containers',
        'managers/historymanager',
        "initdatamanagers/Customer",
        'managers/CustomerProfileManager',
        'managers/ViewsRouterManager',
        'modules/permissionsmodule',
        'deepLinks/DeepLinkHandler',
        "StateObject!ViewsManager",
        'devicemanagers/AlertsManager'
    ],
    function ViewsManager(require) {
        var ko = require("knockout"),
            general = require('handlers/general'),
            $ = require("jquery"),
            Containers = require('configuration/Containers'),
            HistoryManager = require('managers/historymanager'),
            Customer = require("initdatamanagers/Customer"),
            CustomerProfileManager = require('managers/CustomerProfileManager'),
            ViewsRouterManager = require('managers/ViewsRouterManager'),
            permissionsModule = require('modules/permissionsmodule'),
            DeepLinkHandler = require('deepLinks/DeepLinkHandler'),
            StateObject = require("StateObject!ViewsManager"),
            AlertsManager = require('devicemanagers/AlertsManager');

        var forms = {},
            activeForm = new Form(),
            onActiveFormChanged = new TDelegate(),
            activeFormType = ko.observable(),
            activeFormName = ko.pureComputed(computeActiveFormName),
            deepLinkHandler = new DeepLinkHandler();

        //------------------------------------------------

        function computeActiveFormName() {
            for (var item in eForms) {
                if (!eForms.hasOwnProperty(item)) {
                    continue;
                }

                if (eForms[item] === activeFormType()) {
                    return item.toLowerCase();
                }
            }

            return '';
        }

        //-------------- View Properties -----------------

        function View(viewState) {
            var self = this;

            self.state = ko.observable(viewState);
            self.previousState = ko.observable();

            self.visible = ko.computed(function () {
                if (this.state() === eViewState.Stop)
                    return false;
                else
                    return true;
            }, self);

            this.args = {};
        }

        //-------------- Form Properties -----------------

        function Form() {
            this.viewsList = {};
            this.isReset = ko.observable(false).extend({ notify: 'always' });
            this.args = {};
            this.historicalData = false;
        }

        Form.prototype.SetViews = function setViews(formviews) {
            for (var key in eViewTypes) {
                if (eViewTypes.hasOwnProperty(key)) {
                    if (formviews && formviews.contains(eViewTypes[key])) {
                        //define each form with its dependent view list which is subscribed to the visibility change of the form
                        this.viewsList[eViewTypes[key]] = new View(eViewState.Start);
                    } else {
                        //don't define a subscriber because these views never change
                        this.viewsList[eViewTypes[key]] = new View(eViewState.Stop);
                    }
                }
            }
        };

        Form.prototype.Reset = function reset() {
            this.isReset(true);
        };

        Form.prototype.IsHistoricalData = function isHistoricalData(hData) {
            if (general.isBooleanType(hData)) {
                this.historicalData = hData;
            }

            return this.historicalData;
        };

        //-------------- Init ----------------------------

        var init = function (uiVersion) {
            Containers.Init(uiVersion);

            setFormCollection();

            HistoryManager.Init();
            HistoryManager.OnStateChanged.Add(function (state) {
                switch (state.type) {
                    case eHistoryStateType.View:
                        switchActive(state.view, state.viewArgs);
                        break;

                    case eHistoryStateType.Invalid:
                        switchViewVisible(
                            Customer.prop.startUpForm,
                            {},
                            function showExitAlert() {
                                if (!(permissionsModule.CheckPermissions("commonLogout"))) {
                                    return;
                                }
                                AlertsManager.UpdateAlert(AlertTypes.ExitAlert);
                                AlertsManager.PopAlert(AlertTypes.ExitAlert);
                            }
                        );

                        break;

                    case eHistoryStateType.CloseAlert:
                        var alertToClose = AlertsManager.GetAlert(state.popupId);
                        if (alertToClose && alertToClose.visible()) {
                            alertToClose.hide();
                        }
                        break;
                }
            });

            AlertsManager.OnShowAlert.Add(function (alertType, alertInstance) {
                var subscriber = alertInstance.visible.subscribe(function (isVisible) {
                    if (!isVisible) {
                        subscriber.dispose();

                        if (HistoryManager.HasAlert(alertType)) {
                            HistoryManager.Back(alertInstance.overwriteNavFlow ? alertInstance.properties.okButtonCallback :general.emptyFn);
                        }
                    }
                });

                if (alertInstance.properties.backFormTarget) {
                    HistoryManager.ReplaceViewState(alertInstance.properties.backFormTarget);
                }

                // push state for back option
                HistoryManager.PushPopupState(ePopupType.Alert, alertType);
            });

            activeFormType.subscribe(function (formId) {
                onActiveFormChanged.Invoke(formId);
            });

            deepLinkHandler.Init();
        };

        var setFormCollection = function () {
            for (var key in eForms) {
                if (eForms.hasOwnProperty(key)) {
                    forms[eForms[key]] = new Form();
                    forms[eForms[key]].SetViews(Containers.Forms.Container[eForms[key]].mappedViews);
                }
            }

            activeForm.SetViews();
        };

        var start = function (startUpForm) {
            var args = getForm(startUpForm).args || {};
            var redirectResult = deepLinkHandler.Handle(startUpForm, args);

            if (redirectResult.isDeepLink) {
                if (redirectResult.startUpForm != startUpForm) {
                    HistoryManager.PushStartUpState(startUpForm, args);
                }

                HistoryManager.Start(redirectResult.startUpForm, redirectResult.args, function () {
                    redirectResult.processActions();
                });
            } else {
                HistoryManager.Start(startUpForm, args);
            }

            ko.postbox.publish('main-page-load');
        };

        //-------------- private helper Methods -----------------------------
        var getActiveViews = function () {
            var state,
                activeViews = [];

            for (var view in eViewTypes) {
                if (eViewTypes.hasOwnProperty(view)) {
                    state = getViewState(eViewTypes[view]);

                    if (state !== eViewState.Stop) {
                        activeViews.push(view);
                    }
                }
            }

            return activeViews;
        };

        var switchActive = function (formId, formArgs) {
            if (!(permissionsModule.CheckFormPermissions(formId, true, formArgs))) {
                return;
            }

            saveToCustomerProfile(formId);

            $(document).trigger(eAppEvents.formChangeEvent);
            ko.postbox.publish('active-view', formId);

            activeFormType(formId);
            activeForm.type = formId;
            activeForm.args = formArgs;
            activeForm.IsHistoricalData((Containers.Forms.Container[formId].exportSupport && Containers.Forms.Container[formId].exportSupport.historicalData) || false);

            var viewsList = forms[formId].viewsList;

            for (var key in viewsList) {
                if (viewsList.hasOwnProperty(key)) {
                    if (viewsList[key].state() === eViewState.Start ||
                        activeForm.viewsList[key].state() !== viewsList[key].state() &&
                        (!Containers.IndependentViews || !Containers.IndependentViews.contains(key))) {
                        activeForm.viewsList[key].args = formArgs;
                        activeForm.viewsList[key].previousState(activeForm.viewsList[key].state());
                        activeForm.viewsList[key].state(viewsList[key].state());
                    }
                }
            }

            // refresh 
            activeForm.Reset();

            StateObject.update("ActiveViews", getActiveViews());
        };

        var getForm = function (form) {
            return forms[form];
        };

        //-------------- public Methods -----------------------------

        var getActiveFormView = function (view) {
            return activeForm.viewsList[view];
        };

        var getViewArgs = function (viewType) {
            var view = activeForm.viewsList[viewType];

            if (!view) {
                return;
            }

            var viewArgs = view.args || {};

            return viewArgs;
        };

        var getViewArgsByKeyName = function (viewType, key, defaultValue) {
            if (activeForm.viewsList[viewType].args && !general.isEmptyValue(activeForm.viewsList[viewType].args[key]))
                return activeForm.viewsList[viewType].args[key];
            else
                return defaultValue;
        };

        var refresh = function () {
            //activeForm[eViewTypes.vToolBar] && activeForm[eViewTypes.vToolBar].state(eViewState.Refresh)
            for (var property in activeForm.viewsList) {
                if (activeForm.viewsList.hasOwnProperty(property)) {
                    if (activeForm.viewsList[property].visible()) {
                        activeForm.viewsList[property].state(eViewState.Refresh);
                    }
                }
            }
        };

        var reload = function (formId) {
            if (!general.isDefinedType(formId)) {
                formId = activeForm.type;
            }
            window.location = window.location.pathname + "?view=" + formId;
        };

        var goBack = function (callback) {
            HistoryManager.Back(callback);
        };

        var goForward = function (callback) {
            HistoryManager.Forward(callback);
        };

        var getActiveForm = function () {
            return activeForm;
        };

        var changeState = function (view, state, args) {
            if (view) {
                activeForm.viewsList[view].previousState(activeForm.viewsList[view].state());

                if (state == eViewState.Stop)
                    activeForm.viewsList[view].args = '';
                else
                    activeForm.viewsList[view].args = args;

                if (activeForm.viewsList[view].previousState() === state && activeForm.viewsList[view].state() === eViewState.Update) {
                    activeForm.viewsList[view].state(-1);
                }

                activeForm.viewsList[view].state(state);
            }

            StateObject.set("ActiveViews", getActiveViews());
        };

        var getViewState = function (view) {
            if (view) {
                return activeForm.viewsList[view].state();
            }
        };

        var switchViewVisible = function (formId, viewArgs, switchCompleted) {
            if (!(permissionsModule.CheckFormPermissions(formId, true, viewArgs))) {
                return;
            }
            var redirectObj = ViewsRouterManager.GetFormToRedirect(formId, viewArgs);

            setTimeout(function (historyManager, form, args, callback) {
                historyManager.PushViewState(form, args, callback);
            }, 0, HistoryManager, redirectObj.viewType, redirectObj.viewArgs, switchCompleted);
        };

        var saveToCustomerProfile = function (formId) {
            var defaultForm = formId == eForms.Deals ? formId : Customer.prop.mainPage;
            CustomerProfileManager.DefaultPage(defaultForm);
        };

        var redirectToURL = function (url) {
            var redirectResult = deepLinkHandler.InternalRedirect(url);
            var formId = redirectResult.startUpForm;
            var args = redirectResult.args || {};

            if (redirectResult.isDeepLink) {

                if (isSwitchToRealNeeded(formId, redirectResult.mode) || isSwitchToDemoNeeded(redirectResult.mode)) {
                    window.location.replace(url);
                    return;
                }//else

                redirectToForm(formId, args, function () {
                    redirectResult.processActions();
                });
            } else {
                redirectToForm(Customer.prop.mainPage, {});
            }
        };

        var isSwitchToDemoNeeded = function (targetAccountMode) {
            return Customer.prop.isDemo === false && targetAccountMode === eAccountMode.Demo;
        };

        var isSwitchToRealNeeded = function (formId, targetAccountMode, viewArgs) {
            return Customer.prop.isDemo === true && (
                targetAccountMode === eAccountMode.Real ||
                formId === eForms.Deposit ||
                formId === eForms.Withdrawal ||
                formId === eForms.UploadDocuments ||
                (!general.isNullOrUndefined(eForms.ChangePassword) && formId === eForms.ChangePassword) ||
                formId === eForms.ClientQuestionnaire ||
                formId === eForms.NotificationsSettings ||
                formId === eForms.Settings && (viewArgs === eViewTypes.vChangePassword || viewArgs === eViewTypes.vNotificationsSettings));
        };

        var isWizardView = function (viewArgs) {
            return viewArgs && viewArgs.hasOwnProperty('step') && !general.isEmptyValue(viewArgs.step);
        };

        var switchToWizardView = function (formId, viewArgs, switchCompleted) {
            if (!(permissionsModule.CheckFormPermissions(formId, true, viewArgs))) {
                return;
            }
            var redirectObj = ViewsRouterManager.GetFormToRedirect(formId, viewArgs);

            setTimeout(function (historyManager, form, args, callback) {
                historyManager.PushWizardState(form, args.step, callback);
            }, 0, HistoryManager, redirectObj.viewType, redirectObj.viewArgs, switchCompleted);
        };

        var redirectToForm = function (viewType, viewArgs, callback) {
            // need to switch mode from demo to real
            if (isSwitchToRealNeeded(viewType, null ,viewArgs)) {
                if (!(permissionsModule.CheckFormPermissions(viewType, true, viewArgs))) {
                    return;
                }

                var redirectPageName = Object.keys(eForms).find(function (key) { return eForms[key] === viewType });

                window.location.replace("Account/Redirect/" + redirectPageName);

                return;
            }

            if (isWizardView(viewArgs)) {
                return switchToWizardView(viewType, viewArgs, callback);
            }

            switchViewVisible(viewType, viewArgs, callback);
        };

        var getFormProperties = function (formType) {
            formType = formType || activeFormType();

            return Containers.Forms.GetItem(formType) || {};
        };

        return {
            Init: init,
            Start: start,
            GetFormProperties: getFormProperties,
            GetActiveFormViewProperties: getActiveFormView,
            // todo: replace all and test SwitchViewVisible to RedirectToForm
            // deprecated: use RedirectToForm which include business and application navigation validation  rules
            SwitchViewVisible: switchViewVisible,
            RedirectToForm: redirectToForm,
            RedirectToURL: redirectToURL,
            GetViewArgs: getViewArgs,
            GetViewArgsByKeyName: getViewArgsByKeyName,
            Activeform: getActiveForm,
            ActiveFormType: activeFormType,
            ActiveFormName: activeFormName,
            ChangeViewState: changeState,
            GetViewState: getViewState,
            Refresh: refresh,
            Reload: reload,
            History: {
                GoBack: goBack,
                GoForward: goForward
            },
            OnActiveFormChanged: onActiveFormChanged
        };
    }
);