/*global eLoginMethods  */
define(
    'deviceviewmodels/LoginOptionsViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'helpers/KoComponentViewModel',
        'devicemanagers/ViewModelsManager',
        'devicemanagers/AlertsManager',
        'dataaccess/dalCommon',
        'global/native/FingerprintTools',
        'global/devices/native/LastLoginMethod',
        'initdatamanagers/Customer',
        'Dictionary',
        'enums/alertenums',
    ],
    function (require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            KoComponentViewModel = require('helpers/KoComponentViewModel'),
            viewModelsManager = require('devicemanagers/ViewModelsManager'),
            AlertsManager = require('devicemanagers/AlertsManager'),
            FingerprintTools = require('global/native/FingerprintTools'),
            LastLoginMethod = require('global/devices/native/LastLoginMethod'),
            Customer = require('initdatamanagers/Customer'),
            Dictionary = require('Dictionary'),
            dalCommon = require('dataaccess/dalCommon');

        var LoginOptionsViewModel = general.extendClass(KoComponentViewModel, function () {
            var self = this,
                parent = this.parent, // inherited from KoComponentViewModel
                data = this.Data,
                isValidTokenExist = false,
                isDeviceSupportFingerprint = true;

            function setObservables() {
                data.isFingerprintOn = ko.observable(false);
            }

            function fingerprintLoginActivatedAlert() {

                AlertsManager.UpdateAlert(AlertTypes.FingerprintLoginActivatedAlert, Dictionary.GetItem('fingerprintActivatedTitle', 'loginOptions'), '', null, {});
                AlertsManager.PopAlert(AlertTypes.FingerprintLoginActivatedAlert);
            }

            function confirmAddFingerprintAlert() {
                var buttonsProperties = {
                    okButtonCallback: function () {
                        startFingerprint();
                    },
                    cancelButtonCallback: function () {
                        data.isFingerprintOn(false);
                    }
                };

                var message = Dictionary.GetItem('confirmAddFingerprintMessage');
                AlertsManager.UpdateAlert(AlertTypes.AddFingerprintLoginOptionConfirmationAlert, Dictionary.GetItem('scanFingerprintTitle', 'loginOptions'), message, null, buttonsProperties);
                AlertsManager.PopAlert(AlertTypes.AddFingerprintLoginOptionConfirmationAlert);
            }

            function confirmRemoveFingerprintAlert() {
                var buttonsProperties = {
                    okButtonCallback: function () {
                        data.isFingerprintOn(false);

                        FingerprintTools.DeleteToken();
                        LastLoginMethod.SetLastLoginMethod(eLoginMethods.Password);

                        isValidTokenExist = false;
                    },
                    cancelButtonCallback: function () {
                        data.isFingerprintOn(true);
                    }
                };

                var message = Dictionary.GetItem('RemoveFingerprintLoginOptionConfirmationMessage');

                AlertsManager.UpdateAlert(AlertTypes.RemoveFingerprintLoginOptionConfirmationAlert, '', message, null, buttonsProperties);
                AlertsManager.PopAlert(AlertTypes.RemoveFingerprintLoginOptionConfirmationAlert);
            }

            function deviceNotSupportFingerprintAlert() {
                var message = Dictionary.GetItem('deviceNotSupportFingerprintMessage', 'loginOptions');//'You will be able to login to your account using your fingerprint on this device.'
                var buttonsProperties = {
                    okButtonCallback: function () {
                    }
                };

                AlertsManager.UpdateAlert(AlertTypes.DeviceNotSupportFingerprintAlert, Dictionary.GetItem('scanFingerprintTitle', 'loginOptions'), message, null, buttonsProperties);
                AlertsManager.PopAlert(AlertTypes.DeviceNotSupportFingerprintAlert);
            }

            function scanErrorMessageFingerprintAlert(message) {
                var buttonsProperties = {
                    okButtonCallback: function () {
                    }
                };

                AlertsManager.UpdateAlert(AlertTypes.DeviceNotSupportFingerprintAlert, '', message, null, buttonsProperties);
                AlertsManager.PopAlert(AlertTypes.DeviceNotSupportFingerprintAlert);
            }

            function onDeviceNotSupported(errorMessage) {
                if (errorMessage === FingerprintTools.DeviceSupportErrorEnum.BIOMETRY_IS_LOCKED_OUT)
                    onDeviceSupported()
                else {
                    deviceNotSupportFingerprintAlert();
                    data.isFingerprintOn(false);
                }
            }

            function onDeviceSupported() {
                var config = {
                    title: Dictionary.GetItem('scanFingerprintMessage', 'loginOptions'),//'Scan your fingerprint',
                    message: ' ', //one space since the native plug in crashes when empty string.
                    cancel: Dictionary.GetItem('cancelButton', 'loginOptions'),
                    fingerprint_not_recognized: Dictionary.GetItem('scanFingerprintNotRecognized', 'loginOptions'),
                    fingerprint_success: Dictionary.GetItem('scanFingerprintSuccess', 'loginOptions'),
                    secure_lock_screen_required: Dictionary.GetItem('scanFingerprintSecureLockRequired', 'loginOptions'),
                    finger_moved_too_fast: Dictionary.GetItem('scanFingerprintMoovedTooFast', 'loginOptions'),
                    too_many_attempts: Dictionary.GetItem('scanFingerprintTooManyAttempts', 'loginOptions')
                };

                var scanErrorCounter = 0;

                FingerprintTools.ShowSetFingerprint(
                    config,
                    function onSuccess() {
                        dalCommon
                            .GetJWTLogin()
                            .then(function (responseText) {
                                FingerprintTools.SetToken(Customer.prop.accountNumber, responseText);
                                isValidTokenExist = true;
                                data.isFingerprintOn(true);
                                LastLoginMethod.SetLastLoginMethod(eLoginMethods.Fingerprint);
                                fingerprintLoginActivatedAlert();
                            })
                            .fail(function () {
                                isValidTokenExist = false;
                                data.isFingerprintOn(false);
                                LastLoginMethod.SetLastLoginMethod(eLoginMethods.Password);
                            });
                    },
                    function onError(message, isCancelled) {
                        if (typeof message === 'string' && !isCancelled) {
                            scanErrorMessageFingerprintAlert(message)
                        }

                        data.isFingerprintOn(false);
                    },
                    function onScanError() {
                        data.isFingerprintOn(false);
                        scanErrorCounter += 1;

                        if (scanErrorCounter >= window.systemInfo.fingerprintMaxScanAttempts) {
                            FingerprintTools.FingerprintScanCancel(function onSuccess() { }, function onError() { });
                        }
                    }
                );
            }

            function startFingerprint() {
                FingerprintTools.IsDeviceSupportFingerprint(onDeviceSupported, onDeviceNotSupported);
            }

            function setSubscribers() {
                self.subscribeTo(data.isFingerprintOn, function onFingerprintClick(value) {
                    if (isDeviceSupportFingerprint === false) {
                        data.isFingerprintOn(false);
                        return;
                    }

                    if (value) {
                        //start fingerprint scan
                        if (!isValidTokenExist) {
                            confirmAddFingerprintAlert();
                        }
                    }
                    else {
                        if (isValidTokenExist) {
                            confirmRemoveFingerprintAlert();
                        }
                    }
                }, self);
            }

            function GetTokenFingerprint(viewArgs) {
                FingerprintTools.GetToken(Customer.prop.accountNumber,
                    function onSuccessGetToken() {
                        // valid token
                        isValidTokenExist = true;
                        data.isFingerprintOn(true);
                    },
                    function onErrorGetToken() {
                        isValidTokenExist = false;

                        // deep link to option fingerprint - iOS
                        if (viewArgs.option && viewArgs.option.toLowerCase() === 'fingerprint') {
                            data.isFingerprintOn(true);
                        }
                        else {
                            data.isFingerprintOn(false);
                        }
                    });
            }

            function init(settings) {
                var viewArgs = viewModelsManager.VManager.GetViewArgs(eViewTypes.vAccountPreferences);
                parent.init.call(self, settings); // inherited from KoComponentViewModel

                setObservables();
                setSubscribers();

                FingerprintTools.IsDeviceSupportFingerprint(
                    function onSuccess() {
                        GetTokenFingerprint(viewArgs);
                    },
                    function onError(errorMessage) {
                        if (errorMessage === FingerprintTools.DeviceSupportErrorEnum.BIOMETRY_IS_LOCKED_OUT) {
                            GetTokenFingerprint(viewArgs);
                        }
                        else {
                            if (errorMessage !== FingerprintTools.DeviceSupportErrorEnum.DEVICE_HAS_NO_ENROLLED_FINGERPRINT) {
                                isDeviceSupportFingerprint = false;
                            }

                            FingerprintTools.DeleteToken();
                            isValidTokenExist = false;
                        }
                    });
            }

            function dispose() {
                parent.dispose.call(self); // inherited from KoComponentViewModel
            }

            return {
                init: init,
                dispose: dispose,
                Data: data
            };
        });

        var createViewModel = function (params) {
            var viewModel = new LoginOptionsViewModel(params);

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
