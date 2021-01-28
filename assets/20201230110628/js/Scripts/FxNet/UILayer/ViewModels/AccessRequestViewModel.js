define(
    'viewmodels/AccessRequestViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'helpers/KoComponentViewModel',
        'dataaccess/dalCompliance',
        'managers/viewsmanager',
        'StateObject!RequestAccess',
        'managers/historymanager',
        'Dictionary',
        'devicemanagers/AlertsManager',
        'modules/permissionsmodule'
    ],
    function (require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            KoComponentViewModel = require('helpers/KoComponentViewModel'),
            dalCompliance = require('dataaccess/dalCompliance'),
            ViewsManager = require('managers/viewsmanager'),
            HistoryManager = require('managers/historymanager'),
            stateRequestAccess = require('StateObject!RequestAccess'),
            alertsManager = require('devicemanagers/AlertsManager'),
            dictionary = require("Dictionary"),
            permissionsModule = require('modules/permissionsmodule');

        var AccessRequestViewModel = general.extendClass(KoComponentViewModel, function (params) {
            var self = this,
                parent = this.parent,
                data = this.Data,
                requestAccessType = params.requestAccessType,
                cachedKey;

            function init(settings) {
                parent.init.call(self, settings);

                setObservables();
                setInitialStatus();
            }

            function setObservables() {
                data.currentStatus = ko.observable(eAccessRequestStatus.RequestNotSubmitted);

                data.isRequestNotSubmitted = ko.computed(function () {
                    return data.currentStatus() === eAccessRequestStatus.RequestNotSubmitted;
                }, data);

                data.isRequestSubmitted = ko.computed(function () {
                    return data.currentStatus() === eAccessRequestStatus.RequestSubmitted;
                }, data);

                data.isExtensionNotSubmitted = ko.computed(function () {
                    return data.currentStatus() === eAccessRequestStatus.ExtensionNotSubmitted;
                }, data);

                data.isExtensionSubmitted = ko.computed(function () {
                    return data.currentStatus() === eAccessRequestStatus.ExtensionSubmitted;
                }, data);
            }

            function getCachedKey() {
                var key = '';

                switch (requestAccessType) {
                    case eRequestAccessType.Signals:
                        key = eStateObjectAccessRequest.Signals;
                        break;

                    case eRequestAccessType.VideoLessons:
                        key = eStateObjectAccessRequest.VideoLessons;
                        break;

                    case eRequestAccessType.Tutorials:
                        key = eStateObjectAccessRequest.Tutorials;
                        break;
                }

                return key;
            }

            function setInitialStatus() {
                var status;

                cachedKey = getCachedKey();

                if (!stateRequestAccess.containsKey(cachedKey)) {
                    if (params.isAllowedAccess) {
                        status = eAccessRequestStatus.ExtensionNotSubmitted;
                    }
                    else {
                        status = eAccessRequestStatus.RequestNotSubmitted;
                    }
                    stateRequestAccess.set(cachedKey, status);
                }
                else {
                    status = stateRequestAccess.get(cachedKey);
                }

                data.currentStatus(status);
            }

            function setCurrentStatus(status) {
                data.currentStatus(status);
                stateRequestAccess.update(cachedKey, status);
            }

            function handleRequestOnSuccess() {
                if (data.isRequestNotSubmitted()) {
                    setCurrentStatus(eAccessRequestStatus.RequestSubmitted);
                }
                else if (data.isExtensionNotSubmitted()) {
                    setCurrentStatus(eAccessRequestStatus.ExtensionSubmitted);
                }
            }

            function onClickSubmitRequest() {
                if (!permissionsModule.CheckPermissions("requestTradingSignalsAccess")) {
                    alertsManager.UpdateAlert(AlertTypes.ServerResponseAlert, null, dictionary.GetItem('Forbidden'), null);
                    alertsManager.PopAlert(AlertTypes.ServerResponseAlert);

                    return;
                }

                dalCompliance
                    .sendRequestAccess(requestAccessType)
                    .then(function (status) {
                        if (status === eOperationStatus.Success) {
                            handleRequestOnSuccess();
                        }
                    });
            }

            function onCloseClick() {
                var viewToReturn = ViewsManager.Activeform().args ? ViewsManager.Activeform().args['returnTo'] : null;

                if (viewToReturn) {
                    ViewsManager.SwitchViewVisible(viewToReturn);
                }
                else {
                    HistoryManager.Back();
                }
            }

            return {
                init: init,
                Data: data,
                OnClickSubmitRequest: onClickSubmitRequest,
                OnCloseClick: onCloseClick
            };
        });

        var createViewModel = function (_params) {
            var params = _params || {};

            var viewModel = new AccessRequestViewModel(params);
            viewModel.init();

            return viewModel;
        };

        return {
            viewModel: {
                createViewModel: createViewModel
            }
        };
    }
);