(function (root, factory) {
    'use strict';
    if (typeof define === "function" && define.amd) {
        define("global/native/FingerprintTools", ['generalmanagers/ErrorManager'], factory);
    } else {
        root.FingerprintTools = factory(root.ErrorManager);
    }
}(typeof self !== 'undefined' ? self : this, function (errorManager) {
    function FingerprintToolsClass() {
        var fingerPrintKey = "fingerPrint",
            fingerprintSupportKey = "fingerprintSupport";

        function init() {
            removeFingerprintSupportLS();
        }

        function onError(name, message) {
            if (errorManager) {
                errorManager.onError("CFingerprintTools/" + name, message);
            }
        }

        function isDeviceSupportFingerprint(successCallback, errorCallback) {
            try {
                Fingerprint.IsDeviceSupportFingerprint(isDeviceSupportFingerprintSuccess, isDeviceSupportFingerprintError);
            } catch (e) {
                errorCallback(deviceSupportErrorEnum.OTHER_REASON);
            }

            function isDeviceSupportFingerprintSuccess(fpType) {
                if (!(typeof fpType === "undefined" || fpType === null) && fpType === 'face') {
                    isDeviceSupportFingerprintError(deviceSupportErrorEnum.IOS_FACE_INSTEADOF_FINGERPTINT);
                }
                else {
                    storeFingerprintSupport(window.deviceSupportErrorEnum.SUPPORTED);
                    successCallback(fpType);
                }
            }

            function isDeviceSupportFingerprintError(message) {
                if (message === window.deviceSupportErrorEnum.DEVICE_HAS_NO_ENROLLED_FINGERPRINT) {
                    //delete token and local storage in case of removed fingerprint
                    deleteToken();
                    storeFingerprintSupport(message);
                }
                else if (message === window.deviceSupportErrorEnum.BIOMETRY_IS_LOCKED_OUT) {
                    storeFingerprintSupport(message);
                }

                errorCallback(message);
            }
        }

        function storeFingerprintSupport(supportValue) {
            localStorage.setItem(fingerprintSupportKey, supportValue);
        }

        function retrieveFingerprintSupport() {
            var fingerprintSupport = localStorage.getItem(fingerprintSupportKey);

            if (typeof fingerprintSupport === "undefined" || fingerprintSupport === null) {
                return null;
            }

            return fingerprintSupport;
        }

        function removeFingerprintSupportLS() {
            localStorage.removeItem(fingerprintSupportKey);
        }

        function getToken(account, successCallback, errorCallback) {
            Fingerprint.GetToken(GetTokenSuccess, GetTokenError);

            function GetTokenSuccess(result) {
                if (result && result !== "0") {
                    var tokenObj = JSON.parse(result);

                    //on login account === 0
                    if (account === 0 || tokenObj.account === account) {
                        return successCallback(tokenObj.token);
                    }

                    return errorCallback(tokenErrorEnum.WRONG_ACCOUNT_NUMBER);
                }

                return errorCallback(result);
            }

            function GetTokenError(message) {
                onError("GetTokenError", message);

                return errorCallback(message);
            }
        }

        function setFingerprintSet() {
            localStorage.setItem(fingerPrintKey, "1");
        }

        function isFingerprintSet() {
            var fingerPrintSet = localStorage.getItem(fingerPrintKey);

            return !(typeof fingerPrintSet === "undefined" || fingerPrintSet === null);
        }

        function removeFingerprintSet() {
            localStorage.removeItem(fingerPrintKey);
        }

        function setToken(account, tokenVar) {
            Fingerprint.SetToken(JSON.stringify({ "token": tokenVar, "account": account }), SetTokenSuccess, SetTokenError);

            function SetTokenSuccess(result) {
                setFingerprintSet();
                return result;
            }

            function SetTokenError(message) {
                onError("SetTokenError", message);
            }
        }

        function deleteToken() {
            removeFingerprintSet();

            try {
                Fingerprint.DeleteToken(DeleteTokenSuccess, DeleteTokenError);
            }
            catch (e) { }

            function DeleteTokenSuccess(result) {
                removeFingerprintSet();
                return result;
            }

            function DeleteTokenError(message) {
                onError("DeleteTokenError", message);
            }
        }

        var _onScanError;

        function onScanErrorCallback(error) {
            if (_onScanError) {
                _onScanError(error);
            }
        }

        function randomClientSecret(len) {
            var result = '';
            var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            var charactersLength = characters.length;

            for (var i = 0; i < len; i++) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }

            return result;
        }

        function showSetFingerprint(config, successCallback, errorCallback, onScanError) {
            _onScanError = onScanError;

            var clientSecret = randomClientSecret(32);

            Fingerprint.show({
                clientId: "FingerprintPluginForApp",
                clientSecret: clientSecret, // Necessary for Android - Use random secret key.
                disableBackup: true,
                title: config.title,
                message: config.message, // Necessary for IOS Touch ID
                description: config.message, // Necessary for Android upgraded to 3.0.0
                cancel: config.cancel, // Necessary for IOS Touch ID
                cancelButtonTitle: config.cancel, //  // Necessary for Android upgraded to 3.0.0
                fingerprint_not_recognized: config.fingerprint_not_recognized,
                fingerprint_success: config.fingerprint_success,
                secure_lock_screen_required: config.secure_lock_screen_required,
                finger_moved_too_fast: config.finger_moved_too_fast,
                too_many_attempts: config.too_many_attempts

            }, _successCallback, _errorCallback);

            function _successCallback() {
                successCallback();
            }

            function _errorCallback(err) {
                if (err && typeof err === "string" && err === "Cancelled") {
                    errorCallback(err, true)
                }
                if (err && typeof err === "string" && err.indexOf("IllegalBlockSizeException: null") >= 0) {
                    return successCallback();
                }

                return errorCallback(err, false);
            }
        }

        function fingerprintScanCancel(successCallback, errorCallback) {
            Fingerprint.scanCancel(successCallback, errorCallback);
        }

        return {
            DeviceSupportErrorEnum: window.deviceSupportErrorEnum,
            IsDeviceSupportFingerprint: isDeviceSupportFingerprint,
            GetToken: getToken,
            SetToken: setToken,
            DeleteToken: deleteToken,
            ShowSetFingerprint: showSetFingerprint,
            IsFingerprintSet: isFingerprintSet,
            FingerprintScanCancel: fingerprintScanCancel,
            onScanError: onScanErrorCallback,
            RetrieveFingerprintSupport: retrieveFingerprintSupport,
            Init: init
        }
    };

    // FingerprintTools must be exposed on the global window for cordova to call window.FingerprintTools.onScanError
    var module = window.FingerprintTools = new FingerprintToolsClass();
    return module;
}));