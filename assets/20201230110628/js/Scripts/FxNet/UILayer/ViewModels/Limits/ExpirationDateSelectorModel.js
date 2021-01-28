define(
    'viewmodels/limits/ExpirationDateSelectorModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'Dictionary',
        'viewmodels/dialogs/DialogViewModel'
    ],
    function(require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            Dictionary = require('Dictionary'),
            DialogViewModel = require('viewmodels/dialogs/DialogViewModel');

        function ExpirationDateSelectorModel(customSettings) {
            var observableObject = {};

            var settings = {
                title: Dictionary.GetItem("EditLimitExpirationDate",'dialogsTitles',' '),
                width: 420,
                dialogClass: "fx-dialog expPopup",
                onCloseCallback: function() { onDateDialogClosed(); }
            };

            ko.utils.extend(settings, customSettings || {});

            var init = function() {
                setDefaultObservables();
                setSubscribers();
            };

            var setDefaultObservables = function() {
                observableObject.isGoodTillCancel = ko.observable(true);
                observableObject.expirationDateValue = ko.observable("");
            };

            var setSubscribers = function() {
                observableObject.isGoodTillCancel.subscribe(function() {
                    onOptionChanged();
                });
            };

            var resetObservables = function() {
                observableObject.isGoodTillCancel(true);
                observableObject.expirationDateValue("");
            }

            var onOptionChanged = function() {
                if (isGoodTillCancelChecked()) {
                    return;
                } else {
                    openSelectDateDialog();
                }
            };

            var openSelectDateDialog = function() {
                if (general.isDefinedType(DialogViewModel)) {
                    DialogViewModel.open(eDialog.EditLimitExpirationDate, settings, eViewTypes.vEditLimitExpirationDate);
                }
            };

            var onDateDialogClosed = function() {
                if (general.isEmpty(observableObject.expirationDateValue())) {
                    observableObject.isGoodTillCancel(true);
                }
            };

            var updateSelectedDateUI = function(expirationDateValue) {
                observableObject.expirationDateValue(expirationDateValue);
                observableObject.isGoodTillCancel(false);
            };

            var isGoodTillCancelChecked = function() {
                return observableObject.isGoodTillCancel() === true;
            };

            return {
                Init: init,
                Data: observableObject,
                IsGoodTillCancelChecked: isGoodTillCancelChecked,
                OnOptionChanged: onOptionChanged,
                UpdateSelectedDateUI: updateSelectedDateUI,
                ResetObservables: resetObservables
            };
        }

        return ExpirationDateSelectorModel;
    }
);