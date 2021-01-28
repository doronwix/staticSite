var FingerprintLogin = (function () {
    var eAutoLoginAllowStatus = {
        None: 0,
        Allow: 1,
        Restricted: 2
    };

    var eFingerprintLoginResult = {
        None: 0,
        Success: 1,
        LoginServerError: 2,
        FingerprintNotSupported: 3,
        NoFingerPrintOnDevice: 4,
        FigerprintNotSet: 5,
        LastLoginMethodNotFingerprint: 6,
        CancelFingerprint: 7,
        ScanError: 8,
        CancelAfterMaxAttempts: 9,
        TokenNotFound: 10,
        ErrorGetToken: 11
    };

    var self = this;
    self.fingerprintResult = 0;
    var $, model, fingerprintTools, lastLoginMethod, popupManager, externalEventsCallbacks;

    showEarlyFingerprintButton();

    function showEarlyFingerprintButton() {
        if (window.FingerprintTools) {
            var storedFingerprintSupport = window.FingerprintTools.RetrieveFingerprintSupport();
            if (storedFingerprintSupport &&
                (storedFingerprintSupport === window.FingerprintTools.DeviceSupportErrorEnum.SUPPORTED ||
                    storedFingerprintSupport === window.FingerprintTools.DeviceSupportErrorEnum.DEVICE_HAS_NO_ENROLLED_FINGERPRINT ||
                    storedFingerprintSupport === window.FingerprintTools.DeviceSupportErrorEnum.BIOMETRY_IS_LOCKED_OUT)) {
                //pure javascript because jquery is not ready yet
                if (document.getElementById("TokenLoginForm")) {
                    document.getElementById("TokenLoginForm").style.display = "block";
                }
            };
        }
    }

    function initDependencies(_$, _model, _fingerprintTools, _lastLoginMethod, _popupManager, _externalEventsCallbacks) {
        $ = _$;
        model = _model;
        fingerprintTools = _fingerprintTools;
        lastLoginMethod = _lastLoginMethod;
        popupManager = _popupManager;
        externalEventsCallbacks = _externalEventsCallbacks;
    }

    function initHandlers() {
        $("#fingerPrintLogin").click(function () {
            fingerprintStartPressButton();
        });

        $('#btnOkLogin').click(function () {
            lastLoginMethod.SetLastLoginMethod(eLoginMethods.Password);
        });
    }

    function getFingerprintResult() {
        return self.fingerprintResult;
    }

    function removeFingerprintLogin() {
        fingerprintTools.DeleteToken();
        lastLoginMethod.SetLastLoginMethod(eLoginMethods.Password);
    }

    function loginError(loginStatus) {
        externalEventsCallbacks.fire('login-error', {
            isAutologin: false,
            reason: loginStatus,
            type: "server"
        });

        removeFingerprintLogin();
        showSetupFingerprintPopup();
    }

    function showSetupFingerprintPopup() {
        var content = JSON.parse(model.FingerprintModelJson).Content;
        popupManager.showSetupFingerprintPopup(content.scanFingerprintTitle, content.setupFingerPrintMessage, content.cancelButton, content.continueButton);
    }

    function showScanError(message) {
        var content = JSON.parse(model.FingerprintModelJson).Content;
        popupManager.showSetupFingerprintPopup('', message, content.closeButton);
    }

    function fingerprintStart(loginStatus) {
        initHandlers();
        fingerprintTools.Init();

        if (loginStatus === eAutoLoginAllowStatus.Restricted) {
            loginError(loginStatus);
            self.fingerprintResult = eFingerprintLoginResult.LoginServerError;

            return;
        }

        var lastLoginMethodType = lastLoginMethod.GetLastLoginMethod();

        fingerprintTools.IsDeviceSupportFingerprint(
            function onSuccessDeviceSupportFingerPrint() {
                $("#TokenLoginForm").show();
                if (fingerprintTools.IsFingerprintSet()) {
                    if (parseInt(lastLoginMethodType) === eLoginMethods.Fingerprint) {
                        fingerprintAuthentication();
                    }
                    else {
                        self.fingerprintResult = eFingerprintLoginResult.LastLoginMethodNotFingerprint;
                    }
                }
                else {
                    self.fingerprintResult = eFingerprintLoginResult.FigerprintNotSet;
                }

            },
            function onErrorDeviceSupportFingerPrint(errorMessage) {
                // device supports fingerprint but user doesn't have fingerprint enrollments 
                if (errorMessage === fingerprintTools.DeviceSupportErrorEnum.DEVICE_HAS_NO_ENROLLED_FINGERPRINT ||
                    errorMessage === fingerprintTools.DeviceSupportErrorEnum.BIOMETRY_IS_LOCKED_OUT) {
                    $("#TokenLoginForm").show();
                    self.fingerprintResult = eFingerprintLoginResult.NoFingerPrintOnDevice;
                }
                else {
                    $("#TokenLoginForm").hide();
                    self.fingerprintResult = eFingerprintLoginResult.FingerprintNotSupported;
                }
            }
        );
    }

    function getTokenAndLogin() {
        fingerprintTools.GetToken(0,
            function onSuccessGetToken(token) {
                externalEventsCallbacks.fire('login-submit', {
                    isAutologin: false,
                    type: "fingerprint"
                });

                lastLoginMethod.SetLastLoginMethod(eLoginMethods.Fingerprint);
                tokenSubmit(token);
                self.fingerprintResult = eFingerprintLoginResult.Submit;
            },
            function onErrorGetToken(message) {
                showSetupFingerprintPopup();
                self.fingerprintResult = eFingerprintLoginResult.TokenNotFound;

            });
    }

    function tokenSubmit(token) {
        $("#token").val(token);
        $('#TokenLoginForm').submit();
    }

    function fingerprintStartPressButton() {
        //one more time ask IsDeviceSupport - for case if user removes fingerprint from device while not closing login screen  
        fingerprintTools.IsDeviceSupportFingerprint(
            function onSuccessDeviceSupportFingerPrint() {
                if (fingerprintTools.IsFingerprintSet()) {
                    fingerprintAuthentication();
                } else {
                    showSetupFingerprintPopup();
                    self.fingerprintResult = eFingerprintLoginResult.FigerprintNotSet;
                }
            },
            function onErrorDeviceSupportFingerPrint(errorMessage) {
                if (errorMessage === fingerprintTools.DeviceSupportErrorEnum.BIOMETRY_IS_LOCKED_OUT) {
                    if (fingerprintTools.IsFingerprintSet()) {
                        fingerprintAuthentication();
                        return;
                    }
                }
                showSetupFingerprintPopup();
                self.fingerprintResult = eFingerprintLoginResult.NoFingerPrintOnDevice;

            }
        );
    }

    function fingerprintAuthentication() {
        var fingerprintModel = JSON.parse(model.FingerprintModelJson);
        var contentDictionary = fingerprintModel.Content;
        var maxScanAttemts = fingerprintModel.MaxScanAttempts;
        var config = {
            title: contentDictionary.scanFingerprintMessage,
            message: " ", //one space since the native plug in crashes when empty string.
            cancel: contentDictionary.cancelButton,
            fingerprint_not_recognized: contentDictionary.scanFingerprintNotRecognized,
            fingerprint_success: contentDictionary.scanFingerprintSuccess,
            secure_lock_screen_required: contentDictionary.scanFingerprintSecureLockRequired,
            finger_moved_too_fast: contentDictionary.scanFingerprintMoovedTooFast,
            too_many_attempts: contentDictionary.scanFingerprintTooManyAttempts
        };
        var scanErrorCounter = 0;

        fingerprintTools.ShowSetFingerprint(config,
            function onSuccessShowSetFingerprint() {
                getTokenAndLogin();
            },
            function onErrorShowSetFingerprint(message, isCancelled) {
                if (typeof message === 'string' && !isCancelled) {
                    showScanError(message);
                }
                self.fingerprintResult = eFingerprintLoginResult.CancelFingerprint;
            },
            function onScanError() {
                scanErrorCounter += 1;

                if (scanErrorCounter >= maxScanAttemts) {
                    fingerprintTools.FingerprintScanCancel(function onSuccess() { }, function onError() { });
                    self.fingerprintResult = eFingerprintLoginResult.CancelAfterMaxAttempts;
                } else {
                    self.fingerprintResult = eFingerprintLoginResult.ScanError;
                }
            }
        );
    }

    return {
        eFingerprintLoginResult: eFingerprintLoginResult,
        InitDependencies: initDependencies,
        GetFingerprintResult: getFingerprintResult,
        FingerprintStart: fingerprintStart
    }
})();
