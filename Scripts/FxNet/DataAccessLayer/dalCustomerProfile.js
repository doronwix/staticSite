define(
    'dataaccess/dalCustomerProfile',
    [
        "require",
        'generalmanagers/ErrorManager',
        'handlers/general',
        'JSONHelper'
    ],
    function DalCustomerProfileDef(require) {
        var ErrorManager = require('generalmanagers/ErrorManager'),
            JSONHelper = require('JSONHelper'),
            general = require('handlers/general');

        function DalCustomerProfile() {
            function saveStartUpPage(clientProfileModel, onLoadComplete) {
                if (!isValidModel(clientProfileModel)) {
                    return;
                }

                var ajaxer = new TAjaxer(),
                    params = JSON.stringify(clientProfileModel);

                ajaxer.post(
                    "TDALCustomerProfile/SaveStartUpPage",
                    "api/clientprofile/SaveStartUpPage",
                    params,
                    onLoadComplete,
                    function (error) {
                        ErrorManager.onError("TDALCustomerProfile/SaveStartUpPage", error.message, eErrorSeverity.medium);
                    }
                );
            }

            function saveProfile(clientProfileModel, onLoadComplete) {
                if (!isValidModel(clientProfileModel)) {
                    return;
                }

                var ajaxer = new TAjaxer(),
                    params = JSON.stringify(clientProfileModel);


                ajaxer.post(
                    "TDALCustomerProfile/SaveProfile",
                    "api/clientprofile/SaveProfile",
                    params,
                    onLoadComplete,
                    function (error) {
                        ErrorManager.onError("TDALCustomerProfile/SaveProfile", error.message, eErrorSeverity.medium);
                    },
                    1,
                    2
                );
            }

            function saveSentimentsToProfileWebMobile(clientProfileModel, onLoadComplete) {
                if (!isValidModel(clientProfileModel)) {
                    return;
                }

                var ajaxer = new TAjaxer(),
                    params = JSON.stringify(clientProfileModel);

                ajaxer.post(
                    "TDALCustomerProfile/SaveProfileWebMobile",
                    "api/clientprofile/SaveSentimentsToProfileWebMobile",
                    params,
                    onLoadComplete,
                    function (error) {
                        ErrorManager.onError("TDALCustomerProfile/SaveSentimentsToProfileWebMobile", error.message, eErrorSeverity.medium);
                    }
                );
            }

            function saveProfileInstrument(clientProfileModel, onLoadComplete) {
                if (!isValidModel(clientProfileModel)) {
                    return;
                }

                var ajaxer = new TAjaxer(),
                    params = JSON.stringify(clientProfileModel);

                ajaxer.post(
                    "TDALCustomerProfile/SaveProfile",
                    "api/clientprofile/SaveProfileInstrument",
                    params,
                    onLoadComplete,
                    function (error) {
                        ErrorManager.onError("TDALCustomerProfile/SaveProfileInstrument", error.message, eErrorSeverity.medium);
                    }
                );
            }

            function saveClientScreen(clientProfileModel) {
                if (!isValidModel(clientProfileModel)) {
                    return;
                }

                var ajaxer = new TAjaxer(),
                    params = JSON.stringify(clientProfileModel);

                var method = "TDALCustomerProfile/saveClientScreen",
                    url = "api/clientprofile/UpdateScreen";

                return ajaxer.promises
                    .post(method, url, params, null, null, 1, 2)
                    .then(function (responseText) {
                        checkAndLogServerError(method, params, responseText);
                        return JSONHelper.STR2JSON(method + "/onLoadComplete", responseText);
                    })
                    .fail(function (error) {
                        ErrorManager.onError(method, "", eErrorSeverity.medium);

                        throw error;
                    });
            }

            function checkAndLogServerError(method, params, serverResponse) {
                if (serverResponse.indexOf("ServerError") > -1) {
                    ErrorManager.onWarning(method, "Server Error; Params: " + params);
                }
            }

            function isValidModel(clientProfileModel) {
                return !general.isEmptyValue(clientProfileModel) && !isEmptyObject(clientProfileModel);
            }

            function isEmptyObject(object) {
                if (general.isNullOrUndefined(object)) {
                    return true;
                }

                if (!general.isObjectType(object)) {
                    return false;
                }

                return general.equals(object, {})
            }

            return {
                SaveStartUpPage: saveStartUpPage,
                SaveProfile: saveProfile,
                SaveProfileInstrument: saveProfileInstrument,
                SaveClientScreen: saveClientScreen,
                SaveSentimentsToProfileWebMobile: saveSentimentsToProfileWebMobile
            };
        }

        return new DalCustomerProfile();
    }
);
