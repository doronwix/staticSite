define(
    'managers/historymanager',
    [
        "require",
        "jquery",
        'handlers/general',
        "vendor/jquery.history"
    ],
    function (require) {
        var $ = require("jquery"),
            general = require('handlers/general'),
            history = require("vendor/jquery.history");

        // -----------------------------------------

        function State() {
            this.type = '';
        }

        // -----------------------------------------

        function InvalidState() {
            this.type = eHistoryStateType.Invalid;
        }

        InvalidState.prototype = Object.create(State.prototype);
        InvalidState.prototype.constructor = InvalidState;

        // -----------------------------------------

        function PopupState(popupType, popupId) {
            this.type = popupType;
            this.popupType = popupType;
            this.popupId = popupId;
        }

        PopupState.prototype = Object.create(State.prototype);
        PopupState.prototype.constructor = PopupState;

        PopupState.prototype.toString = function () {
            return "?popup=" + this.popupId;
        };

        // -----------------------------------------
        function WizardState(view, stepNumber) {
            this.type = eHistoryStateType.Wizard;
            this.step = stepNumber;
            this.view = view;
        }

        WizardState.prototype = Object.create(State.prototype);
        WizardState.prototype.constructor = WizardState;

        WizardState.prototype.toString = function () {
            return "?view=" + this.view + "&step=" + (!general.isEmptyValue(this.step) ? this.step : 1);
        };

        // -----------------------------------------

        function QuestionnaireState(pageNumber) {
            this.type = eHistoryStateType.Questionnaire;
            this.pageNumber = pageNumber;
            this.view = eForms.ClientQuestionnaire;
        }

        QuestionnaireState.prototype = Object.create(State.prototype);
        QuestionnaireState.prototype.constructor = QuestionnaireState;

        QuestionnaireState.prototype.toString = function () {
            return "?view=" + this.view + "&questionnaire=" + this.pageNumber;
        };

        // -----------------------------------------
        function ViewState(viewId, viewArgs) {
            this.type = eHistoryStateType.View;
            this.view = viewId;
            this.viewArgs = viewArgs;
        }

        ViewState.prototype = Object.create(State.prototype);
        ViewState.prototype.constructor = ViewState;

        ViewState.prototype.toString = function () {
            return "?view=" + this.view;
        };

        // -----------------------------------------

        function StartUpState(viewId, viewArgs) {
            this.type = 'startup';
            this.view = viewId;
            this.viewArgs = viewArgs;
        }

        StartUpState.prototype = Object.create(ViewState.prototype);
        StartUpState.prototype.constructor = StartUpState;

        // -----------------------------------------

        function HistoryManager() {
            var onStateChanged = new TDelegate();
            var skipStartup = true;

            //-------------- History Binding -----------------------------
            var init = function () {
                if (!history.enabled) {
                    // History.js is disabled for this browser.
                    // This is because we can optionally choose to support HTML4 browsers or not.
                    return false;
                }

                history.clearQueue();

                trackHistory();

                return true;
            };

            var isValidState = function (state) {
                return general.isDefinedType(state.data.type);
            };

            var isViewState = function (state) {
                return isValidState(state) && general.isDefinedType(state.data.view);
            };

            var isPopupState = function (state) {
                return isValidState(state) && !general.isEmptyType(state.data.popupType);
            };

            var isQuestionnaireState = function (state) {
                return isValidState(state) && !general.isEmptyType(state.data.pageNumber);
            };

            var isWizardState = function (state) {
                return isValidState(state) && !general.isEmptyType(state.data.step);
            };

            var isAlertState = function (state) {
                return isPopupState(state) && state.data.popupType === ePopupType.Alert;
            };

            var isDialogState = function (state) {
                return isPopupState(state) && state.data.popupType === ePopupType.Dialog;
            };

            function isExitingFullScreen(currentState, previousState) {
                var toggleControls = eFullScreenTogleControls;

                for (var name in toggleControls) {
                    if (!toggleControls.hasOwnProperty(name)) {
                        continue;
                    }

                    var toggleControl = toggleControls[name];

                    if (toggleControl.full === previousState.data.popupId &&
                        toggleControl.default === currentState.data.popupId) {
                        return true;
                    }
                }

                return false;
            }

            function isEnteringFullScreen(currentState, previousState) {
                var toggleControls = eFullScreenTogleControls;

                for (var name in toggleControls) {
                    if (!toggleControls.hasOwnProperty(name)) {
                        continue;
                    }

                    var toggleControl = toggleControls[name];

                    if (toggleControl.full === currentState.data.popupId &&
                        (toggleControl.default === previousState.data.popupId || toggleControl.default === previousState.data.view)) {
                        return true;
                    }
                }

                return false;
            }

            var isStartUpState = function (state) {
                return isViewState(state) && state.data.type === 'startup';
            };

            var getPreviousState = function () {
                return history.getStateByIndex(history.getCurrentIndex() - 1);
            };

            function trackHistory() {
                // Bind to StateChange Event
                $(window).on('statechange', function () { // Note: We are using statechange instead of popstate
                    var currentState = history.getState();
                    var previousState = getPreviousState();

                    if (isStartUpState(currentState) && skipStartup) {
                        skipStartup = false;
                        return;
                    }

                    if (isWizardState(currentState)) {
                        onStateChanged.Invoke(new WizardState(currentState.data.view, currentState.data.step));
                    }

                    // questionnaire, and it could be inside a popup
                    if (isQuestionnaireState(currentState) || isPopupState(currentState)) {
                        onStateChanged.Invoke(new QuestionnaireState(currentState.data.pageNumber));
                    }

                    if (isExitingFullScreen(currentState, previousState)) {
                        onStateChanged.Invoke(new PopupState(eHistoryStateType.ExitFullscren, previousState.data.popupId));
                    }

                    if (isEnteringFullScreen(currentState, previousState)) {
                        onStateChanged.Invoke(new PopupState(eHistoryStateType.EnterFullscren, previousState.data.popupId));
                    }


                    if (isPopupState(currentState)) { // alerts and dialogs
                        return;
                    }

                    if (isAlertState(previousState) && currentState.navigation) {
                        onStateChanged.Invoke(new PopupState(eHistoryStateType.CloseAlert, previousState.data.popupId));
                        return;
                    }

                    if (isDialogState(previousState) && currentState.navigation) {
                        onStateChanged.Invoke(new PopupState(eHistoryStateType.CloseDialog, previousState.data.popupId));
                        return;
                    }

                    if (isViewState(currentState)) {
                        onStateChanged.Invoke(new ViewState(currentState.data.view, currentState.data.viewArgs));
                        return;
                    }

                    if (isValidState(currentState)) {
                        onStateChanged.Invoke(currentState.data);
                    } else {
                        onStateChanged.Invoke(new InvalidState());
                    }
                });
            }

            var pushViewState = function (form, args, stateChangedCallback) {
                pushState(new ViewState(form, args), stateChangedCallback);
            };

            var replaceViewState = function (form, args) {
                replaceState(new ViewState(form, args));
            };

            var pushQuestonnaireState = function (pageNumber) {
                if (pageNumber === 1) {
                    replaceState(new QuestionnaireState(pageNumber));
                } else {
                    pushState(new QuestionnaireState(pageNumber));
                }
            };

            var pushStartUpState = function (form, args, stateChangedCallback) {
                pushState(new StartUpState(form, args), stateChangedCallback);
            };

            var pushPopupState = function (type, popupId, stateChangedCallback) {
                if (type !== ePopupType.Dialog && type !== ePopupType.Alert) {
                    throw new Error("Not implemented Type: " + type);
                }

                // push state for back option
                pushState(new PopupState(type, popupId), stateChangedCallback);
            };

            var pushSubState = function (serializedState, stateChangeCallback) {
                var currentState = history.getState(),
                    subState;

                if (isQuestionnaireState(currentState)) {
                    subState = new QuestionnaireState(currentState.data.pageNumber);
                } else if (isPopupState(currentState)) {
                    subState = new PopupState(currentState.data.popupType, currentState.data.popupId);
                } else if (isViewState(currentState)) {
                    subState = new ViewState(currentState.data.view, currentState.data.viewArgs);
                }

                if (subState) {
                    subState.toString = function () {
                        return Object.getPrototypeOf(subState).toString.apply(subState, arguments) + "&" + serializedState;
                    };

                    pushState(subState, stateChangeCallback);
                }
            };

            var pushNavWizardState = function (view, step, stateChangedCallback) {
                pushState(new WizardState(view, step), stateChangedCallback);
            };

            function pushState(state, stateChangedCallback) {
                var currentState = history.getState();

                if (general.isFunctionType(stateChangedCallback)) {
                    if (general.equals(currentState.data, state)) {
                        setTimeout(stateChangedCallback);
                    } else {
                        $(window).one('statechange', stateChangedCallback);
                    }
                }

                history.pushState(state, window.document.title, state.toString());
            }

            function replaceState(state) {
                history.replaceState(state, window.document.title, state.toString());
            }

            var start = function (view, args, startCallback) {
                // jquery.history is using hashtag and not search on ie
                // refresh detection
                var state = history.getState();

                if (isViewState(state) && !isStartUpState(state) && (state.url.containsNotEmpty(window.location.search) || window.location.hash.containsNotEmpty(history.getHash()))) {
                    history.Adapter.trigger(window, 'statechange'); // when page is refresh we need to force statechange

                    if (general.isFunctionType(startCallback)) {
                        startCallback();
                    }
                } else {
                    pushViewState(view, args, startCallback);
                }
            };

            var hasAlert = function (alertType) {
                var state = history.getState();
                return isAlertState(state) && state.data.popupId === alertType;
            };

            var hasDialog = function (dialogName) {
                var state = history.getState();
                return isDialogState(state) && state.data.popupId === dialogName;
            };

            var historyGo = function (direction, callback) {
                if (general.isFunctionType(callback)) {
                    $(window).one('statechange', function () {
                        callback();
                    });
                }

                history.go(direction);
            };

            var goBack = function (callback) {
                historyGo(-1, callback);
            };

            var goForward = function (callback) {
                historyGo(1, callback);
            };

            return {
                Start: start,
                Init: init,

                Back: goBack,
                Forward: goForward,
                GetCurrentState: history.getState,

                PushSubState: pushSubState,

                PushViewState: pushViewState,
                ReplaceViewState: replaceViewState,
                PushPopupState: pushPopupState,
                PushStartUpState: pushStartUpState,
                PushQuestionnaireState: pushQuestonnaireState,
                PushWizardState: pushNavWizardState,

                HasAlert: hasAlert,
                HasDialog: hasDialog,

                OnStateChanged: onStateChanged
            };
        }

        var module = window.HistoryManager = new HistoryManager();

        return module;
    }
);
