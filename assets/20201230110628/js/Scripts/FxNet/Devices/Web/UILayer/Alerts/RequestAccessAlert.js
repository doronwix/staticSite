define(
    'devicealerts/RequestAccessAlert',
    [
        'require',
        'knockout',
        'devicealerts/Alert',
        'dataaccess/dalCompliance',
        'StateObject!RequestAccess',
    ],
    function (require) {
        var ko = require('knockout'),
            AlertBase = require('devicealerts/Alert'),
            dalCompliance = require('dataaccess/dalCompliance'),
            stateRequestAccess = require('StateObject!RequestAccess');

        var RequestAccessAlert = function () {
            var inheritedAlertInstance = new AlertBase();
            var stateAccessRequestKey;

            var init = function () {
                inheritedAlertInstance.alertName = 'RequestAccessAlert';
                inheritedAlertInstance.visible(false);
                inheritedAlertInstance.prepareForShow = prepareForShow;
            };

            var setObservables = function () {
                inheritedAlertInstance.isRequestSubmitted = ko.observable(false);
            };

            var setAlertContent = function () {
                stateAccessRequestKey = inheritedAlertInstance.properties.stateAccessRequestKey;

                if (!stateRequestAccess.containsKey(stateAccessRequestKey)) {
                    stateRequestAccess.set(
                        stateAccessRequestKey,
                        eAccessRequestStatus.RequestNotSubmitted
                    );
                }
                else {
                    var requestStatus = stateRequestAccess.get(stateAccessRequestKey);

                    inheritedAlertInstance.isRequestSubmitted(
                        requestStatus === eAccessRequestStatus.RequestSubmitted
                    );

                    if (inheritedAlertInstance.isRequestSubmitted()) {
                        inheritedAlertInstance.title(
                            Dictionary.GetItem('lblRequestSubmittedTitle', 'accessRequest')
                        );
                    }
                }
            };

            function handleRequestOnSuccess() {
                inheritedAlertInstance.isRequestSubmitted(true);

                stateRequestAccess.update(
                    stateAccessRequestKey,
                    eAccessRequestStatus.RequestSubmitted
                );

                inheritedAlertInstance.title(
                    Dictionary.GetItem('lblRequestSubmittedTitle', 'accessRequest')
                );
            }

            var onClickRequestAccess = function () {
                dalCompliance
                    .sendRequestAccess(inheritedAlertInstance.properties.requestAccessType)
                    .then(function (statusResponse) {
                        if (statusResponse === eOperationStatus.Success) {
                            handleRequestOnSuccess();
                        }
                    })
                    .fail(function () {
                        inheritedAlertInstance.hide();
                    });
            };

            var onClickOk = function () {
                inheritedAlertInstance.hide();
            };

            function prepareForShow() {
                this.onClickRequestAccess = onClickRequestAccess;
                this.onClickOk = onClickOk;

                setObservables();
                setAlertContent();
            }

            return {
                Init: init,
                GetAlert: inheritedAlertInstance,
            };
        };

        return RequestAccessAlert;
    }
);
